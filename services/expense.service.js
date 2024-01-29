const { Expense } = require("../models/Expense");
const moment = require("moment");
const { encrypt, decrypt } = require("../utils/encrypt");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);

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

async function queryExpenses(filters) {
    try {
        const expenses = await Expense.find(filters);
        return expenses;
    } catch (error) {
        return { error };
    }
}
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

async function getMonthExpense(family, month = null, year = null) {
    if (!family) {
        return { error: lang.FAMILY.ERROR_WRONG_FAMILY };
    }

    let startDate;
    if (year !== null && month !== null) {
        startDate = moment([year, month - 1, family.startDay]);
    } else if (year === null && month !== null) {
        startDate = moment([moment().year(), month - 1, family.startDay]);
    } else {
        startDate = moment().date(family.startDay);
    }

    const endDate = moment(startDate).add(1, "months");
    const decryptedExpenses = [];
    const expenses = await Expense.find({
        familyId: family._id,
        date: {
            $gte: startDate.toDate(),
            $lt: endDate.toDate(),
        },
    })
        .sort({ category: 1 })
        .exec();

    for (const expense of expenses) {
        decryptedExpenses.push({
            _id: expense._id,
            familyId: expense.familyId,
            category: expense.category,
            date: expense.date,
            name: decrypt(expense.name) || "undefined",
            cost: parseFloat(decrypt(expense.cost) || 0),
        });
    }

    return decryptedExpenses;
}

async function makeExpenseRecurring(expenseId) {
    if (!expenseId) {
        return { error: "lang.EXPENSE.ERROR_ADDING_RECURRING" };
    }

    try {
        const expense = await Expense.findById(expenseId);
        if (!expense) {
            return { error: "lang.EXPENSE.ERROR_ADDING_RECURRING" };
        }

        expense.isRecurring = true;
        return await expense.save();
    } catch (error) {
        return { error };
    }
}

module.exports = { saveNewExpense, deleteExpense, queryExpenses, getMonthExpense, makeExpenseRecurring };
