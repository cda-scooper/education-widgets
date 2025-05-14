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
    theme: `dice-roller-theme-${embedId}`,
    history: `dice-roller-history-${embedId}`,
    color: `dice-roller-color-${embedId}`,
    visibility: `dice-roller-visibility-${embedId}`
};

// DOM Elements
const dieElement = document.getElementById('die');
const dieValueElement = dieElement.querySelector('.die-value');
const dieTypeSelect = document.getElementById('dieType');
const rollButton = document.getElementById('rollButton');
const historyList = document.getElementById('historyList');
const themeToggle = document.querySelector('.theme-toggle');
const helpButton = document.querySelector('.help-button');
const helpModal = document.getElementById('helpModal');
const closeButton = document.querySelector('.close-button');
const clearHistoryButton = document.getElementById('clearHistoryButton');
const colorPicker = document.getElementById('colorPicker');
const visibilityToggle = document.querySelector('.visibility-toggle');

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
    const widget = document.querySelector('.dice-roller-widget');
    widget.classList.toggle('controls-hidden');
    const isHidden = widget.classList.contains('controls-hidden');
    visibilityToggle.innerHTML = `<i class="fas fa-${isHidden ? 'eye-slash' : 'eye'}"></i>`;
    localStorage.setItem(STORAGE_KEYS.visibility, isHidden ? 'hidden' : 'visible');
}

function loadVisibility() {
    const visibility = localStorage.getItem(STORAGE_KEYS.visibility) || 'visible';
    if (visibility === 'hidden') {
        const widget = document.querySelector('.dice-roller-widget');
        widget.classList.add('controls-hidden');
        visibilityToggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
    }
}

// Update die type when changed
function updateDieType() {
    const dieType = dieTypeSelect.value;
    dieElement.setAttribute('data-type', dieType);
    dieValueElement.textContent = dieType;
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

// Roll History Management
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
    historyList.innerHTML = history.map(roll => `
        <div class="history-item">
            <span>d${roll.dieType}</span>
            <span>${roll.value}</span>
        </div>
    `).join('');
}

// Dice Rolling
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollDie() {
    const dieType = parseInt(dieTypeSelect.value);
    const result = getRandomInt(1, dieType);
    
    // Disable button during animation
    rollButton.disabled = true;
    
    // Add rolling animation
    dieElement.classList.add('rolling');
    
    // Update history
    const history = loadHistory();
    history.unshift({
        dieType,
        value: result,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 10 rolls
    if (history.length > 10) {
        history.pop();
    }
    
    // Update display after animation
    setTimeout(() => {
        dieValueElement.textContent = result;
        dieElement.classList.remove('rolling');
        rollButton.disabled = false;
        saveHistory(history);
    }, 1000);
}

// Event Listeners
rollButton.addEventListener('click', rollDie);
clearHistoryButton.addEventListener('click', clearHistory);
themeToggle.addEventListener('click', toggleTheme);
helpButton.addEventListener('click', () => helpModal.style.display = 'block');
closeButton.addEventListener('click', () => helpModal.style.display = 'none');
colorPicker.addEventListener('input', updateColor);
visibilityToggle.addEventListener('click', toggleVisibility);
dieTypeSelect.addEventListener('change', updateDieType);

// Initialize
loadHistory();
loadTheme();
loadColor();
loadVisibility();
updateDieType(); 