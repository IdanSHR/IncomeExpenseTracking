const { Family } = require("../models/Family");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);

// Add a family to the db
async function registerFamily(name, members = []) {
    try {
        if (!name) {
            throw new Error(lang.FAMILY.ERROR_WRONG_FAMILY);
        }

        const family = await Family.create({ name, members });
        if (!family) {
            throw new Error(lang.FAMILY.ERROR_CREATION_FAILED);
        }

        return family._id;
    } catch (error) {
        return { error: error.message };
    }
}

// Join a family by the familyId
async function joinFamily(familyId, userId) {
    try {
        if (familyId.length !== 24) {
            throw new Error(lang.FAMILY.ERROR_WRONG_FAMILY);
        }

        const family = await Family.findById(familyId);
        if (!family) {
            throw new Error(lang.FAMILY.ERROR_WRONG_FAMILY);
        }
        if (family.members.includes(userId)) {
            throw new Error(lang.FAMILY.ERROR_MEMBER_EXISTS);
        }
        family.members.push(userId);
        await family.save();
        return family.name;
    } catch (error) {
        return { error: error.message };
    }
}

// Edit a family name
async function setFamilyName(familyId, name) {
    console.log(familyId, name);
    try {
        const family = await Family.findOneAndUpdate({ _id: familyId }, { name: name }, { new: true });
        if (!family) {
            throw new Error(lang.FAMILY.ERROR_NOT_FOUND);
        }
        return family;
    } catch (error) {
        return { error: error.message };
    }
}

// Add a userId to the family members
async function registerFamilyMember(familyId, userId) {
    try {
        const family = await Family.findOneAndUpdate({ _id: familyId, members: { $ne: userId } }, { $push: { members: userId } }, { new: true });
        if (!family) {
            throw new Error(lang.FAMILY.ERROR_WRONG_FAMILY);
        }
        return family;
    } catch (error) {
        return { error: error.message };
    }
}

// Return the family by the familyId
async function getFamilyById(familyId) {
    try {
        const family = await Family.findOne({ _id: familyId });
        if (!family) {
            throw new Error(lang.FAMILY.ERROR_NOT_FOUND);
        }
        return family;
    } catch (error) {
        return { error: error.message };
    }
}

// Query families
async function queryFamilies(filters = {}) {
    try {
        const families = await Family.find(filters);
        return families;
    } catch (error) {
        return { error: error.message };
    }
}

// Remove a userId from the family members
async function removeFamilyMember(familyId, userId) {
    try {
        const family = await Family.findOneAndUpdate({ _id: familyId, members: userId }, { $pull: { members: userId } }, { new: true });
        if (!family) {
            throw new Error(lang.FAMILY.ERROR_WRONG_FAMILY);
        }
        return family;
    } catch (error) {
        return { error: error.message };
    }
}

// Return the family members by the familyId
async function findFamilyMembers(familyId) {
    try {
        const family = await Family.findById(familyId);
        if (!family) {
            throw new Error(lang.FAMILY.ERROR_NOT_FOUND);
        }
        return family.members;
    } catch (error) {
        return { error: error.message };
    }
}

// Return the family by the userId
async function findUserFamily(userId) {
    try {
        const family = await Family.findOne({ members: userId });
        if (!family) {
            throw new Error(lang.FAMILY.ERROR_NOT_FOUND);
        }
        return family;
    } catch (error) {
        return { error: error.message };
    }
}

// Return the family id by the userId
async function findUserFamilyId(userId) {
    try {
        const family = await Family.findOne({ members: userId });
        if (!family) {
            throw new Error(lang.FAMILY.ERROR_NOT_FOUND);
        }
        return family._id;
    } catch (error) {
        return { error: error.message };
    }
}

// Set a start day for a family
async function setStartDay(familyId, day) {
    try {
        const family = await Family.findOneAndUpdate({ _id: familyId }, { $set: { startDay: day } }, { new: true });
        if (!family) {
            throw new Error(lang.FAMILY.ERROR_NOT_FOUND);
        }
        return true;
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = {
    registerFamily,
    registerFamilyMember,
    joinFamily,
    queryFamilies,
    removeFamilyMember,
    findFamilyMembers,
    getFamilyById,
    findUserFamily,
    findUserFamilyId,
    setFamilyName,
    setStartDay,
};
