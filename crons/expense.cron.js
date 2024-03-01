const cron = require("node-cron");
const moment = require("moment");
const { botSendMessage } = require("../utils/bot");
const { queryExpenses, saveManyExpenses } = require("../services/expense.service");
const { findFamilyMembers } = require("../services/family.service");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);

function expenseCron(bot) {
    cron.schedule("0 12 * * *", async () => {
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
        if (!expenses.length) continue;

        try {
            await saveManyExpenses([...expenses]);
            let message = lang.EXPENSE.SUCCESS_RECREATING_EXPENSES;
            expenses.forEach(async (expense, index) => {
                message += `${index + 1}. ${expense.name} - ${expense.cost}${lang.GENERAL.CURRENCY}\n`;
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
