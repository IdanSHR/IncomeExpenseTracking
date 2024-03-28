const { registerFamily, joinFamily, findUserFamilyId } = require("../../services/family.service");

const { botSendMessage } = require("../../utils/bot");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../../lang/" + botLanguage);
const familyStep = {};

async function registerFamilyCommands(bot) {
    bot.onText(/\/start/, async (msg) => {
        handleStartCommand(bot, msg);
    });

    bot.on("callback_query", async (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;

        if (!familyStep[chatId]) {
            return;
        }
        if (data === "cancel" && familyStep[chatId] !== undefined) {
            await botSendMessage(bot, chatId, lang.GENERAL.CANCEL_ACTION, familyStep[chatId].lastMsgId);
            delete familyStep[chatId];
        } else if (data === "register_new_family") {
            familyStep[chatId].action = "register_new_family";
            familyStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.PROMPT_RENAME, familyStep[chatId]?.lastMsgId, "cancel");
        } else if (data === "join_existing_family") {
            familyStep[chatId].action = "join_existing_family";
            familyStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.PROMPT_JOIN, familyStep[chatId]?.lastMsgId, "cancel");
        }
    });

    bot.on("message", async (msg) => {
        const chatId = msg.chat.id;
        const familyData = msg.text;

        if (familyData === "/start" || !familyStep[chatId]) {
            return;
        }

        if (familyStep[chatId].action === "register_new_family") {
            handleRegisterNewFamily(bot, chatId, familyData);
        } else if (familyStep[chatId].action === "join_existing_family") {
            handleJoinExistingFamily(bot, chatId, familyData);
        }
    });

    async function handleStartCommand(bot, msg) {
        const chatId = msg.chat.id;
        if (!familyStep[chatId]) familyStep[chatId] = {};

        const userFamily = await findUserFamilyId(chatId);
        if (!userFamily?.error) {
            return bot.sendMessage(chatId, lang.FAMILY.ERROR_FOUND);
        }

        const options = {
            reply_markup: JSON.stringify({
                inline_keyboard: [[{ text: lang.FAMILY.BUTTON_CREATE, callback_data: "register_new_family" }], [{ text: lang.FAMILY.BUTTON_JOIN, callback_data: "join_existing_family" }]],
            }),
        };

        familyStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.PROMPT_CREATEORJOIN, null, options);
    }

    async function handleRegisterNewFamily(bot, chatId, familyName) {
        const familyId = await registerFamily(familyName, [chatId]);

        if (familyId?.error) {
            return (familyStep[chatId].lastMsgId = await botSendMessage(bot, chatId, familyId.error, familyStep[chatId].lastMsgId, "cancel"));
        }

        await botSendMessage(bot, chatId, `${lang.FAMILY.SUCCESS_ADDING}`);
        await botSendMessage(bot, chatId, `${familyId}`);
        delete familyStep[chatId];
    }

    async function handleJoinExistingFamily(bot, chatId, familyId) {
        const joinResult = await joinFamily(familyId, chatId);

        if (joinResult?.error) {
            return (familyStep[chatId].lastMsgId = await botSendMessage(bot, chatId, joinResult.error, familyStep[chatId].lastMsgId, "cancel"));
        }

        await botSendMessage(bot, chatId, `${lang.FAMILY.SUCCESS_JOINING} ${joinResult}`);
        delete familyStep[chatId];
    }
}

module.exports = { registerFamilyCommands, familyStep };
