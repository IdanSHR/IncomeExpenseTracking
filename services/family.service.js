const { Family } = require("../models/Family");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);
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

// Add a family to the db
async function registerFamily(name, members = []) {
    if (!name) {
        return { error: lang.FAMILY.ERROR_WRONG_FAMILY };
    }

    try {
        return (await Family.create({ name, members }))?._id;
    } catch (error) {
        return { error };
    }
}
// Edit a family name
async function setFamilyName(familyId, name) {
    const family = await Family.findById(familyId);
    if (!family) {
        return { error: lang.FAMILY.ERROR_NOT_FOUND };
    }
    family.name = name;
    await family.save();
    return true;
}

// Add a userId to the family members
async function registerFamilyMember(familyId, userId) {
    const family = await Family.findById(familyId);
    if (!family) {
        return { error: lang.FAMILY.ERROR_NOT_FOUND };
    }
    if (family.members.includes(userId)) {
        return { error: lang.FAMILY.ERROR_FOUND };
    }
    family.members.push(userId);
    await family.save();
}
// Set a start day for a family
async function setStartDay(familyId, day) {
    const family = await Family.findById(familyId);
    if (!family) {
        return { error: lang.FAMILY.ERROR_NOT_FOUND };
    }
    family.startDay = day;
    await family.save();
    return true;
}
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

// Remove a userId from the family members
async function removeFamilyMember(familyId, userId) {
    const family = await Family.findById(familyId);
    if (!family) {
        return { error: lang.FAMILY.ERROR_NOT_FOUND };
    }
    const memberIndex = family.members.indexOf(userId);
    if (memberIndex === -1) {
        return { error: lang.CATEGORY.ERROR_WRONG_FAMILY };
    }
    family.members.splice(memberIndex, 1);
    await family.save();
}

// Return the family id by the userId
async function findUserFamily(userId) {
    const family = await Family.findOne({ members: userId });
    if (!family) {
        return { error: lang.FAMILY.ERROR_NOT_FOUND };
    }
    return family;
}
async function findUserFamilyId(userId) {
    try {
        const family = await Family.findOne({ members: userId });
        if (!family) {
            return { error: lang.FAMILY.ERROR_NOT_FOUND };
        }

        return family._id;
    } catch (error) {
        return { error };
    }
}

module.exports = {
    addCategory,
    removeCategory,
    editCategory,
    setCategoryLimit,
    registerFamily,
    registerFamilyMember,
    removeFamilyMember,
    findUserFamily,
    findUserFamilyId,
    getFamilyCategories,
    setStartDay,
    setFamilyName,
};
