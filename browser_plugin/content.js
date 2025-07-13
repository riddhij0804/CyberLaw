// --- Create floating button ---
const floatingBtn = document.createElement("button");
floatingBtn.innerHTML = `
  <img src="${chrome.runtime.getURL('icons/icon16.png')}" style="width: 16px; height: 16px; margin-right: 8px;">
  CyberLaw Checker
`;
Object.assign(floatingBtn.style, {
  position: "fixed",
  bottom: "20px",
  right: "20px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "#fff",
  border: "none",
  borderRadius: "25px",
  padding: "12px 18px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "move",
  zIndex: "2147483647",
  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
  transition: "all 0.3s ease",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  display: "flex",
  alignItems: "center",
});

floatingBtn.addEventListener("mouseenter", () => {
  floatingBtn.style.transform = "translateY(-2px)";
  floatingBtn.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
});

floatingBtn.addEventListener("mouseleave", () => {
  floatingBtn.style.transform = "translateY(0)";
  floatingBtn.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
});
document.body.appendChild(floatingBtn);

// --- Create initial warning overlay (simple prompt) ---
const initialWarning = document.createElement("div");
Object.assign(initialWarning.style, {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  background: "white",
  color: "#333",
  padding: "0",
  borderRadius: "20px",
  fontSize: "16px",
  fontWeight: "500",
  zIndex: "2147483648",
  boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
  maxWidth: "400px",
  display: "none",
  flexDirection: "column",
  alignItems: "center",
  userSelect: "none",
  border: "none",
  backdropFilter: "blur(5px)",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  overflow: "hidden",
});
initialWarning.innerHTML = `
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 20px 20px 0 0; width: 100%; box-sizing: border-box;">
    <img src="${chrome.runtime.getURL('icons/icon48.png')}" style="width: 48px; height: 48px; margin-bottom: 15px;">
    <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">⚖️ CyberLaw Alert</div>
    <div style="font-size: 12px; opacity: 0.9;">Content analysis detected issues</div>
  </div>
  <div style="padding: 25px; text-align: center;">
    <div id="alertType" style="margin-bottom: 20px; color: #666; line-height: 1.5;"></div>
    <div style="display: flex; gap: 15px; justify-content: center;">
      <button id="learnMoreBtn" style="background: linear-gradient(135deg, #667eea, #764ba2); border: none; color: #fff; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-size: 14px; font-weight: bold; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); transition: all 0.3s ease;">🔍 Learn More</button>
      <button id="dismissBtn" style="background: #666; border: none; color: #fff; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-size: 14px; transition: all 0.3s ease;">❌ Dismiss</button>
    </div>
  </div>
`;
document.body.appendChild(initialWarning);

// --- Create detailed information overlay ---
const detailOverlay = document.createElement("div");
Object.assign(detailOverlay.style, {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  background: "white",
  color: "#333",
  padding: "0px",
  borderRadius: "20px",
  fontSize: "14px",
  fontWeight: "500",
  zIndex: "2147483649",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  maxWidth: "700px",
  maxHeight: "80vh",
  width: "90vw",
  display: "none",
  flexDirection: "column",
  userSelect: "none",
  border: "none",
  overflow: "hidden",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
});

detailOverlay.innerHTML = `
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; position: relative;">
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center;">
        <img src="${chrome.runtime.getURL('icons/icon48.png')}" style="width: 32px; height: 32px; margin-right: 15px;">
        <div>
          <div style="font-size: 20px; font-weight: bold;">⚖️ Content Analysis</div>
          <div id="detailClassification" style="font-size: 14px; opacity: 0.9;"></div>
        </div>
      </div>
      <button id="closeDetailBtn" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">×</button>
    </div>
    <div id="moveHandle" style="position: absolute; top: 5px; left: 50%; transform: translateX(-50%); width: 40px; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; cursor: move;"></div>
  </div>
  
  <div style="padding: 25px; overflow-y: auto; max-height: 60vh;">
    <!-- Original Text Section -->
    <div style="margin-bottom: 25px;">
      <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #333; display: flex; align-items: center;">
        <span style="margin-right: 8px;">📝</span> Original Text
      </div>
      <div id="detailOriginalText" style="padding: 15px; background: #f5f5f5; border-radius: 10px; border-left: 4px solid #667eea; font-style: italic; line-height: 1.5;"></div>
    </div>

    <!-- IPC Violations Section -->
    <div id="ipcSection" style="margin-bottom: 25px; display: none;">
      <div style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #d32f2f; display: flex; align-items: center;">
        <span style="margin-right: 8px;">⚖️</span> Legal Implications
      </div>
      <div id="ipcContent"></div>
    </div>

    <!-- Rephrased Suggestions Section -->
    <div id="suggestionsSection" style="margin-bottom: 20px; display: none;">
      <div style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #333; display: flex; align-items: center;">
        <span style="margin-right: 8px;">💡</span> Alternative Suggestions
      </div>
      <div id="suggestionsContent"></div>
    </div>

    <!-- Loading Section -->
    <div id="detailLoading" style="text-align: center; margin: 20px 0; color: #666;">
      <div style="font-size: 32px; margin-bottom: 10px;">🔄</div>
      <div>Analyzing content and generating suggestions...</div>
    </div>
  </div>
`;

