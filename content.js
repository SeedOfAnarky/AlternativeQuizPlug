(function () {
    console.log("Content script loaded!");
  
    // Function to enable the lesson button
    function enableLessonButton() {
      console.log("Enabling lesson button...");
      const footer = document.querySelector("footer");
      if (footer) {
        const button = footer.querySelector("a.button.disabled");
        if (button) {
          button.classList.remove("disabled");
          button.removeAttribute("disabled");
          console.log("Lesson button enabled!");
        } else {
          console.error("Lesson button not found.");
        }
      } else {
        console.error("Footer not found.");
      }
    }
  
    // Function to enable the quiz functionality
    function enableQuiz() {
      console.log("Enabling quiz functionality...");
      const form = document.querySelector("form");
      if (form) {
        const button1 = document.createElement("input");
        button1.type = "submit";
        button1.name = "quiz_complete";
        button1.value = "Mod - QuizButton1";
        button1.classList.add("complete-quiz-button");
  
        const resetButton = form.querySelector("input[name='quiz_reset']");
        if (resetButton) {
          resetButton.parentNode.insertBefore(button1, resetButton.nextSibling);
          console.log("Quiz button added.");
        } else {
          console.error("Reset button not found.");
        }
  
        // Set all radios to false
        const radios = form.querySelectorAll("input[type='radio']");
        radios.forEach((radio) => (radio.checked = radio.value === "false"));
      } else {
        console.error("Quiz form not found.");
      }
    }
  
    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "enableLesson") {
        enableLessonButton();
        sendResponse({ message: "Lesson button enabled!" });
      } else if (message.action === "enableQuiz") {
        enableQuiz();
        sendResponse({ message: "Quiz functionality enabled!" });
      } else {
        sendResponse({ message: "Unknown action." });
      }
    });
  })();
  