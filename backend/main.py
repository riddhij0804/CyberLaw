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
import json
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
    "model2": Path(__file__).parent / "model" / "saved_models" / "minilm",
}

# Load IPC mapping JSON
ipc_mapping_path = Path(__file__).parent / "ipc_mapping.json"
try:
    with open(ipc_mapping_path, 'r', encoding='utf-8') as f:
        IPC_MAPPING = json.load(f)
    print(f"✅ Loaded IPC mapping with {len(IPC_MAPPING)} sections")
except FileNotFoundError:
    print("❌ IPC mapping file not found. Place ipc_mapping.json in backend directory.")
    IPC_MAPPING = {}
except Exception as e:
    print(f"❌ Error loading IPC mapping: {e}")
    IPC_MAPPING = {}

# Load both tokenizers and models once on startup
tokenizers = {}
models = {}

for key, path in model_paths.items():
    try:
        tokenizers[key] = AutoTokenizer.from_pretrained(path, local_files_only=True)
        models[key] = AutoModelForSequenceClassification.from_pretrained(path, local_files_only=True).to(device)
        print(f"✅ Loaded {key} from {path}")
    except Exception as e:
        print(f"❌ Failed to load {key}: {e}")

# Use label_map from one model, assuming both have same labels
label_map = {0: "NAG", 1: "CAG", 2: "OAG"}

class TextInput(BaseModel):
    text: str
    more: bool = False

def detect_ipc_violations(text: str):
    """
    Detect potential IPC violations in the given text
    Returns list of applicable IPC sections with matched keywords
    """
    if not IPC_MAPPING:
        return []
    
    text_lower = text.lower()
    violations = []
    
    for section, keywords in IPC_MAPPING.items():
        matched_keywords = []
        for keyword in keywords:
            if keyword.lower() in text_lower:
                matched_keywords.append(keyword)
        
        if matched_keywords:
            violations.append({
                "section": section,
                "matched_keywords": matched_keywords,
                "description": get_ipc_description(section)
            })
    
    return violations

def get_ipc_description(section: str):
    """Get description for IPC sections"""
    descriptions = {
        "Section 375": "Rape - Imprisonment for life or up to 20 years + fine",
        "Section 376": "Punishment for rape - Rigorous imprisonment for 20 years to life + fine", 
        "Section 376D": "Gang rape - Rigorous imprisonment for 20 years to life + fine",
        "Section 354": "Assault/Criminal force on woman - Imprisonment up to 2 years + fine",
        "Section 354A": "Sexual harassment - Imprisonment up to 3 years + fine",
        "Section 509": "Word/gesture intended to insult modesty of woman - Imprisonment up to 3 years + fine",
        "Section 504": "Intentional insult with intent to provoke breach of peace - Imprisonment up to 2 years + fine",
        "Section 506": "Punishment for criminal intimidation - Imprisonment up to 7 years + fine"
    }
    return descriptions.get(section, "Legal action may be taken under this section")

def tokenize_text(text: str, tokenizer):
    dataset = Dataset.from_dict({"text": [text]})
    return dataset.map(lambda x: tokenizer(x["text"], truncation=True, padding="max_length", max_length=512), batched=True)

@app.post("/analyze")
def analyze_text(data: TextInput):
    all_probs = []

    # Run inference on both models and collect probs
    for key in model_paths:
        if key not in models or key not in tokenizers:
            continue
            
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

    if not all_probs:
        return {"error": "No models available for prediction"}

    # Average probabilities (soft voting ensemble)
    avg_probs = np.mean(all_probs, axis=0)
    pred_id = int(np.argmax(avg_probs))
    label = label_map[pred_id]

    # Base response structure
    response = {
        "label": label,
        "confidence": float(np.max(avg_probs)),
        "groq": [],
        "gemini": [],
        "ipc_violations": []
    }

    # Check for IPC violations if OAG detected
    if label == "OAG":
        violations = detect_ipc_violations(data.text)
        response["ipc_violations"] = violations
        
        if violations:
            print(f"⚖️ IPC Violations detected: {[v['section'] for v in violations]}")

    # If classified as CAG or OAG, call rephrasers
    if label in ["CAG", "OAG"]:
        try:
            count = 2 if data.more else 1
            groq_versions = groq_rephrase(data.text, count=count)
            gemini_versions = gemini_rephrase(data.text, count=count)
            response["groq"] = groq_versions
            response["gemini"] = gemini_versions
        except Exception as e:
            print(f"❌ Error in rephrasing: {e}")
            response["groq"] = []
            response["gemini"] = []

    return response

@app.get("/")
def read_root():
    return {
        "message": "CyberLaw Backend API", 
        "status": "running",
        "models_loaded": len(models),
        "ipc_sections": len(IPC_MAPPING)
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "models": list(models.keys()),
        "device": str(device),
        "ipc_mapping_loaded": len(IPC_MAPPING) > 0
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting CyberLaw Backend Server...")
    print("📍 Server will be running on: http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)