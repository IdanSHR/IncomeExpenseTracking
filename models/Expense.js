const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
    familyId: String,
    name: String,
    category: String,
    cost: String,
    isRecurring: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
});

const Expense = mongoose.model("Expense", ExpenseSchema);

module.exports = { Expense };
