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


app.post('/api/chat', (req, res) => {
  const message = String(req.body.message || '').trim().toLowerCase();

  let reply;
  if (!message) {
    reply = 'Andika ujumbe kwanza.';
  } else if (message.includes('hello') || message.includes('hi') || message.includes('habari')) {
    reply = 'Habari! Mimi ni KING STAR BOT. Nikusaidie nini?';
  } else if (message.includes('king star')) {
    reply = 'Karibu KING STAR CHECKER! Naweza kueleza jinsi ya kutumia website yetu.';
  } else if (message.includes('whatsapp') || message.includes('ban')) {
    reply = 'Kwa sasa checker hii inathibitisha format ya namba tu; haiwezi kuthibitisha WhatsApp ban.';
  } else if (message.includes('telegram')) {
    reply = 'Telegram itaunganishwa katika hatua inayofuata.';
  } else {
    reply = 'Asante kwa ujumbe wako! Mimi ni KING STAR BOT ya majaribio. Jaribu kuuliza kuhusu KING STAR, WhatsApp au Telegram.';
  }

  res.json({ reply });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`KING STAR website: http://localhost:${PORT}`);
});
