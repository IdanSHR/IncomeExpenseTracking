const { Income } = require("../models/Income");
const { encrypt, decrypt } = require("../utils/encrypt");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);
const moment = require("moment");

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

// Create many incomes from an array
async function saveManyIncomes(incomes) {
    if (!incomes || incomes.length === 0) {
        return { error: lang.INCOME.ERROR_ADDING };
    }

    try {
        incomes.forEach((income) => {
            income.name = encrypt(income.name);
            income.amount = encrypt(income.amount.toString());
        });
        return await Income.insertMany(incomes);
    } catch (error) {
        return { error };
    }
}

// Update an income by id
async function updateIncome(incomeId, income) {
    if (!incomeId || !income) {
        return { error: lang.INCOME.ERROR_ADDING };
    }

    try {
        if (income?.name) {
            income.name = encrypt(income.name);
        }
        if (income?.amount) {
            income.amount = encrypt(income.amount.toString());
        }

        return await Income.findByIdAndUpdate(incomeId, income);
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

    const incomes = await queryIncomes({
        familyId: family._id,
        date: {
            $gte: startDate.toDate(),
            $lt: endDate.toDate(),
        },
    });

    return incomes;
}

module.exports = { saveNewIncome, saveManyIncomes, updateIncome, deleteIncome, queryIncomes, getMonthIncomes };
