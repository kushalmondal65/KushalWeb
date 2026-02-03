// SPA Routing and Section Rendering
const mainContent = document.getElementById('main-content');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');
const siteLogo = document.getElementById('site-logo');
const footerLogo = document.getElementById('footer-logo');

// Theme and Logo Management
const THEME_KEY = 'ai-chatbot-theme';
function setTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  siteLogo.src = theme === 'dark' ? 'assets/logo-dark.svg' : 'assets/logo-light.svg';
  footerLogo.src = theme === 'dark' ? 'assets/logo-dark.svg' : 'assets/logo-light.svg';
  themeToggle.innerHTML = theme === 'dark'
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
  localStorage.setItem(THEME_KEY, theme);
}
function toggleTheme() {
  const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
  setTheme(newTheme);
}
themeToggle.addEventListener('click', toggleTheme);
(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  setTheme(saved);
})();

// SPA Navigation
function setActiveNav(hash) {
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === hash);
  });
}
function renderSection(hash) {
  switch (hash) {
    case '#home':
    case '':
      renderHome();
      break;
    case '#feedback':
      renderFeedback();
      break;
    case '#about':
      renderAbout();
      break;
    case '#auth':
      renderAuth();
      break;
    default:
      renderHome();
  }
  setActiveNav(hash || '#home');
}
window.addEventListener('hashchange', () => renderSection(location.hash));
window.addEventListener('DOMContentLoaded', () => renderSection(location.hash));

// --- Home Section: AI Chatbot with Animated Themes ---
const THEMES = [
  
];
let currentChatTheme = 'nature';

function renderHome() {
  mainContent.innerHTML = `
    <section class="chatbot-section">
      <div class="theme-selector">
        <span>Theme:</span>
        ${THEMES.map(t =>
          `<button class="theme-btn${t.id === currentChatTheme ? ' active' : ''}" data-theme="${t.id}">${t.label}</button>`
        ).join('')}
      </div>
      <div class="animated-bg ${currentChatTheme}"></div>
      <div class="chatbot-container" aria-label="AI Chatbot" role="region">
        <div class="chat-messages" id="chat-messages" aria-live="polite"></div>
        <form class="chatbot-input-area" id="chatbot-form" autocomplete="off">
          <textarea class="chatbot-input" id="chatbot-input" rows="1" placeholder="Type your message..." required></textarea>
          <button type="submit" class="chatbot-send-btn" id="chatbot-send-btn" aria-label="Send"><i class="fas fa-paper-plane"></i></button>
        </form>
      </div>
    </section>
  `;
  // Theme buttons
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      currentChatTheme = btn.dataset.theme;
      renderHome();
    });
  });
  // Chatbot logic
  initChatbot();
}

function initChatbot() {
  const chatMessages = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chatbot-form');
  const chatInput = document.getElementById('chatbot-input');
  chatMessages.innerHTML = '';
  // Initial bot message
  appendChatMessage('bot', "👋 Hi! I'm your AI assistant. Ask me anything.");
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMsg = chatInput.value.trim();
    if (!userMsg) return;
    appendChatMessage('user', userMsg);
    chatInput.value = '';
    chatInput.style.height = 'auto';
    showTypingIndicator();
    try {
      const botReply = await fetchGeminiResponse(userMsg);
      removeTypingIndicator();
      appendChatMessage('bot', botReply);
    } catch (err) {
      removeTypingIndicator();
      appendChatMessage('bot', "Sorry, I couldn't get a response. Please try again.");
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
  // Autosize textarea
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = chatInput.scrollHeight + 'px';
  });
}

function appendChatMessage(sender, text) {
  const chatMessages = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-message ${sender}`;
  msgDiv.innerHTML = `
    <div class="chat-avatar">${sender === 'bot' ? '🤖' : '🧑'}</div>
    <div class="chat-bubble">${escapeHTML(text)}</div>
  `;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function showTypingIndicator() {
  const chatMessages = document.getElementById('chat-messages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-message bot typing-indicator-row';
  typingDiv.id = 'typing-indicator';
  typingDiv.innerHTML = `
    <div class="chat-avatar">🤖</div>
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function removeTypingIndicator() {
  const typingDiv = document.getElementById('typing-indicator');
  if (typingDiv) typingDiv.remove();
}
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);
}

// --- Gemini API Integration ---
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'; // <-- Insert your Gemini API key here
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
async function fetchGeminiResponse(userMsg) {
  // For demo: if no API key, return a canned response
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
    return "Please configure your Gemini API key in script.js to enable AI responses.";
  }
  const payload = {
    contents: [
      { parts: [{ text: userMsg }] }
    ]
  };
  const res = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.candidates || !data.candidates.length) {
    throw new Error('No response from Gemini API');
  }
  return data.candidates[0].content.parts[0].text;
}

