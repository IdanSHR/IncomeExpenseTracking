const mongoose = require("mongoose");
require("dotenv").config();
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);
const defaultCategories = lang.CATEGORY.DEFAULT;

const CategorySchema = new mongoose.Schema(
    {
        name: String,
        isActive: { type: Boolean, default: true },
        monthlyLimit: { type: Number, default: 0 },
    },
    { versionKey: false }
);

const FamilySchema = new mongoose.Schema({
    name: String,
    members: [String],
    categories: { type: [CategorySchema], default: defaultCategories },
    startDay: { type: Number, default: 1 },
});

const Family = mongoose.model("Family", FamilySchema);

module.exports = { Family };
