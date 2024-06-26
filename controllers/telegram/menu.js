const moment = require("moment");
const { findUserFamilyId, setStartDay, setFamilyName } = require("../../services/family.service");
const { addCategory, removeCategory, editCategory, getFamilyCategories, setCategoryLimit } = require("../../services/category.service");
const { queryExpenses, updateExpense, deleteExpense, findExpenseById } = require("../../services/expense.service");
const { queryIncomes, deleteIncome, updateIncome } = require("../../services/income.service");

const { botSendMessage, botEditMessage } = require("../../utils/bot");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../../lang/" + botLanguage);

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
            menuStep[chatId].menu = "family_setname";
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
            menuStep[chatId].menu = "category_add";
            bot.once("message", async (msg) => {
                try {
                    const category = msg.text;
                    await addNewCategory(bot, menuStep, chatId, category);
                } catch (err) {
                    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.ERROR_RENAME, menuStep[chatId].lastMsgId, "back_to_main_menu");
                }
            });
        } else if (data === "category_rename") {
            menuStep[chatId].menu = "category_rename";
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

//Set menu buttons dynamically
function setMenuButtons(buttons) {
    if (!buttons) {
        return [];
    }

    const inlineKeyboard = buttons.map((line) =>
        line.map((button) => {
            return {
                text: button.text,
                callback_data: button.callback_data,
            };
        })
    );
    const opts = {
        reply_markup: JSON.stringify({
            inline_keyboard: inlineKeyboard,
        }),
        parse_mode: "Markdown",
    };

    return opts;
}

//Main menus
async function sendMainMenu(bot, menuStep, chatId, edit = true) {
    const opts = setMenuButtons(lang.MENU.MAIN.BUTTONS);
    const menuContent = lang.MENU.MAIN.CONTENT;

    if (edit) {
        menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, menuContent, menuStep[chatId].lastMsgId, opts);
    } else {
        menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, menuContent, menuStep[chatId].lastMsgId, opts);
    }
}

//Family menus
async function sendFamilyMenu(bot, menuStep, chatId) {
    const opts = setMenuButtons(lang.MENU.FAMILY.BUTTONS);
    menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, lang.MENU.FAMILY.CONTENT, menuStep[chatId].lastMsgId, opts);
}
async function sendCategoryMenu(bot, menuStep, chatId) {
    const opts = setMenuButtons(lang.MENU.CATEGORY.BUTTONS);
    menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, lang.MENU.CATEGORY.CONTENT, menuStep[chatId].lastMsgId, opts);
}

