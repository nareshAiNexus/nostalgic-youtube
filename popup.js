const slider = document.getElementById("years");
const yearValue = document.getElementById("yearValue");
const applyBtn = document.getElementById("apply");

// Load saved settings
chrome.storage.sync.get(['nostalgiaYears'], (result) => {
  if (result.nostalgiaYears) {
    slider.value = result.nostalgiaYears;
    yearValue.textContent = result.nostalgiaYears;
  }
});

// Live update label
slider.addEventListener("input", () => {
  yearValue.textContent = slider.value;
});

// Apply filter
applyBtn.addEventListener("click", () => {
  const years = slider.value;

  chrome.storage.sync.set({ nostalgiaYears: years });

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0] && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, { years }).catch(err => {
        // Ignore error if content script isn't loaded (e.g., on a non-YouTube page)
        console.log("Could not send message to tab. Is it a YouTube page?", err);
      });
    }
  });

  // Visual success feedback
  const originalText = applyBtn.innerHTML;
  applyBtn.innerHTML = "<span>Applied!</span>";
  applyBtn.style.background = "#2ecc71";

  setTimeout(() => {
    applyBtn.innerHTML = originalText;
    applyBtn.style.background = "";
  }, 1500);
});
