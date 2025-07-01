// Global variables
let chatVisible = false;
let isLoading = false;

// DOM Elements
const alienBot = document.getElementById('alienBot');
const catStatus = document.getElementById('catStatus');
const chatContainer = document.getElementById('chatContainer');
const chatOverlay = document.getElementById('chatOverlay');
const closeChat = document.getElementById('closeChat');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('chatMessages');
const loadingIndicator = document.getElementById('loadingIndicator');

// Runs when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    addWelcomeMessage();
    setCatMood('happy');
});

function initializeEventListeners() {
    if (alienBot) alienBot.addEventListener('click', toggleChat);
    closeChat.addEventListener('click', toggleChat);
    chatOverlay.addEventListener('click', toggleChat);
    sendButton.addEventListener('click', sendMessage);

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    messageInput.addEventListener('input', function () {
        if (this.value.length > 500) {
            this.value = this.value.substring(0, 500);
            showToast('Message too long! Keep it under 500 characters.', 'warning');
        }
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

function setCatMood(mood) {
    if (!catStatus) return;
    switch (mood) {
        case 'thinking':
            catStatus.src = 'assets/alienthink.png';
            break;
        case 'sad':
            catStatus.src = 'assets/aliensad.png';
            break;
        default:
            catStatus.src = 'assets/alienhappy.png';
    }
}

function toggleChat() {
    if (isLoading) return;
    chatVisible = !chatVisible;

    const chatOverlay = document.getElementById('chatOverlay'); 

    chatContainer.classList.toggle('visible', chatVisible);
    chatOverlay.classList.toggle('visible', chatVisible); 

    if (chatVisible) {
        alienBot && (alienBot.style.display = 'none');
        chatContainer.style.transform = 'translateY(0) scale(1)';
        messageInput.focus();
    } else {
        chatContainer.classList.add('closing');
        setTimeout(() => {
            chatContainer.classList.remove('visible', 'closing');
            alienBot && (alienBot.style.display = 'block');
        }, 300);
    }
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) {
        showToast('Please enter a message!', 'warning');
        return;
    }
    if (isLoading) {
        showToast('Please wait for the current response!', 'info');
        return;
    }

    const plain = ["space fact", "anything", "tell me something", "fact"];
    let finalMessage = message;
    if (plain.includes(message.toLowerCase())) {
        finalMessage = "Yo Fizzbit, drop a chaotic Gen Z space fact. Make it spicy. No textbook energy.";
    }

    addUserMessage(message);
    messageInput.value = '';
    messageInput.style.height = 'auto';
    showLoading(true);
    setCatMood('thinking');

    try {
        console.log('Sending message:', finalMessage);

        const requestBody = JSON.stringify({ message: finalMessage });
        console.log('Request body:', requestBody);

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (response.ok && data.success) {
            addBotMessage(data.response);
            setCatMood('happy');
        } else {
            addBotMessage(data.response || data.error || 'Fizzbit glitched. Try again.');
            setCatMood('sad');
        }
    } catch (error) {
        console.error('Error:', error);
        addBotMessage("Fizzbit lost signal. Check your connection and try again.");
        setCatMood('sad');
    } finally {
        showLoading(false);
    }
}

function addUserMessage(message) {
    const msg = document.createElement('div');
    msg.className = 'message user-message';
    msg.textContent = message;
    chatMessages.appendChild(msg);
    scrollToBottom();
}

function addBotMessage(message) {
    const msg = document.createElement('div');
    msg.className = 'message bot-message';
    chatMessages.appendChild(msg);
    animateTyping(msg, message);
    scrollToBottom();
}

function animateTyping(element, message) {
    element.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
        if (i < message.length) {
            element.textContent += message.charAt(i++);
        } else {
            clearInterval(interval);
        }
    }, 30);
}

function showLoading(show) {
    isLoading = show;
    loadingIndicator.classList.toggle('visible', show);
    sendButton.disabled = show;
    sendButton.textContent = show ? '⏳' : '🚀';
}