//Expense menus
async function sendExpenseMenu(bot, menuStep, chatId) {
    const opts = setMenuButtons(lang.MENU.EXPENSE.BUTTONS);
    menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, lang.MENU.EXPENSE.CONTENT, menuStep[chatId].lastMsgId, opts);
}
async function sendExpenseCategoryMenu(bot, menuStep, chatId, action) {
    const familyId = await findUserFamilyId(chatId);
    if (familyId?.error) {
        if (!menuStep[chatId]) menuStep[chatId] = {};
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, familyId.error, menuStep[chatId]?.lastMsgId));
    }

    const response = await getFamilyCategories(familyId, true);
    if (response?.error) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error));
    }
    const categories = response;
    const opts = setMenuButtons([
        ...categories.map((category) => [{ text: category.name, callback_data: `expense_${action}_list_${category._id}` }]),
        [{ text: lang.GENERAL.CANCEL, callback_data: "back_to_expense_menu" }],
    ]);
    menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, lang.MENU.EXPENSE.CONTENT, menuStep[chatId].lastMsgId, opts);
}
async function sendExpenseListMenu(bot, menuStep, chatId, categoryId, action) {
    const familyId = await findUserFamilyId(chatId);
    if (familyId?.error) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, familyId.error, menuStep[chatId].lastMsgId, "back_to_expense_menu"));
    }
    const fromDate = moment().subtract(30, "days");
    const expenses = await queryExpenses({ familyId: familyId, category: categoryId, date: { $gte: fromDate.toDate() } });
    if (!expenses.length) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.ERROR_NO_EXPENSES_CATEGORY, menuStep[chatId].lastMsgId, "back_to_expense_menu"));
    }
    const opts = setMenuButtons([
        ...expenses.map((expense) => [
            { text: `${moment(expense.date).format("DD/MM")} - ${expense.name} (${expense.cost?.toFixed(2)}${lang.GENERAL.CURRENCY})`, callback_data: `expense_${action}_item_${expense._id}` },
        ]),
        [{ text: lang.GENERAL.CANCEL, callback_data: "back_to_expense_menu" }],
    ]);
    menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, lang.MENU.EXPENSE.CONTENT, menuStep[chatId].lastMsgId, opts);
}
async function sendEditExpenseItemMenu(bot, menuStep, chatId, expenseId) {
    const isRecurring = (await findExpenseById(expenseId))?.isRecurring;

    const opts = setMenuButtons([
        [{ text: lang.EXPENSE.BUTTON_EDIT_NAME, callback_data: `expense_edit_name_${expenseId}` }],
        [{ text: lang.EXPENSE.BUTTON_EDIT_COST, callback_data: `expense_edit_cost_${expenseId}` }],
        [{ text: lang.EXPENSE.BUTTON_EDIT_DATE, callback_data: `expense_edit_date_${expenseId}` }],
        [{ text: lang.EXPENSE.BUTTON_EDIT_CATEGORY, callback_data: `expense_edit_category_${expenseId}` }],
        [{ text: isRecurring ? lang.EXPENSE.BUTTON_EDIT_SET_NOT_RECURRING : lang.EXPENSE.BUTTON_EDIT_SET_RECURRING, callback_data: `expense_edit_recurring_${expenseId}` }],
        [{ text: lang.GENERAL.CANCEL, callback_data: "back_to_expense_menu" }],
    ]);
    menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, lang.MENU.EXPENSE.CONTENT, menuStep[chatId].lastMsgId, opts);
}
async function sendEditExpenseMenu(bot, menuStep, chatId, expenseId, action) {
    const actionsMap = {
        name: { menu: "expense_edit_name", prompt: lang.EXPENSE.PROMPT_NAME },
        cost: { menu: "expense_edit_cost", prompt: lang.EXPENSE.PROMPT_COST },
        date: { menu: "expense_edit_date", prompt: lang.EXPENSE.PROMPT_DATE },
        category: { menu: "expense_edit_category", prompt: lang.EXPENSE.PROMPT_CATEGORY },
    };

    if (actionsMap[action]) {
        let opts = "cancel";
        if (action == "category") {
            const familyId = await findUserFamilyId(chatId);
            let response = await getFamilyCategories(familyId);
            if (response?.error) {
                return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error));
            }
            const categories = response;
            opts = setMenuButtons([
                ...categories.map((category) => [{ text: category.name, callback_data: `expense_edit_set_category_${category._id}` }]),
                [{ text: lang.GENERAL.CANCEL, callback_data: "cancel" }],
            ]);
        }

        menuStep[chatId].menu = actionsMap[action].menu;
        menuStep[chatId].expenseId = expenseId;
        menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, actionsMap[action].prompt, menuStep[chatId].lastMsgId, opts);
    }
}

//Income menus
async function sendIncomeMenu(bot, menuStep, chatId) {
    const opts = setMenuButtons(lang.MENU.INCOME.BUTTONS);
    menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, lang.MENU.INCOME.CONTENT, menuStep[chatId].lastMsgId, opts);
}
async function sendIncomeListMenu(bot, menuStep, chatId, action) {
    const familyId = await findUserFamilyId(chatId);
    if (familyId?.error) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, familyId.error, menuStep[chatId].lastMsgId, "back_to_expense_menu"));
    }
    const fromDate = moment().subtract(30, "days");
    const incomes = await queryIncomes({ familyId: familyId, date: { $gte: fromDate.toDate() } });
    if (!incomes.length) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.INCOME.ERROR_NO_INCOMES, menuStep[chatId].lastMsgId, "back_to_expense_menu"));
    }
    const opts = setMenuButtons([
        ...incomes.map((income) => [
            { text: `${moment(income.date).format("DD/MM")} - ${income.name} (${income.amount?.toFixed(2)}${lang.GENERAL.CURRENCY})`, callback_data: `income_${action}_item_${income._id}` },
        ]),
        [{ text: lang.GENERAL.CANCEL, callback_data: "back_to_income_menu" }],
    ]);
    menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, lang.MENU.INCOME.CONTENT, menuStep[chatId].lastMsgId, opts);
}