document.body.appendChild(detailOverlay);

// --- Manual check popup ---
const manualPopup = document.createElement("div");
Object.assign(manualPopup.style, {
  position: "fixed",
  bottom: "110px",
  right: "20px",
  width: "350px",
  background: "white",
  color: "#333",
  padding: "0",
  borderRadius: "15px",
  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
  fontSize: "14px",
  zIndex: "2147483647",
  display: "none",
  flexDirection: "column",
  border: "none",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  overflow: "hidden",
});
manualPopup.innerHTML = `
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; display: flex; align-items: center;">
    <img src="${chrome.runtime.getURL('icons/icon16.png')}" style="width: 20px; height: 20px; margin-right: 10px;">
    <label for="manualInput" style="font-weight: bold; font-size: 16px;">🔍 Text Analysis</label>
  </div>
  <div style="padding: 20px;">
    <textarea id="manualInput" rows="4" style="width: 100%; padding: 12px; border-radius: 10px; border: 2px solid #e0e0e0; resize: none; font-family: inherit; transition: border-color 0.3s; box-sizing: border-box;" placeholder="Type or paste text here to check for aggressive content..."></textarea>
    <div id="manualWarning" style="margin-top: 15px; padding: 10px; border-radius: 8px; font-weight: bold; display: none;"></div>
  </div>
`;
document.body.appendChild(manualPopup);

const manualInput = manualPopup.querySelector("#manualInput");
const manualWarning = manualPopup.querySelector("#manualWarning");

// Get overlay elements
const alertType = initialWarning.querySelector("#alertType");
const learnMoreBtn = initialWarning.querySelector("#learnMoreBtn");
const dismissBtn = initialWarning.querySelector("#dismissBtn");
const closeDetailBtn = detailOverlay.querySelector("#closeDetailBtn");
const moveHandle = detailOverlay.querySelector("#moveHandle");
const detailClassification = detailOverlay.querySelector("#detailClassification");
const detailOriginalText = detailOverlay.querySelector("#detailOriginalText");
const ipcSection = detailOverlay.querySelector("#ipcSection");
const ipcContent = detailOverlay.querySelector("#ipcContent");
const suggestionsSection = detailOverlay.querySelector("#suggestionsSection");
const suggestionsContent = detailOverlay.querySelector("#suggestionsContent");
const detailLoading = detailOverlay.querySelector("#detailLoading");

let currentElement = null;
let currentOriginalText = "";
let currentPrediction = "";
let currentData = null;
let warningDismissedFor = new WeakSet();

// Website approval system
const approvedSites = new Set([
  'twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'linkedin.com',
  'reddit.com', 'youtube.com', 'gmail.com', 'outlook.com', 'discord.com',
  'slack.com', 'telegram.org', 'whatsapp.com'
]);

let sitePermissionAsked = false;
let siteApproved = false;

// Create site permission overlay
const permissionOverlay = document.createElement("div");
Object.assign(permissionOverlay.style, {
  position: "fixed",
  top: "0",
  left: "0",
  width: "100vw",
  height: "100vh",
  background: "rgba(0, 0, 0, 0.7)",
  zIndex: "2147483650",
  display: "none",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(5px)",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
});

