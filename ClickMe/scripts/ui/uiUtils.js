// file: scripts/ui/uiUtils.js
// description: Utility functions for updating the UI, handling button previews, and other UI-related tasks.

// Function to update UI with current settings
function updateUIWithSettings() {
    const urlInput = document.querySelector('#iframe-url');
    const backgroundSelect = document.querySelector('#background-select');
    const credentiallessCheckbox = document.querySelector('#credentialless-iframe');
    const iframe = document.querySelector('#iframe-section iframe');

    if (urlInput) urlInput.value = currentSettings.url;
    if (backgroundSelect) backgroundSelect.value = currentSettings.background;
    if (credentiallessCheckbox) credentiallessCheckbox.checked = currentSettings.credentialless;
    if (iframe) iframe.src = currentSettings.url;

    // Initialize the steps
    initializeSteps();
    
    // Update the dot colors for the first step if it's a captcha-puzzle
    setTimeout(() => {
        const currentButton = document.querySelector('.iframe-control-button');
        if (currentButton && currentButton.dataset.currentStep) {
            const currentStepNumber = parseInt(currentButton.dataset.currentStep);
            const step = document.querySelector(`.step-container[data-step-number="${currentStepNumber}"]`);
            if (step) {
                const buttonElement = step.querySelector('.element-button');
                if (buttonElement) {
                    const buttonTypeSelect = buttonElement.querySelector('.button-type-select');
                    if (buttonTypeSelect && buttonTypeSelect.value === 'captcha-puzzle') {
                        // Get the step value
                        const stepInput = buttonElement.querySelector('.captcha-puzzle-step');
                        if (stepInput) {
                            console.log(`Found captcha puzzle step with value: ${stepInput.value}`);
                            const totalDotsInput = buttonElement.querySelector('.captcha-puzzle-total-dots');
                            const totalDots = totalDotsInput ? totalDotsInput.value : 4;
                            updateCaptchaPuzzleDots(stepInput.value, totalDots);
                        }
                    }
                }
            }
        }
    }, 100); // Small delay to ensure DOM is fully loaded
}

function getCurrentConstants() {
    // Get current URL from input
    const urlInput = document.querySelector('#iframe-url');
    const currentUrl = urlInput ? urlInput.value : currentSettings.url;

    // Get current background selection
    const backgroundSelect = document.querySelector('#background-select');
    const currentBackground = backgroundSelect ? backgroundSelect.value : currentSettings.background;

    // Get current credentialless state
    const credentiallessCheckbox = document.querySelector('#credentialless-iframe');
    const currentCredentialless = credentiallessCheckbox ? credentiallessCheckbox.checked : currentSettings.credentialless;

    // Update step content first to ensure it's current
    updateStepContent();

    const newSettings = {
        url: currentUrl,
        background: currentBackground,
        credentialless: currentCredentialless,
        steps: stepsContent
    };

    // Save to localStorage
    saveSettings(newSettings);
    currentSettings = newSettings;

    return newSettings;
}

function exportSteps() {
    // Get the current localStorage content
    const localStorageContent = localStorage.getItem('clickjackingSettings');
    
    // Format for display
    let displayContent = '';
    
    if (localStorageContent) {
        try {
            // Parse and re-stringify for pretty formatting
            const parsedContent = JSON.parse(localStorageContent);
            displayContent = JSON.stringify(parsedContent, null, 2);
        } catch (e) {
            // If parsing fails, just use the raw content
            displayContent = localStorageContent;
        }
    } else {
        displayContent = 'No content found in localStorage for key "clickjackingSettings"';
    }
    
    // Show the preview popup with the code - no comments, just the raw JSON
    const exportPreview = document.getElementById('export-preview');
    const exportCode = document.getElementById('export-code');
    exportCode.textContent = displayContent;
    exportPreview.classList.add('show');
}

function closeExportPreview() {
    const exportPreview = document.getElementById('export-preview');
    exportPreview.classList.remove('show');
}

