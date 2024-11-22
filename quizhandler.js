const quizHandler = {
    initialize() {
        const completionMessage = document.querySelector(".sensei-message.tick");
        if (completionMessage && completionMessage.textContent.includes("Congratulations!")) {
            pageHandler.log("Congratulations message detected. Disabling all functions.", "success");
            return;
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

        const resetButton = document.querySelector("input[name='quiz_reset']");
        if (resetButton) {
            resetButton.addEventListener('click', async () => {
                await chrome.storage.local.remove(['quiz_step', 'lesson_state']);
                pageHandler.log('Storage cleared: "quiz_step" and "lesson_state".', "success");
            });
        }
    },

    async initializeFunction1() {
        const form = document.querySelector("form");
        if (!form) {
            pageHandler.log("Form not found for Function 1.", "error");
            return;
        }

        await this.setCorrectAnswers(form);
        await this.addButton1(form);
        pageHandler.log("Initialized Function 1.", "success");
    },

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

    async addButton2(form) {
        const button2 = document.createElement("input");
        button2.type = "submit";
        button2.name = "quiz_complete";
        button2.value = "Mod - QuizButton2";
        button2.classList.add("complete-quiz-button");

        form.appendChild(button2);
        pageHandler.log("Mod - QuizButton2 added.", "success");
    },

    async setCorrectAnswers(form) {
        const wrongAnswers = document.querySelectorAll(".answer_message.user_wrong");
        
        if (wrongAnswers.length > 0) {
            wrongAnswers.forEach(wrongAnswer => {
                const answerText = wrongAnswer.textContent;
                const correctAnswer = answerText.split("Incorrect - Right Answer:")[1].trim();
                
                const questionDiv = wrongAnswer.closest("li");
                if (!questionDiv) {
                    pageHandler.log("Could not find question container.", "error");
                    return;
                }

                const radioInputs = questionDiv.querySelectorAll("input[type='radio']");
                radioInputs.forEach(radio => {
                    if (radio.value === correctAnswer) {
                        radio.checked = true;
                        pageHandler.log(`Set answer for question ${radio.name}.`, "success");
                    }
                });
            });
        } else {
            const radioButtons = document.querySelectorAll("#wrap_all #sensei-quiz-list > li.multiple-choice > ul.answers > li:first-child > input[type='radio']");
            if (!radioButtons.length) {
                pageHandler.log("No radio buttons found.", "error");
                return;
            }

            radioButtons.forEach(radio => {
                radio.checked = true;
                pageHandler.log(`Set first answer for question ${radio.name}.`, "success");
            });
        }

        pageHandler.log("Processed all answers.", "info");
    },

    async restoreStep2() {
        const form = document.querySelector("form");
        if (!form) {
            pageHandler.log("Form not found for Step 2.", "error");
            return;
        }

        const existingWrongAnswers = document.querySelectorAll(".answer_message.user_wrong");
        if (existingWrongAnswers.length > 0) {
            await this.setCorrectAnswers(form);
        } else {
            pageHandler.log("No existing wrong answers found.", "warning");
        }

        await this.addButton2(form);
        pageHandler.log("Restored Step 2.", "success");
    },

    async initializeFunction2() {
        const form = document.querySelector("form");
        if (!form) {
            pageHandler.log("Form not found for Function 2.", "error");
            return;
        }

        await this.setCorrectAnswers(form);
        pageHandler.log("Initialized Function 2.", "info");
    },

    async clearStep3() {
        await chrome.storage.local.remove(['quiz_step', 'lesson_state']);
        pageHandler.log("Cleared step 3 storage.", "success");
        await this.initializeFunction1();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    quizHandler.initialize();
});