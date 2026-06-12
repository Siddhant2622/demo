// Content script injected into every page

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_PAGE_TEXT") {
    // Extract visible text from the page body, avoiding script/style tags
    const text = document.body.innerText;
    sendResponse({ text: text });
    return true;
  }

  if (request.action === "GET_PAGE_LINKS") {
    // Scrape all links on the page that have text
    const links = Array.from(document.querySelectorAll("a"))
      .map(a => ({
        text: a.innerText.trim().replace(/\n/g, ' '),
        url: a.href
      }))
      .filter(l => l.text.length > 5 && l.text.length < 150 && l.url && l.url.startsWith("http"));
      
    // Deduplicate by URL
    const uniqueLinks = [];
    const seen = new Set();
    for (const l of links) {
      if (!seen.has(l.url)) {
        seen.add(l.url);
        uniqueLinks.push(l);
      }
    }
    
    sendResponse({ links: uniqueLinks });
    return true;
  }

  if (request.action === "MAGIC_FILL") {
    const profile = request.profile || {};
    const personalInfo = profile.personal_info || {};
    const education = profile.education || {};
    
    // Mapping of common form field names/IDs to profile data
    const fieldMapping = [
      { keys: ["firstname", "first-name", "first_name", "fname", "first name"], value: personalInfo.first_name || "" },
      { keys: ["lastname", "last-name", "last_name", "lname", "last name"], value: personalInfo.last_name || "" },
      { keys: ["fullname", "full-name"], value: personalInfo.full_name || "" }, // Removed "name" to avoid catching "Institute Name"
      { keys: ["email", "e-mail", "emailaddress"], value: personalInfo.email || "" },
      { keys: ["phone", "phonenumber", "mobile", "contact"], value: personalInfo.phone || "" },
      { keys: ["location", "city", "address", "current location"], value: personalInfo.location || "" },
      { keys: ["linkedin", "linked-in"], value: personalInfo.linkedin || "" },
      { keys: ["github", "git-hub"], value: personalInfo.github || "" },
      { keys: ["portfolio", "website"], value: personalInfo.portfolio || "" },
      { keys: ["university", "college", "school", "institute"], value: education.university || "" },
      { keys: ["degree", "course"], value: education.degree || "" },
      { keys: ["cgpa", "gpa", "grade"], value: education.cgpa || "" },
      { keys: ["skills", "technologies"], value: profile.skills_raw || "" },
      { keys: ["current ctc", "current salary", "ctc (annually)", "current_ctc"], value: profile.current_ctc || "" },
      { keys: ["expected ctc", "expected salary", "expected_ctc"], value: profile.expected_ctc || "" },
      { keys: ["notice", "notice period"], value: profile.notice_period || "" },
      { keys: ["experience", "experience (in years)"], value: profile.experience_years || "" },
      { keys: ["gender"], value: profile.gender || "" }
    ];

    let fieldsFilled = 0;

    // Find all input, textarea, and select elements
    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, select');

    inputs.forEach(input => {
      const name = (input.name || "").toLowerCase();
      const id = (input.id || "").toLowerCase();
      const placeholder = (input.placeholder || "").toLowerCase();
      
      // Try to find a matching label
      let labelText = "";
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) labelText = label.innerText.toLowerCase();
      }

      // Check against our mappings
      for (const mapping of fieldMapping) {
        const matches = mapping.keys.some(key => 
          name.includes(key) || id.includes(key) || placeholder.includes(key) || labelText.includes(key)
        );

        if (matches && !input.value) {
          input.value = mapping.value;
          // Dispatch event to trigger React/Angular state updates if applicable
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilled++;
          
          // Add a temporary highlight effect to show what was filled
          const originalBorder = input.style.border;
          input.style.border = "2px solid #4CAF50";
          input.style.backgroundColor = "#e8f5e9";
          setTimeout(() => {
            input.style.border = originalBorder;
            input.style.backgroundColor = "";
          }, 1500);
          
          break; // Move to next input
        }
      }
    });

    sendResponse({ success: true, count: fieldsFilled });
    return true;
  }
});
