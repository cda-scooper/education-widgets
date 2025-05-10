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
  const hourHand = document.getElementById('hour-hand');
  const minuteHand = document.getElementById('minute-hand');
  const secondHand = document.getElementById('second-hand');

  // --- Timer functions ---
  function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update clock hands
    const totalSeconds = timeLeft;
    const totalMinutes = totalSeconds / 60;
    const totalHours = totalMinutes / 60;
    
    const secondDegrees = (totalSeconds % 60) * 6; // 360 degrees / 60 seconds
    const minuteDegrees = (totalMinutes % 60) * 6; // 360 degrees / 60 minutes
    const hourDegrees = (totalHours % 12) * 30; // 360 degrees / 12 hours
    
    secondHand.style.transform = `rotate(${secondDegrees}deg)`;
    minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
    hourHand.style.transform = `rotate(${hourDegrees}deg)`;
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
    localStorage.setItem('timer-theme', theme);
  }
  
  // Load theme from localStorage
  const savedTheme = localStorage.getItem('timer-theme') || 'default';
  themeSelect.value = savedTheme;
  applyTheme(savedTheme);
  
  themeSelect.addEventListener('change', function() {
    applyTheme(this.value);
  });

  // Initialize display
  updateTimerDisplay();
})(); 