// Hieroglyphic Timer Widget
document.addEventListener('DOMContentLoaded', function() {
  const timerDisplay = document.getElementById('timer-display');
  const startBtn = document.getElementById('start-timer');
  const pauseBtn = document.getElementById('pause-timer');
  const resetBtn = document.getElementById('reset-timer');
  const minutesInput = document.getElementById('minutes');
  const secondsInput = document.getElementById('seconds');
  const themeSelect = document.getElementById('theme-select');
  const helpBtn = document.getElementById('help-btn');
  const helpModal = document.getElementById('help-modal');
  const closeHelpBtn = document.getElementById('close-help-btn');
  const hideControlsBtn = document.getElementById('toggle-visibility');
  const timerContainer = document.getElementById('timer-container');

  let timerInterval;
  let timeLeft = 0;
  let isRunning = false;

  // Extract ?embed=... from URL, then fallback to data-widget-id, then hostname
  const urlParams = new URLSearchParams(window.location.search);
  const urlEmbedId = urlParams.get('embed');
  const widgetId = urlEmbedId || document.getElementById('timer-container')?.getAttribute('data-widget-id') || window.location.hostname;
  const DATA_KEY = `hieroglyphicTimerData-${widgetId}`;
  const THEME_KEY = `hieroglyphicTimerTheme-${widgetId}`;

  // Hieroglyphic mapping for digits 0-9
  const hieroglyphics = {
    0: '𓄿', // Egyptian hieroglyph for zero
    1: '𓂀', // Eye of Horus
    2: '𓃭', // Lion
    3: '𓅓', // Owl
    4: '𓆏', // Frog
    5: '𓆣', // Turtle
    6: '𓆤', // Snake
    7: '𓆥', // Fish
    8: '𓆦', // Bird
    9: '𓆧'  // Bee
  };

  // Convert number to hieroglyphics
  function numberToHieroglyphics(num) {
    return num.toString().padStart(2, '0').split('').map(digit => hieroglyphics[digit]).join(' ');
  }

  // Update timer display
  function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${numberToHieroglyphics(minutes)} : ${numberToHieroglyphics(seconds)}`;
  }

  // Start timer
  function startTimer() {
    if (!isRunning && timeLeft > 0) {
      isRunning = true;
      startBtn.disabled = true;
      pauseBtn.disabled = false;
      timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          isRunning = false;
          startBtn.disabled = false;
          pauseBtn.disabled = true;
          // Play sound when timer ends
          const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
          audio.play();
        }
      }, 1000);
    }
  }

  // Pause timer
  function pauseTimer() {
    if (isRunning) {
      clearInterval(timerInterval);
      isRunning = false;
      startBtn.disabled = false;
      pauseBtn.disabled = true;
    }
  }

  // Reset timer
  function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = 0;
    updateDisplay();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }

  // Set timer from input
  function setTimer() {
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    timeLeft = minutes * 60 + seconds;
    updateDisplay();
  }

  // Theme handling
  function setTheme(theme) {
    timerContainer.className = `theme-${theme}`;
    localStorage.setItem(THEME_KEY, theme);
  }

  // Load saved theme
  const savedTheme = localStorage.getItem(THEME_KEY) || 'default';
  setTheme(savedTheme);
  themeSelect.value = savedTheme;

  // Event listeners
  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', pauseTimer);
  resetBtn.addEventListener('click', resetTimer);
  minutesInput.addEventListener('change', setTimer);
  secondsInput.addEventListener('change', setTimer);
  themeSelect.addEventListener('change', (e) => setTheme(e.target.value));
  helpBtn.addEventListener('click', () => helpModal.style.display = 'block');
  closeHelpBtn.addEventListener('click', () => helpModal.style.display = 'none');
  hideControlsBtn.addEventListener('click', () => timerContainer.classList.toggle('hide-controls'));

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      helpModal.style.display = 'none';
    }
  });

  // Input validation
  function validateInput(input) {
    const value = parseInt(input.value);
    if (isNaN(value) || value < 0) {
      input.value = 0;
    } else if (input === minutesInput && value > 60) {
      input.value = 60;
    } else if (input === secondsInput && value > 59) {
      input.value = 59;
    }
  }

  minutesInput.addEventListener('input', () => validateInput(minutesInput));
  secondsInput.addEventListener('input', () => validateInput(secondsInput));

  // Initialize display and set initial time
  setTimer();
  updateDisplay();
}); 