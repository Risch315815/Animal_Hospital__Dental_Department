// Store the current language
let currentLang = document.documentElement.lang || 'zh-hant';
let translations = {};

// Function to load translations
async function loadTranslations() {
    try {
        const baseUrl = document.head.querySelector('meta[name="base-url"]')?.content || '';
        const response = await fetch(`${baseUrl}/data/translated.json`);
        translations = await response.json();
        console.log('Translations loaded:', translations); // Debug log
        changeLanguage('zh-hant');
    } catch (error) {
        console.error('Error loading translations:', error);
    }
}

// Function to change the language of the page
function changeLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    
    // Update language selection
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.value = lang;
        languageSelect.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
        });
    }

    // Update all text overlays
    updateTextOverlays();
}

// Function to update text overlays
function updateTextOverlays() {
    const overlayContainers = document.querySelectorAll('.text-overlays');
    
    overlayContainers.forEach(container => {
        const imageId = container.getAttribute('data-image-id');
        container.innerHTML = ''; // Clear existing overlays
        
        if (translations[imageId]?.overlays) {
            translations[imageId].overlays.forEach(overlayData => {
                if (overlayData[currentLang]) {
                    const overlay = document.createElement('div');
                    overlay.className = 'text-overlay';
                    overlay.setAttribute('data-position', overlayData.position);
                    overlay.setAttribute('data-width', overlayData.width || 'narrow');
                    overlay.setAttribute('lang', currentLang);
                    overlay.textContent = overlayData[currentLang];

                    // Append to container first to get computed styles
                    container.appendChild(overlay);

                   // Apply all styles from the zh-hant version
                   if (currentLang !== 'zh-hant') {
                       const baseFontSize = parseFloat(window.getComputedStyle(overlay).fontSize);
                       overlay.style.fontSize = (baseFontSize - 7) + 'px';
                    }

                    console.log('Overlay added:', overlay); // Debug log
                }
            });
        }
    });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadTranslations();
}); 