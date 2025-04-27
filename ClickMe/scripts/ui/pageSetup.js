// file: scripts/ui/pageSetup.js
// description: Manages page initialization, including menu visibility based on URL parameters and loading overlay behavior.

function initializePageLayout() {
    const menu = document.getElementById('menu');
    const iframe_section = document.getElementById('iframe-section');
    const whiteBackground = document.getElementById('white-background');
    const socialMediaBackground = document.getElementById('social-media-background');

    const urlParams = new URLSearchParams(window.location.search);
    const showMenu = urlParams.get('menu') === 'true';

    if (menu) {
        if (showMenu) {
            menu.style.display = 'flex';
            menu.style.width = '350px';
            iframe_section.style.width = 'calc(100% - 350px)';
            
            // Adjust backgrounds to match iframe section width
            if (whiteBackground) whiteBackground.style.width = 'calc(100% - 350px)';
            if (socialMediaBackground) socialMediaBackground.style.width = 'calc(100% - 350px)';
        } else {
            menu.style.display = 'none';
            iframe_section.style.width = '100%';
            
            // Reset backgrounds to full width
            if (whiteBackground) whiteBackground.style.width = '100%';
            if (socialMediaBackground) socialMediaBackground.style.width = '100%';
        }
    } else {
        iframe_section.style.width = '100%';
        
        // Reset backgrounds to full width
        if (whiteBackground) whiteBackground.style.width = '100%';
        if (socialMediaBackground) socialMediaBackground.style.width = '100%';
    }
}

function hideLoadingOverlay() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(function() {
            loadingOverlay.style.display = 'none';
        }, 500);
    }
}

// Initialize on DOMContentLoaded and load
document.addEventListener('DOMContentLoaded', initializePageLayout);
window.addEventListener('load', hideLoadingOverlay);