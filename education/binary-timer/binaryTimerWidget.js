(function() {
  // --- Timer state ---
  let timerInterval = null;
  let timeLeft = 0;
  let isRunning = false;

  // --- DOM Elements ---
  const startBtn = document.getElementById('start-timer');
  const pauseBtn = document.getElementById('pause-timer');
  const resetBtn = document.getElementById('reset-timer');
  const minutesInput = document.getElementById('minutes');
  const secondsInput = document.getElementById('seconds');
  const timerDisplay = document.getElementById('timer-display');

  // --- Extract ?embed=... from URL, then fallback to data-widget-id, then hostname ---
  const urlParams = new URLSearchParams(window.location.search);
  const urlEmbedId = urlParams.get('embed');
  const widgetId = urlEmbedId || document.getElementById('timer-container')?.getAttribute('data-widget-id') || window.location.hostname;
  const DATA_KEY = `binaryTimerData-${widgetId}`;
  const THEME_KEY = `binaryTimerTheme-${widgetId}`;

  // --- Timer functions ---
  function toBinary(num, bits = 8) {
    return num.toString(2).padStart(bits, '0');
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${toBinary(minutes)}:${toBinary(seconds)}`;
  }

  function startTimer() {
    if (isRunning) return;
    
    if (timeLeft === 0) {
      const minutes = parseInt(minutesInput.value) || 0;
      const seconds = parseInt(secondsInput.value) || 0;
      timeLeft = minutes * 60 + seconds;
    }
    
    if (timeLeft <= 0) return;
    
    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    minutesInput.disabled = true;
    secondsInput.disabled = true;
    
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        minutesInput.disabled = false;
        secondsInput.disabled = false;
        // Play a sound or show notification when timer ends
        new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3').play();
      }
    }, 1000);
  }

  function pauseTimer() {
    if (!isRunning) return;
    
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }

  function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = 0;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    minutesInput.disabled = false;
    secondsInput.disabled = false;
    updateTimerDisplay();
  }

  // --- Event Listeners ---
  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', pauseTimer);
  resetBtn.addEventListener('click', resetTimer);

  // Input validation
  minutesInput.addEventListener('change', function() {
    const value = parseInt(this.value);
    if (value < 0) this.value = 0;
    if (value > 60) this.value = 60;
  });

  secondsInput.addEventListener('change', function() {
    const value = parseInt(this.value);
    if (value < 0) this.value = 0;
    if (value > 59) this.value = 59;
  });

  // --- Hide controls logic ---
  const toggleBtn = document.getElementById('toggle-visibility');
  let controlsVisible = true;
  toggleBtn.addEventListener('click', function() {
    controlsVisible = !controlsVisible;
    document.body.classList.toggle('hide-controls', !controlsVisible);
    toggleBtn.innerHTML = controlsVisible ? '👁️' : '🙈';
  });

  // --- Help modal logic ---
  const helpBtn = document.getElementById('help-btn');
  const helpModal = document.getElementById('help-modal');
  const closeHelpBtn = document.querySelector('.close-help-btn');
  
  helpBtn.addEventListener('click', () => {
    helpModal.style.display = 'block';
  });
  
  closeHelpBtn.addEventListener('click', () => {
    helpModal.style.display = 'none';
  });
  
  window.addEventListener('click', (event) => {
    if (event.target === helpModal) {
      helpModal.style.display = 'none';
    }
  });

  // --- Theme selection logic ---
  const themeSelect = document.getElementById('theme-select');
  function applyTheme(theme) {
    document.body.classList.remove('theme-default', 'theme-blue', 'theme-green', 'theme-purple', 'theme-orange');
    document.body.classList.add('theme-' + theme);
    localStorage.setItem(THEME_KEY, theme);
  }
  
  // Load theme from localStorage
  const savedTheme = localStorage.getItem(THEME_KEY) || 'default';
  themeSelect.value = savedTheme;
  applyTheme(savedTheme);
  
  themeSelect.addEventListener('change', function() {
    applyTheme(this.value);
  });

  // Initialize display
  updateTimerDisplay();
})(); 