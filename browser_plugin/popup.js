const API_URL = "http://localhost:8000/analyze";

document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById('analyze');
  const inputEl = document.getElementById('input');
  const resultDiv = document.getElementById('result');

  analyzeBtn.addEventListener('click', async () => {
    const text = inputEl.value.trim();
    resultDiv.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 32px; margin-bottom: 10px;">🔄</div>
        <div>Analyzing content...</div>
      </div>
    `;

    if (!text) {
      resultDiv.innerHTML = `
        <div style="color: #ff9800; text-align: center; padding: 20px;">
          <div style="font-size: 32px; margin-bottom: 10px;">⚠️</div>
          <div>Please enter some text to analyze</div>
        </div>
      `;
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, more: true })
      });

      const data = await res.json();
      const label = data.label;

      let color = "#2e7d32";
      let icon = "✅";
      let bgColor = "#e8f5e8";
      let message = "Clean Content";
      let description = "No aggressive content detected. Your text appears to be respectful and appropriate.";
      
      if (label === "CAG") {
        color = "#f57c00";
        icon = "⚠️";
        bgColor = "#fff3e0";
        message = "Cyber Aggressive Content";
        description = "This content contains cyber aggressive language that could be offensive to others.";
      } else if (label === "OAG") {
        color = "#d32f2f";
        icon = "🚫";
        bgColor = "#ffebee";
        message = "Offensive Aggressive Content";
        description = "This content contains offensive language that violates community guidelines and may have legal implications.";
      }

      let html = `
        <div style="background: ${bgColor}; border: 2px solid ${color}; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <span style="font-size: 32px; margin-right: 15px;">${icon}</span>
            <div>
              <div style="font-size: 18px; font-weight: bold; color: ${color};">${message}</div>
              <div style="font-size: 13px; color: #666; margin-top: 5px;">${description}</div>
            </div>
          </div>
        </div>
      `;

      // Show IPC violations for OAG
      if (label === "OAG" && data.ipc_violations && data.ipc_violations.length > 0) {
        html += `
          <div style="background: linear-gradient(135deg, #ffebee, #ffcdd2); border: 2px solid #f44336; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <span style="font-size: 24px; margin-right: 10px;">⚖️</span>
              <div style="font-size: 16px; font-weight: bold; color: #d32f2f;">Legal Implications</div>
            </div>
        `;
        
        data.ipc_violations.forEach((violation, index) => {
          html += `
            <div style="background: white; border-radius: 10px; padding: 15px; margin-bottom: 10px; border-left: 4px solid #f44336;">
              <div style="font-weight: bold; color: #d32f2f; margin-bottom: 8px;">${violation.section}</div>
              <div style="color: #333; font-size: 13px; line-height: 1.4; margin-bottom: 8px;">${violation.description}</div>
              <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                ${violation.matched_keywords.map(keyword => 
                  `<span style="background: #f44336; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px;">${keyword}</span>`
                ).join('')}
              </div>
            </div>
          `;
        });
        
        html += `</div>`;
      }

      // Show suggestions if available
      if ((data.groq && data.groq.length > 0) || (data.gemini && data.gemini.length > 0)) {
        html += `
          <div style="background: linear-gradient(135deg, #e8f5e8, #c8e6c9); border: 2px solid #4caf50; border-radius: 15px; padding: 20px;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <span style="font-size: 24px; margin-right: 10px;">💡</span>
              <div style="font-size: 16px; font-weight: bold; color: #2e7d32;">Alternative Suggestions</div>
            </div>
        `;

        const allSuggestions = [...(data.groq || []), ...(data.gemini || [])];
        allSuggestions.forEach((suggestion, index) => {
          html += `
            <div style="background: white; border-radius: 10px; padding: 15px; margin-bottom: 10px; border-left: 4px solid #4caf50;">
              <div style="color: #333; line-height: 1.5; font-style: italic; margin-bottom: 10px;">"${suggestion}"</div>
              <button onclick="copyToClipboard('${suggestion.replace(/'/g, "\\'")}', ${index})" style="background: #2196f3; border: none; color: white; padding: 6px 12px; border-radius: 15px; cursor: pointer; font-size: 11px;">
                📋 Copy
              </button>
            </div>
          `;
        });
        
        html += `</div>`;
      }

      resultDiv.innerHTML = html;

    } catch (err) {
      console.error(err);
      resultDiv.innerHTML = `
        <div style="color: #f44336; text-align: center; padding: 20px;">
          <div style="font-size: 32px; margin-bottom: 10px;">❌</div>
          <div>Error connecting to analysis service</div>
          <div style="font-size: 12px; margin-top: 10px; color: #666;">Make sure the backend server is running</div>
        </div>
      `;
    }
  });

  // Enter key support
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      analyzeBtn.click();
    }
  });
});

// Global function to copy suggestions
window.copyToClipboard = function(text, index) {
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '✅ Copied!';
    btn.style.background = '#4caf50';
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '#2196f3';
    }, 2000);
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '✅ Copied!';
    btn.style.background = '#4caf50';
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '#2196f3';
    }, 2000);
  });
};