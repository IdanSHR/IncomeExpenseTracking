const { Expense } = require("../models/Expense");
const moment = require("moment");
const { encrypt, decrypt } = require("../utils/encrypt");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);

async function setNewExpense(familyId) {
    if (!familyId) {
        return { error: lang.EXPENSE.ERROR_CREATING };
    }
    return new Expense({ familyId });
}

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

module.exports = { setNewExpense, saveNewExpense, getMonthExpense };
