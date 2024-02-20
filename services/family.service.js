const { Family } = require("../models/Family");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);

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

// Join a family by the familyId
async function joinFamily(familyId, userId) {
    try {
        if (familyId.length !== 24) return { error: lang.FAMILY.ERROR_WRONG_FAMILY };
        const family = await Family.findById(familyId);
        if (!family) {
            return { error: lang.FAMILY.ERROR_WRONG_FAMILY };
        }
        if (family.members.includes(userId)) {
            return { error: lang.FAMILY.ERROR_MEMBER_EXISTS };
        }
        family.members.push(userId);
        await family.save();
        return family.name;
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
        return { error: lang.FAMILY.ERROR_MEMBER_EXISTS };
    }
    family.members.push(userId);
    await family.save();
}

// Return the family by the familyId
async function getFamilyById(familyId) {
    const family = await Family.findOne({ _id: familyId });
    if (!family) {
        return { error: lang.FAMILY.ERROR_NOT_FOUND };
    }
    return family;
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

// Return the family members by the familyId
async function findFamilyMembers(familyId) {
    try {
        const family = await Family.findById(familyId);
        if (!family) {
            return { error: lang.FAMILY.ERROR_NOT_FOUND };
        }
        return family.members;
    } catch (error) {
        return { error };
    }
}

// Return the family by the userId
async function findUserFamily(userId) {
    const family = await Family.findOne({ members: userId });
    if (!family) {
        return { error: lang.FAMILY.ERROR_NOT_FOUND };
    }
    return family;
}

// Return the family id by the userId
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

module.exports = {
    registerFamily,
    registerFamilyMember,
    joinFamily,
    removeFamilyMember,
    findFamilyMembers,
    getFamilyById,
    findUserFamily,
    findUserFamilyId,
    setFamilyName,
    setStartDay,
};
