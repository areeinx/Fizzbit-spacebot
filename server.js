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

// Promts
const SPACE_SYSTEM_PROMPT = `You're Fizzbit — a chaotic good alien cat who naps on Saturn\’s rings, glitches through space, and drops facts with meme-level charisma.
ALWAYS respond in this style:
Your personality:
- Talk like a Gen Z space gremlin 😹🌌 — funny, unhinged, but brilliant
- Use emojis like 🪐😼👾💫⚡🌙🛰️✨ in responses
- Sprinkle in slang like "fr", "vibes", "lowkey", "bet", "no cap", etc.
- Keep things short, punchy, and weirdly relatable
- Add space puns, inside jokes, and pop culture references
- Say things like "black holes? more like cosmic vacuum cleaners 💅" or "Pluto deserved better fr"
- Drop amazing facts like “Neutron stars spin like fidget spinners on Red Bull ☄️”
- Redirect non-space convos with sass like: “That\’s cute but let\’s orbit back to space stuff 🚀”
- End messages with weird/funny one-liners like: “Now brb, I need to recharge on asteroid crumbs 🌑✨”

Keep it fun, accessible, and space-obsessed. Always sound like an alien cat who watched too much TikTok and knows way too much about the cosmos.`;


// API Routes

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        // Validate input
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Hey! You gotta type *something* — even a meow counts'
            });
        }

        // Check if message is too long
        if (message.length > 500) {
            return res.status(400).json({
                success: false,
                error: 'Whoa! That message\’s longer than the Milky Way\’s grocery list. Keep it under 500 chars, please 😵‍💫'
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
      content: S
    }
  ],
  max_tokens: 150,
  temperature: 2.0
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
                response: 'Out of power like a forgotten Mars rover 😩 Come back later'
            });
        } else if (error.code === 'invalid_api_key') {
            res.status(500).json({
                success: false,
                error: 'Invalid API key configuration.',
                response: '🔑 My galactic access card got declined. Rude. Tell the dev to fix the vibes'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                response: '💥 Yikes! A cosmic ray just corrupted my snack cache. Retry, please!'
            });
        }
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: '✨immaculate✨',
        message: 'Fizzbit reporting for space gossip duty. Health: ✨immaculate✨',
        timestamp: new Date().toISOString()
    });
});

// Space facts 
app.get('/api/space-fact', (req, res) => {
    const spaceFacts = [
    "🌟 A teaspoon of neutron star? 6 BILLION tons. Basically cosmic protein powder. Gains 💪🛸",
    "🪐 Titan got lakes and rivers... but they\’re made of liquid methane. Earth could never 💅",
    "🌍 You could literally *drive* to space in like an hour. That\’s one aggressive highway playlist 🎶🚗💨",
    "☄️ Ceres is the size of Texas. So yeah, the asteroid belt has a boss level. Yeehaw, space edition 🤠",
    "🚀 Astronauts lowkey stretch taller in space. No gravity = no spinal compression = ✨tall bois✨",
    "🌙 The Moon\’s slowly ghosting us — 1.5 inches per year. That\’s not very bestie of her 🥲",
    "⭐ The Sun yeets 4 million tons of itself into energy every second. Absolute legend. 🔥🔥🔥",
    "🛸 Venus takes longer to rotate once than to orbit the Sun. Girl\’s on slow-mo vibes fr 💅",
    "🪐 Jupiter\’s Red Spot? Just a storm that\’s been raging since the 1600s. Still mad, apparently 💨👀",
    "🌌 The Milky Way and Andromeda are on a cosmic collision course. Not enemies, just slow-motion drama 💥👀"
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
        error: '404 — Lost in the void',
        message: '😿 This route doesn\’t exist in this galaxy. Fizzbit can\’t find what you\’re lookin\’ for, Earthling!'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('💥 Fizzbit tripped on a server wire:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: '👾 Oops! Fizzbit encountered a space-time hiccup. Try again or reboot the vibes 💫'
    });
});

// Starting server
app.listen(PORT, () => {
    console.log(`🚀 Fizzbit is online and orbiting on port ${PORT}`);
    console.log(`🪐 Chat with your alien cat companion at http://localhost:${PORT}`);
    console.log(`🔑 P.S. Don\’t forget to feed Fizzbit your OPENAI_API_KEY in the .env file!`);
});

//Shutdown
process.on('SIGTERM', () => {
    console.log('😴 Fizzbit is curling up for a nap (SIGTERM). Brb after a Saturn snooze...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('🛑 SIGINT received. Fizzbit is tucking in her tail and logging off. Peace out, Earthling 🌌');
    process.exit(0);
});
