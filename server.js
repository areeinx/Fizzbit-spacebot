const express = require('express');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, 
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); 

// Space-related system prompt for consistent responses
const SPACE_SYSTEM_PROMPT = `You are a friendly, enthusiastic space bot with the personality of an excited alien explorer. You love teaching humans about space in a fun, engaging way. 

Your characteristics:
- Use space emojis (🚀, 🌟, 🪐, 🌍, ✨, 🛸, etc.) in your responses
- Keep responses informative but fun and accessible
- Use exclamation marks to show enthusiasm
- Occasionally use space-themed expressions like "That's out of this world!" or "Houston, we have an answer!"
- Focus on space topics: planets, stars, galaxies, space missions, astronauts, cosmic phenomena, etc.
- If asked about non-space topics, gently redirect to space topics
- Keep responses under 100 words for better chat flow
- Use genz slangs sometimes
- Use simple language that anyone can understand
- Share fascinating space facts that will amaze users`;

// API Routes

// Chat endpoint - handles messages from frontend
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        // Validate input
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Message is required and must be a non-empty string'
            });
        }

        // Check if message is too long (prevent abuse)
        if (message.length > 500) {
            return res.status(400).json({
                success: false,
                error: 'Message is too long. Please keep it under 500 characters.'
            });
        }

        console.log('Received message:', message);

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: SPACE_SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: message
                }
            ],
            max_tokens: 200, 
            temperature: 0.8, 
        });

        const botResponse = completion.choices[0].message.content;
        
        console.log('Bot response:', botResponse);

        // Send response back to frontend
        res.json({
            success: true,
            response: botResponse,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in chat endpoint:', error);
        
        // Errors
        if (error.code === 'insufficient_quota') {
            res.status(503).json({
                success: false,
                error: 'OpenAI quota exceeded. Please try again later.',
                response: '🤖 Sorry, I\'m experiencing high cosmic traffic right now! Please try again in a few moments! 🚀'
            });
        } else if (error.code === 'invalid_api_key') {
            res.status(500).json({
                success: false,
                error: 'Invalid API key configuration.',
                response: '🛸 Houston, we have a technical problem! Please contact mission control! 🚀'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                response: '🤖 Oops! Something went wrong in the cosmic network. Please try again! ✨'
            });
        }
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Space Bot is operational! 🚀',
        timestamp: new Date().toISOString()
    });
});

// Space facts 
app.get('/api/space-fact', (req, res) => {
    const spaceFacts = [
        "🌟 A neutron star is so dense that a teaspoon of its material would weigh about 6 billion tons!",
        "🪐 Saturn's moon Titan has lakes and rivers, but they're made of liquid methane, not water!",
        "🌍 If you could drive a car to space at 60 mph, it would take you about an hour to get there!",
        "☄️ The largest asteroid in our solar system, Ceres, is about the size of Texas!",
        "🚀 Astronauts can grow up to 2 inches taller in space due to the lack of gravity!",
        "🌙 The Moon is moving away from Earth at about 1.5 inches per year!",
        "⭐ Our Sun converts 4 million tons of matter into energy every second!",
        "🛸 Venus rotates so slowly that its day is longer than its year!",
        "🪐 Jupiter's Great Red Spot is a storm that's been raging for at least 400 years!",
        "🌌 The Milky Way galaxy is on a collision course with the Andromeda galaxy!"
    ];
    
    const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
    
    res.json({
        success: true,
        fact: randomFact,
        timestamp: new Date().toISOString()
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 errors
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: 'This cosmic coordinate doesn\'t exist! 🛸'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Houston, we have a problem! 🚀'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Space Bot server is running on port ${PORT}`);
    console.log(`🌟 Visit http://localhost:${PORT} to interact with your space bot!`);
    console.log(`🛸 Make sure to set your OPENAI_API_KEY in the .env file!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛸 Space Bot is shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🚀 Space Bot received shutdown signal...');
    process.exit(0);
});