// --- Create floating button ---
const floatingBtn = document.createElement("button");
floatingBtn.textContent = "🛡 Cyberlaw Checker";
Object.assign(floatingBtn.style, {
  position: "fixed",
  bottom: "20px",
  right: "20px",
  backgroundColor: "#1565c0",
  color: "#fff",
  border: "none",
  borderRadius: "24px",
  padding: "12px 18px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  zIndex: "2147483647",
  boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
});
document.body.appendChild(floatingBtn);

// --- Create automatic warning and rephrasing overlay ---
const warningOverlay = document.createElement("div");
Object.assign(warningOverlay.style, {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  background: "#fff",
  color: "#333",
  padding: "20px",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: "500",
  zIndex: "2147483647",
  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  maxWidth: "500px",
  minWidth: "400px",
  display: "none",
  flexDirection: "column",
  userSelect: "none",
  pointerEvents: "auto",
  border: "2px solid #ff5722",
});
warningOverlay.innerHTML = `
  <div style="display: flex; align-items: center; margin-bottom: 15px; color: #d32f2f;">
    <span style="font-size: 24px; margin-right: 10px;">⚠️</span>
    <strong style="font-size: 16px;">Aggressive Content Detected</strong>
  </div>
  <div id="detectionInfo" style="margin-bottom: 15px; padding: 10px; background: #ffebee; border-radius: 8px; font-weight: 600;"></div>
  <div style="margin-bottom: 15px;">
    <strong>Original Text:</strong>
    <div id="originalText" style="margin-top: 8px; padding: 10px; background: #f5f5f5; border-radius: 8px; border-left: 4px solid #ff5722;"></div>
  </div>
  <div id="rephrasedContainer" style="margin-bottom: 20px; display: none;">
    <strong>Suggested Rephrases:</strong>
    <div id="rephrasedContent" style="margin-top: 10px;"></div>
  </div>
  <div id="loadingText" style="margin-bottom: 15px; text-align: center; color: #666;">
    🔄 Generating rephrased versions...
  </div>
  <div style="display: flex; justify-content: flex-end; gap: 10px;">
    <button id="useOriginalBtn" style="background:#666; border:none; color:#fff; padding:8px 16px; border-radius:6px; cursor:pointer;">Keep Original</button>
    <button id="closeOverlayBtn" style="background:#f44336; border:none; color:#fff; padding:8px 16px; border-radius:6px; cursor:pointer;">Close</button>
  </div>
`;
document.body.appendChild(warningOverlay);

// --- Manual check popup ---
const manualPopup = document.createElement("div");
Object.assign(manualPopup.style, {
  position: "fixed",
  bottom: "110px",
  right: "20px",
  width: "320px",
  background: "#fff",
  color: "#333",
  padding: "15px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  fontSize: "14px",
  zIndex: "2147483647",
  display: "none",
  flexDirection: "column",
});
manualPopup.innerHTML = `
  <label for="manualInput" style="font-weight:600; margin-bottom:8px;">Check your text:</label>
  <textarea id="manualInput" rows="4" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ccc; resize:none;" placeholder="Type or paste text here..."></textarea>
  <div id="manualWarning" style="margin-top:10px; font-weight:700; color:#d32f2f; display:none;"></div>
`;
document.body.appendChild(manualPopup);

const manualInput = manualPopup.querySelector("#manualInput");
const manualWarning = manualPopup.querySelector("#manualWarning");

// Get overlay elements
const detectionInfo = warningOverlay.querySelector("#detectionInfo");
const originalText = warningOverlay.querySelector("#originalText");
const rephrasedContainer = warningOverlay.querySelector("#rephrasedContainer");
const rephrasedContent = warningOverlay.querySelector("#rephrasedContent");
const loadingText = warningOverlay.querySelector("#loadingText");
const useOriginalBtn = warningOverlay.querySelector("#useOriginalBtn");
const closeOverlayBtn = warningOverlay.querySelector("#closeOverlayBtn");

let currentElement = null;
let currentOriginalText = "";
let warningDismissedFor = new WeakSet();

// --- Show/Hide warning overlay with rephrasing ---
async function showWarningWithRephrase(el, prediction, text) {
  if (warningDismissedFor.has(el)) return;
  
  currentElement = el;
  currentOriginalText = text;
  
  // Set up the overlay
  detectionInfo.textContent = `Classification: ${prediction} (${prediction === 'CAG' ? 'Cyber Aggressive' : 'Offensive Aggressive'})`;
  originalText.textContent = text;
  rephrasedContainer.style.display = "none";
  loadingText.style.display = "block";
  warningOverlay.style.display = "flex";
  
  // Get rephrased versions
  try {
    const rephrasedVersions = await getRephrasedText(text);
    
    if (rephrasedVersions.groq.length > 0 || rephrasedVersions.gemini.length > 0) {
      displayRephrasedVersions(rephrasedVersions);
      loadingText.style.display = "none";
      rephrasedContainer.style.display = "block";
    } else {
      loadingText.textContent = "❌ Could not generate rephrased versions";
      loadingText.style.color = "#d32f2f";
    }
  } catch (error) {
    console.error("Error getting rephrased text:", error);
    loadingText.textContent = "❌ Error generating rephrased versions";
    loadingText.style.color = "#d32f2f";
  }
}

