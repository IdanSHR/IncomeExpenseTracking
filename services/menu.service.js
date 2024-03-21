const moment = require("moment");
const { botSendMessage, botEditMessage } = require("../utils/bot");
const { findUserFamilyId, setStartDay, setFamilyName } = require("./family.service");
const { addCategory, removeCategory, editCategory, getFamilyCategories, setCategoryLimit } = require("./category.service");
const { queryExpenses, updateExpense, deleteExpense, findExpenseById } = require("./expense.service");
const { queryIncomes, deleteIncome } = require("./income.service");

const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);

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
    const menuContect = lang.MENU.MAIN.CONTENT;

    if (edit) {
        menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, menuContect, menuStep[chatId].lastMsgId, opts);
    } else {
        menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, menuContect, menuStep[chatId].lastMsgId, opts);
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
        if (!userSteps[chatId]) userSteps[chatId] = {};
        return (userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, familyId.error, userSteps[chatId]?.lastMsgId));
    }

    const response = await getFamilyCategories(familyId, true);
    if (response?.error) {
        return (userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error));
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
                return (userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error));
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
async function sendDeleteIncomeMenu(bot, menuStep, chatId) {
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
            { text: `${moment(income.date).format("DD/MM")} - ${income.name} (${income.amount?.toFixed(2)}${lang.GENERAL.CURRENCY})`, callback_data: `income_delete_item_${income._id}` },
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

module.exports = {
    sendMainMenu,
    sendFamilyMenu,
    sendExpenseMenu,
    sendIncomeMenu,
    sendCategoryMenu,
    sendInsightsMenu,
    sendEditExpenseItemMenu,
    sendExpenseCategoryMenu,
    sendExpenseListMenu,
    sendEditExpenseMenu,
    sendDeleteIncomeMenu,
    handleDeleteExpense,
    handleDeleteIncome,
    handleEditExpenseName,
    handleEditExpenseCost,
    handleEditExpenseDate,
    handleEditExpenseCategory,
    handleEditExpenseToggleRecurring,
    addNewCategory,
    renameCategory,
    handleSetCategoryLimit,
    updateCategoryLimit,
    deleteCategory,
    renameFamily,
    updateStartDay,
};
