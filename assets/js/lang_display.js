// Store the current language and path
let currentLang = document.documentElement.lang || 'zh-hant';
let currentPath = window.location.pathname;
let translations = {};

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
    console.log('Changing language to:', lang);
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
        const path = window.location.pathname;
        let translationPath;

        // Skip translation for admin page
        if (currentPath === '/admin/') return;

        // Always load navigation translations
        const navResponse = await fetch(`${baseUrl}/data/nav.json`);
        const navTranslations = await navResponse.json();
        translations = { ...navTranslations };  // Start with nav translations
        
        // Then load page-specific translations
        let translationFile = '';
        if (currentPath === '/' || currentPath.endsWith('index.html')) {
            translationFile = '/data/home.json';
            console.log('Loading Home page translations');
        } else if (currentPath.includes('team')) {
            translationFile = '/data/team.json';
            console.log('Loading Team page translations');
        } else if (currentPath.includes('about')) {
            translationFile = '/data/about.json';
            console.log('Loading About page translations');
        } else if (currentPath.includes('questionable-characters')) {
            translationFile = '/data/Comics/QuestionableCharacters/translatedQC.json';
            console.log('Loading <Questionable Characters> translations');
        } else if (currentPath.includes('terrible-dad')) {
            translationFile = '/data/Comics/TerribleDad/translatedTD.json';
            console.log('Loading <Terrible Dad> translations');
        } else if (currentPath.includes('scaling-kitty')) {
            translationFile = '/data/Comics/ScalingKitty_BS/ScalingKitty_BS.json';
            console.log('Loading <Scaling Kitty> translations');
        } else if (currentPath.includes('extractosaurus')) {
            translationFile = '/data/Comics/Extractosaurus_BS/Extractosaurus_BS.json';
            console.log('Loading <Extractosaurus> translations');
        } else if (currentPath.includes('prosthowolf')) {
            translationFile = '/data/Comics/ProsthoWolf_BS/ProsthoWolf_BS.json';
            console.log('Loading <ProsthoWolf> translations:', translationFile);
        } else if (currentPath.includes('r3-5-cow')) {
            translationFile = '/data/Comics/R3_5Cow_BS/R3_5Cow_BS.json';
            console.log('Loading R3.5 Cow translations:', translationFile);
        } else if (currentPath.includes('captainfrontallobotomy')) {
            translationFile = '/data/Comics/CaptainFrontalLobotomy_BS/CaptainFrontalLobotomy_BS.json';
            console.log('Loading <CaptainFrontalLobotomy> translations');
        } else if (currentPath.includes('WorkplaceInjury')) {
            translationFile = '/data/Comics/WorkplaceInjury/WorkplaceInjury.json';
            console.log('Loading <WorkplaceInjury> translations');
        } else if (currentPath.includes('SubstituteTeacher')) {
            translationFile = '/data/Comics/SubstituteTeacher/SubstituteTeacher.json';
            console.log('Loading <SubstituteTeacher> translations');
        } else if (currentPath.includes('pedo-rabbit')) {
            translationFile = '/data/Comics/PedoRabbit_BS/PedoRabbit_BS.json';
            console.log('Loading <PedoRabbit> translations');
        } else if (currentPath.includes('manager')) {
            translationFile = '/data/Comics/Manager_BS/Manager_BS.json';
            console.log('Loading <Manager> translations');
        } else {
            // Default translation path if needed
            translationPath = '/data/default.json';
        }

        const response = await fetch(window.location.origin + translationPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const translations = await response.json();
        console.log('Translations loaded successfully:', translations);
        return translations;
    } catch (error) {
        console.warn('Translation loading fallback:', error);
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
    console.log('Found overlay containers:', overlayContainers.length);
    
    overlayContainers.forEach(container => {
        const imageId = container.getAttribute('data-image-id');
        console.log('Processing image ID:', imageId);
        console.log('Available translations:', translations);
        
        // Clear existing overlays
        container.innerHTML = ''; 
        
        // Add debug logging
        console.log('Translations:', translations);
        console.log('Current language:', currentLang);
        
        if (translations[imageId]) {
            console.log('Found translations for:', imageId);
            Object.entries(translations[imageId]).forEach(([boxId, boxData]) => {
                console.log('Creating overlay for:', boxId, boxData);
                
                const overlay = document.createElement('div');
                overlay.className = 'text-overlay';
                overlay.setAttribute('lang', currentLang);
                
                // Set text content
                if (boxData.text && boxData.text[currentLang]) {
                    overlay.innerHTML = boxData.text[currentLang];
                } else {
                    console.warn(`Missing translation for ${currentLang} in ${imageId}.${boxId}`);
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
            });
        } else {
            console.warn('No translations found for:', imageId);
        }
    });
}

function updateStoryContent() {
    const storyContainers = document.querySelectorAll('[data-story-id]');
    console.log('Found story containers:', storyContainers.length);
    console.log('Current language:', currentLang);
    
    storyContainers.forEach(container => {
        const storyId = container.getAttribute('data-story-id');
        console.log('Processing story ID:', storyId);
        
        if (translations[storyId] && translations[storyId].text[currentLang]) {
            // Check if it's an array or single text
            if (Array.isArray(translations[storyId].text[currentLang])) {
                container.innerHTML = ''; // Clear existing content
                // Create paragraph elements for each story segment
                translations[storyId].text[currentLang].forEach(paragraph => {
                    const p = document.createElement('p');
                    p.innerHTML = paragraph; // Use innerHTML instead of textContent
                    container.appendChild(p);
                });
            } else {
                // Single text item - use innerHTML to parse HTML tags
                container.innerHTML = translations[storyId].text[currentLang];
            }
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
document.addEventListener('DOMContentLoaded', loadTranslations); 

// Add this to help debug
document.addEventListener('DOMContentLoaded', () => {
    loadTranslations().then(() => {
        console.log('Initial translations loaded');
        console.log('Available translations:', translations);
    });
}); 