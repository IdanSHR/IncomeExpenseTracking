const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");

//Register all Routes
const { registerMenuCommands } = require("./controllers/menu");
const { registerIncomeCommands } = require("./controllers/income");
const { registerExpenseCommands } = require("./controllers/expense");
const { registerStatisticsCommands } = require("./controllers/insights");
const { registerFamilyCommands } = require("./controllers/family");

//Register all Cron Jobs
const expenseCron = require("./crons/expense.cron");

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
expenseCron();

bot.onText(/\/userid/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    return bot.sendMessage(chatId, userId);
});

//For Tests
// bot.on("message", () => {
//     const activeListeners = Object.keys(bot._events);

//     console.log("Active Listeners:");
//     activeListeners.forEach((eventName) => {
//         console.log(eventName);
//     });
// });
