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

// Run when page loads
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

const audio = document.getElementById('bgAudio');
const audioBtn = document.getElementById('audioToggle');

audio.volume = 0.5; // Optional: start at lower volume

