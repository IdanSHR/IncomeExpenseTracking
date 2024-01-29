const { Family } = require("../models/Family");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);

// Create a category to a family
async function addCategory(familyId, category, monthlyLimit = 0) {
    try {
        const family = await Family.findById(familyId);
        if (!family) {
            return { error: lang.FAMILY.ERROR_NOT_FOUND };
        }

        family.categories.push({ name: category, monthlyLimit: monthlyLimit });
        return { data: await family.save() };
    } catch (error) {
        return { error };
    }
}

// Get all the categories of a family
async function getFamilyCategories(familyId, includeInactive = false) {
    try {
        const family = await Family.findById(familyId);
        if (!family) {
            return { error: lang.FAMILY.ERROR_NOT_FOUND };
        }

        return { data: includeInactive ? family.categories : family.categories.filter((category) => category.isActive) };
    } catch (error) {
        return { error };
    }
}

// Edit a category name
async function editCategory(familyId, categoryId, newCategoryName) {
    try {
        const family = await Family.findById(familyId);
        if (!family) {
            return { error: lang.FAMILY.ERROR_NOT_FOUND };
        }

        const category = family.categories.find((category) => category.id.toString() === categoryId);
        if (!category) {
            return { error: lang.CATEGORY.ERROR_NOT_FOUND };
        }

        category.name = newCategoryName;
        return { data: await family.save() };
    } catch (error) {
        return { error };
    }
}

// Delete a category from a family
async function removeCategory(familyId, categoryId) {
    try {
        const family = await Family.findById(familyId);
        if (!family) {
            return { error: lang.FAMILY.ERROR_NOT_FOUND };
        }

        const category = family.categories.find((category) => category.id.toString() === categoryId);
        if (!category) {
            return { error: lang.CATEGORY.ERROR_NOT_FOUND };
        }

        category.isActive = false;
        return { data: await family.save() };
    } catch (error) {
        return { error };
    }
}

// Set a limit for a category
async function setCategoryLimit(familyId, categoryId, limit) {
    const family = await Family.findById(familyId);
    if (!family) {
        return { error: lang.FAMILY.ERROR_NOT_FOUND };
    }

    const categories = family.categories;
    if (!categories) {
        return { error: lang.CATEGORY.ERROR_NO_CATEGORIES };
    }
    const currentCategory = categories.find((category) => category._id.toString() === categoryId);
    if (!currentCategory) {
        return { error: lang.CATEGORY.ERROR_NOT_FOUND };
    }
    currentCategory.monthlyLimit = limit;
    await family.save();
    return true;
}

module.exports = {
    addCategory,
    getFamilyCategories,
    editCategory,
    removeCategory,
    setCategoryLimit,
};
