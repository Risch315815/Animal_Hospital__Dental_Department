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
        const baseUrl = document.head.querySelector('meta[name="base-url"]')?.content || '';
        console.log('Current path:', currentPath);

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
        } else {
            console.error('Path not matched:', currentPath);
            throw new Error('Unknown post type');
        }

        if (translationFile) {
            const pageResponse = await fetch(`${baseUrl}${translationFile}`);
            const pageTranslations = await pageResponse.json();
            // Merge page translations with nav translations
            translations = { ...translations, ...pageTranslations };
        }
        
        console.log('Loaded translations:', translations);
        
        // Set up language selector after translations are loaded
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            // Remove any existing listeners
            const newSelect = languageSelect.cloneNode(true);
            languageSelect.parentNode.replaceChild(newSelect, languageSelect);
            
            // Add new listener
            newSelect.addEventListener('change', (e) => {
                console.log('Language select changed to:', e.target.value);
                changeLanguage(e.target.value);
            });
            
            // Set initial language
            changeLanguage(newSelect.value || 'zh-hant');
        }
    } catch (error) {
        console.error('Error loading translations:', error);
    }
}

// Function to update text overlays
function updateTextOverlays() {
    const overlayContainers = document.querySelectorAll('.text-overlays');
    console.log('Found overlay containers:', overlayContainers.length);
    
    overlayContainers.forEach(container => {
        const imageId = container.getAttribute('data-image-id');
        console.log('Processing image ID:', imageId);
        
        container.innerHTML = ''; // Clear existing overlays
        
        if (translations.text_overlays && translations.text_overlays[imageId]) {
            const textboxes = translations.text_overlays[imageId];
            Object.entries(textboxes).forEach(([boxId, boxData]) => {
                const overlay = document.createElement('div');
                overlay.className = 'text-overlay';
                overlay.setAttribute('lang', currentLang);
                overlay.textContent = boxData.text[currentLang];

                // Apply all styling from JSON
                overlay.style.left = boxData.x;
                overlay.style.top = boxData.y;
                overlay.style.width = boxData.width;
                overlay.style.height = boxData.height;
                overlay.style.fontSize = boxData.fontSize;
                overlay.style.backgroundColor = boxData.backgroundColor;
                overlay.style.border = boxData.border;
                overlay.style.fontWeight = boxData.fontWeight || 'normal';
                
                // Add transform for centering if needed
                if (boxData.transform) {
                    overlay.style.transform = boxData.transform;
                }

                container.appendChild(overlay);
            });
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
        if (translations.team_members && translations.team_members[memberId]) {
            profile.innerHTML = translations.team_members[memberId].text[currentLang];
        }
    });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', loadTranslations); 