function copyToClipboard() {
    const exportCode = document.getElementById('export-code');
    const textToCopy = exportCode.textContent;

    navigator.clipboard.writeText(textToCopy).then(() => {
        // Show success message
        const copyBtn = document.querySelector('.export-preview-actions button');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        
        // Clear localStorage
        localStorage.removeItem('clickjackingSettings');
        
        // Reset current settings to default
        currentSettings = { ...defaultSettings };
        
        // Update UI with default settings
        updateUIWithSettings();
        
        // Close the preview after a short delay
        setTimeout(() => {
            copyBtn.textContent = originalText;
            closeExportPreview();
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard');
    });
}

function toggleDropdown(event) {
    event.stopPropagation();
    const dropdown = document.querySelector('.dropdown-content');
    
    // Update dropdown with current steps before showing
    updateStepsDropdown();
    
    dropdown.classList.toggle('show');
}

function toggleIframe() {
    const iframe = document.querySelector('#iframe-section iframe');
    const button = document.querySelector('.iframe-control-button');
    
    if (iframe.style.opacity !== '0') {
        iframe.style.opacity = '0';
        button.textContent = 'Show Iframe';
    } else {
        iframe.style.opacity = '1';
        button.textContent = 'Hide Iframe';
    }
}

function reloadIframe() {
    const iframe = document.querySelector('#iframe-section iframe');
    iframe.src = iframe.src;
}

function resetIframe() {
    const iframe = document.querySelector('#iframe-section iframe');
    const urlInput = document.querySelector('#iframe-url');
    iframe.src = 'about:blank';
    if (urlInput) {
        urlInput.value = '';
    }
}

function toggleSettings() {
    const settingsPanel = document.getElementById('settings-panel');
    const settingsHeader = document.querySelector('.settings-header');
    
    if (!settingsPanel.classList.contains('active')) {
        settingsPanel.classList.add('active');
        settingsHeader.classList.add('active');
    } else {
        settingsPanel.classList.remove('active');
        settingsHeader.classList.remove('active');
    }
}

// Function to update the background visibility based on selection
function updateBackgroundVisibility(backgroundType) {
    const whiteBackground = document.getElementById('white-background');
    const socialMediaBackground = document.getElementById('social-media-background');
    
    // Hide all backgrounds first
    if (whiteBackground) whiteBackground.style.display = 'none';
    if (socialMediaBackground) socialMediaBackground.style.display = 'none';
    
    // Show the selected background
    if (backgroundType === 'white' && whiteBackground) {
        whiteBackground.style.display = 'block';
    } else if (backgroundType === 'social-media' && socialMediaBackground) {
        socialMediaBackground.style.display = 'block';
    }
}

// Function to restructure the DOM to separate button-container from iframe container
function restructureButtonContainer() {
    // Get relevant elements using more specific selectors
    const iframeSection = document.getElementById('iframe-section');
    const mainContainer = document.querySelector('#iframe-section > .main-container');
    const iframeContainer = document.querySelector('#iframe-section > .main-container > .container');
    const buttonContainer = document.getElementById('button-container');
    const iframe = document.getElementById('iframe');
    const captchaPuzzleButton = document.getElementById('captcha-puzzle-button');
    const menuSection = document.getElementById('menu');
    
    // Ensure the menu section is always clickable
    if (menuSection) {
        menuSection.style.pointerEvents = 'auto';
        
        // Make all controls in the menu clickable
        const menuControls = menuSection.querySelectorAll('button, .iframe-control-button, .dropdown-content, .dropdown-item');
        menuControls.forEach(control => {
            control.style.pointerEvents = 'auto';
        });
    }
    
    if (!iframeSection || !mainContainer || !buttonContainer) {
        console.error('Required elements not found');
        return;
    }
    
    // Remove button-container from its current parent
    if (buttonContainer.parentNode) {
        buttonContainer.parentNode.removeChild(buttonContainer);
    }
    
    // Add it directly to the iframe container for better positioning
    if (iframeContainer) {
        iframeContainer.appendChild(buttonContainer);
    } else {
        // Fallback to main container if iframe container not found
        mainContainer.appendChild(buttonContainer);
    }
    
    // Position the button container exactly over the iframe
    if (iframe) {
        const iframeRect = iframe.getBoundingClientRect();
        buttonContainer.style.position = 'absolute';
        buttonContainer.style.top = '0';
        buttonContainer.style.left = '0';
        buttonContainer.style.width = `${iframe.offsetWidth}px`;
        buttonContainer.style.height = `${iframe.offsetHeight}px`;
        buttonContainer.style.pointerEvents = 'none';
        buttonContainer.style.zIndex = '100';
        buttonContainer.style.overflow = 'visible'; // Allow overflow for captcha-puzzle
    } else {
        // Default positioning if iframe not available
        buttonContainer.style.position = 'absolute';
        buttonContainer.style.top = '0';
        buttonContainer.style.left = '0';
        buttonContainer.style.width = '100%';
        buttonContainer.style.height = '100%';
        buttonContainer.style.pointerEvents = 'none';
        buttonContainer.style.zIndex = '100';
        buttonContainer.style.overflow = 'visible'; // Allow overflow for captcha-puzzle
    }
    
    // Special handling for captcha puzzle button to allow it to extend beyond the container
    if (captchaPuzzleButton) {
        captchaPuzzleButton.style.position = 'absolute';
        captchaPuzzleButton.style.top = '50%';
        captchaPuzzleButton.style.left = '50%';
        captchaPuzzleButton.style.transform = 'translate(-50%, -50%)';
        captchaPuzzleButton.style.zIndex = '150';
        captchaPuzzleButton.style.overflow = 'visible';
        
        // Ensure the container inside the captcha-puzzle-button has the right styling
        const puzzleContainer = captchaPuzzleButton.querySelector('.container, .puzzle-container');
        if (puzzleContainer) {
            puzzleContainer.classList.add('puzzle-container');
            puzzleContainer.classList.remove('container');
            puzzleContainer.style.overflow = 'visible';
            puzzleContainer.style.zIndex = '150';
        }
    }
    
    // Make all buttons and interactive elements clickable (except normal-button, captcha-checkbox-button, and captcha-puzzle-button)
    const interactiveElements = buttonContainer.querySelectorAll('button, .button-overlay');
    interactiveElements.forEach(element => {
        element.style.pointerEvents = 'auto';
    });
    
    // Force normal button to have pointer-events: none
    const normalButton = document.getElementById('normal-button');
    if (normalButton) {
        normalButton.style.pointerEvents = 'none';
        const buttonElements = normalButton.querySelectorAll('button');
        buttonElements.forEach(button => {
            button.style.pointerEvents = 'none';
        });
    }
    
    // Force captcha checkbox button to have pointer-events: none
    const captchaCheckboxButton = document.getElementById('captcha-checkbox-button');
    if (captchaCheckboxButton) {
        captchaCheckboxButton.style.pointerEvents = 'none';
        const captchaElements = captchaCheckboxButton.querySelectorAll('*:not(.green-overlay)');
        captchaElements.forEach(element => {
            element.style.pointerEvents = 'none';
        });
        
        // Create a MutationObserver to ensure pointer-events stays 'none'
        const observer = new MutationObserver(function(mutations) {
            if (captchaCheckboxButton.style.pointerEvents !== 'none') {
                captchaCheckboxButton.style.pointerEvents = 'none';
            }
            
            // Also check child elements
            const elements = captchaCheckboxButton.querySelectorAll('*:not(.green-overlay)');
            elements.forEach(element => {
                if (element.style.pointerEvents !== 'none') {
                    element.style.pointerEvents = 'none';
                }
            });
        });
        
        // Observe changes to style attribute
        observer.observe(captchaCheckboxButton, { 
            attributes: true, 
            attributeFilter: ['style'],
            subtree: true
        });
    }
    
    // Force captcha puzzle button to have pointer-events: none
    const puzzleButton = document.getElementById('captcha-puzzle-button');
    if (puzzleButton) {
        puzzleButton.style.pointerEvents = 'none';
        const puzzleElements = puzzleButton.querySelectorAll('*');
        puzzleElements.forEach(element => {
            element.style.pointerEvents = 'none';
        });
        
        // Create a MutationObserver to ensure pointer-events stays 'none'
        const puzzleObserver = new MutationObserver(function(mutations) {
            if (puzzleButton.style.pointerEvents !== 'none') {
                puzzleButton.style.pointerEvents = 'none';
            }
            
            // Also check child elements
            const elements = puzzleButton.querySelectorAll('*');
            elements.forEach(element => {
                if (element.style.pointerEvents !== 'none') {
                    element.style.pointerEvents = 'none';
                }
            });
        });
        
        // Observe changes to style attribute
        puzzleObserver.observe(puzzleButton, { 
            attributes: true, 
            attributeFilter: ['style'],
            subtree: true
        });
    }
    
    console.log('Button container restructured successfully');
}


// Function to update iframe dimensions based on the selected step
function updateIframeToMatchSelectedStep(stepNumber) {
    // Get the main iframe element and its container elements with more specific selectors
    const mainIframe = document.querySelector('#iframe');
    const iframeContainer = document.querySelector('#iframe-section > .main-container > .container');
    const mainContainer = document.querySelector('#iframe-section > .main-container');
    const buttonContainer = document.getElementById('button-container');
    
    if (!mainIframe) return;
    
    // Get all steps - this ensures we have the latest data
    const steps = document.querySelectorAll('.step-container');
    if (steps.length === 0 || stepNumber < 1 || stepNumber > steps.length) return;
    
    // Get the selected step
    const selectedStep = steps[stepNumber - 1];
    if (!selectedStep) return;
    
    // Find the iframe element with settings within this step
    const iframeElement = selectedStep.querySelector('.element-iframe');
    if (!iframeElement) return;
    
    // Get the width and height inputs
    const widthInput = iframeElement.querySelector('.iframe-width');
    const heightInput = iframeElement.querySelector('.iframe-height');
    
    if (widthInput && heightInput) {
        // Get the width and height values
        const width = widthInput.value || 800;
        const height = heightInput.value || 600;
        
        // Apply dimensions to the main iframe
        mainIframe.style.width = `${width}px`;
        mainIframe.style.height = `${height}px`;
        
        // Also apply to container elements if they exist
        if (iframeContainer) {
            iframeContainer.style.width = `${width}px`;
            iframeContainer.style.height = `${height}px`;
        }
        
        if (mainContainer) {
            mainContainer.style.width = `${width}px`;
            mainContainer.style.height = `${height}px`;
        }
        
        // Also update the button container dimensions to match the iframe
        if (buttonContainer) {
            buttonContainer.style.width = `${width}px`;
            buttonContainer.style.height = `${height}px`;
            buttonContainer.style.maxWidth = `${width}px`;
            buttonContainer.style.maxHeight = `${height}px`;
        }
        
        console.log(`Updated iframe dimensions to ${width}x${height}`);
    }
}

// Function to add additional CSS rules for proper layout
function setupButtonContainerCSS() {
    // Create a style element
    const style = document.createElement('style');
    
    // Add CSS rules for button-container and fix the captcha puzzle container
    style.textContent = `
        #button-container {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            pointer-events: none !important;
            z-index: 100 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            box-sizing: border-box !important;
            overflow: visible !important; /* Allow captcha-puzzle to overflow */
            border-radius: 12px !important;
        }
        
        #button-container button,
        #button-container .button-overlay {
            pointer-events: auto !important;
        }
        
        /* Make the captcha checkbox non-clickable */
        #captcha-checkbox-button,
        #captcha-checkbox-button * {
            pointer-events: none !important;
        }
        
        /* Make the captcha puzzle non-clickable */
        #captcha-puzzle-button,
        #captcha-puzzle-button * {
            pointer-events: none !important;
        }
        
        /* Ensure menu section is always clickable */
        #menu, 
        #menu button,
        #menu .iframe-control-button,
        #menu .dropdown-content,
        #menu .dropdown-item {
            pointer-events: auto !important;
            z-index: 1000 !important;
        }
        
        /* Center the captcha puzzle button */
        #captcha-puzzle-button {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            z-index: 150 !important;
            overflow: visible !important;
        }
        
        /* Normal button positioning */
        #normal-button {
            position: absolute !important;
            pointer-events: none !important;
        }
        
        #normal-button *, #normal-button button {
            pointer-events: none !important;
        }
        
        /* Captcha checkbox positioning */
        #captcha-checkbox-button {
            position: absolute !important;
        }
        
        #iframe-section {
            position: relative !important;
        }
        
        /* Fix for the captcha puzzle container */
        #captcha-puzzle-button .puzzle-container {
            position: relative;
            width: 500px;
            height: 610px;
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 4px;
            overflow: visible !important;
            z-index: 150 !important;
        }
        
        /* Center the background image horizontally */
        #captcha-puzzle-button .main-image img.bg-1 {
            margin: 0 auto !important;
            display: block !important;
        }
    `;
    
    // Append the style element to the head
    document.head.appendChild(style);
    
    console.log('Applied button container CSS rules');
}

// Function to ensure menu controls are always clickable
function ensureMenuControlsAreClickable() {
    // Get the menu and its controls
    const menuSection = document.getElementById('menu');
    if (!menuSection) return;
    
    // Ensure the menu itself is clickable
    menuSection.style.pointerEvents = 'auto';
    
    // Make all controls in the menu clickable
    const menuControls = menuSection.querySelectorAll('button, .iframe-control-button, .dropdown-content, .dropdown-item');
    menuControls.forEach(control => {
        if (control.style.pointerEvents !== 'auto') {
            control.style.pointerEvents = 'auto';
        }
    });
    
    // Also ensure normal button and captcha checkbox remain non-clickable
    const normalButton = document.getElementById('normal-button');
    if (normalButton && normalButton.style.pointerEvents !== 'none') {
        normalButton.style.pointerEvents = 'none';
        const buttonElements = normalButton.querySelectorAll('button');
        buttonElements.forEach(button => {
            button.style.pointerEvents = 'none';
        });
    }
    
    const captchaCheckboxButton = document.getElementById('captcha-checkbox-button');
    if (captchaCheckboxButton && captchaCheckboxButton.style.pointerEvents !== 'none') {
        captchaCheckboxButton.style.pointerEvents = 'none';
        const captchaElements = captchaCheckboxButton.querySelectorAll('*:not(.green-overlay)');
        captchaElements.forEach(element => {
            element.style.pointerEvents = 'none';
        });
    }
    
    // Check that green overlay is visible
    ensureGreenOverlayVisibility();
}

function handleLeftButton1() {
    console.log('Show Areas button clicked');
    
    // Get all overlay elements
    const redOverlay = document.getElementById('red-overlay');
    const normalButtonOverlay = document.getElementById('normal-button-overlay');
    const flyOverlay = document.getElementById('fly-overlay');
    const greenOverlays = document.querySelectorAll('.green-overlay');
    
    // Function to show an overlay by setting opacity to 1 and ensuring display is set
    function showOverlay(overlay) {
        if (overlay) {
            overlay.style.display = 'block';  // Ensure it's displayed
            overlay.style.opacity = '1';
            console.log(`Showing overlay: ${overlay.id || overlay.className}`);
        }
    }
    
    // Function to hide an overlay by setting opacity to 0
    function hideOverlay(overlay) {
        if (overlay) {
            overlay.style.opacity = '0';
            // Don't set display:none here to maintain presence but invisible
            console.log(`Hiding overlay: ${overlay.id || overlay.className}`);
        }
    }
    
    // Special function for elements with !important CSS styles
    function showGreenOverlays() {
        greenOverlays.forEach(overlay => {
            if (overlay) {
                // Use important inline style for elements with !important CSS rules
                overlay.setAttribute('style', 'display: block !important; opacity: 1 !important');
                console.log('Showing green overlay');
            }
        });
    }
    
    function hideGreenOverlays() {
        greenOverlays.forEach(overlay => {
            if (overlay) {
                // Use important inline style for elements with !important CSS rules
                overlay.setAttribute('style', 'display: block !important; opacity: 0 !important');
                console.log('Hiding green overlay');
            }
        });
    }
    
    // Show all overlays
    showOverlay(redOverlay);
    showOverlay(normalButtonOverlay);
    showOverlay(flyOverlay);
    showGreenOverlays();
    
    // Hide overlays after 3 seconds
    setTimeout(() => {
        hideOverlay(redOverlay);
        hideOverlay(normalButtonOverlay);
        hideOverlay(flyOverlay);
        hideGreenOverlays();
        console.log('Overlays hidden after 3 seconds');
    }, 3000);
}

function handleLeftButton2() {
    // Add your functionality here
    console.log('Left Button 2 clicked');
}


// Add function to toggle element settings
function toggleElementSettings(button) {
    const element = button.closest('.step-element');
    const settingsPanel = element.querySelector('.element-content');
    
    if (settingsPanel) {
        settingsPanel.classList.toggle('hidden');
        button.classList.toggle('active');
    }
}

// Function to update button settings based on type selection
function updateButtonSettings(selectElement) {
    const buttonElement = selectElement.closest('.element-button');
    const buttonType = selectElement.value;
    const stepContainer = buttonElement.closest('.step-container');
    
    console.log(`Updating button settings for type: ${buttonType}`);
    
    // Hide all button type settings
    buttonElement.querySelectorAll('.button-type-settings').forEach(settings => {
        settings.style.display = 'none';
    });
    
    // Also hide all button previews
    document.getElementById('normal-button')?.style.setProperty('display', 'none');
    document.getElementById('captcha-checkbox-button')?.style.setProperty('display', 'none');
    document.getElementById('captcha-puzzle-button')?.style.setProperty('display', 'none');
    
    // Show the selected button type setting panel
    const selectedSettings = buttonElement.querySelector(`.${buttonType}-button-settings`);
    if (selectedSettings) {
        console.log(`Found settings panel for ${buttonType}: `, selectedSettings);
        selectedSettings.style.display = 'block';
        
        // Center the button based on the current iframe dimensions when type changes
        centerButtonInIframe(stepContainer, buttonElement);
        
        // Also show the corresponding button in the preview
        if (buttonType === 'normal') {
            const normalButton = document.getElementById('normal-button');
            if (normalButton) {
                normalButton.style.display = 'block';
                
                // Get and apply current settings
                const left = selectedSettings.querySelector('.button-left')?.value || '50';
                const top = selectedSettings.querySelector('.button-top')?.value || '50';
                const width = selectedSettings.querySelector('.button-width')?.value || '100';
                const height = selectedSettings.querySelector('.button-height')?.value || '40';
                const text = selectedSettings.querySelector('.button-text')?.value || 'Click Me';
                const color = selectedSettings.querySelector('.button-color')?.value || '#3a86ff';
                
                normalButton.style.left = `${left}%`;
                normalButton.style.top = `${top}%`;
                normalButton.style.width = `${width}px`;
                normalButton.style.height = `${height}px`;
                normalButton.textContent = text;
                normalButton.style.backgroundColor = color;
            }
        } 
        else if (buttonType === 'captcha-checkbox') {
            const captchaCheckbox = document.getElementById('captcha-checkbox-button');
            if (captchaCheckbox) {
                captchaCheckbox.style.display = 'block';
                
                // Get and apply current settings
                const left = selectedSettings.querySelector('.captcha-left')?.value || '50';
                const top = selectedSettings.querySelector('.captcha-top')?.value || '50';
                
                captchaCheckbox.style.left = `${left}%`;
                captchaCheckbox.style.top = `${top}%`;
                captchaCheckbox.style.transform = 'translate(-50%, -50%)';
            }
        }
        else if (buttonType === 'captcha-puzzle') {
            const captchaPuzzle = document.getElementById('captcha-puzzle-button');
            if (captchaPuzzle) {
                captchaPuzzle.style.display = 'block';
                
                // Get and apply current position settings
                const left = selectedSettings.querySelector('.captcha-puzzle-left')?.value || '50';
                const top = selectedSettings.querySelector('.captcha-puzzle-top')?.value || '50';
                
                captchaPuzzle.style.left = `${left}%`;
                captchaPuzzle.style.top = `${top}%`;
                captchaPuzzle.style.transform = 'translate(-50%, -50%)';
                
                // If it's captcha-puzzle, ensure all inputs have default values
                const inputSelectors = [
                    '.captcha-puzzle-left', '.captcha-puzzle-top', '.captcha-puzzle-step',
                    '.fly-left', '.fly-top', 
                    '.cow1-left', '.cow1-top', 
                    '.cow2-left', '.cow2-top',
                    '.cow3-left', '.cow3-top'
                ];
                
                // Check if we're missing any required inputs
                let missingInputs = false;
                
                inputSelectors.forEach(selector => {
                    const input = selectedSettings.querySelector(selector);
                    if (input) {
                        console.log(`Found ${selector} input`);
                        // Ensure it has a default value if empty
                        if (!input.value) {
                            if (selector.includes('step')) {
                                input.value = 1;
                            } else {
                                input.value = 100;
                            }
                            console.log(`Set default value for ${selector}: ${input.value}`);
                        }
                        
                        // Apply value to corresponding element in the preview
                        if (selector.includes('fly') || selector.includes('cow')) {
                            const elementClass = selector.replace('-left', '').replace('-top', '');
                            const position = selector.includes('-left') ? 'left' : 'top';
                            const element = captchaPuzzle.querySelector(`.${elementClass}`);
                            
                            if (element && input.value) {
                                element.style[position] = `${input.value}px`;
                            }
                        }
                    } else {
                        console.error(`Could not find ${selector} input in captcha-puzzle settings`);
                        missingInputs = true;
                    }
                });
                
                // If we're missing inputs, recreate the panel
                if (missingInputs) {
                    console.log("Missing inputs detected, recreating captcha-puzzle panel");
                    
                    // Get the current values to preserve them
                    const left = selectedSettings.querySelector('.captcha-puzzle-left')?.value || 100;
                    const top = selectedSettings.querySelector('.captcha-puzzle-top')?.value || 100;
                    const step = selectedSettings.querySelector('.captcha-puzzle-step')?.value || 1;
                    const flyLeft = selectedSettings.querySelector('.fly-left')?.value || 120;
                    const flyTop = selectedSettings.querySelector('.fly-top')?.value || 120;
                    const cow1Left = selectedSettings.querySelector('.cow1-left')?.value || 140;
                    const cow1Top = selectedSettings.querySelector('.cow1-top')?.value || 140;
                    const cow2Left = selectedSettings.querySelector('.cow2-left')?.value || 160;
                    const cow2Top = selectedSettings.querySelector('.cow2-top')?.value || 160;
                    const cow3Left = selectedSettings.querySelector('.cow3-left')?.value || 180;
                    const cow3Top = selectedSettings.querySelector('.cow3-top')?.value || 180;
                    
                    // Create new panel HTML with all required inputs
                    const newPanelHTML = `
                        <div class="setting-row">
                            <label>Position:</label>
                            <div class="position-inputs">
                                <div class="position-input">
                                    <span>Left:</span>
                                    <input type="number" class="captcha-puzzle-left" value="${left}" min="0">
                                    <span>%</span>
                                </div>
                                <div class="position-input">
                                    <span>Top:</span>
                                    <input type="number" class="captcha-puzzle-top" value="${top}" min="0">
                                    <span>%</span>
                                </div>
                            </div>
                        </div>
                        <div class="setting-row">
                            <button type="button" class="randomize-cows-button" onclick="randomizeCowPositions(this)">Randomize Cow Positions</button>
                        </div>
                        <div class="setting-row">
                            <label>Fly Position:</label>
                            <div class="position-inputs">
                                <div class="position-input">
                                    <span>Left:</span>
                                    <input type="number" class="fly-left" value="${flyLeft}" min="0">
                                    <span>px</span>
                                </div>
                                <div class="position-input">
                                    <span>Top:</span>
                                    <input type="number" class="fly-top" value="${flyTop}" min="0">
                                    <span>px</span>
                                </div>
                            </div>
                        </div>
                        <div class="setting-row">
                            <label>Cow1 Position:</label>
                            <div class="position-inputs">
                                <div class="position-input">
                                    <span>Left:</span>
                                    <input type="number" class="cow1-left" value="${cow1Left}" min="0">
                                    <span>px</span>
                                </div>
                                <div class="position-input">
                                    <span>Top:</span>
                                    <input type="number" class="cow1-top" value="${cow1Top}" min="0">
                                    <span>px</span>
                                </div>
                            </div>
                        </div>
                        <div class="setting-row">
                            <label>Cow2 Position:</label>
                            <div class="position-inputs">
                                <div class="position-input">
                                    <span>Left:</span>
                                    <input type="number" class="cow2-left" value="${cow2Left}" min="0">
                                    <span>px</span>
                                </div>
                                <div class="position-input">
                                    <span>Top:</span>
                                    <input type="number" class="cow2-top" value="${cow2Top}" min="0">
                                    <span>px</span>
                                </div>
                            </div>
                        </div>
                        <div class="setting-row">
                            <label>Cow3 Position:</label>
                            <div class="position-inputs">
                                <div class="position-input">
                                    <span>Left:</span>
                                    <input type="number" class="cow3-left" value="${cow3Left}" min="0">
                                    <span>px</span>
                                </div>
                                <div class="position-input">
                                    <span>Top:</span>
                                    <input type="number" class="cow3-top" value="${cow3Top}" min="0">
                                    <span>px</span>
                                </div>
                            </div>
                        </div>
                        <div class="setting-row">
                            <label>Step:</label>
                            <input type="number" class="captcha-puzzle-step" value="${step}" min="1" max="4">
                        </div>
                        <div class="setting-row">
                            <label>Total Dots:</label>
                            <input type="number" class="captcha-puzzle-total-dots" value="${settings.totalDots || 4}" min="1" max="4">
                        </div>
                    `;
                    
                    // Replace the panel contents
                    selectedSettings.innerHTML = newPanelHTML;
                    
                    // Apply values to the preview elements
                    const fly = captchaPuzzle.querySelector('.fly');
                    if (fly) {
                        fly.style.left = `${flyLeft}px`;
                        fly.style.top = `${flyTop}px`;
                    }
                    
                    const cow1 = captchaPuzzle.querySelector('.cow1');
                    if (cow1) {
                        cow1.style.left = `${cow1Left}px`;
                        cow1.style.top = `${cow1Top}px`;
                    }
                    
                    const cow2 = captchaPuzzle.querySelector('.cow2');
                    if (cow2) {
                        cow2.style.left = `${cow2Left}px`;
                        cow2.style.top = `${cow2Top}px`;
                    }
                    
                    const cow3 = captchaPuzzle.querySelector('.cow3');
                    if (cow3) {
                        cow3.style.left = `${cow3Left}px`;
                        cow3.style.top = `${cow3Top}px`;
                    }
                    
                    // Make sure listeners are added to new inputs
                    setTimeout(() => {
                        setupButtonInputListeners(buttonElement);
                    }, 50);
                }
            }
        }
    } else {
        console.error(`Settings for button type "${buttonType}" not found`);
        // Log what button types are available
        const availableTypes = [];
        buttonElement.querySelectorAll('.button-type-settings').forEach(settings => {
            availableTypes.push(settings.className.replace('-button-settings', '').replace('button-type-settings ', ''));
        });
        console.log('Available button types:', availableTypes);
    }
    
    // Update the button code
    updateButtonCode(buttonElement);
    
    // Make sure settings are saved after changing button type
    updateStepContent();
}

// Function to setup button input event listeners
function setupButtonInputListeners(buttonElement) {
    if (!buttonElement) return;
    
    const buttonTypeSelect = buttonElement.querySelector('.button-type-select');
    if (!buttonTypeSelect) return;
    
    // Add listener for the button type select
    buttonTypeSelect.addEventListener('change', () => {
        updateButtonSettings(buttonTypeSelect);
    });
    
    // Common inputs that should trigger a real-time update for the preview and localStorage
    const inputSelectors = [
        // Normal button inputs
        '.button-left', '.button-top', '.button-width', '.button-height', '.button-text', '.button-color',
        
        // Captcha checkbox inputs
        '.captcha-left', '.captcha-top',
        
        // Captcha puzzle inputs
        '.captcha-puzzle-left', '.captcha-puzzle-top', '.captcha-puzzle-step', '.captcha-puzzle-total-dots',
        
        // Cow and fly positions
        '.fly-left', '.fly-top',
        '.cow1-left', '.cow1-top',
        '.cow2-left', '.cow2-top',
        '.cow3-left', '.cow3-top'
    ];
    
    // Add listeners to all inputs
    inputSelectors.forEach(selector => {
        const inputs = buttonElement.querySelectorAll(selector);
        inputs.forEach(input => {
            // Remove old listeners to prevent duplicates
            input.removeEventListener('change', handleInputChange);
            input.removeEventListener('input', handleInputChange);
            
            // Add new listeners
            input.addEventListener('change', handleInputChange);
            input.addEventListener('input', handleInputChange);
        });
    });
    
    function handleInputChange(event) {
        const input = event.target;
        const buttonType = buttonTypeSelect.value;
        
        // Update the preview
        updateButtonPreview(buttonType, input);
        
        // Also save to localStorage
        updateStepContent();
        
        // If it's the captcha-puzzle-step input, make sure the dots are updated
        if (input.classList.contains('captcha-puzzle-step') || input.classList.contains('captcha-puzzle-total-dots')) {
            const buttonElement = input.closest('.element-button');
            if (buttonElement) {
                const stepInput = buttonElement.querySelector('.captcha-puzzle-step');
                const totalDotsInput = buttonElement.querySelector('.captcha-puzzle-total-dots');
                
                const step = stepInput ? stepInput.value : 1;
                const totalDots = totalDotsInput ? totalDotsInput.value : 4;
                updateCaptchaPuzzleDots(step, totalDots);
            }
        }
    }
    
    // Update button code when values change
    buttonElement.addEventListener('change', () => {
        updateButtonCode(buttonElement);
    });
}

// Helper function to update button preview based on input changes
function updateButtonPreview(buttonType, input) {
    const className = input.className;
    const value = input.value;
    
    if (buttonType === 'normal') {
        const normalButton = document.getElementById('normal-button');
        if (!normalButton) return;
        
        if (className === 'button-left') {
            normalButton.style.left = `${value}%`;
            normalButton.style.transform = 'translate(-50%, -50%)';
        }
        else if (className === 'button-top') {
            normalButton.style.top = `${value}%`;
            normalButton.style.transform = 'translate(-50%, -50%)';
        }
        else if (className === 'button-width') normalButton.style.width = `${value}px`;
        else if (className === 'button-height') normalButton.style.height = `${value}px`;
        else if (className === 'button-text') normalButton.textContent = value;
        else if (className === 'button-color') normalButton.style.backgroundColor = value;
    } 
    else if (buttonType === 'captcha-checkbox') {
        const captchaCheckbox = document.getElementById('captcha-checkbox-button');
        if (!captchaCheckbox) return;
        
        if (className === 'captcha-left') {
            captchaCheckbox.style.left = `${value}%`;
            captchaCheckbox.style.transform = 'translate(-50%, -50%)';
        }
        else if (className === 'captcha-top') {
            captchaCheckbox.style.top = `${value}%`;
            captchaCheckbox.style.transform = 'translate(-50%, -50%)';
        }
    }
    else if (buttonType === 'captcha-puzzle') {
        const captchaPuzzle = document.getElementById('captcha-puzzle-button');
        if (!captchaPuzzle) return;
        
        if (className === 'captcha-puzzle-left') {
            captchaPuzzle.style.left = `${value}%`;
            captchaPuzzle.style.transform = 'translate(-50%, -50%)';
        }
        else if (className === 'captcha-puzzle-top') {
            captchaPuzzle.style.top = `${value}%`;
            captchaPuzzle.style.transform = 'translate(-50%, -50%)';
        }
        else if (className.includes('fly') || className.includes('cow')) {
            const elementClass = className.replace('-left', '').replace('-top', '');
            const position = className.includes('-left') ? 'left' : 'top';
            const element = captchaPuzzle.querySelector(`.${elementClass}`);
            
            if (element) element.style[position] = `${value}px`;
        }
        else if (className === 'captcha-puzzle-step' || className === 'captcha-puzzle-total-dots') {
            // Get both step and total dots values
            const buttonElement = input.closest('.element-button');
            if (buttonElement) {
                const stepInput = buttonElement.querySelector('.captcha-puzzle-step');
                const totalDotsInput = buttonElement.querySelector('.captcha-puzzle-total-dots');
                
                const step = stepInput ? stepInput.value : 1;
                const totalDots = totalDotsInput ? totalDotsInput.value : 4;
                
                // Use the helper function to update dots
                updateCaptchaPuzzleDots(step, totalDots);
            }
        }
    }
}

// Function to generate the button code based on settings
function updateButtonCode(buttonElement) {
    const selectElement = buttonElement.querySelector('.button-type-select');
    if (!selectElement) return;
    
    const buttonType = selectElement.value;
    
    // No need to generate or set the code preview anymore
    // Just update the stored content
    updateStepContent();
}

// Function to toggle step name editing
function toggleStepNameEdit(button) {
    const stepTitle = button.closest('.step-title');
    const input = stepTitle.querySelector('.step-name');
    const stepNumberDisplay = stepTitle.querySelector('.step-number');
    const isEditing = input.style.display !== 'none' && input.style.display !== '';
    
    if (isEditing) {
        // Save the name and hide the input
        input.style.display = 'none';
        stepNumberDisplay.style.display = 'inline';
        // Update the step name display
        updateStepName(input);
    } else {
        // Show the input field and focus it
        input.style.display = 'inline-block';
        stepNumberDisplay.style.display = 'none';
        input.focus();
        input.select();
    }
}

// Function to update step name
function updateStepName(input) {
    const stepTitle = input.closest('.step-title');
    const stepNumber = stepTitle.querySelector('.step-number');
    const stepContainer = input.closest('.step-container');
    const stepNum = stepContainer.dataset.stepNumber;
    
    // Store the custom name in the dataset
    stepContainer.dataset.stepName = input.value;
    
    // Update the step number display with the custom name
    if (stepNumber) {
        stepNumber.textContent = input.value;
    }
    
    // Update in local storage
    updateStepContent();
}

// Function to update the dropdown with current steps
function updateStepsDropdown() {
    const dropdown = document.querySelector('.dropdown-content');
    const currentButton = document.querySelector('.iframe-control-button');
    
    if (!dropdown || !currentButton) return;
    
    // Clear existing items
    dropdown.innerHTML = '';
    
    // Get all steps
    const steps = document.querySelectorAll('.step-container');
    
    if (steps.length === 0) {
        // If no steps, show a default option
        const defaultItem = document.createElement('div');
        defaultItem.className = 'dropdown-item';
        defaultItem.textContent = 'No steps available';
        dropdown.appendChild(defaultItem);
        
        // Update button text
        currentButton.textContent = 'No steps';
        
        // Hide all button types when no steps
        document.getElementById('normal-button')?.style.setProperty('display', 'none');
        document.getElementById('captcha-checkbox-button')?.style.setProperty('display', 'none');
        document.getElementById('captcha-puzzle-button')?.style.setProperty('display', 'none');
        return;
    }
    
    // Add each step to the dropdown
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        const stepName = step.dataset.stepName || `Step ${stepNumber}`;
        
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = stepName;
        item.onclick = function() {
            selectStep(stepNumber);
        };
        
        dropdown.appendChild(item);
    });
    
    // Set default selection to Step 1 if not already set
    if (!currentButton.dataset.currentStep) {
        const defaultStep = 1;
        const firstStep = steps[0];
        
        console.log("Setting initial step to Step 1");
        currentButton.dataset.currentStep = defaultStep;
        currentButton.textContent = firstStep.dataset.stepName || 'Step 1';
        
        // Select the appropriate button type for step 1
        selectAppropriateBtnType(firstStep);
        
        // Apply the first step's iframe dimensions by default
        updateIframeToMatchSelectedStep(defaultStep);
        
        // After a short delay, ensure dot colors are updated for initial load
        setTimeout(() => {
            const buttonElement = firstStep.querySelector('.element-button');
            if (buttonElement) {
                const buttonTypeSelect = buttonElement.querySelector('.button-type-select');
                if (buttonTypeSelect && buttonTypeSelect.value === 'captcha-puzzle') {
                    const stepInput = buttonElement.querySelector('.captcha-puzzle-step');
                    if (stepInput) {
                        // Use the helper function
                        const totalDotsInput = buttonElement.querySelector('.captcha-puzzle-total-dots');
                        const totalDots = totalDotsInput ? totalDotsInput.value : 4;
                        updateCaptchaPuzzleDots(stepInput.value, totalDots);
                    }
                }
            }
        }, 200);
    } else {
        // Get current step
        const currentStepNumber = parseInt(currentButton.dataset.currentStep);
        const currentStep = steps[currentStepNumber - 1];
        
        console.log(`Applying existing step (Step ${currentStepNumber})`);
        
        // Select the appropriate button type for the current step
        if (currentStep) {
            selectAppropriateBtnType(currentStep);
            
            // After a short delay, ensure dot colors are updated
            setTimeout(() => {
                const buttonElement = currentStep.querySelector('.element-button');
                if (buttonElement) {
                    const buttonTypeSelect = buttonElement.querySelector('.button-type-select');
                    if (buttonTypeSelect && buttonTypeSelect.value === 'captcha-puzzle') {
                        const stepInput = buttonElement.querySelector('.captcha-puzzle-step');
                        if (stepInput) {
                            // Use the helper function
                            const totalDotsInput = buttonElement.querySelector('.captcha-puzzle-total-dots');
                            const totalDots = totalDotsInput ? totalDotsInput.value : 4;
                            updateCaptchaPuzzleDots(stepInput.value, totalDots);
                        }
                    }
                }
            }, 200);
        }
        
        // Apply the current step's iframe dimensions
        updateIframeToMatchSelectedStep(currentStepNumber);
    }
}


