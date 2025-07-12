from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from rephraser.gemini import gemini_rephrase
from rephraser.groq import groq_rephrase
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Enable CORS (so frontend can call the backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific frontend origin in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model path
model_path = Path(__file__).parent / "model" / "my_model" / "my_model_new"

# Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
model = AutoModelForSequenceClassification.from_pretrained(model_path, local_files_only=True)

# Label mapping
label_map = {0: "NAG", 1: "CAG", 2: "OAG"}

# Input schema
class TextInput(BaseModel):
    text: str
    more: bool = False

# POST endpoint (CHANGED from /check to /analyze)
@app.post("/analyze")
def analyze_text(data: TextInput):
    inputs = tokenizer(data.text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    prediction = torch.argmax(outputs.logits, dim=1).item()
    label = label_map[prediction]

    if label in ["CAG", "OAG"]:
        groq_versions = groq_rephrase(data.text, count=2 if data.more else 1)
        gemini_versions = gemini_rephrase(data.text, count=2 if data.more else 1)
        return {
            "label": label,
            "groq": groq_versions,
            "gemini": gemini_versions
        }

    return {"label": label, "groq": [], "gemini": []}
