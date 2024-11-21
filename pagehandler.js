// pageHandler.js
const pageHandler = {
    PAGES: {
        LESSON: /\/lesson\//,
        QUIZ: /\/quiz\//
    },

    log(message, type = "info") {
        const styles = {
            info: "color: blue; font-weight: bold;",
            success: "color: DarkOrange; font-weight: bold;",
            error: "color: red; font-weight: bold;",
            warning: "color: orange; font-weight: bold;",
            default: "color: gray; font-weight: bold;"
        };
        console.log(`%c[QuizHandler] ${message}`, styles[type] || styles.default);
    },
    

    getCurrentPage() {
        const url = window.location.pathname;
        if (this.PAGES.LESSON.test(url)) return 'LESSON';
        if (this.PAGES.QUIZ.test(url)) return 'QUIZ';
        return null;
    },

    initialize() {
        const pageType = this.getCurrentPage();
        this.log(`Page type detected: ${pageType || 'Unknown'}`);
        
        // Initialize appropriate handler
        if (pageType === 'LESSON' && typeof lessonHandler !== 'undefined') {
            lessonHandler.initialize();
        } else if (pageType === 'QUIZ' && typeof quizHandler !== 'undefined') {
            chrome.storage.local.get(null, (items) => {
                console.log('Loaded Quiz with storage of:', items);
            });
            quizHandler.initialize();
        }

        // Setup message handler for page type requests
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'getPageType') {
                sendResponse({ pageType: this.getCurrentPage() });
            }
        });
    }
};

// Wait for everything to be loaded
document.addEventListener('DOMContentLoaded', () => {
    pageHandler.initialize();
});

// Also initialize immediately in case DOMContentLoaded has already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    pageHandler.initialize();
}