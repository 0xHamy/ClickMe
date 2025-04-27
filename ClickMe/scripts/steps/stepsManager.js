// file: scripts/steps/stepsManager.js
// description: Manages the creation, removal, and updating of steps.

function addStep() {
    currentStepNumber++;
    
    const stepContainer = document.createElement('div');
    stepContainer.className = 'step-container';
    stepContainer.dataset.stepNumber = currentStepNumber;
    
    const defaultStepName = `Step ${currentStepNumber}`;
    stepContainer.dataset.stepName = defaultStepName;
    
    const stepHeader = document.createElement('div');
    stepHeader.className = 'step-header';
    stepHeader.innerHTML = `
        <div class="step-title">
            <span class="step-number">${defaultStepName}</span>
            <input type="text" class="step-name" value="${defaultStepName}" placeholder="Enter step name" onchange="updateStepName(this)">
            <button class="edit-step-name" onclick="toggleStepNameEdit(this)">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
            </button>
        </div>
        <button class="remove-step" onclick="removeStep(this)">×</button>
    `;
    
    stepContainer.appendChild(stepHeader);
    
    // Add default elements for a step
    addIframeElement(stepContainer);
    
    // Add drop zone indicator
    const dropZone = document.createElement('div');
    dropZone.className = 'step-drop-zone';
    dropZone.setAttribute('ondragover', 'allowDrop(event)');
    dropZone.setAttribute('ondragleave', 'dragLeave(event)');
    dropZone.setAttribute('ondrop', 'drop(event)');
    dropZone.style.display = 'block'; // Ensure it's visible by default
    dropZone.innerHTML = `
        <div class="drop-zone-indicator">
            <span>Drag elements here</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
        </div>
    `;
    stepContainer.appendChild(dropZone);
    
    addTimeoutElement(stepContainer);
    
    // Add the step to the steps list
    const stepsList = document.getElementById('steps-list');
    stepsList.appendChild(stepContainer);
    
    updateStepContent();
    
    // Update the steps dropdown
    updateStepsDropdown();
}

function removeStep(button) {
    const stepContainer = button.closest('.step-container');
    if (stepContainer) {
        stepContainer.remove();
        updateStepNumbers();
        updateStepContent();
        
        // Update the steps dropdown
        updateStepsDropdown();
    }
}

function updateStepNumbers() {
    const steps = document.querySelectorAll('.step-container');
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        const oldStepNumber = step.dataset.stepNumber;
        step.dataset.stepNumber = stepNumber;
        
        // Update the step number display
        const stepNumberEl = step.querySelector('.step-number');
        if (stepNumberEl) {
            // Use custom name if it exists, otherwise use default step number
            const customName = step.dataset.stepName;
            stepNumberEl.textContent = customName || `Step ${stepNumber}`;
        }
        
        // Update the step name input placeholder if it doesn't have a custom name
        const stepNameInput = step.querySelector('.step-name');
        if (stepNameInput && !step.dataset.stepName) {
            stepNameInput.value = `Step ${stepNumber}`;
        }
    });
    currentStepNumber = steps.length;
    
    // Save step content
    updateStepContent();
    
    // Update the steps dropdown
    updateStepsDropdown();
}

