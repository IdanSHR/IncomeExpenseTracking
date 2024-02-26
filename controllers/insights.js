const { Expense } = require("../models/Expense");
const { findUserFamily, findUserFamilyId } = require("../services/family.service");
const { getFamilyCategories } = require("../services/category.service");

const { sendStatus, sendCategories, sendMonthlyChange, sendExpensiveDay } = require("../services/insights.service");
const { getMonthExpense } = require("../services/expense.service");
const { getMonthIncomes } = require("../services/income.service");
const { botSendMessage } = require("../utils/bot");
const moment = require("moment");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);
const insightStep = {};

function registerStatisticsCommands(bot) {
    bot.onText(/\/status/, async (msg) => {
        const chatId = msg.chat.id;
        try {
            if (!insightStep[chatId]) insightStep[chatId] = {};
            Object.assign(insightStep[chatId], { currentMonth: moment().month() + 1, currentYear: moment().year() });
            await sendStatus(bot, insightStep, chatId, false);
        } catch (err) {
            return await botSendMessage(bot, chatId, lang.INSIGHT.ERROR_STATUS);
        }
    });

    bot.on("callback_query", async (callbackQuery) => {
        const message = callbackQuery.message;
        const data = callbackQuery.data;
        const chatId = message.chat.id;

        if (data === "send_status_prev" && insightStep[chatId] !== undefined) {
            insightStep[chatId].currentMonth--;

            if (insightStep[chatId].currentMonth < 1) {
                insightStep[chatId].currentMonth = 12;
                insightStep[chatId].currentYear--;
            }

            return await sendStatus(bot, insightStep, chatId, false);
        } else if (data === "send_status_next" && insightStep[chatId] !== undefined) {
            insightStep[chatId].currentMonth++;

            if (insightStep[chatId].currentMonth > 12) {
                insightStep[chatId].currentMonth = 1;
                insightStep[chatId].currentYear++;
            }

            return await sendStatus(bot, insightStep, chatId, false);
        }
        bot.answerCallbackQuery(callbackQuery.id);
    });
    //Change it!
    bot.onText(/\/categories/, async (msg) => {
        const chatId = msg.chat.id;
        try {
            if (!insightStep[chatId]) insightStep[chatId] = {};
            Object.assign(insightStep[chatId], { currentMonth: moment().month() + 1, currentYear: moment().year() });
            await sendCategories(bot, insightStep, chatId, false);
        } catch (err) {
            return await botSendMessage(bot, chatId, lang.INSIGHT.ERROR_STATUS);
        }
    });
    bot.onText(/\/monthlyChange/, async (msg) => {
        const chatId = msg.chat.id;
        try {
            if (!insightStep[chatId]) insightStep[chatId] = {};
            Object.assign(insightStep[chatId], { currentMonth: moment().month() + 1, currentYear: moment().year() });
            await sendMonthlyChange(bot, insightStep, chatId, false);
        } catch (err) {
            return await botSendMessage(bot, chatId, lang.INSIGHT.ERROR_STATUS);
        }
    });

    bot.onText(/\/expensiveDay/, async (msg) => {
        const chatId = msg.chat.id;
        try {
            if (!insightStep[chatId]) insightStep[chatId] = {};
            Object.assign(insightStep[chatId], { currentMonth: moment().month() + 1, currentYear: moment().year() });
            await sendExpensiveDay(bot, insightStep, chatId, false);
        } catch (err) {
            return await botSendMessage(bot, chatId, lang.INSIGHT.ERROR_STATUS);
        }
    });
}

module.exports = { registerStatisticsCommands };
