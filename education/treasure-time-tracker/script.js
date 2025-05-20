document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const colorPicker = document.getElementById('colorPicker');
    const themeToggle = document.getElementById('themeToggle');
    const visibilityToggle = document.getElementById('visibilityToggle');
    const helpButton = document.getElementById('helpButton');
    const settingsButton = document.getElementById('settingsButton');
    const studentNameInput = document.getElementById('studentName');
    const startReadingButton = document.getElementById('startReading');
    const exportCSVButton = document.getElementById('exportCSV');
    const clearCompletedButton = document.getElementById('clearCompleted');
    const activeReadersList = document.getElementById('activeReaders');
    const completedReadersList = document.getElementById('completedReaders');
    const helpModal = document.getElementById('helpModal');
    const settingsModal = document.getElementById('settingsModal');
    const maxTokensInput = document.getElementById('maxTokens');
    const saveSettingsButton = document.getElementById('saveSettings');
    const chest = document.querySelector('.chest');
    const points = document.querySelector('.points');
    const treasureMessage = document.querySelector('.treasure-message');

    // State
    let activeReaders = new Map(); // Map of student name to start time
    let completedReaders = []; // Array of completed reading sessions
    let settings = {
        maxTokens: 10
    };

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('treasureTimeTrackerSettings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
        maxTokensInput.value = settings.maxTokens;
    }

    // Load completed readers from localStorage
    const savedCompletedReaders = localStorage.getItem('treasureTimeTrackerCompleted');
    if (savedCompletedReaders) {
        completedReaders = JSON.parse(savedCompletedReaders);
    }

    // Theme Management
    const savedTheme = localStorage.getItem('treasureTimeTrackerTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    const savedColor = localStorage.getItem('treasureTimeTrackerColor');
    if (savedColor) {
        document.documentElement.style.setProperty('--primary-color', savedColor);
        colorPicker.value = savedColor;
    }

    // Event Listeners
    colorPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        document.documentElement.style.setProperty('--primary-color', color);
        localStorage.setItem('treasureTimeTrackerColor', color);
    });

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('treasureTimeTrackerTheme', 
            document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });

    visibilityToggle.addEventListener('click', () => {
        document.querySelector('.treasure-time-tracker').classList.toggle('controls-hidden');
    });

    helpButton.addEventListener('click', () => {
        helpModal.style.display = 'flex';
    });

    settingsButton.addEventListener('click', () => {
        settingsModal.style.display = 'flex';
    });

    saveSettingsButton.addEventListener('click', () => {
        settings.maxTokens = parseInt(maxTokensInput.value);
        localStorage.setItem('treasureTimeTrackerSettings', JSON.stringify(settings));
        settingsModal.style.display = 'none';
    });

    startReadingButton.addEventListener('click', () => {
        const studentName = studentNameInput.value.trim();
        if (!studentName) return;

        if (activeReaders.has(studentName)) {
            alert('This student is already reading!');
            return;
        }

        const startTime = Date.now();
        console.log('Starting reading for:', studentName, 'at:', new Date(startTime).toLocaleTimeString());
        activeReaders.set(studentName, startTime);
        updateActiveReadersList();
        studentNameInput.value = '';
    });

    exportCSVButton.addEventListener('click', exportToCSV);

    clearCompletedButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all completed sessions?')) {
            completedReaders = [];
            localStorage.removeItem('treasureTimeTrackerCompleted');
            updateCompletedReadersList();
        }
    });

    // Close modals when clicking the close button or outside the modal
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Functions
    function updateActiveReadersList() {
        activeReadersList.innerHTML = '';
        activeReaders.forEach((startTime, name) => {
            const readerItem = createReaderItem(name, startTime, true);
            activeReadersList.appendChild(readerItem);
        });
    }

    function updateCompletedReadersList() {
        completedReadersList.innerHTML = '';
        completedReaders.forEach(session => {
            const readerItem = createReaderItem(session.name, session.startTime, false, session.duration);
            completedReadersList.appendChild(readerItem);
        });
    }

    function createReaderItem(name, startTime, isActive, duration = null) {
        const readerItem = document.createElement('div');
        readerItem.className = 'reader-item';

        const readerInfo = document.createElement('div');
        readerInfo.className = 'reader-info';

        const nameElement = document.createElement('div');
        nameElement.className = 'reader-name';
        nameElement.textContent = name;

        const timeElement = document.createElement('div');
        timeElement.className = 'reader-time';
        
        if (isActive) {
            const startDate = new Date(startTime);
            timeElement.textContent = 'Started: ' + startDate.toLocaleTimeString();
        } else {
            const minutes = Math.floor(duration / 60000);
            timeElement.textContent = `Duration: ${minutes} minutes`;
        }

        readerInfo.appendChild(nameElement);
        readerInfo.appendChild(timeElement);

        const actions = document.createElement('div');
        actions.className = 'reader-actions';

        if (isActive) {
            const stopButton = document.createElement('button');
            stopButton.className = 'action-button';
            stopButton.textContent = 'Stop';
            stopButton.onclick = () => {
                console.log('Stop button clicked for:', name);
                stopReading(name, startTime);
            };
            actions.appendChild(stopButton);
        }

        readerItem.appendChild(readerInfo);
        readerItem.appendChild(actions);

        return readerItem;
    }

    function stopReading(name, startTime) {
        console.log('stopReading called for:', name);
        console.log('Start time:', new Date(startTime).toLocaleTimeString());
        
        const endTime = Date.now();
        console.log('End time:', new Date(endTime).toLocaleTimeString());
        
        const duration = endTime - startTime;
        const minutes = Math.floor(duration / 60000);

        console.log('Reading duration:', minutes, 'minutes');

        activeReaders.delete(name);
        const session = {
            name,
            startTime,
            endTime,
            duration
        };
        completedReaders.push(session);
        
        // Save to localStorage
        localStorage.setItem('treasureTimeTrackerCompleted', JSON.stringify(completedReaders));

        updateActiveReadersList();
        updateCompletedReadersList();
        showTreasureChest(name, minutes);
    }

    function showTreasureChest(studentName, minutes) {
        console.log('Showing treasure chest for:', studentName);
        const randomPoints = Math.floor(Math.random() * settings.maxTokens) + 1;
        
        points.textContent = randomPoints;
        treasureMessage.textContent = `${studentName} earned ${randomPoints} points for reading ${minutes} minutes!`;

        // Reset any existing animations
        chest.classList.remove('open');
        points.classList.remove('visible');
        
        // Force a reflow
        void chest.offsetWidth;
        
        // Add the animation classes
        chest.classList.add('open');
        points.classList.add('visible');

        setTimeout(() => {
            chest.classList.remove('open');
            points.classList.remove('visible');
        }, 3000);
    }

    function exportToCSV() {
        const headers = ['Student Name', 'Start Time', 'End Time', 'Duration (minutes)'];
        const rows = completedReaders.map(session => [
            session.name,
            new Date(session.startTime).toLocaleString(),
            new Date(session.endTime).toLocaleString(),
            Math.floor(session.duration / 60000)
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `reading_times_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Initialize
    updateActiveReadersList();
    updateCompletedReadersList();
}); 