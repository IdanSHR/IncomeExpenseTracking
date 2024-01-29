const { Income } = require("../models/Income");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);
const { encrypt, decrypt } = require("../utils/encrypt");

async function saveNewIncome(income) {
    if (!income) {
        return { error: lang.INCOME.ERROR_ADDING };
    }

    try {
        income.name = encrypt(income.name);
        income.amount = encrypt(income.amount.toString());
        return await Income.create(income);
    } catch (error) {
        return { error };
    }
}

async function queryIncomes(filters) {
    try {
        const incomes = await Income.find(filters);
        return incomes;
    } catch (error) {
        return { error };
    }
}
async function deleteIncome(incomeId) {
    if (!incomeId) {
        return { error: lang.INCOME.ERROR_DELETING };
    }

    try {
        return await Income.findByIdAndDelete(incomeId);
    } catch (error) {
        return { error };
    }
}

async function getMonthIncomes(family, month = null, year = null) {
    if (!family) {
        return { error: lang.FAMILY.ERROR_WRONG_FAMILY };
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const familyStartDay = family.startDay || 1;

    let startYear;
    let startMonth;

    if (year !== null) {
        startYear = year;
    } else {
        startYear = currentYear;
    }

    if (month !== null) {
        startMonth = month - 1;
    } else {
        startMonth = currentMonth;
    }

    const startDate = new Date(startYear, startMonth, familyStartDay);
    const endDate = new Date(startYear, startMonth + 1, familyStartDay);

    const decryptedIncomes = [];

    const incomes = await Income.find({
        familyId: family._id,
        date: {
            $gte: startDate,
            $lt: endDate,
        },
    }).exec();

    for (const income of incomes) {
        decryptedIncomes.push({
            _id: income._id,
            familyId: income.familyId,
            date: income.date,
            name: decrypt(income.name) || "undefined",
            amount: parseFloat(decrypt(income.amount) || 0),
        });
    }

    return decryptedIncomes;
}
module.exports = { saveNewIncome, deleteIncome, queryIncomes, getMonthIncomes };