//Insights menu
async function sendInsightsMenu(bot, menuStep, chatId) {
    const opts = setMenuButtons(lang.MENU.INSIGHTS.BUTTONS);
    menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, lang.MENU.INSIGHTS.CONTENT, menuStep[chatId].lastMsgId, opts);
}

//Handle menu actions
async function renameFamily(bot, menuStep, chatId, familyNewName) {
    const familyId = await findUserFamilyId(chatId);
    if (familyId?.error) {
        if (!menuStep[chatId]) menuStep[chatId] = {};
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.ERROR_NOT_FOUND, menuStep[chatId].lastMsgId));
    }

    await setFamilyName(familyId, familyNewName);
    menuStep[chatId].menu = null;
    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.SUCCESS_RENAME + familyNewName, menuStep[chatId].lastMsgId, "back_to_main_menu");
}
async function updateStartDay(bot, menuStep, chatId, day) {
    const familyId = await findUserFamilyId(chatId);
    if (familyId?.error) {
        if (!menuStep[chatId]) menuStep[chatId] = {};
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.ERROR_NOT_FOUND, menuStep[chatId].lastMsgId));
    }

    if (isNaN(day) || day < 1 || day > 31) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.GENERAL.ERROR_INVALID_NUMBER, menuStep[chatId].lastMsgId, "cancel"));
    }

    await setStartDay(familyId, day);
    menuStep[chatId].menu = null;
    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.SUCCESS_EDIT_DAY + day.toString(), menuStep[chatId].lastMsgId, "back_to_main_menu");
}
async function addNewCategory(bot, menuStep, chatId, category) {
    const familyId = await findUserFamilyId(chatId);
    if (familyId?.error) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, familyId.error, menuStep[chatId].lastMsgId));
    }

    const response = await addCategory(familyId, category);
    if (response?.error) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, menuStep[chatId].lastMsgId));
    }
    menuStep[chatId].menu = null;
    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.CATEGORY.SUCCESS_ADDING, menuStep[chatId].lastMsgId, "back_to_main_menu");
}
async function deleteCategory(bot, menuStep, chatId) {
    const familyId = await findUserFamilyId(chatId);
    if (familyId?.error) {
        if (!menuStep[chatId].lastMsgId) menuStep[chatId].lastMsgId = {};
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, familyId.error, menuStep[chatId].lastMsgId));
    }

    let response = await getFamilyCategories(familyId);
    if (response?.error) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, menuStep[chatId].lastMsgId));
    }

    const categories = response;
    const opts = {
        reply_markup: {
            inline_keyboard: [...categories.map((category) => [{ text: `${category.name}`, callback_data: `${category._id}` }]), [{ text: lang.GENERAL.CANCEL, callback_data: "cancel" }]],
        },
    };
    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.CATEGORY.PROMPT_DELETE, menuStep[chatId].lastMsgId, opts);
    bot.once("callback_query", async (callbackQuery) => {
        const data = callbackQuery.data;
        if (data === "cancel") {
            menuStep[chatId].menu = null;
            return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.GENERAL.CANCEL_ACTION, menuStep[chatId].lastMsgId, "back_to_main_menu"));
        }
        const selectedCategory = callbackQuery.data;
        const response = await removeCategory(familyId, selectedCategory);
        if (response?.error) {
            if (!menuStep[chatId].lastMsgId) menuStep[chatId].lastMsgId = {};
            return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, menuStep[chatId].lastMsgId));
        }

        menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.CATEGORY.SUCCESS_DELETING, menuStep[chatId].lastMsgId, "back_to_main_menu");
        bot.answerCallbackQuery(callbackQuery.id);
    });
}
async function renameCategory(bot, menuStep, chatId) {
    const familyId = await findUserFamilyId(chatId);
    if (familyId?.error) {
        if (!menuStep[chatId].lastMsgId) menuStep[chatId].lastMsgId = {};
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, familyId.error, menuStep[chatId].lastMsgId));
    }

    let response = await getFamilyCategories(familyId);
    if (response?.error) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, menuStep[chatId].lastMsgId));
    }
    const categories = response;

    const opts = {
        reply_markup: {
            inline_keyboard: [...categories.map((category) => [{ text: `${category.name}`, callback_data: `${category._id}` }]), [{ text: lang.GENERAL.CANCEL, callback_data: "cancel" }]],
        },
    };
    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.CATEGORY.PROMPT_EDIT, menuStep[chatId].lastMsgId, opts);

    bot.once("callback_query", async (callbackQuery) => {
        const data = callbackQuery.data;
        if (data === "cancel") {
            menuStep[chatId].menu = null;
            return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.GENERAL.CANCEL_ACTION, menuStep[chatId].lastMsgId, "back_to_main_menu"));
        }

        menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.CATEGORY.PROMPT_NEW_NAME, menuStep[chatId].lastMsgId);

        bot.once("message", async (msg) => {
            const newCategoryName = msg.text;
            let response = await editCategory(familyId, data, newCategoryName);
            if (response?.error) {
                return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, menuStep[chatId].lastMsgId, "back_to_main_menu"));
            }
            menuStep[chatId].menu = null;
            menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.CATEGORY.SUCCESS_EDITING, menuStep[chatId].lastMsgId, "back_to_main_menu");
            bot.answerCallbackQuery(callbackQuery.id);
        });
    });
}
async function handleSetCategoryLimit(bot, menuStep, chatId) {
    const familyId = await findUserFamilyId(chatId);
    if (familyId?.error) {
        if (!menuStep[chatId].lastMsgId) menuStep[chatId].lastMsgId = {};
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, familyId.error, menuStep[chatId].lastMsgId));
    }

    let response = await getFamilyCategories(familyId);
    if (response?.error) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, menuStep[chatId].lastMsgId));
    }
    const categories = response;

    const opts = {
        reply_markup: {
            inline_keyboard: [...categories.map((category) => [{ text: `${category.name}`, callback_data: `${category._id}` }]), [{ text: lang.GENERAL.CANCEL, callback_data: "cancel" }]],
        },
    };
    menuStep[chatId].menu = "category_set_limit";
    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.CATEGORY.PROMPT_EDIT, menuStep[chatId].lastMsgId, opts);
    bot.once("callback_query", async (callbackQuery) => {
        const data = callbackQuery.data;
        if (data === "cancel") {
            menuStep[chatId].menu = null;
            return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.GENERAL.CANCEL_ACTION, menuStep[chatId].lastMsgId, "back_to_main_menu"));
        }
        menuStep[chatId].category = data;
        menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.CATEGORY.PROMPT_NEW_LIMIT, menuStep[chatId].lastMsgId);
        bot.answerCallbackQuery(callbackQuery.id);
    });
}
async function updateCategoryLimit(bot, menuStep, chatId, limit) {
    const familyId = await findUserFamilyId(chatId);
    if (familyId?.error) {
        if (!menuStep[chatId]) menuStep[chatId] = {};
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.ERROR_NOT_FOUND, menuStep[chatId].lastMsgId));
    }

    if (isNaN(limit) || limit < 0) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.GENERAL.ERROR_INVALID_NUMBER, menuStep[chatId].lastMsgId, "cancel"));
    }

    const response = await setCategoryLimit(familyId, menuStep[chatId].category, limit);
    if (response?.error) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.ERROR_EDIT_LIMIT, menuStep[chatId].lastMsgId, "back_to_main_menu"));
    }

    menuStep[chatId].menu = null;
    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.SUCCESS_EDIT_LIMIT + limit.toString() + lang.GENERAL.CURRENCY, menuStep[chatId].lastMsgId, "back_to_main_menu");
}
async function handleDeleteExpense(bot, menuStep, chatId, expenseId) {
    const response = await deleteExpense(expenseId);
    if (response?.error) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, menuStep[chatId].lastMsgId, "back_to_expense_menu"));
    }
    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.SUCCESS_DELETING, menuStep[chatId].lastMsgId, "back_to_expense_menu");
}
async function handleDeleteIncome(bot, menuStep, chatId, incomeId) {
    const response = await deleteIncome(incomeId);
    if (response?.error) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, menuStep[chatId].lastMsgId, "back_to_income_menu"));
    }
    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.INCOME.SUCCESS_DELETING, menuStep[chatId].lastMsgId, "back_to_income_menu");
}
async function handleEditExpenseName(bot, menuStep, chatId, expenseName) {
    const response = await updateExpense(menuStep[chatId].expenseId, { name: expenseName });
    if (response?.error) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, menuStep[chatId].lastMsgId, "back_to_expense_menu"));
    }
    const opts = setMenuButtons([[{ text: lang.EXPENSE.BUTTON_BACK_TO_EDIT, callback_data: `expense_edit_item_${menuStep[chatId].expenseId}` }]]);
    menuStep[chatId].menu = null;
    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.SUCCESS_EDITING, menuStep[chatId].lastMsgId, opts);
}
async function handleEditExpenseCost(bot, menuStep, chatId, expenseCost) {
    const response = await updateExpense(menuStep[chatId].expenseId, { cost: expenseCost });
    if (response?.error) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, menuStep[chatId].lastMsgId, "back_to_expense_menu"));
    }
    const opts = setMenuButtons([[{ text: lang.EXPENSE.BUTTON_BACK_TO_EDIT, callback_data: `expense_edit_item_${menuStep[chatId].expenseId}` }]]);
    menuStep[chatId].menu = null;
    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.SUCCESS_EDITING, menuStep[chatId].lastMsgId, opts);
}
async function handleEditExpenseDate(bot, menuStep, chatId, expenseDay) {
    const expenseData = await queryExpenses({ _id: menuStep[chatId].expenseId });
    if (!expenseData) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.INSIGHT.ERROR_NOT_FOUND, null, "back_to_expense_menu"));
    }

    const currentExpenseDate = moment(expenseData?.date);
    const date = moment([currentExpenseDate.year(), currentExpenseDate.month(), expenseDay]);

    if (!date.isValid()) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.GENERAL.ERROR_INVALID_DATE, null, "back_to_expense_menu"));
    }

    const response = await updateExpense(menuStep[chatId].expenseId, { date });
    if (response?.error) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, menuStep[chatId].lastMsgId, "back_to_expense_menu"));
    }
    const opts = setMenuButtons([[{ text: lang.EXPENSE.BUTTON_BACK_TO_EDIT, callback_data: `expense_edit_item_${menuStep[chatId].expenseId}` }]]);
    menuStep[chatId].menu = null;
    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.SUCCESS_EDITING, menuStep[chatId].lastMsgId, opts);
}
async function handleEditExpenseCategory(bot, menuStep, chatId, categoryId) {
    const response = await updateExpense(menuStep[chatId].expenseId, { category: categoryId });
    if (response?.error) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, menuStep[chatId].lastMsgId, "back_to_expense_menu"));
    }
    const opts = setMenuButtons([[{ text: lang.EXPENSE.BUTTON_BACK_TO_EDIT, callback_data: `expense_edit_item_${menuStep[chatId].expenseId}` }]]);
    menuStep[chatId].menu = null;
    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.SUCCESS_EDITING, menuStep[chatId].lastMsgId, opts);
}
async function handleEditExpenseToggleRecurring(bot, menuStep, chatId, expenseId) {
    const expenseData = await findExpenseById(expenseId);
    if (!expenseData) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.INSIGHT.ERROR_NOT_FOUND, null, "back_to_expense_menu"));
    }
    const response = await updateExpense(expenseId, { isRecurring: !expenseData.isRecurring });
    if (response?.error) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, menuStep[chatId].lastMsgId, "back_to_expense_menu"));
    }
    const opts = setMenuButtons([[{ text: lang.EXPENSE.BUTTON_BACK_TO_EDIT, callback_data: `expense_edit_item_${expenseId}` }]]);
    menuStep[chatId].menu = null;
    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.SUCCESS_EDITING, menuStep[chatId].lastMsgId, opts);
}
async function sendEditIncomeItemMenu(bot, menuStep, chatId, incomeId) {
    const opts = setMenuButtons([
        [{ text: lang.INCOME.BUTTON_EDIT_NAME, callback_data: `income_edit_name_${incomeId}` }],
        [{ text: lang.INCOME.BUTTON_EDIT_AMOUNT, callback_data: `income_edit_amount_${incomeId}` }],
        [{ text: lang.INCOME.BUTTON_EDIT_DATE, callback_data: `income_edit_date_${incomeId}` }],
        [{ text: lang.GENERAL.CANCEL, callback_data: "back_to_income_menu" }],
    ]);
    menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, lang.MENU.INCOME.CONTENT, menuStep[chatId].lastMsgId, opts);
}
async function sendEditIncomeMenu(bot, menuStep, chatId, incomeId, action) {
    const actionsMap = {
        name: { menu: "income_edit_name", prompt: lang.INCOME.PROMPT_NAME },
        amount: { menu: "income_edit_amount", prompt: lang.INCOME.PROMPT_AMOUNT },
        date: { menu: "income_edit_date", prompt: lang.INCOME.PROMPT_DATE },
    };

    if (actionsMap[action]) {
        let opts = "cancel";
        menuStep[chatId].menu = actionsMap[action].menu;
        menuStep[chatId].incomeId = incomeId;
        menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, actionsMap[action].prompt, menuStep[chatId].lastMsgId, opts);
    }
}

