const { addCategory, removeCategory, editCategory, registerFamily, registerFamilyMember, removeFamilyMember, findUserFamilyId, getFamilyCategories } = require("../services/family.service");
const { isAdmin } = require("../utils/bot");
const { botSendMessage } = require("../utils/bot");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);
const lastMsgId = {};

async function registerFamilyCommands(bot) {
    // /addfamily command to add a new family
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const userFamily = await findUserFamilyId(chatId);
        if (!userFamily?.error) {
            return bot.sendMessage(chatId, lang.FAMILY.ERROR_FOUND);
        }
        bot.sendMessage(chatId, lang.FAMILY.PROMPT_RENAME);
        bot.once("message", async (msg) => {
            try {
                const familyName = msg.text;
                const familyId = await registerFamily(familyName, [chatId]);
                if (familyId?.error) {
                    return bot.sendMessage(chatId, familyId.error);
                }
                bot.sendMessage(chatId, `${lang.FAMILY.SUCCESS_ADDING}, ID: ${familyId}`);
            } catch (err) {
                bot.sendMessage(chatId, lang.FAMILY.ERROR_RENAME, menuStep[chatId].lastMsgId);
            }
        });
    });

    // /addmember command to add a member to a family
    bot.onText(/\/addmember (.+) (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const familyId = match[1];
        const memberId = match[2];

        // Check if user is admin
        if (!isAdmin(userId)) {
            return bot.sendMessage(chatId, lang.GENERAL.ERROR_ADMIN);
        }

        try {
            await registerFamilyMember(familyId, memberId);
            bot.sendMessage(chatId, lang.FAMILY.SUCCESS_FAMILY_ADDING);
        } catch (error) {
            bot.sendMessage(chatId, error?.message);
        }
    });

    // /removemember command to remove a member from a family
    bot.onText(/\/removemember (.+) (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const familyId = match[1];
        const memberId = match[2];

        // Check if user is admin
        if (!isAdmin(userId)) {
            return bot.sendMessage(chatId, lang.GENERAL.ERROR_ADMIN);
        }

        try {
            await removeFamilyMember(familyId, memberId);
            bot.sendMessage(chatId, lang.FAMILY.SUCCESS_MEMBER_REMOVING);
        } catch (error) {
            bot.sendMessage(chatId, error?.message);
        }
    });

    bot.onText(/\/ac (\S+) (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const familyId = match[1];
        const category = match[2];

        // Check if user is admin
        if (!isAdmin(userId)) {
            return bot.sendMessage(chatId, lang.GENERAL.ERROR_ADMIN);
        }

        try {
            const response = await addCategory(familyId, category);
            if (response?.error) {
                bot.sendMessage(chatId, response.error);
            }
            bot.sendMessage(chatId, lang.CATEGORY.SUCCESS_ADDING);
        } catch (error) {
            bot.sendMessage(chatId, error?.message);
        }
    });
}

module.exports = { registerFamilyCommands };
