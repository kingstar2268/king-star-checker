const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TOKEN) {
  console.log("KING STAR BOT: TELEGRAM_BOT_TOKEN haijawekwa.");
} else {
  let offset = 0;
  let polling = false;

  async function checkUpdates() {
    if (polling) return;
    polling = true;

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${offset}&timeout=25`
      );
      const data = await response.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;

          const message = update.message;
          if (!message || !message.text) continue;

          const chatId = message.chat.id;
          const text = message.text.trim().toLowerCase();

          let reply;

          if (["hi", "hello", "habari", "mambo"].includes(text)) {
            reply = "Habari! 👑 Mimi ni KING STAR BOT. Nikusaidie nini?";
          } else if (text.includes("king star")) {
            reply = "👑 KING STAR BOT iko online!";
          } else if (
            text.includes("whatsapp") ||
            text.includes("ban") ||
            text.includes("number")
          ) {
            reply =
              "Ninaweza kusaidia kueleza mambo ya WhatsApp, lakini siwezi kuthibitisha kama namba imepigwa ban.";
          } else if (text === "/start") {
            reply =
              "Karibu KING STAR BOT! 👑 Tuma ujumbe uniambie nikusaidie nini.";
          } else {
            reply =
              "Asante kwa kunitumia ujumbe! 👑 Mimi ni KING STAR BOT. Jaribu kuandika /start.";
          }

          await fetch(
            `https://api.telegram.org/bot${TOKEN}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: chatId, text: reply })
            }
          );
        }
      }
    } catch (error) {
      console.log("Telegram polling error:", error.message);
    } finally {
      polling = false;
    }
  }

  console.log("KING STAR Telegram bot imeanzishwa.");
  setInterval(checkUpdates, 1000);
  checkUpdates();
}