// Helper function to select the appropriate button type for a step
function selectAppropriateBtnType(step) {
    if (!step) return;
    
    // Hide all button types first
    document.getElementById('normal-button')?.style.setProperty('display', 'none');
    document.getElementById('captcha-checkbox-button')?.style.setProperty('display', 'none');
    document.getElementById('captcha-puzzle-button')?.style.setProperty('display', 'none');
    
    const buttonElement = step.querySelector('.element-button');
    if (buttonElement) {
        const buttonTypeSelect = buttonElement.querySelector('.button-type-select');
        if (buttonTypeSelect) {
            const buttonType = buttonTypeSelect.value;
            
            if (buttonType === 'normal') {
                const normalButton = document.getElementById('normal-button');
                if (normalButton) {
                    normalButton.style.display = 'block';
                    
                    // Apply settings
                    const left = buttonElement.querySelector('.button-left')?.value;
                    const top = buttonElement.querySelector('.button-top')?.value;
                    const width = buttonElement.querySelector('.button-width')?.value;
                    const height = buttonElement.querySelector('.button-height')?.value;
                    const text = buttonElement.querySelector('.button-text')?.value;
                    const color = buttonElement.querySelector('.button-color')?.value;
                    
                    if (left) {
                        normalButton.style.left = `${left}%`;
                        normalButton.style.transform = 'translate(-50%, -50%)';
                    }
                    if (top) {
                        normalButton.style.top = `${top}%`;
                        normalButton.style.transform = 'translate(-50%, -50%)';
                    }
                    if (width) normalButton.style.width = `${width}px`;
                    if (height) normalButton.style.height = `${height}px`;
                    if (text) normalButton.textContent = text;
                    if (color) normalButton.style.backgroundColor = color;
                }
            } 
            else if (buttonType === 'captcha-checkbox') {
                const captchaCheckbox = document.getElementById('captcha-checkbox-button');
                if (captchaCheckbox) {
                    captchaCheckbox.style.display = 'block';
                    
                    // Update position if values exist
                    const left = buttonElement.querySelector('.captcha-left')?.value;
                    const top = buttonElement.querySelector('.captcha-top')?.value;
                    
                    if (left) {
                        captchaCheckbox.style.left = `${left}%`;
                        captchaCheckbox.style.transform = 'translate(-50%, -50%)';
                    }
                    if (top) {
                        captchaCheckbox.style.top = `${top}%`;
                        captchaCheckbox.style.transform = 'translate(-50%, -50%)';
                    }
                }
            }
            else if (buttonType === 'captcha-puzzle') {
                const captchaPuzzle = document.getElementById('captcha-puzzle-button');
                if (captchaPuzzle) {
                    captchaPuzzle.style.display = 'block';
                    
                    // Update position and elements if values exist
                    const left = buttonElement.querySelector('.captcha-puzzle-left')?.value;
                    const top = buttonElement.querySelector('.captcha-puzzle-top')?.value;
                    
                    if (left) {
                        captchaPuzzle.style.left = `${left}%`;
                        captchaPuzzle.style.transform = 'translate(-50%, -50%)';
                    }
                    if (top) {
                        captchaPuzzle.style.top = `${top}%`;
                        captchaPuzzle.style.transform = 'translate(-50%, -50%)';
                    }
                    
                    // Get values from localStorage if available
                    const stepNumber = parseInt(step.dataset.stepNumber);
                    if (!stepNumber) {
                        console.error("Could not determine step number for localStorage lookup");
                        return;
                    }
                    
                    const stepKey = `step${stepNumber}`;
                    let storedSettings = null;
                    
                    try {
                        // Try to get settings from localStorage
                        const settings = loadSettings();
                        if (settings && settings.steps && settings.steps[stepKey] && 
                            settings.steps[stepKey].buttonSettings) {
                            storedSettings = settings.steps[stepKey].buttonSettings;
                            console.log("Found stored settings for captcha puzzle:", storedSettings);
                        }
                    } catch (e) {
                        console.error("Error loading settings from localStorage:", e);
                    }
                    
                    // Get the step value to determine which dot to color
                    const stepInput = buttonElement.querySelector('.captcha-puzzle-step');
                    let stepValue = 1;
                    if (stepInput) {
                        stepValue = parseInt(stepInput.value) || 1;
                    } else if (storedSettings && storedSettings.step) {
                        stepValue = parseInt(storedSettings.step) || 1;
                    }
                    
                    // Get the totalDots value
                    const totalDotsInput = buttonElement.querySelector('.captcha-puzzle-total-dots');
                    let totalDotsValue = 4;
                    if (totalDotsInput) {
                        totalDotsValue = parseInt(totalDotsInput.value) || 4;
                    } else if (storedSettings && storedSettings.totalDots) {
                        totalDotsValue = parseInt(storedSettings.totalDots) || 4;
                    }
                    
                    // Use the helper function to update dots
                    updateCaptchaPuzzleDots(stepValue, totalDotsValue);
                    
                    // Update fly position
                    const fly = captchaPuzzle.querySelector('.fly-1');
                    if (fly) {
                        // Try to get positions from input fields first
                        let flyLeft = buttonElement.querySelector('.fly-left')?.value;
                        let flyTop = buttonElement.querySelector('.fly-top')?.value;
                        
                        // If not available from input fields, try from localStorage
                        if ((!flyLeft || !flyTop) && storedSettings) {
                            flyLeft = storedSettings.flyLeft || 120;
                            flyTop = storedSettings.flyTop || 117;
                        }
                        
                        // Apply the positions
                        fly.style.left = `${flyLeft}px`;
                        fly.style.top = `${flyTop}px`;
                        console.log(`Applied fly position: left=${flyLeft}px, top=${flyTop}px`);
                    }
                    
                    // Apply cow positions
                    const cowPositions = [
                        { id: 'cow-1', left: 'cow1Left', top: 'cow1Top', defaultLeft: 140, defaultTop: 140 },
                        { id: 'cow-2', left: 'cow2Left', top: 'cow2Top', defaultLeft: 160, defaultTop: 160 },
                        { id: 'cow-3', left: 'cow3Left', top: 'cow3Top', defaultLeft: 180, defaultTop: 180 }
                    ];
                    
                    cowPositions.forEach((cowPos, index) => {
                        const cowId = cowPos.id;
                        const cow = captchaPuzzle.querySelector(`.${cowId}`);
                        
                        if (cow) {
                            // Try to get values from input fields first
                            let cowLeft = buttonElement.querySelector(`.cow${index+1}-left`)?.value;
                            let cowTop = buttonElement.querySelector(`.cow${index+1}-top`)?.value;
                            
                            // If not available, try to get from localStorage
                            if ((!cowLeft || !cowTop) && storedSettings) {
                                cowLeft = storedSettings[cowPos.left] || cowPos.defaultLeft;
                                cowTop = storedSettings[cowPos.top] || cowPos.defaultTop;
                            }
                            
                            // Apply the positions
                            cow.style.left = `${cowLeft}px`;
                            cow.style.top = `${cowTop}px`;
                            console.log(`Applied ${cowId} position: left=${cowLeft}px, top=${cowTop}px`);
                        }
                    });
                }
            }
        }
    } else {
        // If no button, ensure all buttons are hidden
        console.log(`Step has no button element`);
    }
}

