const { Income } = require("../models/Income");
const { encrypt, decrypt } = require("../utils/encrypt");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);
const moment = require("moment");

// Create a new income
async function saveNewIncome(income) {
    try {
        if (!income) {
            throw new Error(lang.INCOME.ERROR_ADDING);
        }

        const encryptedIncome = {
            ...income,
            name: encrypt(income.name),
            amount: encrypt(income.amount.toString()),
        };
        return await Income.create(encryptedIncome);
    } catch (error) {
        return { error: error.message };
    }
}

// Create many incomes from an array
async function saveManyIncomes(incomes) {
    try {
        if (!incomes || incomes.length === 0) {
            throw new Error(lang.INCOME.ERROR_ADDING);
        }

        const encryptedIncomes = incomes.map((income) => ({
            ...income,
            name: encrypt(income.name),
            amount: encrypt(income.amount.toString()),
        }));
        return await Income.insertMany(encryptedIncomes);
    } catch (error) {
        return { error: error.message };
    }
}

// Update an income by id
async function updateIncome(incomeId, income) {
    try {
        if (!incomeId || !income) {
            throw new Error(lang.INCOME.ERROR_ADDING);
        }

        const encryptedIncome = {
            ...income,
            name: income.name ? encrypt(income.name) : undefined,
            amount: income.amount ? encrypt(income.amount.toString()) : undefined,
        };

        return await Income.findByIdAndUpdate(incomeId, encryptedIncome, { new: true });
    } catch (error) {
        return { error: error.message };
    }
}

// Query incomes and decrypt them
async function queryIncomes(filters = {}) {
    try {
        const incomes = await Income.find(filters).lean();
        const decryptedIncomes = incomes.map((income) => ({
            ...income,
            name: decrypt(income.name),
            amount: parseFloat(decrypt(income.amount) || 0),
        }));

        return decryptedIncomes;
    } catch (error) {
        console.error({ error });
        return null;
    }
}

// Delete an income
async function deleteIncome(incomeId) {
    try {
        if (!incomeId) {
            throw new Error(lang.INCOME.ERROR_DELETING);
        }

        return await Income.findByIdAndDelete(incomeId);
    } catch (error) {
        return { error: error.message };
    }
}

// Get all the incomes of a family for a given month
async function getMonthIncomes(family, month = null, year = null) {
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

        const incomes = await queryIncomes({
            familyId: family._id,
            date: {
                $gte: startDate.toDate(),
                $lt: endDate.toDate(),
            },
        });

        return incomes;
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = {
    saveNewIncome,
    saveManyIncomes,
    updateIncome,
    deleteIncome,
    queryIncomes,
    getMonthIncomes,
};
