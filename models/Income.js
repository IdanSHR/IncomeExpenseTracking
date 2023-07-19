const mongoose = require("mongoose");

const IncomeSchema = new mongoose.Schema({
    familyId: String,
    name: String,
    amount: String,
    date: { type: Date, default: Date.now },
});

const Income = mongoose.model("Income", IncomeSchema);

module.exports = { Income };