// Function to select a step
function selectStep(stepNumber) {
    const currentButton = document.querySelector('.iframe-control-button');
    const steps = document.querySelectorAll('.step-container');
    
    if (!currentButton || steps.length === 0) return;
    
    // Validate step number
    if (stepNumber < 1 || stepNumber > steps.length) {
        console.error('Invalid step number:', stepNumber);
        return;
    }
    
    // Update button text with step name
    const step = steps[stepNumber - 1];
    const stepName = step.dataset.stepName || `Step ${stepNumber}`;
    
    currentButton.textContent = stepName;
    currentButton.dataset.currentStep = stepNumber;
    
    // Get the button type for this step and update UI accordingly
    const buttonElement = step.querySelector('.element-button');
    
    // Hide all button types first
    document.getElementById('normal-button')?.style.setProperty('display', 'none');
    document.getElementById('captcha-checkbox-button')?.style.setProperty('display', 'none');
    document.getElementById('captcha-puzzle-button')?.style.setProperty('display', 'none');
    
    if (buttonElement) {
        const buttonTypeSelect = buttonElement.querySelector('.button-type-select');
        if (buttonTypeSelect) {
            const buttonType = buttonTypeSelect.value;
            
            // Show only the selected button type
            if (buttonType === 'normal') {
                const normalButton = document.getElementById('normal-button');
                if (normalButton) {
                    normalButton.style.display = 'block';
                    
                    // Update position and size if values exist
                    const left = buttonElement.querySelector('.button-left')?.value;
                    const top = buttonElement.querySelector('.button-top')?.value;
                    const width = buttonElement.querySelector('.button-width')?.value;
                    const height = buttonElement.querySelector('.button-height')?.value;
                    const text = buttonElement.querySelector('.button-text')?.value;
                    const color = buttonElement.querySelector('.button-color')?.value;
                    
                    if (left) normalButton.style.left = `${left}%`;
                    if (top) normalButton.style.top = `${top}%`;
                    normalButton.style.transform = 'translate(-50%, -50%)';
                    if (width) normalButton.style.width = `${width}px`;
                    if (height) normalButton.style.height = `${height}px`;
                    if (text) normalButton.textContent = text;
                    if (color) normalButton.style.backgroundColor = color;
                }
            } 
            else if (buttonType === 'captcha-checkbox') {
                const captchaCheckbox = document.getElementById('captcha-checkbox-button');
                if (captchaCheckbox) {
                    captchaCheckbox.style.display = 'block';
                    
                    // Update position if values exist
                    const left = buttonElement.querySelector('.captcha-left')?.value;
                    const top = buttonElement.querySelector('.captcha-top')?.value;
                    
                    if (left) {
                        captchaCheckbox.style.left = `${left}%`;
                        captchaCheckbox.style.transform = 'translate(-50%, -50%)';
                    }
                    if (top) {
                        captchaCheckbox.style.top = `${top}%`;
                        captchaCheckbox.style.transform = 'translate(-50%, -50%)';
                    }
                }
            }
            else if (buttonType === 'captcha-puzzle') {
                const captchaPuzzle = document.getElementById('captcha-puzzle-button');
                if (captchaPuzzle) {
                    captchaPuzzle.style.display = 'block';
                    
                    // Update position if values exist
                    const left = buttonElement.querySelector('.captcha-puzzle-left')?.value;
                    const top = buttonElement.querySelector('.captcha-puzzle-top')?.value;
                    
                    if (left) {
                        captchaPuzzle.style.left = `${left}%`;
                        captchaPuzzle.style.transform = 'translate(-50%, -50%)';
                    }
                    if (top) {
                        captchaPuzzle.style.top = `${top}%`;
                        captchaPuzzle.style.transform = 'translate(-50%, -50%)';
                    }
                    
                    // Get values from localStorage if available
                    const stepKey = `step${stepNumber}`;
                    let storedSettings = null;
                    
                    try {
                        // Try to get settings from localStorage
                        const settings = loadSettings();
                        if (settings && settings.steps && settings.steps[stepKey] && 
                            settings.steps[stepKey].buttonSettings) {
                            storedSettings = settings.steps[stepKey].buttonSettings;
                            console.log("Found stored settings for captcha puzzle:", storedSettings);
                        }
                    } catch (e) {
                        console.error("Error loading settings from localStorage:", e);
                    }
                    
                    // Get the step value to determine which dot to color
                    const stepInput = buttonElement.querySelector('.captcha-puzzle-step');
                    let stepValue = 1;
                    if (stepInput) {
                        stepValue = parseInt(stepInput.value) || 1;
                    } else if (storedSettings && storedSettings.step) {
                        stepValue = parseInt(storedSettings.step) || 1;
                    }
                    
                    // Get the totalDots value
                    const totalDotsInput = buttonElement.querySelector('.captcha-puzzle-total-dots');
                    let totalDotsValue = 4;
                    if (totalDotsInput) {
                        totalDotsValue = parseInt(totalDotsInput.value) || 4;
                    } else if (storedSettings && storedSettings.totalDots) {
                        totalDotsValue = parseInt(storedSettings.totalDots) || 4;
                    }
                    
                    // Use the helper function to update dots
                    updateCaptchaPuzzleDots(stepValue, totalDotsValue);
                    
                    // Update fly position
                    const fly = captchaPuzzle.querySelector('.fly-1');
                    if (fly) {
                        // Try to get positions from input fields first
                        let flyLeft = buttonElement.querySelector('.fly-left')?.value;
                        let flyTop = buttonElement.querySelector('.fly-top')?.value;
                        
                        // If not available from input fields, try from localStorage
                        if ((!flyLeft || !flyTop) && storedSettings) {
                            flyLeft = storedSettings.flyLeft || 120;
                            flyTop = storedSettings.flyTop || 117;
                        }
                        
                        // Apply the positions
                        fly.style.left = `${flyLeft}px`;
                        fly.style.top = `${flyTop}px`;
                        console.log(`Applied fly position: left=${flyLeft}px, top=${flyTop}px`);
                    }
                    
                    // Apply cow positions
                    const cowPositions = [
                        { id: 'cow-1', left: 'cow1Left', top: 'cow1Top', defaultLeft: 140, defaultTop: 140 },
                        { id: 'cow-2', left: 'cow2Left', top: 'cow2Top', defaultLeft: 160, defaultTop: 160 },
                        { id: 'cow-3', left: 'cow3Left', top: 'cow3Top', defaultLeft: 180, defaultTop: 180 }
                    ];
                    
                    cowPositions.forEach((cowPos, index) => {
                        const cowId = cowPos.id;
                        const cow = captchaPuzzle.querySelector(`.${cowId}`);
                        
                        if (cow) {
                            // Try to get values from input fields first
                            let cowLeft = buttonElement.querySelector(`.cow${index+1}-left`)?.value;
                            let cowTop = buttonElement.querySelector(`.cow${index+1}-top`)?.value;
                            
                            // If not available, try to get from localStorage
                            if ((!cowLeft || !cowTop) && storedSettings) {
                                cowLeft = storedSettings[cowPos.left] || cowPos.defaultLeft;
                                cowTop = storedSettings[cowPos.top] || cowPos.defaultTop;
                            }
                            
                            // Apply the positions
                            cow.style.left = `${cowLeft}px`;
                            cow.style.top = `${cowTop}px`;
                            console.log(`Applied ${cowId} position: left=${cowLeft}px, top=${cowTop}px`);
                        }
                    });
                }
            }
        }
    } else {
        // If no button, ensure all buttons are hidden
        console.log(`Step ${stepNumber} has no button element`);
    }
    
    // Close dropdown
    document.querySelector('.dropdown-content').classList.remove('show');
    
    // Update iframe dimensions based on the selected step
    updateIframeToMatchSelectedStep(stepNumber);
    
    // Dispatch a stepChanged event
    const event = new Event('stepChanged');
    document.dispatchEvent(event);
    console.log(`Dispatched stepChanged event for step ${stepNumber}`);
}

