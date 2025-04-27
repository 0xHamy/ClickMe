// file: menu.js
// description: Main script for initializing the application and handling events.

// Keep track of steps
let currentStepNumber = 1;
let stepsContent = {};

// DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS rules for button positioning
    setupButtonContainerCSS();
    
    // Restructure the DOM to separate button-container
    restructureButtonContainer();
    
    // Make sure the menu section is clickable
    const menuSection = document.getElementById('menu');
    if (menuSection) {
        menuSection.style.pointerEvents = 'auto';
    }

    // Make sure the dropdown button is clickable
    const dropdownBtn = document.querySelector('.iframe-control-button');
    if (dropdownBtn) {
        dropdownBtn.style.pointerEvents = 'auto';
    }
    
    // Force normal button to have pointer-events: none
    const normalButton = document.getElementById('normal-button');
    if (normalButton) {
        normalButton.style.pointerEvents = 'none';
        const buttonElements = normalButton.querySelectorAll('button');
        buttonElements.forEach(button => {
            button.style.pointerEvents = 'none';
        });
        
        // Create a MutationObserver to ensure pointer-events stays 'none'
        const observer = new MutationObserver(function(mutations) {
            if (normalButton.style.pointerEvents !== 'none') {
                normalButton.style.pointerEvents = 'none';
            }
            
            // Also check child buttons
            const buttons = normalButton.querySelectorAll('button');
            buttons.forEach(button => {
                if (button.style.pointerEvents !== 'none') {
                    button.style.pointerEvents = 'none';
                }
            });
        });
        
        // Observe changes to style attribute
        observer.observe(normalButton, { 
            attributes: true, 
            attributeFilter: ['style'],
            subtree: true
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
        
        // Create a MutationObserver to maintain dot visibility based on total dots setting
        const dotsObserver = new MutationObserver(function() {
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
                const step = stepInput.value;
                const totalDots = totalDotsInput.value;
                
                // Re-apply the total dots setting
                updateCaptchaPuzzleDots(step, totalDots);
            }
        });
        
        // Observe changes to the dots container
        const dotsContainer = puzzleButton.querySelector('.dots-container');
        if (dotsContainer) {
            dotsObserver.observe(dotsContainer, { 
                attributes: true,
                childList: true,
                subtree: true,
                attributeFilter: ['style']
            });
        }
        
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
    
    // Set up a periodic check to ensure menu controls are clickable
    setInterval(function() {
        ensureMenuControlsAreClickable();
        ensureCorrectDotsVisibility();
        ensureGreenOverlayVisibility(); // Also explicitly check for green overlay visibility
    }, 1000);
    
    updateUIWithSettings();
    
    // Add event listeners to save changes
    const urlInput = document.querySelector('#iframe-url');
    const backgroundSelect = document.querySelector('#background-select');
    const credentiallessCheckbox = document.querySelector('#credentialless-iframe');
    const iframe = document.querySelector('#iframe-section iframe');

    if (urlInput) {
        urlInput.addEventListener('change', function() {
            currentSettings.url = this.value;
            if (iframe) iframe.src = this.value;
            saveSettings(currentSettings);
        });
    }

    if (backgroundSelect) {
        backgroundSelect.addEventListener('change', function() {
            currentSettings.background = this.value;
            updateBackgroundVisibility(this.value);
            saveSettings(currentSettings);
        });
        
        // Initialize background visibility with current setting
        updateBackgroundVisibility(backgroundSelect.value);
    }

    if (credentiallessCheckbox) {
        credentiallessCheckbox.addEventListener('change', function() {
            currentSettings.credentialless = this.checked;
            saveSettings(currentSettings);
        });
    }

    // Initialize steps
    initializeSteps();

    // Initialize settings panel state
    const settingsPanel = document.getElementById('settings-panel');
    settingsPanel.classList.remove('active');

    // Close settings panel when clicking outside
    document.addEventListener('click', function(event) {
        const settingsSection = document.getElementById('section-1');
        const settingsPanel = document.getElementById('settings-panel');
        const settingsHeader = document.querySelector('.settings-header');
        
        if (!settingsSection.contains(event.target) && settingsPanel.classList.contains('active')) {
            settingsPanel.classList.remove('active');
            settingsHeader.classList.remove('active');
        }
    });
});

// Close preview when clicking outside
document.addEventListener('click', function(event) {
    const exportPreview = document.getElementById('export-preview');
    const exportContent = document.querySelector('.export-preview-content');
    
    if (exportPreview.classList.contains('show') && 
        !exportContent.contains(event.target) && 
        !event.target.matches('#export-btn')) {
        closeExportPreview();
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.dropdown-content');
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
});

// Ensure dots are updated when page is fully loaded
window.addEventListener('load', function() {
    console.log("Window loaded - Updating captcha puzzle dots");
    
    // Find the current step
    const currentButton = document.querySelector('.iframe-control-button');
    if (!currentButton || !currentButton.dataset.currentStep) return;
    
    const currentStepNumber = parseInt(currentButton.dataset.currentStep);
    const step = document.querySelector(`.step-container[data-step-number="${currentStepNumber}"]`);
    
    if (step) {
        const buttonElement = step.querySelector('.element-button');
        if (buttonElement) {
            const buttonTypeSelect = buttonElement.querySelector('.button-type-select');
            if (buttonTypeSelect && buttonTypeSelect.value === 'captcha-puzzle') {
                const stepInput = buttonElement.querySelector('.captcha-puzzle-step');
                const totalDotsInput = buttonElement.querySelector('.captcha-puzzle-total-dots');
                
                if (stepInput) {
                    const step = stepInput.value;
                    const totalDots = totalDotsInput ? totalDotsInput.value : 4;
                    
                    console.log(`Found captcha puzzle step with value: ${step} and total dots: ${totalDots}`);
                    setTimeout(function() {
                        updateCaptchaPuzzleDots(step, totalDots);
                        console.log(`Applied dot colors for step: ${step} with total dots: ${totalDots}`);
                    }, 500);
                }
            }
        }
    }
});

// Set up a periodic check to ensure menu controls are clickable and dots visibility is correct
setInterval(function() {
    ensureMenuControlsAreClickable();
    ensureCorrectDotsVisibility();
    ensureGreenOverlayVisibility();
    forceGreenOverlayClickable(); // Force the green overlay to be clickable
}, 100);

// Make selectStep available globally
window.selectStep = selectStep;