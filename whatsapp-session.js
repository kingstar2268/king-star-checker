
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestWaWebVersion
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
require('dotenv').config();
const Groq = require('groq-sdk');

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;
async function startWhatsApp(sessionDir = "./kingstar-session", pairingPhone = null) {
  console.log('KING STAR BOT is starting...');

  const { state, saveCreds } =
    await useMultiFileAuthState(sessionDir);

  console.log('Connecting to WhatsApp...');

  const { version } = await fetchLatestWaWebVersion();
  console.log('WhatsApp Web version:', version);

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: ['KINGSTAR-BOT', 'Chrome', '1.0.0']
  });

  let pairingCode = null;

  sock.ev.on('creds.update', saveCreds);
sock.ev.on('connection.update', ({
  connection,
  lastDisconnect,
  qr
}) => {
    if (qr && !pairingPhone) {
      console.log('QR imepatikana! Ifuatilie kwa simu yako ya WhatsApp:');
      qrcode.generate(qr, { small: true });
      console.log('WhatsApp > Linked devices > Link a device');
    }

    if (connection === 'connecting') {
      console.log('WhatsApp connection in progress...');
    }

    if (connection === 'open') {
      console.log('KINGSTAR-BOT imeunganishwa na WhatsApp!');
    }

    if (connection === 'close') {
    const err = lastDisconnect?.error;
const status = err?.output?.statusCode;
console.log('WhatsApp disconnect:', status, err?.message);
console.log('Disconnect details:', err?.stack || err?.output || err);

      if (status !== DisconnectReason.loggedOut && !pairingPhone) {
        console.log('Muunganisho umekatika; inajaribu tena baada ya sekunde 5...');
        setTimeout(() => startWhatsApp(sessionDir, pairingPhone), 5000);
      } else {
        console.log('Session ended. You will need to reconnect.');
      }
    }
  });

    // PAIRING_DELAY_FIX
  if (pairingPhone && !state.creds.registered) {
    try {
      console.log('Inasubiri WhatsApp ifungue muunganisho...');

      await Promise.race([
        sock.waitForSocketOpen(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(
  new Error('Muda wa kusubiri muunganisho umeisha baada ya dakika 10.')
),
10 * 60 * 1000
          )
        )
      ]);

      pairingCode = await sock.requestPairingCode(pairingPhone);
      console.log('Pairing code imetengenezwa.');
    } catch (error) {
      console.error('Pairing imeshindwa:', error.message);

      try {
        sock.end(error);
      } catch (closeError) {
        console.error('Socket cleanup error:', closeError.message);
      }

      throw error;
    }
  }

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    console.log('[DEBUG] messages.upsert:', type, 'count:', messages?.length || 0);
    if (type !== 'notify') return;

    for (const msg of messages) {
      console.log('[DEBUG] Incoming message:', {
        from: msg.key?.remoteJid,
        fromMe: msg.key?.fromMe,
        messageTypes: Object.keys(msg.message || {})
      });
      if (!msg.message) continue;

      const jid = msg.key.remoteJid;
      if (!jid || jid === 'status@broadcast') continue;

      const message = msg.message;
      const text = (
        message.conversation ||
        message.extendedTextMessage?.text ||
        ''
      ).trim().toLowerCase();


      if (text === 'menu' || text === '.menu') {
        await sock.sendMessage(jid, { text:
          '╔══════════════════════════════╗\n' +
          '║       👑 KING STAR BOT       ║\n' +
          '╚══════════════════════════════╝\n\n' +
          '       ✦ BLACK & GOLD ✦\n' +
          '       YOUR WHATSAPP ASSISTANT\n\n' +
          '┏━━━〔 👑 GENERAL 〕━━━┓\n' +
          '┃ ◈ .menu     — Main menu\n' +
          '┃ ◈ .ping     — Test response\n' +
          '┃ ◈ .alive    — Bot status\n' +
          '┃ ◈ .info     — Bot information\n' +
          '┃ ◈ .owner    — Owner information\n' +
          '┃ ◈ .runtime  — Running time\n' +
          '┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n' +
          '┏━━━〔 🧰 TOOLS 〕━━━━━┓\n' +
          '┃ ◈ .number 2547XXXXXXXX\n' +
          '┃ ◈ .banhelp — Account support\n' +
          '┃ ◈ .appeal  — Appeal template\n' +
          '┃ ◈ .reporthelp — Reporting guide\n' +
          '┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n' +
          '┏━━━〔 🎵 MUSIC 〕━━━━━┓\n' +
          '┃ ◈ .play song name\n' +
          '┃ Example: .play Lil Durk\n' +
          '┃ Search results include video links\n' +
          '┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n' +
          '┏━━━〔 🛡️ GROUP COMMANDS 〕━━━┓\n' +
          '┃ ◈ .groupstats — Group statistics\n' +
          '┃ Shows group name, members and admins\n' +
          '┃ ◈ .groupinfo — Group details\n' +
          '┃ ◈ .tagall — Tag all members (admin)\n' +
          '┃ ◈ .promote @user — Make admin\n' +
          '┃ ◈ .demote @user — Remove admin\n' +
          '┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n' +
          '┏━━━〔 🎉 FUN & TOOLS 〕━━━┓\n' +
          '┃ ◈ .joke — Joke\n' +
          '┃ ◈ .fact — Random fact\n' +
          '┃ ◈ .quote — Motivation\n' +
          '┃ ◈ .calc 12*(4+2) — Calculator\n' +
          '┃ ◈ .groupinfo — Group details\n' +
          '┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n' +
          '━━━━━━━━━━━━━━━━━━━━━━━━\n' +
          '   ⚜ KING STAR BOT ⚜\n' +
          '   POWER • STYLE • RELIABILITY\n' +
          '   Use responsibly.'
        });
      } else if ((text === 'ping' || text === '.ping')) {
        await sock.sendMessage(jid, { text: '🏓 Pong!' });
      } else if ((text === 'alive' || text === '.alive')) {
        await sock.sendMessage(jid, { text: '✅ KING STAR BOT is alive!' });
      } else if ((text === 'info' || text === '.info')) {
        await sock.sendMessage(jid, { text: '👑 KING STAR BOT\nStatus: Online' });
      } else if ((text === 'runtime' || text === '.runtime')) {
        const sec = Math.floor(process.uptime());
        await sock.sendMessage(jid, { text: '⏱️ Uptime: ' + Math.floor(sec / 3600) + ' hours, ' + Math.floor((sec % 3600) / 60) + ' minutes' });
      } else if (text === '.setpp') {
        const ownerNumber = (process.env.OWNER_NUMBER || '').replace(/\D/g, '');
        const botNumber = (sock.user?.id || '').split(':')[0].split('@')[0].replace(/\D/g, '');
        const senderJid = msg.key.participant || jid;
        const senderNumber = senderJid.split('@')[0].split(':')[0].replace(/\D/g, '');
        const chatNumber = jid.split('@')[0].split(':')[0].replace(/\D/g, '');
        const isOwner = Boolean(ownerNumber) &&
          (senderNumber === ownerNumber ||
           (msg.key.fromMe && (botNumber === ownerNumber || chatNumber === ownerNumber)));

        if (!ownerNumber || !isOwner || jid.endsWith('@g.us')) {
          await sock.sendMessage(jid, {
            text: '❌ Command hii inaruhusiwa kwa owner kwenye private chat pekee.'
          });
        } else {
          try {
            const imagePath = path.join(__dirname, 'media', 'king-star-bot.png');
            if (!fs.existsSync(imagePath)) {
              throw new Error('Picha haijapatikana.');
            }
            await sock.updateProfilePicture(sock.user.id, { url: imagePath });
            await sock.sendMessage(jid, {
              text: '👑 KING STAR BOT profile picture updated!'
            });
          } catch (err) {
            console.error('Set profile picture error:', err.message);
            await sock.sendMessage(jid, {
              text: '❌ Imeshindwa kubadilisha profile picture. Angalia log za Termux.'
            });
          }
        }
      } else if ((text === 'owner' || text === '.owner')) {
        await sock.sendMessage(jid, { text: '👑 KING STAR BOT Owner' });
      } else if (text.startsWith('.number')) {
        const number = text.slice(7).trim().replace(/[+\s()-]/g, '');
        await sock.sendMessage(jid, { text: /^\d{8,15}$/.test(number)
          ? '✅ The number format looks valid. This does not confirm WhatsApp registration or account status.'
          : 'Tumia: .number 2547XXXXXXXX\nEnter 8–15 digits without letters.' });
      } else if (text === '.banhelp') {
        await sock.sendMessage(jid, { text: '📌 WhatsApp Ban Help\nOpen the official WhatsApp app and select Request a review if available. This bot cannot access private WhatsApp records or remove account restrictions.' });
      } else if (text === '.appeal') {
        await sock.sendMessage(jid, { text: '📝 Appeal Assistant\nExample message: "Hello WhatsApp Support, please review my account restriction. I believe this may have been a mistake. I will follow WhatsApp Terms of Service. Thank you."\nSubmit it through an official WhatsApp support channel.' });
      } else if (text === '.reporthelp') {
        await sock.sendMessage(jid, { text: 'ℹ️ Report Guide\nReport an account or message only for genuine violations. Use WhatsApp\'s Report feature; do not submit false reports or coordinate reports against someone.' });
      } else if (text === '.ai' || text.startsWith('.ai ')) {
        // AI imezimwa kwa makusudi.
      } else if (text === '.play' || text.startsWith('.play ')) {
        const query = text.slice(5).trim();
        if (!query) {
          await sock.sendMessage(jid, {
            text: '🎵 KING STAR PLAY — YouTube\nTumia: .play jina-la-wimbo au msanii\nMfano: .play Lil Durk'
          });
        } else {
          try {
            const yts = require('yt-search');
            const result = await yts.search(query);
            const videos = (result.videos || []).slice(0, 3);
            if (!videos.length) {
              await sock.sendMessage(jid, { text: `❌ Hakuna matokeo ya YouTube kwa: ${query}` });
            } else {
              const output = '🎵 KING STAR PLAY — YouTube\n\n' +
                videos.map((video, index) => `${index + 1}. ${video.title}\n${video.url}`).join('\n\n') +
                '\n\nFungua link kuchagua video au wimbo.';
              await sock.sendMessage(jid, { text: output });
            }
          } catch (err) {
            console.error('YouTube search error:', err.message);
            await sock.sendMessage(jid, { text: '❌ Utafutaji wa YouTube umeshindwa. Jaribu tena baadaye.' });
          }
        }
      } else if (text === '.groupstats') {
        if (!jid.endsWith('@g.us')) {
          await sock.sendMessage(jid, {
            text: 'ℹ️ Command hii inatumika ndani ya group la WhatsApp pekee.'
          });
        } else {
          try {
            const metadata = await sock.groupMetadata(jid);
            const participants = metadata.participants || [];
            const admins = participants.filter(
              member => member.admin === 'admin' || member.admin === 'superadmin'
            ).length;

            await sock.sendMessage(jid, {
              text: '📊 KING STAR GROUP STATS\n\n' +
                '👑 Jina: ' + metadata.subject + '\n' +
                '👥 Wanachama: ' + participants.length + '\n' +
                '🛡️ Admins: ' + admins
            });
          } catch (err) {
            console.error('Group stats error:', err.message);
            await sock.sendMessage(jid, {
              text: '❌ Imeshindwa kupata taarifa za group. Jaribu tena.'
            });
          }
        }

      // KINGSTAR_EXTRA_COMMANDS_V1
      } else if (text === '.joke') {
        const jokes = [
          '😂 Kwa nini computer haipendi baridi? Kwa sababu ina Windows!',
          '🤣 Kwa nini simu ilienda shule? Ili kupata smart!',
          '😄 Programmer akichelewa anasema: bado niko loading!'
        ];
        await sock.sendMessage(jid, {
          text: jokes[Math.floor(Math.random() * jokes.length)]
        });
      } else if (text === '.fact') {
        const facts = [
          '🌍 Dunia huzunguka Jua.',
          '🐙 Pweza ana mioyo mitatu.',
          '🌙 Mwezi haujitoi mwanga wake; huakisi mwanga wa Jua.'
        ];
        await sock.sendMessage(jid, {
          text: facts[Math.floor(Math.random() * facts.length)]
        });
      } else if (text === '.quote') {
        const quotes = [
          '💯 Small steps every day lead to big progress.',
          '👑 Discipline is choosing what matters most.',
          '🔥 Usikate tamaa; jifunze na endelea mbele.'
        ];
        await sock.sendMessage(jid, {
          text: quotes[Math.floor(Math.random() * quotes.length)]
        });
      } else if (text === '.calc' || text.startsWith('.calc ')) {
        const expression = text.slice(5).trim();
        if (!expression || expression.length > 80 ||
            !/^[0-9+\-*/().%\s]+$/.test(expression)) {
          await sock.sendMessage(jid, {
            text: '🧮 Tumia: .calc 12*(4+2)\nMfano mwingine: .calc 100/4'
          });
        } else {
          try {
            const tokens = expression.match(/\d+(?:\.\d+)?|[()+\-*/%]/g) || [];
            if (tokens.join('') !== expression.replace(/\s/g, '')) {
              throw new Error('Invalid expression');
            }
            let index = 0;
            function factor() {
              const token = tokens[index++];
              if (token === '+') return factor();
              if (token === '-') return -factor();
              if (token === '(') {
                const value = sum();
                if (tokens[index++] !== ')') throw new Error('Missing )');
                return value;
              }
              if (token === undefined || !/^\d+(?:\.\d+)?$/.test(token)) {
                throw new Error('Expected number');
              }
              return Number(token);
            }
            function term() {
              let value = factor();
              while (['*', '/', '%'].includes(tokens[index])) {
                const op = tokens[index++];
                const right = factor();
                if ((op === '/' || op === '%') && right === 0) {
                  throw new Error('Division by zero');
                }
                if (op === '*') value *= right;
                if (op === '/') value /= right;
                if (op === '%') value %= right;
              }
              return value;
            }
            function sum() {
              let value = term();
              while (tokens[index] === '+' || tokens[index] === '-') {
                const op = tokens[index++];
                const right = term();
                value = op === '+' ? value + right : value - right;
              }
              return value;
            }
            const result = sum();
            if (index !== tokens.length) throw new Error('Unexpected token');
            if (typeof result !== 'number' || !Number.isFinite(result)) {
              throw new Error('Invalid result');
            }
            await sock.sendMessage(jid, {
              text: '🧮 Jibu: ' + result
            });
          } catch {
            await sock.sendMessage(jid, {
              text: '❌ Hesabu si sahihi. Mfano: .calc (10+5)*2'
            });
          }
        }
      } else if (text === '.groupinfo') {
        if (!jid.endsWith('@g.us')) {
          await sock.sendMessage(jid, {
            text: 'ℹ️ Tumia .groupinfo ndani ya WhatsApp group.'
          });
        } else {
          try {
            const metadata = await sock.groupMetadata(jid);
            const members = metadata.participants || [];
            const admins = members.filter(
              member => member.admin === 'admin' ||
                        member.admin === 'superadmin'
            ).length;
            await sock.sendMessage(jid, {
              text: '📋 KING STAR GROUP INFO\n\n' +
                '🏷️ Jina: ' + metadata.subject + '\n' +
                '👥 Wanachama: ' + members.length + '\n' +
                '🛡️ Admins: ' + admins + '\n' +
                '📝 Maelezo: ' + (metadata.desc || 'Hakuna maelezo')
            });
          } catch (err) {
            console.error('Group info error:', err.message);
            await sock.sendMessage(jid, {
              text: '❌ Imeshindwa kupata taarifa za group.'
            });
          }
        }


      // KINGSTAR_GROUP_COMMANDS_V1
      } else if (['.tagall', '.promote', '.demote'].includes(text.split(/\s+/)[0])) {
        try {
          if (!jid.endsWith('@g.us')) {
            await sock.sendMessage(jid, {
              text: '❌ Command hii inatumika ndani ya group tu.'
            });
            continue;
          }

          const metadata = await sock.groupMetadata(jid);
          const members = metadata.participants || [];
          const sender = msg.key.participant || jid;

          const normalizeJid = value => {
            const normalized = String(value || '').trim().toLowerCase();
            const at = normalized.indexOf('@');

            if (at === -1) {
              return normalized.split(':')[0];
            }

            const user = normalized.slice(0, at).split(':')[0];
            const server = normalized.slice(at + 1);

            return user + '@' + server;
          };

          const sameJid = (a, b) =>
            Boolean(normalizeJid(a)) &&
            normalizeJid(a) === normalizeJid(b);

          const memberMatches = (member, value) =>
            [member?.id, member?.jid, member?.lid].some(
              candidate => sameJid(candidate, value)
            );

          const senderMember = members.find(member =>
            memberMatches(member, sender)
          );

          const senderIsAdmin = senderMember &&
            (senderMember.admin === 'admin' ||
             senderMember.admin === 'superadmin');

          if (!senderIsAdmin) {
            await sock.sendMessage(jid, {
              text: '⛔ Command hii inaruhusiwa kwa admin wa group tu.'
            });
            continue;
          }

          const botJid = sock.user?.id;

          const botMember = members.find(member =>
            memberMatches(member, botJid)
          );

          const botIsAdmin = botMember &&
            (botMember.admin === 'admin' ||
             botMember.admin === 'superadmin');

          const command = text.split(/\s+/)[0];

          if (command === '.tagall') {
            const mentions = members.map(member => member.id).filter(Boolean);
            const messageText = text.slice('.tagall'.length).trim();

            await sock.sendMessage(jid, {
              text: (messageText ? messageText + '\n\n' : '📢 *TAG ALL MEMBERS*\n\n') +
                mentions.map(id => '@' + id.split('@')[0].split(':')[0]).join(' '),
              mentions
            });
            continue;
          }

          if (!botIsAdmin) {
            await sock.sendMessage(jid, {
              text: '❌ Bot lazima iwe admin ili kutumia promote/demote.'
            });
            continue;
          }

          const mentioned =
            msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

          if (mentioned.length !== 1) {
            await sock.sendMessage(jid, {
              text: '⚠️ Tumia command kwa kumtag mtu mmoja.\nMfano: .promote @mtumiaji'
            });
            continue;
          }

          const target = mentioned[0];
          const targetMember = members.find(member =>
            memberMatches(member, target)
          );

          if (!targetMember) {
            await sock.sendMessage(jid, {
              text: '❌ Sijampata huyo mwanachama kwenye group.'
            });
            continue;
          }

          const action = command === '.promote' ? 'promote' : 'demote';

          const results = await sock.groupParticipantsUpdate(
            jid,
            [targetMember.id],
            action
          );

          const result = results?.[0];

          if (result?.status === '200') {
            await sock.sendMessage(jid, {
              text: command === '.promote'
                ? '✅ Ombi la kumpa admin limekubaliwa.'
                : '✅ Ombi la kuondoa admin limekubaliwa.',
              mentions: [targetMember.id]
            });
          } else {
            console.error('Group action result:', result);
            await sock.sendMessage(jid, {
              text: '⚠️ WhatsApp haijathibitisha ombi. Angalia ruhusa za bot na hali ya group.'
            });
          }

        } catch (err) {
          console.error('Group command error:', err.message);
          await sock.sendMessage(jid, {
            text: '❌ Command imeshindwa. Hakikisha bot ina ruhusa za group.'
          });
        }

      } else if (text.startsWith('.')) {
        const utilityCommand = text.trim().split(/\s+/)[0].toLowerCase();
        const utilityArg = text.trim().slice(utilityCommand.length).trim();

        if (utilityCommand === '.ping' || utilityCommand === '.ping2') {
          await sock.sendMessage(jid, { text: '🏓 Pong! KING STAR BOT iko hai.' });

        } else if (utilityCommand === '.alive') {
          await sock.sendMessage(jid, { text: '✅ KING STAR BOT iko hai!' });

        } else if (utilityCommand === '.runtime') {
          const seconds = Math.floor(process.uptime());
          const hours = Math.floor(seconds / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          await sock.sendMessage(jid, {
            text: '⏱️ Runtime: ' + hours + ' saa, ' + minutes + ' dakika.'
          });

        } else if (utilityCommand === '.info') {
          await sock.sendMessage(jid, {
            text: '👑 KING STAR BOT\nLibrary: Baileys\nNode.js: ' + process.version
          });

        } else if (utilityCommand === '.joke') {
          const jokes = [
            '😂 Kwa nini computer ilikuwa baridi? Kwa sababu iliacha Windows wazi!',
            '🤣 Kwa nini simu ilienda shule? Ili ipate connection!',
            '😄 Wi-Fi ilimwambia nini router? Kuna connection kati yetu!'
          ];
          await sock.sendMessage(jid, {
            text: jokes[Math.floor(Math.random() * jokes.length)]
          });

        } else if (utilityCommand === '.fact') {
          const facts = [
            '🐙 Pweza ana mioyo mitatu.',
            '🌍 Dunia huzunguka mhimili wake.',
            '🐝 Nyuki hutumia mienendo kuwasilisha taarifa kuhusu chakula.'
          ];
          await sock.sendMessage(jid, {
            text: facts[Math.floor(Math.random() * facts.length)]
          });

        } else if (utilityCommand === '.quote') {
          const quotes = [
            '🌟 Hatua ndogo kila siku huleta maendeleo.',
            '💪 Usikate tamaa kwa sababu ya mwanzo mgumu.',
            '📚 Maarifa hukua unapojifunza kila siku.'
          ];
          await sock.sendMessage(jid, {
            text: quotes[Math.floor(Math.random() * quotes.length)]
          });

        } else if (utilityCommand === '.coinflip') {
          await sock.sendMessage(jid, {
            text: Math.random() < 0.5 ? '🪙 HEADS' : '🪙 TAILS'
          });

        } else if (utilityCommand === '.dice') {
          await sock.sendMessage(jid, {
            text: '🎲 Umetupa: ' + (1 + Math.floor(Math.random() * 6))
          });

        } else if (utilityCommand === '.8ball' || utilityCommand === '.magic8') {
          const answers = [
            '🎱 Ndiyo!', '🎱 Hapana.', '🎱 Inawezekana.',
            '🎱 Jaribu tena baadaye.', '🎱 Siwezi kuthibitisha hilo.'
          ];
          await sock.sendMessage(jid, {
            text: answers[Math.floor(Math.random() * answers.length)]
          });

        } else if (utilityCommand === '.riddle') {
          await sock.sendMessage(jid, {
            text: '🧩 Kitendawili: Nina meno mengi lakini sili chakula. Mimi ni nani?\nJibu: Sega.'
          });

        } else if (utilityCommand === '.truth') {
          const questions = [
            '🤔 Ni jambo gani unalotaka kujifunza mwaka huu?',
            '🤔 Ni mafanikio gani yanayokufurahisha zaidi?',
            '🤔 Ni ujuzi gani mpya ungependa kuwa nao?'
          ];
          await sock.sendMessage(jid, {
            text: questions[Math.floor(Math.random() * questions.length)]
          });

        } else if (utilityCommand === '.dare') {
          const dares = [
            '🎯 Taja vitu vitatu unavyovithamini.',
            '🎯 Sema jambo moja jipya ulilojifunza leo.',
            '🎯 Tuma emoji tatu zinazoeleza mood yako.'
          ];
          await sock.sendMessage(jid, {
            text: dares[Math.floor(Math.random() * dares.length)]
          });

        } else if (utilityCommand === '.rps' || utilityCommand === '.rps2') {
          const choices = ['🪨 Rock', '📄 Paper', '✂️ Scissors'];
          await sock.sendMessage(jid, {
            text: '🤖 Nimechagua: ' + choices[Math.floor(Math.random() * 3)]
          });

        } else if (utilityCommand === '.math' || utilityCommand === '.calc' || utilityCommand === '.calculator') {
          const match = utilityArg.match(/^(-?\d+(?:\.\d+)?)\s*([+\-*/%])\s*(-?\d+(?:\.\d+)?)$/);
          if (!match) {
            await sock.sendMessage(jid, {
              text: 'Tumia: .calc 12 * 4\nOperators: + - * / %'
            });
          } else {
            const a = Number(match[1]);
            const op = match[2];
            const b = Number(match[3]);
            let result;
            if (op === '+') result = a + b;
            else if (op === '-') result = a - b;
            else if (op === '*') result = a * b;
            else if (op === '/') result = b === 0 ? null : a / b;
            else result = b === 0 ? null : a % b;

            await sock.sendMessage(jid, {
              text: result === null || !Number.isFinite(result)
                ? '⚠️ Hesabu hii haiwezi kufanyika.'
                : '🧮 Jibu: ' + result
            });
          }

        } else if (utilityCommand === '.wordcount' || utilityCommand === '.charcount') {
          await sock.sendMessage(jid, {
            text: '🔢 Maneno: ' + (utilityArg ? utilityArg.split(/\s+/).length : 0) +
              '\nHerufi: ' + utilityArg.length
          });

        } else if (utilityCommand === '.reverse') {
          await sock.sendMessage(jid, {
            text: utilityArg ? Array.from(utilityArg).reverse().join('') : 'Tumia: .reverse maandishi'
          });

        } else if (utilityCommand === '.upper' || utilityCommand === '.uppercase') {
          await sock.sendMessage(jid, {
            text: utilityArg ? utilityArg.toUpperCase() : 'Tumia: .upper maandishi'
          });

        } else if (utilityCommand === '.lower' || utilityCommand === '.lowercase') {
          await sock.sendMessage(jid, {
            text: utilityArg ? utilityArg.toLowerCase() : 'Tumia: .lower maandishi'
          });

        } else if (utilityCommand === '.base64' || utilityCommand === '.b64enc') {
          await sock.sendMessage(jid, {
            text: utilityArg
              ? Buffer.from(utilityArg, 'utf8').toString('base64')
              : 'Tumia: .base64 maandishi'
          });

        } else if (utilityCommand === '.unbase64' || utilityCommand === '.b64dec') {
          try {
            const decoded = Buffer.from(utilityArg, 'base64').toString('utf8');
            await sock.sendMessage(jid, {
              text: utilityArg ? '📄 ' + decoded : 'Tumia: .unbase64 BASE64_TEXT'
            });
          } catch {
            await sock.sendMessage(jid, { text: '⚠️ Base64 haijasomeka.' });
          }

        } else if (utilityCommand === '.uuid') {
          await sock.sendMessage(jid, {
            text: '🆔 ' + require('crypto').randomUUID()
          });

        } else if (utilityCommand === '.timestamp') {
          await sock.sendMessage(jid, {
            text: '🕒 ' + Date.now()
          });

        } else if (utilityCommand === '.choose') {
          const options = utilityArg.split(',').map(x => x.trim()).filter(Boolean);
          await sock.sendMessage(jid, {
            text: options.length >= 2
              ? '🎯 Nimechagua: ' + options[Math.floor(Math.random() * options.length)]
              : 'Tumia: .choose chai, kahawa, maji'
          });

        } else if (utilityCommand === '.emoji') {
          const emojis = ['😀', '😂', '🔥', '🌹', '💯', '🎉', '👑', '✨', '🐱', '⚽'];
          await sock.sendMessage(jid, {
            text: emojis[Math.floor(Math.random() * emojis.length)]
          });

        } else if (utilityCommand === '.groupinfo' || utilityCommand === '.members' || utilityCommand === '.admins') {
          if (!jid.endsWith('@g.us')) {
            await sock.sendMessage(jid, { text: '⚠️ Command hii inafanya kazi kwenye group tu.' });
          } else {
            try {
              const metadata = await sock.groupMetadata(jid);
              if (utilityCommand === '.groupinfo') {
                await sock.sendMessage(jid, {
                  text: '📋 *GROUP INFO*\nJina: ' + metadata.subject +
                    '\nMembers: ' + metadata.participants.length +
                    '\nGroup ID: ' + jid
                });
              } else {
                const list = metadata.participants.filter(member =>
                  utilityCommand === '.admins'
                    ? member.admin === 'admin' || member.admin === 'superadmin'
                    : true
                );
                await sock.sendMessage(jid, {
                  text: (utilityCommand === '.admins' ? '👑 *GROUP ADMINS*' : '👥 *GROUP MEMBERS*') +
                    '\n' + list.slice(0, 100).map((member, i) =>
                      (i + 1) + '. @' + String(member.id || '').split('@')[0].split(':')[0]
                    ).join('\n'),
                  mentions: list.slice(0, 100).map(member => member.id).filter(Boolean)
                });
              }
            } catch (err) {
              console.error('Group info command error:', err.message);
              await sock.sendMessage(jid, { text: '⚠️ Imeshindwa kupata taarifa za group.' });
            }
          }

        } else {
          await sock.sendMessage(jid, {
            text: '⚠️ Command haijulikani. Andika menu kuona commands zilizopo.'
          });
        }
      }
    }
  });
  return { sock, pairingCode };
}

module.exports = { startWhatsApp };
