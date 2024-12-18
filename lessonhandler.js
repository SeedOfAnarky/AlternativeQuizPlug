(function() {
    async function initialize() {
        try {
            const lessonButton = document.querySelector('footer a.button.disabled[title="View the Lesson Quiz"]');
            if (!lessonButton) return;

            const { autoEnableLesson } = await chrome.storage.local.get(['autoEnableLesson']);
            if (autoEnableLesson) {
                await enableLesson();
            }
        } catch (error) {
            console.error('Lesson initialization error:', error);
        }
    }

    async function enableLesson() {
        console.log("Enabling lesson functionality...");
        
        try {
            const lessonButton = document.querySelector('footer a.button.disabled[title="View the Lesson Quiz"]');
            
            if (!lessonButton) {
                throw new Error("Lesson quiz button not found");
            }

            lessonButton.classList.remove('disabled');
            lessonButton.removeAttribute('disabled');
            
            await chrome.storage.local.set({
                lesson_state: 'active',
                last_updated: Date.now()
            });

            return { success: true, message: "Lesson enabled successfully" };
        } catch (error) {
            console.error(`Error enabling lesson: ${error.message}`);
            return { success: false, message: error.message };
        }
    }

    async function resetLesson() {
        try {
            const lessonButton = document.querySelector('footer a.button[title="View the Lesson Quiz"]');
            if (lessonButton) {
                lessonButton.classList.add('disabled');
                lessonButton.setAttribute('disabled', 'disabled');
            }

            await chrome.storage.local.remove(['lesson_state']);
            return { success: true, message: "Lesson reset successfully" };
        } catch (error) {
            console.error(`Error resetting lesson: ${error.message}`);
            return { success: false, message: error.message };
        }
    }

    // Handle messages for lesson functionality
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.target !== 'lesson') return;

        const handlers = {
            'enable': () => enableLesson(),
            'reset': () => resetLesson(),
        };

        if (handlers[message.action]) {
            handlers[message.action]()
                .then(sendResponse)
                .catch(error => sendResponse({ success: false, message: error.message }));
            return true;
        }
    });

    // Initialize both immediately and on DOM load
    initialize();
    document.addEventListener('DOMContentLoaded', initialize);

    // Monitor for mutations that might add the button later
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
                initialize();
            }
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();