// Point Tracker Widget
document.addEventListener('DOMContentLoaded', function() {
  const trackerContainer = document.getElementById('tracker-container');
  const teamsList = document.getElementById('teams-list');
  const addTeamBtn = document.getElementById('add-team-btn');
  const pointInterval = document.getElementById('point-interval');
  const themeSelect = document.getElementById('theme-select');
  const helpBtn = document.getElementById('help-btn');
  const helpModal = document.getElementById('help-modal');
  const closeHelpBtn = document.getElementById('close-help-btn');
  const hideControlsBtn = document.getElementById('toggle-visibility');

  let teams = [];
  let teamCounter = 1;

  // Common emojis for team selection
  const commonEmojis = [
    '🏆', '🌟', '⚡', '🔥', '💫', '🎯', '🎨', '🎭', '🎪', '🎮',
    '🏀', '⚽', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸',
    '🦁', '🐯', '🐼', '🐨', '🦊', '🦒', '🦘', '🦛', '🦏', '🦍'
  ];

  // Create a new team
  function createTeam() {
    const team = {
      id: teamCounter++,
      name: `Team ${teamCounter}`,
      emoji: commonEmojis[Math.floor(Math.random() * commonEmojis.length)],
      points: 0
    };
    teams.push(team);
    renderTeams();
    saveTeams();
  }

  // Render all teams
  function renderTeams() {
    teamsList.innerHTML = '';
    teams.forEach(team => {
      const teamCard = document.createElement('div');
      teamCard.className = 'team-card';
      teamCard.innerHTML = `
        <span class="team-emoji" data-team-id="${team.id}">${team.emoji}</span>
        <span class="team-name" contenteditable="true" data-team-id="${team.id}">${team.name}</span>
        <span class="team-points" data-team-id="${team.id}">${team.points}</span>
        <button class="point-btn" data-team-id="${team.id}" data-action="subtract">➖</button>
        <button class="point-btn" data-team-id="${team.id}" data-action="add">➕</button>
        <button class="remove-btn" data-team-id="${team.id}" title="Remove Team">🗑️</button>
      `;
      teamsList.appendChild(teamCard);
    });

    // Add event listeners for point buttons
    document.querySelectorAll('.point-btn').forEach(btn => {
      btn.addEventListener('click', handlePointChange);
    });

    // Add event listeners for emoji clicks
    document.querySelectorAll('.team-emoji').forEach(emoji => {
      emoji.addEventListener('click', handleEmojiClick);
    });

    // Add event listeners for team name editing
    document.querySelectorAll('.team-name').forEach(name => {
      name.addEventListener('blur', handleNameChange);
    });

    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', handleRemoveTeam);
    });
  }

  // Handle point changes
  function handlePointChange(e) {
    const teamId = parseInt(e.target.dataset.teamId);
    const action = e.target.dataset.action;
    const interval = parseInt(pointInterval.value);
    const team = teams.find(t => t.id === teamId);
    
    if (team) {
      if (action === 'add') {
        team.points += interval;
      } else {
        team.points = Math.max(0, team.points - interval);
      }
      renderTeams();
      saveTeams();
    }
  }

  // Handle emoji click
  function handleEmojiClick(e) {
    const teamId = parseInt(e.target.dataset.teamId);
    const team = teams.find(t => t.id === teamId);
    
    if (team) {
      const currentIndex = commonEmojis.indexOf(team.emoji);
      const nextIndex = (currentIndex + 1) % commonEmojis.length;
      team.emoji = commonEmojis[nextIndex];
      renderTeams();
      saveTeams();
    }
  }

  // Handle team name change
  function handleNameChange(e) {
    const teamId = parseInt(e.target.dataset.teamId);
    const team = teams.find(t => t.id === teamId);
    
    if (team) {
      team.name = e.target.textContent.trim() || `Team ${teamId}`;
      renderTeams();
      saveTeams();
    }
  }

  // Remove team handler
  function handleRemoveTeam(e) {
    const teamId = parseInt(e.target.dataset.teamId);
    teams = teams.filter(t => t.id !== teamId);
    renderTeams();
    saveTeams();
  }

  // Save teams to localStorage
  function saveTeams() {
    localStorage.setItem('pointTrackerTeams', JSON.stringify(teams));
  }

  // Load teams from localStorage
  function loadTeams() {
    const savedTeams = localStorage.getItem('pointTrackerTeams');
    if (savedTeams) {
      teams = JSON.parse(savedTeams);
      teamCounter = Math.max(...teams.map(t => t.id)) + 1;
      renderTeams();
    }
  }

  // Theme handling
  function setTheme(theme) {
    // Remove all existing theme classes
    trackerContainer.classList.remove('theme-default', 'theme-blue', 'theme-green', 'theme-purple', 'theme-orange');
    // Add the new theme class
    trackerContainer.classList.add(`theme-${theme}`);
    localStorage.setItem('pointTrackerTheme', theme);
  }

  // Load saved theme
  const savedTheme = localStorage.getItem('pointTrackerTheme') || 'default';
  setTheme(savedTheme);
  themeSelect.value = savedTheme;

  // Event listeners
  addTeamBtn.addEventListener('click', createTeam);
  themeSelect.addEventListener('change', (e) => setTheme(e.target.value));
  helpBtn.addEventListener('click', () => helpModal.style.display = 'block');
  closeHelpBtn.addEventListener('click', () => helpModal.style.display = 'none');
  hideControlsBtn.addEventListener('click', () => trackerContainer.classList.toggle('hide-controls'));

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      helpModal.style.display = 'none';
    }
  });

  // Initialize
  loadTeams();
}); 