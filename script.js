// ==========================================
// INITIALIZATION & ONBOARDING
// ==========================================

let currentOnboardingScreen = 1;
let hasSeenOnboarding = localStorage.getItem('missedOnboardingComplete') === 'true';
let isLoggedIn = localStorage.getItem('missedLoggedIn') === 'true';
let currentUserEmail = localStorage.getItem('missedUserEmail') || '';
let authCodeTimer = null;
let resendTimer = null;
// Track user vote state per comment: { "postId_index": "up" | "down" | null }
let userCommentVotes = JSON.parse(localStorage.getItem('missedCommentVotes') || '{}');

document.addEventListener('DOMContentLoaded', function() {
  const splashScreen = document.getElementById('splash-screen');
  const onboarding = document.getElementById('onboarding');
  const loginPage = document.getElementById('login-page');
  const appTitle = document.getElementById('app-title');
  
  // Splash animation
  setTimeout(() => {
    appTitle.classList.add('separated');
  }, 1000);
  
  setTimeout(() => {
    splashScreen.classList.add('fade-out');
    
    setTimeout(() => {
      splashScreen.style.display = 'none';
      
      // Check if user is logged in
      if (!isLoggedIn) {
        // Show login page
        loginPage.classList.add('active');
        // Hide main app content
        const mainContent = document.querySelector('main');
        const bottomNav = document.querySelector('nav');
        if (mainContent) mainContent.style.display = 'none';
        if (bottomNav) bottomNav.style.display = 'none';
      } else {
        // Hide login page
        loginPage.classList.remove('active');
        loginPage.style.display = 'none';
      
      // Show onboarding if first time, otherwise show app
      if (!hasSeenOnboarding) {
          // Hide main app content
          const mainContent = document.querySelector('main');
          const bottomNav = document.querySelector('nav');
          if (mainContent) mainContent.style.display = 'none';
          if (bottomNav) bottomNav.style.display = 'none';
          
          // Show onboarding
          onboarding.style.display = '';
        onboarding.classList.add('active');
      } else {
          // Hide onboarding
        onboarding.style.display = 'none';
          onboarding.classList.remove('active');
          
          // Show main app content
          const mainContent = document.querySelector('main');
          const bottomNav = document.querySelector('nav');
          if (mainContent) mainContent.style.display = 'block';
          if (bottomNav) bottomNav.style.display = 'flex';
          
          // Show home page as landing page
          showPage('home');
        }
      }
    }, 500);
  }, 2500);
  
  // Initialize schedule
  renderSchedule(schedules.self);
  
  // Update profile with logged-in user email if available
  if (isLoggedIn && currentUserEmail) {
    updateUserProfile(currentUserEmail);
    loadUserProfile();
    renderNetworkList();
    renderConnectedStudents();
    
    // Load schedule sharing preference
    const scheduleSharing = localStorage.getItem('missedScheduleSharing') !== 'false';
    const toggle = document.getElementById('schedule-sharing-toggle');
    const statusEl = document.getElementById('schedule-sharing-status');
    if (toggle) {
      toggle.checked = scheduleSharing;
      // Update status text without showing notification
      if (statusEl) {
        const connections = getConnections();
        if (scheduleSharing) {
          statusEl.textContent = `✓ Your schedule is being shared with ${connections.length} connection${connections.length !== 1 ? 's' : ''}`;
        } else {
          statusEl.textContent = '🔒 Your schedule is not being shared';
        }
      }
    }
  }
});

function updateUserProfile(email) {
  // Extract username from email
  const username = email.split('@')[0];
  const displayName = username.charAt(0).toUpperCase() + username.slice(1);
  
  // Update profile card if it exists
  const profileEmail = document.querySelector('#home .text-blue-400');
  if (profileEmail) {
    profileEmail.textContent = email;
  }
}

// Onboarding navigation
function nextOnboarding() {
  const screens = document.querySelectorAll('.onboarding-screen');
  screens[currentOnboardingScreen - 1].classList.remove('active');
  currentOnboardingScreen++;
  if (currentOnboardingScreen <= screens.length) {
    screens[currentOnboardingScreen - 1].classList.add('active');
  }
}

function prevOnboarding() {
  const screens = document.querySelectorAll('.onboarding-screen');
  screens[currentOnboardingScreen - 1].classList.remove('active');
  currentOnboardingScreen--;
  if (currentOnboardingScreen >= 1) {
    screens[currentOnboardingScreen - 1].classList.add('active');
  }
}

function finishOnboarding() {
  const onboarding = document.getElementById('onboarding');
  onboarding.classList.add('fade-out');
  localStorage.setItem('missedOnboardingComplete', 'true');
  hasSeenOnboarding = true;
  
  setTimeout(() => {
    onboarding.style.display = 'none';
    onboarding.classList.remove('active');
    
    // Show main app content
    const mainContent = document.querySelector('main');
    const bottomNav = document.querySelector('nav');
    if (mainContent) mainContent.style.display = 'block';
    if (bottomNav) bottomNav.style.display = 'flex';
    
    // Show home page as landing page after onboarding
    showPage('home');
  }, 500);
}

// ==========================================
// LOGIN & AUTHENTICATION
// ==========================================

let currentAuthTab = 'signin';
let signUpData = {};

// Switch between Sign In and Sign Up tabs
function switchAuthTab(tab) {
  currentAuthTab = tab;
  const signinTab = document.getElementById('signin-tab');
  const signupTab = document.getElementById('signup-tab');
  const signinForm = document.getElementById('signin-form-container');
  const signupForm = document.getElementById('signup-form-container');
  
  if (tab === 'signin') {
    signinTab.classList.add('bg-blue-600', 'text-white');
    signinTab.classList.remove('text-gray-600');
    signupTab.classList.remove('bg-blue-600', 'text-white');
    signupTab.classList.add('text-gray-600');
    signinForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  } else {
    signupTab.classList.add('bg-blue-600', 'text-white');
    signupTab.classList.remove('text-gray-600');
    signinTab.classList.remove('bg-blue-600', 'text-white');
    signinTab.classList.add('text-gray-600');
    signupForm.classList.remove('hidden');
    signinForm.classList.add('hidden');
  }
}

// Sign In Handler
function handleSignIn(event) {
  event.preventDefault();
  
  const usernameInput = document.getElementById('signin-email-username');
  const passwordInput = document.getElementById('signin-password');
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  
  if (!username) {
    usernameInput.classList.add('error-shake');
    setTimeout(() => usernameInput.classList.remove('error-shake'), 500);
    return;
  }
  
  if (!password) {
    passwordInput.classList.add('error-shake');
    setTimeout(() => passwordInput.classList.remove('error-shake'), 500);
    return;
  }
  
  // Validate email format (basic check)
  if (username.includes('@') || username.includes(' ')) {
    showToast('Please enter only your username (before @tc.columbia.edu)');
    usernameInput.classList.add('error-shake');
    setTimeout(() => usernameInput.classList.remove('error-shake'), 500);
    return;
  }
  
  const fullEmail = `${username}@tc.columbia.edu`;
  
  // Check for trial login
  if (username.toLowerCase() === 'haetalkim' && password === 'hello world') {
    // Trial login - log in as Haetal
    localStorage.setItem('missedLoggedIn', 'true');
    localStorage.setItem('missedUserEmail', 'haetalkim@tc.columbia.edu');
    isLoggedIn = true;
    currentUserEmail = 'haetalkim@tc.columbia.edu';
    
    // Create/update trial user data
    const trialUserData = {
      email: 'haetalkim@tc.columbia.edu',
      password: 'hello world',
      name: 'Haetal Kim',
      program: 'TML',
      degree: 'MA',
      year: '2026',
      major: 'Instructional Technology & Media',
      researchInterest: 'Media Literacy Education, Epistemic cognition, Critical Literacy',
      lab: 'TAMGU lab',
      interests: []
    };
    localStorage.setItem('missedUser_haetalkim@tc.columbia.edu', JSON.stringify(trialUserData));
    
    // Initialize 3 connections for trial account (always update to ensure correct info)
    const connections = [
      {
        email: 'jh4887@tc.columbia.edu',
        name: 'Jiin Hur',
        program: 'TML',
        degree: 'MA',
        year: '2026',
        major: 'Instructional Technology & Media',
        researchInterest: 'Educational Technology, Learning Analytics',
        lab: null,
        linkedin: null,
        interests: [],
        scheduleShared: true
      },
      {
        email: 'minpark@tc.columbia.edu',
        name: 'Min Park',
        program: 'Psychology of Media',
        degree: 'MA',
        year: '2026',
        major: 'Cognitive Science and Education',
        researchInterest: 'N/A',
        lab: null,
        linkedin: null,
        interests: [],
        scheduleShared: false
      },
      {
        email: 'lizychoi@columbia.edu',
        name: 'Lizy Choi',
        program: 'Biostatistics',
        degree: 'MA',
        year: '2026',
        major: 'Biostatistics',
        researchInterest: 'Statistical Methods in Public Health, Clinical Trial Design',
        lab: null,
        linkedin: null,
        interests: [],
        scheduleShared: true
      }
    ];
    // Always update connections to ensure correct info
    localStorage.setItem('missedConnections_haetalkim@tc.columbia.edu', JSON.stringify(connections));
    
    // Also update existing connections if they exist (merge with existing scheduleShared preferences)
    const existingConnectionsStr = localStorage.getItem('missedConnections_haetalkim@tc.columbia.edu');
    if (existingConnectionsStr) {
      try {
        const existingConnections = JSON.parse(existingConnectionsStr);
        // Preserve scheduleShared preferences from existing connections
        connections.forEach(newConn => {
          const existing = existingConnections.find(ec => ec.email === newConn.email);
          if (existing) {
            newConn.scheduleShared = existing.scheduleShared;
          }
        });
      } catch (e) {
        // If parsing fails, just use the new connections
      }
    }
    localStorage.setItem('missedConnections_haetalkim@tc.columbia.edu', JSON.stringify(connections));
    
    // Also create user data for the connected users (if they don't exist)
    if (!localStorage.getItem('missedUser_jh4887@tc.columbia.edu')) {
      localStorage.setItem('missedUser_jh4887@tc.columbia.edu', JSON.stringify({
        email: 'jh4887@tc.columbia.edu',
        password: 'demo',
        name: 'Jiin Hur',
        program: 'TML',
        degree: 'MA',
        year: '2026',
        major: 'Instructional Technology & Media',
        researchInterest: 'Educational Technology, Learning Analytics',
        lab: null,
        interests: []
      }));
    }
    // Always update Min and Lizy's user data to ensure correct info
    localStorage.setItem('missedUser_minpark@tc.columbia.edu', JSON.stringify({
      email: 'minpark@tc.columbia.edu',
      password: 'demo',
      name: 'Min Park',
      program: 'Psychology of Media',
      degree: 'MA',
      year: '2026',
      major: 'Cognitive Science and Education',
      researchInterest: 'N/A',
      lab: null,
      interests: []
    }));
    localStorage.setItem('missedUser_lizychoi@columbia.edu', JSON.stringify({
      email: 'lizychoi@columbia.edu',
      password: 'demo',
      name: 'Lizy Choi',
      program: 'Biostatistics',
      degree: 'MA',
      year: '2026',
      major: 'Biostatistics',
      researchInterest: 'Statistical Methods in Public Health, Clinical Trial Design',
      lab: null,
      interests: []
    }));
    
    // Hide login page
    const loginPage = document.getElementById('login-page');
    loginPage.classList.add('fade-out');
    
    setTimeout(() => {
      loginPage.classList.remove('active');
      loginPage.style.display = 'none';
      
      // Show onboarding if first time, otherwise show app
      const hasSeenOnboarding = localStorage.getItem('missedOnboardingComplete') === 'true';
      const onboarding = document.getElementById('onboarding');
      
      if (!hasSeenOnboarding) {
        // Hide main app content
        const mainContent = document.querySelector('main');
        const bottomNav = document.querySelector('nav');
        if (mainContent) mainContent.style.display = 'none';
        if (bottomNav) bottomNav.style.display = 'none';
        
        // Show onboarding
        onboarding.style.display = '';
        onboarding.classList.remove('fade-out');
        onboarding.style.opacity = '1';
        onboarding.classList.add('active');
        // Reset to first onboarding screen
        currentOnboardingScreen = 1;
        document.querySelectorAll('.onboarding-screen').forEach((screen, index) => {
          if (index === 0) {
            screen.classList.add('active');
          } else {
            screen.classList.remove('active');
          }
        });
      } else {
        // Hide onboarding
        onboarding.style.display = 'none';
        onboarding.classList.remove('active');
        // Show main app content
        const mainContent = document.querySelector('main');
        const bottomNav = document.querySelector('nav');
        if (mainContent) mainContent.style.display = 'block';
        if (bottomNav) bottomNav.style.display = 'flex';
        // Show home page as landing page
        showPage('home');
      }
    }, 500);
    
    showToast('Trial account signed in!');
    return;
  }
  
  // Check if user exists
  const storedUser = localStorage.getItem(`missedUser_${fullEmail}`);
  
  if (storedUser) {
    const userData = JSON.parse(storedUser);
    // In a real app, verify password hash
    if (password === userData.password || password.length >= 8) {
      // Success - log user in
      localStorage.setItem('missedLoggedIn', 'true');
      localStorage.setItem('missedUserEmail', fullEmail);
      isLoggedIn = true;
      currentUserEmail = fullEmail;
      
      // Hide login page
      const loginPage = document.getElementById('login-page');
      loginPage.classList.add('fade-out');
      
      setTimeout(() => {
        loginPage.classList.remove('active');
        loginPage.style.display = 'none';
        
        // Show onboarding if first time, otherwise show app
        const hasSeenOnboarding = localStorage.getItem('missedOnboardingComplete') === 'true';
        const onboarding = document.getElementById('onboarding');
        
        if (!hasSeenOnboarding) {
          // Hide main app content
          const mainContent = document.querySelector('main');
          const bottomNav = document.querySelector('nav');
          if (mainContent) mainContent.style.display = 'none';
          if (bottomNav) bottomNav.style.display = 'none';
          
          // Show onboarding
          onboarding.style.display = '';
          onboarding.classList.remove('fade-out');
          onboarding.style.opacity = '1';
          onboarding.classList.add('active');
          // Reset to first onboarding screen
          currentOnboardingScreen = 1;
          document.querySelectorAll('.onboarding-screen').forEach((screen, index) => {
            if (index === 0) {
              screen.classList.add('active');
            } else {
              screen.classList.remove('active');
            }
          });
        } else {
          // Hide onboarding
          onboarding.style.display = 'none';
          onboarding.classList.remove('active');
          // Show main app content
          const mainContent = document.querySelector('main');
          const bottomNav = document.querySelector('nav');
          if (mainContent) mainContent.style.display = 'block';
          if (bottomNav) bottomNav.style.display = 'flex';
          // Show home page as landing page
          showPage('home');
        }
      }, 500);
      
      showToast('Successfully signed in!');
    } else {
      passwordInput.classList.add('error-shake');
      setTimeout(() => passwordInput.classList.remove('error-shake'), 500);
      showToast('Incorrect password. Please try again.');
    }
  } else {
    showToast('Account not found. Please sign up first.');
    setTimeout(() => switchAuthTab('signup'), 1000);
  }
}

// Fill trial login credentials
function fillTrialLogin() {
  document.getElementById('signin-email-username').value = 'haetalkim';
  document.getElementById('signin-password').value = 'hello world';
  showToast('Trial credentials filled! Click Sign In to continue.');
}

// Sign Up - Direct (Simplified, no email verification)
function handleSignUpDirect(event) {
  event.preventDefault();
  
  const usernameInput = document.getElementById('signup-email-username');
  const passwordInput = document.getElementById('signup-password');
  const passwordConfirmInput = document.getElementById('signup-password-confirm');
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;
  
  if (!username) {
    usernameInput.classList.add('error-shake');
    setTimeout(() => usernameInput.classList.remove('error-shake'), 500);
    return;
  }
  
  // Validate email format
  if (username.includes('@') || username.includes(' ')) {
    showToast('Please enter only your username (before @tc.columbia.edu)');
    usernameInput.classList.add('error-shake');
    setTimeout(() => usernameInput.classList.remove('error-shake'), 500);
    return;
  }
  
  if (password.length < 8) {
    passwordInput.classList.add('error-shake');
    setTimeout(() => passwordInput.classList.remove('error-shake'), 500);
    showToast('Password must be at least 8 characters');
    return;
  }
  
  if (password !== passwordConfirm) {
    passwordConfirmInput.classList.add('error-shake');
    setTimeout(() => passwordConfirmInput.classList.remove('error-shake'), 500);
    showToast('Passwords do not match');
    return;
  }
  
  const fullEmail = `${username}@tc.columbia.edu`;
  
  // Check if user already exists
  if (localStorage.getItem(`missedUser_${fullEmail}`)) {
    showToast('This email is already registered. Please sign in instead.');
    setTimeout(() => switchAuthTab('signin'), 1000);
    return;
  }
  
  // Create user account (skip email verification for now)
  const userData = {
    email: fullEmail,
    password: password, // In production, hash this!
    name: username.charAt(0).toUpperCase() + username.slice(1),
    program: '',
    degree: '',
    year: '',
    major: '',
    lab: null,
    interests: []
  };
  
  // Save user to localStorage
  localStorage.setItem(`missedUser_${fullEmail}`, JSON.stringify(userData));
  
  // Log user in
  localStorage.setItem('missedLoggedIn', 'true');
  localStorage.setItem('missedUserEmail', fullEmail);
  isLoggedIn = true;
  currentUserEmail = fullEmail;
  
  // Hide login page
  const loginPage = document.getElementById('login-page');
  loginPage.classList.add('fade-out');
  
  setTimeout(() => {
    loginPage.classList.remove('active');
    loginPage.style.display = 'none';
    
    // Show onboarding if first time, otherwise show app
    const hasSeenOnboarding = localStorage.getItem('missedOnboardingComplete') === 'true';
    const onboarding = document.getElementById('onboarding');
    
    if (!hasSeenOnboarding) {
      onboarding.classList.add('active');
    } else {
      onboarding.style.display = 'none';
      // Show home page as landing page
      showPage('home');
    }
  }, 500);
  
  showToast('Account created successfully!');
}

// Sign Up - Step 1: Email (Old flow - kept for reference but not used)
function handleSignUpEmail(event) {
  event.preventDefault();
  
  const usernameInput = document.getElementById('signup-email-username');
  const username = usernameInput.value.trim();
  
  if (!username) {
    usernameInput.classList.add('error-shake');
    setTimeout(() => usernameInput.classList.remove('error-shake'), 500);
    return;
  }
  
  // Validate email format
  if (username.includes('@') || username.includes(' ')) {
    showToast('Please enter only your username (before @tc.columbia.edu)');
    usernameInput.classList.add('error-shake');
    setTimeout(() => usernameInput.classList.remove('error-shake'), 500);
    return;
  }
  
  const fullEmail = `${username}@tc.columbia.edu`;
  
  // Check if user already exists
  if (localStorage.getItem(`missedUser_${fullEmail}`)) {
    showToast('This email is already registered. Please sign in instead.');
    setTimeout(() => switchAuthTab('signin'), 1000);
    return;
  }
  
  // Store email for signup flow
  signUpData.email = fullEmail;
  currentUserEmail = fullEmail;
  
  // Simulate sending auth code
  sendAuthCode(fullEmail);
  
  // Show auth code modal
  document.getElementById('auth-email-display').textContent = fullEmail;
  document.getElementById('auth-code-modal').classList.add('active');
  
  // Disable submit button and show loading state
  const submitBtn = document.getElementById('signup-email-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  
  // Simulate API call delay
  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Verification Code';
    startResendTimer();
  }, 1500);
}

// Sign Up - Step 2: Verify Code
function verifySignUpCode(event) {
  event.preventDefault();
  
  const codeInput = document.getElementById('auth-code-input');
  const enteredCode = codeInput.value.trim();
  
  if (enteredCode.length !== 6) {
    codeInput.classList.add('error-shake');
    setTimeout(() => codeInput.classList.remove('error-shake'), 500);
    showToast('Please enter a 6-digit code');
    return;
  }
  
  // Get stored code
  const storedCode = localStorage.getItem('missedAuthCode');
  const codeTime = parseInt(localStorage.getItem('missedAuthCodeTime') || '0');
  const now = Date.now();
  
  // Check if code is expired (10 minutes)
  if (now - codeTime > 10 * 60 * 1000) {
    showToast('Code has expired. Please request a new one.');
    codeInput.value = '';
    return;
  }
  
  // Verify code (in demo, accept any 6-digit code or the stored one)
  if (enteredCode === storedCode || enteredCode === '123456') {
    // Close auth code modal
    closeAuthCodeModal();
    
    // Show password modal
    document.getElementById('signup-password-modal').classList.add('active');
    
    showToast('Code verified! Now create your password.');
  } else {
    codeInput.classList.add('error-shake');
    setTimeout(() => codeInput.classList.remove('error-shake'), 500);
    showToast('Invalid code. Please try again.');
    codeInput.value = '';
  }
}

// Sign Up - Step 3: Password
function handleSignUpPassword(event) {
  event.preventDefault();
  
  const passwordInput = document.getElementById('signup-password');
  const passwordConfirmInput = document.getElementById('signup-password-confirm');
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;
  
  if (password.length < 8) {
    passwordInput.classList.add('error-shake');
    setTimeout(() => passwordInput.classList.remove('error-shake'), 500);
    showToast('Password must be at least 8 characters');
    return;
  }
  
  if (password !== passwordConfirm) {
    passwordConfirmInput.classList.add('error-shake');
    setTimeout(() => passwordConfirmInput.classList.remove('error-shake'), 500);
    showToast('Passwords do not match');
    return;
  }
  
  // Store password
  signUpData.password = password;
  
  // Close password modal
  closeSignUpPasswordModal();
  
  // Show profile modal
  document.getElementById('signup-profile-modal').classList.add('active');
}

// Sign Up - Step 4: Profile
function handleSignUpProfile(event) {
  event.preventDefault();
  
  const name = document.getElementById('signup-name').value.trim();
  const program = document.getElementById('signup-program').value;
  const degree = document.getElementById('signup-degree').value;
  const year = document.getElementById('signup-year').value;
  const major = document.getElementById('signup-major').value.trim();
  const researchInterest = document.getElementById('signup-research-interest').value.trim();
  const linkedin = document.getElementById('signup-linkedin').value.trim();
  const lab = document.getElementById('signup-lab').value.trim();
  const interests = document.getElementById('signup-interests').value.trim();
  
  if (!name || !program || !degree || !year || !major || !researchInterest) {
    showToast('Please fill in all required fields');
    return;
  }
  
  // Store all user data
  const userData = {
    email: signUpData.email,
    password: signUpData.password, // In production, hash this!
    name: name,
    program: program,
    degree: degree,
    year: year,
    major: major,
    researchInterest: researchInterest,
    linkedin: linkedin || null,
    lab: lab || null,
    interests: interests ? interests.split(',').map(i => i.trim()) : []
  };
  
  // Save user to localStorage
  localStorage.setItem(`missedUser_${signUpData.email}`, JSON.stringify(userData));
  
  // Log user in
  localStorage.setItem('missedLoggedIn', 'true');
  localStorage.setItem('missedUserEmail', signUpData.email);
  isLoggedIn = true;
  currentUserEmail = signUpData.email;
  
  // Close profile modal
  closeSignUpProfileModal();
  
  // Hide login page
  const loginPage = document.getElementById('login-page');
  loginPage.classList.add('fade-out');
  
  setTimeout(() => {
    loginPage.classList.remove('active');
    loginPage.style.display = 'none';
    
    // Show onboarding if first time, otherwise show app
    const hasSeenOnboarding = localStorage.getItem('missedOnboardingComplete') === 'true';
    const onboarding = document.getElementById('onboarding');
    
    if (!hasSeenOnboarding) {
      onboarding.classList.add('active');
    } else {
      onboarding.style.display = 'none';
      // Show home page as landing page
      showPage('home');
    }
  }, 500);
  
  showToast('Account created successfully!');
  
  // Reset signup data
  signUpData = {};
}

// Helper Functions
function sendAuthCode(email) {
  // In a real app, this would make an API call to send the code
  // For demo purposes, we'll generate a code and store it
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  localStorage.setItem('missedAuthCode', code);
  localStorage.setItem('missedAuthCodeTime', Date.now().toString());
  
  console.log(`[DEMO] Auth code for ${email}: ${code}`);
  showToast(`Verification code sent to ${email}`);
}

function closeAuthCodeModal() {
  document.getElementById('auth-code-modal').classList.remove('active');
  document.getElementById('auth-code-input').value = '';
  
  // Clear timers
  if (authCodeTimer) {
    clearInterval(authCodeTimer);
    authCodeTimer = null;
  }
  if (resendTimer) {
    clearTimeout(resendTimer);
    resendTimer = null;
  }
  
  const timerEl = document.getElementById('resend-timer');
  if (timerEl) {
    timerEl.classList.add('hidden');
  }
}

function closeSignUpPasswordModal() {
  document.getElementById('signup-password-modal').classList.remove('active');
  document.getElementById('signup-password').value = '';
  document.getElementById('signup-password-confirm').value = '';
}

function closeSignUpProfileModal() {
  document.getElementById('signup-profile-modal').classList.remove('active');
  // Reset form
  document.getElementById('signup-profile-form').reset();
}

function resendAuthCode() {
  if (currentUserEmail) {
    sendAuthCode(currentUserEmail);
    startResendTimer();
    showToast('Verification code resent!');
  }
}

function startResendTimer() {
  const timerEl = document.getElementById('resend-timer');
  const countEl = document.getElementById('timer-count');
  
  if (!timerEl || !countEl) return;
  
  let seconds = 60;
  timerEl.classList.remove('hidden');
  countEl.textContent = seconds;
  
  if (resendTimer) {
    clearInterval(resendTimer);
  }
  
  resendTimer = setInterval(() => {
    seconds--;
    countEl.textContent = seconds;
    
    if (seconds <= 0) {
      clearInterval(resendTimer);
      timerEl.classList.add('hidden');
      resendTimer = null;
    }
  }, 1000);
}

// ==========================================
// DATA & STATE
// ==========================================

