// Student Progress Tracker Widget

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const container = document.getElementById('progress-tracker-container');
  const goalsList = document.getElementById('goals-list');
  const goalInput = document.getElementById('goal-input');
  const addGoalBtn = document.getElementById('add-goal-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const themeSelect = document.getElementById('theme-select');
  const helpBtn = document.getElementById('help-btn');
  const helpModal = document.getElementById('help-modal');
  const closeHelpBtn = document.getElementById('close-help-btn');
  const hideControlsBtn = document.getElementById('toggle-visibility');

  // Extract ?embed=... from URL, then fallback to data-widget-id, then hostname
  const urlParams = new URLSearchParams(window.location.search);
  const urlEmbedId = urlParams.get('embed');
  const widgetId = urlEmbedId || container.getAttribute('data-widget-id') || window.location.hostname;
  const DATA_KEY = `studentProgressData-${widgetId}`;
  const THEME_KEY = `studentProgressTheme-${widgetId}`;

  // Data structure
  let data = [];

  // Load from localStorage
  function loadData() {
    const saved = localStorage.getItem(DATA_KEY);
    if (saved) {
      data = JSON.parse(saved);
    }
  }

  // Save to localStorage
  function saveData() {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }

  // Render all goals, objectives, and students
  function render() {
    goalsList.innerHTML = '';
    data.forEach((goal, goalIdx) => {
      const goalBlock = document.createElement('div');
      goalBlock.className = 'goal-block';
      goalBlock.innerHTML = `
        <div class="goal-title">
          <span>${goal.text}</span>
          <button class="remove-btn" title="Remove Goal" data-goal-idx="${goalIdx}">🗑️</button>
        </div>
        <div class="objective-controls">
          <input type="text" class="tracker-input objective-input" placeholder="Add objective..." data-goal-idx="${goalIdx}">
          <button class="tracker-btn add-objective-btn" data-goal-idx="${goalIdx}">➕ Add Objective</button>
        </div>
        <div class="objectives-list"></div>
      `;
      // Render objectives
      const objectivesList = goalBlock.querySelector('.objectives-list');
      goal.objectives.forEach((obj, objIdx) => {
        const objBlock = document.createElement('div');
        objBlock.className = 'objective-block';
        objBlock.innerHTML = `
          <div class="objective-title">
            <span>${obj.text}</span>
            <button class="remove-btn" title="Remove Objective" data-goal-idx="${goalIdx}" data-obj-idx="${objIdx}">🗑️</button>
          </div>
          <div class="student-controls">
            <input type="text" class="tracker-input student-input" placeholder="Add student..." data-goal-idx="${goalIdx}" data-obj-idx="${objIdx}">
            <button class="tracker-btn add-student-btn" data-goal-idx="${goalIdx}" data-obj-idx="${objIdx}">➕ Add Student</button>
          </div>
          <table class="student-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Assessment</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        `;
        // Render students
        const tbody = objBlock.querySelector('tbody');
        obj.students.forEach((student, stuIdx) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><input type="text" class="student-name-input" value="${student.name}" data-goal-idx="${goalIdx}" data-obj-idx="${objIdx}" data-stu-idx="${stuIdx}"></td>
            <td>
              <select class="assessment-select" data-goal-idx="${goalIdx}" data-obj-idx="${objIdx}" data-stu-idx="${stuIdx}">
                <option value="Meets Objective" ${student.assessment === 'Meets Objective' ? 'selected' : ''}>Meets Objective</option>
                <option value="Does Not Meet Objective" ${student.assessment === 'Does Not Meet Objective' ? 'selected' : ''}>Does Not Meet Objective</option>
                <option value="Prompted" ${student.assessment === 'Prompted' ? 'selected' : ''}>Prompted</option>
              </select>
            </td>
            <td><textarea class="notes-area" data-goal-idx="${goalIdx}" data-obj-idx="${objIdx}" data-stu-idx="${stuIdx}">${student.notes || ''}</textarea></td>
            <td><button class="remove-btn" title="Remove Student" data-goal-idx="${goalIdx}" data-obj-idx="${objIdx}" data-stu-idx="${stuIdx}">🗑️</button></td>
          `;
          tbody.appendChild(tr);
        });
        objectivesList.appendChild(objBlock);
      });
      goalsList.appendChild(goalBlock);
    });
  }

  // Add event listeners after rendering
  function addEventListeners() {
    // Remove goal
    document.querySelectorAll('.goal-block .remove-btn[title="Remove Goal"]').forEach(btn => {
      btn.addEventListener('click', function() {
        const goalIdx = parseInt(btn.dataset.goalIdx);
        data.splice(goalIdx, 1);
        saveData();
        renderAll();
      });
    });
    // Add objective
    document.querySelectorAll('.add-objective-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const goalIdx = parseInt(btn.dataset.goalIdx);
        const input = btn.parentElement.querySelector('.objective-input');
        const value = input.value.trim();
        if (value) {
          data[goalIdx].objectives.push({ text: value, students: [] });
          input.value = '';
          saveData();
          renderAll();
        }
      });
    });
    // Remove objective
    document.querySelectorAll('.objective-block .remove-btn[title="Remove Objective"]').forEach(btn => {
      btn.addEventListener('click', function() {
        const goalIdx = parseInt(btn.dataset.goalIdx);
        const objIdx = parseInt(btn.dataset.objIdx);
        data[goalIdx].objectives.splice(objIdx, 1);
        saveData();
        renderAll();
      });
    });
    // Add student
    document.querySelectorAll('.add-student-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const goalIdx = parseInt(btn.dataset.goalIdx);
        const objIdx = parseInt(btn.dataset.objIdx);
        const input = btn.parentElement.querySelector('.student-input');
        const value = input.value.trim();
        if (value) {
          data[goalIdx].objectives[objIdx].students.push({ name: value, assessment: 'Meets Objective', notes: '' });
          input.value = '';
          saveData();
          renderAll();
        }
      });
    });
    // Remove student
    document.querySelectorAll('.student-table .remove-btn[title="Remove Student"]').forEach(btn => {
      btn.addEventListener('click', function() {
        const goalIdx = parseInt(btn.dataset.goalIdx);
        const objIdx = parseInt(btn.dataset.objIdx);
        const stuIdx = parseInt(btn.dataset.stuIdx);
        data[goalIdx].objectives[objIdx].students.splice(stuIdx, 1);
        saveData();
        renderAll();
      });
    });
    // Edit student name
    document.querySelectorAll('.student-name-input').forEach(input => {
      input.addEventListener('input', function() {
        const goalIdx = parseInt(input.dataset.goalIdx);
        const objIdx = parseInt(input.dataset.objIdx);
        const stuIdx = parseInt(input.dataset.stuIdx);
        data[goalIdx].objectives[objIdx].students[stuIdx].name = input.value;
        saveData();
      });
    });
    // Edit assessment
    document.querySelectorAll('.assessment-select').forEach(select => {
      select.addEventListener('change', function() {
        const goalIdx = parseInt(select.dataset.goalIdx);
        const objIdx = parseInt(select.dataset.objIdx);
        const stuIdx = parseInt(select.dataset.stuIdx);
        data[goalIdx].objectives[objIdx].students[stuIdx].assessment = select.value;
        saveData();
      });
    });
    // Edit notes
    document.querySelectorAll('.notes-area').forEach(area => {
      area.addEventListener('input', function() {
        const goalIdx = parseInt(area.dataset.goalIdx);
        const objIdx = parseInt(area.dataset.objIdx);
        const stuIdx = parseInt(area.dataset.stuIdx);
        data[goalIdx].objectives[objIdx].students[stuIdx].notes = area.value;
        saveData();
      });
    });
  }

  // Render and add listeners
  function renderAll() {
    render();
    addEventListeners();
  }

  // Add goal
  addGoalBtn.addEventListener('click', function() {
    const value = goalInput.value.trim();
    if (value) {
      data.push({ text: value, objectives: [] });
      goalInput.value = '';
      saveData();
      renderAll();
    }
  });

  // Theme handling
  function setTheme(theme) {
    container.classList.remove('theme-default', 'theme-blue', 'theme-green', 'theme-purple', 'theme-orange');
    container.classList.add(`theme-${theme}`);
    localStorage.setItem(THEME_KEY, theme);
  }
  // Load saved theme
  const savedTheme = localStorage.getItem(THEME_KEY) || 'default';
  setTheme(savedTheme);
  themeSelect.value = savedTheme;
  themeSelect.addEventListener('change', (e) => setTheme(e.target.value));

  // Hide controls
  hideControlsBtn.addEventListener('click', () => container.classList.toggle('hide-controls'));

  // Help modal
  helpBtn.addEventListener('click', () => helpModal.style.display = 'block');
  closeHelpBtn.addEventListener('click', () => helpModal.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === helpModal) helpModal.style.display = 'none';
  });

  // Export CSV
  exportCsvBtn.addEventListener('click', function() {
    const rows = [['Goal', 'Objective', 'Student', 'Assessment', 'Notes']];
    data.forEach(goal => {
      goal.objectives.forEach(obj => {
        obj.students.forEach(stu => {
          rows.push([
            goal.text,
            obj.text,
            stu.name,
            stu.assessment,
            (stu.notes || '').replace(/\r?\n/g, ' ')
          ]);
        });
      });
    });
    const csv = rows.map(row => row.map(cell => '"' + (cell || '').replace(/"/g, '""') + '"').join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_progress.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  });

  // Initial load
  loadData();
  renderAll();
}); 