const { Income } = require("../models/Income");
const { botSendMessage } = require("../utils/bot");
const { findUserFamilyId } = require("../services/family.service");
const { setNewIncome, saveNewIncome, newIncome } = require("../services/income.service");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);
const incomeSteps = {};

function registerIncomeCommands(bot) {
    bot.onText(/\/income/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        const familyId = await findUserFamilyId(userId);
        if (familyId?.error) {
            if (!incomeSteps[chatId]) incomeSteps[chatId] = {};
            return (incomeSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.ERROR_NOT_FOUND, incomeSteps[chatId]?.lastMsgId));
        }

        const newIncome = await setNewIncome(familyId);
        if (newIncome?.error) {
            if (!incomeSteps[chatId]) incomeSteps[chatId] = {};
            return (incomeSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, newIncome.error, incomeSteps[chatId]?.lastMsgId));
        }

        incomeSteps[chatId] = {
            step: 1,
            income: newIncome,
        };
        incomeSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.INCOME.PROMPT_NAME, incomeSteps[chatId].lastMsgId, "cancel");
    });

    bot.on("message", async (msg) => {
        const chatId = msg.chat.id;
        if (!incomeSteps[chatId]?.step) {
            return;
        }

        const step = incomeSteps[chatId].step;
        const income = incomeSteps[chatId].income;

        if (step === 1) {
            //Income name
            income.name = msg.text;
            incomeSteps[chatId].step++;
            incomeSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.INCOME.PROMPT_AMOUNT, incomeSteps[chatId].lastMsgId, "cancel");
        } else if (step === 2) {
            //Income Amount
            const amount = Number(msg.text);
            if (isNaN(amount)) {
                return (incomeSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.GENERAL.ERROR_INVALID_NUMBER, incomeSteps[chatId].lastMsgId, "cancel"));
            }
            income.amount = amount;

            try {
                const response = await saveNewIncome(income);
                if (response?.error) {
                    if (!incomeSteps[chatId]) incomeSteps[chatId] = {};
                    return (incomeSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, incomeSteps[chatId]?.lastMsgId));
                }
                incomeSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.INCOME.SUCCESS_ADDING, incomeSteps[chatId].lastMsgId);
            } catch (err) {
                incomeSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.INCOME.ERROR_ADDING, incomeSteps[chatId].lastMsgId);
            }
            delete incomeSteps[chatId];
        }
    });

    bot.on("callback_query", async (callbackQuery) => {
        const message = callbackQuery.message;
        const data = callbackQuery.data;

        if (data === "cancel" && incomeSteps[message.chat.id] !== undefined) {
            await botSendMessage(bot, message.chat.id, lang.GENERAL.CANCEL_ACTION, incomeSteps[message.chat.id].lastMsgId);
            delete incomeSteps[message.chat.id];
            return;
        }
    });
}

module.exports = { registerIncomeCommands };
