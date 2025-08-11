// options.js - Settings page functionality

class OptionsManager {
    constructor() {
        this.archetypes = [
            { id: 'hero', name: 'Hero', description: 'Brave, determined, triumphant' },
            { id: 'sage', name: 'Sage', description: 'Wise, knowledgeable, truthful' },
            { id: 'explorer', name: 'Explorer', description: 'Free, adventurous, pioneering' },
            { id: 'innocent', name: 'Innocent', description: 'Pure, simple, optimistic' },
            { id: 'ruler', name: 'Ruler', description: 'Authoritative, luxury, prestige' },
            { id: 'creator', name: 'Creator', description: 'Artistic, imaginative, innovative' },
            { id: 'caregiver', name: 'Caregiver', description: 'Caring, nurturing, protective' },
            { id: 'magician', name: 'Magician', description: 'Transformative, visionary, charismatic' },
            { id: 'lover', name: 'Lover', description: 'Passionate, intimate, committed' },
            { id: 'jester', name: 'Jester', description: 'Fun, playful, lighthearted' },
            { id: 'everyman', name: 'Everyman', description: 'Relatable, authentic, friendly' },
            { id: 'rebel', name: 'Rebel', description: 'Revolutionary, disruptive, bold' }
        ];
        
        this.defaultSettings = {
            apiKey: '',
            aiModel: 'gemini-2.0-flash-exp',
            autoAnalysis: true,
            mouseoverAnalysis: true,
            sensitivity: 3,
            analysisDepth: 'standard',
            selectedArchetypes: ['hero', 'sage', 'explorer'],
            showScoreboard: true,
            showNotifications: true,
            panelPosition: 'top-right',
            panelTheme: 'light',
            customPrompt: '',
            enableCaching: true,
            cacheDuration: 24
        };

        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.renderArchetypes();
        await this.loadSettings();
        this.updateRangeValues();
    }

    setupEventListeners() {
        // Save button
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
        
        // Reset button
        document.getElementById('resetSettings').addEventListener('click', () => this.resetSettings());
        
        // Test connection button
        document.getElementById('testConnection').addEventListener('click', () => this.testConnection());
        
        // API key input
        document.getElementById('apiKey').addEventListener('input', () => this.validateApiKey());
        
        // Range inputs
        document.getElementById('sensitivity').addEventListener('input', (e) => {
            document.getElementById('sensitivityValue').textContent = e.target.value;
        });
        
        document.getElementById('cacheDuration').addEventListener('input', (e) => {
            const hours = parseInt(e.target.value);
            const label = hours === 1 ? '1h' : 
                         hours < 24 ? `${hours}h` : 
                         hours === 24 ? '1d' : 
                         hours < 168 ? `${Math.round(hours/24)}d` : '1w';
            document.getElementById('cacheDurationValue').textContent = label;
        });

        // Auto-save on changes
        this.setupAutoSave();
    }

