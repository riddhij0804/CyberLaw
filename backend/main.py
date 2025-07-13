from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification, DataCollatorWithPadding, Trainer
from scipy.special import softmax
from datasets import Dataset
import torch
import numpy as np
from rephraser.gemini import gemini_rephrase
from rephraser.groq import groq_rephrase
from dotenv import load_dotenv
import os
from pathlib import Path

# Load env variables
load_dotenv()

# Initialize app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Model directories - adjust paths as needed
model_paths = {
    "model1": Path(__file__).parent / "model" / "saved_models" / "indicbert",
    "model2": Path(__file__).parent / "model" / "saved_models" / "minilm",  # example second model path
}

# Load both tokenizers and models once on startup
tokenizers = {}
models = {}

for key, path in model_paths.items():
    tokenizers[key] = AutoTokenizer.from_pretrained(path, local_files_only=True)
    models[key] = AutoModelForSequenceClassification.from_pretrained(path, local_files_only=True).to(device)

# Use label_map from one model, assuming both have same labels
label_map = {0: "NAG", 1: "CAG", 2: "OAG"}

class TextInput(BaseModel):
    text: str
    more: bool = False

def tokenize_text(text: str, tokenizer):
    dataset = Dataset.from_dict({"text": [text]})
    return dataset.map(lambda x: tokenizer(x["text"], truncation=True, padding="max_length", max_length=512), batched=True)

@app.post("/analyze")
def analyze_text(data: TextInput):
    all_probs = []

    # Run inference on both models and collect probs
    for key in model_paths:
        tokenizer = tokenizers[key]
        model = models[key]

        tokenized_input = tokenize_text(data.text, tokenizer)

        trainer = Trainer(
            model=model,
            tokenizer=tokenizer,
            data_collator=DataCollatorWithPadding(tokenizer),
        )

        outputs = trainer.predict(tokenized_input)
        probs = softmax(outputs.predictions, axis=1)
        all_probs.append(probs)

    # Average probabilities (soft voting ensemble)
    avg_probs = np.mean(all_probs, axis=0)
    pred_id = int(np.argmax(avg_probs))
    label = label_map[pred_id]

    # If classified as CAG or OAG, call rephrasers
    if label in ["CAG", "OAG"]:
        count = 2 if data.more else 1
        groq_versions = groq_rephrase(data.text, count=count)
        gemini_versions = gemini_rephrase(data.text, count=count)
        return {
            "label": label,
            "groq": groq_versions,
            "gemini": gemini_versions
        }

    return {"label": label, "groq": [], "gemini": []}