async function handleEditIncomeName(bot, menuStep, chatId, incomeName) {
    const response = await updateIncome(menuStep[chatId].incomeId, { name: incomeName });
    if (response?.error) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, menuStep[chatId].lastMsgId, "back_to_income_menu"));
    }
    const opts = setMenuButtons([[{ text: lang.INCOME.BUTTON_BACK_TO_EDIT, callback_data: `income_edit_item_${menuStep[chatId].incomeId}` }]]);
    menuStep[chatId].menu = null;
    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.INCOME.SUCCESS_EDITING, menuStep[chatId].lastMsgId, opts);
}
async function handleEditIncomeAmount(bot, menuStep, chatId, incomeAmount) {
    const response = await updateIncome(menuStep[chatId].incomeId, { amount: incomeAmount });
    if (response?.error) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, menuStep[chatId].lastMsgId, "back_to_income_menu"));
    }
    const opts = setMenuButtons([[{ text: lang.INCOME.BUTTON_BACK_TO_EDIT, callback_data: `income_edit_item_${menuStep[chatId].incomeId}` }]]);
    menuStep[chatId].menu = null;
    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.INCOME.SUCCESS_EDITING, menuStep[chatId].lastMsgId, opts);
}
async function handleEditIncomeDate(bot, menuStep, chatId, incomeDay) {
    const incomeData = await queryIncomes({ _id: menuStep[chatId].incomeId });
    if (!incomeData) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.INSIGHT.ERROR_NOT_FOUND, null, "back_to_income_menu"));
    }

    const currentIncomeDate = moment(incomeData?.date);
    const date = moment([currentIncomeDate.year(), currentIncomeDate.month(), incomeDay]);

    if (!date.isValid()) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.GENERAL.ERROR_INVALID_DATE, null, "back_to_income_menu"));
    }

    const response = await updateIncome(menuStep[chatId].incomeId, { date });
    if (response?.error) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, menuStep[chatId].lastMsgId, "back_to_income_menu"));
    }
    const opts = setMenuButtons([[{ text: lang.INCOME.BUTTON_BACK_TO_EDIT, callback_data: `income_edit_item_${menuStep[chatId].incomeId}` }]]);
    menuStep[chatId].menu = null;
    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.INCOME.SUCCESS_EDITING, menuStep[chatId].lastMsgId, opts);
}
module.exports = { registerMenuCommands, menuStep };
