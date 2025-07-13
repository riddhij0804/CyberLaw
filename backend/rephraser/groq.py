import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def groq_rephrase(text, count=1):
    prompt = (
        "You are an expert at converting aggressive or offensive language into polite, respectful alternatives. "
        "If the content is in Hinglish, rephrase in Hinglish only strictly. "
        "If the content is in English, rephrase in English only strictly. "
        "If the content is in Devanagari script, rephrase in Devanagari only strictly. "
        "Do not change the meaning. Provide exactly {} polite rephrased options."
        "Dont write the line like here is the polite version and all direct give the response."
    ).format(count)

    try:
        res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"Rephrase: {text}"}
            ],
            temperature=0.4,
            max_tokens=500
        )
        return res.choices[0].message.content.strip().split("\n")[:count]
    except Exception as e:
        return [f"Groq Error: {str(e)}"]
