const quizHandler = {
    // Entry point: Initialize and check Chrome storage
    initialize() {
        // Check if "Congratulations!" message is present
        const completionMessage = document.querySelector(".sensei-message.tick");
        if (completionMessage && completionMessage.textContent.includes("Congratulations!")) {
            pageHandler.log("Congratulations message detected. Disabling all functions.", "success");
            return; // Exit early, disabling all further actions
        }

        chrome.storage.local.get(['quiz_step'], async (result) => {
            const form = document.querySelector("form");
            if (!form) {
                pageHandler.log("Form not found on page.", "error");
                return;
            }

            const originalButton = form.querySelector("input[name='quiz_complete']");

            if (!result.quiz_step) {
                pageHandler.log("AutoLoad: No step found in storage. Initializing Function 1.", "success");
                await this.initializeFunction1();
            } else if (result.quiz_step === 'step2' && !originalButton) {
                pageHandler.log("AutoLoad: Restoring Step 2 and simulating Mod - QuizButton2 click.", "info");
                await this.restoreStep2();
            } else if (result.quiz_step === 'step2' && originalButton) {
                pageHandler.log("AutoLoad: Original button still present. Transitioning back to Step 1.", "warning");
                await this.initializeFunction1();
            } else if (result.quiz_step === 'step3') {
                pageHandler.log("AutoLoad: Step 3 detected. Clearing storage and resetting quiz.", "info");
                await this.clearStep3();
            } else {
                pageHandler.log("AutoLoad: Restoring fallback functionality.", "info");
                await this.initializeFunction2();
            }
        });

        // Add Reset Quiz button listener
        const resetButton = document.querySelector("input[name='quiz_reset']");
        if (resetButton) {
            resetButton.addEventListener('click', async () => {
                await chrome.storage.local.remove(['quiz_step', 'lesson_state']);
                pageHandler.log('Storage cleared: "quiz_step" and "lesson_state".', "success");
            });
        }
    },

    // Initialize Step 1
    async initializeFunction1() {
        const form = document.querySelector("form");
        if (!form) {
            pageHandler.log("Form not found for Function 1.", "error");
            return;
        }

        await this.setRadiosFalse(form);
        await this.addButton1(form);
        pageHandler.log("Initialized Function 1.", "success");
    },

    // Add Mod - QuizButton1
    async addButton1(form) {
        const button1 = document.createElement("input");
        button1.type = "submit";
        button1.name = "quiz_complete";
        button1.value = "Mod - QuizButton1";
        button1.classList.add("quiz-submit", "complete");

        const span = document.createElement("span");
        span.appendChild(button1);

        const resetButton = form.querySelector("input[name='quiz_reset']");
        if (resetButton) {
            resetButton.parentNode.insertBefore(span, resetButton.nextSibling);
        } else {
            form.appendChild(span);
        }

        button1.addEventListener('click', async () => {
            pageHandler.log("Mod - QuizButton1 clicked. Updating storage to Step 2...", "info");
            await chrome.storage.local.set({
                quiz_step: "step2",
                last_updated: Date.now()
            });

            pageHandler.log("Form submitted via Mod - QuizButton1.", "success");
        });

        pageHandler.log("Mod - QuizButton1 added.", "success");
    },

    // Add Mod - QuizButton2
    async addButton2(form) {
        const button2 = document.createElement("input");
        button2.type = "submit";
        button2.name = "quiz_complete";
        button2.value = "Mod - QuizButton2";
        button2.classList.add("complete-quiz-button");

        form.appendChild(button2);
        pageHandler.log("Mod - QuizButton2 added.", "success");
    },

    // Set all radio buttons to "false"
    async setRadiosFalse(form) {
        const radios = form.querySelectorAll("input[type='radio']");
        radios.forEach(radio => {
            radio.checked = radio.value === "false";
        });
        pageHandler.log("All radio buttons set to 'false'.", "info");
    },

    // Process existing correct answers
    async processCorrectAnswers(correctAnswers, form) {
        correctAnswers.forEach(answer => {
            const questionDiv = answer.closest("li");
            if (!questionDiv) {
                pageHandler.log("Could not find question container.", "error");
                return;
            }

            const trueRadio = questionDiv.querySelector("input[value='true']");
            if (trueRadio) {
                trueRadio.checked = true;
                pageHandler.log(`Set answer for question ${trueRadio.name}.`, "success");
            }
        });

        pageHandler.log("Processed existing correct answers.", "info");
    },

    // Restore Step 2
    async restoreStep2() {
        const form = document.querySelector("form");
        if (!form) {
            pageHandler.log("Form not found for Step 2.", "error");
            return;
        }

        const existingCorrectAnswers = document.querySelectorAll(".answer_message.user_wrong");
        if (existingCorrectAnswers.length > 0) {
            await this.processCorrectAnswers(existingCorrectAnswers, form);
        } else {
            pageHandler.log("No existing correct answers found.", "warning");
        }

        await this.addButton2(form);
        pageHandler.log("Restored Step 2.", "success");
    },

    // Initialize Default Step
    async initializeFunction2() {
        const form = document.querySelector("form");
        if (!form) {
            pageHandler.log("Form not found for Function 2.", "error");
            return;
        }

        await this.setRadiosFalse(form);
        pageHandler.log("Initialized Function 2.", "info");
    },
};

// Initialize the quiz handler when the page loads
document.addEventListener('DOMContentLoaded', () => {
    quizHandler.initialize();
});
