const API_URL = "http://localhost:8000/analyze"; // Your FastAPI server endpoint

document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById('analyze');
  const inputEl = document.getElementById('input');
  const resultDiv = document.getElementById('result');

  analyzeBtn.addEventListener('click', async () => {
    const text = inputEl.value.trim();
    resultDiv.innerHTML = "⏳ Analyzing...";

    if (!text) {
      resultDiv.innerHTML = "<span style='color:#ff9800;'>⚠ Please enter some text.</span>";
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, more: false })
      });

      const data = await res.json();
      const label = data.label;

      let color = "#2e7d32";
      let icon = "✅";
      let message = "No Aggressive Content (NAG)";
      if (label === "CAG") {
        color = "#ff9800";
        icon = "⚠";
        message = "Contains Aggressive Content (CAG)";
      } else if (label === "OAG") {
        color = "#d32f2f";
        icon = "🚫";
        message = "Offensive Aggressive Content (OAG)";
      }

      let html = `<div style="color:${color};">${icon} ${message}</div>`;

      if (data.gemini?.length || data.groq?.length) {
        if (data.gemini?.length) {
          html += `<div class="rephrased-block"><strong>Gemini Rephrased:</strong><br>${data.gemini.join("<br><br>")}</div>`;
        }
        if (data.groq?.length) {
          html += `<div class="rephrased-block"><strong>Groq Rephrased:</strong><br>${data.groq.join("<br><br>")}</div>`;
        }
      }

      resultDiv.innerHTML = html;

    } catch (err) {
      console.error(err);
      resultDiv.innerHTML = "<span style='color:red;'>❌ Error contacting backend.</span>";
    }

  });
  
});