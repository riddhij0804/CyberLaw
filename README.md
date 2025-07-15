# CyberLaw 🛡

Transform Aggressive Online Communication into Respectful Digital Dialogue

CyberLaw is an AI-powered system that automatically detects and classifies aggressive or offensive language in real-time, providing intelligent rephrasing suggestions to promote healthier online communication and prevent cyberbullying.

## 🌟 What CyberLaw Does

### 🔍 Real-Time Text Analysis
- Automatically monitors text inputs across web pages
- AI classifies content as Non-Aggressive, Cyber Aggressive, or Offensive Aggressive
- Provides instant warnings before posting harmful content
- Uses ensemble learning with multiple transformer models for high accuracy

### 🔄 Intelligent Rephrasing
- Generates alternative phrasings for aggressive content
- Powered by Groq and Google Gemini APIs
- Maintains original meaning while removing harmful elements
- Offers multiple rephrasing options for user choice

### 🌐 Browser Integration
- Chrome extension for seamless web browsing protection
- Works on social media, forums, comments, and messaging platforms
- Non-intrusive floating interface
- Dismissible warnings respect user autonomy

### 💬 Interactive Features
- Visual Warnings: Clear overlay notifications for aggressive content
- One-Click Replacement: Easy text substitution with rephrased versions
- Manual Analysis: On-demand text checking via floating button
- Smart Detection: Learns from user behavior to reduce false positives

## 🚀 Key Features

### 🤖 Advanced AI Technology
- Ensemble Models: Combines IndicBERT and MiniLM for robust classification
- Soft Voting: Averages model predictions for improved accuracy
- Multi-API Rephrasing: Leverages both Groq and Gemini for diverse suggestions
- Real-time Processing: Fast inference optimized for web browsing

### 🔒 Privacy & Security
- Local Processing: Core models run locally for privacy
- Secure API Integration: Encrypted communication with rephrasing services
- No Data Storage: Text analysis happens in real-time without logging
- User Control: Complete control over when and how the system activates

### 📊 Smart Classification
- NAG (Non-Aggressive): Safe, respectful communication
- CAG (Cyber Aggressive): Hostile online behavior detection
- OAG (Offensive Aggressive): Severe offensive content identification
- Context Awareness: Understands nuanced language patterns

## 💻 Technology Stack

### Backend (AI Engine)
- FastAPI: High-performance web framework for AI inference
- PyTorch: Deep learning framework for model deployment
- Transformers: Hugging Face library for BERT-based models
- IndicBERT: Specialized model for multilingual text understanding
- MiniLM: Lightweight model for efficient processing
- Groq API: High-speed language model for rephrasing
- Google Gemini: Advanced AI for creative text generation

### Frontend (Browser Extension)
- Vanilla JavaScript: Lightweight extension for maximum compatibility
- Chrome Extension API: Native browser integration
- CSS3: Modern styling for user interface
- Web APIs: Real-time DOM manipulation and event handling

### Supporting Technologies
- CORS Middleware: Cross-origin resource sharing
- Pydantic: Data validation and serialization
- Python-dotenv: Environment variable management
- Uvicorn: ASGI server for FastAPI deployment

## 📋 System Requirements

### Required Software
1. Python 3.8+ - [Download here](https://python.org)
2. Google Chrome Browser - [Download here](https://chrome.google.com)

### API Keys Required
- Groq API Key - [Get here](https://console.groq.com)
- Google Gemini API Key - [Get here](https://makersuite.google.com)

### Python Dependencies
All required packages are in requirements.txt:

## 🏁 Installation & Setup

### 1. Clone the Repository
bash
git clone <repository-url>
cd CyberLaw


### 2. Backend Setup
bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt


### 3. Environment Configuration
Create a .env file in the backend directory:
env
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here



### 5. Chrome Extension Installation
1. Open Chrome and go to chrome://extensions/
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the browser_plugin folder
4. The CyberLaw extension should now appear in your extensions list

### 6. Run the Application

Start Backend Server:
bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload

Test Extension:
1. Visit any website with text input fields
2. Look for the CyberLaw floating button
3. Try typing aggressive text to see warnings

## 📱 How to Use

### Getting Started
1. Install Extension: Load the Chrome extension from developer mode
2. Start Backend: Run the FastAPI server locally
3. Browse Normally: The extension monitors your text input automatically

### For Automatic Monitoring
1. Extension automatically scans text as you type
2. Warnings appear for aggressive content before posting
3. Choose rephrased alternatives or dismiss warnings
4. Continue browsing with protection active

### For Manual Analysis
1. Click the floating CyberLaw button on any webpage
2. Paste or type text in the manual analysis popup
3. Get instant classification and rephrasing suggestions
4. Use improved text in your communications

## 🔒 Privacy & Ethics

- Local AI Processing: Core classification models run on your device
- Minimal Data Transfer: Only flagged content sent to rephrasing APIs
- No User Tracking: Extension doesn't collect personal information
- Transparent Operation: Open-source code for full transparency
- User Autonomy: Complete control over system activation and warnings

## 🎯 Perfect For

- Social Media Users who want to communicate more respectfully
- Students learning about appropriate online behavior
- Professionals maintaining workplace communication standards
- Parents teaching children about digital citizenship
- Content Creators ensuring community-friendly content
- Anyone committed to reducing online toxicity

## ⚠ Important Disclaimers

- AI Assistance Tool: CyberLaw assists but doesn't replace human judgment
- Context Limitations: AI may not understand complex contextual nuances
- Cultural Sensitivity: Trained primarily on English text patterns
- Continuous Learning: System improves with usage and feedback
- User Responsibility: Final decisions about communication remain with users

## 🚧 Current Features

- ✅ Real-time text classification (NAG/CAG/OAG)
- ✅ Ensemble model architecture for accuracy
- ✅ Chrome extension with seamless integration
- ✅ Dual-API rephrasing system (Groq + Gemini)
- ✅ Visual warning overlays
- ✅ Manual text analysis tool
- ✅ Dismissible warnings system
- ✅ Responsive user interface

## 🔮 Future Enhancements

- 🌐 Multi-language support for global users
- 📱 Mobile browser extension development
- 🧠 Advanced context understanding
- 📊 Personal communication analytics
- 🤝 Integration with major social platforms
- 🎓 Educational mode for learning appropriate communication
- 🔔 Customizable sensitivity levels
- 📈 Community reporting and feedback system

## 🤝 Support & Contact

For questions, issues, or support:
- Open an issue in the GitHub repository
- Check the browser extension popup for quick help
- Review the API documentation at http://localhost:8000/docs
- Contact the development team for technical support

---

Made for a more respectful digital world 🌍