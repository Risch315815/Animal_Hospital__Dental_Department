// Store the current language and path
let currentLang = document.documentElement.lang || 'zh-hant';
let currentPath = window.location.pathname;
let translations = {};
let baseUrl = ''; // Define baseUrl if it's undefined

// Add debugging function
function debug(message, data) {
    console.log(`[DEBUG] ${message}`, data || '');
}

// Language labels for "Choose Language:"
const languageLabels = {
    'zh-hant': '選擇語言：',
    'en': 'Choose Language:',
    'ja': '言語を選択：',
    'es': 'Elegir idioma:',
    'fr': 'Choisir la langue:',
    'th': 'เลือกภาษา:'
};

// Function to change the language of the page
function changeLanguage(lang) {
    debug('Changing language to:', lang);
    currentLang = lang;
    document.documentElement.lang = lang;
    
    // Update language selection
    const languageSelect = document.getElementById('language-select');
    const languageLabel = document.getElementById('language-label');
    
    if (languageSelect) {
        languageSelect.value = lang;
        if (languageLabel) {
            languageLabel.textContent = languageLabels[lang];
        }
    }

    // Update content
    updateTextOverlays();
    updateStoryContent();
    updateNavContent();
    updateMemberProfiles();
}

// Function to load translations
async function loadTranslations() {
    try {
        debug('Starting loadTranslations, current path:', currentPath);
        const path = window.location.pathname;
        let translationPath;

        // Skip translation for admin page
        if (currentPath === '/admin/') return;

        // Always load navigation translations
        const navResponse = await fetch(`${baseUrl}/data/nav.json`);
        if (!navResponse.ok) {
            debug('Nav response not OK:', navResponse.status);
        } else {
            const navTranslations = await navResponse.json();
            translations = { ...navTranslations };  // Start with nav translations
            debug('Nav translations loaded:', Object.keys(translations));
        }
        
        // Then load page-specific translations
        let translationFile = '';
        if (currentPath === '/' || currentPath.endsWith('index.html')) {
            translationFile = '/data/home.json';
            debug('Loading Home page translations');
        } else if (currentPath.includes('team')) {
            translationFile = '/data/team.json';
            debug('Loading Team page translations');
        } else if (currentPath.includes('about')) {
            translationFile = '/data/about.json';
            debug('Loading About page translations');
        } else if (currentPath.includes('questionable-characters')) {
            translationFile = '/data/Comics/QuestionableCharacters/translatedQC.json';
            debug('Loading <Questionable Characters> translations');
        } else if (currentPath.includes('terrible-dad')) {
            translationFile = '/data/Comics/TerribleDad/translatedTD.json';
            debug('Loading <Terrible Dad> translations');
        } else if (currentPath.includes('scaling-kitty')) {
            translationFile = '/data/Comics/ScalingKitty_BS/ScalingKitty_BS.json';
            debug('Loading <Scaling Kitty> translations');
        } else if (currentPath.includes('extractosaurus')) {
            translationFile = '/data/Comics/Extractosaurus_BS/Extractosaurus_BS.json';
            debug('Loading <Extractosaurus> translations');
        } else if (currentPath.includes('prosthowolf')) {
            translationFile = '/data/Comics/ProsthoWolf_BS/ProsthoWolf_BS.json';
            debug('Loading <ProsthoWolf> translations:', translationFile);
        } else if (currentPath.includes('r3-5-cow')) {
            translationFile = '/data/Comics/R3_5Cow_BS/R3_5Cow_BS.json';
            debug('Loading R3.5 Cow translations:', translationFile);
        } else if (currentPath.includes('captainfrontallobotomy')) {
            translationFile = '/data/Comics/CaptainFrontalLobotomy_BS/CaptainFrontalLobotomy_BS.json';
            debug('Loading <CaptainFrontalLobotomy> translations');
        } else if (currentPath.includes('WorkplaceInjury')) {
            translationFile = '/data/Comics/WorkplaceInjury/WorkplaceInjury.json';
            debug('Loading <WorkplaceInjury> translations');
        } else if (currentPath.includes('SubstituteTeacher')) {
            translationFile = '/data/Comics/SubstituteTeacher/SubstituteTeacher.json';
            debug('Loading <SubstituteTeacher> translations');
        } else if (currentPath.includes('pedo-rabbit')) {
            translationFile = '/data/Comics/PedoRabbit_BS/PedoRabbit_BS.json';
            debug('Loading <PedoRabbit> translations');
        } else if (currentPath.includes('manager')) {
            translationFile = '/data/Comics/Manager_BS/Manager_BS.json';
            debug('Loading <Manager> translations');
        } else {
            // Default translation path if needed
            translationPath = '/data/default.json';
            debug('No specific translations found, using default');
        }

        if (translationFile) {
            translationPath = translationFile;
        }

        debug('Loading translations from:', translationPath);
        
        try {
            const response = await fetch(window.location.origin + translationPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const pageTranslations = await response.json();
            debug('Translations loaded successfully from:', translationPath);
            debug('Translation keys:', Object.keys(pageTranslations));
            
            // Merge translations
            translations = { ...translations, ...pageTranslations };
            
            // Update the page content with the loaded translations
            updateTextOverlays();
            updateStoryContent();
            updateNavContent();
            updateMemberProfiles();
        } catch (fetchError) {
            debug('Error fetching translation file:', fetchError);
            throw fetchError;
        }
        
        return translations;
    } catch (error) {
        console.warn('Translation loading fallback:', error);
        debug('Translation loading error:', error);
        // Return default structure instead of throwing
        return {
            nav_content: {},
            // Add other default translations as needed
        };
    }
}

// Function to update text overlays
function updateTextOverlays() {
    const overlayContainers = document.querySelectorAll('.text-overlays');
    debug('Found overlay containers:', overlayContainers.length);
    
    overlayContainers.forEach(container => {
        const imageId = container.getAttribute('data-image-id');
        debug('Processing image ID:', imageId);
        
        // Clear existing overlays
        container.innerHTML = ''; 
        
        // Special debug for Manager character
        if (imageId === 'Manager') {
            debug('MANAGER DEBUG - Processing Manager container:', container);
            debug('MANAGER DEBUG - Is Manager in translations:', !!translations['Manager']);
            debug('MANAGER DEBUG - Available translation keys:', Object.keys(translations));
            console.log('MANAGER DEBUG - Full translations object:', translations);
        }
        
        // Debug translation data
        debug('Current language:', currentLang);
        debug('Translation keys available:', Object.keys(translations));
        
        if (translations[imageId]) {
            debug('Found translations for:', imageId);
            debug('Translation data:', translations[imageId]);
            
            Object.entries(translations[imageId]).forEach(([boxId, boxData]) => {
                debug('Creating overlay for:', boxId);
                
                const overlay = document.createElement('div');
                overlay.className = 'text-overlay';
                overlay.setAttribute('lang', currentLang);
                
                // Set text content
                if (boxData.text && boxData.text[currentLang]) {
                    overlay.innerHTML = boxData.text[currentLang];
                    debug('Setting text content:', boxData.text[currentLang]);
                } else {
                    console.warn(`Missing translation for ${currentLang} in ${imageId}.${boxId}`);
                    debug('Missing translation:', { imageId, boxId, currentLang });
                }

                // Apply all styling from JSON
                if (boxData.x) overlay.style.left = boxData.x;
                if (boxData.y) overlay.style.top = boxData.y;
                if (boxData.width) overlay.style.width = boxData.width;
                if (boxData.height) overlay.style.height = boxData.height;
                if (boxData.fontSize) overlay.style.fontSize = boxData.fontSize;
                if (boxData.backgroundColor) overlay.style.backgroundColor = boxData.backgroundColor;
                if (boxData.border) overlay.style.border = boxData.border;
                if (boxData.fontWeight) overlay.style.fontWeight = boxData.fontWeight;
                
                container.appendChild(overlay);
                debug('Overlay added to container');
            });
        } else {
            console.warn('No translations found for:', imageId);
            debug('No translations found for image ID:', imageId);
        }
    });
}

function updateStoryContent() {
    const storyContainers = document.querySelectorAll('[data-story-id]');
    debug('Found story containers:', storyContainers.length);
    
    storyContainers.forEach(container => {
        const storyId = container.getAttribute('data-story-id');
        debug('Processing story ID:', storyId);
        
        if (translations[storyId] && translations[storyId].text && translations[storyId].text[currentLang]) {
            // Check if it's an array or single text
            if (Array.isArray(translations[storyId].text[currentLang])) {
                container.innerHTML = ''; // Clear existing content
                // Create paragraph elements for each story segment
                translations[storyId].text[currentLang].forEach(paragraph => {
                    const p = document.createElement('p');
                    p.innerHTML = paragraph; // Use innerHTML instead of textContent
                    container.appendChild(p);
                });
                debug('Added array of paragraphs for:', storyId);
            } else {
                // Single text item - use innerHTML to parse HTML tags
                container.innerHTML = translations[storyId].text[currentLang];
                debug('Added single text for:', storyId);
            }
        } else {
            debug('No translation found for story ID:', storyId);
        }
    });
}

function updateNavContent() {
    const navItems = document.querySelectorAll('[data-nav-id]');
    
    navItems.forEach(item => {
        const navId = item.getAttribute('data-nav-id');
        const navIndex = item.getAttribute('data-nav-index');
        
        if (translations[navId] && translations[navId].text[currentLang]) {
            item.textContent = translations[navId].text[currentLang][navIndex];
        }
    });
}

function updateMemberProfiles() {
    const memberProfiles = document.querySelectorAll('[data-member-id]');
    
    memberProfiles.forEach(profile => {
        const memberId = profile.getAttribute('data-member-id');
        if (translations[memberId] && translations[memberId].text) {
            profile.innerHTML = translations[memberId].text[currentLang];
        }
    });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    debug('DOM loaded, initializing translations');
    loadTranslations().then(() => {
        debug('Initial translations loaded and processed');
        debug('Available translation keys:', Object.keys(translations));
        
        // Force refresh the content after translation loading
        updateTextOverlays();
        updateStoryContent();
        updateNavContent();
        updateMemberProfiles();
    });
}); 