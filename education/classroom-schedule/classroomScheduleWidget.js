(function() {
  // Extract ?embed=... from URL, then fallback to data-widget-id, then hostname
  const urlParams = new URLSearchParams(window.location.search);
  const urlEmbedId = urlParams.get('embed');
  const widgetId = urlEmbedId || document.getElementById('schedule-container')?.getAttribute('data-widget-id') || window.location.hostname;
  const DATA_KEY = `classroomScheduleData-${widgetId}`;
  const THEME_KEY = `classroomScheduleTheme-${widgetId}`;

  // --- Persistence helpers ---
  function loadSchedule() {
    const stored = localStorage.getItem(DATA_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  function saveSchedule(items) {
    localStorage.setItem(DATA_KEY, JSON.stringify(items));
  }

  // --- Render schedule list ---
  function renderSchedule(items) {
    const list = document.getElementById('schedule-list');
    list.innerHTML = '';
    if (!items.length) {
      list.innerHTML = '<div style="padding: 24px; text-align: center; color: #888;">No schedule items yet.</div>';
      return;
    }
    items.sort((a, b) => a.time.localeCompare(b.time));
    items.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'schedule-item';
      div.innerHTML = `
        <span class="schedule-time">${item.time}</span>
        <span class="schedule-emoji">${item.emoji || ''}</span>
        <span class="schedule-task">${item.task}</span>
        <button class="delete-schedule-btn" data-idx="${idx}" title="Delete">🗑️</button>
      `;
      list.appendChild(div);
    });
    // Delete logic
    list.querySelectorAll('.delete-schedule-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const idx = parseInt(this.getAttribute('data-idx'));
        items.splice(idx, 1);
        saveSchedule(items);
        renderSchedule(items);
        e.stopPropagation();
      });
    });
  }

  // --- Modal logic ---
  const addBtn = document.getElementById('add-schedule-btn');
  const modal = document.getElementById('schedule-modal');
  const closeBtn = document.querySelector('.close-btn');
  const saveBtn = document.getElementById('save-schedule-btn');
  const timeInput = document.getElementById('schedule-time');
  const taskInput = document.getElementById('schedule-task');
  const emojiInput = document.getElementById('schedule-emoji');
  const emojiPicker = document.getElementById('emoji-picker');

  let schedule = loadSchedule();
  renderSchedule(schedule);

  addBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    timeInput.value = '';
    taskInput.value = '';
    emojiInput.value = '';
  });
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
  emojiPicker.addEventListener('emoji-click', event => {
    emojiInput.value = event.detail.unicode;
  });
  saveBtn.addEventListener('click', () => {
    const time = timeInput.value;
    const task = taskInput.value.trim();
    const emoji = emojiInput.value.trim();
    if (!time || !task) return;
    schedule.push({ time, task, emoji });
    saveSchedule(schedule);
    renderSchedule(schedule);
    modal.style.display = 'none';
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
})(); 