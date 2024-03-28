const mongoose = require("mongoose");

const IncomeSchema = new mongoose.Schema({
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: "Family" },
    name: String,
    amount: String,
    date: { type: Date, default: Date.now },
});

const Income = mongoose.model("Income", IncomeSchema);

module.exports = { Income };
