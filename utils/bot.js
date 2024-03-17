require("dotenv").config();
const adminIds = JSON.parse(process.env.TELEGRAM_ADMIN_USERID);
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);
const { findFamilyMembers, queryFamilies } = require("../services/family.service");

// Options
const cancelOpts = {
    reply_markup: {
        inline_keyboard: [[{ text: lang.GENERAL.CANCEL, callback_data: "cancel" }]],
    },
};

const backOpts = {
    reply_markup: {
        inline_keyboard: [[{ text: lang.GENERAL.BACK_TO_MENU, callback_data: "back_to_main_menu" }]],
    },
};

const backExpense = {
    reply_markup: {
        inline_keyboard: [[{ text: lang.MENU.EXPENSE.BACK_TO_MENU, callback_data: "back_to_expense_menu" }]],
    },
};

const backIncome = {
    reply_markup: {
        inline_keyboard: [[{ text: lang.MENU.INCOME.BACK_TO_MENU, callback_data: "back_to_income_menu" }]],
    },
};

//Functions
function isAdmin(userId) {
    return adminIds.includes(userId.toString());
}
function getMenu(options) {
    switch (options) {
        case "back_to_main_menu":
            return backOpts;
        case "cancel":
            return cancelOpts;
        case "back_to_expense_menu":
            return backExpense;
        case "back_to_income_menu":
            return backIncome;
    }
    return options;
}

async function botSendMessage(bot, chatId, message, lastMsgId = null, options = []) {
    //Delete last message
    try {
        if (lastMsgId) {
            await bot.deleteMessage(chatId, lastMsgId);
        }

        //Send new message and return the last message ID
        const sentMsg = await bot.sendMessage(chatId, message, getMenu(options));
        return sentMsg?.message_id;
    } catch (error) {
        console.error(error);
    }
}

async function botSendMessageToFamily(bot, familyId, message, options = []) {
    const familyMembers = await findFamilyMembers(familyId);
    if (familyMembers.error) {
        console.error(familyMembers.error);
        return;
    }
    for (const member of familyMembers) {
        await botSendMessage(bot, member, message, null, options);
    }
}

async function botSendBroadcast(bot, message, options = []) {
    const familyMembers = await queryFamilies();
    if (familyMembers.error) {
        console.error(familyMembers.error);
        return;
    }
    for (const family of familyMembers) {
        for (const member of family.members) {
            await botSendMessage(bot, member, message, null, options);
        }
    }
}
async function botEditMessage(bot, chatId, message, lastMsgId = null, options = []) {
    try {
        if (lastMsgId) {
            try {
                // Attempt to edit last message
                const sentMsg = await bot.editMessageText(message, { chat_id: chatId, message_id: lastMsgId, ...getMenu(options) });
                return sentMsg?.message_id;
            } catch (error) {
                console.warn({ error });
            }
        }

        // If the message could not be edited or there was no lastMsgId, send a new message
        const sentMsg = await bot.sendMessage(chatId, message, options === "cancel" ? cancelOpts : options);
        return sentMsg?.message_id;
    } catch (error) {
        console.error(error);
    }
}
async function botEditMessageReplyMarkup(bot, chatId, message_id, options = []) {
    try {
        const sentMsg = await bot.editMessageReplyMarkup({ inline_keyboard: options }, { chat_id: chatId, message_id: message_id });
        return sentMsg?.message_id;
    } catch (error) {
        console.error(error);
    }
}

async function botSendMessageToAdmins(bot, message, options = []) {
    for (const adminId of adminIds) {
        await botSendMessage(bot, adminId, message, null, options);
    }
}

module.exports = { isAdmin, botSendMessage, botEditMessage, botEditMessageReplyMarkup, botSendMessageToFamily, botSendBroadcast, botSendMessageToAdmins };
