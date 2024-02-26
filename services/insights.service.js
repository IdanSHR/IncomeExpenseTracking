const { findUserFamily } = require("../services/family.service");
const { getFamilyCategories } = require("../services/category.service");
const { botSendMessage } = require("../utils/bot");
const { getMonthExpense } = require("./expense.service");
const { getMonthIncomes } = require("./income.service");

const moment = require("moment");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);

async function sendStatus(bot, insightStep, chatId, edit = true) {
    const family = await findUserFamily(chatId);
    if (family?.error) {
        return (insightStep[chatId].lastMsgId = await botSendMessage(bot, chatId, family.error));
    }

    let response = await getFamilyCategories(family._id, true);
    if (response?.error) {
        return (insightStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error));
    }
    const categories = response.data;
    const familyStartDay = family.startDay || 1;
    const expenses = await getMonthExpense(family, insightStep[chatId]?.currentMonth, insightStep[chatId]?.currentYear);
    const incomes = await getMonthIncomes(family, insightStep[chatId]?.currentMonth, insightStep[chatId]?.currentYear);
    if (expenses?.error || incomes?.error) {
        return (insightStep[chatId].lastMsgId = await botSendMessage(bot, chatId, expenses?.error || incomes?.error));
    }

    const currentMonth = insightStep[chatId]?.currentMonth || moment().month() + 1;
    const currentYear = moment(insightStep[chatId]?.currentYear, "YYYY").format("YY") || moment().format("YY");
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? moment(currentYear, "YYYY").add(1, "year").format("YY") : currentYear;
    const { incomesMessage, totalAmount } = createIncomesMessage(incomes);

    let totalCost = 0;
    let expenseGroups = {};
    let totalCategory = [];

    expenses.forEach((expense) => {
        totalCost += expense.cost;
        if (expenseGroups[expense.category]) {
            expenseGroups[expense.category].push(expense);
        } else {
            expenseGroups[expense.category] = [expense];
        }
        totalCategory[expense.category] = totalCategory[expense.category] ? totalCategory[expense.category] + expense.cost : expense.cost;
    });

    let message = `*${lang.INSIGHT.MESSAGE_SUMMARY}${family.name}\n(${familyStartDay}/${currentMonth}/${currentYear} - ${familyStartDay}/${nextMonth}/${nextYear})*\n\n`;
    message += createExpensesMessage(expenseGroups, totalCategory, categories, totalCost);
    message += `${incomesMessage}  * ${lang.INSIGHT.MESSAGE_STATUS}: ${(totalAmount - totalCost).toFixed(2)}₪ *`;
    let buttons = [{ text: lang.GENERAL.PREV, callback_data: "send_status_prev" }];
    if (moment().month() + 1 !== insightStep[chatId].currentMonth || moment().year() !== insightStep[chatId].currentYear) {
        if (botLanguage === "he" || botLanguage === "ar") {
            buttons.unshift({ text: lang.GENERAL.NEXT, callback_data: "send_status_next" });
        } else {
            buttons.push({ text: lang.GENERAL.NEXT, callback_data: "send_status_next" });
        }
    }
    const opts = {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [buttons],
        },
    };

    if (edit) {
        insightStep[chatId].lastMsgId = await botEditMessage(bot, chatId, message, insightStep[chatId].lastMsgId, opts);
    } else {
        insightStep[chatId].lastMsgId = await botSendMessage(bot, chatId, message, insightStep[chatId].lastMsgId, opts);
    }
}
async function sendCategories(bot, insightStep, chatId, edit = true) {
    const family = await findUserFamily(chatId);
    if (family?.error) {
        return (insightStep[chatId].lastMsgId = await botSendMessage(bot, chatId, family.error));
    }

    let response = await getFamilyCategories(family._id, true);
    if (response?.error) {
        return (insightStep[chatId].lastMsgId = await botSendMessage(bot, chatId, response.error));
    }

    const categories = response.data;
    const expenses = await getMonthExpense(family);
    if (expenses?.error) {
        return (insightStep[chatId].lastMsgId = await botSendMessage(bot, chatId, expenses.error));
    }

    let categoriesData = [];
    expenses.forEach((expense) => {
        const category = categories.find((cat) => cat._id.toString() == expense.category);
        const currentCategory = categoriesData.find((cat) => cat._id == expense.category);
        if (!currentCategory) {
            categoriesData.push({ _id: expense.category, name: category?.name, total: expense.cost });
        } else {
            currentCategory.total += expense.cost;
            category.total += expense.cost;
        }
    });
    const totalExpense = expenses.reduce((sum, expense) => sum + expense.cost, 0);
    let message = `${lang.INSIGHT.MESSAGE_BY_CATEGORIES}:\n`;

    for (let category of categoriesData) {
        const proportion = ((category.total / totalExpense) * 100).toFixed(2);
        message += `🔹 ${category.name}: ${proportion}%\n`;
    }
    return await botSendMessage(bot, chatId, message);
}
async function sendMonthlyChange(bot, insightStep, chatId, edit = true) {
    const family = await findUserFamily(chatId);
    if (family?.error) {
        return (insightStep[chatId].lastMsgId = await botSendMessage(bot, chatId, family.error));
    }

    const currentMonth = moment().month() + 1;
    const currentExpenses = await getMonthExpense(family);
    const lastMonthExpenses = await getMonthExpense(family, currentMonth - 1);
    if (currentExpenses?.error || !currentExpenses.length || lastMonthExpenses?.error || !lastMonthExpenses.length) {
        return (insightStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.INSIGHT.ERROR_NOT_FOUND));
    }
    const currentTotal = currentExpenses.reduce((sum, expense) => sum + expense.cost, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, expense) => sum + expense.cost, 0);
    const change = (((currentTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(2);
    await botSendMessage(bot, chatId, `${lang.INSIGHT.MESSAGE_MONTHLY_CHANGE}: ${change}%`);
}
async function sendExpensiveDay(bot, insightStep, chatId, edit = true) {
    const family = await findUserFamily(chatId);
    if (family?.error) {
        return bot.sendMessage(chatId, family.error);
    }

    const expenses = await getMonthExpense(family);
    if (expenses?.error) {
        return (insightStep[chatId].lastMsgId = await botSendMessage(bot, chatId, expenses.error));
    }
    let days = Array(7).fill(0);
    expenses.forEach((expense) => {
        const day = new Date(expense.date).getDay();
        days[day] += expense.cost;
    });
    const mostCostlyDay = lang.INSIGHT.WEEK_DAYS[days.indexOf(Math.max(...days))];
    return botSendMessage(bot, chatId, `${lang.INSIGHT.MESSAGE_EXPENSIVE_DAY}: ${mostCostlyDay}`);
}

function createExpensesMessage(expenseGroups, totalCategory, categories, totalCost) {
    let expensesMessage = `* ${lang.INSIGHT.MESSAGE_EXPENSES}: *\n\n`;

    Object.keys(expenseGroups).forEach((category) => {
        const currentCategory = categories.find((cat) => cat._id.toString() == category);
        if (!currentCategory) {
            return;
        }

        const expensesList = expenseGroups[category].map((expense) => `${moment(expense.date).format("DD/MM")} -  ${expense.name} (*${expense.cost.toFixed(2)}${lang.GENERAL.CURRENCY}*)`).join("\n");
        expensesMessage += `🔸*${currentCategory?.name || "undefined"}:*\n${expensesList}\n*${lang.INSIGHT.MESSAGE_TOTAL} ${totalCategory[category].toFixed(2)}${lang.GENERAL.CURRENCY} ${
            currentCategory?.monthlyLimit ? `${lang.INSIGHT.MESSAGE_OUT_OF} ${currentCategory?.monthlyLimit.toFixed(2).toString() || "0"}${lang.GENERAL.CURRENCY}` : ""
        }*\n\n`;
    });
    expensesMessage += `*${lang.INSIGHT.MESSAGE_TOTAL_EXPENSES}: ${totalCost.toFixed(2)}${lang.GENERAL.CURRENCY} *\n\n`;
    return expensesMessage;
}
function createIncomesMessage(incomes) {
    let totalAmount = 0;
    let incomesMessage = `*${lang.INSIGHT.MESSAGE_INCOMES}: *\n`;

    const incomesList = incomes
        .map((income) => {
            totalAmount += income.amount || 0;
            return `${moment(income.date).format("DD/MM")} - ${income.name} (*${income.amount.toFixed(2)}${lang.GENERAL.CURRENCY}*)`;
        })
        .join("\n");

    incomesMessage += `${incomesList}\n\n *${lang.INSIGHT.MESSAGE_TOTAL_INCOMES}: ${totalAmount.toFixed(2)}${lang.GENERAL.CURRENCY} *\n\n`;

    return { incomesMessage, totalAmount };
}
module.exports = { sendStatus, sendCategories, sendMonthlyChange, sendExpensiveDay };
