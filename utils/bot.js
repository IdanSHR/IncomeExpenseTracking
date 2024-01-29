require("dotenv").config();
const adminIds = process.env.TELEGRAM_ADMIN_USERID;
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../lang/" + botLanguage);

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

//Functions
function isAdmin(userId) {
    return adminIds.includes(userId.toString());
}

async function botSendMessage(bot, chatId, message, lastMsgId = null, options = []) {
    //Delete last message
    try {
        if (lastMsgId) {
            await bot.deleteMessage(chatId, lastMsgId);
        }

        //Send new message and return the last message ID
        const sentMsg = await bot.sendMessage(chatId, message, options === "cancel" ? cancelOpts : options === "back_to_main_menu" ? backOpts : options);
        return sentMsg?.message_id;
    } catch (error) {
        console.error(error);
    }
}

async function botEditMessage(bot, chatId, message, lastMsgId = null, options = []) {
    try {
        if (lastMsgId) {
            try {
                // Attempt to edit last message
                const sentMsg = await bot.editMessageText(message, { chat_id: chatId, message_id: lastMsgId, ...(options === "cancel" ? cancelOpts : options) });
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

module.exports = { isAdmin, botSendMessage, botEditMessage };
