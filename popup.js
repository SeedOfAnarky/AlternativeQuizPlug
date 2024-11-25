document.addEventListener('DOMContentLoaded', function() {
    const status = document.getElementById('status');
    const autoEnableCheckbox = document.getElementById('autoEnableLesson');
    let currentPageType = null;

    const buttons = {
        lesson: {
            enable: document.getElementById('enableLesson'),
            reset: document.getElementById('resetLesson')
        },
        quiz: {
            stage1: document.getElementById('quizStage1'),
            stage2: document.getElementById('quizStage2')
        }
    };

    function showStatus(message, type = 'success') {
        status.textContent = message;
        status.className = `status-${type}`;
        status.style.display = 'block';
        setTimeout(() => { status.style.display = 'none'; }, 3000);
    }

    async function getCurrentTab() {
        const [tab] = await chrome.tabs.query({ 
            active: true, 
            currentWindow: true,
            url: ["https://www.doddsre.com/*"]
        });
        return tab;
    }

    async function sendMessage(target, action) {
        try {
            const tab = await getCurrentTab();
            if (!tab) throw new Error('Please navigate to a Dodds RE page');

            const response = await chrome.tabs.sendMessage(tab.id, { target, action });
            if (response.success) {
                showStatus(response.message, 'success');
            } else {
                showStatus(response.message || 'Operation failed', 'error');
            }
        } catch (error) {
            showStatus(error.message, 'error');
        }
    }

    async function updateButtonStates() {
        try {
            const tab = await getCurrentTab();
            if (!tab) {
                disableAllButtons();
                showStatus('Please navigate to a Dodds RE page', 'error');
                return;
            }

            const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageType' });
            currentPageType = response.pageType;

            const lessonButtons = document.querySelector('.button-group:nth-child(1)');
            const quizButtons = document.querySelector('.button-group:nth-child(2)');

            if (currentPageType === 'LESSON') {
                lessonButtons.style.opacity = '1';
                quizButtons.style.opacity = '0.5';
                enableButtons(buttons.lesson);
                disableButtons(buttons.quiz);
                autoEnableCheckbox.disabled = false;
            } else if (currentPageType === 'QUIZ') {
                lessonButtons.style.opacity = '0.5';
                quizButtons.style.opacity = '1';
                enableButtons(buttons.quiz);
                disableButtons(buttons.lesson);
                autoEnableCheckbox.disabled = true;
            } else {
                disableAllButtons();
                autoEnableCheckbox.disabled = true;
            }

        } catch (error) {
            disableAllButtons();
            autoEnableCheckbox.disabled = true;
            showStatus('Error updating button states', 'error');
        }
    }

    function enableButtons(buttonGroup) {
        Object.values(buttonGroup).forEach(button => button.disabled = false);
    }

    function disableButtons(buttonGroup) {
        Object.values(buttonGroup).forEach(button => button.disabled = true);
    }

    function disableAllButtons() {
        disableButtons(buttons.lesson);
        disableButtons(buttons.quiz);
    }

    // Load saved checkbox state
    chrome.storage.local.get(['autoEnableLesson'], (result) => {
        autoEnableCheckbox.checked = result.autoEnableLesson || false;
    });

    // Event Listeners
    autoEnableCheckbox.addEventListener('change', (e) => {
        chrome.storage.local.set({ autoEnableLesson: e.target.checked });
    });

    buttons.lesson.enable.addEventListener('click', () => sendMessage('lesson', 'enable'));
    buttons.lesson.reset.addEventListener('click', () => sendMessage('lesson', 'reset'));
    buttons.quiz.stage1.addEventListener('click', () => sendMessage('quiz', 'stage1'));
    buttons.quiz.stage2.addEventListener('click', () => sendMessage('quiz', 'stage2'));

    updateButtonStates();
});