permissionOverlay.innerHTML = `
  <div style="background: white; border-radius: 20px; padding: 0; max-width: 450px; margin: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px;">
      <img src="${chrome.runtime.getURL('icons/icon48.png')}" style="width: 48px; height: 48px; margin-bottom: 15px;">
      <div style="font-size: 22px; font-weight: bold; margin-bottom: 10px;">🛡️ CyberLaw Content Monitor</div>
      <div style="opacity: 0.9; font-size: 14px;">Detect aggressive content & legal implications</div>
    </div>
    <div style="padding: 30px;">
      <div style="color: #666; margin-bottom: 25px; line-height: 1.5; font-size: 15px;">
        Would you like to enable real-time content monitoring on<br>
        <strong style="color: #667eea;">${window.location.hostname}</strong>?
      </div>
      <div style="background: rgba(102, 126, 234, 0.1); border-radius: 12px; padding: 15px; margin-bottom: 25px; font-size: 13px; color: #666;">
        ✅ Detect aggressive content as you type<br>
        ✅ Get legal implications for offensive content<br>
        ✅ Receive AI-powered rephrasing suggestions
      </div>
      <div style="display: flex; gap: 15px; justify-content: center;">
        <button id="allowPermission" style="background: linear-gradient(135deg, #667eea, #764ba2); border: none; color: white; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-size: 14px; font-weight: bold; min-width: 100px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
          ✅ Enable
        </button>
        <button id="denyPermission" style="background: #666; border: none; color: white; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-size: 14px; min-width: 100px; transition: all 0.3s ease;">
          ❌ Not Now
        </button>
      </div>
      <div style="font-size: 11px; color: #999; margin-top: 15px;">
        You can always enable this later using the floating button
      </div>
    </div>
  </div>
`;

document.body.appendChild(permissionOverlay);

const allowBtn = permissionOverlay.querySelector("#allowPermission");
const denyBtn = permissionOverlay.querySelector("#denyPermission");

allowBtn.addEventListener("click", () => {
  const hostname = window.location.hostname.replace('www.', '');
  approvedSites.add(hostname);
  siteApproved = true;
  permissionOverlay.style.display = "none";
  monitorInputs(); // Start monitoring after approval
});

denyBtn.addEventListener("click", () => {
  siteApproved = false;
  permissionOverlay.style.display = "none";
});

function isApprovedSite() {
  const hostname = window.location.hostname.replace('www.', '');
  
  if (approvedSites.has(hostname)) {
    return true;
  }
  
  if (!sitePermissionAsked) {
    sitePermissionAsked = true;
    permissionOverlay.style.display = "flex";
    return false;
  }
  
  return siteApproved;
}

// --- Show initial warning ---
async function showInitialWarning(el, prediction, text) {
  if (warningDismissedFor.has(el)) return;
  
  currentElement = el;
  currentOriginalText = text;
  currentPrediction = prediction;
  
  const typeText = prediction === 'CAG' ? 
    'Cyber Aggressive content detected in your text' : 
    'Offensive Aggressive content detected in your text';
  
  alertType.textContent = typeText;
  initialWarning.style.display = "flex";
}

// --- Show detailed analysis ---
async function showDetailedAnalysis() {
  initialWarning.style.display = "none";
  detailOverlay.style.display = "flex";
  
  // Set basic info
  detailClassification.textContent = `Classification: ${currentPrediction} (${currentPrediction === 'CAG' ? 'Cyber Aggressive' : 'Offensive Aggressive'})`;
  detailOriginalText.textContent = currentOriginalText;
  
  // Show loading
  detailLoading.style.display = "block";
  ipcSection.style.display = "none";
  suggestionsSection.style.display = "none";
  
  try {
    // Get full analysis
    const response = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: currentOriginalText, more: true }),
    });
    
    currentData = await response.json();
    
    // Hide loading
    detailLoading.style.display = "none";
    
    // Show IPC violations if OAG
    if (currentPrediction === "OAG" && currentData.ipc_violations && currentData.ipc_violations.length > 0) {
      displayIPCViolations(currentData.ipc_violations);
      ipcSection.style.display = "block";
    }
    
    // Show suggestions if available
    if ((currentData.groq && currentData.groq.length > 0) || (currentData.gemini && currentData.gemini.length > 0)) {
      displaySuggestions(currentData);
      suggestionsSection.style.display = "block";
    }
    
  } catch (error) {
    console.error("Error getting detailed analysis:", error);
    detailLoading.innerHTML = `
      <div style="color: #f44336; text-align: center;">
        <div style="font-size: 32px; margin-bottom: 10px;">❌</div>
        <div>Error loading analysis</div>
      </div>
    `;
  }
}

