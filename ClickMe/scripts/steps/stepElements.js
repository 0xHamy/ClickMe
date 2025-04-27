// file: scripts/steps/stepElements.js
// description: Manages the addition and removal of elements within steps.

function addTimeoutElement(stepContainer) {
    const timeoutElement = document.createElement('div');
    timeoutElement.className = 'step-element element-timeout';
    timeoutElement.innerHTML = `
        <div class="element-header">
            <span>Timeout</span>
            <div class="header-actions">
                <button class="settings-toggle" onclick="toggleElementSettings(this)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                </button>
            </div>
        </div>
        <div class="element-content hidden">
            <div class="timeout-setting">
                <label>Delay:</label>
                <input type="number" class="timeout-value" value="1000" min="0">
                <span>ms</span>
            </div>
        </div>
    `;
    stepContainer.appendChild(timeoutElement);
    
    // Add event listeners for immediate localStorage updates
    const timeoutInput = timeoutElement.querySelector('.timeout-value');
    if (timeoutInput) {
        timeoutInput.addEventListener('change', () => {
            updateStepContent();
        });
        
        timeoutInput.addEventListener('keyup', () => {
            updateStepContent();
        });
    }
}

function addIframeElement(stepContainer) {
    const iframeElement = document.createElement('div');
    iframeElement.className = 'step-element element-iframe';
    iframeElement.innerHTML = `
        <div class="element-header">
            <span>Iframe</span>
            <div class="header-actions">
                <button class="settings-toggle" onclick="toggleElementSettings(this)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                </button>
            </div>
        </div>
        <div class="element-content hidden">
            <div class="iframe-settings">
                <div class="iframe-dimension">
                    <label>Width:</label>
                    <input type="number" class="iframe-width" value="800" min="10">
                    <span>px</span>
                </div>
                <div class="iframe-dimension">
                    <label>Height:</label>
                    <input type="number" class="iframe-height" value="600" min="10">
                    <span>px</span>
                </div>
            </div>
        </div>
    `;
    stepContainer.appendChild(iframeElement);
    
    // Add event listeners for immediate localStorage updates
    const inputs = iframeElement.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            updateStepContent();
            
            // Check if this step is currently selected, if so update the iframe dimensions
            const currentButton = document.querySelector('.iframe-control-button');
            if (currentButton && currentButton.dataset.currentStep) {
                const currentStepNumber = parseInt(currentButton.dataset.currentStep);
                const thisStepNumber = parseInt(stepContainer.dataset.stepNumber);
                if (currentStepNumber === thisStepNumber) {
                    updateIframeToMatchSelectedStep(currentStepNumber);
                }
            }
        });
        
        input.addEventListener('keyup', () => {
            updateStepContent();
            
            // Real-time updates as the user types
            const currentButton = document.querySelector('.iframe-control-button');
            if (currentButton && currentButton.dataset.currentStep) {
                const currentStepNumber = parseInt(currentButton.dataset.currentStep);
                const thisStepNumber = parseInt(stepContainer.dataset.stepNumber);
                if (currentStepNumber === thisStepNumber) {
                    updateIframeToMatchSelectedStep(currentStepNumber);
                }
            }
        });
    });
}

function removeElement(button) {
    const element = button.closest('.step-element');
    if (element && !element.classList.contains('element-iframe') && !element.classList.contains('element-timeout')) {
        const stepContainer = element.closest('.step-container');
        
        // Remove the element
        element.remove();
        
        // Check if there are any remaining custom elements (button or js script)
        const hasButton = stepContainer.querySelector('.element-button');
        const hasScript = stepContainer.querySelector('.element-js-script');
        
        // Only show the drop zone if there are no custom elements left
        if (!hasButton && !hasScript) {
            const dropZone = stepContainer.querySelector('.step-drop-zone');
            if (dropZone) {
                dropZone.style.display = 'block';
            }
        }
        
        updateStepContent();
    }
}