function updateStepContent() {
    stepsContent = {};
    const steps = document.querySelectorAll('.step-container');
    
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        const stepKey = `step${stepNumber}`;
        
        stepsContent[stepKey] = {};
        
        // Save step name if it exists
        const stepName = step.dataset.stepName || `Step ${stepNumber}`;
        stepsContent[stepKey].name = stepName;
        
        // Get iframe settings
        const iframeElement = step.querySelector('.element-iframe');
        if (iframeElement) {
            const width = iframeElement.querySelector('.iframe-width').value;
            const height = iframeElement.querySelector('.iframe-height').value;
            stepsContent[stepKey].iframe = { width: width, height: height };
        }
        
        // Get button content if it exists
        const buttonElement = step.querySelector('.element-button');
        if (buttonElement) {
            // Instead of storing the full code, just store the button type
            const buttonType = buttonElement.querySelector('.button-type-select').value;
            stepsContent[stepKey].button = buttonType;
            
            // Save button settings
            stepsContent[stepKey].buttonSettings = { type: buttonType };
            
            // Save specific settings based on button type
            if (buttonType === 'normal') {
                stepsContent[stepKey].buttonSettings.left = buttonElement.querySelector('.button-left')?.value || '50';
                stepsContent[stepKey].buttonSettings.top = buttonElement.querySelector('.button-top')?.value || '50';
                stepsContent[stepKey].buttonSettings.width = buttonElement.querySelector('.button-width')?.value || '100';
                stepsContent[stepKey].buttonSettings.height = buttonElement.querySelector('.button-height')?.value || '40';
                stepsContent[stepKey].buttonSettings.text = buttonElement.querySelector('.button-text')?.value || 'Click Me';
                stepsContent[stepKey].buttonSettings.color = buttonElement.querySelector('.button-color')?.value || '#3a86ff';
            } else if (buttonType === 'captcha-checkbox') {
                stepsContent[stepKey].buttonSettings.left = buttonElement.querySelector('.captcha-left')?.value || '50';
                stepsContent[stepKey].buttonSettings.top = buttonElement.querySelector('.captcha-top')?.value || '50';
            } else if (buttonType === 'captcha-puzzle') {
                try {
                    // Add debug logs to check what's happening
                    console.log("Saving captcha-puzzle settings");
                    
                    const leftInput = buttonElement.querySelector('.captcha-puzzle-left');
                    const topInput = buttonElement.querySelector('.captcha-puzzle-top');
                    const stepInput = buttonElement.querySelector('.captcha-puzzle-step');
                    const flyLeftInput = buttonElement.querySelector('.fly-left');
                    const flyTopInput = buttonElement.querySelector('.fly-top');
                    const cow1LeftInput = buttonElement.querySelector('.cow1-left');
                    const cow1TopInput = buttonElement.querySelector('.cow1-top');
                    const cow2LeftInput = buttonElement.querySelector('.cow2-left');
                    const cow2TopInput = buttonElement.querySelector('.cow2-top');
                    const cow3LeftInput = buttonElement.querySelector('.cow3-left');
                    const cow3TopInput = buttonElement.querySelector('.cow3-top');
                    
                    // Log which selectors aren't found
                    if (!leftInput) console.error("Could not find .captcha-puzzle-left input");
                    if (!topInput) console.error("Could not find .captcha-puzzle-top input");
                    if (!stepInput) console.error("Could not find .captcha-puzzle-step input");
                    const totalDotsInput = buttonElement.querySelector('.captcha-puzzle-total-dots');
                    if (!totalDotsInput) console.error("Could not find .captcha-puzzle-total-dots input");
                    if (!flyLeftInput) console.error("Could not find .fly-left input");
                    if (!flyTopInput) console.error("Could not find .fly-top input");
                    if (!cow1LeftInput) console.error("Could not find .cow1-left input");
                    if (!cow1TopInput) console.error("Could not find .cow1-top input");
                    if (!cow2LeftInput) console.error("Could not find .cow2-left input");
                    if (!cow2TopInput) console.error("Could not find .cow2-top input");
                    if (!cow3LeftInput) console.error("Could not find .cow3-left input");
                    if (!cow3TopInput) console.error("Could not find .cow3-top input");
                    
                    // Only set values if the input exists
                    stepsContent[stepKey].buttonSettings.left = leftInput ? leftInput.value : null;
                    stepsContent[stepKey].buttonSettings.top = topInput ? topInput.value : null;
                    stepsContent[stepKey].buttonSettings.step = stepInput ? stepInput.value : null;
                    stepsContent[stepKey].buttonSettings.totalDots = totalDotsInput ? totalDotsInput.value : 4;
                    stepsContent[stepKey].buttonSettings.flyLeft = flyLeftInput ? flyLeftInput.value : null;
                    stepsContent[stepKey].buttonSettings.flyTop = flyTopInput ? flyTopInput.value : null;
                    stepsContent[stepKey].buttonSettings.cow1Left = cow1LeftInput ? cow1LeftInput.value : null;
                    stepsContent[stepKey].buttonSettings.cow1Top = cow1TopInput ? cow1TopInput.value : null;
                    stepsContent[stepKey].buttonSettings.cow2Left = cow2LeftInput ? cow2LeftInput.value : null;
                    stepsContent[stepKey].buttonSettings.cow2Top = cow2TopInput ? cow2TopInput.value : null;
                    stepsContent[stepKey].buttonSettings.cow3Left = cow3LeftInput ? cow3LeftInput.value : null;
                    stepsContent[stepKey].buttonSettings.cow3Top = cow3TopInput ? cox3TopInput.value : null;
                    
                    console.log("Saved captcha-puzzle settings:", stepsContent[stepKey].buttonSettings);
                } catch (error) {
                    console.error("Error saving captcha-puzzle settings:", error);
                    // Set minimal values to prevent the settings from being empty
                    stepsContent[stepKey].buttonSettings.left = 100;
                    stepsContent[stepKey].buttonSettings.top = 100;
                }
            }
        }
        
        // Get JS script content if it exists
        const scriptElement = step.querySelector('.element-js-script');
        if (scriptElement) {
            stepsContent[stepKey].script = scriptElement.querySelector('textarea').value;
        }
        
        // Get timeout value
        const timeoutElement = step.querySelector('.element-timeout');
        if (timeoutElement) {
            stepsContent[stepKey].timeout = timeoutElement.querySelector('.timeout-value').value;
        }
    });
    
    // Update the current settings
    currentSettings.steps = stepsContent;
    saveSettings(currentSettings);
    
    // Update the steps dropdown when steps content changes
    updateStepsDropdown();
}

