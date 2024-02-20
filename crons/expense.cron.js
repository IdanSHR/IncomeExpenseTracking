const cron = require("node-cron");
const moment = require("moment");
const { Expense } = require("../models/Expense");
const { botSendMessage } = require("../utils/bot");
const { queryExpenses, saveManyExpenses } = require("../services/expense.service");
const { findFamilyMembers } = require("../services/family.service");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);

function expenseCron(bot) {
    findAndCreateExpenses(bot);
    cron.schedule("0 0 * * *", async () => {
        findAndCreateExpenses(bot);
    });
}

async function findAndCreateExpenses(bot) {
    const today = moment().utc();
    const previousMonth = today.clone().subtract(1, "months").utc();

    if (!previousMonth.isValid()) {
        previousMonth.endOf("month");
    }

    const expensesDue = await queryExpenses({
        isRecurring: true,
        date: {
            $gte: previousMonth.startOf("day").toDate(),
            $lt: previousMonth.endOf("day").toDate(),
        },
    });

    const expensesByFamily = expensesDue.reduce((acc, expense) => {
        const { familyId } = expense;
        if (!acc[familyId]) {
            acc[familyId] = [];
        }
        const { _id, ...rest } = expense;
        acc[familyId].push({
            ...rest,
            date: today.startOf("day").toDate(),
        });
        return acc;
    }, {});

    for (const [familyId, expenses] of Object.entries(expensesByFamily)) {
        if (!expenses.length) {
            console.log(`No expenses found for family ${familyId}`);
            continue;
        }
        try {
            //send with encryption, change later
            await saveManyExpenses(...expenses);
            let message = lang.EXPENSE.SUCCESS_RECREATING_EXPENSES;
            expenses.forEach(async (expense, index) => {
                message += `${index + 1}. ${expense.name} - $${expense.cost}\n`;
            });

            const familyMembers = await findFamilyMembers(familyId);
            for (const member of familyMembers) {
                await botSendMessage(bot, member, message);
            }
        } catch (error) {
            console.log(error);
        }
    }
}
module.exports = expenseCron;
