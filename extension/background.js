const API_BASE_URL = "http://localhost:3000/api/extension";

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_PROFILE") {
    const userId = request.userId || "demo_user";
    fetch(`${API_BASE_URL}/profile?user_id=${userId}`)
      .then(response => response.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Indicates async response
  }

  if (request.action === "ANALYZE_PAGE") {
    const userId = request.userId || "demo_user";
    fetch(`${API_BASE_URL}/analyze-job?user_id=${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page_text: request.pageText, page_url: request.pageUrl })
    })
      .then(response => response.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Indicates async response
  }

  if (request.action === "FIND_BEST_MATCH") {
    const userId = request.userId || "demo_user";
    // We call the Next.js API route directly because it has System SDK setup
    fetch("http://localhost:3000/api/extension/find-match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ links: request.links, userId: userId })
    })
      .then(response => response.json())
      .then(data => sendResponse(data))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});
