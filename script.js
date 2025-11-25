// ==========================================
// INITIALIZATION & ONBOARDING
// ==========================================

let currentOnboardingScreen = 1;
let hasSeenOnboarding = localStorage.getItem('missedOnboardingComplete') === 'true';

document.addEventListener('DOMContentLoaded', function() {
  const splashScreen = document.getElementById('splash-screen');
  const onboarding = document.getElementById('onboarding');
  const appTitle = document.getElementById('app-title');
  
  // Splash animation
  setTimeout(() => {
    appTitle.classList.add('separated');
  }, 1000);
  
  setTimeout(() => {
    splashScreen.classList.add('fade-out');
    
    setTimeout(() => {
      splashScreen.style.display = 'none';
      
      // Show onboarding if first time, otherwise show app
      if (!hasSeenOnboarding) {
        onboarding.classList.add('active');
      } else {
        onboarding.style.display = 'none';
      }
    }, 500);
  }, 2500);
  
  // Initialize schedule
  renderSchedule(schedules.self);
});

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
  
  setTimeout(() => {
    onboarding.style.display = 'none';
  }, 500);
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
    { author: 'Michael Kim', initials: 'MK', color: 'bg-purple-500', text: 'Thanks! 🙏 This is exactly what I needed', time: '2 min ago' },
    { author: 'Sarah Lee', initials: 'SL', color: 'bg-pink-500', text: 'Used this guide last semester. Very helpful! Got my CPT approved in 3 weeks', time: '15 min ago' },
    { author: 'Emma Chen', initials: 'EC', color: 'bg-teal-500', text: 'Can international students on OPT apply for CPT? I thought you can only do one or the other??', time: '1h ago' },
    { author: 'David Park', initials: 'DP', color: 'bg-blue-500', text: 'Wait is this for paid internships only or unpaid too?', time: '2h ago' },
    { author: 'Jessica Wong', initials: 'JW', color: 'bg-green-500', text: 'My advisor said the forms changed this year - is this guide updated for 2025?', time: '3h ago' }
  ],
  2: [
    { author: 'David Park', initials: 'DP', color: 'bg-blue-500', text: 'I\'m interested! What time works for everyone?', time: '5 min ago' },
    { author: 'Lizy Choi', initials: 'LC', color: 'bg-pink-500', text: 'Tuesday afternoons work for me. Milbank basement?', time: '20 min ago' },
    { author: 'Alex Wang', initials: 'AW', color: 'bg-green-500', text: 'Count me in! 📚 Are we covering chapters 5-8?', time: '45 min ago' },
    { author: 'Sophia Kim', initials: 'SK', color: 'bg-purple-500', text: 'Is this for HUDK 4029 or the other EdTech class? I\'m confused lol', time: '1h ago' },
    { author: 'James Lee', initials: 'JL', color: 'bg-orange-500', text: 'Can PhD students join or is this just for masters?', time: '2h ago' }
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
      isPinned: true
    },
    { 
      author: 'Sarah Chen', 
      initials: 'SC', 
      color: 'bg-orange-500', 
      text: 'This is extremely dangerous misinformation! I just submitted my OPT last week and it\'s processing fine. Stop scaring people.', 
      time: '20 min ago' 
    },
    { 
      author: 'David Kim', 
      initials: 'DK', 
      color: 'bg-indigo-500', 
      text: 'I called OISS and they confirmed this is NOT true. OPT processing is normal.', 
      time: '35 min ago' 
    },
    { 
      author: 'Rachel Park', 
      initials: 'RP', 
      color: 'bg-red-500', 
      text: 'Reported. This could cause students to miss deadlines.', 
      time: '1h ago' 
    },
    { 
      author: 'Kevin Zhang', 
      initials: 'KZ', 
      color: 'bg-purple-500', 
      text: 'Wait really?? I was about to apply next week. Should I wait or is this fake news?', 
      time: '1.5h ago' 
    },
    { 
      author: 'Michael Lee', 
      initials: 'ML', 
      color: 'bg-teal-500', 
      text: 'Where did you hear this? Please provide a source! This affects so many of us', 
      time: '2h ago' 
    },
    { 
      author: 'Lisa Wang', 
      initials: 'LW', 
      color: 'bg-pink-500', 
      text: 'OMG this is so scary... my graduation is in May 😰 does anyone know if this is true??', 
      time: '2.5h ago' 
    },
    { 
      author: 'Anonymous', 
      initials: '??', 
      color: 'bg-gray-400', 
      text: 'My friend heard it from someone in their program who works in admissions', 
      time: '3h ago' 
    }
  ],
  4: [
    // Career Fair post - Mix of helpful, confused, and misleading
    { 
      author: 'Alex Rivera', 
      initials: 'AR', 
      color: 'bg-green-500', 
      text: 'Super helpful! 🙌 I checked the booth map and Goldman Sachs is in Hall A. Does anyone know if they sponsor international students?', 
      time: '10 min ago' 
    },
    { 
      author: 'Priya Sharma', 
      initials: 'PS', 
      color: 'bg-purple-500', 
      text: 'Wait I thought the career fair was next month?? This says next week but my advisor told me it\'s in December', 
      time: '25 min ago' 
    },
    { 
      author: 'Marcus Johnson', 
      initials: 'MJ', 
      color: 'bg-blue-500', 
      text: 'Just got confirmation from Career Services - this is legit! Already submitted my resume through Handshake. Remember to bring physical copies too!', 
      time: '40 min ago' 
    },
    { 
      author: 'Yuki Tanaka', 
      initials: 'YT', 
      color: 'bg-pink-500', 
      text: 'My friend said only Masters students can attend, is that true? I\'m doing my EdD and would love to go 🤔', 
      time: '1h ago' 
    },
    { 
      author: 'Hassan Ahmed', 
      initials: 'HA', 
      color: 'bg-orange-500', 
      text: 'Anyone else confused about the registration? The link in the guide doesn\'t work for me... maybe it\'s full already?', 
      time: '1.5h ago' 
    },
    { 
      author: 'Rachel Kim', 
      initials: 'RK', 
      color: 'bg-teal-500', 
      text: 'IMPORTANT: My roommate works at Career Services and said they\'re only accepting students with 3.5+ GPA this year due to high demand', 
      time: '2h ago' 
    },
    { 
      author: 'Tom Wilson', 
      initials: 'TW', 
      color: 'bg-indigo-500', 
      text: 'That doesn\'t sound right... career fairs are usually open to all students regardless of GPA. Where did she hear that?', 
      time: '2h ago' 
    },
    { 
      author: 'Min-Ji Park', 
      initials: 'MP', 
      color: 'bg-red-500', 
      text: 'Love the company list! Apple, Google, and Microsoft are all there. Does anyone know if they have EdTech positions or mainly CS roles?', 
      time: '2.5h ago' 
    }
  ],
  5: [
    // Maria Lopez roommate post - Mix of interested/questions/concerns
    { 
      author: 'Sarah Chen', 
      initials: 'SC', 
      color: 'bg-blue-500', 
      text: 'Interested! What\'s the exact address? I want to check the commute time to campus 🚇', 
      time: '5 min ago' 
    },
    { 
      author: 'Mike Torres', 
      initials: 'MT', 
      color: 'bg-green-500', 
      text: 'Does pet friendly mean cats too or just dogs? I have a cat 🐱', 
      time: '15 min ago' 
    },
    { 
      author: 'Emma Wilson', 
      initials: 'EW', 
      color: 'bg-purple-500', 
      text: 'Hamilton Heights is really far from campus... isn\'t that like a 30 minute subway ride?', 
      time: '45 min ago' 
    },
    { 
      author: 'David Kim', 
      initials: 'DK', 
      color: 'bg-orange-500', 
      text: 'Actually Hamilton Heights is only 15-20 mins on the 1 train. Very affordable area! I live there and love it', 
      time: '1h ago' 
    },
    { 
      author: 'Rachel Martinez', 
      initials: 'RM', 
      color: 'bg-pink-500', 
      text: 'Have you checked the Public Safety neighborhood report? I heard that area had some incidents last month', 
      time: '1.5h ago' 
    },
    { 
      author: 'Alex Johnson', 
      initials: 'AJ', 
      color: 'bg-teal-500', 
      text: 'That\'s pretty misleading - Hamilton Heights is generally safe. Just use common sense like anywhere in NYC', 
      time: '2h ago' 
    },
    { 
      author: 'Lisa Wang', 
      initials: 'LW', 
      color: 'bg-indigo-500', 
      text: 'Is the apartment furnished? And are utilities included in the $1,100?', 
      time: '2.5h ago' 
    },
    { 
      author: 'James Park', 
      initials: 'JP', 
      color: 'bg-red-500', 
      text: 'My friend found a great roommate through this community last year! Make sure to get references and meet in person first', 
      time: '3h ago' 
    },
    { 
      author: 'Anonymous', 
      initials: '??', 
      color: 'bg-gray-400', 
      text: 'Be careful with Jan 1st move-in dates... landlords sometimes don\'t have the place ready in time', 
      time: '3.5h ago' 
    }
  ],
  6: [
    // Holiday Potluck post - Enthusiastic responses
    { 
      author: 'Yuki Tanaka', 
      initials: 'YT', 
      color: 'bg-blue-500', 
      text: 'Bringing sushi rolls! 🍣 So excited for this. Last year\'s potluck was amazing!', 
      time: '3 min ago' 
    },
    { 
      author: 'Maria Santos', 
      initials: 'MS', 
      color: 'bg-green-500', 
      text: 'I\'m making empanadas from my home country! Can\'t wait to try everyone\'s dishes 🥟', 
      time: '10 min ago' 
    },
    { 
      author: 'Ahmed Hassan', 
      initials: 'AH', 
      color: 'bg-purple-500', 
      text: 'Is this open to all TC students or just ISO members? Would love to come!', 
      time: '15 min ago' 
    },
    { 
      author: 'International Student Org', 
      initials: 'ISO', 
      color: 'bg-pink-500',
      verified: true,
      text: 'Everyone is welcome! All TC students can attend regardless of membership ✨', 
      time: '20 min ago' 
    },
    { 
      author: 'Chen Wei', 
      initials: 'CW', 
      color: 'bg-orange-500', 
      text: 'Do we need to RSVP or just show up? And is there a dish signup sheet?', 
      time: '30 min ago' 
    },
    { 
      author: 'Sofia Rodriguez', 
      initials: 'SR', 
      color: 'bg-teal-500', 
      text: 'Wait what time exactly? The post says 6pm but I have class until 5:45... hoping I don\'t miss the start!', 
      time: '45 min ago' 
    },
    { 
      author: 'David Park', 
      initials: 'DP', 
      color: 'bg-indigo-500', 
      text: 'Can we bring friends from other schools? My roommate from Barnard would love this!', 
      time: '1h ago' 
    },
    { 
      author: 'Nina Patel', 
      initials: 'NP', 
      color: 'bg-red-500', 
      text: 'I heard the student lounge was being renovated... is it actually available Friday? Want to make sure before I cook 😅', 
      time: '1.5h ago' 
    }
  ],
  7: [
    // Kevin Liu hiking post - Outdoor enthusiasts + logistics questions
    { 
      author: 'Tom Bradley', 
      initials: 'TB', 
      color: 'bg-green-500', 
      text: 'I\'m in! 🥾 Bear Mountain is beautiful this time of year. What trail are you thinking?', 
      time: '8 min ago' 
    },
    { 
      author: 'Jessica Lee', 
      initials: 'JL', 
      color: 'bg-blue-500', 
      text: 'How difficult is the hike? I\'m not super experienced but would love to try!', 
      time: '20 min ago' 
    },
    { 
      author: 'Marcus Johnson', 
      initials: 'MJ', 
      color: 'bg-purple-500', 
      text: 'Count me in! Should we carpool from campus? I don\'t have a car', 
      time: '35 min ago' 
    },
    { 
      author: 'Kevin Liu', 
      initials: 'KL', 
      color: 'bg-yellow-500',
      verified: false,
      text: 'Planning to do the Appalachian Trail section - moderate difficulty. And yes, carpooling from TC at 8am! I can fit 3 people in my car', 
      time: '40 min ago' 
    },
    { 
      author: 'Rachel Kim', 
      initials: 'RK', 
      color: 'bg-pink-500', 
      text: 'Is this the same trail that was closed for maintenance last month? Want to make sure it\'s open', 
      time: '1h ago' 
    },
    { 
      author: 'Alex Wang', 
      initials: 'AW', 
      color: 'bg-orange-500', 
      text: 'I don\'t think that trail is closed anymore, I saw someone post about hiking it last week. Should be good!', 
      time: '1.5h ago' 
    },
    { 
      author: 'Emma Chen', 
      initials: 'EC', 
      color: 'bg-teal-500', 
      text: 'What time do you think we\'ll be back? I have plans Saturday evening', 
      time: '2h ago' 
    },
    { 
      author: 'Lisa Martinez', 
      initials: 'LM', 
      color: 'bg-indigo-500', 
      text: 'Weather forecast shows rain Saturday morning... should we have a rain date backup? ☔', 
      time: '2.5h ago' 
    }
  ],
  8: [
    // Jessica Brown board game night - Social gathering vibes
    { 
      author: 'Michael Chen', 
      initials: 'MC', 
      color: 'bg-blue-500', 
      text: 'Yes! 🎲 What games do you have? I love Catan and Ticket to Ride', 
      time: '5 min ago' 
    },
    { 
      author: 'Sarah Park', 
      initials: 'SP', 
      color: 'bg-green-500', 
      text: 'I\'m definitely coming! Can I bring Cards Against Humanity? 😂', 
      time: '15 min ago' 
    },
    { 
      author: 'David Lee', 
      initials: 'DL', 
      color: 'bg-purple-500', 
      text: 'How many people are you expecting? Want to make sure it\'s not too crowded', 
      time: '30 min ago' 
    },
    { 
      author: 'Jessica Brown', 
      initials: 'JB', 
      color: 'bg-green-500',
      verified: false,
      text: 'Planning for about 8-10 people max! I have Catan, Codenames, Splendor, and a few others. Feel free to bring games too!', 
      time: '35 min ago' 
    },
    { 
      author: 'Emily Wong', 
      initials: 'EW', 
      color: 'bg-pink-500', 
      text: 'What\'s the address? And is there a specific time to arrive?', 
      time: '1h ago' 
    },
    { 
      author: 'Ahmed Ali', 
      initials: 'AA', 
      color: 'bg-orange-500', 
      text: 'I\'ve never played most of these games... is it okay if I\'m a total beginner? 😅', 
      time: '1.5h ago' 
    },
    { 
      author: 'Nina Rodriguez', 
      initials: 'NR', 
      color: 'bg-teal-500', 
      text: 'Totally! Board game nights are the best way to learn. Everyone is super chill and helpful', 
      time: '2h ago' 
    },
    { 
      author: 'Kevin Zhang', 
      initials: 'KZ', 
      color: 'bg-indigo-500', 
      text: 'BYOB = Bring Your Own Beer? Just want to confirm before I show up with snacks instead lol', 
      time: '2.5h ago' 
    },
    { 
      author: 'Rachel Martinez', 
      initials: 'RM', 
      color: 'bg-red-500', 
      text: 'My roommate and I would love to come! Is it okay to bring a plus one?', 
      time: '3h ago' 
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
    comment.reactions = comment.reactions || {};
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

            <!-- REACTIONS -->
            <div class="flex items-center gap-2 mt-2">
              <button onclick="reactToComment(${postId}, ${index}, '👍')">👍</button>
              <button onclick="reactToComment(${postId}, ${index}, '❤️')">❤️</button>
              <button onclick="reactToComment(${postId}, ${index}, '😂')">😂</button>

              <span class="text-xs text-gray-600 ml-2">
                ${Object.entries(comment.reactions)
                  .map(([emoji, count]) => `${emoji} ${count}`)
                  .join(" ")}
              </span>
            </div>

            <!-- VOTING -->
            <div class="flex items-center gap-3 mt-2 text-xs text-gray-600">
              <button onclick="upvoteComment(${postId}, ${index})"
                      class="px-2 py-1 bg-gray-100 rounded">
                ⬆ ${comment.upvotes}
              </button>

              <button onclick="downvoteComment(${postId}, ${index})"
                      class="px-2 py-1 bg-gray-100 rounded">
                ⬇ ${comment.downvotes}
              </button>
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
                  <div class="font-semibold text-gray-800">${reply.author}</div>
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
// REACTIONS
// ------------------------------------------------------
function reactToComment(postId, index, emoji) {
  const comment = commentsData[postId][index];

  if (!comment.reactions[emoji]) {
    comment.reactions[emoji] = 1;
  } else {
    comment.reactions[emoji] += 1;
  }

  openPost(postId);
}



// ------------------------------------------------------
// UPVOTES / DOWNVOTES
// ------------------------------------------------------
function upvoteComment(postId, index) {
  commentsData[postId][index].upvotes += 1;
  openPost(postId);
}

function downvoteComment(postId, index) {
  commentsData[postId][index].downvotes += 1;
  openPost(postId);
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
  comment.replies.push({
    author: "You",
    text: text
  });

  input.value = "";
  openPost(postId);
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
  // Hide all pages
  document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  
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
      
      // Create a unique post ID for each community post
      const postId = `${communityId}_${index}`;
      
      postsHTML += `
        <div onclick="openCommunityPost('${communityId}', ${index})" class="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
          <div class="flex items-start gap-3 mb-2">
            <div class="w-10 h-10 ${post.avatarBg} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">${post.avatar}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-gray-900 text-sm">${post.author}</span>
                ${verifiedBadge}
              </div>
              <p class="text-xs text-gray-600">${post.time}</p>
            </div>
          </div>
          <h3 class="font-bold text-gray-900 mb-2">${post.title}</h3>
          <p class="text-sm text-gray-700 mb-2">${post.content}</p>
          ${linkHTML}
          <div class="flex items-center gap-4 text-xs text-gray-600">
            <span>💬 ${post.comments} comments</span>
            <span>👍 ${post.likes} likes</span>
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
  
  // Render comments
  const commentsContainer = document.querySelector('#post-detail .space-y-3');
  commentsContainer.innerHTML = renderComments(postId);
  
  showPage('post-detail');
}

// Open community posts (housing, career, etc.)
function openCommunityPost(communityId, postIndex) {
  console.log('Opening community post:', communityId, postIndex);
  
  // Get community data
  const communities = showCommunity.communities || {};
  
  // If communities object doesn't exist, we need to reconstruct it
  // This is a simplified version - in reality, you'd want to store this data
  const communityData = {
    career: {
      posts: [
        { author: 'Sarah Kim', avatar: 'SK', avatarBg: 'bg-green-500', verified: true, time: '2h ago', title: 'Career Fair Tips - Spring 2025', content: 'TC Career Services just posted the official guide for next week\'s career fair. Includes company list and booth map!', link: 'tc.columbia.edu/career-fair', comments: 8, likes: 24 },
        { author: 'David Chen', avatar: 'DC', avatarBg: 'bg-orange-500', verified: false, time: '5h ago', title: 'Anyone else applying to EdTech startups?', content: 'Looking for advice on how to break into the EdTech industry. Any tips on resume tailoring?', link: '', comments: 12, likes: 18 },
        { author: 'Emily Park', avatar: 'EP', avatarBg: 'bg-blue-500', verified: true, time: '1d ago', title: 'OPT Application Deadlines Reminder', content: 'OISS reminder: OPT applications must be filed within 90 days of graduation. Start early!', link: 'tc.columbia.edu/oiss/opt-timeline', comments: 5, likes: 31 }
      ]
    },
    housing: {
      posts: [
        { author: 'TC Public Safety', avatar: 'PS', avatarBg: 'bg-red-500', verified: true, time: '1h ago', title: 'Neighborhood Safety Ratings Updated', content: 'Our monthly safety report is now available. Check crime statistics and safety tips for Morningside Heights and surrounding areas.', link: 'columbia.edu/publicsafety/neighborhoods', comments: 15, likes: 42 },
        { author: 'Maria Lopez', avatar: 'ML', avatarBg: 'bg-purple-500', verified: false, time: '4h ago', title: 'Looking for roommate - Hamilton Heights', content: 'Need one roommate for a 2BR apartment near campus. $1,100/month, available Jan 1st. Pet friendly!', link: '', comments: 9, likes: 6 },
        { author: 'Alex Wang', avatar: 'AW', avatarBg: 'bg-indigo-500', verified: true, time: '2d ago', title: 'Lease Agreement Review Resources', content: 'Student Legal Services offers free lease review appointments. Highly recommend before signing anything!', link: 'columbia.edu/legal-services', comments: 7, likes: 28 }
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
  
  // No warning for community posts (only visa community post 3 is flagged)
  const warningEl = document.getElementById('post-warning');
  const flaggedWarningEl = document.getElementById('flagged-warning');
  if (warningEl) warningEl.classList.add('hidden');
  if (flaggedWarningEl) flaggedWarningEl.classList.add('hidden');
  
  // Store current post info for comment posting
  window.currentPostId = null;
  window.currentCommunityId = communityId;
  window.currentPostIndex = postIndex;
  
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
    
    // Housing posts  
    if (communityId === 'housing' && postIndex === 1) postDataId = 5; // Maria Lopez roommate
    
    // Social posts
    if (communityId === 'social' && postIndex === 0) postDataId = 6; // Holiday Potluck
    if (communityId === 'social' && postIndex === 1) postDataId = 7; // Kevin Liu hiking
    if (communityId === 'social' && postIndex === 2) postDataId = 8; // Jessica Brown board game
    
    if (postDataId && commentsData[postDataId]) {
      commentsContainer.innerHTML = renderComments(postDataId);
    } else {
      commentsContainer.innerHTML = '<h4 class="font-bold text-gray-900 text-base mb-2">Comments</h4><div class="bg-gray-50 rounded-2xl p-4 text-center text-gray-500 text-sm">Comments will appear here</div>';
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

function switchSchedule(type, name) {
  const titleEl = document.getElementById('schedule-title');
  const errorEl = document.getElementById('schedule-error');
  const gridEl = document.getElementById('schedule-grid');
  
  if (type === 'self') {
    titleEl.textContent = 'My Schedule';
  } else {
    titleEl.textContent = name + "'s Schedule";
  }
  
  // Min Park has not consented
  if (type === 'min') {
    errorEl.classList.remove('hidden');
    gridEl.classList.add('hidden');
  } else {
    errorEl.classList.add('hidden');
    gridEl.classList.remove('hidden');
    renderSchedule(schedules[type] || schedules.self);
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

// Filter posts in community
function filterPosts(filter) {
  // Update active tab styling
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.remove('active', 'bg-blue-600', 'text-white');
    tab.classList.add('bg-gray-100', 'text-gray-700');
  });
  event.target.classList.add('active', 'bg-blue-600', 'text-white');
  event.target.classList.remove('bg-gray-100', 'text-gray-700');
  
  // Get all posts
  const posts = document.querySelectorAll('#community-posts > div');
  
  posts.forEach(post => {
    if (filter === 'all') {
      // Show all posts
      post.style.display = 'block';
    } else if (filter === 'verified') {
      // Show only posts with green verified badge
      const hasVerifiedBadge = post.querySelector('.bg-green-600');
      post.style.display = hasVerifiedBadge ? 'block' : 'none';
    } else if (filter === 'flagged') {
      // Show only posts with red border (flagged)
      const isFlagged = post.classList.contains('border-red-200');
      post.style.display = isFlagged ? 'block' : 'none';
    }
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
    if (communityId === 'housing' && postIndex === 1) postDataId = 5;
    if (communityId === 'social' && postIndex === 0) postDataId = 6;
    if (communityId === 'social' && postIndex === 1) postDataId = 7;
    if (communityId === 'social' && postIndex === 2) postDataId = 8;
  }
  
  if (postDataId && commentsData[postDataId]) {
    // Create new comment object
    const newComment = {
      author: 'Haetal Kim',  // Current user
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

function openChat(chatId) {
  showToast('Chat feature coming soon!');
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
  if (box) {
    box.classList.toggle("hidden");
  }
}

// ------------------------------------------------------
// SUBMIT REPLY
// ------------------------------------------------------
function submitReply(btn) {
  const container = btn.closest(".comment");
  const input = container.querySelector(".reply-input");
  const text = input.value.trim();
  if (!text) return;

  const replyList = container.querySelector(".reply-list");
  const replyEl = document.createElement("div");
  replyEl.className = "reply";
  replyEl.innerText = text;
  replyList.appendChild(replyEl);

  input.value = "";
  container.querySelector(".reply-box").classList.add("hidden");
}

// ------------------------------------------------------
// REPORT COMMENT
// ------------------------------------------------------
function reportComment() {
  alert("Thank you! The comment has been reported.");
}


function toggleReplyBox(button, postId, index) {
  const box = document.getElementById(`reply-box-${postId}-${index}`);
  if (box) box.classList.toggle("hidden");
}

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
    text: text
  });

  input.value = "";
  openPost(postId); // rerender view
}