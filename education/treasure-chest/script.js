class TreasureChestWidget {
    constructor() {
        this.state = {
            isOpen: false,
            points: 0,
            theme: 'light',
            color: '#FFD700',
            isVisible: true,
            maxTokens: 10
        };
        this.loadState();
        this.initializeElements();
        this.addEventListeners();
    }

    loadState() {
        const savedState = localStorage.getItem('treasureChestState');
        if (savedState) {
            this.state = { ...this.state, ...JSON.parse(savedState) };
            this.applyState();
        }
    }

    saveState() {
        localStorage.setItem('treasureChestState', JSON.stringify(this.state));
    }

    initializeElements() {
        this.widget = document.querySelector('.treasure-chest-widget');
        this.themeToggle = document.getElementById('themeToggle');
        this.colorPicker = document.getElementById('colorPicker');
        this.visibilityToggle = document.getElementById('visibilityToggle');
        this.helpButton = document.getElementById('helpButton');
        this.helpModal = document.getElementById('helpModal');
        this.settingsButton = document.getElementById('settingsButton');
        this.settingsModal = document.getElementById('settingsModal');
        this.maxTokensInput = document.getElementById('maxTokens');
        this.saveSettingsButton = document.getElementById('saveSettings');
        this.closeButtons = document.querySelectorAll('.close-button');
        this.openChestButton = document.getElementById('openChest');
        this.chest = document.querySelector('.chest');
        this.chestLid = document.querySelector('.chest-lid');
        this.points = document.querySelector('.points');
    }

    addEventListeners() {
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.colorPicker.addEventListener('input', (e) => this.updateColor(e.target.value));
        this.visibilityToggle.addEventListener('click', () => this.toggleVisibility());
        this.helpButton.addEventListener('click', () => this.showHelp());
        this.settingsButton.addEventListener('click', () => this.showSettings());
        this.saveSettingsButton.addEventListener('click', () => this.saveSettings());
        this.closeButtons.forEach(button => {
            button.addEventListener('click', () => this.hideModals());
        });
        this.openChestButton.addEventListener('click', () => this.openChest());
    }

    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        document.body.classList.toggle('dark-theme');
        this.saveState();
    }

    updateColor(color) {
        this.state.color = color;
        document.documentElement.style.setProperty('--primary-color', color);
        this.saveState();
    }

    toggleVisibility() {
        this.state.isVisible = !this.state.isVisible;
        this.widget.classList.toggle('controls-hidden');
        this.saveState();
    }

    showHelp() {
        this.helpModal.style.display = 'flex';
    }

    showSettings() {
        this.maxTokensInput.value = this.state.maxTokens;
        this.settingsModal.style.display = 'flex';
    }

    hideModals() {
        this.helpModal.style.display = 'none';
        this.settingsModal.style.display = 'none';
    }

    saveSettings() {
        const maxTokens = parseInt(this.maxTokensInput.value);
        if (maxTokens >= 1 && maxTokens <= 100) {
            this.state.maxTokens = maxTokens;
            this.saveState();
            this.hideModals();
        } else {
            alert('Please enter a number between 1 and 100');
        }
    }

    openChest() {
        if (!this.state.isOpen) {
            this.state.isOpen = true;
            this.state.points = Math.floor(Math.random() * this.state.maxTokens) + 1;
            
            // Animate chest opening
            this.chest.classList.add('open');
            this.chestLid.classList.add('open');
            
            // Show points after animation
            setTimeout(() => {
                this.points.textContent = this.state.points;
                this.points.classList.add('visible');
            }, 1000);

            // Reset after 3 seconds
            setTimeout(() => {
                this.chest.classList.remove('open');
                this.chestLid.classList.remove('open');
                this.points.classList.remove('visible');
                this.state.isOpen = false;
            }, 3000);
        }
    }

    applyState() {
        // Apply theme
        if (this.state.theme === 'dark') {
            document.body.classList.add('dark-theme');
        }

        // Apply color
        document.documentElement.style.setProperty('--primary-color', this.state.color);
        this.colorPicker.value = this.state.color;

        // Apply visibility
        if (!this.state.isVisible) {
            this.widget.classList.add('controls-hidden');
        }
    }
}

// Initialize the widget when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TreasureChestWidget();
}); 