// --- Feedback Section ---
const FEEDBACK_KEY = 'ai-chatbot-feedbacks';
function renderFeedback() {
  mainContent.innerHTML = `
    <section class="feedback-section">
      <form class="feedback-form" id="feedback-form" autocomplete="off">
        <input type="text" id="feedback-name" placeholder="Your Name" required />
        <input type="email" id="feedback-email" placeholder="Your Email" required />
        <textarea id="feedback-message" rows="3" placeholder="Your Feedback" required></textarea>
        <button type="submit">Submit Feedback</button>
        <div id="feedback-form-msg" class="auth-message"></div>
      </form>
      <div class="feedback-list" id="feedback-list"></div>
    </section>
  `;
  loadFeedbacks();
  document.getElementById('feedback-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('feedback-name').value.trim();
    const email = document.getElementById('feedback-email').value.trim();
    const message = document.getElementById('feedback-message').value.trim();
    const msgDiv = document.getElementById('feedback-form-msg');
    if (!name || !email || !message) {
      msgDiv.textContent = 'All fields are required.';
      msgDiv.className = 'auth-message error';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msgDiv.textContent = 'Invalid email address.';
      msgDiv.className = 'auth-message error';
      return;
    }
    const feedback = {
      name: escapeHTML(name),
      email: escapeHTML(email),
      message: escapeHTML(message),
      date: new Date().toLocaleString()
    };
    const feedbacks = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]');
    feedbacks.push(feedback);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbacks));
    msgDiv.textContent = 'Thank you for your feedback!';
    msgDiv.className = 'auth-message';
    document.getElementById('feedback-form').reset();
    loadFeedbacks();
  });
}
function loadFeedbacks() {
  const feedbackList = document.getElementById('feedback-list');
  const feedbacks = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]').reverse();
  feedbackList.innerHTML = feedbacks.length
    ? feedbacks.map(f => `
      <div class="feedback-item">
        <div class="feedback-meta">${f.name} &bull; ${f.email} &bull; <span>${f.date}</span></div>
        <div class="feedback-message">${f.message}</div>
      </div>
    `).join('')
    : '<div class="feedback-item">No feedback yet. Be the first to share your thoughts!</div>';
}

// --- About Section ---
function renderAbout() {
  mainContent.innerHTML = `
    <section class="about-section">
      <h2>About AI Chatbot Website</h2>
      <p>
        This website showcases a fully functional AI chatbot built with only JavaScript, HTML, and CSS. The chatbot leverages the Google Gemini API to provide real-time, intelligent responses to your queries.
      </p>
      <p>
        <strong>Features:</strong>
        <ul>
          <li>User feedback system with persistent storage</li>
          <li>Client-side authentication (Login/Register) using localStorage</li>
          <li>Dark and light themes with logo swap</li>
          <li>Fully responsive layout for all devices</li>
        </ul>
      </p>
      <p>
        Developed by <a href="https://your-personal-website.com" target="_blank" rel="noopener">Your Name</a>.
      </p>
    </section>
  `;
}

// --- Login/Register Section ---
const USERS_KEY = 'ai-chatbot-users';
const SESSION_KEY = 'ai-chatbot-session';
function renderAuth() {
  const user = getCurrentUser();
  mainContent.innerHTML = `
    <section class="auth-section">
      ${user ? `
        <div class="auth-message">Welcome, <strong>${user.name}</strong>!<br>Your email: ${user.email}<br>Your mobile: ${user.mobile}</div>
        <button class="auth-logout-btn" id="logout-btn">Logout</button>
      ` : `
        <div class="auth-tabs">
          <button class="auth-tab active" id="login-tab">Login</button>
          <button class="auth-tab" id="register-tab">Register</button>
        </div>
        <form class="auth-form" id="login-form">
          <input type="email" id="login-email" placeholder="Email" required />
          <input type="text" id="login-mobile" placeholder="Mobile Number" required />
          <button type="submit">Login</button>
          <div id="login-msg" class="auth-message"></div>
        </form>
        <form class="auth-form hidden" id="register-form">
          <input type="text" id="register-name" placeholder="Full Name" required />
          <input type="email" id="register-email" placeholder="Email" required />
          <input type="text" id="register-mobile" placeholder="Mobile Number" required />
          <button type="submit">Register</button>
          <div id="register-msg" class="auth-message"></div>
        </form>
      `}
    </section>
  `;
  if (user) {
    document.getElementById('logout-btn').addEventListener('click', () => {
      localStorage.removeItem(SESSION_KEY);
      renderAuth();
    });
  } else {
    // Tabs
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
    });
    registerTab.addEventListener('click', () => {
      registerTab.classList.add('active');
      loginTab.classList.remove('active');
      registerForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    });
    // Login
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const mobile = document.getElementById('login-mobile').value.trim();
      const msgDiv = document.getElementById('login-msg');
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const user = users.find(u => u.email === email && u.mobile === mobile);
      if (user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        msgDiv.textContent = 'Login successful!';
        msgDiv.className = 'auth-message';
        setTimeout(renderAuth, 800);
      } else {
        msgDiv.textContent = 'Invalid credentials.';
        msgDiv.className = 'auth-message error';
      }
    });
    // Register
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('register-name').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const mobile = document.getElementById('register-mobile').value.trim();
      const msgDiv = document.getElementById('register-msg');
      if (!name || !email || !mobile) {
        msgDiv.textContent = 'All fields are required.';
        msgDiv.className = 'auth-message error';
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msgDiv.textContent = 'Invalid email address.';
        msgDiv.className = 'auth-message error';
        return;
      }
      if (!/^\d{7,15}$/.test(mobile.replace(/\D/g, ''))) {
        msgDiv.textContent = 'Invalid mobile number.';
        msgDiv.className = 'auth-message error';
        return;
      }
      let users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      if (users.find(u => u.email === email)) {
        msgDiv.textContent = 'Email already registered.';
        msgDiv.className = 'auth-message error';
        return;
      }
      const user = { name: escapeHTML(name), email: escapeHTML(email), mobile: escapeHTML(mobile) };
      users.push(user);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      msgDiv.textContent = 'Registration successful!';
      msgDiv.className = 'auth-message';
      setTimeout(renderAuth, 800);
    });
  }
}
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}