const moment = require("moment");
const { botSendMessage, botEditMessage } = require("../utils/bot");
const { findUserFamilyId, setStartDay } = require("./family.service");
const { addCategory, removeCategory, editCategory, getFamilyCategories, setCategoryLimit } = require("./category.service");

const { queryExpenses, deleteExpense } = require("./expense.service");

const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);

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

//Menus
async function sendMainMenu(bot, menuStep, chatId, edit = true) {
    const opts = setMenuButtons(lang.MENU.MAIN.BUTTONS);
    const menuContect = lang.MENU.MAIN.CONTENT;

    if (edit) {
        menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, menuContect, menuStep[chatId].lastMsgId, opts);
    } else {
        menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, menuContect, menuStep[chatId].lastMsgId, opts);
    }
}
async function sendFamilyMenu(bot, menuStep, chatId) {
    const opts = setMenuButtons(lang.MENU.FAMILY.BUTTONS);
    menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, lang.MENU.FAMILY.CONTENT, menuStep[chatId].lastMsgId, opts);
}
async function sendCategoryMenu(bot, menuStep, chatId) {
    const opts = setMenuButtons(lang.MENU.CATEGORY.BUTTONS);
    menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, lang.MENU.CATEGORY.CONTENT, menuStep[chatId].lastMsgId, opts);
}
async function sendExpenseMenu(bot, menuStep, chatId) {
    const opts = setMenuButtons(lang.MENU.EXPENSE.BUTTONS);
    menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, lang.MENU.EXPENSE.CONTENT, menuStep[chatId].lastMsgId, opts);
}
async function sendDeleteExpenseMenu(bot, menuStep, chatId) {
    const familyId = await findUserFamilyId(chatId);
    if (familyId?.error) {
        if (!userSteps[chatId]) userSteps[chatId] = {};
        return (userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, familyId.error, userSteps[chatId]?.lastMsgId));
    }

    const response = await getFamilyCategories(familyId);
    if (response?.error) {
        return (userSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error));
    }
    const categories = response.data;
    const opts = setMenuButtons([
        ...categories.map((category) => [{ text: category.name, callback_data: `expense_delete_list_${category._id}` }]),
        [{ text: lang.GENERAL.CANCEL, callback_data: "back_to_expense_menu" }],
    ]);
    menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, lang.MENU.EXPENSE.CONTENT, menuStep[chatId].lastMsgId, opts);
}
async function sendDeleteExpenseListMenu(bot, menuStep, chatId, categoryId) {
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
            { text: `${moment(expense.date).format("DD/MM")} - ${expense.name} (${expense.cost.toFixed(2)}${lang.GENERAL.CURRENCY})`, callback_data: `expense_delete_item_${expense._id}` },
        ]),
        [{ text: lang.GENERAL.CANCEL, callback_data: "back_to_expense_menu" }],
    ]);
    menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, lang.MENU.EXPENSE.CONTENT, menuStep[chatId].lastMsgId, opts);
}
async function handleDeleteExpense(bot, menuStep, chatId, expenseId) {
    const response = await deleteExpense(expenseId);
    if (response?.error) {
        return (menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error, menuStep[chatId].lastMsgId, "back_to_expense_menu"));
    }
    menuStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.EXPENSE.SUCCESS_DELETING, menuStep[chatId].lastMsgId, "back_to_expense_menu");
}
async function sendIncomeMenu(bot, menuStep, chatId) {
    const opts = setMenuButtons(lang.MENU.INCOME.BUTTONS);
    menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, lang.MENU.INCOME.CONTENT, menuStep[chatId].lastMsgId, opts);
}
async function sendInsightsMenu(bot, menuStep, chatId) {
    const opts = setMenuButtons(lang.MENU.INSIGHTS.BUTTONS);
    menuStep[chatId].lastMsgId = await botEditMessage(bot, chatId, lang.MENU.INSIGHTS.CONTENT, menuStep[chatId].lastMsgId, opts);
}
//handles

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

    const categories = response.data;
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
    const categories = response.data;

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
    const categories = response.data;

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
module.exports = {
    sendMainMenu,
    sendFamilyMenu,
    sendExpenseMenu,
    sendIncomeMenu,
    sendCategoryMenu,
    sendInsightsMenu,
    sendDeleteExpenseMenu,
    sendDeleteExpenseListMenu,
    handleDeleteExpense,
    addNewCategory,
    renameCategory,
    handleSetCategoryLimit,
    updateCategoryLimit,
    deleteCategory,
    renameFamily,
    updateStartDay,
};