// Add this helper function to center a button based on iframe dimensions
function centerButtonInIframe(stepContainer, buttonElement) {
    if (!stepContainer || !buttonElement) {
        console.error("Cannot center button: Invalid container or button element");
        return;
    }
    
    // Get the iframe dimensions from the step
    const iframeElement = stepContainer.querySelector('.element-iframe');
    if (!iframeElement) {
        console.error("Cannot center button: No iframe element found");
        return;
    }
    
    const widthInput = iframeElement.querySelector('.iframe-width');
    const heightInput = iframeElement.querySelector('.iframe-height');
    
    if (!widthInput || !heightInput) {
        console.error("Cannot center button: Cannot find iframe dimension inputs");
        return;
    }
    
    const iframeWidth = parseInt(widthInput.value) || 800;
    const iframeHeight = parseInt(heightInput.value) || 600;
    
    // Calculate center position as percentages
    const centerX = 50; // Use percentage instead of pixels
    const centerY = 50; // Use percentage instead of pixels
    
    console.log(`Centering button in iframe (${iframeWidth}x${iframeHeight}), center: (${centerX}%, ${centerY}%)`);
    
    // Get the button type
    const buttonTypeSelect = buttonElement.querySelector('.button-type-select');
    if (!buttonTypeSelect) {
        console.error("Cannot center button: No button type select found");
        return;
    }
    
    const buttonType = buttonTypeSelect.value;
    console.log(`Centering button type: ${buttonType}`);
    
    // Update position inputs based on button type and update preview
    if (buttonType === 'normal') {
        // For normal button, use percentages for centering
        const widthInput = buttonElement.querySelector('.button-width');
        const heightInput = buttonElement.querySelector('.button-height');
        
        if (!widthInput || !heightInput) {
            console.error("Cannot center normal button: Missing dimension inputs");
            return;
        }
        
        const buttonWidth = parseInt(widthInput.value) || 100;
        const buttonHeight = parseInt(heightInput.value) || 40;
        
        // Calculate positions to center the button (use percentages)
        const leftPos = centerX;
        const topPos = centerY;
        
        console.log(`Normal button centered at: (${leftPos}%, ${topPos}%)`);
        
        // Update the input values
        const leftInput = buttonElement.querySelector('.button-left');
        const topInput = buttonElement.querySelector('.button-top');
        
        if (leftInput && topInput) {
            leftInput.value = leftPos;
            topInput.value = topPos;
            
            // Update the preview
            const normalButton = document.getElementById('normal-button');
            if (normalButton) {
                // Use percentage positioning with transform instead of pixel positioning
                normalButton.style.left = `${leftPos}%`;
                normalButton.style.top = `${topPos}%`;
                normalButton.style.transform = 'translate(-50%, -50%)';
            }
        }
    } 
    else if (buttonType === 'captcha-checkbox') {
        // For captcha checkbox, use percentages
        const leftPos = centerX;
        const topPos = centerY;
        
        console.log(`Captcha checkbox centered at: (${leftPos}%, ${topPos}%)`);
        
        // Update the input values
        const leftInput = buttonElement.querySelector('.captcha-left');
        const topInput = buttonElement.querySelector('.captcha-top');
        
        if (leftInput && topInput) {
            leftInput.value = leftPos;
            topInput.value = topPos;
            
            // Update the preview
            const captchaCheckbox = document.getElementById('captcha-checkbox-button');
            if (captchaCheckbox) {
                // Use percentage positioning with transform
                captchaCheckbox.style.left = `${leftPos}%`;
                captchaCheckbox.style.top = `${topPos}%`;
                captchaCheckbox.style.transform = 'translate(-50%, -50%)';
            }
        }
    }
    else if (buttonType === 'captcha-puzzle') {
        // For captcha puzzle, use percentages
        const leftPos = centerX;
        const topPos = centerY;
        
        console.log(`Captcha puzzle centered at: (${leftPos}%, ${topPos}%)`);
        
        // Update the input values
        const leftInput = buttonElement.querySelector('.captcha-puzzle-left');
        const topInput = buttonElement.querySelector('.captcha-puzzle-top');
        
        if (leftInput && topInput) {
            leftInput.value = leftPos;
            topInput.value = topPos;
            
            // Update the preview
            const captchaPuzzle = document.getElementById('captcha-puzzle-button');
            if (captchaPuzzle) {
                // Use percentage positioning with transform
                captchaPuzzle.style.left = `${leftPos}%`;
                captchaPuzzle.style.top = `${topPos}%`;
                captchaPuzzle.style.transform = 'translate(-50%, -50%)';
            }
        }
    }
    
    // Make sure to update the content so it saves the centered positions
    updateStepContent();
}

