const { registerFamily, joinFamily, findUserFamilyId } = require("../../services/family.service");

const { botSendMessage } = require("../../utils/bot");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../../lang/" + botLanguage);
let menuSteps = {};

async function registerFamilyCommands(bot) {
    bot.onText(/\/start/, async (msg) => {
        handleStartCommand(bot, msg);
    });

    bot.on("callback_query", async (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;

        if (!menuSteps[chatId]) {
            return;
        }
        if (data === "cancel" && menuSteps[chatId] !== undefined) {
            await botSendMessage(bot, chatId, lang.GENERAL.CANCEL_ACTION, menuSteps[chatId].lastMsgId);
            delete menuSteps[chatId];
        } else if (data === "register_new_family") {
            menuSteps[chatId].action = "register_new_family";
            menuSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.PROMPT_RENAME, menuSteps[chatId]?.lastMsgId, "cancel");
        } else if (data === "join_existing_family") {
            menuSteps[chatId].action = "join_existing_family";
            menuSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.PROMPT_JOIN, menuSteps[chatId]?.lastMsgId, "cancel");
        }
    });

    bot.on("message", async (msg) => {
        const chatId = msg.chat.id;
        const familyData = msg.text;

        if (familyData === "/start" || !menuSteps[chatId]) {
            return;
        }

        if (menuSteps[chatId].action === "register_new_family") {
            handleRegisterNewFamily(bot, chatId, familyData);
        } else if (menuSteps[chatId].action === "join_existing_family") {
            handleJoinExistingFamily(bot, chatId, familyData);
        }
    });

    async function handleStartCommand(bot, msg) {
        const chatId = msg.chat.id;
        if (!menuSteps[chatId]) menuSteps[chatId] = {};

        const userFamily = await findUserFamilyId(chatId);
        if (!userFamily?.error) {
            return bot.sendMessage(chatId, lang.FAMILY.ERROR_FOUND);
        }

        const options = {
            reply_markup: JSON.stringify({
                inline_keyboard: [[{ text: lang.FAMILY.BUTTON_CREATE, callback_data: "register_new_family" }], [{ text: lang.FAMILY.BUTTON_JOIN, callback_data: "join_existing_family" }]],
            }),
        };

        menuSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.FAMILY.PROMPT_CREATEORJOIN, null, options);
    }

    async function handleRegisterNewFamily(bot, chatId, familyName) {
        const familyId = await registerFamily(familyName, [chatId]);

        if (familyId?.error) {
            return (menuSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, familyId.error, menuSteps[chatId].lastMsgId, "cancel"));
        }

        await botSendMessage(bot, chatId, `${lang.FAMILY.SUCCESS_ADDING}`);
        await botSendMessage(bot, chatId, `${familyId}`);
        delete menuSteps[chatId];
    }

    async function handleJoinExistingFamily(bot, chatId, familyId) {
        const joinResult = await joinFamily(familyId, chatId);

        if (joinResult?.error) {
            return (menuSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, joinResult.error, menuSteps[chatId].lastMsgId, "cancel"));
        }

        await botSendMessage(bot, chatId, `${lang.FAMILY.SUCCESS_JOINING} ${joinResult}`);
        delete menuSteps[chatId];
    }
}

module.exports = { registerFamilyCommands };