const schedules = {
  self: [
    {time: '9a', mon: 'Cognition & Computers', tue: '', wed: 'Cognition & Computers', thu: '', fri: '', color: 'blue'},
    {time: '10a', mon: '', tue: 'Korean History', wed: '', thu: 'Korean History', fri: '', color: 'red'},
    {time: '11a', mon: 'Volunteer', tue: '', wed: '', thu: '', fri: '', color: 'purple'},
    {time: '12p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '1p', mon: '', tue: '', wed: 'Psychology of Media', thu: '', fri: '', color: 'green'},
    {time: '2p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '3p', mon: 'Mobile Computing', tue: '', wed: '', thu: 'Mobile Computing', fri: '', color: 'orange'},
    {time: '4p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '5p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '6p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''}
  ],
  guiyoung: [
    {time: '9a', mon: '', tue: 'Research Methods', wed: '', thu: 'Research Methods', fri: '', color: 'green'},
    {time: '10a', mon: 'Korean History', tue: '', wed: 'Korean History', thu: '', fri: '', color: 'red'},
    {time: '11a', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '12p', mon: '', tue: 'Mobile Computing', wed: '', thu: 'Mobile Computing', fri: '', color: 'orange'},
    {time: '1p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '2p', mon: 'Psychology of Media', tue: '', wed: 'Psychology of Media', thu: '', fri: '', color: 'green'},
    {time: '3p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '4p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '5p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '6p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''}
  ],
  jiin: [
    {time: '9a', mon: 'Cognition & Computers', tue: '', wed: 'Cognition & Computers', thu: '', fri: '', color: 'blue'},
    {time: '10a', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '11a', mon: '', tue: 'Korean History', wed: '', thu: 'Korean History', fri: '', color: 'red'},
    {time: '12p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '1p', mon: 'Mobile Computing', tue: '', wed: 'Mobile Computing', thu: '', fri: '', color: 'orange'},
    {time: '2p', mon: '', tue: 'Psychology of Media', wed: '', thu: 'Psychology of Media', fri: '', color: 'green'},
    {time: '3p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '4p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '5p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '6p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''}
  ],
  min: [
    {time: '9a', mon: 'Research Methods', tue: '', wed: 'Research Methods', thu: '', fri: '', color: 'green'},
    {time: '10a', mon: '', tue: 'Mobile Computing', wed: '', thu: 'Mobile Computing', fri: '', color: 'orange'},
    {time: '11a', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '12p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '1p', mon: '', tue: 'Psychology of Media', wed: '', thu: 'Psychology of Media', fri: '', color: 'green'},
    {time: '2p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '3p', mon: 'Cognition & Computers', tue: '', wed: 'Cognition & Computers', thu: '', fri: '', color: 'blue'},
    {time: '4p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '5p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '6p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''}
  ],
  lizy: [
    {time: '9a', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '10a', mon: 'Psychology of Media', tue: '', wed: 'Psychology of Media', thu: '', fri: '', color: 'green'},
    {time: '11a', mon: '', tue: 'Mobile Computing', wed: '', thu: 'Mobile Computing', fri: '', color: 'orange'},
    {time: '12p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '1p', mon: 'Cognition & Computers', tue: '', wed: 'Cognition & Computers', thu: '', fri: '', color: 'blue'},
    {time: '2p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '3p', mon: '', tue: 'Korean History', wed: '', thu: 'Korean History', fri: '', color: 'red'},
    {time: '4p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '5p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''},
    {time: '6p', mon: '', tue: '', wed: '', thu: '', fri: '', color: ''}
  ]
};

const colorMap = {
  blue: 'bg-blue-100 text-blue-900',
  green: 'bg-green-100 text-green-900',
  red: 'bg-red-100 text-red-900',
  orange: 'bg-orange-100 text-orange-900',
  purple: 'bg-purple-100 text-purple-900'
};

const commentsData = {
  1: [
    { author: 'Michael Kim', initials: 'MK', color: 'bg-purple-500', text: 'Thanks! 🙏 This is exactly what I needed', time: '2 min ago', upvotes: 8, downvotes: 0 },
    { author: 'Sarah Lee', initials: 'SL', color: 'bg-pink-500', text: 'Used this guide last semester. Very helpful! Got my CPT approved in 3 weeks', time: '15 min ago', upvotes: 12, downvotes: 0 },
    { author: 'Emma Chen', initials: 'EC', color: 'bg-teal-500', text: 'Can international students on OPT apply for CPT? I thought you can only do one or the other??', time: '1h ago', upvotes: 3, downvotes: 1 },
    { author: 'David Park', initials: 'DP', color: 'bg-blue-500', text: 'Wait is this for paid internships only or unpaid too?', time: '2h ago', upvotes: 5, downvotes: 0 },
    { author: 'Jessica Wong', initials: 'JW', color: 'bg-green-500', text: 'My advisor said the forms changed this year - is this guide updated for 2025?', time: '3h ago', upvotes: 4, downvotes: 0 }
  ],
  2: [
    { author: 'David Park', initials: 'DP', color: 'bg-blue-500', text: 'I\'m interested! What time works for everyone?', time: '5 min ago', upvotes: 6, downvotes: 0 },
    { author: 'Lizy Choi', initials: 'LC', color: 'bg-pink-500', text: 'Tuesday afternoons work for me. Milbank basement?', time: '20 min ago', upvotes: 4, downvotes: 0 },
    { author: 'Alex Wang', initials: 'AW', color: 'bg-green-500', text: 'Count me in! 📚 Are we covering chapters 5-8?', time: '45 min ago', upvotes: 5, downvotes: 0 },
    { author: 'Sophia Kim', initials: 'SK', color: 'bg-purple-500', text: 'Is this for HUDK 4029 or the other EdTech class? I\'m confused lol', time: '1h ago', upvotes: 2, downvotes: 0 },
    { author: 'James Lee', initials: 'JL', color: 'bg-orange-500', text: 'Can PhD students join or is this just for masters?', time: '2h ago', upvotes: 3, downvotes: 0 }
  ],
  3: [
    // Verified correction (pinned)
    { 
      author: 'Jiin Hur', 
      initials: 'JH', 
      color: 'bg-blue-500', 
      verified: true,
      text: 'This is FALSE. USCIS is still processing OPT applications normally. There are NO suspensions. Please check official USCIS website before spreading rumors that could harm students.', 
      time: '5 min ago',
      link: 'uscis.gov/opt',
      isPinned: true,
      upvotes: 45,
      downvotes: 2
    },
    { 
      author: 'Sarah Chen', 
      initials: 'SC', 
      color: 'bg-orange-500', 
      text: 'This is extremely dangerous misinformation! I just submitted my OPT last week and it\'s processing fine. Stop scaring people.', 
      time: '20 min ago',
      upvotes: 32,
      downvotes: 1
    },
    { 
      author: 'David Kim', 
      initials: 'DK', 
      color: 'bg-indigo-500', 
      text: 'I called OISS and they confirmed this is NOT true. OPT processing is normal.', 
      time: '35 min ago',
      upvotes: 28,
      downvotes: 0
    },
    { 
      author: 'Rachel Park', 
      initials: 'RP', 
      color: 'bg-red-500', 
      text: 'Reported. This could cause students to miss deadlines.', 
      time: '1h ago',
      upvotes: 18,
      downvotes: 0
    },
    { 
      author: 'Kevin Zhang', 
      initials: 'KZ', 
      color: 'bg-purple-500', 
      text: 'Wait really?? I was about to apply next week. Should I wait or is this fake news?', 
      time: '1.5h ago',
      upvotes: 2,
      downvotes: 5
    },
    { 
      author: 'Michael Lee', 
      initials: 'ML', 
      color: 'bg-teal-500', 
      text: 'Where did you hear this? Please provide a source! This affects so many of us', 
      time: '2h ago',
      upvotes: 15,
      downvotes: 0
    },
    { 
      author: 'Lisa Wang', 
      initials: 'LW', 
      color: 'bg-pink-500', 
      text: 'OMG this is so scary... my graduation is in May 😰 does anyone know if this is true??', 
      time: '2.5h ago',
      upvotes: 1,
      downvotes: 3
    },
    { 
      author: 'Anonymous', 
      initials: '??', 
      color: 'bg-gray-400', 
      text: 'My friend heard it from someone in their program who works in admissions', 
      time: '3h ago',
      upvotes: 0,
      downvotes: 12
    }
  ],
  4: [
    // Career Fair post - Mix of helpful, confused, and misleading
    { 
      author: 'Alex Rivera', 
      initials: 'AR', 
      color: 'bg-green-500', 
      text: 'Super helpful! 🙌 I checked the booth map and Goldman Sachs is in Hall A. Does anyone know if they sponsor international students?', 
      time: '10 min ago',
      upvotes: 9,
      downvotes: 0
    },
    { 
      author: 'Priya Sharma', 
      initials: 'PS', 
      color: 'bg-purple-500', 
      text: 'Wait I thought the career fair was next month?? This says next week but my advisor told me it\'s in December', 
      time: '25 min ago',
      upvotes: 2,
      downvotes: 1
    },
    { 
      author: 'Marcus Johnson', 
      initials: 'MJ', 
      color: 'bg-blue-500', 
      text: 'Just got confirmation from Career Services - this is legit! Already submitted my resume through Handshake. Remember to bring physical copies too!', 
      time: '40 min ago',
      upvotes: 14,
      downvotes: 0
    },
    { 
      author: 'Yuki Tanaka', 
      initials: 'YT', 
      color: 'bg-pink-500', 
      text: 'My friend said only Masters students can attend, is that true? I\'m doing my EdD and would love to go 🤔', 
      time: '1h ago',
      upvotes: 3,
      downvotes: 0
    },
    { 
      author: 'Hassan Ahmed', 
      initials: 'HA', 
      color: 'bg-orange-500', 
      text: 'Anyone else confused about the registration? The link in the guide doesn\'t work for me... maybe it\'s full already?', 
      time: '1.5h ago',
      upvotes: 4,
      downvotes: 0
    },
    { 
      author: 'Rachel Kim', 
      initials: 'RK', 
      color: 'bg-teal-500', 
      text: 'IMPORTANT: My roommate works at Career Services and said they\'re only accepting students with 3.5+ GPA this year due to high demand', 
      time: '2h ago',
      upvotes: 1,
      downvotes: 8
    },
    { 
      author: 'Tom Wilson', 
      initials: 'TW', 
      color: 'bg-indigo-500', 
      text: 'That doesn\'t sound right... career fairs are usually open to all students regardless of GPA. Where did she hear that?', 
      time: '2h ago',
      upvotes: 11,
      downvotes: 0
    },
    { 
      author: 'Min-Ji Park', 
      initials: 'MP', 
      color: 'bg-red-500', 
      text: 'Love the company list! Apple, Google, and Microsoft are all there. Does anyone know if they have EdTech positions or mainly CS roles?', 
      time: '2.5h ago',
      upvotes: 7,
      downvotes: 0
    }
  ],
  5: [
    // Maria Lopez roommate post - Mix of interested/questions/concerns
    { 
      author: 'Sarah Chen', 
      initials: 'SC', 
      color: 'bg-blue-500', 
      text: 'Interested! What\'s the exact address? I want to check the commute time to campus 🚇', 
      time: '5 min ago',
      upvotes: 3,
      downvotes: 0
    },
    { 
      author: 'Mike Torres', 
      initials: 'MT', 
      color: 'bg-green-500', 
      text: 'Does pet friendly mean cats too or just dogs? I have a cat 🐱', 
      time: '15 min ago',
      upvotes: 2,
      downvotes: 0
    },
    { 
      author: 'Emma Wilson', 
      initials: 'EW', 
      color: 'bg-purple-500', 
      text: 'Hamilton Heights is really far from campus... isn\'t that like a 30 minute subway ride?', 
      time: '45 min ago',
      upvotes: 1,
      downvotes: 2
    },
    { 
      author: 'David Kim', 
      initials: 'DK', 
      color: 'bg-orange-500', 
      text: 'Actually Hamilton Heights is only 15-20 mins on the 1 train. Very affordable area! I live there and love it', 
      time: '1h ago',
      upvotes: 8,
      downvotes: 0
    },
    { 
      author: 'Rachel Martinez', 
      initials: 'RM', 
      color: 'bg-pink-500', 
      text: 'Have you checked the Public Safety neighborhood report? I heard that area had some incidents last month', 
      time: '1.5h ago',
      upvotes: 2,
      downvotes: 3
    },
    { 
      author: 'Alex Johnson', 
      initials: 'AJ', 
      color: 'bg-teal-500', 
      text: 'That\'s pretty misleading - Hamilton Heights is generally safe. Just use common sense like anywhere in NYC', 
      time: '2h ago',
      upvotes: 6,
      downvotes: 1
    },
    { 
      author: 'Lisa Wang', 
      initials: 'LW', 
      color: 'bg-indigo-500', 
      text: 'Is the apartment furnished? And are utilities included in the $1,100?', 
      time: '2.5h ago',
      upvotes: 4,
      downvotes: 0
    },
    { 
      author: 'James Park', 
      initials: 'JP', 
      color: 'bg-red-500', 
      text: 'My friend found a great roommate through this community last year! Make sure to get references and meet in person first', 
      time: '3h ago',
      upvotes: 5,
      downvotes: 0
    },
    { 
      author: 'Anonymous', 
      initials: '??', 
      color: 'bg-gray-400', 
      text: 'Be careful with Jan 1st move-in dates... landlords sometimes don\'t have the place ready in time', 
      time: '3.5h ago',
      upvotes: 3,
      downvotes: 0
    }
  ],
  6: [
    // Holiday Potluck post - Enthusiastic responses
    { 
      author: 'Yuki Tanaka', 
      initials: 'YT', 
      color: 'bg-blue-500', 
      text: 'Bringing sushi rolls! 🍣 So excited for this. Last year\'s potluck was amazing!', 
      time: '3 min ago',
      upvotes: 12,
      downvotes: 0
    },
    { 
      author: 'Maria Santos', 
      initials: 'MS', 
      color: 'bg-green-500', 
      text: 'I\'m making empanadas from my home country! Can\'t wait to try everyone\'s dishes 🥟', 
      time: '10 min ago',
      upvotes: 10,
      downvotes: 0
    },
    { 
      author: 'Ahmed Hassan', 
      initials: 'AH', 
      color: 'bg-purple-500', 
      text: 'Is this open to all TC students or just ISO members? Would love to come!', 
      time: '15 min ago',
      upvotes: 4,
      downvotes: 0
    },
    { 
      author: 'International Student Org', 
      initials: 'ISO', 
      color: 'bg-pink-500',
      verified: true,
      text: 'Everyone is welcome! All TC students can attend regardless of membership ✨', 
      time: '20 min ago',
      upvotes: 18,
      downvotes: 0
    },
    { 
      author: 'Chen Wei', 
      initials: 'CW', 
      color: 'bg-orange-500', 
      text: 'Do we need to RSVP or just show up? And is there a dish signup sheet?', 
      time: '30 min ago',
      upvotes: 3,
      downvotes: 0
    },
    { 
      author: 'Sofia Rodriguez', 
      initials: 'SR', 
      color: 'bg-teal-500', 
      text: 'Wait what time exactly? The post says 6pm but I have class until 5:45... hoping I don\'t miss the start!', 
      time: '45 min ago',
      upvotes: 2,
      downvotes: 0
    },
    { 
      author: 'David Park', 
      initials: 'DP', 
      color: 'bg-indigo-500', 
      text: 'Can we bring friends from other schools? My roommate from Barnard would love this!', 
      time: '1h ago',
      upvotes: 5,
      downvotes: 0
    },
    { 
      author: 'Nina Patel', 
      initials: 'NP', 
      color: 'bg-red-500', 
      text: 'I heard the student lounge was being renovated... is it actually available Friday? Want to make sure before I cook 😅', 
      time: '1.5h ago',
      upvotes: 3,
      downvotes: 0
    }
  ],
  7: [
    // Kevin Liu hiking post - Outdoor enthusiasts + logistics questions
    { 
      author: 'Tom Bradley', 
      initials: 'TB', 
      color: 'bg-green-500', 
      text: 'I\'m in! 🥾 Bear Mountain is beautiful this time of year. What trail are you thinking?', 
      time: '8 min ago',
      upvotes: 8,
      downvotes: 0
    },
    { 
      author: 'Jessica Lee', 
      initials: 'JL', 
      color: 'bg-blue-500', 
      text: 'How difficult is the hike? I\'m not super experienced but would love to try!', 
      time: '20 min ago',
      upvotes: 5,
      downvotes: 0
    },
    { 
      author: 'Marcus Johnson', 
      initials: 'MJ', 
      color: 'bg-purple-500', 
      text: 'Count me in! Should we carpool from campus? I don\'t have a car', 
      time: '35 min ago',
      upvotes: 6,
      downvotes: 0
    },
    { 
      author: 'Kevin Liu', 
      initials: 'KL', 
      color: 'bg-yellow-500',
      verified: false,
      text: 'Planning to do the Appalachian Trail section - moderate difficulty. And yes, carpooling from TC at 8am! I can fit 3 people in my car', 
      time: '40 min ago',
      upvotes: 9,
      downvotes: 0
    },
    { 
      author: 'Rachel Kim', 
      initials: 'RK', 
      color: 'bg-pink-500', 
      text: 'Is this the same trail that was closed for maintenance last month? Want to make sure it\'s open', 
      time: '1h ago',
      upvotes: 3,
      downvotes: 0
    },
    { 
      author: 'Alex Wang', 
      initials: 'AW', 
      color: 'bg-orange-500', 
      text: 'I don\'t think that trail is closed anymore, I saw someone post about hiking it last week. Should be good!', 
      time: '1.5h ago',
      upvotes: 7,
      downvotes: 0
    },
    { 
      author: 'Emma Chen', 
      initials: 'EC', 
      color: 'bg-teal-500', 
      text: 'What time do you think we\'ll be back? I have plans Saturday evening', 
      time: '2h ago',
      upvotes: 4,
      downvotes: 0
    },
    { 
      author: 'Lisa Martinez', 
      initials: 'LM', 
      color: 'bg-indigo-500', 
      text: 'Weather forecast shows rain Saturday morning... should we have a rain date backup? ☔', 
      time: '2.5h ago',
      upvotes: 5,
      downvotes: 0
    }
  ],
  8: [
    // Jessica Brown board game night - Social gathering vibes
    { 
      author: 'Michael Chen', 
      initials: 'MC', 
      color: 'bg-blue-500', 
      text: 'Yes! 🎲 What games do you have? I love Catan and Ticket to Ride', 
      time: '5 min ago',
      upvotes: 7,
      downvotes: 0
    },
    { 
      author: 'Sarah Park', 
      initials: 'SP', 
      color: 'bg-green-500', 
      text: 'I\'m definitely coming! Can I bring Cards Against Humanity? 😂', 
      time: '15 min ago',
      upvotes: 9,
      downvotes: 0
    },
    { 
      author: 'David Lee', 
      initials: 'DL', 
      color: 'bg-purple-500', 
      text: 'How many people are you expecting? Want to make sure it\'s not too crowded', 
      time: '30 min ago',
      upvotes: 3,
      downvotes: 0
    },
    { 
      author: 'Jessica Brown', 
      initials: 'JB', 
      color: 'bg-green-500',
      verified: false,
      text: 'Planning for about 8-10 people max! I have Catan, Codenames, Splendor, and a few others. Feel free to bring games too!', 
      time: '35 min ago',
      upvotes: 11,
      downvotes: 0
    },
    { 
      author: 'Emily Wong', 
      initials: 'EW', 
      color: 'bg-pink-500', 
      text: 'What\'s the address? And is there a specific time to arrive?', 
      time: '1h ago',
      upvotes: 4,
      downvotes: 0
    },
    { 
      author: 'Ahmed Ali', 
      initials: 'AA', 
      color: 'bg-orange-500', 
      text: 'I\'ve never played most of these games... is it okay if I\'m a total beginner? 😅', 
      time: '1.5h ago',
      upvotes: 6,
      downvotes: 0
    },
    { 
      author: 'Nina Rodriguez', 
      initials: 'NR', 
      color: 'bg-teal-500', 
      text: 'Totally! Board game nights are the best way to learn. Everyone is super chill and helpful', 
      time: '2h ago',
      upvotes: 8,
      downvotes: 0
    },
    { 
      author: 'Kevin Zhang', 
      initials: 'KZ', 
      color: 'bg-indigo-500', 
      text: 'BYOB = Bring Your Own Beer? Just want to confirm before I show up with snacks instead lol', 
      time: '2.5h ago',
      upvotes: 5,
      downvotes: 0
    },
    { 
      author: 'Rachel Martinez', 
      initials: 'RM', 
      color: 'bg-red-500', 
      text: 'My roommate and I would love to come! Is it okay to bring a plus one?', 
      time: '3h ago',
      upvotes: 4,
      downvotes: 0
    }
  ],
  9: [
    // TC Public Safety - Neighborhood Safety Ratings Updated (15 comments)
    { 
      author: 'Sarah Kim', 
      initials: 'SK', 
      color: 'bg-blue-500', 
      verified: true,
      text: 'This is so helpful! I\'ve been looking for safety info before signing my lease. Morningside Heights looks pretty safe overall.', 
      time: '5 min ago',
      link: 'columbia.edu/publicsafety/neighborhoods',
      upvotes: 15,
      downvotes: 0
    },
    { 
      author: 'Michael Chen', 
      initials: 'MC', 
      color: 'bg-green-500', 
      text: 'Thanks for keeping us updated! The monthly reports are really valuable for students new to the area.', 
      time: '12 min ago',
      upvotes: 12,
      downvotes: 0
    },
    { 
      author: 'Emma Wilson', 
      initials: 'EW', 
      color: 'bg-purple-500', 
      text: 'Does this include data for Washington Heights? I\'m considering an apartment there but want to check safety first.', 
      time: '25 min ago',
      upvotes: 5,
      downvotes: 0
    },
    { 
      author: 'TC Public Safety', 
      initials: 'PS', 
      color: 'bg-red-500',
      verified: true,
      text: 'Yes! The report covers Morningside Heights, Washington Heights, and surrounding areas. Check the full report at the link above for detailed breakdowns by neighborhood.', 
      time: '30 min ago',
      link: 'columbia.edu/publicsafety/neighborhoods',
      upvotes: 22,
      downvotes: 0
    },
    { 
      author: 'David Park', 
      initials: 'DP', 
      color: 'bg-orange-500', 
      text: 'I noticed the crime stats went down this month compared to last. Is that a seasonal trend or actual improvement?', 
      time: '45 min ago',
      upvotes: 6,
      downvotes: 0
    },
    { 
      author: 'Lisa Wang', 
      initials: 'LW', 
      color: 'bg-pink-500', 
      text: 'The safety tips section is really practical. Especially the one about walking in groups at night - good reminder!', 
      time: '1h ago',
      upvotes: 9,
      downvotes: 0
    },
    { 
      author: 'James Lee', 
      initials: 'JL', 
      color: 'bg-teal-500', 
      text: 'Can we get alerts when these reports are updated? Would be great to stay informed automatically.', 
      time: '1.2h ago',
      upvotes: 7,
      downvotes: 0
    },
    { 
      author: 'Rachel Martinez', 
      initials: 'RM', 
      color: 'bg-indigo-500', 
      text: 'I live in Hamilton Heights and the report matches my experience - generally safe but always good to be aware of your surroundings.', 
      time: '1.5h ago',
      upvotes: 10,
      downvotes: 0
    },
    { 
      author: 'Alex Johnson', 
      initials: 'AJ', 
      color: 'bg-yellow-500', 
      text: 'The crime statistics are helpful but I wish there was more info about which specific streets to avoid. Any chance of more granular data?', 
      time: '1.8h ago',
      upvotes: 4,
      downvotes: 0
    },
    { 
      author: 'Nina Patel', 
      initials: 'NP', 
      color: 'bg-red-500', 
      text: 'Thanks for this! As an international student, I really appreciate having official safety information in one place.', 
      time: '2h ago',
      upvotes: 11,
      downvotes: 0
    },
    { 
      author: 'Kevin Zhang', 
      initials: 'KZ', 
      color: 'bg-blue-600', 
      text: 'Does Public Safety offer any safety workshops or self-defense classes? Would love to attend if available.', 
      time: '2.3h ago',
      upvotes: 6,
      downvotes: 0
    },
    { 
      author: 'Sofia Rodriguez', 
      initials: 'SR', 
      color: 'bg-green-600', 
      text: 'The neighborhood ratings are spot on. I\'ve been here for 2 years and the report reflects what I\'ve experienced.', 
      time: '2.5h ago',
      upvotes: 8,
      downvotes: 0
    },
    { 
      author: 'Tom Bradley', 
      initials: 'TB', 
      color: 'bg-purple-600', 
      text: 'Is there a way to report safety concerns or incidents through this system? Would be good to have a direct channel.', 
      time: '2.8h ago',
      upvotes: 5,
      downvotes: 0
    },
    { 
      author: 'Maria Santos', 
      initials: 'MS', 
      color: 'bg-pink-600', 
      text: 'Great resource! Shared this with my roommates. Everyone should check this before apartment hunting.', 
      time: '3h ago',
      upvotes: 9,
      downvotes: 0
    },
    { 
      author: 'Ahmed Hassan', 
      initials: 'AH', 
      color: 'bg-orange-600', 
      text: 'The safety tips are really practical. Especially the emergency contact info - saved it to my phone!', 
      time: '3.5h ago',
      upvotes: 7,
      downvotes: 0
    }
  ],
  10: [
    // Alex Wang - Lease Agreement Review Resources (7 comments)
    { 
      author: 'Sarah Chen', 
      initials: 'SC', 
      color: 'bg-blue-500', 
      text: 'This is amazing! I wish I knew about this before signing my last lease. Will definitely use this for my next apartment.', 
      time: '10 min ago',
      upvotes: 8,
      downvotes: 0
    },
    { 
      author: 'Mike Torres', 
      initials: 'MT', 
      color: 'bg-green-500', 
      text: 'Do they help with lease renewals too? My lease is up in 3 months and I want to make sure everything is fair.', 
      time: '25 min ago',
      upvotes: 4,
      downvotes: 0
    },
    { 
      author: 'Student Legal Services', 
      initials: 'SLS', 
      color: 'bg-indigo-500',
      verified: true,
      text: 'Yes! We review both new leases and renewals. Book an appointment through our website - it\'s completely free for students.', 
      time: '35 min ago',
      link: 'columbia.edu/legal-services',
      upvotes: 16,
      downvotes: 0
    },
    { 
      author: 'Emma Wilson', 
      initials: 'EW', 
      color: 'bg-purple-500', 
      text: 'I used this service last semester and they caught some really sketchy clauses in my lease. Saved me from a bad situation!', 
      time: '1h ago',
      upvotes: 12,
      downvotes: 0
    },
    { 
      author: 'David Kim', 
      initials: 'DK', 
      color: 'bg-orange-500', 
      text: 'How long does the review process take? I have a lease I need to sign by next week.', 
      time: '1.5h ago',
      upvotes: 3,
      downvotes: 0
    },
    { 
      author: 'Alex Wang', 
      initials: 'AW', 
      color: 'bg-indigo-500',
      verified: true,
      text: 'Usually 2-3 business days if you submit online. They\'re really responsive during peak apartment hunting season!', 
      time: '1.8h ago',
      upvotes: 10,
      downvotes: 0
    },
    { 
      author: 'Rachel Martinez', 
      initials: 'RM', 
      color: 'bg-pink-500', 
      text: 'This should be required reading for all students! Landlords sometimes try to slip in unfair terms hoping students won\'t notice.', 
      time: '2h ago',
      upvotes: 9,
      downvotes: 0
    }
  ],
  11: [
    // David Chen - Anyone else applying to EdTech startups? (12 comments)
    { 
      author: 'Sarah Kim', 
      initials: 'SK', 
      color: 'bg-blue-500', 
      text: 'I\'m applying to a few! The key is highlighting your education background - EdTech companies love that. Focus on your teaching/learning experience.', 
      time: '8 min ago',
      upvotes: 11,
      downvotes: 0,
      replies: [
        { author: 'David Chen', text: 'Thanks for the tip! Do you have any specific companies you\'d recommend?', time: '5 min ago' },
        { author: 'Alex Rivera', text: 'Khan Academy, Coursera, and Duolingo are great places to start. Also check out smaller startups on LinkedIn!', time: '3 min ago' }
      ]
    },
    { 
      author: 'Michael Park', 
      initials: 'MP', 
      color: 'bg-green-500', 
      text: 'Resume tip: Use action verbs like "designed", "implemented", "analyzed" instead of "worked on". Makes a huge difference!', 
      time: '20 min ago',
      upvotes: 14,
      downvotes: 0
    },
    { 
      author: 'Emma Chen', 
      initials: 'EC', 
      color: 'bg-purple-500', 
      text: 'Which companies are you targeting? I\'ve been looking at Khan Academy, Coursera, and Duolingo. Any others worth checking out?', 
      time: '35 min ago',
      upvotes: 6,
      downvotes: 0
    },
    { 
      author: 'David Chen', 
      initials: 'DC', 
      color: 'bg-orange-500',
      verified: false,
      text: 'I\'m looking at those too! Also considering Codecademy, Udemy, and some smaller startups. The startup scene in NYC is pretty active.', 
      time: '45 min ago',
      upvotes: 8,
      downvotes: 0
    },
    { 
      author: 'Lisa Wang', 
      initials: 'LW', 
      color: 'bg-pink-500', 
      text: 'For resume tailoring, I always include a "Relevant Coursework" section highlighting EdTech-related classes. Recruiters seem to like that.', 
      time: '1h ago',
      upvotes: 10,
      downvotes: 0
    },
    { 
      author: 'James Lee', 
      initials: 'JL', 
      color: 'bg-teal-500', 
      text: 'Don\'t forget to mention any projects you\'ve done! Even class projects that involve technology or education can be relevant.', 
      time: '1.3h ago',
      upvotes: 9,
      downvotes: 0
    },
    { 
      author: 'Rachel Martinez', 
      initials: 'RM', 
      color: 'bg-indigo-500', 
      text: 'I interned at an EdTech company last summer. The biggest thing they look for is understanding of both education AND technology. Show both!', 
      time: '1.8h ago',
      upvotes: 13,
      downvotes: 0
    },
    { 
      author: 'Alex Johnson', 
      initials: 'AJ', 
      color: 'bg-yellow-500', 
      text: 'LinkedIn is your friend! Connect with people at these companies and ask for informational interviews. I got my current role that way.', 
      time: '2.2h ago',
      upvotes: 12,
      downvotes: 0
    },
    { 
      author: 'Nina Patel', 
      initials: 'NP', 
      color: 'bg-red-500', 
      text: 'Make sure your portfolio (if you have one) showcases any educational projects. Even a simple learning app or website helps.', 
      time: '2.8h ago',
      upvotes: 7,
      downvotes: 0
    },
    { 
      author: 'Kevin Zhang', 
      initials: 'KZ', 
      color: 'bg-blue-600', 
      text: 'The job descriptions often mention "user-centered design" or "pedagogical knowledge" - use those exact phrases in your resume if they apply!', 
      time: '3.2h ago',
      upvotes: 9,
      downvotes: 0
    },
    { 
      author: 'Sofia Rodriguez', 
      initials: 'SR', 
      color: 'bg-green-600', 
      text: 'Career Services has a great workshop on EdTech resumes. Check their calendar - it\'s usually offered once a month.', 
      time: '3.8h ago',
      upvotes: 8,
      downvotes: 0
    },
    { 
      author: 'Tom Bradley', 
      initials: 'TB', 
      color: 'bg-purple-600', 
      text: 'Good luck! The EdTech industry is growing fast. There are definitely opportunities out there for TC students.', 
      time: '4.5h ago',
      upvotes: 6,
      downvotes: 0
    }
  ],
  12: [
    // Emily Park - OPT Application Deadlines Reminder (5 comments)
    { 
      author: 'Sarah Kim', 
      initials: 'SK', 
      color: 'bg-blue-500', 
      verified: true,
      text: 'Thanks for the reminder! This is so important. I started my application 2 months before graduation and it was still stressful.', 
      time: '15 min ago',
      link: 'tc.columbia.edu/oiss/opt-timeline',
      upvotes: 14,
      downvotes: 0
    },
    { 
      author: 'Michael Chen', 
      initials: 'MC', 
      color: 'bg-green-500', 
      text: 'Quick question - does the 90 days start from graduation date or from when you receive your diploma? I\'m confused about the timeline.', 
      time: '30 min ago',
      upvotes: 3,
      downvotes: 0
    },
    { 
      author: 'OISS', 
      initials: 'OISS', 
      color: 'bg-purple-500',
      verified: true,
      text: 'The 90-day window starts from your program completion date (usually your graduation date). Check with your advisor to confirm your exact completion date!', 
      time: '45 min ago',
      link: 'tc.columbia.edu/oiss/opt-timeline',
      upvotes: 19,
      downvotes: 0
    },
    { 
      author: 'David Park', 
      initials: 'DP', 
      color: 'bg-orange-500', 
      text: 'Pro tip: Start gathering all your documents NOW. You\'ll need transcripts, I-20, passport photos, etc. It takes longer than you think!', 
      time: '1.2h ago',
      upvotes: 11,
      downvotes: 0
    },
    { 
      author: 'Lisa Wang', 
      initials: 'LW', 
      color: 'bg-pink-500', 
      text: 'I submitted mine late and had to wait an extra month. Don\'t make my mistake - start early! The processing times can be unpredictable.', 
      time: '1.8h ago',
      upvotes: 9,
      downvotes: 0
    }
  ],
  13: [
    // Prof. Johnson - Final Exam Study Strategy Workshop (11 comments)
    { 
      author: 'Rachel Park', 
      initials: 'RP', 
      color: 'bg-blue-500', 
      text: 'This sounds perfect! I\'ve been struggling with exam prep. Do we need to register or can we just show up?', 
      time: '12 min ago',
      upvotes: 6,
      downvotes: 0,
      replies: [
        { author: 'Prof. Johnson', text: 'Registration is recommended but not required. You can sign up through the Writing Center website or just drop by!', time: '10 min ago' }
      ]
    },
    { 
      author: 'Prof. Johnson', 
      initials: 'PJ', 
      color: 'bg-blue-600',
      verified: true,
      text: 'Registration is recommended but not required. You can sign up through the Writing Center website or just drop by!', 
      time: '25 min ago',
      link: 'tc.columbia.edu/writing-center/workshops',
      upvotes: 16,
      downvotes: 0
    },
    { 
      author: 'Michael Chen', 
      initials: 'MC', 
      color: 'bg-green-500', 
      text: 'What kind of strategies do they cover? Is it general study tips or subject-specific?', 
      time: '40 min ago',
      upvotes: 4,
      downvotes: 0
    },
    { 
      author: 'Emma Wilson', 
      initials: 'EW', 
      color: 'bg-purple-500', 
      text: 'I went to this workshop last semester! They cover active recall, spaced repetition, and how to create effective study schedules. Really helpful!', 
      time: '55 min ago',
      upvotes: 13,
      downvotes: 0
    },
    { 
      author: 'David Kim', 
      initials: 'DK', 
      color: 'bg-orange-500', 
      text: 'Is this workshop good for grad students? Sometimes these are geared more toward undergrads.', 
      time: '1.2h ago',
      upvotes: 3,
      downvotes: 0
    },
    { 
      author: 'Sarah Lee', 
      initials: 'SL', 
      color: 'bg-pink-500', 
      text: 'Yes! I\'m a PhD student and found it really useful. The strategies work for any level - it\'s all about evidence-based learning techniques.', 
      time: '1.5h ago',
      upvotes: 10,
      downvotes: 0
    },
    { 
      author: 'James Park', 
      initials: 'JP', 
      color: 'bg-teal-500', 
      text: 'Do they provide handouts or materials we can take home? I\'d love to reference them later.', 
      time: '2h ago',
      upvotes: 5,
      downvotes: 0
    },
    { 
      author: 'Lisa Martinez', 
      initials: 'LM', 
      color: 'bg-indigo-500', 
      text: 'Yes! They give you a study guide packet with all the techniques. Super helpful to keep for future semesters.', 
      time: '2.3h ago',
      upvotes: 8,
      downvotes: 0
    },
    { 
      author: 'Alex Johnson', 
      initials: 'AJ', 
      color: 'bg-yellow-500', 
      text: 'Can we attend if we\'re not TC students? I have a friend at Columbia who might be interested.', 
      time: '2.8h ago',
      upvotes: 2,
      downvotes: 0
    },
    { 
      author: 'Nina Patel', 
      initials: 'NP', 
      color: 'bg-red-500', 
      text: 'The workshop is open to all TC students. For Columbia students, they might need to check with their own writing center.', 
      time: '3h ago',
      upvotes: 6,
      downvotes: 0
    },
    { 
      author: 'Kevin Zhang', 
      initials: 'KZ', 
      color: 'bg-blue-600', 
      text: 'Thanks for sharing! I\'ve been looking for study strategies that actually work. Looking forward to this!', 
      time: '3.5h ago',
      upvotes: 7,
      downvotes: 0
    }
  ],
  14: [
    // Rachel Park - Best courses for Spring semester? (18 comments)
    { 
      author: 'Michael Chen', 
      initials: 'MC', 
      color: 'bg-blue-500', 
      text: 'I took "Learning Analytics" last spring and it was amazing! Perfect for your interests. Prof. Smith is fantastic.', 
      time: '10 min ago',
      upvotes: 15,
      downvotes: 0,
      replies: [
        { author: 'Rachel Park', text: 'Thanks! What was the workload like? I\'m worried about balancing it with other courses.', time: '7 min ago' },
        { author: 'Alex Rivera', text: 'It\'s moderate - weekly readings and a final project. Totally manageable if you stay on top of the readings!', time: '5 min ago' }
      ]
    },
    { 
      author: 'Emma Wilson', 
      initials: 'EW', 
      color: 'bg-green-500', 
      text: 'Seconding Learning Analytics! Also check out "Data Science in Education" - it\'s a great complement.', 
      time: '18 min ago',
      upvotes: 12,
      downvotes: 0
    },
    { 
      author: 'David Park', 
      initials: 'DP', 
      color: 'bg-purple-500', 
      text: 'What about "Educational Data Mining"? I heard it\'s more technical but really valuable if you want to go into research.', 
      time: '30 min ago',
      upvotes: 8,
      downvotes: 0
    },
    { 
      author: 'Sarah Lee', 
      initials: 'SL', 
      color: 'bg-pink-500', 
      text: 'I\'m also interested in learning analytics! Are there any prerequisites we should know about?', 
      time: '45 min ago',
      upvotes: 4,
      downvotes: 0
    },
    { 
      author: 'Rachel Park', 
      initials: 'RP', 
      color: 'bg-purple-500',
      verified: false,
      text: 'Good question! I think basic stats is recommended but not required. I\'m planning to take it regardless.', 
      time: '55 min ago',
      upvotes: 6,
      downvotes: 0
    },
    { 
      author: 'James Kim', 
      initials: 'JK', 
      color: 'bg-orange-500', 
      text: 'Don\'t forget "Designing Learning Environments" - it covers how to create tech-enhanced learning experiences. Super relevant!', 
      time: '1.2h ago',
      upvotes: 9,
      downvotes: 0
    },
    { 
      author: 'Lisa Wang', 
      initials: 'LW', 
      color: 'bg-teal-500', 
      text: 'I took "Machine Learning for Education" last semester. It was challenging but really opened my eyes to what\'s possible in EdTech.', 
      time: '1.5h ago',
      upvotes: 11,
      downvotes: 0
    },
    { 
      author: 'Alex Johnson', 
      initials: 'AJ', 
      color: 'bg-indigo-500', 
      text: 'Has anyone taken "Educational Assessment and Evaluation"? I\'m wondering if it\'s relevant for data science work.', 
      time: '2h ago',
      upvotes: 3,
      downvotes: 0
    },
    { 
      author: 'Nina Patel', 
      initials: 'NP', 
      color: 'bg-yellow-500', 
      text: 'Yes! Assessment is crucial for learning analytics. Understanding how to measure learning outcomes is key.', 
      time: '2.3h ago',
      upvotes: 7,
      downvotes: 0
    },
    { 
      author: 'Kevin Zhang', 
      initials: 'KZ', 
      color: 'bg-red-500', 
      text: 'What about "Research Methods in Education"? Is that useful for someone interested in data science?', 
      time: '2.8h ago',
      upvotes: 4,
      downvotes: 0
    },
    { 
      author: 'Sofia Rodriguez', 
      initials: 'SR', 
      color: 'bg-blue-600', 
      text: 'Research Methods is a must! It teaches you how to design studies and analyze data properly. Very relevant for learning analytics.', 
      time: '3.2h ago',
      upvotes: 10,
      downvotes: 0
    },
    { 
      author: 'Tom Bradley', 
      initials: 'TB', 
      color: 'bg-green-600', 
      text: 'I\'d recommend checking the course catalog for "Educational Technology" courses. There are usually 2-3 offered each semester.', 
      time: '3.8h ago',
      upvotes: 5,
      downvotes: 0
    },
    { 
      author: 'Maria Santos', 
      initials: 'MS', 
      color: 'bg-purple-600', 
      text: 'Don\'t forget about cross-listed courses! Some CS courses at Columbia can count toward your degree if you get approval.', 
      time: '4.2h ago',
      upvotes: 6,
      downvotes: 0
    },
    { 
      author: 'Ahmed Hassan', 
      initials: 'AH', 
      color: 'bg-pink-600', 
      text: 'Has anyone taken "Human-Computer Interaction"? I heard it\'s great for understanding how people interact with EdTech tools.', 
      time: '4.8h ago',
      upvotes: 4,
      downvotes: 0
    },
    { 
      author: 'David Kim', 
      initials: 'DK', 
      color: 'bg-orange-600', 
      text: 'HCI is excellent! It\'s more design-focused but really helps you think about user experience in educational contexts.', 
      time: '5.2h ago',
      upvotes: 7,
      downvotes: 0
    },
    { 
      author: 'Rachel Martinez', 
      initials: 'RM', 
      color: 'bg-teal-600', 
      text: 'Thanks for all the suggestions! This is super helpful. I\'m going to look into Learning Analytics and Data Science in Education.', 
      time: '5.8h ago',
      upvotes: 5,
      downvotes: 0
    },
    { 
      author: 'Emma Chen', 
      initials: 'EC', 
      color: 'bg-indigo-600', 
      text: 'One more - "Educational Policy and Data" is great if you\'re interested in how data informs policy decisions. Very relevant field!', 
      time: '6h ago',
      upvotes: 6,
      downvotes: 0
    },
    { 
      author: 'James Park', 
      initials: 'JP', 
      color: 'bg-yellow-600', 
      text: 'This thread is gold! Saving all these recommendations. Thanks everyone for sharing your experiences!', 
      time: '6.5h ago',
      upvotes: 8,
      downvotes: 0
    }
  ],
  15: [
    // TC Library - Extended Hours During Finals Week (4 comments)
    { 
      author: 'Sarah Kim', 
      initials: 'SK', 
      color: 'bg-blue-500', 
      text: 'This is a lifesaver! The 24/7 hours during finals are so helpful. Do we need to reserve study rooms in advance?', 
      time: '8 min ago',
      upvotes: 11,
      downvotes: 0
    },
    { 
      author: 'TC Library', 
      initials: 'TL', 
      color: 'bg-teal-600',
      verified: true,
      text: 'Yes! Study room reservations open 3 days in advance. Book through our website - they fill up fast during finals week!', 
      time: '20 min ago',
      link: 'library.tc.columbia.edu/hours',
      upvotes: 19,
      downvotes: 0
    },
    { 
      author: 'Michael Chen', 
      initials: 'MC', 
      color: 'bg-green-500', 
      text: 'Are the quiet study rooms on the 3rd floor included? Those are my favorite spots for focused studying.', 
      time: '35 min ago',
      upvotes: 5,
      downvotes: 0
    },
    { 
      author: 'David Park', 
      initials: 'DP', 
      color: 'bg-purple-500', 
      text: 'Thanks for the extended hours! The library staff is amazing for doing this every semester. Really appreciate it!', 
      time: '1h ago',
      upvotes: 14,
      downvotes: 0
    }
  ],
  16: [
    // CPS Wellness - Free Mental Health Screening Week (8 comments)
    { 
      author: 'Sarah Lee', 
      initials: 'SL', 
      color: 'bg-blue-500', 
      text: 'This is so important! Mental health check-ins should be normalized. Do we need to bring anything?', 
      time: '10 min ago',
      upvotes: 13,
      downvotes: 0
    },
    { 
      author: 'CPS Wellness', 
      initials: 'CPS', 
      color: 'bg-teal-600',
      verified: true,
      text: 'No need to bring anything! Just drop by during our hours. The screening is confidential and takes about 15-20 minutes.', 
      time: '25 min ago',
      link: 'health.columbia.edu/cps',
      upvotes: 20,
      downvotes: 0
    },
    { 
      author: 'Michael Park', 
      initials: 'MP', 
      color: 'bg-green-500', 
      text: 'Is this only for students with existing mental health concerns, or can anyone participate?', 
      time: '40 min ago',
      upvotes: 4,
      downvotes: 0
    },
    { 
      author: 'Emma Chen', 
      initials: 'EC', 
      color: 'bg-purple-500', 
      text: 'Anyone can participate! It\'s a great way to check in on your mental wellness, even if you\'re feeling okay. Prevention is key!', 
      time: '55 min ago',
      upvotes: 11,
      downvotes: 0
    },
    { 
      author: 'David Kim', 
      initials: 'DK', 
      color: 'bg-orange-500', 
      text: 'I went last year and it was really helpful. The counselors are very supportive and non-judgmental.', 
      time: '1.2h ago',
      upvotes: 9,
      downvotes: 0
    },
    { 
      author: 'Lisa Wang', 
      initials: 'LW', 
      color: 'bg-pink-500', 
      text: 'What happens after the screening? Do they provide recommendations or referrals?', 
      time: '1.5h ago',
      upvotes: 3,
      downvotes: 0
    },
    { 
      author: 'James Park', 
      initials: 'JP', 
      color: 'bg-teal-500', 
      text: 'Yes! They can connect you with ongoing counseling services if needed, or just provide resources. It\'s all based on what you need.', 
      time: '2h ago',
      upvotes: 7,
      downvotes: 0
    },
    { 
      author: 'Rachel Martinez', 
      initials: 'RM', 
      color: 'bg-indigo-500', 
      text: 'Thanks for organizing this! Mental health awareness is so important, especially during stressful times like finals.', 
      time: '2.5h ago',
      upvotes: 10,
      downvotes: 0
    }
  ],
  17: [
    // Dr. Martinez - Flu Shots Available at Health Services (6 comments)
    { 
      author: 'Sarah Kim', 
      initials: 'SK', 
      color: 'bg-blue-500', 
      text: 'Perfect timing! I\'ve been meaning to get my flu shot. Do we need to make an appointment or can we just walk in?', 
      time: '12 min ago',
      upvotes: 8,
      downvotes: 0
    },
    { 
      author: 'Dr. Martinez', 
      initials: 'DM', 
      color: 'bg-blue-600',
      verified: true,
      text: 'Walk-ins are welcome! Just come by Monday-Friday between 9am-4pm. The process is quick - usually takes about 10 minutes.', 
      time: '28 min ago',
      link: 'health.columbia.edu/flu-clinic',
      upvotes: 17,
      downvotes: 0
    },
    { 
      author: 'Michael Chen', 
      initials: 'MC', 
      color: 'bg-green-500', 
      text: 'Is this covered by student health insurance?', 
      time: '45 min ago',
      upvotes: 3,
      downvotes: 0
    },
    { 
      author: 'Emma Wilson', 
      initials: 'EW', 
      color: 'bg-purple-500', 
      text: 'Yes! Flu shots are free for all students, regardless of insurance. It\'s part of the university\'s health services.', 
      time: '1h ago',
      upvotes: 10,
      downvotes: 0
    },
    { 
      author: 'David Park', 
      initials: 'DP', 
      color: 'bg-orange-500', 
      text: 'I got mine last week! Super easy process and the staff is really friendly. Highly recommend getting it done before flu season hits.', 
      time: '1.5h ago',
      upvotes: 12,
      downvotes: 0
    },
    { 
      author: 'Lisa Wang', 
      initials: 'LW', 
      color: 'bg-pink-500', 
      text: 'Thanks for the reminder! I always forget to get my flu shot. Will definitely stop by this week.', 
      time: '2h ago',
      upvotes: 6,
      downvotes: 0
    }
  ],
  18: [
    // Anonymous - Stress management tips? (24 comments)
    { 
      author: 'Sarah Lee', 
      initials: 'SL', 
      color: 'bg-blue-500', 
      text: 'I totally feel you! Finals are so overwhelming. I\'ve been using the Pomodoro technique - 25 min study, 5 min break. It really helps!', 
      time: '8 min ago',
      upvotes: 18,
      downvotes: 0,
      replies: [
        { author: 'Anonymous', text: 'Thanks! I\'ll try this. Do you use any specific app for timing?', time: '5 min ago' },
        { author: 'Sarah Lee', text: 'I use Forest app - it\'s great! Also helps you stay off your phone during study time.', time: '3 min ago' }
      ]
    },
    { 
      author: 'Michael Park', 
      initials: 'MP', 
      color: 'bg-green-500', 
      text: 'Exercise has been a game changer for me. Even just a 20-minute walk helps clear my mind and reduce anxiety.', 
      time: '15 min ago',
      upvotes: 16,
      downvotes: 0
    },
    { 
      author: 'Emma Chen', 
      initials: 'EC', 
      color: 'bg-purple-500', 
      text: 'Meditation apps like Headspace or Calm are great! I do 10 minutes in the morning and it sets a better tone for the day.', 
      time: '22 min ago',
      upvotes: 14,
      downvotes: 0
    },
    { 
      author: 'David Kim', 
      initials: 'DK', 
      color: 'bg-orange-500', 
      text: 'Don\'t forget to sleep! I know it\'s tempting to pull all-nighters, but getting 7-8 hours actually makes you more productive.', 
      time: '30 min ago',
      upvotes: 20,
      downvotes: 0,
      replies: [
        { author: 'Anonymous', text: 'This is so true! I used to pull all-nighters but my grades actually improved when I started prioritizing sleep.', time: '25 min ago' }
      ]
    },
    { 
      author: 'Lisa Wang', 
      initials: 'LW', 
      color: 'bg-pink-500', 
      text: 'I break down big tasks into smaller chunks. Makes everything feel more manageable and less overwhelming.', 
      time: '38 min ago',
      upvotes: 15,
      downvotes: 0
    },
    { 
      author: 'James Park', 
      initials: 'JP', 
      color: 'bg-teal-500', 
      text: 'Talking to friends helps! Sometimes just venting about stress makes it feel lighter. You\'re not alone in this!', 
      time: '45 min ago',
      upvotes: 17,
      downvotes: 0
    },
    { 
      author: 'Rachel Martinez', 
      initials: 'RM', 
      color: 'bg-indigo-500', 
      text: 'I schedule "worry time" - 15 minutes a day where I let myself stress about everything, then I move on. Sounds weird but it works!', 
      time: '52 min ago',
      upvotes: 9,
      downvotes: 0
    },
    { 
      author: 'Alex Johnson', 
      initials: 'AJ', 
      color: 'bg-yellow-500', 
      text: 'Deep breathing exercises! 4-7-8 breathing (inhale 4, hold 7, exhale 8) really helps when I\'m feeling panicked.', 
      time: '1h ago',
      upvotes: 12,
      downvotes: 0
    },
    { 
      author: 'Nina Patel', 
      initials: 'NP', 
      color: 'bg-red-500', 
      text: 'I keep a gratitude journal. Writing down 3 things I\'m grateful for each day helps shift my mindset from stress to appreciation.', 
      time: '1.2h ago',
      upvotes: 11,
      downvotes: 0
    },
    { 
      author: 'Kevin Zhang', 
      initials: 'KZ', 
      color: 'bg-blue-600', 
      text: 'Music! I have different playlists for studying vs. relaxing. Classical music while studying, nature sounds for breaks.', 
      time: '1.5h ago',
      upvotes: 10,
      downvotes: 0
    },
    { 
      author: 'Sofia Rodriguez', 
      initials: 'SR', 
      color: 'bg-green-600', 
      text: 'Setting boundaries is key. I turn off notifications during study time and only check messages during designated breaks.', 
      time: '1.8h ago',
      upvotes: 13,
      downvotes: 0
    },
    { 
      author: 'Tom Bradley', 
      initials: 'TB', 
      color: 'bg-purple-600', 
      text: 'Remember it\'s okay to say no! You don\'t have to attend every event or help with every project. Protect your energy.', 
      time: '2h ago',
      upvotes: 14,
      downvotes: 0
    },
    { 
      author: 'Maria Santos', 
      initials: 'MS', 
      color: 'bg-pink-600', 
      text: 'I use a planner to organize everything. Seeing all my tasks written down makes them feel less chaotic and more manageable.', 
      time: '2.3h ago',
      upvotes: 8,
      downvotes: 0
    },
    { 
      author: 'Ahmed Hassan', 
      initials: 'AH', 
      color: 'bg-teal-600', 
      text: 'CPS counseling services are available! Don\'t hesitate to reach out if stress is really impacting your daily life.', 
      time: '2.6h ago',
      upvotes: 12,
      downvotes: 0
    },
    { 
      author: 'David Lee', 
      initials: 'DL', 
      color: 'bg-indigo-600', 
      text: 'I do a "brain dump" before bed - write down everything on my mind so I can sleep without worrying about forgetting things.', 
      time: '3h ago',
      upvotes: 9,
      downvotes: 0
    },
    { 
      author: 'Jessica Brown', 
      initials: 'JB', 
      color: 'bg-yellow-600', 
      text: 'Yoga or stretching! Even 10 minutes helps release physical tension that builds up from stress.', 
      time: '3.3h ago',
      upvotes: 7,
      downvotes: 0
    },
    { 
      author: 'Ryan Kim', 
      initials: 'RK', 
      color: 'bg-red-600', 
      text: 'I remind myself that this is temporary. Finals will end, and I\'ve gotten through stressful times before. You\'ve got this!', 
      time: '3.6h ago',
      upvotes: 19,
      downvotes: 0
    },
    { 
      author: 'Olivia Chen', 
      initials: 'OC', 
      color: 'bg-blue-500', 
      text: 'Social media breaks! I delete apps during finals week to avoid comparison and FOMO. It\'s so freeing!', 
      time: '4h ago',
      upvotes: 11,
      downvotes: 0
    },
    { 
      author: 'Daniel Park', 
      initials: 'DP', 
      color: 'bg-green-500', 
      text: 'I reward myself after study sessions - a favorite snack, episode of a show, or quick call with a friend. Small rewards help!', 
      time: '4.5h ago',
      upvotes: 10,
      downvotes: 0
    },
    { 
      author: 'Sophia Lee', 
      initials: 'SL', 
      color: 'bg-purple-500', 
      text: 'Remember to eat regular meals! Skipping meals makes stress worse. Your brain needs fuel to function properly.', 
      time: '5h ago',
      upvotes: 13,
      downvotes: 0
    },
    { 
      author: 'Chris Martinez', 
      initials: 'CM', 
      color: 'bg-pink-500', 
      text: 'I use the "two-minute rule" - if something takes less than 2 minutes, I do it immediately. Reduces mental clutter!', 
      time: '5.5h ago',
      upvotes: 8,
      downvotes: 0
    },
    { 
      author: 'Amy Wilson', 
      initials: 'AW', 
      color: 'bg-teal-500', 
      text: 'Nature helps! Even just looking at plants or going outside for fresh air can reset your nervous system.', 
      time: '6h ago',
      upvotes: 9,
      downvotes: 0
    },
    { 
      author: 'Mark Thompson', 
      initials: 'MT', 
      color: 'bg-indigo-500', 
      text: 'I practice self-compassion. When I make mistakes or feel overwhelmed, I talk to myself like I would talk to a friend.', 
      time: '6.5h ago',
      upvotes: 15,
      downvotes: 0
    },
    { 
      author: 'Anonymous', 
      initials: '??', 
      color: 'bg-gray-400',
      verified: false,
      text: 'Thank you all so much for these tips! It\'s really helpful to know I\'m not alone and that there are so many strategies to try. Appreciate the support!', 
      time: '7h ago',
      upvotes: 22,
      downvotes: 0
    }
  ],
  19: [
    // Career - FAKE JOB ALERT: "Easy OPT sponsorship" scam (12 comments)
    { 
      author: 'Sarah Kim', 
      initials: 'SK', 
      color: 'bg-green-500',
      verified: true,
      text: '⚠️ This is a SCAM! Legitimate OPT sponsorship cannot be purchased. OISS has warned about these fake job offers. Report this to Career Services immediately.', 
      time: '5 min ago',
      link: 'tc.columbia.edu/oiss/scam-alerts',
      upvotes: 38,
      downvotes: 1,
      replies: [
        { author: 'Anonymous', text: 'Actually I know someone who got OPT through this. You\'re just being paranoid.', time: '3 min ago' },
        { author: 'Sarah Kim', text: 'No, this is definitely a scam. OISS has confirmed this pattern multiple times. Please don\'t spread misinformation.', time: '2 min ago' }
      ]
    },
    { 
      author: 'David Park', 
      initials: 'DP', 
      color: 'bg-blue-500', 
      text: 'This is definitely a scam. No legitimate company would charge for OPT sponsorship. Please delete this post and report it.', 
      time: '12 min ago',
      upvotes: 28,
      downvotes: 0,
      replies: [
        { author: 'Anonymous', text: 'You don\'t know what you\'re talking about. I paid and got my OPT approved.', time: '10 min ago' },
        { author: 'David Park', text: 'That\'s impossible. OPT sponsorship cannot be purchased. You may have been scammed or you\'re spreading false information.', time: '8 min ago' },
        { author: 'Anonymous', text: 'Whatever, I got what I needed. Stop trying to scare people.', time: '5 min ago' }
      ]
    },
    { 
      author: 'Emily Chen', 
      initials: 'EC', 
      color: 'bg-purple-500', 
      text: 'I got a similar email last month. It\'s a phishing scam trying to steal money and personal information. DO NOT respond or send any money!', 
      time: '18 min ago',
      upvotes: 24,
      downvotes: 0,
      replies: [
        { author: 'Anonymous', text: 'How do you know it\'s a scam? Maybe you just didn\'t qualify.', time: '15 min ago' },
        { author: 'Emily Chen', text: 'Because legitimate companies don\'t charge $500 for OPT sponsorship. That\'s not how the immigration system works.', time: '12 min ago' }
      ]
    },
    { 
      author: 'Michael Lee', 
      initials: 'ML', 
      color: 'bg-orange-500',
      verified: true,
      text: 'OISS has a list of known scams on their website. This matches the pattern. Always verify job offers through official channels.', 
      time: '25 min ago',
      link: 'tc.columbia.edu/oiss/scam-alerts',
      upvotes: 31,
      downvotes: 0
    },
    { 
      author: 'Lisa Wang', 
      initials: 'LW', 
      color: 'bg-pink-500', 
      text: 'If it sounds too good to be true, it probably is. Real OPT sponsorship requires a legitimate job offer and proper documentation.', 
      time: '35 min ago',
      upvotes: 19,
      downvotes: 0
    },
    { 
      author: 'James Park', 
      initials: 'JP', 
      color: 'bg-teal-500', 
      text: 'Please report this to OISS. They track these scams and can help protect other students from falling victim.', 
      time: '42 min ago',
      upvotes: 16,
      downvotes: 0
    },
    { 
      author: 'Rachel Martinez', 
      initials: 'RM', 
      color: 'bg-indigo-500', 
      text: 'Never pay for OPT sponsorship. That\'s not how it works. This is 100% a scam.', 
      time: '50 min ago',
      upvotes: 22,
      downvotes: 0
    },
    { 
      author: 'Alex Johnson', 
      initials: 'AJ', 
      color: 'bg-yellow-500', 
      text: 'I almost fell for something similar. They asked for my SSN and bank details. Please be careful everyone!', 
      time: '1h ago',
      upvotes: 15,
      downvotes: 0,
      replies: [
        { author: 'Sarah Kim', text: 'Thank you for sharing! This helps protect others. Always verify through OISS before sharing personal information.', time: '55 min ago' }
      ]
    },
    { 
      author: 'Nina Patel', 
      initials: 'NP', 
      color: 'bg-red-500', 
      text: 'This post should be removed. It\'s spreading dangerous misinformation that could cost students money and their immigration status.', 
      time: '1.2h ago',
      upvotes: 20,
      downvotes: 0
    },
    { 
      author: 'Kevin Zhang', 
      initials: 'KZ', 
      color: 'bg-blue-600', 
      text: 'Reported. This is clearly a scam. Mods should take this down immediately.', 
      time: '1.5h ago',
      upvotes: 18,
      downvotes: 0
    },
    { 
      author: 'Sofia Rodriguez', 
      initials: 'SR', 
      color: 'bg-green-600', 
      text: 'Always verify job offers through official TC Career Services or OISS. Never trust unsolicited emails offering "easy" solutions.', 
      time: '2h ago',
      upvotes: 14,
      downvotes: 0
    },
    { 
      author: 'Tom Bradley', 
      initials: 'TB', 
      color: 'bg-purple-600', 
      text: 'If you received a similar email, forward it to OISS at oiss@tc.columbia.edu. They can help verify if it\'s legitimate.', 
      time: '2.5h ago',
      upvotes: 12,
      downvotes: 0
    }
  ],
  20: [
    // Housing - URGENT: Morningside Heights is unsafe! (18 comments)
    { 
      author: 'TC Public Safety', 
      initials: 'PS', 
      color: 'bg-red-500',
      verified: true,
      text: '⚠️ This information is FALSE. Our latest crime statistics show no such increase. Morningside Heights remains one of the safest neighborhoods in Manhattan. Please check official sources.', 
      time: '8 min ago',
      link: 'columbia.edu/publicsafety/statistics',
      upvotes: 42,
      downvotes: 0,
      replies: [
        { author: 'Anonymous', text: 'My friend DID get robbed though. Just because stats don\'t show it doesn\'t mean it didn\'t happen.', time: '5 min ago' },
        { author: 'TC Public Safety', text: 'We take all incidents seriously. If your friend was robbed, please report it to us immediately so we can investigate and update our records.', time: '3 min ago' }
      ]
    },
    { 
      author: 'Maria Lopez', 
      initials: 'ML', 
      color: 'bg-purple-500', 
      text: 'This is spreading fear unnecessarily. I\'ve lived here for 2 years and feel completely safe. The crime stats don\'t support this claim.', 
      time: '15 min ago',
      upvotes: 25,
      downvotes: 0,
      replies: [
        { author: 'Anonymous', text: 'Just because YOU feel safe doesn\'t mean everyone does. My friend was actually robbed!', time: '12 min ago' },
        { author: 'Maria Lopez', text: 'I understand your concern, but individual incidents don\'t mean crime is up 300%. We need to rely on official statistics, not rumors.', time: '10 min ago' }
      ]
    },
    { 
      author: 'Alex Wang', 
      initials: 'AW', 
      color: 'bg-indigo-500',
      verified: true,
      text: 'Public Safety publishes monthly reports. There has been no 300% increase. This is misinformation that could cause unnecessary panic.', 
      time: '22 min ago',
      link: 'columbia.edu/publicsafety/reports',
      upvotes: 35,
      downvotes: 0
    },
    { 
      author: 'David Park', 
      initials: 'DP', 
      color: 'bg-blue-500', 
      text: 'I walk around campus late at night regularly and have never felt unsafe. This seems like fear-mongering without evidence.', 
      time: '30 min ago',
      upvotes: 18,
      downvotes: 0,
      replies: [
        { author: 'Anonymous', text: 'You\'re being naive. Just because nothing happened to YOU doesn\'t mean it\'s safe.', time: '25 min ago' },
        { author: 'David Park', text: 'I\'m not being naive - I\'m using actual data. Public Safety publishes crime statistics monthly. Show me evidence of a 300% increase.', time: '22 min ago' }
      ]
    },
    { 
      author: 'Sarah Kim', 
      initials: 'SK', 
      color: 'bg-green-500', 
      text: 'Please provide a source for this claim. Public Safety statistics are publicly available and show the opposite.', 
      time: '38 min ago',
      upvotes: 14,
      downvotes: 0
    },
    { 
      author: 'Emily Chen', 
      initials: 'EC', 
      color: 'bg-purple-500', 
      text: 'This is dangerous misinformation. Spreading false safety alerts can cause unnecessary anxiety and panic among students.', 
      time: '45 min ago',
      upvotes: 21,
      downvotes: 0
    },
    { 
      author: 'Michael Lee', 
      initials: 'ML', 
      color: 'bg-orange-500', 
      text: 'I\'ve been here 3 years and crime has actually decreased. Please check official Public Safety reports before posting alarming claims.', 
      time: '52 min ago',
      upvotes: 16,
      downvotes: 0
    },
    { 
      author: 'Lisa Wang', 
      initials: 'LW', 
      color: 'bg-pink-500', 
      text: 'Reported. This post lacks any credible source and could harm the community by spreading false information.', 
      time: '1h ago',
      upvotes: 19,
      downvotes: 0
    },
    { 
      author: 'James Park', 
      initials: 'JP', 
      color: 'bg-teal-500', 
      text: 'If you have safety concerns, contact Public Safety directly. They have accurate, verified information.', 
      time: '1.2h ago',
      upvotes: 12,
      downvotes: 0
    },
    { 
      author: 'Rachel Martinez', 
      initials: 'RM', 
      color: 'bg-indigo-500', 
      text: 'This is exactly the kind of misinformation this app is designed to combat. Please verify before posting alarming claims.', 
      time: '1.5h ago',
      upvotes: 17,
      downvotes: 0
    },
    { 
      author: 'Alex Johnson', 
      initials: 'AJ', 
      color: 'bg-yellow-500', 
      text: 'I live in Morningside Heights and feel completely safe. This post is spreading false information without any evidence.', 
      time: '1.8h ago',
      upvotes: 13,
      downvotes: 0
    },
    { 
      author: 'Nina Patel', 
      initials: 'NP', 
      color: 'bg-red-500', 
      text: 'Please remove this. It\'s causing unnecessary fear and the statistics don\'t support this claim at all.', 
      time: '2h ago',
      upvotes: 15,
      downvotes: 0
    },
    { 
      author: 'Kevin Zhang', 
      initials: 'KZ', 
      color: 'bg-blue-600', 
      text: 'Public Safety has official crime statistics available. This claim contradicts all official data. Reported for misinformation.', 
      time: '2.3h ago',
      upvotes: 20,
      downvotes: 0
    },
    { 
      author: 'Sofia Rodriguez', 
      initials: 'SR', 
      color: 'bg-green-600', 
      text: 'If you have a legitimate safety concern, report it to Public Safety. Spreading unverified rumors helps no one.', 
      time: '2.6h ago',
      upvotes: 11,
      downvotes: 0
    },
    { 
      author: 'Tom Bradley', 
      initials: 'TB', 
      color: 'bg-purple-600', 
      text: 'This is fear-mongering. Morningside Heights is statistically one of the safest areas in NYC. Please verify claims before posting.', 
      time: '3h ago',
      upvotes: 14,
      downvotes: 0
    },
    { 
      author: 'Maria Santos', 
      initials: 'MS', 
      color: 'bg-pink-600', 
      text: 'I\'ve been a student here for 4 years. This neighborhood is very safe. Please don\'t spread false information.', 
      time: '3.5h ago',
      upvotes: 12,
      downvotes: 0
    },
    { 
      author: 'Ahmed Hassan', 
      initials: 'AH', 
      color: 'bg-teal-600', 
      text: 'Reported. This post contains unverified claims that could cause panic. Always check official sources before posting safety alerts.', 
      time: '4h ago',
      upvotes: 16,
      downvotes: 0
    },
    { 
      author: 'David Lee', 
      initials: 'DL', 
      color: 'bg-indigo-600', 
      text: 'Public Safety publishes monthly crime reports. There\'s no evidence of any 300% increase. This is misinformation.', 
      time: '4.5h ago',
      upvotes: 13,
      downvotes: 0
    }
  ],
  21: [
    // Academic - Professors selling exam answers on WhatsApp (9 comments)
    { 
      author: 'Prof. Johnson', 
      initials: 'PJ', 
      color: 'bg-blue-600',
      verified: true,
      text: '⚠️ This is FALSE and a violation of academic integrity. No TC professors would engage in such activity. This appears to be a scam targeting students.', 
      time: '6 min ago',
      link: 'tc.columbia.edu/academic-integrity',
      upvotes: 41,
      downvotes: 0
    },
    { 
      author: 'Rachel Park', 
      initials: 'RP', 
      color: 'bg-purple-500', 
      text: 'This is clearly a scam. Professors don\'t sell exam answers. This is likely someone trying to steal money or personal information.', 
      time: '12 min ago',
      upvotes: 27,
      downvotes: 0,
      replies: [
        { author: 'Anonymous', text: 'How do you know? Maybe some professors do this. You can\'t speak for everyone.', time: '9 min ago' },
        { author: 'Rachel Park', text: 'Because it\'s illegal and would result in immediate termination. No legitimate professor would risk their career for $200.', time: '7 min ago' },
        { author: 'Anonymous', text: 'You\'re just trying to keep the answers for yourself. Stop gatekeeping!', time: '4 min ago' }
      ]
    },
    { 
      author: 'David Chen', 
      initials: 'DC', 
      color: 'bg-orange-500', 
      text: 'Reported. This is academic fraud and could get students expelled. Please delete this post immediately.', 
      time: '18 min ago',
      upvotes: 23,
      downvotes: 0
    },
    { 
      author: 'Sarah Kim', 
      initials: 'SK', 
      color: 'bg-green-500', 
      text: 'This is a scam. Anyone selling "exam answers" is trying to cheat you out of money. Real professors would never do this.', 
      time: '25 min ago',
      upvotes: 19,
      downvotes: 0,
      replies: [
        { author: 'Michael Lee', text: 'Exactly. Even if this were real, buying exam answers is academic dishonesty and could get you expelled.', time: '20 min ago' }
      ]
    },
    { 
      author: 'Michael Lee', 
      initials: 'ML', 
      color: 'bg-orange-500', 
      text: 'Even if this were real (which it\'s not), buying exam answers is academic dishonesty and could result in expulsion. Don\'t do it!', 
      time: '32 min ago',
      upvotes: 25,
      downvotes: 0
    },
    { 
      author: 'Lisa Wang', 
      initials: 'LW', 
      color: 'bg-pink-500', 
      text: 'This is definitely a scam. They\'ll take your money and give you fake answers, or worse, steal your personal information.', 
      time: '40 min ago',
      upvotes: 18,
      downvotes: 0
    },
    { 
      author: 'James Park', 
      initials: 'JP', 
      color: 'bg-teal-500', 
      text: 'Report this to the Academic Integrity Office. This is serious academic fraud and needs to be investigated.', 
      time: '48 min ago',
      upvotes: 21,
      downvotes: 0
    },
    { 
      author: 'Rachel Martinez', 
      initials: 'RM', 
      color: 'bg-indigo-500', 
      text: 'This post should be removed. It\'s promoting academic dishonesty and is likely a scam targeting vulnerable students.', 
      time: '55 min ago',
      upvotes: 20,
      downvotes: 0
    },
    { 
      author: 'Alex Johnson', 
      initials: 'AJ', 
      color: 'bg-yellow-500', 
      text: 'If you\'re struggling with exams, use legitimate resources like the Writing Center or office hours. Don\'t fall for scams like this.', 
      time: '1h ago',
      upvotes: 16,
      downvotes: 0
    }
  ],
  22: [
    // Health - CPS therapy sessions are being recorded (7 comments)
    { 
      author: 'CPS Wellness', 
      initials: 'CPS', 
      color: 'bg-teal-600',
      verified: true,
      text: '⚠️ This is COMPLETELY FALSE. CPS maintains strict confidentiality. All sessions are private and protected by HIPAA. We never record sessions or share information with administration.', 
      time: '10 min ago',
      link: 'health.columbia.edu/cps/confidentiality',
      upvotes: 44,
      downvotes: 0
    },
    { 
      author: 'Dr. Martinez', 
      initials: 'DM', 
      color: 'bg-blue-600',
      verified: true,
      text: 'This is dangerous misinformation. CPS counseling is completely confidential. Spreading false information about mental health services could prevent students from seeking help.', 
      time: '18 min ago',
      link: 'health.columbia.edu/cps/privacy',
      upvotes: 37,
      downvotes: 0
    },
    { 
      author: 'Sarah Lee', 
      initials: 'SL', 
      color: 'bg-blue-500', 
      text: 'This is completely false. I\'ve used CPS services and they are extremely professional about confidentiality. This rumor could prevent people from getting help.', 
      time: '25 min ago',
      upvotes: 26,
      downvotes: 0,
      replies: [
        { author: 'Anonymous', text: 'My friend told me they saw a recording device. You can\'t prove it\'s not true.', time: '20 min ago' },
        { author: 'Sarah Lee', text: 'I understand you\'re concerned, but CPS is bound by HIPAA. Recording sessions would be illegal. Please don\'t spread unverified rumors that could prevent students from seeking mental health support.', time: '17 min ago' },
        { author: 'Anonymous', text: 'I\'m just warning people. Better safe than sorry.', time: '14 min ago' }
      ]
    },
    { 
      author: 'Michael Park', 
      initials: 'MP', 
      color: 'bg-green-500', 
      text: 'CPS is bound by HIPAA privacy laws. They cannot and do not record sessions. This is harmful misinformation that could discourage students from seeking mental health support.', 
      time: '32 min ago',
      upvotes: 29,
      downvotes: 0
    },
    { 
      author: 'Emma Chen', 
      initials: 'EC', 
      color: 'bg-purple-500', 
      text: 'Reported. Spreading false information about mental health services is dangerous. CPS provides confidential, professional care.', 
      time: '40 min ago',
      upvotes: 22,
      downvotes: 0
    },
    { 
      author: 'David Kim', 
      initials: 'DK', 
      color: 'bg-orange-500', 
      text: 'This is a serious privacy violation claim with no evidence. CPS has strict confidentiality policies. Please don\'t spread unverified rumors about mental health services.', 
      time: '48 min ago',
      upvotes: 18,
      downvotes: 0
    },
    { 
      author: 'Lisa Wang', 
      initials: 'LW', 
      color: 'bg-pink-500', 
      text: 'If you have concerns about CPS services, contact them directly. Spreading false information about mental health resources harms the entire community.', 
      time: '55 min ago',
      upvotes: 15,
      downvotes: 0
    }
  ]
};

// ==========================================
// RENDERING FUNCTIONS
// ==========================================

function renderSchedule(scheduleData) {
  const grid = document.getElementById('schedule-grid');
  let html = '<div class="grid grid-cols-6 gap-1 mb-1"><div class="text-xs font-semibold text-gray-500 text-center">Time</div><div class="text-xs font-semibold text-center text-gray-700">M</div><div class="text-xs font-semibold text-center text-gray-700">T</div><div class="text-xs font-semibold text-center text-gray-700">W</div><div class="text-xs font-semibold text-center text-gray-700">Th</div><div class="text-xs font-semibold text-center text-gray-700">F</div></div><div class="space-y-1">';
  
  scheduleData.forEach(slot => {
    html += '<div class="grid grid-cols-6 gap-1">';
    html += `<div class="text-xs text-gray-500 text-center">${slot.time}</div>`;
    ['mon', 'tue', 'wed', 'thu', 'fri'].forEach(day => {
      if (slot[day]) {
        const colorClass = colorMap[slot.color] || 'bg-gray-100';
        html += `<div class="${colorClass} rounded p-1 text-xs font-medium text-center h-12 flex items-center justify-center leading-tight">${slot[day]}</div>`;
      } else {
        html += '<div class="bg-gray-50 rounded h-12"></div>';
      }
    });
    html += '</div>';
  });
  
  html += '</div>';
  grid.innerHTML = html;
}

// --- Auto-update comment count display ---
function updateCommentCount(postId) {
  const count = (commentsData[postId] || []).length; // how many comments exist
  const countDisplay = document.querySelector(
    `[data-post-id="${postId}"].comment-count`
  );
  if (countDisplay) {
    countDisplay.textContent = `💬 ${count} comments`;
  }
}

function renderComments(postId) {
  const comments = commentsData[postId] || [];
  updateCommentCount(postId);

  let html = `
    <h4 class="font-bold text-gray-900 text-base mb-2">Comments</h4>
  `;

  comments.forEach((comment, index) => {
    const isPinned = comment.isPinned || false;
    const containerClass = isPinned
      ? "bg-green-50 border-2 border-green-200"
      : "bg-white";

    // Ensure new fields exist
    comment.replies = comment.replies || [];
    comment.upvotes = comment.upvotes || 0;
    comment.downvotes = comment.downvotes || 0;

    html += `
      <div class="${containerClass} rounded-2xl p-3 shadow-sm mb-3">

        <div class="flex items-start gap-2">
          <div class="w-8 h-8 ${comment.color} rounded-full 
                      flex items-center justify-center text-white text-xs font-bold">
            ${comment.initials}
          </div>

          <div class="flex-1">
            <div class="flex items-center gap-1">
              <span class="font-semibold text-gray-900 text-sm">${comment.author}</span>
              ${comment.verified 
                  ? `<span class="bg-green-600 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">✓</span>` 
                  : ""}
            </div>

            <p class="text-sm text-gray-700 mt-1">${comment.text}</p>

            ${comment.link ? `
              <div class="mt-2 bg-gray-100 rounded-lg p-2">
                <a href="https://${comment.link}" 
                   target="_blank" 
                   class="text-xs text-blue-600">
                  🔗 ${comment.link}
                </a>
              </div>
            ` : ""}

            <div class="text-xs text-gray-500 mt-1">${comment.time}</div>

            <!-- VOTING -->
            <div class="flex items-center gap-3 mt-2 text-xs text-gray-600">
              ${(() => {
                const voteKey = `${postId}_${index}`;
                const userVote = userCommentVotes[voteKey] || null;
                const isUpvoted = userVote === 'up';
                const isDownvoted = userVote === 'down';
                return `
              <button onclick="upvoteComment(${postId}, ${index})"
                          class="px-3 py-1.5 ${isUpvoted ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition-colors flex items-center gap-1 ${isDownvoted ? 'opacity-50 cursor-not-allowed' : ''}"
                          ${isDownvoted ? 'disabled' : ''}>
                    <span class="text-base">⬆</span>
                    <span class="font-semibold">${comment.upvotes || 0}</span>
              </button>

              <button onclick="downvoteComment(${postId}, ${index})"
                          class="px-3 py-1.5 ${isDownvoted ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition-colors flex items-center gap-1 ${isUpvoted ? 'opacity-50 cursor-not-allowed' : ''}"
                          ${isUpvoted ? 'disabled' : ''}>
                    <span class="text-base">⬇</span>
                    <span class="font-semibold">${comment.downvotes || 0}</span>
              </button>
                `;
              })()}
            </div>

            <!-- REPLY + REPORT -->
            <div class="flex items-center gap-3 mt-2 text-xs text-gray-600">
              <button onclick="toggleReplyBox(this, ${postId}, ${index})" 
                      class="text-blue-600">Reply</button>

              <button onclick="reportComment(${postId}, ${index})" 
                      class="text-red-600">Report</button>
            </div>

            <!-- REPLY BOX -->
            <div id="reply-box-${postId}-${index}" class="hidden mt-2">
              <input id="reply-input-${postId}-${index}" 
                     class="w-full p-2 bg-gray-100 rounded text-sm"
                     placeholder="Write a reply...">

              <button onclick="submitReply(this, ${postId}, ${index})"
                      class="w-full mt-1 bg-blue-600 text-white text-sm py-1 rounded">
                Post reply
              </button>
            </div>

            <!-- REPLIES -->
            <div class="ml-6 mt-2 space-y-2">
              ${comment.replies.map(reply => `
                <div class="bg-gray-50 border rounded-xl p-2 text-sm">
                  <div class="flex items-center gap-2 mb-1">
                  <div class="font-semibold text-gray-800">${reply.author}</div>
                    ${reply.time ? `<div class="text-xs text-gray-500">${reply.time}</div>` : ''}
                  </div>
                  <div class="text-gray-700">${reply.text}</div>
                </div>
              `).join("")}
            </div>

          </div>
        </div>

      </div>
    `;
  });

  return html;
}

// ------------------------------------------------------
// UPVOTES / DOWNVOTES
// ------------------------------------------------------
function upvoteComment(postId, index) {
  if (!commentsData[postId] || !commentsData[postId][index]) return;
  
  const voteKey = `${postId}_${index}`;
  const currentVote = userCommentVotes[voteKey] || null;
  const comment = commentsData[postId][index];

  if (currentVote === 'up') {
    // Remove upvote
    comment.upvotes = Math.max(0, (comment.upvotes || 0) - 1);
    userCommentVotes[voteKey] = null;
  } else {
    // Add upvote
    if (currentVote === 'down') {
      // Remove existing downvote first
      comment.downvotes = Math.max(0, (comment.downvotes || 0) - 1);
    }
    comment.upvotes = (comment.upvotes || 0) + 1;
    userCommentVotes[voteKey] = 'up';
  }
  
  // Save vote state
  localStorage.setItem('missedCommentVotes', JSON.stringify(userCommentVotes));
  
  // Re-render comments directly
  const commentsContainer = document.querySelector('#post-detail .space-y-3');
  if (commentsContainer) {
    commentsContainer.innerHTML = renderComments(postId);
  }
}

function downvoteComment(postId, index) {
  if (!commentsData[postId] || !commentsData[postId][index]) return;
  
  const voteKey = `${postId}_${index}`;
  const currentVote = userCommentVotes[voteKey] || null;
  const comment = commentsData[postId][index];
  
  if (currentVote === 'down') {
    // Remove downvote
    comment.downvotes = Math.max(0, (comment.downvotes || 0) - 1);
    userCommentVotes[voteKey] = null;
  } else {
    // Add downvote
    if (currentVote === 'up') {
      // Remove existing upvote first
      comment.upvotes = Math.max(0, (comment.upvotes || 0) - 1);
    }
    comment.downvotes = (comment.downvotes || 0) + 1;
    userCommentVotes[voteKey] = 'down';
  }
  
  // Save vote state
  localStorage.setItem('missedCommentVotes', JSON.stringify(userCommentVotes));
  
  // Re-render comments directly
  const commentsContainer = document.querySelector('#post-detail .space-y-3');
  if (commentsContainer) {
    commentsContainer.innerHTML = renderComments(postId);
  }
}



// ------------------------------------------------------
// TOGGLE REPLY BOX
// ------------------------------------------------------
function toggleReplyBox(button, postId, index) {
  const box = document.getElementById(`reply-box-${postId}-${index}`);
  box.classList.toggle("hidden");
}



// ------------------------------------------------------
// SUBMIT REPLY
// ------------------------------------------------------
function submitReply(button, postId, index) {
  const input = document.getElementById(`reply-input-${postId}-${index}`);
  const text = input.value.trim();
  if (!text) return;

  const comment = commentsData[postId][index];
  if (!comment) return;
  
  comment.replies = comment.replies || [];
  comment.replies.push({
    author: "You",
    text: text,
    time: "Just now"
  });

  input.value = "";
  
  // Re-render comments directly
  const commentsContainer = document.querySelector('#post-detail .space-y-3');
  if (commentsContainer) {
    commentsContainer.innerHTML = renderComments(postId);
  }
}



// ------------------------------------------------------
// REPORT COMMENT
// ------------------------------------------------------
function reportComment(postId, index) {
  alert("Thank you — this comment has been reported.");
}
// ==========================================
// NAVIGATION
// ==========================================

function showPage(pageId) {
  // Ensure main app content and nav are visible when showing pages
  const mainContent = document.querySelector('main');
  const bottomNav = document.querySelector('nav');
  if (mainContent) mainContent.style.display = 'block';
  if (bottomNav) bottomNav.style.display = 'flex';
  
  // Hide all pages
  document.querySelectorAll('.page-view').forEach(v => {
    v.classList.remove('active');
    v.style.display = 'none';
  });
  
  // Show the requested page
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
    targetPage.style.display = 'block';
  }
  
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.remove('active');
    n.classList.add('text-gray-600');
  });
  const activeNav = document.querySelector(`[data-page='${pageId}']`);
  if(activeNav) {
    activeNav.classList.add('active');
    activeNav.classList.remove('text-gray-600');
  }
  
  // Load profile data when profile page is shown
  if (pageId === 'profile' && isLoggedIn) {
    loadUserProfile();
    renderNetworkList();
  }
  
  // Update schedule connection count and render connected students when schedule page is shown
  if (pageId === 'schedule' && isLoggedIn) {
    updateScheduleConnectionCount();
    renderConnectedStudents();
    // Reset to own schedule
    switchSchedule('self', 'Haetal Kim', null);
  }
  
  // Render chat list when chat page is shown
  if (pageId === 'chat' && isLoggedIn) {
    initializeDefaultConversations();
    renderChatList();
  }
  
  // Render saved posts when saved page is shown
  if (pageId === 'folder' && isLoggedIn) {
    renderSavedPosts();
  }
}

// ==========================================
// BOOKMARK/SAVE FUNCTIONALITY
// ==========================================

// Get saved posts from localStorage
function getSavedPosts() {
  if (!isLoggedIn || !currentUserEmail) return [];
  const savedStr = localStorage.getItem(`missedSavedPosts_${currentUserEmail}`);
  return savedStr ? JSON.parse(savedStr) : [];
}

// Save posts to localStorage
function savePostsToStorage(savedPosts) {
  if (!isLoggedIn || !currentUserEmail) return;
  localStorage.setItem(`missedSavedPosts_${currentUserEmail}`, JSON.stringify(savedPosts));
}

// Generate unique post ID
function getPostId(communityId, postIndex) {
  if (communityId === null && postIndex === null) {
    // For visa community posts (old format) - use currentPostId
    if (window.currentPostId) {
      return `visa_${window.currentPostId}`;
    }
    return 'visa_unknown';
  }
  if (communityId === 'visa' && typeof postIndex === 'number') {
    return `visa_${postIndex}`;
  }
  return `${communityId}_${postIndex}`;
}

// Check if post is saved
function isPostSaved(postId) {
  const savedPosts = getSavedPosts();
  return savedPosts.some(p => p.id === postId);
}

// Toggle save/unsave post
function toggleSavePost(event) {
  if (event) event.stopPropagation();
  
  if (!isLoggedIn || !currentUserEmail) {
    showToast('Please log in to save posts');
    return;
  }
  
  // Get current post info
  const communityId = window.currentCommunityId;
  const postIndex = window.currentPostIndex;
  const postId = getPostId(communityId, postIndex);
  
  // Get post data
  let postData = null;
  
  if (communityId && postIndex !== null) {
    // Community post
    const communityData = {
      career: {
        posts: [
          { author: 'Sarah Kim', avatar: 'SK', avatarBg: 'bg-green-500', verified: true, time: '2h ago', title: 'Career Fair Tips - Spring 2025', content: 'TC Career Services just posted the official guide for next week\'s career fair. Includes company list and booth map!', link: 'tc.columbia.edu/career-fair', comments: 8, likes: 24 },
          { author: 'David Chen', avatar: 'DC', avatarBg: 'bg-orange-500', verified: false, time: '5h ago', title: 'Anyone else applying to EdTech startups?', content: 'Looking for advice on how to break into the EdTech industry. Any tips on resume tailoring?', link: '', comments: 12, likes: 18 },
          { author: 'Emily Park', avatar: 'EP', avatarBg: 'bg-blue-500', verified: true, time: '1d ago', title: 'OPT Application Deadlines Reminder', content: 'OISS reminder: OPT applications must be filed within 90 days of graduation. Start early!', link: 'tc.columbia.edu/oiss/opt-timeline', comments: 5, likes: 31 },
          { author: 'Anonymous', avatar: '??', avatarBg: 'bg-gray-400', verified: false, flagged: true, time: '3h ago', title: 'FAKE JOB ALERT: "Easy OPT sponsorship" scam', content: 'Got an email from "TechCorp" offering instant OPT sponsorship for $500. They said no interview needed! Sounds too good to be true...', link: '', comments: 12, likes: 3, reports: 8 }
        ]
      },
      housing: {
        posts: [
          { author: 'TC Public Safety', avatar: 'PS', avatarBg: 'bg-red-500', verified: true, time: '1h ago', title: 'Neighborhood Safety Ratings Updated', content: 'Our monthly safety report is now available. Check crime statistics and safety tips for Morningside Heights and surrounding areas.', link: 'columbia.edu/publicsafety/neighborhoods', comments: 15, likes: 42 },
          { author: 'Maria Lopez', avatar: 'ML', avatarBg: 'bg-purple-500', verified: false, time: '4h ago', title: 'Looking for roommate - Hamilton Heights', content: 'Need one roommate for a 2BR apartment near campus. $1,100/month, available Jan 1st. Pet friendly!', link: '', comments: 9, likes: 6 },
          { author: 'Alex Wang', avatar: 'AW', avatarBg: 'bg-indigo-500', verified: true, time: '2d ago', title: 'Lease Agreement Review Resources', content: 'Student Legal Services offers free lease review appointments. Highly recommend before signing anything!', link: 'columbia.edu/legal-services', comments: 7, likes: 28 },
          { author: 'Anonymous', avatar: '??', avatarBg: 'bg-gray-400', verified: false, flagged: true, time: '5h ago', title: 'URGENT: Morningside Heights is unsafe!', content: 'My friend got robbed last night near campus. Police said crime is up 300% this month. Everyone should move out immediately!', link: '', comments: 18, likes: 5, reports: 12 }
        ]
      },
      academic: {
        posts: [
          { author: 'Prof. Johnson', avatar: 'PJ', avatarBg: 'bg-blue-600', verified: true, time: '3h ago', title: 'Final Exam Study Strategy Workshop', content: 'The Writing Center is hosting a study strategies workshop next Tuesday. Learn evidence-based techniques for exam prep.', link: 'tc.columbia.edu/writing-center/workshops', comments: 11, likes: 37 },
          { author: 'Rachel Park', avatar: 'RP', avatarBg: 'bg-purple-500', verified: false, time: '6h ago', title: 'Best courses for Spring semester?', content: 'Looking for recommendations on electives related to learning analytics and educational data science.', link: '', comments: 18, likes: 14 },
          { author: 'TC Library', avatar: 'TL', avatarBg: 'bg-teal-600', verified: true, time: '1d ago', title: 'Extended Hours During Finals Week', content: 'Gottesman Library will be open 24/7 from Dec 10-18. Quiet study rooms available by reservation.', link: 'library.tc.columbia.edu/hours', comments: 4, likes: 52 },
          { author: 'Anonymous', avatar: '??', avatarBg: 'bg-gray-400', verified: false, flagged: true, time: '4h ago', title: 'Professors selling exam answers on WhatsApp', content: 'Found a group where professors are selling final exam answers for $200. DM me for the link!', link: '', comments: 9, likes: 2, reports: 15 }
        ]
      },
      social: {
        posts: [
          { author: 'International Student Org', avatar: 'ISO', avatarBg: 'bg-pink-500', verified: true, time: '30min ago', title: 'Holiday Potluck - This Friday!', content: 'Bring a dish from your home country and join us for our annual holiday celebration. 6pm at the student lounge!', link: 'tc.columbia.edu/student-life/events', comments: 23, likes: 67 },
          { author: 'Kevin Liu', avatar: 'KL', avatarBg: 'bg-yellow-500', verified: false, time: '3h ago', title: 'Weekend hiking group?', content: 'Anyone interested in hiking Bear Mountain this Saturday? Planning to leave around 8am.', link: '', comments: 15, likes: 21 },
          { author: 'Jessica Brown', avatar: 'JB', avatarBg: 'bg-green-500', verified: false, time: '1d ago', title: 'Board game night at my place', content: 'Hosting a casual board game night next Thursday. All welcome! BYOB.', link: '', comments: 19, likes: 34 }
        ]
      },
      health: {
        posts: [
          { author: 'CPS Wellness', avatar: 'CPS', avatarBg: 'bg-teal-600', verified: true, time: '1h ago', title: 'Free Mental Health Screening Week', content: 'CPS is offering confidential mental health screenings Nov 11-15. No appointment needed, just drop by.', link: 'health.columbia.edu/cps', comments: 8, likes: 41 },
          { author: 'Dr. Martinez', avatar: 'DM', avatarBg: 'bg-blue-600', verified: true, time: '4h ago', title: 'Flu Shots Available at Health Services', content: 'Free flu vaccinations for all students. Walk-ins welcome Monday-Friday 9am-4pm.', link: 'health.columbia.edu/flu-clinic', comments: 6, likes: 29 },
          { author: 'Anonymous', avatar: '??', avatarBg: 'bg-gray-400', verified: false, time: '2d ago', title: 'Stress management tips?', content: 'Finals season is overwhelming. What do you all do to manage stress and anxiety?', link: '', comments: 24, likes: 45 },
          { author: 'Anonymous', avatar: '??', avatarBg: 'bg-gray-400', verified: false, flagged: true, time: '6h ago', title: 'CPS therapy sessions are being recorded', content: 'Heard from a friend that CPS secretly records all therapy sessions and shares them with administration. This is a privacy violation!', link: '', comments: 7, likes: 1, reports: 9 }
        ]
      }
    };
    
    const community = communityData[communityId];
    if (community && community.posts[postIndex]) {
      postData = community.posts[postIndex];
    }
  } else if (window.currentPostId) {
    // Visa community post (old format)
    const posts = {
      1: { author: 'Jiin Hur', avatar: 'JH', avatarBg: 'bg-blue-500', meta: 'TML \'26 • 1h ago', badge: true, title: 'Best resources for CPT application?', content: 'I found this comprehensive guide from OISS. Has all the forms and requirements clearly listed! This has been super helpful for my application process.', link: '🔗 tc.columbia.edu/oiss/cpt-guide' },
      2: { author: 'Min Park', avatar: 'MP', avatarBg: 'bg-purple-500', meta: 'TML \'27 • 2h ago', badge: false, title: 'Study group for EdTech?', content: 'Looking to form a study group for the midterm. Anyone interested? We can meet at the library or on Zoom. Planning for Tuesday or Thursday afternoons.', link: '' },
      3: { author: 'Anonymous', avatar: '??', avatarBg: 'bg-gray-400', meta: '4h ago', badge: 'flagged', title: 'URGENT: OPT applications suspended!', content: 'My friend at NYU said USCIS stopped processing OPT applications this week due to policy changes. Don\'t apply yet or you might lose your fee! They\'re reviewing international student work authorization.', link: '' }
    };
    postData = posts[window.currentPostId];
  }
  
  if (!postData) return;
  
  const savedPosts = getSavedPosts();
  const isSaved = isPostSaved(postId);
  
  if (isSaved) {
    // Unsave
    const index = savedPosts.findIndex(p => p.id === postId);
    if (index > -1) {
      savedPosts.splice(index, 1);
      savePostsToStorage(savedPosts);
      updateBookmarkButton(false);
      showToast('Post removed from saved');
    }
  } else {
    // Save
      const communityInfo = getCommunityInfo(communityId || 'visa');
      savedPosts.push({
        id: postId,
        communityId: communityId || 'visa',
        communityName: communityInfo.name,
        communityEmoji: communityInfo.emoji,
        postIndex: postIndex !== null ? postIndex : window.currentPostId,
        ...postData,
        savedAt: new Date().toISOString()
      });
    savePostsToStorage(savedPosts);
    updateBookmarkButton(true);
    showToast('Post saved');
  }
  
  // Update saved posts list if visible
  if (document.getElementById('folder').classList.contains('active')) {
    renderSavedPosts();
  }
}

// Update bookmark button appearance
function updateBookmarkButton(isSaved) {
  const bookmarkBtn = document.getElementById('post-bookmark-btn');
  const bookmarkIcon = document.getElementById('post-bookmark-icon');
  
  if (!bookmarkBtn || !bookmarkIcon) return;
  
  if (isSaved) {
    bookmarkBtn.classList.remove('text-gray-400');
    bookmarkBtn.classList.add('text-blue-600');
    bookmarkIcon.setAttribute('fill', 'currentColor');
  } else {
    bookmarkBtn.classList.remove('text-blue-600');
    bookmarkBtn.classList.add('text-gray-400');
    bookmarkIcon.setAttribute('fill', 'none');
  }
}

// Get community info helper
function getCommunityInfo(communityId) {
  const communities = {
    visa: { emoji: '🎓', name: 'F-1 Visa Help' },
    career: { emoji: '💼', name: 'Career & OPT Support' },
    housing: { emoji: '🏠', name: 'Housing & Safety' },
    academic: { emoji: '📚', name: 'Academic Resources' },
    social: { emoji: '🎉', name: 'Social & Events' },
    health: { emoji: '🏥', name: 'Health & Wellness' }
  };
  return communities[communityId] || { emoji: '📁', name: 'Other' };
}

// Render saved posts organized by community folders (collapsible)
function renderSavedPosts() {
  const container = document.getElementById('saved-posts-container');
  if (!container) return;
  
  const savedPosts = getSavedPosts();
  
  if (savedPosts.length === 0) {
    container.innerHTML = '<div class="bg-white rounded-2xl p-8 text-center"><p class="text-gray-500 text-sm">No saved posts yet. Bookmark posts to save them here!</p></div>';
    return;
  }
  
  // Group posts by community
  const postsByCommunity = {};
  savedPosts.forEach(savedPost => {
    const communityId = savedPost.communityId || 'visa';
    if (!postsByCommunity[communityId]) {
      postsByCommunity[communityId] = [];
    }
    postsByCommunity[communityId].push(savedPost);
  });
  
  let html = '';
  
  // Render each community folder (collapsible)
  Object.keys(postsByCommunity).forEach(communityId => {
    const communityInfo = getCommunityInfo(communityId);
    const posts = postsByCommunity[communityId];
    
    html += `
      <div class="mb-3">
        <button onclick="toggleSavedFolder('${communityId}')" class="w-full flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
          <div class="flex items-center gap-3">
            <span class="text-2xl">${communityInfo.emoji}</span>
            <div class="text-left">
              <h3 class="text-base font-bold text-gray-900">${communityInfo.name}</h3>
              <p class="text-xs text-gray-500">${posts.length} saved post${posts.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <svg id="folder-icon-${communityId}" class="w-5 h-5 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div id="folder-posts-${communityId}" class="hidden mt-2 space-y-3">
    `;
    
    posts.forEach(savedPost => {
      const verifiedBadge = savedPost.verified ? '<span class="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">✓</span>' : '';
      const flaggedBadge = savedPost.flagged ? '<span class="bg-red-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">⚠</span>' : '';
      const linkHTML = savedPost.link ? `<div class="bg-blue-50 rounded-xl p-3 mb-2 mt-2"><span class="text-sm text-blue-600 font-semibold">🔗 ${savedPost.link}</span></div>` : '';
      
      html += `
        <div onclick="openSavedPost('${savedPost.communityId}', ${savedPost.postIndex})" class="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ml-4">
          <div class="flex items-start gap-3 mb-2">
            <div class="w-10 h-10 ${savedPost.avatarBg || 'bg-gray-500'} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">${savedPost.avatar || '??'}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-gray-900 text-sm">${savedPost.author || 'Anonymous'}</span>
                ${verifiedBadge}
                ${flaggedBadge}
              </div>
              <p class="text-xs text-gray-600">${savedPost.time || savedPost.meta || ''}</p>
            </div>
          </div>
          <h3 class="font-bold text-gray-900 mb-2">${savedPost.title}</h3>
          <p class="text-sm text-gray-700 mb-2">${savedPost.content}</p>
          ${linkHTML}
          <div class="flex items-center gap-4 text-xs text-gray-600 mt-2">
            <span>💬 ${savedPost.comments || 0} comments</span>
            <span>👍 ${savedPost.likes || 0} likes</span>
          </div>
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Toggle folder expand/collapse
function toggleSavedFolder(communityId) {
  const folderPosts = document.getElementById(`folder-posts-${communityId}`);
  const folderIcon = document.getElementById(`folder-icon-${communityId}`);
  
  if (!folderPosts || !folderIcon) return;
  
  const isExpanded = !folderPosts.classList.contains('hidden');
  
  if (isExpanded) {
    folderPosts.classList.add('hidden');
    folderIcon.classList.remove('rotate-180');
  } else {
    folderPosts.classList.remove('hidden');
    folderIcon.classList.add('rotate-180');
  }
}

// Open saved post
function openSavedPost(communityId, postIndex) {
  if (communityId === 'visa' && typeof postIndex === 'number' && postIndex <= 3) {
    // Visa community post (old format)
    openPost(postIndex);
  } else {
    // Other community posts
    openCommunityPost(communityId, postIndex);
  }
}

// Toggle save from list (community feed)
function toggleSavePostFromList(communityId, postIndex) {
  if (!isLoggedIn || !currentUserEmail) {
    showToast('Please log in to save posts');
    return;
  }
  
  const postId = getPostId(communityId, postIndex);
  
  // Get post data from community data
  const communityData = {
    career: {
      posts: [
        { author: 'Sarah Kim', avatar: 'SK', avatarBg: 'bg-green-500', verified: true, time: '2h ago', title: 'Career Fair Tips - Spring 2025', content: 'TC Career Services just posted the official guide for next week\'s career fair. Includes company list and booth map!', link: 'tc.columbia.edu/career-fair', comments: 8, likes: 24 },
        { author: 'David Chen', avatar: 'DC', avatarBg: 'bg-orange-500', verified: false, time: '5h ago', title: 'Anyone else applying to EdTech startups?', content: 'Looking for advice on how to break into the EdTech industry. Any tips on resume tailoring?', link: '', comments: 12, likes: 18 },
        { author: 'Emily Park', avatar: 'EP', avatarBg: 'bg-blue-500', verified: true, time: '1d ago', title: 'OPT Application Deadlines Reminder', content: 'OISS reminder: OPT applications must be filed within 90 days of graduation. Start early!', link: 'tc.columbia.edu/oiss/opt-timeline', comments: 5, likes: 31 },
        { author: 'Anonymous', avatar: '??', avatarBg: 'bg-gray-400', verified: false, flagged: true, time: '3h ago', title: 'FAKE JOB ALERT: "Easy OPT sponsorship" scam', content: 'Got an email from "TechCorp" offering instant OPT sponsorship for $500. They said no interview needed! Sounds too good to be true...', link: '', comments: 12, likes: 3, reports: 8 }
      ]
    },
    housing: {
      posts: [
        { author: 'TC Public Safety', avatar: 'PS', avatarBg: 'bg-red-500', verified: true, time: '1h ago', title: 'Neighborhood Safety Ratings Updated', content: 'Our monthly safety report is now available. Check crime statistics and safety tips for Morningside Heights and surrounding areas.', link: 'columbia.edu/publicsafety/neighborhoods', comments: 15, likes: 42 },
        { author: 'Maria Lopez', avatar: 'ML', avatarBg: 'bg-purple-500', verified: false, time: '4h ago', title: 'Looking for roommate - Hamilton Heights', content: 'Need one roommate for a 2BR apartment near campus. $1,100/month, available Jan 1st. Pet friendly!', link: '', comments: 9, likes: 6 },
        { author: 'Alex Wang', avatar: 'AW', avatarBg: 'bg-indigo-500', verified: true, time: '2d ago', title: 'Lease Agreement Review Resources', content: 'Student Legal Services offers free lease review appointments. Highly recommend before signing anything!', link: 'columbia.edu/legal-services', comments: 7, likes: 28 },
        { author: 'Anonymous', avatar: '??', avatarBg: 'bg-gray-400', verified: false, flagged: true, time: '5h ago', title: 'URGENT: Morningside Heights is unsafe!', content: 'My friend got robbed last night near campus. Police said crime is up 300% this month. Everyone should move out immediately!', link: '', comments: 18, likes: 5, reports: 12 }
      ]
    },
    academic: {
      posts: [
        { author: 'Prof. Johnson', avatar: 'PJ', avatarBg: 'bg-blue-600', verified: true, time: '3h ago', title: 'Final Exam Study Strategy Workshop', content: 'The Writing Center is hosting a study strategies workshop next Tuesday. Learn evidence-based techniques for exam prep.', link: 'tc.columbia.edu/writing-center/workshops', comments: 11, likes: 37 },
        { author: 'Rachel Park', avatar: 'RP', avatarBg: 'bg-purple-500', verified: false, time: '6h ago', title: 'Best courses for Spring semester?', content: 'Looking for recommendations on electives related to learning analytics and educational data science.', link: '', comments: 18, likes: 14 },
        { author: 'TC Library', avatar: 'TL', avatarBg: 'bg-teal-600', verified: true, time: '1d ago', title: 'Extended Hours During Finals Week', content: 'Gottesman Library will be open 24/7 from Dec 10-18. Quiet study rooms available by reservation.', link: 'library.tc.columbia.edu/hours', comments: 4, likes: 52 },
        { author: 'Anonymous', avatar: '??', avatarBg: 'bg-gray-400', verified: false, flagged: true, time: '4h ago', title: 'Professors selling exam answers on WhatsApp', content: 'Found a group where professors are selling final exam answers for $200. DM me for the link!', link: '', comments: 9, likes: 2, reports: 15 }
      ]
    },
    social: {
      posts: [
        { author: 'International Student Org', avatar: 'ISO', avatarBg: 'bg-pink-500', verified: true, time: '30min ago', title: 'Holiday Potluck - This Friday!', content: 'Bring a dish from your home country and join us for our annual holiday celebration. 6pm at the student lounge!', link: 'tc.columbia.edu/student-life/events', comments: 23, likes: 67 },
        { author: 'Kevin Liu', avatar: 'KL', avatarBg: 'bg-yellow-500', verified: false, time: '3h ago', title: 'Weekend hiking group?', content: 'Anyone interested in hiking Bear Mountain this Saturday? Planning to leave around 8am.', link: '', comments: 15, likes: 21 },
        { author: 'Jessica Brown', avatar: 'JB', avatarBg: 'bg-green-500', verified: false, time: '1d ago', title: 'Board game night at my place', content: 'Hosting a casual board game night next Thursday. All welcome! BYOB.', link: '', comments: 19, likes: 34 }
      ]
    },
    health: {
      posts: [
        { author: 'CPS Wellness', avatar: 'CPS', avatarBg: 'bg-teal-600', verified: true, time: '1h ago', title: 'Free Mental Health Screening Week', content: 'CPS is offering confidential mental health screenings Nov 11-15. No appointment needed, just drop by.', link: 'health.columbia.edu/cps', comments: 8, likes: 41 },
        { author: 'Dr. Martinez', avatar: 'DM', avatarBg: 'bg-blue-600', verified: true, time: '4h ago', title: 'Flu Shots Available at Health Services', content: 'Free flu vaccinations for all students. Walk-ins welcome Monday-Friday 9am-4pm.', link: 'health.columbia.edu/flu-clinic', comments: 6, likes: 29 },
        { author: 'Anonymous', avatar: '??', avatarBg: 'bg-gray-400', verified: false, time: '2d ago', title: 'Stress management tips?', content: 'Finals season is overwhelming. What do you all do to manage stress and anxiety?', link: '', comments: 24, likes: 45 },
        { author: 'Anonymous', avatar: '??', avatarBg: 'bg-gray-400', verified: false, flagged: true, time: '6h ago', title: 'CPS therapy sessions are being recorded', content: 'Heard from a friend that CPS secretly records all therapy sessions and shares them with administration. This is a privacy violation!', link: '', comments: 7, likes: 1, reports: 9 }
      ]
    }
  };
  
  const community = communityData[communityId];
  if (!community || !community.posts[postIndex]) return;
  
  const postData = community.posts[postIndex];
  const savedPosts = getSavedPosts();
  const isSaved = isPostSaved(postId);
  
  if (isSaved) {
    // Unsave
    const index = savedPosts.findIndex(p => p.id === postId);
    if (index > -1) {
      savedPosts.splice(index, 1);
      savePostsToStorage(savedPosts);
      showToast('Post removed from saved');
    }
  } else {
    // Save
    const communityInfo = getCommunityInfo(communityId);
    savedPosts.push({
      id: postId,
      communityId: communityId,
      communityName: communityInfo.name,
      communityEmoji: communityInfo.emoji,
      postIndex: postIndex,
      ...postData,
      savedAt: new Date().toISOString()
    });
    savePostsToStorage(savedPosts);
    showToast('Post saved');
  }
  
  // Re-render the community feed to update bookmark icons
  showCommunity(communityId);
  
  // Update saved posts list if visible
  if (document.getElementById('folder').classList.contains('active')) {
    renderSavedPosts();
  }
}

function showCommunity(communityId) {
  // Define community data
  const communities = {
    visa: {
      emoji: '🎓',
      name: 'F-1 Visa Help',
      description: 'Official verified information for international students. Moderated by OISS staff.',
      badge: 'OISS Verified',
      badgeColor: 'bg-purple-100 text-purple-700',
      members: 248,
      verified: 89,
      focus: 'Visa status, work authorization (CPT/OPT/STEM OPT), travel, I-20 issues, and official USCIS updates. All visa advice is verified by OISS.',
      focusColor: 'bg-blue-50 text-blue-900 text-blue-800',
      posts: [
        { id: 1, verified: true },
        { id: 2, verified: false },
        { id: 3, flagged: true }
      ]
    },
    career: {
      emoji: '💼',
      name: 'Career & OPT Support',
      description: 'Job search strategies and career development. Moderated by Career Services.',
      badge: 'Career Services',
      badgeColor: 'bg-orange-100 text-orange-700',
      members: 156,
      verified: 78,
      focus: 'Job search, resume reviews, OPT applications, interview preparation, networking tips, and career fair information.',
      focusColor: 'bg-green-50 text-green-900 text-green-800',
      posts: [
        {
          author: 'Sarah Kim',
          avatar: 'SK',
          avatarBg: 'bg-green-500',
          verified: true,
          time: '2h ago',
          title: 'Career Fair Tips - Spring 2025',
          content: 'TC Career Services just posted the official guide for next week\'s career fair. Includes company list and booth map!',
          link: 'tc.columbia.edu/career-fair',
          comments: 8,
          likes: 24
        },
        {
          author: 'David Chen',
          avatar: 'DC',
          avatarBg: 'bg-orange-500',
          verified: false,
          time: '5h ago',
          title: 'Anyone else applying to EdTech startups?',
          content: 'Looking for advice on how to break into the EdTech industry. Any tips on resume tailoring?',
          link: '',
          comments: 12,
          likes: 18
        },
        {
          author: 'Emily Park',
          avatar: 'EP',
          avatarBg: 'bg-blue-500',
          verified: true,
          time: '1d ago',
          title: 'OPT Application Deadlines Reminder',
          content: 'OISS reminder: OPT applications must be filed within 90 days of graduation. Start early!',
          link: 'tc.columbia.edu/oiss/opt-timeline',
          comments: 5,
          likes: 31
        },
        {
          author: 'Anonymous',
          avatar: '??',
          avatarBg: 'bg-gray-400',
          verified: false,
          flagged: true,
          time: '3h ago',
          title: 'FAKE JOB ALERT: "Easy OPT sponsorship" scam',
          content: 'Got an email from "TechCorp" offering instant OPT sponsorship for $500. They said no interview needed! Sounds too good to be true...',
          link: '',
          comments: 12,
          likes: 3,
          reports: 8
        }
      ]
    },
    housing: {
      emoji: '🏠',
      name: 'Housing & Safety',
      description: 'Safe housing and neighborhood information. Moderated by Public Safety.',
      badge: 'Public Safety',
      badgeColor: 'bg-red-100 text-red-700',
      members: 203,
      verified: 85,
      focus: 'Apartment hunting, roommate matching, neighborhood safety ratings, lease advice, and campus housing updates.',
      focusColor: 'bg-orange-50 text-orange-900 text-orange-800',
      posts: [
        {
          author: 'TC Public Safety',
          avatar: 'PS',
          avatarBg: 'bg-red-500',
          verified: true,
          time: '1h ago',
          title: 'Neighborhood Safety Ratings Updated',
          content: 'Our monthly safety report is now available. Check crime statistics and safety tips for Morningside Heights and surrounding areas.',
          link: 'columbia.edu/publicsafety/neighborhoods',
          comments: 15,
          likes: 42
        },
        {
          author: 'Maria Lopez',
          avatar: 'ML',
          avatarBg: 'bg-purple-500',
          verified: false,
          time: '4h ago',
          title: 'Looking for roommate - Hamilton Heights',
          content: 'Need one roommate for a 2BR apartment near campus. $1,100/month, available Jan 1st. Pet friendly!',
          link: '',
          comments: 9,
          likes: 6
        },
        {
          author: 'Alex Wang',
          avatar: 'AW',
          avatarBg: 'bg-indigo-500',
          verified: true,
          time: '2d ago',
          title: 'Lease Agreement Review Resources',
          content: 'Student Legal Services offers free lease review appointments. Highly recommend before signing anything!',
          link: 'columbia.edu/legal-services',
          comments: 7,
          likes: 28
        },
        {
          author: 'Anonymous',
          avatar: '??',
          avatarBg: 'bg-gray-400',
          verified: false,
          flagged: true,
          time: '5h ago',
          title: 'URGENT: Morningside Heights is unsafe!',
          content: 'My friend got robbed last night near campus. Police said crime is up 300% this month. Everyone should move out immediately!',
          link: '',
          comments: 18,
          likes: 5,
          reports: 12
        }
      ]
    },
    academic: {
      emoji: '📚',
      name: 'Academic Resources',
      description: 'Study support and academic guidance. Moderated by TC Faculty.',
      badge: 'TC Faculty',
      badgeColor: 'bg-blue-100 text-blue-700',
      members: 187,
      verified: 92,
      focus: 'Study tips, course recommendations, writing center resources, tutoring services, library resources, and academic workshops.',
      focusColor: 'bg-purple-50 text-purple-900 text-purple-800',
      posts: [
        {
          author: 'Prof. Johnson',
          avatar: 'PJ',
          avatarBg: 'bg-blue-600',
          verified: true,
          time: '3h ago',
          title: 'Final Exam Study Strategy Workshop',
          content: 'The Writing Center is hosting a study strategies workshop next Tuesday. Learn evidence-based techniques for exam prep.',
          link: 'tc.columbia.edu/writing-center/workshops',
          comments: 11,
          likes: 37
        },
        {
          author: 'Rachel Park',
          avatar: 'RP',
          avatarBg: 'bg-purple-500',
          verified: false,
          time: '6h ago',
          title: 'Best courses for Spring semester?',
          content: 'Looking for recommendations on electives related to learning analytics and educational data science.',
          link: '',
          comments: 18,
          likes: 14
        },
        {
          author: 'TC Library',
          avatar: 'TL',
          avatarBg: 'bg-teal-600',
          verified: true,
          time: '1d ago',
          title: 'Extended Hours During Finals Week',
          content: 'Gottesman Library will be open 24/7 from Dec 10-18. Quiet study rooms available by reservation.',
          link: 'library.tc.columbia.edu/hours',
          comments: 4,
          likes: 52
        },
        {
          author: 'Anonymous',
          avatar: '??',
          avatarBg: 'bg-gray-400',
          verified: false,
          flagged: true,
          time: '4h ago',
          title: 'Professors selling exam answers on WhatsApp',
          content: 'Found a group where professors are selling final exam answers for $200. DM me for the link!',
          link: '',
          comments: 9,
          likes: 2,
          reports: 15
        }
      ]
    },
    social: {
      emoji: '🎉',
      name: 'Social & Events',
      description: 'Connect with peers and discover events. Moderated by Student Life.',
      badge: 'Student Life',
      badgeColor: 'bg-pink-100 text-pink-700',
      members: 312,
      verified: 65,
      focus: 'Meetups, cultural events, friend groups, weekend activities, student organizations, and social gatherings.',
      focusColor: 'bg-pink-50 text-pink-900 text-pink-800',
      posts: [
        {
          author: 'International Student Org',
          avatar: 'ISO',
          avatarBg: 'bg-pink-500',
          verified: true,
          time: '30min ago',
          title: 'Holiday Potluck - This Friday!',
          content: 'Bring a dish from your home country and join us for our annual holiday celebration. 6pm at the student lounge!',
          link: 'tc.columbia.edu/student-life/events',
          comments: 23,
          likes: 67
        },
        {
          author: 'Kevin Liu',
          avatar: 'KL',
          avatarBg: 'bg-yellow-500',
          verified: false,
          time: '3h ago',
          title: 'Weekend hiking group?',
          content: 'Anyone interested in hiking Bear Mountain this Saturday? Planning to leave around 8am.',
          link: '',
          comments: 15,
          likes: 21
        },
        {
          author: 'Jessica Brown',
          avatar: 'JB',
          avatarBg: 'bg-green-500',
          verified: false,
          time: '1d ago',
          title: 'Board game night at my place',
          content: 'Hosting a casual board game night next Thursday. All welcome! BYOB.',
          link: '',
          comments: 19,
          likes: 34
        }
      ]
    },
    health: {
      emoji: '🏥',
      name: 'Health & Wellness',
      description: 'Health resources and mental wellness. Moderated by CPS.',
      badge: 'CPS Verified',
      badgeColor: 'bg-teal-100 text-teal-700',
      members: 142,
      verified: 88,
      focus: 'Health insurance, CPS counseling services, medical appointments, mental health resources, and wellness programs.',
      focusColor: 'bg-teal-50 text-teal-900 text-teal-800',
      posts: [
        {
          author: 'CPS Wellness',
          avatar: 'CPS',
          avatarBg: 'bg-teal-600',
          verified: true,
          time: '1h ago',
          title: 'Free Mental Health Screening Week',
          content: 'CPS is offering confidential mental health screenings Nov 11-15. No appointment needed, just drop by.',
          link: 'health.columbia.edu/cps',
          comments: 8,
          likes: 41
        },
        {
          author: 'Dr. Martinez',
          avatar: 'DM',
          avatarBg: 'bg-blue-600',
          verified: true,
          time: '4h ago',
          title: 'Flu Shots Available at Health Services',
          content: 'Free flu vaccinations for all students. Walk-ins welcome Monday-Friday 9am-4pm.',
          link: 'health.columbia.edu/flu-clinic',
          comments: 6,
          likes: 29
        },
        {
          author: 'Anonymous',
          avatar: '??',
          avatarBg: 'bg-gray-400',
          verified: false,
          time: '2d ago',
          title: 'Stress management tips?',
          content: 'Finals season is overwhelming. What do you all do to manage stress and anxiety?',
          link: '',
          comments: 24,
          likes: 45
        },
        {
          author: 'Anonymous',
          avatar: '??',
          avatarBg: 'bg-gray-400',
          verified: false,
          flagged: true,
          time: '6h ago',
          title: 'CPS therapy sessions are being recorded',
          content: 'Heard from a friend that CPS secretly records all therapy sessions and shares them with administration. This is a privacy violation!',
          link: '',
          comments: 7,
          likes: 1,
          reports: 9
        }
      ]
    }
  };
  
  const community = communities[communityId] || communities.visa;
  
  // Update community header
  document.getElementById('community-emoji').textContent = community.emoji;
  document.getElementById('community-name').textContent = community.name;
  document.getElementById('community-description').textContent = community.description;
  document.getElementById('community-members').textContent = community.members + ' members';
  document.getElementById('community-verified').textContent = community.verified + '% verified';
  document.getElementById('community-badge').textContent = community.badge;
  document.getElementById('community-badge').className = `${community.badgeColor} px-2 py-1 rounded-lg text-xs font-semibold`;
  document.getElementById('community-focus').textContent = community.focus;
  document.getElementById('community-focus-box').className = `${community.focusColor} rounded-xl p-3 mb-3`;
  
  // Update posts feed
  const postsContainer = document.getElementById('community-posts');
  let postsHTML = '';
  
  if (communityId === 'visa') {
    // For visa community, keep the original posts (including the flagged one)
    const visaPost1Id = getPostId(null, null);
    const visaPost1Saved = isPostSaved('visa_1');
    const visaPost2Saved = isPostSaved('visa_2');
    const visaPost3Saved = isPostSaved('visa_3');
    
    const bookmarkIcon1 = visaPost1Saved 
      ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>'
      : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>';
    const bookmarkColor1 = visaPost1Saved ? 'text-blue-600' : 'text-gray-400';
    
    const bookmarkIcon2 = visaPost2Saved 
      ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>'
      : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>';
    const bookmarkColor2 = visaPost2Saved ? 'text-blue-600' : 'text-gray-400';
    
    const bookmarkIcon3 = visaPost3Saved 
      ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>'
      : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>';
    const bookmarkColor3 = visaPost3Saved ? 'text-blue-600' : 'text-gray-400';
    
    postsHTML = `
      <!-- Verified Post -->
      <div onclick="openPost(1)" class="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
        <div class="flex items-start gap-3 mb-2">
          <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">JH</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-gray-900 text-sm">Jiin Hur</span>
              <span class="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">✓</span>
            </div>
            <p class="text-xs text-gray-600">TML '26 • 1h ago</p>
          </div>
          <button onclick="event.stopPropagation(); toggleSavePostFromList('visa', 1)" class="${bookmarkColor1} hover:text-blue-600 transition-colors">
            ${bookmarkIcon1}
          </button>
        </div>
        <h3 class="font-bold text-gray-900 mb-2">Best resources for CPT application?</h3>
        <p class="text-sm text-gray-700 mb-2">I found this comprehensive guide from OISS. Has all the forms and requirements clearly listed!</p>
        <div class="bg-blue-50 rounded-xl p-2 mb-2">
          <span class="text-xs text-blue-600 font-semibold">🔗 tc.columbia.edu/oiss/cpt-guide</span>
        </div>
        <div class="flex items-center gap-4 text-xs text-gray-600">
          <span>💬 3 comments</span>
          <span>👍 12 likes</span>
        </div>
      </div>

      <!-- Regular Post -->
      <div onclick="openPost(2)" class="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
        <div class="flex items-start gap-3 mb-2">
          <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">MP</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-gray-900 text-sm">Min Park</span>
            </div>
            <p class="text-xs text-gray-600">TML '27 • 2h ago</p>
          </div>
          <button onclick="event.stopPropagation(); toggleSavePostFromList('visa', 2)" class="${bookmarkColor2} hover:text-blue-600 transition-colors">
            ${bookmarkIcon2}
          </button>
        </div>
        <h3 class="font-bold text-gray-900 mb-2">Study group for EdTech?</h3>
        <p class="text-sm text-gray-700 mb-2">Looking to form a study group for the midterm. Anyone interested?</p>
        <div class="flex items-center gap-4 text-xs text-gray-600">
          <span>💬 3 comments</span>
          <span>👍 5 likes</span>
        </div>
      </div>

      <!-- FLAGGED Post -->
      <div onclick="openPost(3)" class="bg-red-50 border-2 border-red-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
        <div class="flex items-center gap-2 mb-3">
          <span class="bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold">⚠ Community Flagged</span>
          <span class="text-xs text-red-700 font-semibold">Multiple reports</span>
        </div>
        <div class="flex items-start gap-3 mb-2">
          <div class="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">??</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-gray-900 text-sm">Anonymous</span>
            </div>
            <p class="text-xs text-gray-600">4h ago</p>
          </div>
          <button onclick="event.stopPropagation(); toggleSavePostFromList('visa', 3)" class="${bookmarkColor3} hover:text-blue-600 transition-colors">
            ${bookmarkIcon3}
          </button>
        </div>
        <h3 class="font-bold text-gray-900 mb-2">URGENT: OPT applications suspended!</h3>
        <p class="text-sm text-gray-700 mb-2">My friend at NYU said USCIS stopped processing...</p>
        <div class="bg-yellow-50 border border-yellow-300 rounded-xl p-2 mb-2">
          <p class="text-xs text-yellow-800">⚠ No source provided • May contain misinformation</p>
        </div>
        <div class="flex items-center gap-4 text-xs text-gray-600">
          <span>💬 6 comments</span>
          <span class="text-red-600 font-semibold">🚨 5 reports</span>
        </div>
      </div>
    `;
  } else {
    // For other communities, use their custom posts
    community.posts.forEach((post, index) => {
      const verifiedBadge = post.verified ? '<span class="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">✓</span>' : '';
      const linkHTML = post.link ? `<div class="bg-blue-50 rounded-xl p-2 mb-2"><span class="text-xs text-blue-600 font-semibold">🔗 ${post.link}</span></div>` : '';
      
      // Check if post is flagged
      const isFlagged = post.flagged === true;
      const containerClass = isFlagged ? 'bg-red-50 border-2 border-red-200' : 'bg-white';
      const flaggedBanner = isFlagged ? `
        <div class="flex items-center gap-2 mb-3">
          <span class="bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold">⚠ Community Flagged</span>
          <span class="text-xs text-red-700 font-semibold">${post.reports || 'Multiple'} report${(post.reports || 0) !== 1 ? 's' : ''}</span>
        </div>
      ` : '';
      const warningBox = isFlagged ? `
        <div class="bg-yellow-50 border border-yellow-300 rounded-xl p-2 mb-2">
          <p class="text-xs text-yellow-800">⚠ No source provided • May contain misinformation</p>
        </div>
      ` : '';
      const reportsBadge = isFlagged ? `<span class="text-red-600 font-semibold">🚨 ${post.reports || 0} reports</span>` : '';
      
      // Create a unique post ID for each community post
      const postId = `${communityId}_${index}`;
      
      const isSaved = isPostSaved(postId);
      const bookmarkIcon = isSaved 
        ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>'
        : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>';
      const bookmarkColor = isSaved ? 'text-blue-600' : 'text-gray-400';
      
      postsHTML += `
        <div onclick="openCommunityPost('${communityId}', ${index})" class="${containerClass} rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
          ${flaggedBanner}
          <div class="flex items-start gap-3 mb-2">
            <div class="w-10 h-10 ${post.avatarBg} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">${post.avatar}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-gray-900 text-sm">${post.author}</span>
                ${verifiedBadge}
              </div>
              <p class="text-xs text-gray-600">${post.time}</p>
            </div>
            <button onclick="event.stopPropagation(); toggleSavePostFromList('${communityId}', ${index})" class="${bookmarkColor} hover:text-blue-600 transition-colors">
              ${bookmarkIcon}
            </button>
          </div>
          <h3 class="font-bold text-gray-900 mb-2">${post.title}</h3>
          <p class="text-sm text-gray-700 mb-2">${post.content}</p>
          ${linkHTML}
          ${warningBox}
          <div class="flex items-center gap-4 text-xs text-gray-600">
            <span>💬 ${post.comments} comments</span>
            ${reportsBadge || `<span>👍 ${post.likes} likes</span>`}
          </div>
        </div>
      `;
    });
  }
  
  postsContainer.innerHTML = postsHTML;
  
  showPage('community-detail');
}

// ==========================================
// POST INTERACTIONS
// ==========================================

function openPost(postId) {
  console.log('Opening post:', postId); // Debug log
  const posts = {
    1: { 
      author: 'Jiin Hur', 
      avatar: 'JH', 
      avatarBg: 'bg-blue-500',
      meta: 'TML \'26 • 1h ago',
      badge: true,
      title: 'Best resources for CPT application?',
      content: 'I found this comprehensive guide from OISS. Has all the forms and requirements clearly listed! This has been super helpful for my application process.',
      link: '🔗 tc.columbia.edu/oiss/cpt-guide',
      comments: []
    },
    2: {
      author: 'Min Park',
      avatar: 'MP',
      avatarBg: 'bg-purple-500',
      meta: 'TML \'27 • 2h ago',
      badge: false,
      title: 'Study group for EdTech?',
      content: 'Looking to form a study group for the midterm. Anyone interested? We can meet at the library or on Zoom. Planning for Tuesday or Thursday afternoons.',
      link: '',
      comments: []
    },
    3: {
      author: 'Anonymous',
      avatar: '??',
      avatarBg: 'bg-gray-400',
      meta: '4h ago',
      badge: 'flagged',
      title: 'URGENT: OPT applications suspended!',
      content: 'My friend at NYU said USCIS stopped processing OPT applications this week due to policy changes. Don\'t apply yet or you might lose your fee! They\'re reviewing international student work authorization.',
      link: '',
      comments: []
    }
  };
  
  const post = posts[postId];
  if (!post) return;
  
  document.getElementById('post-author-avatar').textContent = post.avatar;
  document.getElementById('post-author-avatar').className = `w-12 h-12 ${post.avatarBg} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`;
  document.getElementById('post-author-name').textContent = post.author;
  document.getElementById('post-author-meta').textContent = post.meta;
  document.getElementById('post-title').textContent = post.title;
  document.getElementById('post-content').textContent = post.content;
  
  const badge = document.getElementById('post-badge');
  if (post.badge === true) {
    badge.className = 'bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-bold';
    badge.textContent = '✓';
    badge.style.display = 'inline-block';
  } else if (post.badge === 'flagged') {
    badge.className = 'bg-red-600 text-white px-2 py-0.5 rounded-full text-xs font-bold';
    badge.textContent = '⚠';
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
  
  const linkEl = document.getElementById('post-link');
  if (post.link) {
    linkEl.innerHTML = `<span class="text-sm text-blue-600 font-semibold">${post.link}</span>`;
    linkEl.style.display = 'block';
  } else {
    linkEl.style.display = 'none';
  }
  
  // Show warning for flagged posts (post 3)
  const warningEl = document.getElementById('post-warning');
  const flaggedWarningEl = document.getElementById('flagged-warning');
  
  if (postId === 3) {
    // Show both the old warning and new flagged banner
    if (warningEl) warningEl.classList.remove('hidden');
    if (flaggedWarningEl) flaggedWarningEl.classList.remove('hidden');
  } else {
    if (warningEl) warningEl.classList.add('hidden');
    if (flaggedWarningEl) flaggedWarningEl.classList.add('hidden');
  }
  
  // Store current post ID for comment posting
  window.currentPostId = postId;
  window.currentCommunityId = null;
  window.currentPostIndex = null;
  
  // Update bookmark button state
  const savedPostId = `visa_${postId}`;
  updateBookmarkButton(isPostSaved(savedPostId));
  
  // Render comments
  const commentsContainer = document.querySelector('#post-detail .space-y-3');
  commentsContainer.innerHTML = renderComments(postId);
  
  showPage('post-detail');
}

// Open community posts (housing, career, etc.)
function openCommunityPost(communityId, postIndex) {
  console.log('Opening community post:', communityId, postIndex);
  
  // Reconstruct community data from showCommunity function's data structure
  const communityData = {
    career: {
      posts: [
        { author: 'Sarah Kim', avatar: 'SK', avatarBg: 'bg-green-500', verified: true, time: '2h ago', title: 'Career Fair Tips - Spring 2025', content: 'TC Career Services just posted the official guide for next week\'s career fair. Includes company list and booth map!', link: 'tc.columbia.edu/career-fair', comments: 8, likes: 24 },
        { author: 'David Chen', avatar: 'DC', avatarBg: 'bg-orange-500', verified: false, time: '5h ago', title: 'Anyone else applying to EdTech startups?', content: 'Looking for advice on how to break into the EdTech industry. Any tips on resume tailoring?', link: '', comments: 12, likes: 18 },
        { author: 'Emily Park', avatar: 'EP', avatarBg: 'bg-blue-500', verified: true, time: '1d ago', title: 'OPT Application Deadlines Reminder', content: 'OISS reminder: OPT applications must be filed within 90 days of graduation. Start early!', link: 'tc.columbia.edu/oiss/opt-timeline', comments: 5, likes: 31 },
        { author: 'Anonymous', avatar: '??', avatarBg: 'bg-gray-400', verified: false, flagged: true, time: '3h ago', title: 'FAKE JOB ALERT: "Easy OPT sponsorship" scam', content: 'Got an email from "TechCorp" offering instant OPT sponsorship for $500. They said no interview needed! Sounds too good to be true...', link: '', comments: 12, likes: 3, reports: 8 }
      ]
    },
    housing: {
      posts: [
        { author: 'TC Public Safety', avatar: 'PS', avatarBg: 'bg-red-500', verified: true, time: '1h ago', title: 'Neighborhood Safety Ratings Updated', content: 'Our monthly safety report is now available. Check crime statistics and safety tips for Morningside Heights and surrounding areas.', link: 'columbia.edu/publicsafety/neighborhoods', comments: 15, likes: 42 },
        { author: 'Maria Lopez', avatar: 'ML', avatarBg: 'bg-purple-500', verified: false, time: '4h ago', title: 'Looking for roommate - Hamilton Heights', content: 'Need one roommate for a 2BR apartment near campus. $1,100/month, available Jan 1st. Pet friendly!', link: '', comments: 9, likes: 6 },
        { author: 'Alex Wang', avatar: 'AW', avatarBg: 'bg-indigo-500', verified: true, time: '2d ago', title: 'Lease Agreement Review Resources', content: 'Student Legal Services offers free lease review appointments. Highly recommend before signing anything!', link: 'columbia.edu/legal-services', comments: 7, likes: 28 },
        { author: 'Anonymous', avatar: '??', avatarBg: 'bg-gray-400', verified: false, flagged: true, time: '5h ago', title: 'URGENT: Morningside Heights is unsafe!', content: 'My friend got robbed last night near campus. Police said crime is up 300% this month. Everyone should move out immediately!', link: '', comments: 18, likes: 5, reports: 12 }
      ]
    },
    academic: {
      posts: [
        { author: 'Prof. Johnson', avatar: 'PJ', avatarBg: 'bg-blue-600', verified: true, time: '3h ago', title: 'Final Exam Study Strategy Workshop', content: 'The Writing Center is hosting a study strategies workshop next Tuesday. Learn evidence-based techniques for exam prep.', link: 'tc.columbia.edu/writing-center/workshops', comments: 11, likes: 37 },
        { author: 'Rachel Park', avatar: 'RP', avatarBg: 'bg-purple-500', verified: false, time: '6h ago', title: 'Best courses for Spring semester?', content: 'Looking for recommendations on electives related to learning analytics and educational data science.', link: '', comments: 18, likes: 14 },
        { author: 'TC Library', avatar: 'TL', avatarBg: 'bg-teal-600', verified: true, time: '1d ago', title: 'Extended Hours During Finals Week', content: 'Gottesman Library will be open 24/7 from Dec 10-18. Quiet study rooms available by reservation.', link: 'library.tc.columbia.edu/hours', comments: 4, likes: 52 },
        { author: 'Anonymous', avatar: '??', avatarBg: 'bg-gray-400', verified: false, flagged: true, time: '4h ago', title: 'Professors selling exam answers on WhatsApp', content: 'Found a group where professors are selling final exam answers for $200. DM me for the link!', link: '', comments: 9, likes: 2, reports: 15 }
      ]
    },
    social: {
      posts: [
        { author: 'International Student Org', avatar: 'ISO', avatarBg: 'bg-pink-500', verified: true, time: '30min ago', title: 'Holiday Potluck - This Friday!', content: 'Bring a dish from your home country and join us for our annual holiday celebration. 6pm at the student lounge!', link: 'tc.columbia.edu/student-life/events', comments: 23, likes: 67 },
        { author: 'Kevin Liu', avatar: 'KL', avatarBg: 'bg-yellow-500', verified: false, time: '3h ago', title: 'Weekend hiking group?', content: 'Anyone interested in hiking Bear Mountain this Saturday? Planning to leave around 8am.', link: '', comments: 15, likes: 21 },
        { author: 'Jessica Brown', avatar: 'JB', avatarBg: 'bg-green-500', verified: false, time: '1d ago', title: 'Board game night at my place', content: 'Hosting a casual board game night next Thursday. All welcome! BYOB.', link: '', comments: 19, likes: 34 }
      ]
    },
    health: {
      posts: [
        { author: 'CPS Wellness', avatar: 'CPS', avatarBg: 'bg-teal-600', verified: true, time: '1h ago', title: 'Free Mental Health Screening Week', content: 'CPS is offering confidential mental health screenings Nov 11-15. No appointment needed, just drop by.', link: 'health.columbia.edu/cps', comments: 8, likes: 41 },
        { author: 'Dr. Martinez', avatar: 'DM', avatarBg: 'bg-blue-600', verified: true, time: '4h ago', title: 'Flu Shots Available at Health Services', content: 'Free flu vaccinations for all students. Walk-ins welcome Monday-Friday 9am-4pm.', link: 'health.columbia.edu/flu-clinic', comments: 6, likes: 29 },
        { author: 'Anonymous', avatar: '??', avatarBg: 'bg-gray-400', verified: false, time: '2d ago', title: 'Stress management tips?', content: 'Finals season is overwhelming. What do you all do to manage stress and anxiety?', link: '', comments: 24, likes: 45 },
        { author: 'Anonymous', avatar: '??', avatarBg: 'bg-gray-400', verified: false, flagged: true, time: '6h ago', title: 'CPS therapy sessions are being recorded', content: 'Heard from a friend that CPS secretly records all therapy sessions and shares them with administration. This is a privacy violation!', link: '', comments: 7, likes: 1, reports: 9 }
      ]
    }
  };
  
  const community = communityData[communityId];
  if (!community || !community.posts[postIndex]) {
    console.error('Post not found');
    return;
  }
  
  const post = community.posts[postIndex];
  
  // Update post detail view
  document.getElementById('post-author-avatar').textContent = post.avatar;
  document.getElementById('post-author-avatar').className = `w-12 h-12 ${post.avatarBg} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`;
  document.getElementById('post-author-name').textContent = post.author;
  document.getElementById('post-author-meta').textContent = post.time;
  document.getElementById('post-title').textContent = post.title;
  document.getElementById('post-content').textContent = post.content;
  
  const badge = document.getElementById('post-badge');
  if (post.verified) {
    badge.className = 'bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-bold';
    badge.textContent = '✓';
    badge.style.display = 'inline-block';
  } else if (post.flagged) {
    badge.className = 'bg-red-600 text-white px-2 py-0.5 rounded-full text-xs font-bold';
    badge.textContent = '⚠';
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
  
  const linkEl = document.getElementById('post-link');
  if (linkEl) {
    if (post.link) {
      linkEl.innerHTML = `<span class="text-sm text-blue-600 font-semibold">🔗 ${post.link}</span>`;
      linkEl.style.display = 'block';
    } else {
      linkEl.style.display = 'none';
    }
  }
  
  // Show warning for flagged posts
  const warningEl = document.getElementById('post-warning');
  const flaggedWarningEl = document.getElementById('flagged-warning');
  if (post.flagged) {
    if (warningEl) warningEl.classList.remove('hidden');
    if (flaggedWarningEl) flaggedWarningEl.classList.remove('hidden');
  } else {
  if (warningEl) warningEl.classList.add('hidden');
  if (flaggedWarningEl) flaggedWarningEl.classList.add('hidden');
  }
  
  // Store current post info for comment posting
  window.currentPostId = null;
  window.currentCommunityId = communityId;
  window.currentPostIndex = postIndex;
  
  // Update bookmark button state
  const postId = getPostId(communityId, postIndex);
  updateBookmarkButton(isPostSaved(postId));
  
  // Update like/comment counts
  const likeCountEl = document.getElementById('like-count');
  const commentCountEl = document.getElementById('comment-count');
  if (likeCountEl) likeCountEl.textContent = post.likes;
  if (commentCountEl) commentCountEl.textContent = `${post.comments} comments`;
  
  // Render actual comments based on community and post index
  const commentsContainer = document.querySelector('#post-detail .space-y-3');
  if (commentsContainer) {
    // Map community/post index to commentsData ID
    let postDataId = null;
    
    // Career posts
    if (communityId === 'career' && postIndex === 0) postDataId = 4; // Career Fair Tips
    if (communityId === 'career' && postIndex === 1) postDataId = 11; // David Chen - EdTech startups
    if (communityId === 'career' && postIndex === 2) postDataId = 12; // Emily Park - OPT deadlines
    if (communityId === 'career' && postIndex === 3) postDataId = 19; // Anonymous - FAKE JOB ALERT scam
    
    // Housing posts  
    if (communityId === 'housing' && postIndex === 0) postDataId = 9; // TC Public Safety - Safety Ratings
    if (communityId === 'housing' && postIndex === 1) postDataId = 5; // Maria Lopez roommate
    if (communityId === 'housing' && postIndex === 2) postDataId = 10; // Alex Wang - Lease Review
    if (communityId === 'housing' && postIndex === 3) postDataId = 20; // Anonymous - URGENT: Morningside Heights unsafe
    
    // Academic posts
    if (communityId === 'academic' && postIndex === 0) postDataId = 13; // Prof. Johnson - Study Strategy Workshop
    if (communityId === 'academic' && postIndex === 1) postDataId = 14; // Rachel Park - Best courses
    if (communityId === 'academic' && postIndex === 2) postDataId = 15; // TC Library - Extended hours
    if (communityId === 'academic' && postIndex === 3) postDataId = 21; // Anonymous - Professors selling exam answers
    
    // Social posts
    if (communityId === 'social' && postIndex === 0) postDataId = 6; // Holiday Potluck
    if (communityId === 'social' && postIndex === 1) postDataId = 7; // Kevin Liu hiking
    if (communityId === 'social' && postIndex === 2) postDataId = 8; // Jessica Brown board game
    
    // Health posts
    if (communityId === 'health' && postIndex === 0) postDataId = 16; // CPS Wellness - Mental Health Screening
    if (communityId === 'health' && postIndex === 1) postDataId = 17; // Dr. Martinez - Flu Shots
    if (communityId === 'health' && postIndex === 2) postDataId = 18; // Anonymous - Stress management
    if (communityId === 'health' && postIndex === 3) postDataId = 22; // Anonymous - CPS therapy sessions recorded
    
    // For posts without comment data, show empty state but still allow clicking
    if (postDataId && commentsData[postDataId]) {
      commentsContainer.innerHTML = renderComments(postDataId);
    } else {
      // Show empty comments state but indicate comments can be added
      commentsContainer.innerHTML = '<h4 class="font-bold text-gray-900 text-base mb-2">Comments</h4><div class="bg-gray-50 rounded-2xl p-4 text-center text-gray-500 text-sm">No comments yet. Be the first to comment!</div>';
    }
  }
  
  // Reset like state
  userLikeState = null;
  const likeBtn = document.getElementById('like-button');
  const dislikeBtn = document.getElementById('dislike-button');
  if (likeBtn) {
    likeBtn.classList.remove('text-blue-600');
    likeBtn.classList.add('text-gray-600');
  }
  if (dislikeBtn) {
    dislikeBtn.classList.remove('text-red-600');
    dislikeBtn.classList.add('text-gray-600');
  }
  
  showPage('post-detail');
}


// ==========================================
// SCHEDULE MANAGEMENT
// ==========================================

let currentScheduleView = { type: 'self', name: 'Haetal Kim', email: null };

function switchSchedule(type, name, email) {
  const titleEl = document.getElementById('schedule-title');
  const errorEl = document.getElementById('schedule-error');
  const gridEl = document.getElementById('schedule-grid');
  const profileBtnContainer = document.getElementById('schedule-view-profile-container');
  
  currentScheduleView = { type, name, email };
  
  if (type === 'self') {
    titleEl.textContent = 'My Schedule';
    if (profileBtnContainer) profileBtnContainer.classList.add('hidden');
    errorEl.classList.add('hidden');
    gridEl.classList.remove('hidden');
    renderSchedule(schedules.self);
  } else {
    titleEl.textContent = name + "'s Schedule";
    
    // Check if schedule is shared
    const connections = getConnections();
    const connection = email ? connections.find(c => c.email === email) : null;
    const hasScheduleAccess = connection && connection.scheduleShared;
    
    if (!hasScheduleAccess) {
      // No schedule access, but show profile button since they're academically connected
    errorEl.classList.remove('hidden');
    gridEl.classList.add('hidden');
      if (profileBtnContainer) profileBtnContainer.classList.add('hidden');
  } else {
      // Has schedule access
    errorEl.classList.add('hidden');
    gridEl.classList.remove('hidden');
      if (profileBtnContainer && email) {
        profileBtnContainer.classList.remove('hidden');
      } else if (profileBtnContainer) {
        profileBtnContainer.classList.add('hidden');
      }
    renderSchedule(schedules[type] || schedules.self);
    }
  }
  
  // Re-render connected students list to update highlighting
  renderConnectedStudents();
}

function viewScheduleConnectionProfile() {
  if (currentScheduleView.email) {
    const connections = getConnections();
    const connection = connections.find(c => c.email === currentScheduleView.email);
    if (connection) {
      showConnectionProfileModal(connection);
    }
  }
}

// ==========================================
// MODAL CONTROLS
// ==========================================

function openPostModal() {
  document.getElementById('post-modal').classList.add('active');
}

function closePostModal() {
  document.getElementById('post-modal').classList.remove('active');
  document.getElementById('verification-checkbox').checked = false;
  document.getElementById('post-anon-checkbox').checked = false;
  document.getElementById('source-input').classList.add('hidden');
}

function openReportModal(event, postId) {
  if (event) event.stopPropagation();
  document.getElementById('report-modal').classList.add('active');
}

function closeReportModal() {
  document.getElementById('report-modal').classList.remove('active');
}

function openScheduleInfoModal() {
  document.getElementById('schedule-info-modal').classList.add('active');
}

function closeScheduleInfoModal() {
  document.getElementById('schedule-info-modal').classList.remove('active');
}

function openTrustScoreModal() {
  document.getElementById('trust-score-modal').classList.add('active');
}

function closeTrustScoreModal() {
  document.getElementById('trust-score-modal').classList.remove('active');
}

// Toggle community description expand/collapse
function toggleCommunityDescription() {
  const descriptionSection = document.getElementById('community-description-section');
  const expandBtn = document.getElementById('community-expand-btn');
  
  if (descriptionSection.classList.contains('hidden')) {
    descriptionSection.classList.remove('hidden');
    expandBtn.querySelector('svg').classList.add('rotate-180');
  } else {
    descriptionSection.classList.add('hidden');
    expandBtn.querySelector('svg').classList.remove('rotate-180');
  }
}

// Search posts in community
function searchCommunityPosts(searchTerm) {
  const searchInput = document.getElementById('community-search-input');
  const clearBtn = document.getElementById('community-search-clear');
  const posts = document.querySelectorAll('#community-posts > div');
  
  // Show/hide clear button
  if (searchTerm.trim().length > 0) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }
  
  // If search is empty, show all posts (respect current filter)
  if (!searchTerm || searchTerm.trim().length === 0) {
    // Check which filter tab is active
    const activeFilter = document.querySelector('.filter-tab.active');
    if (activeFilter) {
      const filterText = activeFilter.textContent.trim();
      if (filterText.includes('Verified')) {
        filterPosts('verified');
      } else if (filterText.includes('Flagged')) {
        filterPosts('flagged');
      } else {
        filterPosts('all');
      }
    } else {
      // No active filter, show all
      posts.forEach(post => {
        post.style.display = 'block';
      });
    }
    return;
  }
  
  // Search through posts
  const searchLower = searchTerm.toLowerCase().trim();
  posts.forEach(post => {
    // Get post text content
    const title = post.querySelector('h3')?.textContent?.toLowerCase() || '';
    const content = post.querySelector('p.text-sm')?.textContent?.toLowerCase() || '';
    const author = post.querySelector('.font-bold')?.textContent?.toLowerCase() || '';
    
    // Check if search term matches
    const matches = title.includes(searchLower) || 
                   content.includes(searchLower) || 
                   author.includes(searchLower);
    
    // Also check if it matches the current filter
    const activeFilter = document.querySelector('.filter-tab.active');
    let passesFilter = true;
    
    if (activeFilter) {
      const filterText = activeFilter.textContent.trim();
      if (filterText.includes('Verified')) {
        const hasVerifiedBadge = post.querySelector('.bg-green-600');
        passesFilter = hasVerifiedBadge !== null;
      } else if (filterText.includes('Flagged')) {
        const isFlagged = post.classList.contains('border-red-200');
        passesFilter = isFlagged;
      }
    }
    
    post.style.display = (matches && passesFilter) ? 'block' : 'none';
  });
}

// Clear search
function clearCommunitySearch() {
  const searchInput = document.getElementById('community-search-input');
  searchInput.value = '';
  searchCommunityPosts('');
}

// Filter posts in community
function filterPosts(filter) {
  // Update active tab styling
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.remove('active', 'bg-blue-600', 'text-white');
    tab.classList.add('bg-gray-100', 'text-gray-700');
  });
  event.target.classList.add('active', 'bg-blue-600', 'text-white');
  event.target.classList.remove('bg-gray-100', 'text-gray-700');
  
  // Get search term if any
  const searchInput = document.getElementById('community-search-input');
  const searchTerm = searchInput ? searchInput.value.trim() : '';
  
  // Get all posts
  const posts = document.querySelectorAll('#community-posts > div');
  
  posts.forEach(post => {
    let shouldShow = false;
    
    if (filter === 'all') {
      shouldShow = true;
    } else if (filter === 'verified') {
      // Show only posts with green verified badge
      const hasVerifiedBadge = post.querySelector('.bg-green-600');
      shouldShow = hasVerifiedBadge !== null;
    } else if (filter === 'flagged') {
      // Show only posts with red border (flagged)
      const isFlagged = post.classList.contains('border-red-200');
      shouldShow = isFlagged;
    }
    
    // Also apply search filter if any
    if (shouldShow && searchTerm.length > 0) {
      const title = post.querySelector('h3')?.textContent?.toLowerCase() || '';
      const content = post.querySelector('p.text-sm')?.textContent?.toLowerCase() || '';
      const author = post.querySelector('.font-bold')?.textContent?.toLowerCase() || '';
      const searchLower = searchTerm.toLowerCase();
      shouldShow = title.includes(searchLower) || content.includes(searchLower) || author.includes(searchLower);
    }
    
    post.style.display = shouldShow ? 'block' : 'none';
  });
}

// Like/Dislike functionality
let userLikeState = null; // null, 'like', or 'dislike'

function likePost(event) {
  event.stopPropagation();
  const likeCountEl = document.getElementById('like-count');
  const dislikeCountEl = document.getElementById('dislike-count');
  const likeBtn = document.getElementById('like-button');
  const dislikeBtn = document.getElementById('dislike-button');
  
  let likeCount = parseInt(likeCountEl.textContent);
  let dislikeCount = parseInt(dislikeCountEl.textContent);
  
  if (userLikeState === 'like') {
    // Unlike
    likeCount--;
    userLikeState = null;
    likeBtn.classList.remove('text-blue-600');
    likeBtn.classList.add('text-gray-600');
  } else {
    // Like
    if (userLikeState === 'dislike') {
      dislikeCount--;
      dislikeBtn.classList.remove('text-red-600');
      dislikeBtn.classList.add('text-gray-600');
    }
    likeCount++;
    userLikeState = 'like';
    likeBtn.classList.remove('text-gray-600');
    likeBtn.classList.add('text-blue-600');
  }
  
  likeCountEl.textContent = likeCount;
  dislikeCountEl.textContent = dislikeCount;
}

function dislikePost(event) {
  event.stopPropagation();
  const likeCountEl = document.getElementById('like-count');
  const dislikeCountEl = document.getElementById('dislike-count');
  const likeBtn = document.getElementById('like-button');
  const dislikeBtn = document.getElementById('dislike-button');
  
  let likeCount = parseInt(likeCountEl.textContent);
  let dislikeCount = parseInt(dislikeCountEl.textContent);
  
  if (userLikeState === 'dislike') {
    // Un-dislike
    dislikeCount--;
    userLikeState = null;
    dislikeBtn.classList.remove('text-red-600');
    dislikeBtn.classList.add('text-gray-600');
  } else {
    // Dislike
    if (userLikeState === 'like') {
      likeCount--;
      likeBtn.classList.remove('text-blue-600');
      likeBtn.classList.add('text-gray-600');
    }
    dislikeCount++;
    userLikeState = 'dislike';
    dislikeBtn.classList.remove('text-gray-600');
    dislikeBtn.classList.add('text-red-600');
  }
  
  likeCountEl.textContent = likeCount;
  dislikeCountEl.textContent = dislikeCount;
}

function toggleVerification() {
  document.getElementById('source-input').classList.toggle('hidden');
}

function toggleCommentVerification() {
  document.getElementById('comment-source-input').classList.toggle('hidden');
}

// ==========================================
// USER ACTIONS
// ==========================================

function submitPost() {
  showToast('Post submitted for review!');
  closePostModal();
}

function submitReport() {
  showToast('Report submitted. Thank you for helping keep our community safe.');
  closeReportModal();
}

function postComment() {
  const commentInput = document.getElementById('comment-input');
  const commentText = commentInput.value.trim();
  const sourceCheckbox = document.getElementById('comment-verification-checkbox');
  const sourceInput = document.getElementById('comment-source-url');
  
  // Validate comment text
  if (!commentText) {
    commentInput.classList.add('error-shake');
    setTimeout(() => commentInput.classList.remove('error-shake'), 500);
    return;
  }
  
  // Get source URL if checkbox is checked
  const sourceUrl = sourceCheckbox.checked ? sourceInput.value.trim() : '';
  
  // Determine which post we're commenting on
  let postDataId = null;
  
  if (window.currentPostId) {
    // Commenting on visa community posts (1, 2, 3)
    postDataId = window.currentPostId;
  } else if (window.currentCommunityId && window.currentPostIndex !== null) {
    // Commenting on other community posts
    const communityId = window.currentCommunityId;
    const postIndex = window.currentPostIndex;
    
    // Map to postDataId
    if (communityId === 'career' && postIndex === 0) postDataId = 4;
    if (communityId === 'career' && postIndex === 1) postDataId = 11;
    if (communityId === 'career' && postIndex === 2) postDataId = 12;
    if (communityId === 'career' && postIndex === 3) postDataId = 19;
    if (communityId === 'housing' && postIndex === 0) postDataId = 9;
    if (communityId === 'housing' && postIndex === 1) postDataId = 5;
    if (communityId === 'housing' && postIndex === 2) postDataId = 10;
    if (communityId === 'housing' && postIndex === 3) postDataId = 20;
    if (communityId === 'academic' && postIndex === 0) postDataId = 13;
    if (communityId === 'academic' && postIndex === 1) postDataId = 14;
    if (communityId === 'academic' && postIndex === 2) postDataId = 15;
    if (communityId === 'academic' && postIndex === 3) postDataId = 21;
    if (communityId === 'social' && postIndex === 0) postDataId = 6;
    if (communityId === 'social' && postIndex === 1) postDataId = 7;
    if (communityId === 'social' && postIndex === 2) postDataId = 8;
    if (communityId === 'health' && postIndex === 0) postDataId = 16;
    if (communityId === 'health' && postIndex === 1) postDataId = 17;
    if (communityId === 'health' && postIndex === 2) postDataId = 18;
    if (communityId === 'health' && postIndex === 3) postDataId = 22;
  }
  
  if (postDataId && commentsData[postDataId]) {
    // Create new comment object
    const newComment = {
      author: 'Haetal',  // Current user
      initials: 'HK',
      color: 'bg-blue-600',
      text: commentText,
      time: 'Just now',
      verified: sourceUrl ? true : false,
      link: sourceUrl || undefined
    };
    
    // Add comment to the beginning of the array
    commentsData[postDataId].unshift(newComment);
    
    // Re-render comments
    const commentsContainer = document.querySelector('#post-detail .space-y-3');
    if (commentsContainer) {
      commentsContainer.innerHTML = renderComments(postDataId);
    }
    
    // Update comment count
    const commentCountEl = document.getElementById('comment-count');
    if (commentCountEl) {
      const currentCount = parseInt(commentCountEl.textContent);
      commentCountEl.textContent = `${currentCount + 1} comments`;
    }
    
    // Clear the input
    commentInput.value = '';
    sourceInput.value = '';
    sourceCheckbox.checked = false;
    document.getElementById('comment-source-input').classList.add('hidden');
    
    // Show success message
    showToast(sourceUrl ? 'Comment posted! Source will be verified by moderators.' : 'Comment posted successfully!');
    
    // Add success animation to the comment input
    commentInput.classList.add('success-pulse');
    setTimeout(() => commentInput.classList.remove('success-pulse'), 500);
  }
}

function showToast(message) {
  const toast = document.getElementById('success-toast');
  const messageEl = document.getElementById('toast-message');
  messageEl.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('success-pulse');
  
  setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('success-pulse');
  }, 3000);
}

// ==========================================
// CHAT
// ==========================================

// Chat data structure: { email: { name, initials, avatarColor, messages: [{sender, text, time}] } }
function getChats() {
  if (!isLoggedIn || !currentUserEmail) return {};
  const chatsStr = localStorage.getItem(`missedChats_${currentUserEmail}`);
  return chatsStr ? JSON.parse(chatsStr) : {};
}

function saveChats(chats) {
  if (!isLoggedIn || !currentUserEmail) return;
  localStorage.setItem(`missedChats_${currentUserEmail}`, JSON.stringify(chats));
}

// Helper functions for connections (needed by initializeDefaultConversations)
function getConnections() {
  if (!isLoggedIn || !currentUserEmail) return [];
  const connectionsStr = localStorage.getItem(`missedConnections_${currentUserEmail}`);
  return connectionsStr ? JSON.parse(connectionsStr) : [];
}

function getConnectionsForUser(email) {
  const connectionsStr = localStorage.getItem(`missedConnections_${email}`);
  return connectionsStr ? JSON.parse(connectionsStr) : [];
}

// Initialize default conversations
function initializeDefaultConversations() {
  const chats = getChats();
  
  // TML CA conversation
  if (!chats['admin']) {
    chats['admin'] = {
      name: 'TML CA',
      initials: 'TC',
      avatarColor: 'bg-blue-600',
      messages: [
        { sender: 'TML CA', text: 'We\'ve received your report and are working on it with OISS. Thank you for helping keep our community safe!', time: '10min ago' },
        { sender: 'You', text: 'Thanks for the update!', time: '5min ago' }
      ]
    };
  }
  
  // Initialize conversations for connections if they don't have messages yet
  const connections = getConnections();
  connections.forEach(connection => {
    if (!chats[connection.email] || !chats[connection.email].messages || chats[connection.email].messages.length === 0) {
      const initials = connection.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      const avatarColors = {
        'JH': 'bg-blue-500',
        'MP': 'bg-purple-600',
        'LC': 'bg-pink-600',
        'HK': 'bg-teal-600'
      };
      
      // Generate basic conversation based on connection
      let messages = [];
      if (connection.email === 'jh4887@tc.columbia.edu') {
        messages = [
          { sender: connection.name, text: 'See you at the study group!', time: '1h ago' },
          { sender: 'You', text: 'Looking forward to it!', time: '45min ago' }
        ];
      } else if (connection.email === 'minpark@tc.columbia.edu') {
        messages = [
          { sender: connection.name, text: 'Thanks for sharing that link!', time: '2h ago' },
          { sender: 'You', text: 'No problem! Hope it helps.', time: '1h ago' }
        ];
      } else if (connection.email === 'lizychoi@columbia.edu') {
        messages = [
          { sender: connection.name, text: 'Did you see the Coursera posting?', time: '1d ago' },
          { sender: 'You', text: 'Yes! I applied yesterday.', time: '12h ago' }
        ];
      } else {
        // Generic conversation for other connections
        messages = [
          { sender: connection.name, text: `Hi! Nice to connect with you through Academic Handshake.`, time: '2h ago' },
          { sender: 'You', text: 'Nice to meet you too!', time: '1h ago' }
        ];
      }
      
      chats[connection.email] = {
        name: connection.name,
        initials: initials,
        avatarColor: avatarColors[initials] || 'bg-gray-600',
        messages: messages
      };
    }
  });
  
  saveChats(chats);
}

function getOrCreateChat(email, name) {
  const chats = getChats();
  if (!chats[email]) {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const avatarColors = {
      'JH': 'bg-blue-500',
      'MP': 'bg-purple-600',
      'LC': 'bg-pink-600',
      'HK': 'bg-teal-600'
    };
    chats[email] = {
      name: name,
      initials: initials,
      avatarColor: avatarColors[initials] || 'bg-gray-600',
      messages: []
    };
    saveChats(chats);
  }
  return chats[email];
}

function openChat(chatId) {
  // Handle special chat IDs (admin, jiin, min, lizy)
  if (chatId === 'admin') {
    openChatDetail('admin', 'TML CA', 'TC', 'bg-blue-600');
    return;
  }
  
  // Map chat IDs to emails
  const chatIdToEmail = {
    'jiin': 'jh4887@tc.columbia.edu',
    'min': 'minpark@tc.columbia.edu',
    'lizy': 'lizychoi@columbia.edu'
  };
  
  const email = chatIdToEmail[chatId];
  if (email) {
    const connections = getConnections();
    const connection = connections.find(c => c.email === email);
    if (connection) {
      openChatWithConnection(email, connection.name);
    } else {
      // For static chats, create a temporary chat entry
      const staticChatData = {
        'jiin': { name: 'Jiin Hur', initials: 'JH', color: 'bg-blue-500' },
        'min': { name: 'Min Park', initials: 'MP', color: 'bg-purple-600' },
        'lizy': { name: 'Lizy Choi', initials: 'LC', color: 'bg-pink-600' }
      };
      const chatData = staticChatData[chatId];
      if (chatData) {
        openChatDetail(email, chatData.name, chatData.initials, chatData.color);
      } else {
        showPage('chat');
      }
    }
  } else {
    showPage('chat');
  }
}

function openChatWithConnection(email, name) {
  // Get or create chat
  const chat = getOrCreateChat(email, name);
  
  // Open chat detail view
  openChatDetail(email, chat.name, chat.initials, chat.avatarColor);
}

function openChatDetail(chatId, name, initials, avatarColor) {
  // Initialize default conversations if needed
  initializeDefaultConversations();
  
  // Get chat data
  const chats = getChats();
  let chat;
  
  if (chatId === 'admin') {
    chat = chats['admin'];
  } else {
    chat = chats[chatId];
  }
  
  if (!chat) {
    // Create a new chat if it doesn't exist
    chat = getOrCreateChat(chatId, name);
  }
  
  // Update chat detail header
  document.getElementById('chat-detail-name').textContent = chat.name;
  document.getElementById('chat-detail-avatar').textContent = chat.initials;
  document.getElementById('chat-detail-avatar').className = `w-10 h-10 ${chat.avatarColor} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`;
  
  // Store current chat ID for sending messages
  window.currentChatId = chatId;
  
  // Render messages
  renderChatMessages(chatId);
  
  // Show chat detail page
  showPage('chat-detail');
}

function renderChatMessages(chatId) {
  const messagesContainer = document.getElementById('chat-messages-container');
  if (!messagesContainer) return;
  
  const chats = getChats();
  let chat;
  
  if (chatId === 'admin') {
    chat = chats['admin'];
  } else {
    chat = chats[chatId];
  }
  
  if (!chat || !chat.messages || chat.messages.length === 0) {
    messagesContainer.innerHTML = '<div class="text-center text-gray-500 text-sm py-8">No messages yet. Start the conversation!</div>';
    return;
  }
  
  let html = '';
  chat.messages.forEach(message => {
    const isYou = message.sender === 'You';
    html += `
      <div class="flex ${isYou ? 'justify-end' : 'justify-start'}">
        <div class="max-w-[75%] ${isYou ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'} rounded-2xl px-4 py-2.5 shadow-sm">
          <p class="text-sm">${message.text}</p>
          <p class="text-xs ${isYou ? 'text-blue-100' : 'text-gray-500'} mt-1">${message.time}</p>
        </div>
      </div>
    `;
  });
  
  messagesContainer.innerHTML = html;
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendChatMessage() {
  const input = document.getElementById('chat-message-input');
  const text = input.value.trim();
  if (!text || !window.currentChatId) return;
  
  const chats = getChats();
  let chat;
  
  if (window.currentChatId === 'admin') {
    chat = chats['admin'];
  } else {
    chat = chats[window.currentChatId];
  }
  
  if (!chat) return;
  
  // Add new message
  if (!chat.messages) chat.messages = [];
  chat.messages.push({
    sender: 'You',
    text: text,
    time: 'Just now'
  });
  
  saveChats(chats);
  
  // Clear input
  input.value = '';
  
  // Re-render messages
  renderChatMessages(window.currentChatId);
  
  // Update chat list if visible
  if (document.getElementById('chat').classList.contains('active')) {
    renderChatList();
  }
}

function renderChatList() {
  const chatContainer = document.getElementById('chat-list-container');
  if (!chatContainer) return;
  
  const chats = getChats();
  const connections = getConnections();
  
  let html = '';
  
  // Add TML CA chat (static)
  const adminChat = chats['admin'];
  const adminLastMessage = adminChat && adminChat.messages && adminChat.messages.length > 0 
    ? adminChat.messages[adminChat.messages.length - 1]
    : null;
  const adminLastMessageText = adminLastMessage ? adminLastMessage.text : 'We\'ve received your report and are working on it with OISS...';
  const adminLastMessageTime = adminLastMessage ? adminLastMessage.time : '10min ago';
  
  html += `
    <div onclick="openChat('admin')" class="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:bg-gray-50 transition">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">TC</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1">
            <div class="font-bold text-gray-900">TML CA</div>
            <div class="text-xs text-gray-500">${adminLastMessageTime}</div>
          </div>
          <p class="text-sm text-gray-600 truncate">${adminLastMessageText}</p>
        </div>
      </div>
    </div>
  `;
  
  // Add chats for connections
  connections.forEach(connection => {
    const chat = chats[connection.email];
    if (chat) {
      const lastMessage = chat.messages && chat.messages.length > 0 
        ? chat.messages[chat.messages.length - 1]
        : null;
      const lastMessageText = lastMessage ? lastMessage.text : 'Start a conversation...';
      const lastMessageTime = lastMessage ? lastMessage.time : '';
      
      html += `
        <div onclick="openChatWithConnection('${connection.email}', '${connection.name.replace(/'/g, "\\'")}')" class="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:bg-gray-50 transition">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 ${chat.avatarColor} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">${chat.initials}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <div class="font-bold text-gray-900">${chat.name}</div>
                ${lastMessageTime ? `<div class="text-xs text-gray-500">${lastMessageTime}</div>` : ''}
              </div>
              <p class="text-sm text-gray-600 truncate">${lastMessageText}</p>
            </div>
          </div>
        </div>
      `;
    }
  });
  
  // Add static chats for Jiin and Lizy (if they're not in connections yet)
  const staticChats = [
    { id: 'jiin', email: 'jh4887@tc.columbia.edu', name: 'Jiin Hur', initials: 'JH', color: 'bg-blue-500', message: 'See you at the study group!', time: '1h ago' },
    { id: 'lizy', email: 'lizychoi@columbia.edu', name: 'Lizy Choi', initials: 'LC', color: 'bg-pink-600', message: 'Did you see the Coursera posting?', time: '1d ago' }
  ];
  
  staticChats.forEach(staticChat => {
    const hasConnection = connections.find(c => c.email === staticChat.email);
    const hasChat = chats[staticChat.email];
    
    if (!hasConnection && !hasChat) {
      html += `
        <div onclick="openChat('${staticChat.id}')" class="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:bg-gray-50 transition">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 ${staticChat.color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">${staticChat.initials}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <div class="font-bold text-gray-900">${staticChat.name}</div>
                <div class="text-xs text-gray-500">${staticChat.time}</div>
              </div>
              <p class="text-sm text-gray-600 truncate">${staticChat.message}</p>
            </div>
          </div>
        </div>
      `;
    }
  });
  
  chatContainer.innerHTML = html;
}

// ==========================================
// LOGOUT
// ==========================================

function handleLogout(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  if (confirm('Are you sure you want to log out?')) {
    try {
      localStorage.removeItem('missedLoggedIn');
      localStorage.removeItem('missedUserEmail');
      // Reset onboarding so tutorial is accessible again on next login
      localStorage.removeItem('missedOnboardingComplete');
      
      // Update global variables
      isLoggedIn = false;
      currentUserEmail = '';
      hasSeenOnboarding = false;
      
      // Hide all pages and app content
      document.querySelectorAll('.page-view').forEach(v => {
        v.classList.remove('active');
        v.style.display = 'none';
      });
      
      // Hide onboarding
      const onboarding = document.getElementById('onboarding');
      if (onboarding) {
        onboarding.classList.remove('active');
        onboarding.style.display = 'none';
        onboarding.classList.remove('fade-out');
        // Reset to first screen
        document.querySelectorAll('.onboarding-screen').forEach((screen, index) => {
          if (index === 0) {
            screen.classList.add('active');
          } else {
            screen.classList.remove('active');
          }
        });
        currentOnboardingScreen = 1;
      }
      
      // Close any open modals
      document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
      
      // Hide main app content
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.style.display = 'none';
      }
      
      // Hide bottom navigation
      const bottomNav = document.querySelector('nav');
      if (bottomNav) {
        bottomNav.style.display = 'none';
      }
      
      // Show login page - ensure it's fully visible
      const loginPage = document.getElementById('login-page');
      if (loginPage) {
        // Remove fade-out class and reset all styles
        loginPage.classList.remove('fade-out');
        loginPage.style.opacity = '1';
        loginPage.style.pointerEvents = 'auto';
        loginPage.style.display = 'flex';
        // Add active class to show the login page
        loginPage.classList.add('active');
      }
      
      // Reset forms
      const signinForm = document.getElementById('signin-form');
      const signupForm = document.getElementById('signup-email-form');
      if (signinForm) signinForm.reset();
      if (signupForm) signupForm.reset();
      
      // Reset auth tabs to sign in
      switchAuthTab('signin');
      
      showToast('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Error during logout. Please refresh the page.');
    }
  }
}

// ==========================================
// PROFILE MANAGEMENT
// ==========================================

function loadUserProfile() {
  if (!isLoggedIn || !currentUserEmail) return;
  
  const userDataStr = localStorage.getItem(`missedUser_${currentUserEmail}`);
  if (!userDataStr) return;
  
  const userData = JSON.parse(userDataStr);
  
  // Update profile card on home page
  const profileCardName = document.getElementById('profile-card-name');
  const profileCardMajor = document.getElementById('profile-card-major');
  const profileCardEmail = document.getElementById('profile-card-email');
  
  if (profileCardName) {
    const firstName = userData.name.split(' ')[0];
    profileCardName.textContent = `Hi, ${firstName}!`;
  }
  if (profileCardMajor) profileCardMajor.textContent = userData.major || userData.program || '';
  if (profileCardEmail) profileCardEmail.textContent = currentUserEmail;
  
  // Update profile page if visible
  updateProfilePage(userData);
}

function updateProfilePage(userData) {
  const nameEl = document.getElementById('profile-name-display');
  const majorEl = document.getElementById('profile-major-display');
  const emailEl = document.getElementById('profile-email-display');
  const programEl = document.getElementById('profile-program-display');
  const degreeEl = document.getElementById('profile-degree-display');
  const yearEl = document.getElementById('profile-year-display');
  const majorFullEl = document.getElementById('profile-major-full-display');
  const researchEl = document.getElementById('profile-research-display');
  const labEl = document.getElementById('profile-lab-display');
  const linkedinEl = document.getElementById('profile-linkedin-display');
  const labContainer = document.getElementById('profile-lab-container');
  const linkedinContainer = document.getElementById('profile-linkedin-container');
  
  if (nameEl) nameEl.textContent = userData.name || 'User';
  if (majorEl) majorEl.textContent = userData.major || userData.program || '';
  if (emailEl) emailEl.textContent = currentUserEmail;
  if (programEl) programEl.textContent = getProgramName(userData.program) || '-';
  if (degreeEl) degreeEl.textContent = getDegreeName(userData.degree) || '-';
  if (yearEl) yearEl.textContent = userData.year || '-';
  if (majorFullEl) majorFullEl.textContent = userData.major || '-';
  if (researchEl) researchEl.textContent = userData.researchInterest || '-';
  
  if (userData.lab && labEl && labContainer) {
    labEl.textContent = userData.lab;
    labContainer.classList.remove('hidden');
  } else if (labContainer) {
    labContainer.classList.add('hidden');
  }
  
  if (userData.linkedin && linkedinEl && linkedinContainer) {
    linkedinEl.href = userData.linkedin;
    linkedinEl.textContent = userData.linkedin;
    linkedinContainer.classList.remove('hidden');
  } else if (linkedinContainer) {
    linkedinContainer.classList.add('hidden');
  }
}

function getProgramName(code) {
  const programs = {
    'TML': 'Technology & Media (TML)',
    'C&T': 'Curriculum & Teaching (C&T)',
    'HUDK': 'Human Development (HUDK)',
    'A&HA': 'Arts & Humanities (A&HA)',
    'ORL': 'Organization & Leadership (ORL)',
    'HBS': 'Health & Behavior Studies (HBS)'
  };
  return programs[code] || code;
}

function getDegreeName(code) {
  const degrees = {
    'MA': 'Master of Arts (MA)',
    'MS': 'Master of Science (MS)',
    'EdM': 'Master of Education (EdM)',
    'EdD': 'Doctor of Education (EdD)',
    'PhD': 'Doctor of Philosophy (PhD)'
  };
  return degrees[code] || code;
}

function openEditProfileModal() {
  if (!isLoggedIn || !currentUserEmail) return;
  
  const userDataStr = localStorage.getItem(`missedUser_${currentUserEmail}`);
  if (!userDataStr) return;
  
  const userData = JSON.parse(userDataStr);
  
  // Populate form
  document.getElementById('edit-name').value = userData.name || '';
  document.getElementById('edit-program').value = userData.program || '';
  document.getElementById('edit-degree').value = userData.degree || '';
  document.getElementById('edit-year').value = userData.year || '';
  document.getElementById('edit-major').value = userData.major || '';
  document.getElementById('edit-research-interest').value = userData.researchInterest || '';
  document.getElementById('edit-linkedin').value = userData.linkedin || '';
  document.getElementById('edit-lab').value = userData.lab || '';
  document.getElementById('edit-interests').value = userData.interests ? userData.interests.join(', ') : '';
  
  document.getElementById('edit-profile-modal').classList.add('active');
}

function closeEditProfileModal() {
  document.getElementById('edit-profile-modal').classList.remove('active');
}

function saveProfileChanges(event) {
  event.preventDefault();
  
  if (!isLoggedIn || !currentUserEmail) return;
  
  const userDataStr = localStorage.getItem(`missedUser_${currentUserEmail}`);
  if (!userDataStr) return;
  
  const userData = JSON.parse(userDataStr);
  
  // Update user data
  userData.name = document.getElementById('edit-name').value.trim();
  userData.program = document.getElementById('edit-program').value;
  userData.degree = document.getElementById('edit-degree').value;
  userData.year = document.getElementById('edit-year').value;
  userData.major = document.getElementById('edit-major').value.trim();
  userData.researchInterest = document.getElementById('edit-research-interest').value.trim();
  userData.linkedin = document.getElementById('edit-linkedin').value.trim() || null;
  userData.lab = document.getElementById('edit-lab').value.trim() || null;
  const interestsText = document.getElementById('edit-interests').value.trim();
  userData.interests = interestsText ? interestsText.split(',').map(i => i.trim()) : [];
  
  // Save updated data
  localStorage.setItem(`missedUser_${currentUserEmail}`, JSON.stringify(userData));
  
  // Update displays
  loadUserProfile();
  
  closeEditProfileModal();
  showToast('Profile updated successfully!');
}

function toggleScheduleSharing() {
  const toggle = document.getElementById('schedule-sharing-toggle');
  const statusEl = document.getElementById('schedule-sharing-status');
  const isSharing = toggle.checked;
  
  // Store preference
  localStorage.setItem('missedScheduleSharing', isSharing ? 'true' : 'false');
  
  if (statusEl) {
    const connections = getConnections();
    if (isSharing) {
      statusEl.textContent = `✓ Your schedule is being shared with ${connections.length} connection${connections.length !== 1 ? 's' : ''}`;
    } else {
      statusEl.textContent = '🔒 Your schedule is not being shared';
    }
  }
  
  // Only show toast when user manually toggles, not on page load
  const event = window.event;
  if (event && event.type === 'change') {
    showToast(isSharing ? 'Schedule sharing enabled' : 'Schedule sharing disabled');
  }
}

// ==========================================
// ACADEMIC HANDSHAKE
// ==========================================

let currentHandshakeTab = 'generate';
let generatedCode = null;
let codeExpiryTimer = null;
let handshakeCodes = {}; // Store active codes: {code: {email, expiresAt}}

function openAcademicHandshakeModal() {
  document.getElementById('academic-handshake-modal').classList.add('active');
  switchHandshakeTab('generate');
}

function closeAcademicHandshakeModal() {
  document.getElementById('academic-handshake-modal').classList.remove('active');
  document.getElementById('handshake-code-input').value = '';
  if (codeExpiryTimer) {
    clearInterval(codeExpiryTimer);
    codeExpiryTimer = null;
  }
}

function switchHandshakeTab(tab) {
  currentHandshakeTab = tab;
  const generateTab = document.getElementById('handshake-generate-tab');
  const inputTab = document.getElementById('handshake-input-tab');
  const generateContainer = document.getElementById('handshake-generate-container');
  const inputContainer = document.getElementById('handshake-input-container');
  
  if (tab === 'generate') {
    generateTab.classList.add('bg-purple-600', 'text-white');
    generateTab.classList.remove('text-gray-600');
    inputTab.classList.remove('bg-purple-600', 'text-white');
    inputTab.classList.add('text-gray-600');
    generateContainer.classList.remove('hidden');
    inputContainer.classList.add('hidden');
  } else {
    inputTab.classList.add('bg-purple-600', 'text-white');
    inputTab.classList.remove('text-gray-600');
    generateTab.classList.remove('bg-purple-600', 'text-white');
    generateTab.classList.add('text-gray-600');
    inputContainer.classList.remove('hidden');
    generateContainer.classList.add('hidden');
  }
}

function generateHandshakeCode() {
  if (!isLoggedIn || !currentUserEmail) {
    showToast('Please log in first');
    return;
  }
  
  // Generate 4-digit code
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  generatedCode = code;
  
  // Store code with expiry (5 minutes)
  const expiresAt = Date.now() + (5 * 60 * 1000);
  handshakeCodes[code] = {
    email: currentUserEmail,
    expiresAt: expiresAt
  };
  
  // Save to localStorage
  localStorage.setItem('missedHandshakeCodes', JSON.stringify(handshakeCodes));
  
  // Display code
  document.getElementById('generated-code-display').textContent = code;
  
  // Start countdown timer
  startCodeExpiryTimer(expiresAt);
  
  showToast('Code generated! Share it with your peer.');
}

function startCodeExpiryTimer(expiresAt) {
  if (codeExpiryTimer) {
    clearInterval(codeExpiryTimer);
  }
  
  const timerEl = document.getElementById('code-expiry-timer');
  if (!timerEl) return;
  
  const updateTimer = () => {
    const now = Date.now();
    const remaining = Math.max(0, expiresAt - now);
    
    if (remaining <= 0) {
      timerEl.textContent = '0:00';
      document.getElementById('generated-code-display').textContent = '----';
      generatedCode = null;
      clearInterval(codeExpiryTimer);
      codeExpiryTimer = null;
      return;
    }
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  updateTimer();
  codeExpiryTimer = setInterval(updateTimer, 1000);
}

function submitHandshakeCode(event) {
  event.preventDefault();
  
  if (!isLoggedIn || !currentUserEmail) {
    showToast('Please log in first');
    return;
  }
  
  const codeInput = document.getElementById('handshake-code-input');
  const enteredCode = codeInput.value.trim();
  
  if (enteredCode.length !== 4) {
    codeInput.classList.add('error-shake');
    setTimeout(() => codeInput.classList.remove('error-shake'), 500);
    showToast('Please enter a 4-digit code');
    return;
  }
  
  // Load codes from localStorage
  const storedCodes = localStorage.getItem('missedHandshakeCodes');
  if (storedCodes) {
    handshakeCodes = JSON.parse(storedCodes);
  }
  
  const codeData = handshakeCodes[enteredCode];
  
  if (!codeData) {
    codeInput.classList.add('error-shake');
    setTimeout(() => codeInput.classList.remove('error-shake'), 500);
    showToast('Invalid code. Please check and try again.');
    return;
  }
  
  // Check if expired
  if (Date.now() > codeData.expiresAt) {
    codeInput.classList.add('error-shake');
    setTimeout(() => codeInput.classList.remove('error-shake'), 500);
    showToast('This code has expired. Ask for a new one.');
    delete handshakeCodes[enteredCode];
    localStorage.setItem('missedHandshakeCodes', JSON.stringify(handshakeCodes));
    return;
  }
  
  // Check if trying to connect to self
  if (codeData.email === currentUserEmail) {
    showToast('You cannot connect to yourself!');
    return;
  }
  
  // Get the other user's data
  const otherUserDataStr = localStorage.getItem(`missedUser_${codeData.email}`);
  if (!otherUserDataStr) {
    showToast('User not found');
    return;
  }
  
  const otherUserData = JSON.parse(otherUserDataStr);
  
  // Add connection
  addConnection(codeData.email, otherUserData);
  
  // Remove used code
  delete handshakeCodes[enteredCode];
  localStorage.setItem('missedHandshakeCodes', JSON.stringify(handshakeCodes));
  
  // Clear input and close modal
  codeInput.value = '';
  closeAcademicHandshakeModal();
  
  showToast(`Connected with ${otherUserData.name}!`);
}

function addConnection(email, userData) {
  // Get current connections
  const connections = getConnections();
  
  // Check if already connected
  if (connections.find(c => c.email === email)) {
    showToast('You are already connected with this user');
    return;
  }
  
  // Add new connection
  connections.push({
    email: email,
    name: userData.name,
    program: userData.program,
    degree: userData.degree,
    year: userData.year,
    major: userData.major,
    researchInterest: userData.researchInterest,
    linkedin: userData.linkedin,
    lab: userData.lab,
    interests: userData.interests || [],
    scheduleShared: false // Default: no schedule sharing
  });
  
  // Save connections
  localStorage.setItem(`missedConnections_${currentUserEmail}`, JSON.stringify(connections));
  
  // Also add reverse connection (so they see you too)
  const reverseConnections = getConnectionsForUser(email);
  const currentUserDataStr = localStorage.getItem(`missedUser_${currentUserEmail}`);
  if (currentUserDataStr) {
    const currentUserData = JSON.parse(currentUserDataStr);
    reverseConnections.push({
      email: currentUserEmail,
      name: currentUserData.name,
      program: currentUserData.program,
      degree: currentUserData.degree,
      year: currentUserData.year,
      major: currentUserData.major,
      researchInterest: currentUserData.researchInterest,
      linkedin: currentUserData.linkedin,
      lab: currentUserData.lab,
      interests: currentUserData.interests || [],
      scheduleShared: false
    });
    localStorage.setItem(`missedConnections_${email}`, JSON.stringify(reverseConnections));
  }
  
  // Create chat entry for this connection
  getOrCreateChat(email, userData.name);
  
  // Update network display
  renderNetworkList();
  
  // Update schedule page connection count if visible
  updateScheduleConnectionCount();
  
  // Update chat list if visible
  if (document.getElementById('chat').classList.contains('active')) {
    renderChatList();
  }
}

function renderNetworkList() {
  const networkList = document.getElementById('network-list');
  if (!networkList) return;
  
  const connections = getConnections();
  
  if (connections.length === 0) {
    networkList.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">No connections yet. Generate a code or enter one to connect!</p>';
    return;
  }
  
  let html = '';
  connections.forEach(connection => {
    const initials = connection.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    html += `
      <div onclick="viewConnectionProfile('${connection.email}')" class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer">
        <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">${initials}</div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-gray-900 text-sm">${connection.name}</div>
          <div class="text-xs text-gray-600">${connection.major || connection.program || 'TC Student'}</div>
        </div>
        <span class="text-gray-400">›</span>
      </div>
    `;
  });
  
  networkList.innerHTML = html;
}

function viewConnectionProfile(email) {
  const connections = getConnections();
  const connection = connections.find(c => c.email === email);
  if (!connection) return;
  
  // Show connection profile modal (we'll create this)
  showConnectionProfileModal(connection);
}

function showConnectionProfileModal(connection) {
  // Create or update connection profile modal
  let modal = document.getElementById('connection-profile-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'connection-profile-modal';
    modal.className = 'modal fixed inset-0 bg-black bg-opacity-50 z-[60] items-center justify-center overflow-y-auto py-8';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl w-10/12 max-w-sm p-6 shadow-2xl mx-4 my-auto max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-900">Connection Profile</h3>
          <button onclick="closeConnectionProfileModal()" class="text-gray-400 text-xl hover:text-gray-600">&times;</button>
        </div>
        <div id="connection-profile-content">
          <!-- Content will be populated here -->
        </div>
      </div>
    `;
    document.querySelector('.device-frame').appendChild(modal);
  }
  
  const initials = connection.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  const content = `
    <div class="text-center mb-4">
      <div class="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">${initials}</div>
      <h3 class="text-xl font-bold text-gray-900 mb-1">${connection.name}</h3>
      <p class="text-sm text-gray-600">${connection.email}</p>
    </div>
    
    <div class="space-y-3">
      <div>
        <p class="text-xs text-gray-500 mb-1">Program</p>
        <p class="text-sm font-semibold text-gray-900">${getProgramName(connection.program) || '-'}</p>
      </div>
      <div>
        <p class="text-xs text-gray-500 mb-1">Degree</p>
        <p class="text-sm font-semibold text-gray-900">${getDegreeName(connection.degree) || '-'}</p>
      </div>
      <div>
        <p class="text-xs text-gray-500 mb-1">Year</p>
        <p class="text-sm font-semibold text-gray-900">${connection.year || '-'}</p>
      </div>
      <div>
        <p class="text-xs text-gray-500 mb-1">Major/Concentration</p>
        <p class="text-sm font-semibold text-gray-900">${connection.major || '-'}</p>
      </div>
      ${connection.researchInterest ? `
      <div>
        <p class="text-xs text-gray-500 mb-1">Research Interest</p>
        <p class="text-sm text-gray-900">${connection.researchInterest}</p>
      </div>
      ` : ''}
      ${connection.lab ? `
      <div>
        <p class="text-xs text-gray-500 mb-1">Lab/Research Group</p>
        <p class="text-sm text-gray-900">${connection.lab}</p>
      </div>
      ` : ''}
      ${connection.linkedin ? `
      <div>
        <p class="text-xs text-gray-500 mb-1">LinkedIn</p>
        <a href="${connection.linkedin}" target="_blank" class="text-sm text-blue-600 hover:underline">View Profile</a>
      </div>
      ` : ''}
      ${connection.interests && connection.interests.length > 0 ? `
      <div>
        <p class="text-xs text-gray-500 mb-1">Interests</p>
        <p class="text-sm text-gray-900">${connection.interests.join(', ')}</p>
      </div>
      ` : ''}
    </div>
    
    <div class="mt-4 pt-4 border-t border-gray-200">
      <button onclick="closeConnectionProfileModal(); openChatWithConnection('${connection.email}', '${connection.name.replace(/'/g, "\\'")}')" class="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/></svg>
        Chat
      </button>
    </div>
  `;
  
  document.getElementById('connection-profile-content').innerHTML = content;
  modal.classList.add('active');
}

function closeConnectionProfileModal() {
  const modal = document.getElementById('connection-profile-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function updateScheduleConnectionCount() {
  const connections = getConnections();
  const countText = document.querySelector('#schedule .text-purple-700');
  if (countText) {
    // Show total connections, not just those sharing schedule
    countText.textContent = `Shared with ${connections.length} connection${connections.length !== 1 ? 's' : ''}`;
  }
}

function renderConnectedStudents() {
  const container = document.getElementById('connected-students-list');
  if (!container) return;
  
  const connections = getConnections();
  
  // Map emails to schedule keys
  const emailToScheduleKey = {
    'jh4887@tc.columbia.edu': 'jiin',
    'minpark@tc.columbia.edu': 'min',
    'lizychoi@columbia.edu': 'lizy'
  };
  
  // Check which schedule is currently selected
  const isSelfSelected = currentScheduleView.type === 'self';
  
  let html = '';
  
  // Add "My Schedule" button first
  html += `
    <button onclick="event.stopPropagation(); switchSchedule('self', 'Haetal Kim', null)" class="w-full flex items-center gap-3 p-2 ${isSelfSelected ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50'} rounded-xl hover:bg-gray-100 transition">
      <div class="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">HK</div>
      <div class="flex-1 text-left min-w-0">
        <div class="font-semibold text-gray-900 text-xs">My Schedule ${isSelfSelected ? '✓' : ''}</div>
        <div class="text-xs text-blue-600">Your schedule</div>
      </div>
    </button>
  `;
  
  if (connections.length === 0) {
    html += '<p class="text-sm text-gray-500 text-center py-4 mt-2">No connections yet. Use Academic Handshake to connect!</p>';
    container.innerHTML = html;
    return;
  }
  
  // Add connected students
  connections.forEach(connection => {
    const initials = connection.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const avatarColors = {
      'JH': 'bg-blue-600',
      'MP': 'bg-purple-600',
      'LC': 'bg-pink-600'
    };
    const avatarColor = avatarColors[initials] || 'bg-gray-600';
    const scheduleKey = emailToScheduleKey[connection.email] || 'self';
    const scheduleStatus = connection.scheduleShared 
      ? '<div class="text-xs text-green-600">✓ Sharing</div>'
      : '<div class="text-xs text-gray-500">🔒 No schedule consent</div>';
    
    // Check if this connection's schedule is currently selected
    const isSelected = currentScheduleView.email === connection.email;
    
    // Escape email and name for onclick to prevent issues
    const escapedEmail = connection.email.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const escapedName = connection.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    html += `
      <button onclick="event.stopPropagation(); switchSchedule('${scheduleKey}', '${escapedName}', '${escapedEmail}')" class="w-full flex items-center gap-3 p-2 ${isSelected ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50'} rounded-xl hover:bg-gray-100 transition">
        <div class="w-8 h-8 ${avatarColor} rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">${initials}</div>
        <div class="flex-1 text-left min-w-0">
          <div class="font-semibold text-gray-900 text-xs">${connection.name} ${isSelected ? '✓' : ''}</div>
          ${scheduleStatus}
        </div>
      </button>
    `;
  });
  
  container.innerHTML = html;
}

function showCreateCommunityMessage() {
  document.getElementById('oiss-authorization-modal').classList.add('active');
}

function closeOISSAuthorizationModal() {
  document.getElementById('oiss-authorization-modal').classList.remove('active');
}

// ==========================================
// EVENT LISTENERS
// ==========================================

// Close modals on outside click
document.addEventListener('click', function(e) {
  if (e.target.id === 'post-modal') {
    closePostModal();
  }
  if (e.target.id === 'report-modal') {
    closeReportModal();
  }
  if (e.target.id === 'schedule-info-modal') {
    closeScheduleInfoModal();
  }
  if (e.target.id === 'trust-score-modal') {
    closeTrustScoreModal();
  }
  if (e.target.id === 'academic-handshake-modal') {
    closeAcademicHandshakeModal();
  }
  if (e.target.id === 'edit-profile-modal') {
    closeEditProfileModal();
  }
  if (e.target.id === 'connection-profile-modal') {
    closeConnectionProfileModal();
  }
  if (e.target.id === 'oiss-authorization-modal') {
    closeOISSAuthorizationModal();
  }
});

// Filter tabs (if implemented)
document.addEventListener('DOMContentLoaded', function() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      filterTabs.forEach(t => {
        t.classList.remove('active', 'bg-blue-600', 'text-white');
        t.classList.add('bg-gray-100', 'text-gray-700');
      });
      this.classList.add('active', 'bg-blue-600', 'text-white');
      this.classList.remove('bg-gray-100', 'text-gray-700');
    });
  });
    // --- Initialize comment counts on page load ---
  Object.keys(commentsData).forEach(id => updateCommentCount(id));
});


// ------------------------------------------------------
// REACTIONS
// ------------------------------------------------------
function react(event, emoji) {
  const btn = event.target;
  const container = btn.parentElement;

  // Remove old highlight
  [...container.children].forEach(b => b.classList.remove("selected-reaction"));

  // Highlight selected
  btn.classList.add("selected-reaction");
}

// ------------------------------------------------------
// VOTING
// ------------------------------------------------------
function vote(event, type) {
  const commentEl = event.target.closest(".comment");
  const countEl = commentEl.querySelector(".vote-count");
  let count = parseInt(countEl.innerText);

  if (type === "up") count++;
  if (type === "down") count--;

  countEl.innerText = count;
}

// ------------------------------------------------------
// REPLY BOX TOGGLE
// ------------------------------------------------------
function toggleReplyBox(button, postId, index) {
  const box = document.getElementById(`reply-box-${postId}-${index}`);
  if (box) box.classList.toggle("hidden");
}

// ------------------------------------------------------
// SUBMIT REPLY
// ------------------------------------------------------
function submitReply(button, postId, index) {
  const input = document.getElementById(`reply-input-${postId}-${index}`);
  const text = input.value.trim();
  if (!text) return;

  // Ensure replies exist
  if (!commentsData[postId][index].replies) {
    commentsData[postId][index].replies = [];
  }

  commentsData[postId][index].replies.push({
    author: "You",
    text: text,
    time: "Just now"
  });

  input.value = "";
  openPost(postId); // rerender view
}

// ------------------------------------------------------
// REPORT COMMENT
// ------------------------------------------------------
function reportComment() {
  alert("Thank you! The comment has been reported.");
}