// Add the randomizeCowPositions function
function randomizeCowPositions(button) {
    // Get the button element (parent container)
    const buttonElement = button.closest('.element-button');
    if (!buttonElement) {
        console.error("Could not find parent button element");
        return;
    }
    
    // Generate random positions within the specified ranges
    const generateRandomPosition = () => {
        return {
            left: Math.floor(Math.random() * (420 - 20 + 1)) + 20, // 20-420
            top: Math.floor(Math.random() * (290 - 25 + 1)) + 25   // 25-290
        };
    };
    
    // Set random positions for each cow
    for (let i = 1; i <= 3; i++) {
        const pos = generateRandomPosition();
        const leftInput = buttonElement.querySelector(`.cow${i}-left`);
        const topInput = buttonElement.querySelector(`.cow${i}-top`);
        
        if (leftInput && topInput) {
            leftInput.value = pos.left;
            topInput.value = pos.top;
            console.log(`Set cow${i} to random position: left=${pos.left}px, top=${pos.top}px`);
        } else {
            console.error(`Could not find cow${i} position inputs`);
        }
    }
    
    // Update the current step display with new positions
    const stepContainer = buttonElement.closest('.step-container');
    if (stepContainer) {
        const stepNumber = parseInt(stepContainer.dataset.stepNumber);
        if (!isNaN(stepNumber)) {
            // Save the settings
            updateStepContent();
            
            // Update dot colors based on current step value
            const stepInput = buttonElement.querySelector('.captcha-puzzle-step');
            if (stepInput) {
                const totalDotsInput = buttonElement.querySelector('.captcha-puzzle-total-dots');
                const totalDots = totalDotsInput ? totalDotsInput.value : 4;
                updateCaptchaPuzzleDots(stepInput.value, totalDots);
            }
            
            // Use selectAppropriateBtnType instead to update the display immediately
            selectAppropriateBtnType(stepContainer);
        }
    }
}

