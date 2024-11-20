document.addEventListener("DOMContentLoaded", function () {
    const enableLessonButton = document.getElementById("enableLesson");
    const enableQuizButton = document.getElementById("enableQuiz");
    const status = document.getElementById("status");
  
    // Fallback to inject the content script if not loaded
    function injectContentScript(tabId) {
      chrome.scripting.executeScript(
        { target: { tabId: tabId }, files: ["content.js"] },
        () => {
          console.log("Content script injected.");
          updateStatus("Content script injected.");
        }
      );
    }
  
    // Send a message to enable the lesson button
    enableLessonButton.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs.length) {
          updateStatus("No active tab found.");
          return;
        }
        chrome.tabs.sendMessage(tabs[0].id, { action: "enableLesson" }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn("Content script not found. Injecting...");
            injectContentScript(tabs[0].id);
          } else {
            handleResponse(response, "Lesson button enabled!");
          }
        });
      });
    });
  
    // Send a message to enable quiz functionality
    enableQuizButton.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs.length) {
          updateStatus("No active tab found.");
          return;
        }
        chrome.tabs.sendMessage(tabs[0].id, { action: "enableQuiz" }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn("Content script not found. Injecting...");
            injectContentScript(tabs[0].id);
          } else {
            handleResponse(response, "Quiz functionality enabled!");
          }
        });
      });
    });
  
    // Handle response or errors
    function handleResponse(response, successMessage) {
      if (!response || !response.message) {
        console.error("No valid response received.");
        updateStatus("No valid response received.");
      } else {
        console.log(response.message || successMessage);
        updateStatus(response.message || successMessage);
      }
    }
  
    // Update the status message in the popup
    function updateStatus(message) {
      status.textContent = message;
      setTimeout(() => (status.textContent = ""), 3000);
    }
  });
  