// --- Display IPC violations ---
function displayIPCViolations(violations) {
  let html = "";
  
  violations.forEach((violation, index) => {
    html += `
      <div style="background: white; border: 2px solid #f44336; border-radius: 12px; padding: 20px; margin-bottom: 15px; position: relative; box-shadow: 0 4px 15px rgba(244, 67, 54, 0.1);">
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px;">${index + 1}</div>
          <div style="font-size: 16px; font-weight: bold; color: #d32f2f;">${violation.section}</div>
        </div>
        <div style="color: #333; margin-bottom: 12px; line-height: 1.5;">${violation.description}</div>
        <div style="background: #f5f5f5; padding: 10px; border-radius: 8px; border-left: 4px solid #667eea;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Matched Keywords:</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${violation.matched_keywords.map(keyword => 
              `<span style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">${keyword}</span>`
            ).join('')}
          </div>
        </div>
      </div>
    `;
  });
  
  ipcContent.innerHTML = html;
}

// --- Display suggestions ---
function displaySuggestions(data) {
  let html = "";
  let suggestionCount = 1;
  
  // Combine all suggestions without branding
  const allSuggestions = [...(data.groq || []), ...(data.gemini || [])];
  
  allSuggestions.forEach((suggestion, index) => {
    html += `
      <div style="background: white; border: 2px solid #4caf50; border-radius: 12px; padding: 20px; margin-bottom: 15px; position: relative; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.1);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div style="display: flex; align-items: center;">
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px;">${suggestionCount++}</div>
            <div style="font-size: 14px; font-weight: bold; color: #2e7d32;">Alternative Suggestion</div>
          </div>
          <button onclick="copySuggestion('${suggestion.replace(/'/g, "\\'")}', ${index})" style="background: linear-gradient(135deg, #667eea, #764ba2); border: none; color: white; padding: 6px 12px; border-radius: 15px; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 5px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
            📋 Copy
          </button>
        </div>
        <div style="color: #333; line-height: 1.6; font-style: italic; background: #f5f5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
          "${suggestion}"
        </div>
      </div>
    `;
  });
  
  if (html === "") {
    html = `
      <div style="text-align: center; color: #666; padding: 20px;">
        <div style="font-size: 32px; margin-bottom: 10px;">💭</div>
        <div>No alternative suggestions available</div>
      </div>
    `;
  }
  
  suggestionsContent.innerHTML = html;
}

// Global functions for suggestion actions
window.copySuggestion = function(text, index) {
  navigator.clipboard.writeText(text).then(() => {
    // Show copy feedback
    const btn = event.target;
    const originalText = btn.innerHTML;
    const originalBackground = btn.style.background;
    
    btn.innerHTML = '✅ Copied!';
    btn.style.background = 'linear-gradient(135deg, #4caf50, #45a049)';
    btn.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = originalBackground;
      btn.style.transform = 'scale(1)';
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
    const originalBackground = btn.style.background;
    
    btn.innerHTML = '✅ Copied!';
    btn.style.background = 'linear-gradient(135deg, #4caf50, #45a049)';
    btn.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = originalBackground;
      btn.style.transform = 'scale(1)';
    }, 2000);
  });
};

window.replaceSuggestion = function(text, index) {
  if (currentElement) {
    if (currentElement.value !== undefined) {
      currentElement.value = text;
    } else {
      currentElement.innerText = text;
    }
    
    // Trigger input event
    currentElement.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Add to dismissed set and hide overlays
    warningDismissedFor.add(currentElement);
    hideAllOverlays();
  }
};

function hideAllOverlays() {
  initialWarning.style.display = "none";
  detailOverlay.style.display = "none";
  currentElement = null;
  currentOriginalText = "";
  currentPrediction = "";
  currentData = null;
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

// --- Monitor and attach listeners ---
function attachListener(el) {
  if (el.dataset.cyberlawAttached === "true") return;
  
  let timeoutId;
  
  el.addEventListener("input", async () => {
    if (warningDismissedFor.has(el)) {
      warningDismissedFor.delete(el);
    }
    
    const val = el.value || el.innerText || "";
    if (val.trim().length < 3) return; // Check even shorter text for immediate detection
    
    // Immediate check for aggressive keywords without debounce
    const immediateCheck = checkImmediateKeywords(val);
    if (immediateCheck) {
      showInitialWarning(el, immediateCheck, val);
      return;
    }
    
    // Debounce API calls for full ML analysis
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      const prediction = await checkWithModel(val);
      if (prediction === "OAG" || prediction === "CAG") {
        showInitialWarning(el, prediction, val);
      } else {
        hideAllOverlays();
      }
    }, 200); // Further reduced for faster detection
  });
  
  el.dataset.cyberlawAttached = "true";
}

// Immediate keyword checking for instant detection
function checkImmediateKeywords(text) {
  const lowerText = text.toLowerCase();
  
  // Common aggressive keywords for immediate detection
  const offensiveKeywords = [
    'kill', 'murder', 'rape', 'hate', 'stupid', 'idiot', 'loser', 'pathetic',
    'disgusting', 'worthless', 'useless', 'trash', 'garbage', 'scum', 'die',
    'death', 'threat', 'violence', 'hurt', 'harm', 'attack', 'destroy',
    'damn', 'hell', 'shit', 'fuck', 'bitch', 'asshole', 'bastard'
  ];
  
  const cyberAggressiveKeywords = [
    'troll', 'spam', 'fake', 'liar', 'cheat', 'fraud', 'scam', 'hack',
    'noob', 'retard', 'moron', 'dumb', 'shut up', 'get lost', 'go away'
  ];
  
  // Check for offensive keywords (OAG)
  for (const keyword of offensiveKeywords) {
    if (lowerText.includes(keyword)) {
      return "OAG";
    }
  }
  
  // Check for cyber aggressive keywords (CAG)
  for (const keyword of cyberAggressiveKeywords) {
    if (lowerText.includes(keyword)) {
      return "CAG";
    }
  }
  
  return null;
}

function monitorInputs() {
  if (!isApprovedSite()) return;
  
  const inputs = Array.from(
    document.querySelectorAll("input[type='text'], textarea, [contenteditable='true']")
  );
  inputs.forEach(attachListener);
}

// --- Event listeners ---
learnMoreBtn.addEventListener("click", showDetailedAnalysis);
dismissBtn.addEventListener("click", () => {
  if (currentElement) {
    warningDismissedFor.add(currentElement);
  }
  hideAllOverlays();
});
closeDetailBtn.addEventListener("click", hideAllOverlays);

// --- Manual check logic ---
manualInput.addEventListener("input", async () => {
  const val = manualInput.value;
  if (val.trim().length < 3) {
    manualWarning.style.display = "none";
    return;
  }
  
  // Immediate check for aggressive keywords
  const immediateCheck = checkImmediateKeywords(val);
  if (immediateCheck) {
    displayManualWarning(immediateCheck);
    return;
  }
  
  // Full ML analysis with slight delay
  setTimeout(async () => {
    const prediction = await checkWithModel(val);
    if (prediction === "OAG" || prediction === "CAG") {
      displayManualWarning(prediction);
    } else {
      manualWarning.style.display = "none";
    }
  }, 200);
});

function displayManualWarning(prediction) {
  manualWarning.style.display = "block";
  manualWarning.style.background = prediction === "OAG" ? 
    "linear-gradient(135deg, #ffebee, #ffcdd2)" : 
    "linear-gradient(135deg, #fff3e0, #ffe0b2)";
  manualWarning.style.color = prediction === "OAG" ? "#d32f2f" : "#f57c00";
  manualWarning.style.border = `2px solid ${prediction === "OAG" ? "#f44336" : "#ff9800"}`;
  manualWarning.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 8px;">
      <span style="margin-right: 8px;">${prediction === "OAG" ? "🚫" : "⚠️"}</span>
      <strong>Detected: ${prediction === "OAG" ? "Offensive Aggressive" : "Cyber Aggressive"}</strong>
    </div>
    <div style="font-size: 12px;">Click the floating button for detailed analysis</div>
  `;
}