// Debounce function to prevent rapid updates
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Original updateCaptchaPuzzleDots function with direct DOM updates
function updateCaptchaPuzzleDots(stepValue, totalDotsValue) {
    const safeStep = Math.min(Math.max(parseInt(stepValue) || 1, 1), 4);
    const safeTotalDots = Math.min(Math.max(parseInt(totalDotsValue) || 4, 1), 4);
    const captchaPuzzle = document.getElementById('captcha-puzzle-button');
    
    if (captchaPuzzle) {
        // Update dots visibility and colors
        for (let i = 1; i <= 4; i++) {
            const dot = captchaPuzzle.querySelector(`.dot-${i}`);
            if (dot) {
                if (i <= safeTotalDots) {
                    dot.style.display = 'block'; // Show the dot if it's within the total
                    if (i === safeStep) {
                        dot.style.backgroundColor = '#00aaff'; // Blue for active dot
                    } else {
                        dot.style.backgroundColor = '#14141462'; // Gray for inactive dots
                    }
                } else {
                    dot.style.display = 'none'; // Hide the dot if it's beyond the total
                }
            }
        }
        
        // Update background image based on step
        const bgImage = captchaPuzzle.querySelector('.bg-1');
        if (bgImage) {
            // Set background image based on step number
            bgImage.src = `img/bg${safeStep}.png`;
            console.log(`Updated background image to bg${safeStep}.png for step ${safeStep}`);
        }
        
        // Store the value in a data attribute for later reference
        captchaPuzzle.dataset.totalDots = safeTotalDots;
        captchaPuzzle.dataset.currentStep = safeStep;
        
        return true;
    }
    return false;
}

