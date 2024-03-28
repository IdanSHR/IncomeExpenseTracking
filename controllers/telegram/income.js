const { findUserFamilyId } = require("../../services/family.service");
const { saveNewIncome, deleteIncome } = require("../../services/income.service");
const { botSendMessage } = require("../../utils/bot");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../../lang/" + botLanguage);
const incomeStep = {};

function registerIncomeCommands(bot) {
    bot.onText(/\/income/, async (msg) => {
        const chatId = msg.chat.id;

        const familyId = await findUserFamilyId(chatId);
        if (familyId?.error) {
            if (!incomeStep[chatId]) incomeStep[chatId] = {};
            incomeStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.ERROR_NOT_FOUND, incomeStep[chatId]?.lastMsgId);
            return delete incomeStep[chatId];
        }
        incomeStep[chatId] = {
            step: 1,
            income: { familyId },
        };

        incomeStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.INCOME.PROMPT_NAME, incomeStep[chatId].lastMsgId, "cancel");
    });

    bot.on("message", async (msg) => {
        const chatId = msg.chat.id;
        if (!incomeStep[chatId]?.step) {
            return;
        }

        const step = incomeStep[chatId].step;
        const income = incomeStep[chatId].income;

        if (step === 1) {
            //Income name
            income.name = msg.text;
            incomeStep[chatId].step++;
            incomeStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.INCOME.PROMPT_AMOUNT, incomeStep[chatId].lastMsgId, "cancel");
        } else if (step === 2) {
            //Income Amount
            const amount = Number(msg.text);
            if (isNaN(amount)) {
                return (incomeStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.GENERAL.ERROR_INVALID_NUMBER, incomeStep[chatId].lastMsgId, "cancel"));
            }
            income.amount = amount;

            try {
                const response = await saveNewIncome(income);
                if (response?.error) {
                    if (!incomeStep[chatId]) incomeStep[chatId] = {};
                    return (incomeStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, incomeStep[chatId]?.lastMsgId));
                }
                incomeStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.INCOME.SUCCESS_ADDING, incomeStep[chatId].lastMsgId);
            } catch (err) {
                incomeStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.INCOME.ERROR_ADDING, incomeStep[chatId].lastMsgId);
            }
            delete incomeStep[chatId];
        }
    });

    bot.on("callback_query", async (callbackQuery) => {
        const message = callbackQuery.message;
        const data = callbackQuery.data;

        if (data === "cancel" && incomeStep[message.chat.id] !== undefined) {
            await botSendMessage(bot, message.chat.id, lang.GENERAL.CANCEL_ACTION, incomeStep[message.chat.id].lastMsgId);
            delete incomeStep[message.chat.id];
            return;
        }

        bot.answerCallbackQuery(callbackQuery.id);
    });
}

module.exports = { registerIncomeCommands, incomeStep };
