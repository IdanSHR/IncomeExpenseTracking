const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");

//==========[ Main ]==========//

//Init ENV variables
require("dotenv").config();
const token = process.env.TELEGTAM_API_TOKEN;
const dbUrl = process.env.DB_URL;
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("./lang/" + botLanguage);

//Connect to the DB
try {
    mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
} catch (error) {
    console.error({ error });
}

//==========[ Telegram Bot ]==========//

//Register all Routes
const { registerMenuCommands } = require("./controllers/telegram/menu");
const { registerIncomeCommands } = require("./controllers/telegram/income");
const { registerExpenseCommands } = require("./controllers/telegram/expense");
const { registerStatisticsCommands } = require("./controllers/telegram/insights");
const { registerFamilyCommands } = require("./controllers/telegram/family");
const { registerAdminCommands } = require("./controllers/telegram/admin");
const { botSendBroadcast } = require("./utils/bot");

//Register all Cron Jobs
const expenseCron = require("./crons/expense.cron");

//Init Telegram Bot
const bot = new TelegramBot(token, { polling: true });

//Set bot commands
const botCommands = lang.GENERAL.BOT_COMMANDS;
if (typeof botCommands !== "undefined") {
    bot.setMyCommands(botCommands);
}

//Init
registerMenuCommands(bot);
registerFamilyCommands(bot);
registerIncomeCommands(bot);
registerExpenseCommands(bot);
registerStatisticsCommands(bot);
registerAdminCommands(bot);
expenseCron(bot);

bot.onText(/\/userid/, async (msg) => {
    const chatId = msg.chat.id;
    return bot.sendMessage(chatId, chatId);
});

//==========[ Server ]==========//
// ---------------
// IMPORTANT: This is a test endpoints for the broadcast feature! Do not use in production!
// ---------------
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

app.get("/", (req, res) => res.send("Hello World!"));
app.get("/sendBroadcast", (req, res) => {
    const message = req.query.message;
    botSendBroadcast(bot, message);
    res.send("Broadcast sent");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is listening on port " + process.env.PORT || 3000);
});
