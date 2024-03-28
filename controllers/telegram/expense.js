const { findUserFamilyId } = require("../../services/family.service");
const { getFamilyCategories } = require("../../services/category.service");
const { saveNewExpense, deleteExpense, makeExpenseRecurring, splitExpense } = require("../../services/expense.service");

const { botSendMessage, botEditMessageReplyMarkup } = require("../../utils/bot");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../../lang/" + botLanguage);
const expenseStep = {};

function registerExpenseCommands(bot) {
    // Command to add expense
    bot.onText(/\/expense/, async (msg) => {
        handleExpenseCommand(bot, msg);
    });

    bot.on("message", async (msg) => {
        const chatId = msg.chat.id;
        const message = msg.text;

        if (message === "/expense" || !expenseStep[chatId]) {
            return;
        }

        const step = expenseStep[chatId].step;
        if (step === 1) {
            //Expense name
            handleExpenseNameStep(bot, chatId, chatId, message);
        } else if (step === 3) {
            //Expense amount
            handleExpenseAmountStep(bot, chatId, +message);
        } else if (step === 4) {
            //Split expense
            handleSplitExpenseStep(bot, chatId, chatId, +message);
        }
    });

    bot.on("callback_query", async (callbackQuery) => {
        const message = callbackQuery.message;
        const category = callbackQuery.data;
        const chatId = message.chat.id;

        if (category === "cancel" && expenseStep[chatId] !== undefined) {
            await botSendMessage(bot, chatId, lang.GENERAL.CANCEL_ACTION, expenseStep[chatId].lastMsgId);
            delete expenseStep[chatId];
        } else if (category.includes("add_recurring_expense")) {
            //Make expense recurring
            const expenseId = category.split("add_recurring_expense_")[1];
            const response = await makeExpenseRecurring(expenseId);
            if (response?.error) {
                return await botSendMessage(bot, chatId, response.error, expenseStep[chatId]?.lastMsgId);
            }

            const dayOfMonth = new Date().getDate();
            botEditMessageReplyMarkup(bot, chatId, message.message_id, []);
            await botSendMessage(bot, chatId, `${lang.EXPENSE.SUCCESS_ADDING_RECURRING} - ${dayOfMonth}`, expenseStep[chatId?.lastMsgId]);
            delete expenseStep[chatId];
        } else if (category.includes("split_expense")) {
            //Split expense
            const expenseId = category.split("split_expense_")[1];
            if (!expenseStep[chatId]) expenseStep[chatId] = {};
            expenseStep[chatId].expense = { _id: expenseId };
            expenseStep[chatId].step = 4;
            expenseStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.PROMPT_SPLIT, message.message_id, "cancel");
        } else if (category.includes("finish")) {
            //Remove the inline keyboard from the success message
            botEditMessageReplyMarkup(bot, chatId, message.message_id, []);
        } else if (expenseStep[chatId]) {
            //Handle the expense category selection
            expenseStep[chatId].expense.category = category;
            expenseStep[chatId].step++;
            expenseStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.PROMPT_COST, expenseStep[chatId].lastMsgId, "cancel");
        }

        bot.answerCallbackQuery(callbackQuery.id);
    });

    //Handle the expense command
    async function handleExpenseCommand(bot, msg) {
        const chatId = msg.chat.id;
        const familyId = await findUserFamilyId(chatId);
        if (familyId?.error) {
            if (!expenseStep[chatId]) expenseStep[chatId] = {};
            expenseStep[chatId].lastMsgId = await botSendMessage(bot, chatId, familyId.error, expenseStep[chatId]?.lastMsgId);
            return delete expenseStep[chatId];
        }

        expenseStep[chatId] = {
            step: 1,
            expense: { familyId },
        };
        expenseStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.PROMPT_NAME, expenseStep[chatId].lastMsgId, "cancel");
    }

    //Handle the step of adding expense name
    async function handleExpenseNameStep(bot, chatId, chatId, expenseName) {
        const expense = expenseStep[chatId].expense;
        expense.name = expenseName;
        expenseStep[chatId].step++;
        const familyId = await findUserFamilyId(chatId);
        if (familyId?.error) {
            if (!expenseStep[chatId]) expenseStep[chatId] = {};
            expenseStep[chatId].lastMsgId = await botSendMessage(bot, chatId, familyId.error, expenseStep[chatId]?.lastMsgId);
            return delete expenseStep[chatId];
        }

        let response = await getFamilyCategories(familyId);
        if (response?.error) {
            return (expenseStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error));
        }
        const categories = response;

        expenseStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.PROMPT_CATEGORY, expenseStep[chatId].lastMsgId, {
            reply_markup: {
                inline_keyboard: [...categories.map((category) => [{ text: category.name, callback_data: category._id }]), [{ text: lang.GENERAL.CANCEL, callback_data: "cancel" }]],
            },
        });
    }

    //Handle the step of adding expense amount
    async function handleExpenseAmountStep(bot, chatId, cost) {
        const expense = expenseStep[chatId].expense;
        if (isNaN(cost)) {
            return (expenseStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.GENERAL.ERROR_INVALID_NUMBER, expenseStep[chatId].lastMsgId, "cancel"));
        }

        expense.cost = cost;

        const response = await saveNewExpense(expense);
        if (response?.error) {
            if (!expenseStep[chatId]) expenseStep[chatId] = {};
            return (expenseStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, expenseStep[chatId]?.lastMsgId));
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
        await botSendMessage(bot, chatId, lang.EXPENSE.SUCCESS_ADDING, expenseStep[chatId].lastMsgId, opts);
        delete expenseStep[chatId];
    }

    //Handle the step of splitting expense
    async function handleSplitExpenseStep(bot, chatId, chatId, payments) {
        const expenseId = expenseStep[chatId].expense?._id;
        if (isNaN(payments)) {
            return (expenseStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.GENERAL.ERROR_INVALID_NUMBER, expenseStep[chatId].lastMsgId, "cancel"));
        }
        const response = await splitExpense(expenseId, payments);
        if (response?.error) {
            if (!expenseStep[chatId]) expenseStep[chatId] = {};
            return (expenseStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, expenseStep[chatId]?.lastMsgId));
        }
        await botSendMessage(bot, chatId, lang.EXPENSE.SUCCESS_SPLITTING, expenseStep[chatId].lastMsgId);
        delete expenseStep[chatId];
    }
}

module.exports = { registerExpenseCommands, expenseStep };
