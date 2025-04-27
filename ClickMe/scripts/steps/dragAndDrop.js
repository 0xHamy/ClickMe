// file: scripts/steps/dragAndDrop.js
// description: Handles drag-and-drop functionality for adding elements to steps.


// Drag and drop functions
function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
    event.dataTransfer.setData("element-type", event.target.textContent);
    
    // Add dragging class to the dragged element
    event.target.classList.add('dragging');
    
    // Add class to show drop zones are active
    document.querySelectorAll('.step-drop-zone').forEach(zone => {
        zone.classList.add('active');
    });
}

function allowDrop(event) {
    event.preventDefault();
    
    // Highlight the specific drop zone being dragged over
    const dropZone = event.target.closest('.step-drop-zone');
    if (dropZone) {
        dropZone.classList.add('drag-over');
    }
}

// Add this new function for when dragging leaves a zone
function dragLeave(event) {
    const dropZone = event.target.closest('.step-drop-zone');
    if (dropZone) {
        dropZone.classList.remove('drag-over');
    }
}

// Add this for when drag ends (whether dropped or cancelled)
function dragEnd() {
    // Remove active class from all drop zones
    document.querySelectorAll('.step-drop-zone').forEach(zone => {
        zone.classList.remove('active');
        zone.classList.remove('drag-over');
    });
    
    // Remove any other drag-related states if needed
    document.querySelectorAll('.draggable-item').forEach(item => {
        item.classList.remove('dragging');
    });
}

// Function to add textarea input listeners for JS Script elements
function setupScriptInputListeners(scriptElement) {
    const textarea = scriptElement.querySelector('textarea');
    if (textarea) {
        textarea.addEventListener('change', () => {
            updateStepContent();
        });
        
        textarea.addEventListener('keyup', () => {
            updateStepContent();
        });
    }
}

