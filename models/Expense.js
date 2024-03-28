const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: "Family" },
    name: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    cost: String,
    isRecurring: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
});

const Expense = mongoose.model("Expense", ExpenseSchema);

module.exports = { Expense };
