// Store the current language
let currentLang = document.documentElement.lang || 'zh-hant';
let translations = {};

// Function to load translations
async function loadTranslations() {
    try {
        const baseUrl = document.head.querySelector('meta[name="base-url"]')?.content || '';
        const path = window.location.pathname;
        console.log('Current path:', path);

        let translationFile = '';
        if (path.includes('questionable-characters')) {
            translationFile = '/data/Comics/QuestionableCharacters/translatedQC.json';
            console.log('Loading <Questionable Characters> translations');
        } else if (path.includes('terrible-dad')) {
            translationFile = '/data/Comics/TerribleDad/translatedTD.json';
            console.log('Loading <Terrible Dad> translations');
        } else if (path.includes('scaling-kitty')) {
            translationFile = '/data/Comics/ScalingKitty_BS/ScalingKitty_BS.json';
            console.log('Loading <Scaling Kitty> translations');
        } else if (path.includes('extractosaurus')) {
            translationFile = '/data/Comics/Extractosaurus_BS/Extractosaurus_BS.json';
            console.log('Loading <Extractosaurus> translations');
        } else if (path.includes('prostho-wolf')) {
            translationFile = '/data/Comics/ProsthoWolf_BS/ProsthoWolf_BS.json';
            console.log('Loading <ProsthoWolf> translations');
        } else {
            throw new Error('Unknown post type');
        }
        
        const response = await fetch(`${baseUrl}${translationFile}`);
        translations = await response.json();
        console.log('Loaded translations:', translations);
        changeLanguage('zh-hant');
    } catch (error) {
        console.error('Error details:', error);
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
    console.log('Found overlay containers:', overlayContainers.length);
    
    overlayContainers.forEach(container => {
        const imageId = container.getAttribute('data-image-id');
        console.log('Processing container:', {
            id: imageId,
            translations: translations[imageId],
            container: container
        });
        
        container.innerHTML = ''; // Clear existing overlays
        
        if (translations[imageId]) {
            const textboxes = translations[imageId];
            
            Object.entries(textboxes).forEach(([boxId, boxData]) => {
                const overlay = document.createElement('div');
                overlay.className = 'text-overlay';
                overlay.setAttribute('lang', currentLang);
                overlay.textContent = boxData.text[currentLang];

                // Apply positioning and styling from JSON
                overlay.style.left = boxData.x;
                overlay.style.top = boxData.y;
                overlay.style.width = boxData.width;
                overlay.style.height = boxData.height;
                overlay.style.backgroundColor = boxData.backgroundColor;
                overlay.style.border = boxData.border;
                overlay.style.fontWeight = boxData.fontWeight || 'normal';

                // Adjust font size based on language
                const baseFontSize = parseInt(boxData.fontSize);
                if (currentLang === 'zh-hant') {
                    overlay.style.fontSize = boxData.fontSize;
                } else if (currentLang === 'en') {
                    overlay.style.fontSize = `${baseFontSize - 7}px`;
                } else {
                    overlay.style.fontSize = `${baseFontSize - 12}px`;
                }

                // Add the overlay to the container
                container.appendChild(overlay);
                
                console.log('Overlay added:', overlay); // Debug log
            });
        }
    });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadTranslations();
}); 