function scrollToBottom() {
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

function addWelcomeMessage() {
    if (chatMessages.children.length === 0) {
        setTimeout(() => {
            addBotMessage("😼🛸 Yo Earthling. I'm Fizzbit — the alien cat who naps on Saturn and overshares chaotic space facts. Ask me anything cosmic... or don't. I'll talk anyway 💫");
        }, 500);
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('visible'), 100);
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

window.addEventListener('online', () => showToast('🌐 Connection restored!', 'success'));
window.addEventListener('offline', () => showToast('📡 Connection lost!', 'error'));


function toggleContainer(containerId) {
    const allContainers = document.querySelectorAll('.feature-container');
    const target = document.getElementById(containerId);
    const overlay = document.getElementById('featureOverlay');

    allContainers.forEach(container => {
        if (container.id !== containerId) {
            container.classList.remove('visible');
        }
    });

    if (target) {
        const isVisible = target.classList.contains('visible');
        if (isVisible) {
            target.classList.remove('visible');
            overlay.classList.remove('visible');
        } else {
            target.classList.add('visible');
            overlay.classList.add('visible');
        }
    }

}

//Quiz Me Fizzbit
const quizData = [
  {
    question: "Which planet has the most moons?",
    options: ["Earth", "Mars", "Saturn", "Venus"],
    answer: "Saturn"
  },
  {
    question: "Which space object has a tail?",
    options: ["Comet", "Moon", "Asteroid", "Planet"],
    answer: "Comet"
  },
  {
    question: "Which moon might have alien oceans?",
    options: ["Callisto", "Titan", "Europa", "Phobos"],
    answer: "Europa"
  },
  {
    question: "Who was first dog in space?",
    options: ["Bella", "Laika", "Luna", "Nala"],
    answer: "Laika"
  },
  {
    question: "Which planet rotates sideways?",
    options: ["Uranus", "Saturn", "Earth", "Neptune"],
    answer: "Uranus"
  }
];

let currentIndex = 0;

const quizContent = document.getElementById("quizContent");

function loadQuestion() {
  if (currentIndex >= quizData.length) {
  quizContent.innerHTML = `
    <p style="text-align:center;">✨ Quiz Complete! You're basically a space professor now. 🪐</p>
    <div style="text-align:center; margin-top: 20px;">
      <button onclick="resetQuiz()" class="quiz-restart">Restart Quiz</button>
    </div>
  `;
  return;
}

  const current = quizData[currentIndex];

  const questionHTML = `
    <div class="quiz-question">
      <h3>${current.question}</h3>
      <div class="quiz-options">
        ${current.options.map(opt => `<button class="quiz-option">${opt}</button>`).join('')}
      </div>
      <div id="quizFeedback" class="quiz-feedback"></div>
    </div>
  `;

  quizContent.innerHTML = questionHTML;

  document.querySelectorAll(".quiz-option").forEach(btn => {
    btn.addEventListener("click", () => handleAnswer(btn.textContent, current.answer));
  });
}

function handleAnswer(selected, correct) {
  const feedbackEl = document.getElementById("quizFeedback");

  const correctComments = [
    "Bingo! 🧠 You're orbiting genius.",
    "Correcto! Fizzbit’s impressed 😼💫",
    "You sure you’re not from NASA? 🛰️",
    "You got it, starchild 🌟",
    "Yup! Fizzbit did a little happy dance 👽🕺"
  ];

  const wrongComments = [
    `Oops! It was ${correct} 😿`,
    `Nope, but at least you tried 🌚`,
    `Wrong... Fizzbit sighed dramatically 😤`,
    `It’s ${correct}, not that chaos you picked 😵‍💫`,
    `Galactic facepalm! It's actually ${correct} 🙈`
  ];

  const allButtons = document.querySelectorAll(".quiz-option");
  allButtons.forEach(btn => btn.disabled = true);

  if (selected === correct) {
    feedbackEl.textContent = correctComments[Math.floor(Math.random() * correctComments.length)];
    feedbackEl.style.color = "green";
  } else {
    feedbackEl.textContent = wrongComments[Math.floor(Math.random() * wrongComments.length)];
    feedbackEl.style.color = "crimson";
  }

  setTimeout(() => {
    currentIndex++;
    loadQuestion();
  }, 2000);
}

loadQuestion();
function resetQuiz() {
  currentIndex = 0;
  loadQuestion();
}

//Zodiac Skecthes
let stars = [];
let isDragging = false;
let draggedStar = null;

const canvas = document.getElementById('constellationCanvas');
const ctx = canvas.getContext('2d');

const starImg = new Image();
starImg.src = 'assets/star.PNG';
let starLoaded = false;
let currentComment = "";

starImg.onload = () => {
    starLoaded = true;
    resizeCanvas();
    draw();
};

function resizeCanvas() {
    canvas.width = 600;
    canvas.height = 300;
}

function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

canvas.addEventListener('click', (e) => {
    if (!starLoaded || isDragging) return;
    const coords = getCanvasCoordinates(e);
    stars.push({ x: coords.x, y: coords.y });
    updateComment();
    draw();
});

canvas.addEventListener('mousedown', (e) => {
    const coords = getCanvasCoordinates(e);
    stars.forEach(star => {
        if (Math.hypot(star.x - coords.x, star.y - coords.y) < 15) {
            isDragging = true;
            draggedStar = star;
        }
    });
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging && draggedStar) {
        const coords = getCanvasCoordinates(e);
        draggedStar.x = coords.x;
        draggedStar.y = coords.y;
        draw();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    draggedStar = null;
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < stars.length; i++) {
        ctx.drawImage(starImg, stars[i].x - 8, stars[i].y - 8, 16, 16);
    }
    ctx.shadowColor = "#7fdbff";
    ctx.shadowBlur = 12;
    for (let i = 0; i < stars.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(stars[i].x, stars[i].y);
        ctx.lineTo(stars[i + 1].x, stars[i + 1].y);
        ctx.strokeStyle = "#7fdbff";
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

function updateComment() {
    if (stars.length === 3) fizzbitSay("Ooo is that a triangle or a space Dorito? 👀");
    else if (stars.length === 5) fizzbitSay("Lowkey looks like Orion's confused cousin 🌌");
    else if (stars.length === 6) fizzbitNameConstellation();
    else if (stars.length === 8) fizzbitSay("Okay Picasso, I see you connecting the stars 🖼️");
    else if (stars.length === 10) fizzbitSay("NASA called. They want their map back. 📡");
    else if (stars.length === 12) fizzbitSay("Bro that's not a constellation, that's a vibe net 🌐");
    else if (stars.length > 15) fizzbitSay("You makin' a galaxy map or summ? 😵‍💫");
}

function fizzbitSay(message) {
    const text = document.getElementById('fizzbitText');
    const commentBox = document.getElementById('fizzbitComment');
    text.textContent = message;
    commentBox.style.display = 'flex';
    currentComment = message;
}

const fizzbitConstellationNames = [
    "Cosmic Chicken Nugget 🍗✨",
    "The Great Floating Sock 🧦",
    "Yeetus Major 🚀",
    "The Lost TikTok Dancer 💃🪐",
    "Neptune's Elbow 💪🌊",
    "Vibra-tron-9000 🤖",
    "Planet Bender Deluxe 🌍",
    "Starbucks Nebula ☕✨",
    "Cursed Saturn Lizard 🦎🪐",
    "Wormhole Scribble 😵‍💫",
    "Crusty Crab Cluster 🦀✨",
    "Cosmic Banana Peel 🍌🌌"
];

function fizzbitNameConstellation() {
    const name = fizzbitConstellationNames[Math.floor(Math.random() * fizzbitConstellationNames.length)];
    fizzbitSay(`Yooo I'm naming this: ${name}`);
}

document.getElementById('clearStars').addEventListener('click', () => {
    stars = [];
    draw();
    fizzbitSay("Aight... space wiped. Clean slate vibes ✨");
});

// --- Space Weather Logic ---

const weatherTypes = [
  { label: "Solar Winds", value: () => `${(300 + Math.random() * 400).toFixed(1)} km/s` },
  { label: "Cosmic Dust", value: () => `${(Math.random() * 20).toFixed(1)} g/m³` },
  { label: "Meteor Shower", value: () => `${Math.floor(Math.random() * 12)} meteors/min` },
  { label: "Gamma Rays", value: () => `${(Math.random() * 5).toFixed(2)} µSv/h` },
  { label: "Magnetosphere", value: () => `${Math.floor(Math.random() * 100)}% stable` },
 ];

const fizzbitComments = [
  "☄️ It's a bit breezy in the gamma-ray zone!",
  "💤 I'd avoid the dust fields today. Too sneezy.",
  "🌌 Cosmic radiation? Just another Tuesday.",
  "👽 Forecast says: space naps recommended.",
  "🎧 Put on your helmet — it’s raining meteors!",
  "🛰️ Everything’s normal. Suspiciously normal..."
];

function generateSpaceWeather() {
  const statsHTML = weatherTypes.map(type => `
    <div class="weather-item">
      <span class="label">${type.label}</span>
      <span class="value">${type.value()}</span>
    </div>
  `).join('');

  const comment = fizzbitComments[Math.floor(Math.random() * fizzbitComments.length)];

  document.getElementById('weatherStats').innerHTML = statsHTML;
  document.getElementById('weatherComment').textContent = comment;
}

// Optional: Regenerate weather when container is opened
document.getElementById('weatherContainer').addEventListener('transitionend', () => {
  if (document.getElementById('weatherContainer').classList.contains('visible')) {
    generateSpaceWeather();
  }
});

// Load once on page load too
generateSpaceWeather();
