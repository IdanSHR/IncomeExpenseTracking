const { Income } = require("../models/Income");
const { encrypt, decrypt } = require("../utils/encrypt");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);

// Create a new income
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

// Query incomes and decrypt them
async function queryIncomes(filters = {}) {
    try {
        const incomes = await Income.find(filters).exec();
        const decryptedIncomes = [];

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
    } catch (error) {
        console.error({ error });
        return null;
    }
}

// Delete an income
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

// Get all the incomes of a family for a given month
async function getMonthIncomes(family, month = null, year = null) {
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

    const incomes = await queryIncomes({
        familyId: family._id,
        date: {
            $gte: startDate,
            $lt: endDate,
        },
    });

    return incomes;
}

module.exports = { saveNewIncome, deleteIncome, queryIncomes, getMonthIncomes };
