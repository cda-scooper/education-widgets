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
    theme: `noise-meter-theme-${embedId}`,
    color: `noise-meter-color-${embedId}`,
    visibility: `noise-meter-visibility-${embedId}`,
    history: `noise-meter-history-${embedId}`
};

// DOM Elements
const noiseLevel = document.getElementById('noiseLevel');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const historyList = document.getElementById('historyList');
const themeToggle = document.querySelector('.theme-toggle');
const helpButton = document.querySelector('.help-button');
const helpModal = document.getElementById('helpModal');
const permissionModal = document.getElementById('permissionModal');
const requestPermissionButton = document.getElementById('requestPermissionButton');
const closeButton = document.querySelector('.close-button');
const clearHistoryButton = document.getElementById('clearHistoryButton');
const colorPicker = document.getElementById('colorPicker');
const visibilityToggle = document.querySelector('.visibility-toggle');
const thermometerBulb = document.getElementById('thermometerBulb');
const bulbIcon = document.getElementById('bulbIcon');
const exportHistoryButton = document.getElementById('exportHistoryButton');

// Audio context and analyzer
let audioContext;
let analyser;
let microphone;
let dataArray;
let animationFrame;

// Noise level thresholds (in dB)
const THRESHOLDS = {
    quiet: 30,
    moderate: 50,
    loud: 70
};

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
    const widget = document.querySelector('.noise-meter-widget');
    widget.classList.toggle('controls-hidden');
    const isHidden = widget.classList.contains('controls-hidden');
    visibilityToggle.innerHTML = `<i class="fas fa-${isHidden ? 'eye-slash' : 'eye'}"></i>`;
    localStorage.setItem(STORAGE_KEYS.visibility, isHidden ? 'hidden' : 'visible');
}

function loadVisibility() {
    const visibility = localStorage.getItem(STORAGE_KEYS.visibility) || 'visible';
    if (visibility === 'hidden') {
        const widget = document.querySelector('.noise-meter-widget');
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

// Permission Modal
function showPermissionModal() {
    permissionModal.style.display = 'block';
}

function hidePermissionModal() {
    permissionModal.style.display = 'none';
}

// Noise History Management
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
            <span>${item.level}</span>
            <span>${item.timestamp}</span>
        </div>
    `).join('');
}

function exportHistoryToCSV() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]');
    if (!history.length) return;
    const csvRows = [
        'Noise Level,Timestamp',
        ...history.map(item => `${item.level},${item.timestamp}`)
    ];
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noise-history-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Audio Processing
async function initializeAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        return true;
    } catch (error) {
        console.error('Error accessing microphone:', error);
        return false;
    }
}

function calculateNoiseLevel() {
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate RMS (Root Mean Square) of the frequency data
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    
    // Convert to dB (decibels)
    const db = 20 * Math.log10(rms / 255);
    
    return Math.max(0, Math.min(100, db + 50)); // Normalize to 0-100 range
}

function updateNoiseLevel(level) {
    // Update thermometer fill
    noiseLevel.style.height = `${level}%`;
    // Update color and icon based on level
    if (level < THRESHOLDS.quiet) {
        noiseLevel.style.backgroundColor = 'var(--quiet-color)';
        bulbIcon.textContent = '👍';
    } else if (level < THRESHOLDS.moderate) {
        noiseLevel.style.backgroundColor = 'var(--moderate-color)';
        bulbIcon.textContent = '😟';
    } else {
        noiseLevel.style.backgroundColor = 'var(--loud-color)';
        bulbIcon.textContent = '❗';
    }
    // Add to history if level changes significantly
    const history = loadHistory();
    const lastLevel = history[0]?.level;
    if (!lastLevel || Math.abs(lastLevel - level) > 10) {
        history.unshift({
            level: Math.round(level),
            timestamp: new Date().toLocaleTimeString()
        });
        // Keep only last 10 items
        if (history.length > 10) {
            history.pop();
        }
        saveHistory(history);
    }
}

function startMonitoring() {
    if (!audioContext) {
        showPermissionModal();
        return;
    }
    startButton.disabled = true;
    stopButton.disabled = false;
    thermometerBulb.classList.add('active');
    function update() {
        const level = calculateNoiseLevel();
        updateNoiseLevel(level);
        animationFrame = requestAnimationFrame(update);
    }
    update();
}

function stopMonitoring() {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    startButton.disabled = false;
    stopButton.disabled = true;
    thermometerBulb.classList.remove('active');
}

// Event Listeners
startButton.addEventListener('click', startMonitoring);
stopButton.addEventListener('click', stopMonitoring);
clearHistoryButton.addEventListener('click', clearHistory);
themeToggle.addEventListener('click', toggleTheme);
colorPicker.addEventListener('input', updateColor);
visibilityToggle.addEventListener('click', toggleVisibility);
exportHistoryButton.addEventListener('click', exportHistoryToCSV);

requestPermissionButton.addEventListener('click', async () => {
    const success = await initializeAudio();
    if (success) {
        hidePermissionModal();
        startMonitoring();
    }
});

// Initialize
loadHistory();
loadTheme();
loadColor();
loadVisibility();

// Show permission modal on load
showPermissionModal(); 