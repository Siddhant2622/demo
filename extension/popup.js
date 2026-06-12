let userProfile = null;

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const userNameEl = document.getElementById('userName');
  const magicFillBtn = document.getElementById('magicFillBtn');
  const fillStatus = document.getElementById('fillStatus');
  
  const loadingAnalysis = document.getElementById('loadingAnalysis');
  const analysisResult = document.getElementById('analysisResult');
  const analyzeBtn = document.getElementById('analyzeBtn');
  
  const matchScoreEl = document.getElementById('matchScore');
  const scoreCircle = document.getElementById('scoreCircle');
  const targetRoleEl = document.getElementById('targetRole');
  const missingSkillsList = document.getElementById('missingSkillsList');
  
  const setupView = document.getElementById('setupView');
  const mainView = document.getElementById('mainView');
  const secretKeyInput = document.getElementById('secretKeyInput');
  const saveKeyBtn = document.getElementById('saveKeyBtn');
  const unlinkBtn = document.getElementById('unlinkBtn');
  
  const findBestMatchBtn = document.getElementById('findBestMatchBtn');
  const bestMatchResult = document.getElementById('bestMatchResult');
  const bestMatchReason = document.getElementById('bestMatchReason');
  const openBestMatchBtn = document.getElementById('openBestMatchBtn');
  let currentBestMatchUrl = null;

  // Check for existing key
  chrome.storage.local.get(['skillmapKey'], (result) => {
    if (result.skillmapKey) {
      showMainView(result.skillmapKey);
    } else {
      setupView.classList.remove('hidden');
    }
  });

  saveKeyBtn.addEventListener('click', () => {
    const key = secretKeyInput.value.trim();
    if (key) {
      chrome.storage.local.set({ skillmapKey: key }, () => {
        setupView.classList.add('hidden');
        showMainView(key);
      });
    }
  });

  unlinkBtn.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.storage.local.remove('skillmapKey', () => {
      mainView.classList.add('hidden');
      setupView.classList.remove('hidden');
      userProfile = null;
      secretKeyInput.value = '';
    });
  });

  function showMainView(userId) {
    mainView.classList.remove('hidden');
    
    // 1. Fetch Profile on load using dynamic user_id
    chrome.runtime.sendMessage({ action: "GET_PROFILE", userId: userId }, (response) => {
      if (response && response.success) {
        userProfile = response.data;
        userNameEl.textContent = (userProfile.personal_info && userProfile.personal_info.first_name) ? userProfile.personal_info.first_name : "User";
        magicFillBtn.disabled = false;
      } else {
        userNameEl.textContent = "Error loading";
      }
    });

    // 2. Initial Page Analysis
    analyzeCurrentPage(userId);
  }

  // 3. Event Listeners
  analyzeBtn.addEventListener('click', analyzeCurrentPage);

  magicFillBtn.addEventListener('click', () => {
    if (!userProfile) {
      showStatus('Profile not loaded. Link your account first.', true);
      return;
    }
    
    magicFillBtn.disabled = true;
    magicFillBtn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:5px;"></div> Filling...';
    
    // Send message to content script in active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: "MAGIC_FILL", 
        profile: userProfile 
      }, (response) => {
        magicFillBtn.innerHTML = 'Magic Auto-Fill';
        magicFillBtn.disabled = false;
        
        if (chrome.runtime.lastError) {
          showStatus('Could not connect to page. Refresh and try again.', true);
          return;
        }

        if (response && response.success) {
          showStatus(`✨ Successfully filled ${response.count} fields!`);
        }
      });
    });
  });

  findBestMatchBtn.addEventListener('click', () => {
    chrome.storage.local.get(['skillmapKey'], (res) => {
      const userId = res.skillmapKey;
      if (!userId) return;

      findBestMatchBtn.disabled = true;
      findBestMatchBtn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:5px;"></div> Scanning Page...';
      bestMatchResult.classList.add('hidden');

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        
        chrome.tabs.sendMessage(activeTab.id, { action: "GET_PAGE_LINKS" }, (response) => {
          if (chrome.runtime.lastError || !response || !response.links || response.links.length === 0) {
            findBestMatchBtn.innerHTML = 'Auto-Find Best Job on Page';
            findBestMatchBtn.disabled = false;
            showStatus('Could not find links on this page.', true);
            return;
          }

          chrome.runtime.sendMessage({ 
            action: "FIND_BEST_MATCH", 
            links: response.links,
            userId: userId
          }, (apiRes) => {
            findBestMatchBtn.innerHTML = 'Auto-Find Best Job on Page';
            findBestMatchBtn.disabled = false;
            
            if (apiRes && apiRes.success && apiRes.data) {
              if (apiRes.data.url) {
                bestMatchReason.textContent = apiRes.data.reason;
                currentBestMatchUrl = apiRes.data.url;
                bestMatchResult.classList.remove('hidden');
                openBestMatchBtn.textContent = "Open Application";
              } else {
                showStatus(apiRes.data.reason || "No matching jobs found.", true);
              }
            } else {
              showStatus('Failed to analyze links.', true);
            }
          });
        });
      });
    });
  });

  openBestMatchBtn.addEventListener('click', () => {
    if (currentBestMatchUrl) {
      chrome.tabs.create({ url: currentBestMatchUrl });
    }
  });

  // Helper Functions
  function analyzeCurrentPage(userId) {
    if (!userId) {
      chrome.storage.local.get(['skillmapKey'], (res) => {
        if(res.skillmapKey) analyzeCurrentPage(res.skillmapKey);
      });
      return;
    }

    loadingAnalysis.classList.remove('hidden');
    analysisResult.classList.add('hidden');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      
      // Request page text from content script
      chrome.tabs.sendMessage(activeTab.id, { action: "GET_PAGE_TEXT" }, (response) => {
        if (chrome.runtime.lastError || !response || !response.text) {
          // If we can't get text (e.g. chrome:// pages), just hide loading
          loadingAnalysis.innerHTML = "<p>Cannot analyze this page.</p>";
          return;
        }

        const pageText = response.text;
        
        // Send to background script for API analysis
        chrome.runtime.sendMessage({ 
          action: "ANALYZE_PAGE", 
          pageText: pageText,
          pageUrl: activeTab.url,
          userId: userId
        }, (apiRes) => {
          loadingAnalysis.classList.add('hidden');
          
          if (apiRes && apiRes.success && !apiRes.data.error) {
            displayAnalysis(apiRes.data);
          } else {
            loadingAnalysis.classList.remove('hidden');
            loadingAnalysis.innerHTML = "<p>No relevant job data found.</p>";
          }
        });
      });
    });
  }

  function displayAnalysis(data) {
    analysisResult.classList.remove('hidden');
    
    const score = data.readiness_score || 0;
    matchScoreEl.textContent = score;
    
    // Set circle progress (convert percentage to degrees)
    const deg = (score / 100) * 360;
    scoreCircle.style.setProperty('--score-deg', `${deg}deg`);
    
    // Color coding
    let color = 'var(--success)';
    if (score < 50) color = 'var(--warning)';
    if (score < 25) color = '#ef4444'; // red
    scoreCircle.style.background = `conic-gradient(${color} var(--score-deg, 0deg), rgba(255,255,255,0.05) 0deg)`;

    targetRoleEl.textContent = data.target_role;

    // Render Missing Skills
    missingSkillsList.innerHTML = '';
    if (data.missing_skills && data.missing_skills.length > 0) {
      data.missing_skills.forEach(skill => {
        const li = document.createElement('li');
        li.textContent = skill;
        missingSkillsList.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = "You are a perfect match!";
      li.style.borderLeftColor = 'var(--success)';
      missingSkillsList.appendChild(li);
    }
  }

  function showStatus(msg, isError = false) {
    fillStatus.textContent = msg;
    fillStatus.style.color = isError ? '#ef4444' : 'var(--success)';
    fillStatus.classList.remove('hidden');
    setTimeout(() => {
      fillStatus.classList.add('hidden');
    }, 3000);
  }
});
