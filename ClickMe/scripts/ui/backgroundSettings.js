// file: scripts/ui/backgroundSettings.js
// description: Manages page title updates, iframe settings (URL and credentialless attribute), and background/transparency toggle functionality.

function initializeBackgroundSettings() {
    const urlParams = new URLSearchParams(window.location.search);
    const showMenu = urlParams.get('menu') === 'true';
    const toggleButton = document.getElementById('toggle-button');
    const transparencyButton = document.getElementById('transparency-button');
    const buttonContainer = document.getElementById('button-container');
    const pageTitleInput = document.getElementById('page-title');
    
    // Handle page title changes
    if (pageTitleInput) {
        // Set initial value if stored in localStorage
        const storedSettings = localStorage.getItem('clickjackingSettings');
        if (storedSettings) {
            try {
                const settings = JSON.parse(storedSettings);
                if (settings.pageTitle) {
                    pageTitleInput.value = settings.pageTitle;
                    document.title = settings.pageTitle;
                }
            } catch (e) {
                console.error('Error parsing localStorage settings', e);
            }
        }
        
        // Listen for changes to update title and save to settings
        pageTitleInput.addEventListener('input', function() {
            const newTitle = pageTitleInput.value.trim();
            document.title = newTitle || "ClickMe POC";
            
            // Save to localStorage
            const storedSettings = localStorage.getItem('clickjackingSettings');
            if (storedSettings) {
                try {
                    const settings = JSON.parse(storedSettings);
                    settings.pageTitle = newTitle;
                    localStorage.setItem('clickjackingSettings', JSON.stringify(settings));
                } catch (e) {
                    console.error('Error updating settings', e);
                }
            } else {
                const newSettings = {
                    pageTitle: newTitle,
                    url: '',
                    background: 'none',
                    credentialless: false,
                    steps: {}
                };
                localStorage.setItem('clickjackingSettings', JSON.stringify(newSettings));
            }
        });
    }
    
    // Settings handling
    let settings;
    
    function getCurrentSettings() {
        // Always get the latest settings
        if (showMenu) {
            // If menu=true, load settings from localStorage
            const storedSettings = localStorage.getItem('clickjackingSettings');
            if (storedSettings) {
                try {
                    return JSON.parse(storedSettings);
                } catch (e) {
                    console.error('Error parsing localStorage settings', e);
                    return typeof defaultSettings !== 'undefined' ? defaultSettings : 
                        {url: 'https://example.com', background: 'none', credentialless: true, steps: {}};
                }
            } else {
                // Fallback to defaultSettings if localStorage is empty
                return typeof defaultSettings !== 'undefined' ? defaultSettings : 
                    {url: 'https://example.com', background: 'none', credentialless: true, steps: {}};
            }
        } else {
            // If loading normally (no menu=true), use defaultSettings from menu.js
            return typeof defaultSettings !== 'undefined' ? defaultSettings : 
                {url: 'https://example.com', background: 'none', credentialless: true, steps: {}};
        }
    }
    
    // Get initial settings
    settings = getCurrentSettings();
    
    // Apply settings
    const iframe = document.getElementById('iframe');
    if (iframe && settings.url) {
        iframe.src = settings.url;
    }
    
    // Initialize credentialless attribute if needed
    if (iframe && settings.credentialless) {
        iframe.setAttribute('credentialless', '');
    } else if (iframe) {
        iframe.removeAttribute('credentialless');
        console.log("Credentialless is disabled.");
    }
    
    // Elements that will be controlled by the toggle button
    const fakeBackground = document.getElementById('fake-background');
    const whiteBackground = document.getElementById('white-background');
    const socialMediaBackground = document.getElementById('social-media-background');
    
    // Function to update background visibility
    function updateBackgroundVisibility(shouldShow) {
        // Get current settings to ensure we have the latest background type
        const currentSettings = getCurrentSettings();
        const currentBackgroundType = currentSettings.background;
        
        console.log('Current background type:', currentBackgroundType);
        
        // First, update display status of all backgrounds
        if (fakeBackground) fakeBackground.style.display = shouldShow ? 'block' : 'none';
        if (whiteBackground) whiteBackground.style.display = 'none';
        if (socialMediaBackground) socialMediaBackground.style.display = 'none';
        
        // Then, if showing, apply the specific background based on current settings
        if (shouldShow) {
            if (currentBackgroundType === 'white' && whiteBackground) {
                whiteBackground.style.display = 'block';
            } else if (currentBackgroundType === 'social-media' && socialMediaBackground) {
                socialMediaBackground.style.display = 'block';
            }
        }
    }
    
    // Button toggle functionality
    if (toggleButton) {
        // Initialize button based on URL parameter
        let isOn = !showMenu; // Default: OFF when menu=true, ON otherwise
        
        function updateToggleState() {
            if (isOn) {
                // ON state - show backgrounds
                toggleButton.textContent = 'Background: ON';
                toggleButton.classList.remove('red');
                toggleButton.classList.add('green');
                updateBackgroundVisibility(true);
                console.log('on');
            } else {
                // OFF state - hide backgrounds
                toggleButton.textContent = 'Background: OFF';
                toggleButton.classList.remove('green');
                toggleButton.classList.add('red');
                updateBackgroundVisibility(false);
                console.log('off');
            }
        }
        
        // Set initial state
        updateToggleState();
        
        // Add toggle functionality to the button
        toggleButton.onclick = function() {
            isOn = !isOn; // Toggle state
            updateToggleState();
        };
    }

    // Transparency toggle functionality
    if (transparencyButton && buttonContainer) {
        // Initialize transparency state - Default: OFF
        let isTransparent = false;
        
        function updateTransparencyState() {
            if (isTransparent) {
                // ON state - make button container transparent
                transparencyButton.textContent = 'Transparency: ON';
                transparencyButton.classList.remove('red');
                transparencyButton.classList.add('green');
                buttonContainer.classList.add('transparent');
                console.log('transparency on');
            } else {
                // OFF state - make button container opaque
                transparencyButton.textContent = 'Transparency: OFF';
                transparencyButton.classList.remove('green');
                transparencyButton.classList.add('red');
                buttonContainer.classList.remove('transparent');
                console.log('transparency off');
            }
        }
        
        // Set initial state
        updateTransparencyState();
        
        // Add toggle functionality to the button
        transparencyButton.onclick = function() {
            isTransparent = !isTransparent; // Toggle state
            updateTransparencyState();
        };
    }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeBackgroundSettings);