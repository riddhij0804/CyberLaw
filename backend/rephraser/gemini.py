import os
import time
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

def gemini_rephrase(original_text, count=1):
    """
    Rephrases the input offensive text using Gemini API and returns `count` options.
    """
    try:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

        model = "gemini-2.5-flash-lite-preview-06-17"
        prompt_text = f"""
Rephrase the given abusive or aggressive offensive content in a more neutral and respectful manner without changing the context or the meaning. 
Detect the language of the given content properly. 
If the given content is in Hinglish, rephrase it in Hinglish only. 
If in English, rephrase in English only. 
If the content is in Devanagari script, rephrase it in Devanagari script only. 
Do not change the meaning of the content.

Give exactly {count} rephrased options for:
"{original_text}"
"""

        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt_text)],
            )
        ]

        config = types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=0),
            response_mime_type="text/plain",
            temperature=0.7,
            top_p=0.8,
            top_k=40,
        )

        full_response = ""
        start_time = time.perf_counter()

        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=config,
        ):
            full_response += chunk.text

        end_time = time.perf_counter()
        response_time = end_time - start_time

        # Split by lines and filter out empty ones
        responses = [line.strip("-• ") for line in full_response.split("\n") if line.strip()]
        return responses[:count]

    except Exception as e:
        print(f"Gemini API error: {e}")
        return [f"Gemini Error: {str(e)}"]
