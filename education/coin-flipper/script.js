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
    theme: `coin-flipper-theme-${embedId}`,
    color: `coin-flipper-color-${embedId}`,
    visibility: `coin-flipper-visibility-${embedId}`,
    history: `coin-flipper-history-${embedId}`
};

// DOM Elements
const coinElement = document.getElementById('coin');
const coinTypeSelect = document.getElementById('coinType');
const flipButton = document.getElementById('flipButton');
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
    const widget = document.querySelector('.coin-flipper-widget');
    widget.classList.toggle('controls-hidden');
    const isHidden = widget.classList.contains('controls-hidden');
    visibilityToggle.innerHTML = `<i class="fas fa-${isHidden ? 'eye-slash' : 'eye'}"></i>`;
    localStorage.setItem(STORAGE_KEYS.visibility, isHidden ? 'hidden' : 'visible');
}

function loadVisibility() {
    const visibility = localStorage.getItem(STORAGE_KEYS.visibility) || 'visible';
    if (visibility === 'hidden') {
        const widget = document.querySelector('.coin-flipper-widget');
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

// Flip History Management
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
    historyList.innerHTML = history.map(flip => `
        <div class="history-item">
            <span>${flip.type}</span>
            <span>${flip.result}</span>
        </div>
    `).join('');
}

// Coin Flipping
function getRandomResult() {
    return Math.random() < 0.5 ? 'heads' : 'tails';
}

function flipCoin() {
    const flipType = coinTypeSelect.value;
    const result = flipType === 'random' ? getRandomResult() : flipType;
    
    // Disable button during animation
    flipButton.disabled = true;
    
    // Add flipping animation
    coinElement.classList.add('flipping');
    
    // Update history
    const history = loadHistory();
    history.unshift({
        type: flipType,
        result: result,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 10 flips
    if (history.length > 10) {
        history.pop();
    }
    
    // Update display after animation
    setTimeout(() => {
        // Set the data-side attribute to match the result
        coinElement.setAttribute('data-side', result);
        
        // Remove flipping animation
        coinElement.classList.remove('flipping');
        
        // Enable button
        flipButton.disabled = false;
        
        // Save history
        saveHistory(history);
    }, 1000);
}

// Event Listeners
flipButton.addEventListener('click', flipCoin);
clearHistoryButton.addEventListener('click', clearHistory);
themeToggle.addEventListener('click', toggleTheme);
colorPicker.addEventListener('input', updateColor);
visibilityToggle.addEventListener('click', toggleVisibility);

// Initialize
loadHistory();
loadTheme();
loadColor();
loadVisibility(); 