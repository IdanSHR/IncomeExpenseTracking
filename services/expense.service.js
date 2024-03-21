const { Expense } = require("../models/Expense");
const { encrypt, decrypt } = require("../utils/encrypt");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);
const moment = require("moment");

// Create a new expense
async function saveNewExpense(expense) {
    try {
        if (!expense || !expense?.name || !expense.cost) {
            throw new Error(lang.EXPENSE.ERROR_ADDING);
        }

        const encryptedExpense = {
            ...expense,
            name: encrypt(expense.name),
            cost: encrypt(expense.cost.toString()),
        };
        return await Expense.create(encryptedExpense);
    } catch (error) {
        return { error: error.message };
    }
}

//Create many expenses from an array
async function saveManyExpenses(expenses) {
    try {
        if (!expenses || expenses.length === 0) {
            throw new Error(lang.EXPENSE.ERROR_ADDING);
        }

        const encryptedExpenses = expenses.map((expense) => ({
            ...expense,
            name: encrypt(expense.name),
            cost: encrypt(expense.cost.toString()),
        }));
        return await Expense.insertMany(encryptedExpenses);
    } catch (error) {
        return { error: error.message };
    }
}

//Update an expense by id
async function updateExpense(expenseId, expense) {
    try {
        if (!expenseId || !expense) {
            throw new Error(lang.EXPENSE.ERROR_EDITING);
        }

        const encryptedExpense = {
            ...expense,
            name: expense.name ? encrypt(expense.name) : undefined,
            cost: expense.cost ? encrypt(expense.cost.toString()) : undefined,
        };

        return await Expense.findByIdAndUpdate(expenseId, encryptedExpense, { new: true });
    } catch (error) {
        return { error: error.message };
    }
}
// Query expenses and decrypt them
async function queryExpenses(filters = {}, sort = { category: 1 }) {
    try {
        const expenses = await Expense.find(filters).sort(sort).lean();
        const decryptedExpenses = expenses.map((expense) => ({
            ...expense,
            name: decrypt(expense.name),
            cost: parseFloat(decrypt(expense.cost) || 0),
        }));
        return decryptedExpenses;
    } catch (error) {
        return { error: error.message };
    }
}

//Query one expense by id
async function findExpenseById(expenseId) {
    try {
        if (!expenseId) {
            throw new Error(lang.EXPENSE.ERROR_NO_EXPENSES);
        }
        const expense = await Expense.findById(expenseId).lean();
        if (!expense) return null;

        const decryptedExpense = {
            ...expense,
            name: decrypt(expense.name),
            cost: parseFloat(decrypt(expense.cost)),
        };

        return decryptedExpense;
    } catch (error) {
        return { error: error.message };
    }
}

// Delete an expense
async function deleteExpense(expenseId) {
    try {
        if (!expenseId) {
            throw new Error(lang.EXPENSE.ERROR_DELETING);
        }

        return await Expense.findByIdAndDelete(expenseId);
    } catch (error) {
        return { error: error.message };
    }
}

// Get all the expenses of a family for a given month
async function getMonthExpense(family, month = null, year = null) {
    try {
        if (!family) {
            throw new Error(lang.FAMILY.ERROR_WRONG_FAMILY);
        }

        let startDate;
        if (year !== null && month !== null) {
            startDate = moment([year, month - 1, family.startDay]);
        } else if (year === null && month !== null) {
            startDate = moment([moment().year(), month - 1, family.startDay]);
        } else {
            startDate = moment().date(family.startDay);
        }
        if (moment().date() < family.startDay) {
            startDate = startDate.subtract(1, "months"); // Shift back one month if before startDay
        }
        const endDate = moment(startDate).add(1, "months");
        const expenses = await queryExpenses({
            familyId: family._id,
            date: {
                $gte: startDate,
                $lt: endDate,
            },
        });

        return expenses;
    } catch (error) {
        return { error: error.message };
    }
}

// Make an expense recurring by its id (used by the cron job)
async function makeExpenseRecurring(expenseId) {
    try {
        if (!expenseId) {
            throw new Error(lang.EXPENSE.ERROR_ADDING_RECURRING);
        }

        return await Expense.findOneAndUpdate({ _id: expenseId }, { isRecurring: true }, { new: true });
    } catch (error) {
        return { error: error.message };
    }
}

// Split an expense into multiple payments
async function splitExpense(expenseId, paymentsNumber) {
    try {
        if (!expenseId) {
            throw new Error(lang.EXPENSE.ERROR_SPLITTING);
        }

        const expense = await findExpenseById(expenseId);
        if (!expense) {
            throw new Error(lang.EXPENSE.ERROR_SPLITTING);
        }

        const newExpenses = [];
        const newCost = expense.cost / paymentsNumber;
        let date = moment(expense.date);

        for (let i = 0; i < paymentsNumber; i++) {
            newExpenses.push({
                familyId: expense.familyId,
                date: date.toDate(),
                name: expense.name,
                cost: newCost.toString(),
                category: expense.category,
            });
            date.add(1, "months");
        }
        saveManyExpenses(newExpenses);
        deleteExpense(expenseId);
        return newExpenses;
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = {
    saveNewExpense,
    updateExpense,
    saveManyExpenses,
    deleteExpense,
    queryExpenses,
    findExpenseById,
    getMonthExpense,
    makeExpenseRecurring,
    splitExpense,
};
