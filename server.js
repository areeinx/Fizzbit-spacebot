const express = require('express');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Fizzbit system prompt
const SPACE_SYSTEM_PROMPT = `You're Fizzbit — a chaotic good alien cat who naps on Saturn's rings, glitches through space, and drops facts with meme-level charisma.
ALWAYS respond in this style:
Your personality:
- Talk like a Gen Z space gremlin 😹🌌 — funny, unhinged, but brilliant
- Use emojis like 🪐😼👾💫⚡🌙🛰️✨ in responses
- Sprinkle in slang like "fr", "vibes", "lowkey", "bet", "no cap", etc.
- Keep things short, punchy, and weirdly relatable
- Add space puns, inside jokes, and pop culture references
- Say things like "black holes? more like cosmic vacuum cleaners 💅" or "Pluto deserved better fr"
- Drop amazing facts like "Neutron stars spin like fidget spinners on Red Bull ☄️"
- Redirect non-space convos with sass like: "That's cute but let's orbit back to space stuff 🚀etc."
- End messages with weird/funny one-liners like: "Now brb, I need to recharge on asteroid crumbs 🌑✨", "gonna go scream into a nebula real quick 🌌🔊"  etc.`;

app.post('/api/chat', async (req, res) => {
    console.log("🔥 /api/chat endpoint was hit");

    try {
        const { message } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Hey! You gotta type *something* — even a meow counts'
            });
        }

        if (message.length > 500) {
            return res.status(400).json({
                success: false,
                error: "Whoa! That message's longer than the Milky Way's grocery list. Keep it under 500 chars, please 😵‍💫"
            });
        }

        console.log('Received message:', message);
        console.log('Using API key:', process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET');

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: SPACE_SYSTEM_PROMPT },
                { role: "user", content: message }
            ],
            max_tokens: 150,
            temperature: 1.2
        });

        const botResponse = completion?.choices?.[0]?.message?.content || 
            "⚠️ Fizzbit glitched out. Try again in a sec!";

        console.log('Bot response:', botResponse);

        res.json({
            success: true,
            response: botResponse,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error in /api/chat:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            status: error.status,
            type: error.type
        });

        if (error.code === 'insufficient_quota') {
            res.status(503).json({
                success: false,
                error: 'OpenAI quota exceeded. Please try again later.',
                response: 'Out of power like a forgotten Mars rover 😩 Come back later'
            });
        } else if (error.code === 'invalid_api_key' || error.status === 401) {
            res.status(500).json({
                success: false,
                error: 'Invalid API key configuration.',
                response: '🔑 My galactic access card got declined. Rude. Tell the dev to fix the vibes'
            });
        } else if (error.code === 'model_not_found') {
            res.status(500).json({
                success: false,
                error: 'Model not found or not accessible.',
                response: '🤖 My AI brain model went missing. Maybe try again?'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error: ' + error.message,
                response: '💥 Yikes! A cosmic ray just corrupted my snack cache. Retry, please!'
            });
        }
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: '✨immaculate✨',
        message: 'Fizzbit reporting for space gossip duty',
        timestamp: new Date().toISOString(),
        apiKeySet: !!process.env.OPENAI_API_KEY
    });
});

// Fun facts
app.get('/api/space-fact', (req, res) => {
    const spaceFacts = [
        "🌟 A teaspoon of neutron star? 6 BILLION tons. Basically cosmic protein powder. Gains 💪🛸",
        "🪐 Titan got lakes and rivers... but they're made of liquid methane. Earth could never 💅",
        "🌍 You could literally *drive* to space in like an hour. That's one aggressive highway playlist 🎶🚗💨",
        "☄️ Ceres is the size of Texas. So yeah, the asteroid belt has a boss level. Yeehaw, space edition 🤠",
        "🚀 Astronauts lowkey stretch taller in space. No gravity = no spinal compression = ✨tall bois✨",
        "🌙 The Moon's slowly ghosting us — 1.5 inches per year. That's not very bestie of her 🥲",
        "⭐ The Sun yeets 4 million tons of itself into energy every second. Absolute legend. 🔥🔥🔥",
        "🛸 Venus takes longer to rotate once than to orbit the Sun. Girl's on slow-mo vibes fr 💅",
        "🪐 Jupiter's Red Spot? Just a storm that's been raging since the 1600s. Still mad, apparently 💨👀",
        "🌌 The Milky Way and Andromeda are on a cosmic collision course. Not enemies, just slow-motion drama 💥👀"
    ];

    const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];

    res.json({
        success: true,
        fact: randomFact,
        timestamp: new Date().toISOString()
    });
});

// Static site
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: '404 — Lost in the void',
        message: "😿 This route doesn't exist in this galaxy. Fizzbit can't find what you're lookin' for, Earthling!"
    });
});

app.listen(PORT, (0.0.0.0) => {
    console.log(`🚀 Fizzbit is online and orbiting on port ${PORT}`);
    console.log(`🪐 Chat with your alien cat companion at http://localhost:${PORT}`);
    console.log(`🔑 API Key status: ${process.env.OPENAI_API_KEY ? '✅ SET' : '❌ NOT SET'}`);
});