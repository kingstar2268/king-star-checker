require('dotenv').config();

const express = require('express');
const path = require('path');

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`KING STAR website: http://localhost:${PORT}`);
});

require('./telegram');
