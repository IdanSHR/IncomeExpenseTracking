const { Expense } = require("../models/Expense");
const { botSendMessage } = require("../utils/bot");
const { findUserFamilyId, getFamilyCategories } = require("../services/family.service");
const { saveNewExpense, deleteExpense, makeExpenseRecurring } = require("../services/expense.service");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);
const userSteps = {};

function registerExpenseCommands(bot) {
    bot.onText(/\/expense/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const familyId = await findUserFamilyId(userId);
        if (familyId?.error) {
            if (!userSteps[chatId]) userSteps[chatId] = {};
            return (userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, familyId.error, userSteps[chatId]?.lastMsgId));
        }

        const newExpense = new Expense({ familyId });
        if (newExpense?.error) {
            if (!userSteps[chatId]) userSteps[chatId] = {};
            return (userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, newExpense.error, userSteps[chatId]?.lastMsgId));
        }

        userSteps[chatId] = {
            step: 1,
            expense: newExpense,
        };
        userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.PROMPT_NAME, userSteps[chatId].lastMsgId, "cancel");
    });

    bot.on("message", async (msg) => {
        const chatId = msg.chat.id;
        if (msg.text === "/expense" || !userSteps[chatId]) {
            return;
        }

        const step = userSteps[chatId].step;
        const expense = userSteps[chatId].expense;
        if (step === 1) {
            const userId = msg.from.id;
            expense.name = msg.text;
            userSteps[chatId].step++;
            const familyId = await findUserFamilyId(userId);
            if (familyId?.error) {
                if (!userSteps[chatId]) userSteps[chatId] = {};
                return (userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, familyId.error, userSteps[chatId]?.lastMsgId));
            }

            let response = await getFamilyCategories(familyId);
            if (response?.error) {
                return (userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error));
            }
            const categories = response.data;

            userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.PROMPT_CATEGORY, userSteps[chatId].lastMsgId, {
                reply_markup: {
                    inline_keyboard: [...categories.map((category) => [{ text: category.name, callback_data: category._id }]), [{ text: lang.GENERAL.CANCEL, callback_data: "cancel" }]],
                },
            });
        } else if (step === 3) {
            const cost = Number(msg.text);
            if (isNaN(cost)) {
                return (userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.GENERAL.ERROR_INVALID_NUMBER, userSteps[chatId].lastMsgId, "cancel"));
            }

            expense.cost = cost;
            const opts = {
                reply_markup: {
                    inline_keyboard: [[{ text: "🔁 זו הוצאה חוזרת", callback_data: "add_recurring_expense" }], [{ text: "✅ אישור", callback_data: "accept_expense" }]],
                },
            };
            userSteps[chatId].expense = expense;
            userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, `שם ההוצאה: ${expense.name}\nסכום:${expense.cost}`, userSteps[chatId].lastMsgId, opts);
        }
    });

    bot.on("callback_query", async (callbackQuery) => {
        const message = callbackQuery.message;
        const category = callbackQuery.data;
        const chatId = message.chat.id;

        if (category === "cancel" && userSteps[chatId] !== undefined) {
            await botSendMessage(bot, chatId, lang.GENERAL.CANCEL_ACTION, userSteps[chatId].lastMsgId);
            delete userSteps[chatId];
            return;
        } else if (category === "cancel_expense") {
        } else if ((category === "add_recurring_expense" || category === "accept_expense") && userSteps[chatId] !== undefined) {
            const response = await saveNewExpense(userSteps[chatId].expense);
            if (response?.error) {
                return (userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, userSteps[chatId]?.lastMsgId));
            }
            if (category === "accept_expense") {
                await botSendMessage(bot, chatId, lang.EXPENSE.SUCCESS_ADDING, userSteps[chatId?.lastMsgId]);
                delete userSteps[chatId];
                return;
            } else if (category === "add_recurring_expense") {
                await makeExpenseRecurring(response?._id);
                const today = new Date();
                const dayOfMonth = today.getDate();
                await botSendMessage(bot, chatId, `✅ הוצאה הפכה לקבועה, כל חודש ב ${dayOfMonth} לחודש`, userSteps[chatId?.lastMsgId]);
                delete userSteps[chatId];
                return;
            }
            console.log("here");
        }

        if (userSteps[chatId]) {
            userSteps[chatId].expense.category = category;
            userSteps[chatId].step++;
            userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.PROMPT_COST, userSteps[chatId].lastMsgId, "cancel");
        }
    });
}

module.exports = { registerExpenseCommands };
