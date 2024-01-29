const { Expense } = require("../models/Expense");
const { encrypt, decrypt } = require("../utils/encrypt");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);

// Create a new expense
async function saveNewExpense(expense) {
    if (!expense || !expense?.name || !expense.cost) {
        return { error: lang.EXPENSE.ERROR_ADDING };
    }

    try {
        expense.name = encrypt(expense.name);
        expense.cost = encrypt(expense.cost.toString());
        return await Expense.create(expense);
    } catch (error) {
        return { error };
    }
}

// Query expenses and decrypt them
async function queryExpenses(filters = {}) {
    try {
        const expenses = await Expense.find(filters).sort({ category: 1 }).exec();
        const decryptedExpenses = [];

        for (const expense of expenses) {
            decryptedExpenses.push({
                _id: expense._id,
                familyId: expense.familyId,
                date: expense.date,
                name: decrypt(expense.name) || "undefined",
                cost: parseFloat(decrypt(expense.cost) || 0),
                category: expense.category,
                isRecurring: expense.isRecurring,
            });
        }

        return decryptedExpenses;
    } catch (error) {
        return { error };
    }
}

// Delete an expense
async function deleteExpense(expenseId) {
    if (!expenseId) {
        return { error: lang.EXPENSE.ERROR_DELETING };
    }

    try {
        return await Expense.findByIdAndDelete(expenseId);
    } catch (error) {
        return { error };
    }
}

// Get all the expenses of a family for a given month
async function getMonthExpense(family, month = null, year = null) {
    if (!family) {
        return { error: lang.FAMILY.ERROR_WRONG_FAMILY };
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const familyStartDay = family.startDay || 1;
    const startYear = year !== null ? year : currentYear;
    const startMonth = month !== null ? month - 1 : currentMonth;
    const startDate = new Date(startYear, startMonth, familyStartDay);
    const endDate = new Date(startYear, startMonth + 1, familyStartDay);

    const expenses = await queryExpenses({
        familyId: family._id,
        date: {
            $gte: startDate,
            $lt: endDate,
        },
    });

    return expenses;
}

// Make an expense recurring by its id (used by the cron job)
async function makeExpenseRecurring(expenseId) {
    if (!expenseId) {
        return { error: lang.EXPENSE.ERROR_ADDING_RECURRING };
    }

    try {
        const expense = await Expense.findById(expenseId);
        if (!expense) {
            return { error: lang.EXPENSE.ERROR_ADDING_RECURRING };
        }

        expense.isRecurring = true;
        return await expense.save();
    } catch (error) {
        return { error };
    }
}

module.exports = { saveNewExpense, deleteExpense, queryExpenses, getMonthExpense, makeExpenseRecurring };
