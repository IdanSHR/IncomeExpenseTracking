const { botSendMessage, botEditMessage } = require("../utils/bot");

const {
    sendMainMenu,
    sendFamilyMenu,
    sendExpenseMenu,
    sendExpenseCategoryMenu,
    sendExpenseListMenu,
    sendEditExpenseItemMenu,
    sendEditExpenseMenu,
    sendIncomeMenu,
    sendIncomeListMenu,
    sendEditIncomeItemMenu,
    sendEditIncomeMenu,
    sendCategoryMenu,
    sendInsightsMenu,
    renameFamily,
    updateStartDay,
    addNewCategory,
    renameCategory,
    handleSetCategoryLimit,
    updateCategoryLimit,
    deleteCategory,
    handleDeleteExpense,
    handleDeleteIncome,
    handleEditExpenseName,
    handleEditExpenseCost,
    handleEditExpenseDate,
    handleEditExpenseCategory,
    handleEditExpenseToggleRecurring,
    handleEditIncomeName,
    handleEditIncomeAmount,
    handleEditIncomeDate,
} = require("../services/menu.service");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);
const menuStep = {};

function registerMenuCommands(bot) {
    // Command to add income
    bot.onText(/\/settings/, async (msg) => {
        const chatId = msg.chat.id;

        if (!menuStep[chatId]) menuStep[chatId] = {};
        await sendMainMenu(bot, menuStep, chatId, false);
    });

    // Handler for income name and amount
    bot.on("message", async (msg) => {
        const chatId = msg.chat.id;
        if (menuStep[chatId] === undefined) {
            return;
        }

        if (menuStep[chatId]?.menu === "family_setday") {
            try {
                const day = Number(msg.text);
                updateStartDay(bot, menuStep, chatId, day);
            } catch (err) {
                menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.ERROR_EDIT_DAY, menuStep[chatId].lastMsgId, "back_to_main_menu");
            }
        } else if (menuStep[chatId]?.menu === "category_set_limit") {
            try {
                const limit = Number(msg.text);
                updateCategoryLimit(bot, menuStep, chatId, limit);
            } catch (err) {
                menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.ERROR_EDIT_DAY, menuStep[chatId].lastMsgId, "back_to_main_menu");
            }
        }
        //Expense
        else if (menuStep[chatId]?.menu === "expense_edit_name") {
            try {
                const expenseName = msg.text;
                await handleEditExpenseName(bot, menuStep, chatId, expenseName);
            } catch (err) {
                menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.ERROR_EDITING, menuStep[chatId].lastMsgId, "back_to_main_menu");
            }
        } else if (menuStep[chatId]?.menu === "expense_edit_cost") {
            try {
                const expenseCost = Number(msg.text);
                if (isNaN(expenseCost)) {
                    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.GENERAL.ERROR_INVALID_NUMBER, menuStep[chatId].lastMsgId, "back_to_main_menu");
                    return;
                }
                await handleEditExpenseCost(bot, menuStep, chatId, expenseCost);
            } catch (err) {
                menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.ERROR_EDITING, menuStep[chatId].lastMsgId, "back_to_main_menu");
            }
        } else if (menuStep[chatId]?.menu === "expense_edit_date") {
            try {
                const expenseDay = Number(msg.text);
                if (isNaN(expenseDay)) {
                    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.GENERAL.ERROR_INVALID_NUMBER, menuStep[chatId].lastMsgId, "back_to_main_menu");
                    return;
                }
                await handleEditExpenseDate(bot, menuStep, chatId, expenseDay);
            } catch (err) {
                menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.ERROR_EDITING, menuStep[chatId].lastMsgId, "back_to_main_menu");
            }
        }

        //Income
        else if (menuStep[chatId]?.menu === "income_edit_name") {
            try {
                const incomeName = msg.text;
                await handleEditIncomeName(bot, menuStep, chatId, incomeName);
            } catch (err) {
                menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.INCOME.ERROR_EDITING, menuStep[chatId].lastMsgId, "back_to_main_menu");
            }
        } else if (menuStep[chatId]?.menu === "income_edit_amount") {
            try {
                const incomeAmount = Number(msg.text);
                if (isNaN(incomeAmount)) {
                    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.GENERAL.ERROR_INVALID_NUMBER, menuStep[chatId].lastMsgId, "back_to_main_menu");
                    return;
                }
                await handleEditIncomeAmount(bot, menuStep, chatId, incomeAmount);
            } catch (err) {
                menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.INCOME.ERROR_EDITING, menuStep[chatId].lastMsgId, "back_to_main_menu");
            }
        } else if (menuStep[chatId]?.menu === "income_edit_date") {
            try {
                const incomeDay = Number(msg.text);
                if (isNaN(incomeDay)) {
                    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.GENERAL.ERROR_INVALID_NUMBER, menuStep[chatId].lastMsgId, "back_to_main_menu");
                    return;
                }
                await handleEditIncomeDate(bot, menuStep, chatId, incomeDay);
            } catch (err) {
                menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.INCOME.ERROR_EDITING, menuStep[chatId].lastMsgId, "back_to_main_menu");
            }
        }
    });
    bot.on("callback_query", async (callbackQuery) => {
        const message = callbackQuery.message;
        const data = callbackQuery.data;
        const chatId = message.chat.id;

        if (menuStep[chatId] === undefined) {
            return;
        }

        //Main Menu
        if (data === "menu_done") {
            bot.deleteMessage(chatId, menuStep[chatId].lastMsgId);
            return delete menuStep[chatId];
        } else if (data === "back_to_main_menu") {
            menuStep[chatId].menu = null;
            return await sendMainMenu(bot, menuStep, chatId);
        } else if (data === "menu_expense") {
            return await sendExpenseMenu(bot, menuStep, chatId);
        } else if (data === "menu_income") {
            return await sendIncomeMenu(bot, menuStep, chatId);
        } else if (data === "menu_family") {
            return await sendFamilyMenu(bot, menuStep, chatId);
        } else if (data === "menu_category") {
            return await sendCategoryMenu(bot, menuStep, chatId);
        } else if (data === "menu_insights") {
            return await sendInsightsMenu(bot, menuStep, chatId);
        }

        //Family Menu
        else if (data === "family_setday") {
            menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, lang.FAMILY.PROMPT_EDIT_DAY, menuStep[chatId].lastMsgId);
            menuStep[chatId].menu = "family_setday";
        } else if (data === "family_editname") {
            menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, lang.FAMILY.PROMPT_RENAME, menuStep[chatId].lastMsgId);
            bot.once("message", async (msg) => {
                try {
                    const familyNewName = msg.text;
                    await renameFamily(bot, menuStep, chatId, familyNewName);
                } catch (err) {
                    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.ERROR_RENAME, menuStep[chatId].lastMsgId, "back_to_main_menu");
                }
            });
        }

        //Category Menu
        else if (data === "category_add") {
            menuStep[chatId].lastMsgId[chatId] = await botSendMessage(bot, chatId, lang.CATEGORY.PROMPT_ADD, menuStep[chatId].lastMsgId[chatId]);
            bot.once("message", async (msg) => {
                try {
                    const category = msg.text;
                    await addNewCategory(bot, menuStep, chatId, category);
                } catch (err) {
                    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.ERROR_RENAME, menuStep[chatId].lastMsgId, "back_to_main_menu");
                }
            });
        } else if (data === "category_rename") {
            try {
                await renameCategory(bot, menuStep, chatId);
            } catch (err) {
                menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.ERROR_RENAME, menuStep[chatId].lastMsgId, "back_to_main_menu");
            }
        } else if (data === "category_set_limit") {
            try {
                await handleSetCategoryLimit(bot, menuStep, chatId);
            } catch (err) {
                menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.ERROR_RENAME, menuStep[chatId].lastMsgId, "back_to_main_menu");
            }
        } else if (data === "category_remove") {
            try {
                await deleteCategory(bot, menuStep, chatId);
            } catch (err) {
                menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.ERROR_RENAME, menuStep[chatId].lastMsgId, "back_to_main_menu");
            }
        }

        //Expense Menu
        else if (data === "back_to_expense_menu") {
            return await sendExpenseMenu(bot, menuStep, chatId);
        }
        //edit expense
        else if (data.includes("expense_edit")) {
            if (data === "expense_edit") {
                return await sendExpenseCategoryMenu(bot, menuStep, chatId, "edit");
            } else if (data.includes("expense_edit_list")) {
                const categoryId = data.split("expense_edit_list_")[1];
                return await sendExpenseListMenu(bot, menuStep, chatId, categoryId, "edit");
            } else if (data.includes("expense_edit_item")) {
                const expenseId = data.split("expense_edit_item_")[1];
                return await sendEditExpenseItemMenu(bot, menuStep, chatId, expenseId);
            } else if (data.includes("expense_edit_recurring")) {
                const expenseId = data.split("expense_edit_recurring_")[1];
                return await handleEditExpenseToggleRecurring(bot, menuStep, chatId, expenseId);
            } else if (data.includes("expense_edit_set_category")) {
                const category = data.split("expense_edit_set_category_")[1];
                return await handleEditExpenseCategory(bot, menuStep, chatId, category);
            } else {
                for (let type of ["name", "cost", "category", "date"]) {
                    if (data.includes(`expense_edit_${type}`)) {
                        const expenseId = data.split(`expense_edit_${type}_`)[1];
                        return await sendEditExpenseMenu(bot, menuStep, chatId, expenseId, type);
                    }
                }
            }
        }
        //delete expense
        else if (data === "expense_delete") {
            return await sendExpenseCategoryMenu(bot, menuStep, chatId, "delete");
        } else if (data.includes("expense_delete_list")) {
            const categoryId = data.split("expense_delete_list_")[1];
            return await sendExpenseListMenu(bot, menuStep, chatId, categoryId, "delete");
        } else if (data.includes("expense_delete_item")) {
            const expenseId = data.split("expense_delete_item_")[1];
            return await handleDeleteExpense(bot, menuStep, chatId, expenseId);
        }

        //Income Menu
        else if (data === "back_to_income_menu") {
            return await sendIncomeMenu(bot, menuStep, chatId);
        } else if (data === "income_delete") {
            return await sendIncomeListMenu(bot, menuStep, chatId, "delete");
        } else if (data === "income_edit") {
            return await sendIncomeListMenu(bot, menuStep, chatId, "edit");
        } else if (data.includes("income_edit_item")) {
            const incomeId = data.split("income_edit_item_")[1];
            return await sendEditIncomeItemMenu(bot, menuStep, chatId, incomeId);
        } else if (data.includes("income_delete_item")) {
            const incomeId = data.split("income_delete_item_")[1];
            return await handleDeleteIncome(bot, menuStep, chatId, incomeId);
        } else {
            for (let type of ["name", "amount", "date"]) {
                if (data.includes(`income_edit_${type}`)) {
                    const incomeId = data.split(`income_edit_${type}_`)[1];
                    return await sendEditIncomeMenu(bot, menuStep, chatId, incomeId, type);
                }
            }
        }
        bot.answerCallbackQuery(callbackQuery.id);
    });
}

module.exports = { registerMenuCommands };
