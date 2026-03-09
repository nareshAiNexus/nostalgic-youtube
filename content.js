let selectedYears = null;

/* 🧨 Aggressively remove junk */
function purgeJunk() {
  const junkSelectors = [
    // Shorts
    "ytd-reel-shelf-renderer",
    "ytd-reel-item-renderer",

    // Ads (all known types)
    "ytd-display-ad-renderer",
    "ytd-promoted-sparkles-web-renderer",
    "ytd-in-feed-ad-layout-renderer",
    "ytd-ad-slot-renderer",

    // Recommendation junk
    "ytd-shelf-renderer",
    "ytd-radio-renderer",
    "ytd-channel-renderer",
    "ytd-rich-section-renderer"
  ];

  junkSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.remove());
  });
}

/* 🎯 Find real container */
function getVideoContainer(video) {
  return video.closest("ytd-video-renderer")
    || video.closest("ytd-rich-item-renderer")
    || video;
}

/* 🕰️ Extract years ago */
function getYearsAgo(video) {
  const spans = video.querySelectorAll("span");
  for (const span of spans) {
    const label = span.getAttribute("aria-label") || span.textContent;
    if (!label) continue;

    const match = label.toLowerCase().match(/(\d+)\s+years?\s+ago/);
    if (match) return parseInt(match[1]);
  }
  return null;
}

/* ✅ Apply nostalgia-only filter */
function applyFilter() {
  purgeJunk();

  if (selectedYears === null) return;

  const videos = document.querySelectorAll(
    "ytd-video-renderer, ytd-rich-item-renderer"
  );

  videos.forEach(video => {
    const yearsAgo = getYearsAgo(video);
    const container = getVideoContainer(video);

    if (!container) return;

    if (yearsAgo !== null && yearsAgo >= selectedYears) {
      container.style.display = "";
    } else {
      container.style.display = "none";
    }
  });
}

/* 📩 Listen from popup */
chrome.runtime.onMessage.addListener(msg => {
  if (msg.years) {
    selectedYears = parseInt(msg.years);
    setTimeout(applyFilter, 500);
  }
});

/* 👀 Continuous enforcement */
const observer = new MutationObserver(() => {
  applyFilter();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

/* 🚀 Load initial state on page load */
chrome.storage.sync.get(['nostalgiaYears'], (result) => {
  if (result.nostalgiaYears) {
    selectedYears = parseInt(result.nostalgiaYears);
    applyFilter();
  }
});
