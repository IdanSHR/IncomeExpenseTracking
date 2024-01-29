const cron = require("node-cron");
const moment = require("moment");
const { Expense } = require("../models/Expense");

function expenseCron() {
    cron.schedule("0 0 * * *", async () => {
        const today = moment().utc();
        const previousMonth = today.clone().subtract(1, "months").utc();

        if (!previousMonth.isValid()) {
            previousMonth.endOf("month");
        }

        const expensesDue = await Expense.find({
            isRecurring: true,
            date: {
                $gte: previousMonth.startOf("day").toDate(),
                $lt: previousMonth.endOf("day").toDate(),
            },
        });

        for (const expense of expensesDue) {
            const newExpense = {
                ...expense._doc,
                date: today.startOf("day").toDate(),
                _id: undefined,
            };

            await Expense.create(newExpense);
        }
        console.log("done");
    });
}
module.exports = expenseCron;