function displayRephrasedVersions(versions) {
  let html = "";
  
  if (versions.gemini.length > 0) {
    html += `<div style="margin-bottom: 15px;">
      <strong style="color: #4285f4;">🤖 Gemini Suggestions:</strong>`;
    versions.gemini.forEach((text, index) => {
      html += `<div style="margin-top: 8px; padding: 10px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #4285f4;">
        <div style="margin-bottom: 8px;">${text}</div>
        <button onclick="replaceText('${text.replace(/'/g, "\\'")}')" style="background:#4285f4; border:none; color:#fff; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px;">Use This</button>
      </div>`;
    });
    html += `</div>`;
  }
  
  if (versions.groq.length > 0) {
    html += `<div style="margin-bottom: 15px;">
      <strong style="color: #ff6b35;">🚀 Groq Suggestions:</strong>`;
    versions.groq.forEach((text, index) => {
      html += `<div style="margin-top: 8px; padding: 10px; background: #fff3e0; border-radius: 8px; border-left: 4px solid #ff6b35;">
        <div style="margin-bottom: 8px;">${text}</div>
        <button onclick="replaceText('${text.replace(/'/g, "\\'")}')" style="background:#ff6b35; border:none; color:#fff; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px;">Use This</button>
      </div>`;
    });
    html += `</div>`;
  }
  
  rephrasedContent.innerHTML = html;
}

// Global function to replace text
window.replaceText = function(newText) {
  if (currentElement) {
    if (currentElement.value !== undefined) {
      currentElement.value = newText;
    } else {
      currentElement.innerText = newText;
    }
    
    // Trigger input event to notify any listeners
    currentElement.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Add to dismissed set and hide overlay
    warningDismissedFor.add(currentElement);
    hideWarning();
  }
};

function hideWarning() {
  warningOverlay.style.display = "none";
  currentElement = null;
  currentOriginalText = "";
}

// --- Call ML model backend ---
async function checkWithModel(text) {
  try {
    const response = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    return data.label;
  } catch (e) {
    console.error("ML model check failed:", e);
    return null;
  }
}

// --- Get rephrased text ---
async function getRephrasedText(text) {
  try {
    const response = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, more: true }),
    });
    const data = await response.json();
    return {
      groq: data.groq || [],
      gemini: data.gemini || []
    };
  } catch (e) {
    console.error("Rephrasing failed:", e);
    return { groq: [], gemini: [] };
  }
}

// --- Monitor and attach listeners ---
function attachListener(el) {
  if (el.dataset.cyberlawAttached === "true") return;
  
  let timeoutId;
  
  el.addEventListener("input", async () => {
    if (warningDismissedFor.has(el)) {
      warningDismissedFor.delete(el);
    }
    
    // Debounce API calls
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      const val = el.value || el.innerText || "";
      if (val.trim().length < 10) return; // Only check longer texts
      
      const prediction = await checkWithModel(val);
      if (prediction === "OAG" || prediction === "CAG") {
        showWarningWithRephrase(el, prediction, val);
      } else {
        hideWarning();
      }
    }, 1000); // Wait 1 second after user stops typing
  });
  
  el.dataset.cyberlawAttached = "true";
}

function monitorInputs() {
  const inputs = Array.from(
    document.querySelectorAll("input[type='text'], textarea, [contenteditable='true']")
  );
  inputs.forEach(attachListener);
}

// --- Button event listeners ---
useOriginalBtn.addEventListener("click", () => {
  if (currentElement) {
    warningDismissedFor.add(currentElement);
    hideWarning();
  }
});

closeOverlayBtn.addEventListener("click", () => {
  hideWarning();
});

// --- Floating button toggle manual popup ---
floatingBtn.addEventListener("click", () => {
  manualPopup.style.display = manualPopup.style.display === "flex" ? "none" : "flex";
});

// --- Manual check logic ---
manualInput.addEventListener("input", async () => {
  const val = manualInput.value;
  const prediction = await checkWithModel(val);
  if (prediction === "OAG" || prediction === "CAG") {
    manualWarning.style.display = "block";
    manualWarning.textContent = `⚠ Detected: ${prediction}`;
  } else {
    manualWarning.style.display = "none";
    manualWarning.textContent = "";
  }
});

// --- Dragging the floating button ---
floatingBtn.style.position = "fixed";
floatingBtn.style.cursor = "move";

let isDragging = false;
let offsetX, offsetY;

floatingBtn.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - floatingBtn.getBoundingClientRect().left;
  offsetY = e.clientY - floatingBtn.getBoundingClientRect().top;
  document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  let left = e.clientX - offsetX;
  let top = e.clientY - offsetY;
  const maxLeft = window.innerWidth - floatingBtn.offsetWidth;
  const maxTop = window.innerHeight - floatingBtn.offsetHeight;
  left = Math.min(Math.max(0, left), maxLeft);
  top = Math.min(Math.max(0, top), maxTop);
  floatingBtn.style.left = left + "px";
  floatingBtn.style.top = top + "px";
  floatingBtn.style.right = "auto";
  floatingBtn.style.bottom = "auto";
});

document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    document.body.style.userSelect = "";
  }
});

// --- Init ---
monitorInputs();
const observer = new MutationObserver(() => monitorInputs());
observer.observe(document.body, { childList: true, subtree: true });