// --- Floating button toggle manual popup ---
floatingBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  
  if (manualPopup.style.display === "flex") {
    manualPopup.style.display = "none";
  } else {
    // Position popup relative to button
    const buttonRect = floatingBtn.getBoundingClientRect();
    const popupWidth = 350;
    const popupHeight = 200; // approximate height
    
    // Default position (left of button)
    let left = buttonRect.left - popupWidth - 10;
    let bottom = window.innerHeight - buttonRect.bottom;
    
    // If popup would go off-screen on the left, position it to the right
    if (left < 10) {
      left = buttonRect.right + 10;
    }
    
    // If popup would go off-screen on the right, position it to the left again but adjust
    if (left + popupWidth > window.innerWidth - 10) {
      left = window.innerWidth - popupWidth - 10;
    }
    
    // If popup would go off-screen at bottom, position it above
    if (bottom < 10) {
      bottom = window.innerHeight - buttonRect.top + 10;
    }
    
    manualPopup.style.left = left + "px";
    manualPopup.style.bottom = bottom + "px";
    manualPopup.style.right = "auto"; // Remove right positioning
    manualPopup.style.display = "flex";
  }
});

// --- Dragging functionality for floating button ---
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

floatingBtn.addEventListener("mousedown", (e) => {
  if (e.target === floatingBtn) {
    isDragging = true;
    dragOffset.x = e.clientX - floatingBtn.getBoundingClientRect().left;
    dragOffset.y = e.clientY - floatingBtn.getBoundingClientRect().top;
    floatingBtn.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
    e.preventDefault();
  }
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  
  let left = e.clientX - dragOffset.x;
  let top = e.clientY - dragOffset.y;
  
  // Keep within viewport
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
    floatingBtn.style.cursor = "move";
    document.body.style.userSelect = "";
  }
});