// Function to ensure all dots are displayed according to the total dots setting
function ensureCorrectDotsVisibility() {
    const currentButton = document.querySelector('.iframe-control-button');
    if (!currentButton || !currentButton.dataset.currentStep) return;
    
    const currentStepNumber = parseInt(currentButton.dataset.currentStep);
    const step = document.querySelector(`.step-container[data-step-number="${currentStepNumber}"]`);
    
    if (!step) return;
    
    const buttonElement = step.querySelector('.element-button');
    if (!buttonElement) return;
    
    const buttonTypeSelect = buttonElement.querySelector('.button-type-select');
    if (!buttonTypeSelect || buttonTypeSelect.value !== 'captcha-puzzle') return;
    
    const stepInput = buttonElement.querySelector('.captcha-puzzle-step');
    const totalDotsInput = buttonElement.querySelector('.captcha-puzzle-total-dots');
    
    if (stepInput && totalDotsInput) {
        const stepValue = stepInput.value;
        const totalDots = totalDotsInput.value;
        
        // Force update the dots
        updateCaptchaPuzzleDots(stepValue, totalDots);
        
        // Also check that each dot has the correct display value
        const captchaPuzzle = document.getElementById('captcha-puzzle-button');
        if (!captchaPuzzle) return;
        
        const safeTotalDots = Math.min(Math.max(parseInt(totalDots) || 4, 1), 4);
        for (let i = 1; i <= 4; i++) {
            const dot = captchaPuzzle.querySelector(`.dot-${i}`);
            if (dot) {
                if (i <= safeTotalDots) {
                    if (dot.style.display === 'none') {
                        dot.style.display = 'block';
                    }
                } else {
                    if (dot.style.display !== 'none') {
                        dot.style.display = 'none';
                    }
                }
            }
        }
    }
}

function ensureGreenOverlayVisibility() {
    // Get the captcha checkbox button
    const captchaCheckbox = document.getElementById('captcha-checkbox-button');
    if (!captchaCheckbox) return;
    
    // Make sure green overlay is visible
    const greenOverlay = captchaCheckbox.querySelector('.green-overlay');
    if (greenOverlay) {
        greenOverlay.style.display = 'block';
        greenOverlay.style.setProperty('pointer-events', 'auto', 'important');
    }
}

function forceGreenOverlayClickable() {
    const greenOverlay = document.querySelector('.green-overlay');
    if (greenOverlay) {
        // Force set pointer-events to auto directly on the element
        greenOverlay.style.setProperty('pointer-events', 'auto', 'important');
        
        // Also try to prevent any MutationObserver from changing it back
        setTimeout(() => {
            greenOverlay.style.setProperty('pointer-events', 'auto', 'important');
        }, 50);
    }
}