    setupAutoSave() {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.id !== 'apiKey') { // Don't auto-save API key for security
                input.addEventListener('change', () => {
                    this.saveSettings(false); // Silent save
                });
            }
        });
    }

    renderArchetypes() {
        const grid = document.getElementById('archetypeGrid');
        grid.innerHTML = this.archetypes.map(archetype => `
            <div class="archetype-card" data-archetype="${archetype.id}">
                <div class="archetype-name">${archetype.name}</div>
                <div class="archetype-description">${archetype.description}</div>
            </div>
        `).join('');

        // Add click handlers
        grid.addEventListener('click', (e) => {
            const card = e.target.closest('.archetype-card');
            if (card) {
                card.classList.toggle('selected');
                this.saveSettings(false); // Silent save
            }
        });
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(this.defaultSettings);
            const settings = { ...this.defaultSettings, ...result };

            // Populate form fields
            document.getElementById('apiKey').value = settings.apiKey || '';
            document.getElementById('aiModel').value = settings.aiModel;
            document.getElementById('autoAnalysis').checked = settings.autoAnalysis;
            document.getElementById('mouseoverAnalysis').checked = settings.mouseoverAnalysis;
            document.getElementById('sensitivity').value = settings.sensitivity;
            document.getElementById('analysisDepth').value = settings.analysisDepth;
            document.getElementById('showScoreboard').checked = settings.showScoreboard;
            document.getElementById('showNotifications').checked = settings.showNotifications;
            document.getElementById('panelPosition').value = settings.panelPosition;
            document.getElementById('panelTheme').value = settings.panelTheme;
            document.getElementById('customPrompt').value = settings.customPrompt;
            document.getElementById('enableCaching').checked = settings.enableCaching;
            document.getElementById('cacheDuration').value = settings.cacheDuration;

            // Select archetypes
            document.querySelectorAll('.archetype-card').forEach(card => {
                const archetypeId = card.dataset.archetype;
                if (settings.selectedArchetypes.includes(archetypeId)) {
                    card.classList.add('selected');
                }
            });

            // Update API status
            this.updateApiStatus(!!settings.apiKey);

        } catch (error) {
            console.error('Error loading settings:', error);
            this.showToast('Error loading settings', 'error');
        }
    }

    async saveSettings(showNotification = true) {
        try {
            const settings = {
                apiKey: document.getElementById('apiKey').value,
                aiModel: document.getElementById('aiModel').value,
                autoAnalysis: document.getElementById('autoAnalysis').checked,
                mouseoverAnalysis: document.getElementById('mouseoverAnalysis').checked,
                sensitivity: parseInt(document.getElementById('sensitivity').value),
                analysisDepth: document.getElementById('analysisDepth').value,
                selectedArchetypes: Array.from(document.querySelectorAll('.archetype-card.selected'))
                    .map(card => card.dataset.archetype),
                showScoreboard: document.getElementById('showScoreboard').checked,
                showNotifications: document.getElementById('showNotifications').checked,
                panelPosition: document.getElementById('panelPosition').value,
                panelTheme: document.getElementById('panelTheme').value,
                customPrompt: document.getElementById('customPrompt').value,
                enableCaching: document.getElementById('enableCaching').checked,
                cacheDuration: parseInt(document.getElementById('cacheDuration').value)
            };

            await chrome.storage.sync.set(settings);

            if (showNotification) {
                this.showToast('Settings saved successfully!', 'success');
            }

            // Notify background script of settings change
            chrome.runtime.sendMessage({
                type: 'SETTINGS_UPDATED',
                settings: settings
            });

        } catch (error) {
            console.error('Error saving settings:', error);
            this.showToast('Error saving settings', 'error');
        }
    }

    async resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            try {
                await chrome.storage.sync.clear();
                await this.loadSettings();
                this.showToast('Settings reset to defaults', 'success');
            } catch (error) {
                console.error('Error resetting settings:', error);
                this.showToast('Error resetting settings', 'error');
            }
        }
    }

    async testConnection() {
        const apiKey = document.getElementById('apiKey').value;
        if (!apiKey) {
            this.showToast('Please enter an API key first', 'error');
            return;
        }

        const testButton = document.getElementById('testConnection');
        const originalText = testButton.textContent;
        testButton.textContent = 'Testing...';
        testButton.disabled = true;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: 'Test connection. Please respond with "Connection successful"'
                        }]
                    }]
                })
            });

            if (response.ok) {
                this.updateApiStatus(true);
                this.showToast('API connection successful!', 'success');
            } else {
                this.updateApiStatus(false);
                this.showToast('API connection failed. Check your key.', 'error');
            }

        } catch (error) {
            console.error('Connection test error:', error);
            this.updateApiStatus(false);
            this.showToast('Connection test failed', 'error');
        } finally {
            testButton.textContent = originalText;
            testButton.disabled = false;
        }
    }

    validateApiKey() {
        const apiKey = document.getElementById('apiKey').value;
        const isValid = apiKey && apiKey.length > 20; // Basic validation
        this.updateApiStatus(isValid);
    }

    updateApiStatus(isConnected) {
        const status = document.getElementById('apiStatus');
        if (isConnected) {
            status.textContent = 'Connected';
            status.className = 'api-status connected';
        } else {
            status.textContent = 'Not Connected';
            status.className = 'api-status disconnected';
        }
    }

    updateRangeValues() {
        // Initialize range value displays
        const sensitivity = document.getElementById('sensitivity');
        document.getElementById('sensitivityValue').textContent = sensitivity.value;

        const cacheDuration = document.getElementById('cacheDuration');
        const hours = parseInt(cacheDuration.value);
        const label = hours === 1 ? '1h' : 
                     hours < 24 ? `${hours}h` : 
                     hours === 24 ? '1d' : 
                     hours < 168 ? `${Math.round(hours/24)}d` : '1w';
        document.getElementById('cacheDurationValue').textContent = label;
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OptionsManager();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 's':
                e.preventDefault();
                document.getElementById('saveSettings').click();
                break;
            case 't':
                e.preventDefault();
                document.getElementById('testConnection').click();
                break;
        }
    }
});