// --- Dragging functionality for detail overlay ---
let isDraggingOverlay = false;
let overlayOffset = { x: 0, y: 0 };

moveHandle.addEventListener("mousedown", (e) => {
  isDraggingOverlay = true;
  overlayOffset.x = e.clientX - detailOverlay.getBoundingClientRect().left;
  overlayOffset.y = e.clientY - detailOverlay.getBoundingClientRect().top;
  moveHandle.style.cursor = "grabbing";
  document.body.style.userSelect = "none";
  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!isDraggingOverlay) return;
  
  let left = e.clientX - overlayOffset.x;
  let top = e.clientY - overlayOffset.y;
  
  // Keep within viewport
  const maxLeft = window.innerWidth - detailOverlay.offsetWidth;
  const maxTop = window.innerHeight - detailOverlay.offsetHeight;
  left = Math.min(Math.max(0, left), maxLeft);
  top = Math.min(Math.max(0, top), maxTop);
  
  detailOverlay.style.left = left + "px";
  detailOverlay.style.top = top + "px";
  detailOverlay.style.transform = "none";
});

document.addEventListener("mouseup", () => {
  if (isDraggingOverlay) {
    isDraggingOverlay = false;
    moveHandle.style.cursor = "move";
    document.body.style.userSelect = "";
  }
});

// --- Close overlays when clicking outside ---
document.addEventListener("click", (e) => {
  if (!detailOverlay.contains(e.target) && !initialWarning.contains(e.target) && !floatingBtn.contains(e.target) && !permissionOverlay.contains(e.target)) {
    if (detailOverlay.style.display === "flex" || initialWarning.style.display === "flex") {
      hideAllOverlays();
    }
  }
  
  if (!manualPopup.contains(e.target) && !floatingBtn.contains(e.target)) {
    if (manualPopup.style.display === "flex") {
      manualPopup.style.display = "none";
    }
  }
});

// --- Add hover effects ---
manualInput.addEventListener("focus", () => {
  manualInput.style.borderColor = "#667eea";
  manualInput.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
});

manualInput.addEventListener("blur", () => {
  manualInput.style.borderColor = "#e0e0e0";
  manualInput.style.boxShadow = "none";
});

// Add hover effects for buttons
document.addEventListener("mouseover", (e) => {
  if (e.target.style.background && e.target.style.background.includes("linear-gradient(135deg, #667eea")) {
    e.target.style.transform = "translateY(-2px)";
    e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
  }
});

document.addEventListener("mouseout", (e) => {
  if (e.target.style.background && e.target.style.background.includes("linear-gradient(135deg, #667eea")) {
    e.target.style.transform = "translateY(0)";
    e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
  }
});

// Add hover effect for close button
document.addEventListener("mouseover", (e) => {
  if (e.target.id === "closeDetailBtn") {
    e.target.style.background = "rgba(255,255,255,0.3)";
  }
});

document.addEventListener("mouseout", (e) => {
  if (e.target.id === "closeDetailBtn") {
    e.target.style.background = "rgba(255,255,255,0.2)";
  }
});

// --- Initialize ---
monitorInputs();
const observer = new MutationObserver(() => monitorInputs());
observer.observe(document.body, { childList: true, subtree: true });

// Add CSS for smooth animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .cyberlaw-animate {
    animation: slideIn 0.3s ease-out;
  }
  
  .cyberlaw-fade {
    animation: fadeIn 0.3s ease-out;
  }
`;
document.head.appendChild(style);