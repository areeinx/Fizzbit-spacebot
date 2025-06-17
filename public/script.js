// Global variables
let chatVisible = false;
let isLoading = false;

// DOM Elements
const alienBot = document.getElementById('alienBot');
const sleepingCat = document.getElementById('sleepingCat'); // Add sleeping cat element
const chatContainer = document.getElementById('chatContainer');
const chatOverlay = document.getElementById('chatOverlay');
const closeChat = document.getElementById('closeChat');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('chatMessages');
const loadingIndicator = document.getElementById('loadingIndicator');

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    addWelcomeMessage();
});

// Event listners
function initializeEventListeners() {
    // Alien bot click to toggle chat
    if (alienBot) {
        alienBot.addEventListener('click', toggleChat);
    }
    
    // Sleeping cat click to toggle chat
    if (sleepingCat) {
        sleepingCat.addEventListener('click', toggleChat);
    }
    
    // Close chat button
    closeChat.addEventListener('click', toggleChat);
    
    // Chat overlay click to close (mobile)
    chatOverlay.addEventListener('click', toggleChat);
    
    // Send button click
    sendButton.addEventListener('click', sendMessage);
    
    // Enter key in input field
    messageInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
    
    // Prevent chat container clicks from closing chat
    chatContainer.addEventListener('click', function(event) {
        event.stopPropagation();
    });
    
    // Input field focus/blur effects
    messageInput.addEventListener('focus', function() {
        this.parentElement.style.borderColor = '#39cccc';
    });
    
    messageInput.addEventListener('blur', function() {
        this.parentElement.style.borderColor = '#7fdbff';
    });
    
    // Auto-resize input field based on content
    messageInput.addEventListener('input', function() {
        // Limit input length
        if (this.value.length > 500) {
            this.value = this.value.substring(0, 500);
            showToast('Message too long! Keep it under 500 characters.', 'warning');
        }
        
        // Auto-resize textarea
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

// Toggle chat visibility with smooth animations
function toggleChat() {
    if (isLoading) return; // Prevent toggle during loading
    
    if (!chatVisible) {
        // Show chat and hide sleeping cat
        chatContainer.classList.remove('closing');
        chatContainer.classList.add('visible');
        chatOverlay.classList.add('visible');
        messageInput.focus();
        
        // Hide sleeping cat when chat opens
        if (sleepingCat) {
            sleepingCat.style.display = 'none';
        }
        
        // Hide alien bot if it exists
        if (alienBot) {
            alienBot.style.display = 'none';
        }
        
        // Add entrance animation
        setTimeout(() => {
            chatContainer.style.transform = 'translateY(0) scale(1)';
        }, 10);
        
        chatVisible = true;
        
        // Log for debugging
        console.log('Chat opened');
    } else {
        // Hide chat with animation
        chatContainer.classList.add('closing');
        chatOverlay.classList.remove('visible');
        
        setTimeout(() => {
            chatContainer.classList.remove('visible', 'closing');
            
            // Show sleeping cat again when chat closes
            if (sleepingCat) {
                sleepingCat.style.display = 'block';
            }
            
            // Show alien bot again if it exists
            if (alienBot) {
                alienBot.style.display = 'block';
            }
        }, 300);
        
        chatVisible = false;
        
        // Log for debugging
        console.log('Chat closed');
    }
}

// Send message to the space bot
async function sendMessage() {
    const message = messageInput.value.trim();
    
    // Validation
    if (!message) {
        showToast('Please enter a message!', 'warning');
        return;
    }
    
    if (isLoading) {
        showToast('Please wait for the current response!', 'info');
        return;
    }
    
    // Add user message to chat
    addUserMessage(message);
    
    // Clear input and reset height
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Show loading
    showLoading(true);
    
    try {
        // Send to backend API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: message,
                timestamp: new Date().toISOString()
            }),
        });
        
        // Parse response
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Add bot response
            addBotMessage(data.response);
        } else {
            // Handle API errors
            const errorMessage = data.response || 
                '🤖 Oops! Something went wrong in the cosmic network. Please try again!';
            addBotMessage(errorMessage);
            
            console.error('API Error:', data);
        }
        
    } catch (error) {
        // Handle network errors
        console.error('Network Error:', error);
        
        let errorMessage = '🛸 Houston, we have a problem! ';
        
        if (!navigator.onLine) {
            errorMessage += 'Check your internet connection and try again.';
        } else {
            errorMessage += 'The space servers are having issues. Please try again in a moment!';
        }
        
        addBotMessage(errorMessage);
    } finally {
        // Hide loading
        showLoading(false);
    }
}

// Add user message to chat
function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.textContent = message;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    
    // Add subtle animation
    setTimeout(() => {
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 10);
}

// Add bot message to chat
function addBotMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    
    // Simple text processing for better display
    messageDiv.textContent = message;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    
    // Typing animation effect
    animateTyping(messageDiv, message);
}

// Animate typing effect for bot messages
function animateTyping(element, message) {
    element.textContent = '';
    let index = 0;
    
    const typeInterval = setInterval(() => {
        if (index < message.length) {
            element.textContent += message.charAt(index);
            index++;
            scrollToBottom();
        } else {
            clearInterval(typeInterval);
        }
    }, 30); // Adjust speed as needed
}

// Show/hide loading indicator
function showLoading(show) {
    isLoading = show;
    
    if (show) {
        loadingIndicator.classList.add('visible');
        sendButton.disabled = true;
        sendButton.style.opacity = '0.6';
        sendButton.textContent = '⏳';
    } else {
        loadingIndicator.classList.remove('visible');
        sendButton.disabled = false;
        sendButton.style.opacity = '1';
        sendButton.textContent = '🚀';
    }
    
    scrollToBottom();
}

// Scroll chat to bottom
function scrollToBottom() {
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

// Add welcome message when chat loads
function addWelcomeMessage() {
    // Only add welcome message if chat is empty
    if (chatMessages.children.length === 0) {
        const welcomeMessage = "🛸 Greetings, Earthling! I'm your friendly Space Bot from the Andromeda Galaxy! Ask me anything about space, science, or just chat about life in the universe! 🌌";
        
        setTimeout(() => {
            addBotMessage(welcomeMessage);
        }, 500);
    }
}

// Show toast notifications
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add to body
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('visible');
    }, 100);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Handle connection status
window.addEventListener('online', function() {
    showToast('🌐 Connection restored! Ready to explore the cosmos!', 'success');
});

window.addEventListener('offline', function() {
    showToast('📡 Connection lost! Check your internet connection.', 'error');
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // ESC to close chat
    if (event.key === 'Escape' && chatVisible) {
        toggleChat();
    }
    
    // Ctrl/Cmd + K to open chat
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        if (!chatVisible) {
            toggleChat();
        }
    }
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleChat,
        sendMessage,
        addUserMessage,
        addBotMessage,
        showLoading,
        scrollToBottom
    };
}