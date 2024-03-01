const { Expense } = require("../models/Expense");
const { encrypt, decrypt } = require("../utils/encrypt");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);
const moment = require("moment");

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

//Create many expenses from an array
async function saveManyExpenses(expenses) {
    console.log({ expenses });
    if (!expenses || expenses.length === 0) {
        return { error: lang.EXPENSE.ERROR_ADDING };
    }
    try {
        expenses.forEach((expense) => {
            expense.name = encrypt(expense.name);
            expense.cost = encrypt(expense.cost.toString());
        });
        return await Expense.insertMany(expenses);
    } catch (error) {
        return { error };
    }
}

//Update an expense by id
async function updateExpense(expenseId, expense) {
    if (!expenseId || !expense) {
        return { error: lang.EXPENSE.ERROR_ADDING };
    }

    try {
        if (expense?.name) {
            expense.name = encrypt(expense.name);
        }
        if (expense?.cost) {
            expense.cost = encrypt(expense.cost.toString());
        }

        return await Expense.findByIdAndUpdate(expenseId, expense);
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

//Query one expense by id
async function findExpenseById(expenseId) {
    try {
        const expense = Expense.findById(expenseId);
        if (!expense) return null;

        expense.name = decrypt(expense.name);
        expense.cost = parseFloat(decrypt(expense.cost));
        return expense;
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
}

// Make an expense recurring by its id (used by the cron job)
async function makeExpenseRecurring(expenseId) {
    if (!expenseId) {
        return { error: lang.EXPENSE.ERROR_ADDING_RECURRING };
    }

    try {
        const expense = await Expense.findById(expenseId);
        if (!expense) {
            return { error: lang.EXPENSE.ERROR_SPLITTING };
        }

        expense.isRecurring = true;
        return await expense.save();
    } catch (error) {
        return { error };
    }
}

// Split an expense into multiple payments
async function splitExpense(expenseId, paymentsNumber) {
    if (!expenseId) {
        return { error: lang.EXPENSE.ERROR_SPLITTING };
    }

    try {
        const expenseData = await queryExpenses({ _id: expenseId });
        if (!expenseData) {
            return { error: lang.EXPENSE.ERROR_SPLITTING };
        }

        const expense = expenseData[0];
        const newExpenses = [];
        const newCost = expense.cost / paymentsNumber;
        let date = moment(expense.date);

        for (let i = 0; i < paymentsNumber; i++) {
            newExpenses.push(
                new Expense({
                    familyId: expense.familyId,
                    date: date.toDate(),
                    name: expense.name,
                    cost: newCost.toString(),
                    category: expense.category,
                })
            );
            date.add(1, "months");
        }
        saveManyExpenses(newExpenses);
        deleteExpense(expenseId);
        return newExpenses;
    } catch (error) {
        return { error };
    }
}

module.exports = { saveNewExpense, updateExpense, saveManyExpenses, deleteExpense, queryExpenses, findExpenseById, getMonthExpense, makeExpenseRecurring, splitExpense };
