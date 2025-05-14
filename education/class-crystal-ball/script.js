// Get embed ID from URL or data attribute
function getEmbedId() {
    const urlParams = new URLSearchParams(window.location.search);
    const embedId = urlParams.get('embed') || 
                   document.querySelector('[data-embed-id]')?.dataset.embedId ||
                   window.location.hostname;
    return embedId;
}

// Namespace for localStorage keys
const embedId = getEmbedId();
const STORAGE_KEYS = {
    theme: `crystal-ball-theme-${embedId}`,
    color: `crystal-ball-color-${embedId}`,
    visibility: `crystal-ball-visibility-${embedId}`,
    history: `crystal-ball-history-${embedId}`
};

// DOM Elements
const crystalBall = document.getElementById('crystalBall');
const crystalText = document.getElementById('crystalText');
const askButton = document.getElementById('askButton');
const fortuneButton = document.getElementById('fortuneButton');
const historyList = document.getElementById('historyList');
const themeToggle = document.querySelector('.theme-toggle');
const helpButton = document.querySelector('.help-button');
const helpModal = document.getElementById('helpModal');
const closeButton = document.querySelector('.close-button');
const clearHistoryButton = document.getElementById('clearHistoryButton');
const colorPicker = document.getElementById('colorPicker');
const visibilityToggle = document.querySelector('.visibility-toggle');

// Mystical answers and fortunes
const answers = [
    "Yes",
    "No",
    "Maybe So",
    "Most Likely",
    "Ask Again Later",
    "Cannot Predict Now",
    "Don't Count On It",
    "It Is Certain",
    "Outlook Good",
    "Signs Point to Yes"
];

const fortunes = [
    "Watch out for 6, because 7 8 9",
    "If olive oil is made from olives, what is baby oil made from?",
    "The early bird gets the worm, but the second mouse gets the cheese",
    "Why do we drive on parkways and park on driveways?",
    "If a book about failures doesn't sell, is it a success?",
    "Why do we call it a building when it's already built?",
    "If you try to fail and succeed, which have you done?",
    "Why do we say 'tuna fish' but not 'beef mammal'?",
    "If you're not supposed to eat at night, why is there a light in the fridge?",
    "Why do we say 'sleep like a baby' when babies wake up every two hours?"
];

// Theme Management
function loadTheme() {
    const theme = localStorage.getItem(STORAGE_KEYS.theme) || 'light';
    document.body.classList.toggle('dark-theme', theme === 'dark');
    themeToggle.innerHTML = `<i class="fas fa-${theme === 'dark' ? 'sun' : 'moon'}"></i>`;
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
    themeToggle.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i>`;
}

// Color Management
function loadColor() {
    const color = localStorage.getItem(STORAGE_KEYS.color) || '#4a90e2';
    colorPicker.value = color;
    document.documentElement.style.setProperty('--primary-color', color);
}

function updateColor(e) {
    const color = e.target.value;
    document.documentElement.style.setProperty('--primary-color', color);
    localStorage.setItem(STORAGE_KEYS.color, color);
}

// Visibility Management
function toggleVisibility() {
    const widget = document.querySelector('.crystal-ball-widget');
    widget.classList.toggle('controls-hidden');
    const isHidden = widget.classList.contains('controls-hidden');
    visibilityToggle.innerHTML = `<i class="fas fa-${isHidden ? 'eye-slash' : 'eye'}"></i>`;
    localStorage.setItem(STORAGE_KEYS.visibility, isHidden ? 'hidden' : 'visible');
}

function loadVisibility() {
    const visibility = localStorage.getItem(STORAGE_KEYS.visibility) || 'visible';
    if (visibility === 'hidden') {
        const widget = document.querySelector('.crystal-ball-widget');
        widget.classList.add('controls-hidden');
        visibilityToggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
    }
}

// Help Modal
helpButton.addEventListener('click', () => {
    helpModal.style.display = 'block';
});

closeButton.addEventListener('click', () => {
    helpModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === helpModal) {
        helpModal.style.display = 'none';
    }
});

// Answer History Management
function loadHistory() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]');
    updateHistoryDisplay(history);
    return history;
}

function saveHistory(history) {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
    updateHistoryDisplay(history);
}

function clearHistory() {
    localStorage.removeItem(STORAGE_KEYS.history);
    updateHistoryDisplay([]);
}

function updateHistoryDisplay(history) {
    historyList.innerHTML = history.map(item => `
        <div class="history-item">
            <span>${item.type}</span>
            <span>${item.result}</span>
        </div>
    `).join('');
}

// Crystal Ball Functions
function getRandomAnswer() {
    return answers[Math.floor(Math.random() * answers.length)];
}

function getRandomFortune() {
    return fortunes[Math.floor(Math.random() * fortunes.length)];
}

function revealAnswer(type, result) {
    // Disable buttons during animation
    askButton.disabled = true;
    fortuneButton.disabled = true;
    
    // Add thinking animation
    crystalBall.classList.add('thinking');
    crystalText.textContent = 'Consulting the stars...';
    
    // Random thinking time between 2 and 4 seconds
    const thinkingTime = Math.random() * 2000 + 2000;
    
    setTimeout(() => {
        // Remove thinking animation and add revealing animation
        crystalBall.classList.remove('thinking');
        crystalBall.classList.add('revealing');
        
        // Update history
        const history = loadHistory();
        history.unshift({
            type: type,
            result: result,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 10 items
        if (history.length > 10) {
            history.pop();
        }
        
        // Update display after animation
        setTimeout(() => {
            crystalText.textContent = result;
            crystalBall.classList.remove('revealing');
            askButton.disabled = false;
            fortuneButton.disabled = false;
            saveHistory(history);
        }, 1000);
    }, thinkingTime);
}

function askQuestion() {
    const answer = getRandomAnswer();
    revealAnswer('Question', answer);
}

function getFortune() {
    const fortune = getRandomFortune();
    revealAnswer('Fortune', fortune);
}

// Event Listeners
askButton.addEventListener('click', askQuestion);
fortuneButton.addEventListener('click', getFortune);
clearHistoryButton.addEventListener('click', clearHistory);
themeToggle.addEventListener('click', toggleTheme);
colorPicker.addEventListener('input', updateColor);
visibilityToggle.addEventListener('click', toggleVisibility);

// Initialize
loadHistory();
loadTheme();
loadColor();
loadVisibility(); 