function addSeparator() {
    // This creates a new step
    addStep();
    
    // After adding the step, select it automatically
    // Get the number of the newly created step
    const steps = document.querySelectorAll('.step-container');
    const newStepNumber = steps.length;
    
    // Select the newly created step
    if (newStepNumber > 0) {
        console.log(`Auto-selecting newly created step ${newStepNumber}`);
        selectStep(newStepNumber);
    }
}

function clearSteps() {
    if (confirm('Are you sure you want to clear all steps?')) {
        const stepsList = document.getElementById('steps-list');
        stepsList.innerHTML = '';
        
        // Reset step counter
        currentStepNumber = 0;
        
        // Add the first step
        addStep();
        
        // Update settings
        updateStepContent();
    }
}

// Initialize steps from settings or create the first step
function initializeSteps() {
    const stepsList = document.getElementById('steps-list');
    
    // Clear any existing content
    stepsList.innerHTML = '';
    
    // Ensure currentSettings is initialized
    if (!currentSettings) {
        console.warn('currentSettings is undefined, initializing with defaults');
        currentSettings = loadSettings() || {
            url: 'https://example.com',
            background: 'none',
            credentialless: true,
            steps: {}
        };
    }
    
    // Add the initial step if no steps exist
    if (Object.keys(currentSettings.steps).length === 0 || !currentSettings.steps.step1) {
        // Reset step counter
        currentStepNumber = 0;
        addStep();
    } else {
        // Load steps from settings
        let maxStepNumber = 0;
        // Find out how many steps we have
        Object.keys(currentSettings.steps).forEach(stepKey => {
            if (stepKey.startsWith('step')) {
                const stepNumber = parseInt(stepKey.replace('step', ''));
                if (stepNumber > maxStepNumber) {
                    maxStepNumber = stepNumber;
                }
            }
        });
        
        // Create each step in order
        for (let i = 1; i <= maxStepNumber; i++) {
            const stepKey = `step${i}`;
            const stepData = currentSettings.steps[stepKey];
            
            if (stepData) {
                // Create a new step
                const stepContainer = document.createElement('div');
                stepContainer.className = 'step-container';
                stepContainer.dataset.stepNumber = i;
                
                // Set step name if available
                const stepName = stepData.name || `Step ${i}`;
                stepContainer.dataset.stepName = stepName;
                
                // Create step header
                const stepHeader = document.createElement('div');
                stepHeader.className = 'step-header';
                stepHeader.innerHTML = `
                    <div class="step-title">
                        <span class="step-number">${stepName}</span>
                        <input type="text" class="step-name" value="${stepName}" placeholder="Enter step name" onchange="updateStepName(this)">
                        <button class="edit-step-name" onclick="toggleStepNameEdit(this)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                            </svg>
                        </button>
                    </div>
                    <button class="remove-step" onclick="removeStep(this)">×</button>
                `;
                
                stepContainer.appendChild(stepHeader);
                
                // Add iframe element
                addIframeElement(stepContainer);
                
                // Set iframe dimensions if available
                if (stepData.iframe) {
                    const iframeElement = stepContainer.querySelector('.element-iframe');
                    if (iframeElement) {
                        const widthInput = iframeElement.querySelector('.iframe-width');
                        const heightInput = iframeElement.querySelector('.iframe-height');
                        
                        if (widthInput && stepData.iframe.width) {
                            widthInput.value = stepData.iframe.width;
                        }
                        
                        if (heightInput && stepData.iframe.height) {
                            heightInput.value = stepData.iframe.height;
                        }
                    }
                }
                
                // Add drop zone indicator
                const dropZone = document.createElement('div');
                dropZone.className = 'step-drop-zone';
                dropZone.setAttribute('ondragover', 'allowDrop(event)');
                dropZone.setAttribute('ondragleave', 'dragLeave(event)');
                dropZone.setAttribute('ondrop', 'drop(event)');
                dropZone.style.display = 'block';
                dropZone.innerHTML = `
                    <div class="drop-zone-indicator">
                        <span>Drag elements here</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <polyline points="19 12 12 19 5 12"></polyline>
                        </svg>
                    </div>
                `;
                stepContainer.appendChild(dropZone);
                
                // Add button element if available
                if (stepData.button) {
                    // Create button element simulation here - simplified version
                    const buttonElement = document.createElement('div');
                    buttonElement.className = 'step-element element-button';
                    
                    // Build button content based on the saved type and settings
                    let buttonContent = `
                        <div class="element-header">
                            <span>Button</span>
                            <div class="header-actions">
                                <button class="settings-toggle" onclick="toggleElementSettings(this)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="3"></circle>
                                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                    </svg>
                                </button>
                                <button class="remove-element" onclick="removeElement(this)">×</button>
                            </div>
                        </div>
                        <div class="element-content hidden">
                            <div class="button-settings">
                                <div class="setting-row">
                                    <label>Button Type:</label>
                                    <select class="button-type-select" onchange="updateButtonSettings(this)">
                                        <option value="normal" ${stepData.button === 'normal' ? 'selected' : ''}>Normal Button</option>
                                        <option value="captcha-checkbox" ${stepData.button === 'captcha-checkbox' ? 'selected' : ''}>Captcha Checkbox</option>
                                        <option value="captcha-puzzle" ${stepData.button === 'captcha-puzzle' ? 'selected' : ''}>Captcha Puzzle</option>
                                    </select>
                                </div>
                    `;
                    
                    // Add settings based on button type
                    if (stepData.buttonSettings) {
                        const settings = stepData.buttonSettings;
                        
                        // Add normal button settings
                        buttonContent += `
                            <div class="button-type-settings normal-button-settings" ${settings.type !== 'normal' ? 'style="display: none;"' : ''}>
                                <div class="setting-row">
                                    <label>Position:</label>
                                    <div class="position-inputs">
                                        <div class="position-input">
                                            <span>Left:</span>
                                            <input type="number" class="button-left" value="${settings.left || 50}" min="0">
                                            <span>%</span>
                                        </div>
                                        <div class="position-input">
                                            <span>Top:</span>
                                            <input type="number" class="button-top" value="${settings.top || 50}" min="0">
                                            <span>%</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="setting-row">
                                    <label>Size:</label>
                                    <div class="size-inputs">
                                        <div class="size-input">
                                            <span>Width:</span>
                                            <input type="number" class="button-width" value="${settings.width || 100}" min="10">
                                            <span>px</span>
                                        </div>
                                        <div class="size-input">
                                            <span>Height:</span>
                                            <input type="number" class="button-height" value="${settings.height || 40}" min="10">
                                            <span>px</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="setting-row">
                                    <label>Text:</label>
                                    <input type="text" class="button-text" value="${settings.text || 'Click Me'}">
                                </div>
                                <div class="setting-row">
                                    <label>Color:</label>
                                    <input type="color" class="button-color" value="${settings.color || '#3a86ff'}">
                                </div>
                            </div>
                        `;
                        
                        // Add captcha checkbox settings
                        buttonContent += `
                            <div class="button-type-settings captcha-checkbox-button-settings" ${settings.type !== 'captcha-checkbox' ? 'style="display: none;"' : ''}>
                                <div class="setting-row">
                                    <label>Position:</label>
                                    <div class="position-inputs">
                                        <div class="position-input">
                                            <span>Left:</span>
                                            <input type="number" class="captcha-left" value="${settings.left || 50}" min="0">
                                            <span>%</span>
                                        </div>
                                        <div class="position-input">
                                            <span>Top:</span>
                                            <input type="number" class="captcha-top" value="${settings.top || 50}" min="0">
                                            <span>%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                        
                        // Add captcha puzzle settings
                        buttonContent += `
                            <div class="button-type-settings captcha-puzzle-button-settings" ${settings.type !== 'captcha-puzzle' ? 'style="display: none;"' : ''}>
                                <div class="setting-row">
                                    <label>Position:</label>
                                    <div class="position-inputs">
                                        <div class="position-input">
                                            <span>Left:</span>
                                            <input type="number" class="captcha-puzzle-left" value="${settings.left || 50}" min="0">
                                            <span>%</span>
                                        </div>
                                        <div class="position-input">
                                            <span>Top:</span>
                                            <input type="number" class="captcha-puzzle-top" value="${settings.top || 50}" min="0">
                                            <span>%</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="setting-row">
                                    <label>Fly Position:</label>
                                    <div class="position-inputs">
                                        <div class="position-input">
                                            <span>Left:</span>
                                            <input type="number" class="fly-left" value="${settings.flyLeft || 120}" min="0">
                                            <span>px</span>
                                        </div>
                                        <div class="position-input">
                                            <span>Top:</span>
                                            <input type="number" class="fly-top" value="${settings.flyTop || 120}" min="0">
                                            <span>px</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="setting-row">
                                    <label>Cow1 Position:</label>
                                    <div class="position-inputs">
                                        <div class="position-input">
                                            <span>Left:</span>
                                            <input type="number" class="cow1-left" value="${settings.cow1Left || 140}" min="0">
                                            <span>px</span>
                                        </div>
                                        <div class="position-input">
                                            <span>Top:</span>
                                            <input type="number" class="cow1-top" value="${settings.cow1Top || 140}" min="0">
                                            <span>px</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="setting-row">
                                    <label>Cow2 Position:</label>
                                    <div class="position-inputs">
                                        <div class="position-input">
                                            <span>Left:</span>
                                            <input type="number" class="cow2-left" value="${settings.cow2Left || 160}" min="0">
                                            <span>px</span>
                                        </div>
                                        <div class="position-input">
                                            <span>Top:</span>
                                            <input type="number" class="cow2-top" value="${settings.cow2Top || 160}" min="0">
                                            <span>px</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="setting-row">
                                    <label>Cow3 Position:</label>
                                    <div class="position-inputs">
                                        <div class="position-input">
                                            <span>Left:</span>
                                            <input type="number" class="cow3-left" value="${settings.cow3Left || 180}" min="0">
                                            <span>px</span>
                                        </div>
                                        <div class="position-input">
                                            <span>Top:</span>
                                            <input type="number" class="cow3-top" value="${settings.cow3Top || 180}" min="0">
                                            <span>px</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="setting-row">
                                    <button type="button" class="randomize-cows-button" onclick="randomizeCowPositions(this)">Randomize Cow Positions</button>
                                </div>
                                <div class="setting-row">
                                    <label>Step:</label>
                                    <input type="number" class="captcha-puzzle-step" value="${settings.step || 1}" min="1" max="4">
                                </div>
                                <div class="setting-row">
                                    <label>Total Dots:</label>
                                    <input type="number" class="captcha-puzzle-total-dots" value="${settings.totalDots || 4}" min="1" max="4">
                                </div>
                            </div>
                        `;
                    }
                    
                    buttonContent += `
                            </div>
                        </div>
                    `;
                    
                    buttonElement.innerHTML = buttonContent;
                    stepContainer.appendChild(buttonElement);
                    
                    // Hide the drop zone when we have a button
                    dropZone.style.display = 'none';
                    
                    // Set up event listeners for the button
                    setTimeout(() => {
                        setupButtonInputListeners(buttonElement);
                        
                        // Center the button if it doesn't have position settings
                        // Only center if the button doesn't already have explicit position settings
                        const buttonType = buttonElement.querySelector('.button-type-select').value;
                        let hasPosition = false;
                        
                        if (buttonType === 'normal') {
                            hasPosition = stepData.buttonSettings.left && stepData.buttonSettings.top;
                        } else if (buttonType === 'captcha-checkbox') {
                            hasPosition = stepData.buttonSettings.left && stepData.buttonSettings.top;
                        } else if (buttonType === 'captcha-puzzle') {
                            hasPosition = stepData.buttonSettings.left && stepData.buttonSettings.top;
                        }
                        
                        if (!hasPosition) {
                            console.log("Button doesn't have position settings, centering automatically");
                            centerButtonInIframe(stepContainer, buttonElement);
                        }
                    }, 100);
                }
                
                // Add script element if available
                if (stepData.script) {
                    const scriptElement = document.createElement('div');
                    scriptElement.className = 'step-element element-js-script';
                    scriptElement.innerHTML = `
                        <div class="element-header">
                            <span>JS Script</span>
                            <div class="header-actions">
                                <button class="remove-element" onclick="removeElement(this)">×</button>
                            </div>
                        </div>
                        <div class="element-content">
                            <textarea placeholder="Enter JS Script code here">${stepData.script}</textarea>
                        </div>
                    `;
                    stepContainer.appendChild(scriptElement);
                    
                    // Hide the drop zone when we have a script
                    dropZone.style.display = 'none';
                    
                    // Set up event listeners for the script textarea
                    setTimeout(() => {
                        setupScriptInputListeners(scriptElement);
                    }, 0);
                }
                
                // Add timeout element
                addTimeoutElement(stepContainer);
                
                // Set timeout value if available
                if (stepData.timeout) {
                    const timeoutElement = stepContainer.querySelector('.element-timeout');
                    if (timeoutElement) {
                        const timeoutInput = timeoutElement.querySelector('.timeout-value');
                        if (timeoutInput) {
                            timeoutInput.value = stepData.timeout;
                        }
                    }
                }
                
                // Add the step to the steps list
                stepsList.appendChild(stepContainer);
            }
        }
        
        // Update current step number
        currentStepNumber = maxStepNumber;
    }
    
    // Remove the drop instruction if we have at least one step
    if (currentStepNumber > 0) {
        const dropInstruction = document.querySelector('.drop-instruction');
        if (dropInstruction) {
            dropInstruction.remove();
        }
    }
    
    // Update the steps dropdown
    updateStepsDropdown();
}