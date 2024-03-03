const { botSendMessage, botEditMessageReplyMarkup } = require("../utils/bot");
const { findUserFamilyId } = require("../services/family.service");
const { getFamilyCategories } = require("../services/category.service");
const { saveNewExpense, deleteExpense, makeExpenseRecurring, splitExpense } = require("../services/expense.service");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);
const userSteps = {};

function registerExpenseCommands(bot) {
    // Command to add expense
    bot.onText(/\/expense/, async (msg) => {
        handleExpenseCommand(bot, msg);
    });

    bot.on("message", async (msg) => {
        const chatId = msg.chat.id;
        const message = msg.text;
        const userId = msg.from.id;

        if (message === "/expense" || !userSteps[chatId]) {
            return;
        }

        const step = userSteps[chatId].step;
        if (step === 1) {
            //Expense name
            handleExpenseNameStep(bot, chatId, userId, message);
        } else if (step === 3) {
            //Expense amount
            handleExpenseAmountStep(bot, chatId, +message);
        } else if (step === 4) {
            //Split expense
            handleSplitExpenseStep(bot, chatId, userId, +message);
        }
    });

    bot.on("callback_query", async (callbackQuery) => {
        const message = callbackQuery.message;
        const category = callbackQuery.data;
        const chatId = message.chat.id;

        if (category === "cancel" && userSteps[chatId] !== undefined) {
            await botSendMessage(bot, chatId, lang.GENERAL.CANCEL_ACTION, userSteps[chatId].lastMsgId);
            delete userSteps[chatId];
        } else if (category.includes("add_recurring_expense")) {
            //Make expense recurring
            const expenseId = category.split("add_recurring_expense_")[1];
            const response = await makeExpenseRecurring(expenseId);
            if (response?.error) {
                return await botSendMessage(bot, chatId, response.error, userSteps[chatId]?.lastMsgId);
            }

            const dayOfMonth = new Date().getDate();
            botEditMessageReplyMarkup(bot, chatId, message.message_id, []);
            await botSendMessage(bot, chatId, `${lang.EXPENSE.SUCCESS_ADDING_RECURRING} - ${dayOfMonth}`, userSteps[chatId?.lastMsgId]);
            delete userSteps[chatId];
        } else if (category.includes("split_expense")) {
            //Split expense
            const expenseId = category.split("split_expense_")[1];
            if (!userSteps[chatId]) userSteps[chatId] = {};
            userSteps[chatId].expense = { _id: expenseId };
            userSteps[chatId].step = 4;
            userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.PROMPT_SPLIT, message.message_id, "cancel");
        } else if (category.includes("finish")) {
            //Remove the inline keyboard from the success message
            botEditMessageReplyMarkup(bot, chatId, message.message_id, []);
        } else if (userSteps[chatId]) {
            //Handle the expense category selection
            userSteps[chatId].expense.category = category;
            userSteps[chatId].step++;
            userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.PROMPT_COST, userSteps[chatId].lastMsgId, "cancel");
        }

        bot.answerCallbackQuery(callbackQuery.id);
    });

    //Handle the expense command
    async function handleExpenseCommand(bot, msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const familyId = await findUserFamilyId(userId);
        if (familyId?.error) {
            if (!userSteps[chatId]) userSteps[chatId] = {};
            userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, familyId.error, userSteps[chatId]?.lastMsgId);
            return delete userSteps[chatId];
        }

        const newExpense = { familyId };
        if (newExpense?.error) {
            if (!userSteps[chatId]) userSteps[chatId] = {};
            return (userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, newExpense.error, userSteps[chatId]?.lastMsgId));
        }

        userSteps[chatId] = {
            step: 1,
            expense: newExpense,
        };
        userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.PROMPT_NAME, userSteps[chatId].lastMsgId, "cancel");
    }

    //Handle the step of adding expense name
    async function handleExpenseNameStep(bot, chatId, userId, expenseName) {
        const expense = userSteps[chatId].expense;
        expense.name = expenseName;
        userSteps[chatId].step++;
        const familyId = await findUserFamilyId(userId);
        if (familyId?.error) {
            if (!userSteps[chatId]) userSteps[chatId] = {};
            userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, familyId.error, userSteps[chatId]?.lastMsgId);
            return delete userSteps[chatId];
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
    }

    //Handle the step of adding expense amount
    async function handleExpenseAmountStep(bot, chatId, cost) {
        const expense = userSteps[chatId].expense;
        if (isNaN(cost)) {
            return (userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.GENERAL.ERROR_INVALID_NUMBER, userSteps[chatId].lastMsgId, "cancel"));
        }

        expense.cost = cost;

        const response = await saveNewExpense(expense);
        if (response?.error) {
            if (!userSteps[chatId]) userSteps[chatId] = {};
            return (userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, userSteps[chatId]?.lastMsgId));
        }

        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: lang.EXPENSE.BUTTON_SPLIT, callback_data: `split_expense_${response._id}` },
                        { text: lang.EXPENSE.BUTTON_RECURRING, callback_data: `add_recurring_expense_${response._id}` },
                    ],
                    [{ text: lang.GENERAL.FINISH, callback_data: `finish` }],
                ],
            },
        };
        await botSendMessage(bot, chatId, lang.EXPENSE.SUCCESS_ADDING, userSteps[chatId].lastMsgId, opts);
        delete userSteps[chatId];
    }

    //Handle the step of splitting expense
    async function handleSplitExpenseStep(bot, chatId, userId, payments) {
        const expenseId = userSteps[chatId].expense?._id;
        if (isNaN(payments)) {
            return (userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.GENERAL.ERROR_INVALID_NUMBER, userSteps[chatId].lastMsgId, "cancel"));
        }
        const response = await splitExpense(expenseId, payments);
        if (response?.error) {
            if (!userSteps[chatId]) userSteps[chatId] = {};
            return (userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, userSteps[chatId]?.lastMsgId));
        }
        await botSendMessage(bot, chatId, lang.EXPENSE.SUCCESS_SPLITTING, userSteps[chatId].lastMsgId);
        delete userSteps[chatId];
    }
}

module.exports = { registerExpenseCommands };