function drop(event) {
    event.preventDefault();
    const elementId = event.dataTransfer.getData("text");
    const elementType = event.dataTransfer.getData("element-type");
    const element = document.getElementById(elementId);
    
    // End the drag operation
    dragEnd();
    
    // Find the step container that this element is being dropped into
    let stepContainer = null;
    let target = event.target;
    
    // Check if we're dropping directly in a drop zone
    const dropZone = target.closest('.step-drop-zone');
    if (dropZone) {
        stepContainer = dropZone.closest('.step-container');
    } else {
        // Traverse up to find the step container
        while (target && !target.classList.contains('step-container') && target.id !== 'steps-list') {
            target = target.parentElement;
        }
        
        if (target && target.classList.contains('step-container')) {
            stepContainer = target;
        } else if (target && target.id === 'steps-list') {
            // If dropped directly into steps-list but not into a step container,
            // use the first step if it exists
            stepContainer = document.querySelector('.step-container');
            
            // If no step exists, create the first step
            if (!stepContainer) {
                addStep();
                stepContainer = document.querySelector('.step-container');
            }
        }
    }
    
    if (stepContainer) {
        const stepNumber = parseInt(stepContainer.dataset.stepNumber);
        
        // Check if this type of element already exists in this step
        const existingElement = stepContainer.querySelector(`.element-${elementType.replace(/\s+/g, '-').toLowerCase()}`);
        
        if (existingElement) {
            // Skip silently instead of showing an alert
            return;
        }
        
        // Create a new element instance to add to the step
        const newElement = document.createElement('div');
        newElement.className = `step-element element-${elementType.replace(/\s+/g, '-').toLowerCase()}`;
        
        // Different HTML structure based on element type
        if (elementType === 'Button') {
            newElement.innerHTML = `
                <div class="element-header">
                    <span>${elementType}</span>
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
                                <option value="normal">Normal Button</option>
                                <option value="captcha-checkbox">Captcha Checkbox</option>
                                <option value="captcha-puzzle">Captcha Puzzle</option>
                            </select>
                        </div>
                        
                        <div class="button-type-settings normal-button-settings">
                            <div class="setting-row">
                                <label>Position:</label>
                                <div class="position-inputs">
                                    <div class="position-input">
                                        <span>Left:</span>
                                        <input type="number" class="button-left" value="50" min="0">
                                        <span>%</span>
                                    </div>
                                    <div class="position-input">
                                        <span>Top:</span>
                                        <input type="number" class="button-top" value="50" min="0">
                                        <span>%</span>
                                    </div>
                                </div>
                            </div>
                            <div class="setting-row">
                                <label>Size:</label>
                                <div class="size-inputs">
                                    <div class="size-input">
                                        <span>Width:</span>
                                        <input type="number" class="button-width" value="100" min="10">
                                        <span>px</span>
                                    </div>
                                    <div class="size-input">
                                        <span>Height:</span>
                                        <input type="number" class="button-height" value="40" min="10">
                                        <span>px</span>
                                    </div>
                                </div>
                            </div>
                            <div class="setting-row">
                                <label>Text:</label>
                                <input type="text" class="button-text" value="Click Me">
                            </div>
                            <div class="setting-row">
                                <label>Color:</label>
                                <input type="color" class="button-color" value="#3a86ff">
                            </div>
                        </div>
                        
                        <div class="button-type-settings captcha-checkbox-button-settings" style="display: none;">
                            <div class="setting-row">
                                <label>Position:</label>
                                <div class="position-inputs">
                                    <div class="position-input">
                                        <span>Left:</span>
                                        <input type="number" class="captcha-left" value="50" min="0">
                                        <span>%</span>
                                    </div>
                                    <div class="position-input">
                                        <span>Top:</span>
                                        <input type="number" class="captcha-top" value="50" min="0">
                                        <span>%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="button-type-settings captcha-puzzle-button-settings" style="display: none;">
                            <div class="setting-row">
                                <label>Position:</label>
                                <div class="position-inputs">
                                    <div class="position-input">
                                        <span>Left:</span>
                                        <input type="number" class="captcha-puzzle-left" value="50" min="0">
                                        <span>%</span>
                                    </div>
                                    <div class="position-input">
                                        <span>Top:</span>
                                        <input type="number" class="captcha-puzzle-top" value="50" min="0">
                                        <span>%</span>
                                    </div>
                                </div>
                            </div>
                            <div class="setting-row">
                                <label>Fly Position:</label>
                                <div class="position-inputs">
                                    <div class="position-input">
                                        <span>Left:</span>
                                        <input type="number" class="fly-left" value="120" min="0">
                                        <span>px</span>
                                    </div>
                                    <div class="position-input">
                                        <span>Top:</span>
                                        <input type="number" class="fly-top" value="120" min="0">
                                        <span>px</span>
                                    </div>
                                </div>
                            </div>
                            <div class="setting-row">
                                <label>Cow1 Position:</label>
                                <div class="position-inputs">
                                    <div class="position-input">
                                        <span>Left:</span>
                                        <input type="number" class="cow1-left" value="140" min="0">
                                        <span>px</span>
                                    </div>
                                    <div class="position-input">
                                        <span>Top:</span>
                                        <input type="number" class="cow1-top" value="140" min="0">
                                        <span>px</span>
                                    </div>
                                </div>
                            </div>
                            <div class="setting-row">
                                <label>Cow2 Position:</label>
                                <div class="position-inputs">
                                    <div class="position-input">
                                        <span>Left:</span>
                                        <input type="number" class="cow2-left" value="160" min="0">
                                        <span>px</span>
                                    </div>
                                    <div class="position-input">
                                        <span>Top:</span>
                                        <input type="number" class="cow2-top" value="160" min="0">
                                        <span>px</span>
                                    </div>
                                </div>
                            </div>
                            <div class="setting-row">
                                <label>Cow3 Position:</label>
                                <div class="position-inputs">
                                    <div class="position-input">
                                        <span>Left:</span>
                                        <input type="number" class="cow3-left" value="180" min="0">
                                        <span>px</span>
                                    </div>
                                    <div class="position-input">
                                        <span>Top:</span>
                                        <input type="number" class="cow3-top" value="180" min="0">
                                        <span>px</span>
                                    </div>
                                </div>
                            </div>
                            <div class="setting-row">
                                <button type="button" class="randomize-cows-button" onclick="randomizeCowPositions(this)">Randomize Cow Positions</button>
                            </div>
                            <div class="setting-row">
                                <label>Step:</label>
                                <input type="number" class="captcha-puzzle-step" value="1" min="1" max="4">
                            </div>
                            <div class="setting-row">
                                <label>Total Dots:</label>
                                <input type="number" class="captcha-puzzle-total-dots" value="4" min="1" max="4">
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Set initial button code
            setTimeout(() => {
                // Center the button in the iframe
                centerButtonInIframe(stepContainer, newElement);
                
                updateButtonCode(newElement);
                // Setup event listeners for inputs
                setupButtonInputListeners(newElement);
                
                // Make sure the preview reflects the centered button
                const buttonType = newElement.querySelector('.button-type-select').value;
                selectAppropriateBtnType(stepContainer);
            }, 0);
        } else if (elementType === 'JS Script') {
            newElement.innerHTML = `
                <div class="element-header">
                    <span>${elementType}</span>
                    <div class="header-actions">
                        <button class="remove-element" onclick="removeElement(this)">×</button>
                    </div>
                </div>
                <div class="element-content">
                    <textarea placeholder="Enter ${elementType} code here"></textarea>
                </div>
            `;
            
            newElement.querySelector('textarea').value = 
            `<script>
  console.log("Script executed");
  // Your code here
</script>`;

            // Setup event listeners for the script textarea
            setTimeout(() => {
                setupScriptInputListeners(newElement);
            }, 0);
        }
        
        // Find the proper position to insert the element
        const timeoutElement = stepContainer.querySelector('.element-timeout');
        const dropZoneElement = stepContainer.querySelector('.step-drop-zone');
        
        if (timeoutElement) {
            stepContainer.insertBefore(newElement, timeoutElement);
            
            // Hide the drop zone when any element is added
            if (dropZoneElement) {
                dropZoneElement.style.display = 'none';
            }
        } else {
            stepContainer.appendChild(newElement);
            
            // If we don't have a timeout element, add it
            addTimeoutElement(stepContainer);
        }
        
        // Save the content
        updateStepContent();
        
        // Remove the drop instruction if it exists
        const dropInstruction = document.querySelector('.drop-instruction');
        if (dropInstruction) {
            dropInstruction.remove();
        }
    }
}