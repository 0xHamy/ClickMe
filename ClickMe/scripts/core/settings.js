// file: scripts/core/settings.js
// description: Manages settings, including loading, saving, and initializing default settings.

const defaultSettings = {
  "url": "https://example.com",
  "background": "social-media",
  "credentialless": true,
  "steps": {
      "step1": {
          "name": "Step 1",
          "iframe": {
              "width": "800",
              "height": "600"
          },
          "button": "normal",
          "buttonSettings": {
              "type": "normal",
              "left": "20",
              "top": "45",
              "width": "100",
              "height": "40",
              "text": "Click Me",
              "color": "#3a86ff"
          },
          "timeout": "1000"
      }
  }
};

// Initialize global currentSettings
let currentSettings = loadSettings() || { ...defaultSettings };

function loadSettings() {
  // Your existing loadSettings code
  const storedSettings = localStorage.getItem('clickjackingSettings');
  if (storedSettings) {
      try {
          return JSON.parse(storedSettings);
      } catch (e) {
          console.error('Error parsing localStorage settings', e);
          return { ...defaultSettings };
      }
  }
  return { ...defaultSettings };
}

function saveSettings(settings) {
  // Your existing saveSettings code
  try {
      localStorage.setItem('clickjackingSettings', JSON.stringify(settings));
  } catch (e) {
      console.error('Error saving settings to localStorage', e);
  }
}