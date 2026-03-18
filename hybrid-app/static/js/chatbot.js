// =====================================================
//  chatbot.js — Gemini AI Assistant
// =====================================================

let isTyping     = false;
let geminiApiKey = CONFIG.GEMINI_API_KEY
                || localStorage.getItem('geminiApiKey')
                || '';

function initChatbot() {
  if (!geminiApiKey) renderApiKeySetup();
  else               renderApiKeyStatus(true);
}

function renderApiKeySetup() {
  const banner = document.getElementById('apiKeyBanner');
  if (banner) {
    banner.style.display = 'block';
    banner.innerHTML = `⚠️ <strong>AI needs a Gemini API key.</strong>
      Get one free at <a href="https://aistudio.google.com/app/apikey" target="_blank"
        style="color:#0288D1;text-decoration:underline">aistudio.google.com</a>`;
  }
  const row = document.getElementById('apiKeyRow');
  if (row) row.style.display = 'flex';
}

function renderApiKeyStatus(ok) {
  const banner = document.getElementById('apiKeyBanner');
  const row    = document.getElementById('apiKeyRow');
  if (banner) banner.style.display = ok ? 'none' : 'block';
  if (row)    row.style.display    = ok ? 'none' : 'flex';
}

function saveApiKey() {
  const val = document.getElementById('apiKeyInput').value.trim();
  if (!val) { alert('Please enter a valid API key.'); return; }
  geminiApiKey = val;
  localStorage.setItem('geminiApiKey', val);
  renderApiKeyStatus(true);
  addMessage('✅ API key saved! AI assistant is now active.', 'bot');
}

function toggleChat() {
  const win = document.getElementById('chatWindow');
  win.classList.toggle('open');
}

async function sendChatMessage() {
  const input   = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message || isTyping) return;

  addMessage(message, 'user');
  input.value = '';
  showTypingIndicator();
  isTyping = true;

  if (!geminiApiKey) {
    removeTypingIndicator();
    addMessage('⚠️ Please enter your Gemini API key to use the AI assistant.', 'bot');
    isTyping = false;
    renderApiKeySetup();
    return;
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: CONFIG.AI_CONTEXT + '\n\nUser: ' + message }] }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
        })
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error?.message || 'API error ' + res.status);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
    removeTypingIndicator();
    addMessage(text, 'bot');

  } catch (err) {
    console.error('Gemini error:', err);
    removeTypingIndicator();
    if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('400')) {
      geminiApiKey = '';
      localStorage.removeItem('geminiApiKey');
      renderApiKeySetup();
      addMessage('❌ Invalid API key. Please enter a valid key.', 'bot');
    } else {
      addMessage(getFallbackResponse(message.toLowerCase()), 'bot');
    }
  }
  isTyping = false;
}

function showTypingIndicator() {
  const c = document.getElementById('chatMessages');
  const d = document.createElement('div');
  d.id = 'typingIndicator'; d.className = 'chat-message';
  d.innerHTML = `<div class="typing-indicator">
    <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
  </div>`;
  c.appendChild(d); c.scrollTop = c.scrollHeight;
}
function removeTypingIndicator() {
  document.getElementById('typingIndicator')?.remove();
}

function addMessage(text, sender) {
  const c   = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-message';
  if (sender === 'bot') {
    const fmt = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
    div.innerHTML = `<div class="bot-message">${fmt}</div>`;
  } else {
    div.innerHTML = `<div class="user-message">${escHtml(text)}</div>`;
  }
  c.appendChild(div); c.scrollTop = c.scrollHeight;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getFallbackResponse(input) {
  if (input.includes('component') || input.includes('part'))
    return 'Main components: Arduino Nano, 16x2 LCD, 4x4 Keypad, Solenoid Lock, Relay, LM2596 Buck, SIM800L GSM, 600W Solar Panel, 600W Wind Turbine.';
  if (input.includes('power') || input.includes('watt'))
    return 'Total power: 1.2kW — 600W solar + 600W wind. Battery: 12V 200Ah × 2.';
  if (input.includes('team') || input.includes('sino'))
    return "Team: Marden (Lead Engineer), Rhey Victor Guillermo (Systems Designer), Victor Guillermo (Security Specialist). Adviser: Ma'am Jennifer Del Amen.";
  if (input.includes('security') || input.includes('anti-theft'))
    return 'Anti-theft: 4-digit PIN, solenoid lock (10kg), motion detection, SMS alerts via SIM800L, tamper-proof steel enclosure.';
  if (input.includes('contact') || input.includes('phone'))
    return 'Marden: +63 912 345 6789 | Rhey: +63 923 456 7890 | Victor: +63 934 567 8901';
  if (input.includes('location') || input.includes('baliuag'))
    return 'Located at Baliuag University, Baliuag, Bulacan.';
  return '⚡ I can help with components, specs, team info, and security details. (Set your Gemini API key for full AI!)';
}
