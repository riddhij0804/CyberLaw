// --- flagged words to detect ---
const flaggedTerms = [
  "scam", "fraud", "blackmail", "phish",
  "harass", "threat", "porn", "hate", "abuse"
];

// --- Create floating button ---
const floatingBtn = document.createElement("button");
floatingBtn.textContent = "🛡️ Cyberlaw Checker";
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

// --- Create automatic warning overlay ---
const warningOverlay = document.createElement("div");
Object.assign(warningOverlay.style, {
  position: "fixed",
  bottom: "70px",
  right: "20px",
  background: "rgba(211, 47, 47, 0.95)",
  color: "#fff",
  padding: "14px 22px",
  borderRadius: "12px",
  fontSize: "15px",
  fontWeight: "700",
  zIndex: "2147483647",
  boxShadow: "0 4px 12px rgba(211, 47, 47, 0.8)",
  maxWidth: "320px",
  display: "none",  // hidden initially
  flexDirection: "column",
  userSelect: "none",
  pointerEvents: "auto",
});
warningOverlay.innerHTML = `
  <div style="margin-bottom:8px;">⚠️ Your input contains words that may violate cyberlaw or are disrespectful.</div>
  <div style="text-align:right;">
    <button id="acceptBtn" style="background:#4caf50; border:none; color:#fff; padding:6px 12px; border-radius:6px; cursor:pointer; margin-right:8px;">Accept</button>
    <button id="ignoreBtn" style="background:#f44336; border:none; color:#fff; padding:6px 12px; border-radius:6px; cursor:pointer;">Ignore</button>
  </div>
`;
document.body.appendChild(warningOverlay);

const acceptBtn = warningOverlay.querySelector("#acceptBtn");
const ignoreBtn = warningOverlay.querySelector("#ignoreBtn");

let currentElement = null;
let warningDismissedFor = new WeakSet(); // track inputs dismissed

// --- Create manual check popup ---
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

// --- Helper: find flagged words ---
function findFlaggedWords(text) {
  const lowerText = text.toLowerCase();
  return flaggedTerms.filter(term => lowerText.includes(term));
}

// --- Show automatic warning ---
function showWarning(el) {
  if (warningDismissedFor.has(el)) return;
  currentElement = el;
  warningOverlay.style.display = "flex";
}

// --- Hide automatic warning ---
function hideWarning() {
  warningOverlay.style.display = "none";
  currentElement = null;
}

// --- Check input and toggle warning ---
function checkAndShowWarning(el) {
  if (warningDismissedFor.has(el)) {
    hideWarning();
    return;
  }
  const val = el.value ?? (el.innerText ?? "");
  const found = findFlaggedWords(val);
  if (found.length > 0) {
    showWarning(el);
  } else {
    hideWarning();
  }
}

// --- Attach input listener ---
function attachListener(el) {
  if (el.dataset.cyberlawAttached === "true") return;
  el.addEventListener("input", () => {
    // Reset dismissal when input changes
    if (warningDismissedFor.has(el)) {
      warningDismissedFor.delete(el);
    }
    checkAndShowWarning(el);
  });
  el.dataset.cyberlawAttached = "true";
}

// --- Monitor inputs on the page ---
function monitorInputs() {
  const inputs = Array.from(
    document.querySelectorAll("input[type='text'], textarea, [contenteditable='true']")
  );
  inputs.forEach(attachListener);
}

// --- Button handlers for Accept/Ignore ---
acceptBtn.addEventListener("click", () => {
  if (currentElement) {
    warningDismissedFor.add(currentElement);
    hideWarning();
  }
});
ignoreBtn.addEventListener("click", () => {
  if (currentElement) {
    warningDismissedFor.add(currentElement);
    hideWarning();
  }
});

// --- Floating button toggles manual popup ---
floatingBtn.addEventListener("click", () => {
  if (manualPopup.style.display === "flex") {
    manualPopup.style.display = "none";
  } else {
    manualPopup.style.display = "flex";
  }
});

// --- Manual popup input listener ---
manualInput.addEventListener("input", () => {
  const found = findFlaggedWords(manualInput.value);
  if (found.length > 0) {
    manualWarning.style.display = "block";
    manualWarning.textContent = `⚠️ Suspicious words found: ${found.join(", ")}`;
  } else {
    manualWarning.style.display = "none";
    manualWarning.textContent = "";
  }
});

// --- Initial setup ---
monitorInputs();

// --- Observe DOM changes for dynamic inputs ---
const observer = new MutationObserver(() => {
  monitorInputs();
});
observer.observe(document.body, { childList: true, subtree: true });

// Make floatingBtn draggable
floatingBtn.style.position = "fixed";
floatingBtn.style.cursor = "move";

let isDragging = false;
let offsetX, offsetY;

floatingBtn.addEventListener("mousedown", (e) => {
  isDragging = true;
  // Calculate offset between mouse and button top-left corner
  offsetX = e.clientX - floatingBtn.getBoundingClientRect().left;
  offsetY = e.clientY - floatingBtn.getBoundingClientRect().top;
  document.body.style.userSelect = "none"; // prevent text selection while dragging
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  // Calculate new position based on mouse location minus offset
  let left = e.clientX - offsetX;
  let top = e.clientY - offsetY;

  // Optional: constrain inside viewport
  const maxLeft = window.innerWidth - floatingBtn.offsetWidth;
  const maxTop = window.innerHeight - floatingBtn.offsetHeight;
  left = Math.min(Math.max(0, left), maxLeft);
  top = Math.min(Math.max(0, top), maxTop);

  floatingBtn.style.left = left + "px";
  floatingBtn.style.top = top + "px";
  floatingBtn.style.right = "auto";  // override right since we move with left/top
  floatingBtn.style.bottom = "auto";
});

document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    document.body.style.userSelect = ""; // re-enable text selection
  }
});

