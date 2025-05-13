(function() {
  // const events = [
  //   { date: '2023-11-01', description: 'Math Test', emoji: '📝' },
  //   { date: '2023-11-10', description: 'Science Project Due', emoji: '🔬' },
  //   { date: '2023-11-15', description: 'John\'s Birthday', emoji: '🎂' },
  //   { date: '2023-11-20', description: 'Field Trip', emoji: '🚌' },
  //   { d)ate: '2023-11-25', description: 'Thanksgiving Break', emoji: '🦃' }
  // ];

  // --- Calendar rendering helpers ---
  function getMonthDays(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }
  function getFirstDayOfWeek(year, month) {
    return new Date(year, month, 1).getDay();
  }
  function getWeekDates(date) {
    const day = date.getDay();
    const start = new Date(date);
    start.setDate(date.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }

  function renderCalendarGrid(events, view) {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    const today = new Date();
    let days = [];
    if (view === '7') {
      days = getWeekDates(today);
    } else {
      const year = today.getFullYear();
      const month = today.getMonth();
      const numDays = getMonthDays(year, month);
      const firstDay = getFirstDayOfWeek(year, month);
      days = Array.from({ length: firstDay + numDays }, (_, i) => {
        if (i < firstDay) return null;
        return new Date(year, month, i - firstDay + 1);
      });
    }
    // Render header
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const header = document.createElement('div');
    header.style.display = 'grid';
    header.style.gridTemplateColumns = 'repeat(7, 1fr)';
    daysOfWeek.forEach(d => {
      const cell = document.createElement('div');
      cell.textContent = d;
      cell.style.fontWeight = 'bold';
      cell.style.textAlign = 'center';
      header.appendChild(cell);
    });
    grid.appendChild(header);
    // Render days
    const gridContainer = document.createElement('div');
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = 'repeat(7, 1fr)';
    days.forEach((date, i) => {
      const cell = document.createElement('div');
      cell.style.border = '1px solid #eee';
      cell.style.minHeight = '60px';
      cell.style.padding = '4px';
      cell.style.textAlign = 'center';
      if (date) {
        const dateStr = date.toISOString().split('T')[0];
        cell.innerHTML = `<div style=\"font-size:0.9em;\">${date.getDate()}</div>`;
        const event = events.find(e => e.date === dateStr);
        if (event) {
          cell.innerHTML += `<div style=\"font-size:1.5em;\">${event.emoji}</div><div style=\"font-size:0.8em;\">${event.description}</div><button class='delete-event-btn' data-date='${event.date}' style='background:none;border:none;cursor:pointer;font-size:1.2em;' title='Delete Event'>🗑️</button>`;
        }
        if (dateStr === new Date().toISOString().split('T')[0]) {
          cell.style.background = '#e0f7fa';
        }
      }
      gridContainer.appendChild(cell);
    });
    grid.appendChild(gridContainer);

    // Add event listeners for delete buttons
    grid.querySelectorAll('.delete-event-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const dateToDelete = this.getAttribute('data-date');
        events = events.filter(ev => ev.date !== dateToDelete);
        saveEvents(events);
        renderCalendarGrid(events, view);
        e.stopPropagation();
      });
    });
  }

  // --- Event persistence and UI logic ---
  const defaultEvents = [
    { date: '2023-11-01', description: 'Math Test', emoji: '📝' },
    { date: '2023-11-10', description: 'Science Project Due', emoji: '🔬' },
    { date: '2023-11-15', description: 'John\'s Birthday', emoji: '🎂' },
    { date: '2023-11-20', description: 'Field Trip', emoji: '🚌' },
    { date: '2023-11-25', description: 'Thanksgiving Break', emoji: '🦃' }
  ];

  const loadEvents = () => {
    const storedEvents = localStorage.getItem(DATA_KEY);
    return storedEvents ? JSON.parse(storedEvents) : defaultEvents.slice();
  };

  const saveEvents = (events) => {
    localStorage.setItem(DATA_KEY, JSON.stringify(events));
  };

  let events = loadEvents();
  let currentView = '7';
  renderCalendarGrid(events, currentView);

  document.getElementById('view-7').onclick = function() {
    currentView = '7';
    renderCalendarGrid(events, currentView);
  };
  document.getElementById('view-30').onclick = function() {
    currentView = '30';
    renderCalendarGrid(events, currentView);
  };

  // Modal logic
  const addEventBtn = document.getElementById('add-event-btn');
  const eventModal = document.getElementById('event-modal');
  const closeBtn = document.querySelector('.close-btn');
  const saveEventBtn = document.getElementById('save-event-btn');

  addEventBtn.addEventListener('click', () => {
    eventModal.style.display = 'block';
  });

  closeBtn.addEventListener('click', () => {
    eventModal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target === eventModal) {
      eventModal.style.display = 'none';
    }
  });

  saveEventBtn.addEventListener('click', () => {
    const date = document.getElementById('event-date').value;
    const description = document.getElementById('event-description').value;
    const emoji = document.getElementById('event-emoji').value;
    if (date && description && emoji) {
      events.push({ date, description, emoji });
      saveEvents(events);
      renderCalendarGrid(events, currentView);
      eventModal.style.display = 'none';
    }
  });

  // --- Toggle controls visibility ---
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

  const emojiInput = document.getElementById('event-emoji');
  const emojiPicker = document.getElementById('emoji-picker');
  emojiPicker.addEventListener('emoji-click', event => {
    emojiInput.value = event.detail.unicode;
  });

  // Extract ?embed=... from URL, then fallback to data-widget-id, then hostname
  const urlParams = new URLSearchParams(window.location.search);
  const urlEmbedId = urlParams.get('embed');
  const widgetId = urlEmbedId || document.getElementById('calendar-container')?.getAttribute('data-widget-id') || window.location.hostname;
  const DATA_KEY = `classroomCalendarData-${widgetId}`;
  const THEME_KEY = `classroomCalendarTheme-${widgetId}`;
})(); 