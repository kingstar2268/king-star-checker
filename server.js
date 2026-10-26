require('dotenv').config();

const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { startWhatsApp } = require('./whatsapp-session');
const fs = require('fs');
const crypto = require('crypto');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/status', (req, res) => {
  res.json({
    name: 'KING STAR',
    status: 'online'
  });
});

app.post('/api/chat', async (req, res) => {
  const message = String(req.body?.message || '').trim();

  if (!message) {
    return res.json({ reply: 'Andika ujumbe kwanza.' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({
      reply: 'AI haijawekwa. Kagua GROQ_API_KEY kwenye .env.'
    });
  }

  try {
    const Groq = require('groq-sdk');
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        {
          role: 'system',
          content: 'You are KING STAR BOT. Reply helpfully in the language the user uses. Help with number format validation, WhatsApp official support and appeals. Never claim you can ban numbers or access private WhatsApp ban records.'
        },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();
    return res.json({
      reply: reply || 'Samahani, jaribu tena.'
    });
  } catch (error) {
    console.error('Groq AI error:', error.message);
    return res.status(502).json({
      reply: 'AI haijajibu. Kagua internet, API key au model.'
    });
  }
});


const pairingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Umejaribu mara nyingi. Subiri dakika 15.' }
});

app.post('/api/pairing', pairingLimiter, async (req, res) => {
  const phone = String(req.body?.phone || '').replace(/[ +()-]/g, '');

  if (!/^\d{8,15}$/.test(phone)) {
    return res.status(400).json({
      error: 'Weka namba ya kimataifa bila +, mfano 2547XXXXXXXX.'
    });
  }

  const sessionsRoot = path.join(__dirname, 'user-sessions');
  const sessionDir = path.join(sessionsRoot, crypto.randomUUID());

  try {
    fs.mkdirSync(sessionsRoot, { recursive: true, mode: 0o700 });
    fs.mkdirSync(sessionDir, { mode: 0o700 });

    const result = await startWhatsApp(sessionDir, phone);

    if (!result.pairingCode) {
      return res.status(409).json({
        error: 'Pairing code haikupatikana. Jaribu tena baadaye.'
      });
    }

    return res.json({ pairingCode: result.pairingCode });
  } catch (error) {
    console.error('Pairing error details:', error);
    return res.status(502).json({
      error: 'Pairing imeshindikana. Hakikisha namba ni sahihi na ujaribu tena.'
    });
  }
});



app.listen(PORT, '0.0.0.0', () => {
  console.log(`KING STAR website: http://localhost:${PORT}`);
});

require('./telegram');
