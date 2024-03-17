const { Family } = require("../models/Family");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);

// Create a category to a family
async function addCategory(familyId, category, monthlyLimit = 0) {
    try {
        const family = await Family.findOneAndUpdate({ _id: familyId }, { $push: { categories: { name: category, monthlyLimit: monthlyLimit } } }, { new: true });
        if (!family) {
            throw new Error(lang.FAMILY.ERROR_NOT_FOUND);
        }
        return { data: family };
    } catch (error) {
        return { error: error.message };
    }
}

// Get all the categories of a family
async function getFamilyCategories(familyId, includeInactive = false) {
    try {
        const family = await Family.findById(familyId);
        if (!family) {
            throw new Error(lang.FAMILY.ERROR_NOT_FOUND);
        }

        return includeInactive ? family.categories : family.categories.filter((category) => category.isActive);
    } catch (error) {
        return { error: error.message };
    }
}

// Edit a category name
async function editCategory(familyId, categoryId, newCategoryName) {
    try {
        const family = await Family.findOneAndUpdate({ _id: familyId, "categories._id": categoryId }, { $set: { "categories.$.name": newCategoryName } }, { new: true });
        if (!family) {
            throw new Error(lang.CATEGORY.ERROR_NOT_FOUND);
        }
        return family;
    } catch (error) {
        return { error: error.message };
    }
}

// Delete a category from a family
async function removeCategory(familyId, categoryId) {
    try {
        const family = await Family.findOneAndUpdate({ _id: familyId, "categories._id": categoryId }, { $set: { "categories.$.isActive": false } }, { new: true });
        if (!family) {
            throw new Error(lang.CATEGORY.ERROR_NOT_FOUND);
        }
        return family;
    } catch (error) {
        return { error: error.message };
    }
}

// Set a limit for a category
async function setCategoryLimit(familyId, categoryId, limit) {
    try {
        const family = await Family.findOneAndUpdate({ _id: familyId, "categories._id": categoryId }, { $set: { "categories.$.monthlyLimit": limit } }, { new: true });
        if (!family) {
            throw new Error(lang.CATEGORY.ERROR_NOT_FOUND);
        }
        return family;
    } catch (error) {
        return { error: error.message };
    }
}
module.exports = {
    addCategory,
    getFamilyCategories,
    editCategory,
    removeCategory,
    setCategoryLimit,
};
