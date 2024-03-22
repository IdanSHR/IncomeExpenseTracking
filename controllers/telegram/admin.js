const { findUserFamily } = require("../../services/family.service");

const { botSendMessage, botSendMessageToAdmins } = require("../../utils/bot");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../../lang/" + botLanguage);
let reportSteps = {};

async function registerAdminCommands(bot) {
    bot.onText(/\/report/, async (msg) => {
        handleReportFunction(bot, msg);
    });

    bot.on("callback_query", async (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;

        if (!reportSteps[chatId]) {
            return;
        }
        if (data === "cancel" && reportSteps[chatId] !== undefined) {
            await botSendMessage(bot, chatId, lang.GENERAL.CANCEL_ACTION, reportSteps[chatId].lastMsgId);
            delete reportSteps[chatId];
        } else if (data === "report_send_bug" || data === "report_send_suggest") {
            reportSteps[chatId].action = data;
            reportSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.ADMIN.PROMPT_DESCRIPTION, reportSteps[chatId]?.lastMsgId, "cancel");
        }
    });

    bot.on("message", async (msg) => {
        const chatId = msg.chat.id;
        const reportData = msg.text;

        if (reportData === "/report" || !reportSteps[chatId]) {
            return;
        }

        if (reportSteps[chatId].action === "report_send_bug" || reportSteps[chatId].action === "report_send_suggest") {
            handleReportBug(bot, chatId, reportData);
        }
    });

    async function handleReportFunction(bot, msg) {
        const chatId = msg.chat.id;
        if (!reportSteps[chatId]) reportSteps[chatId] = {};

        const options = {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{ text: lang.ADMIN.SEND_BUG, callback_data: "report_send_bug" }],
                    [{ text: lang.ADMIN.SEND_SUGGEST, callback_data: "report_send_suggest" }],
                    [{ text: lang.GENERAL.CANCEL, callback_data: "cancel" }],
                ],
            }),
        };

        reportSteps[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.ADMIN.PROMPT_REPORT, null, options);
    }

    async function handleReportBug(bot, chatId, reportData) {
        const family = await findUserFamily(chatId);
        const familyName = family?.name || "Unknown";
        await botSendMessageToAdmins(bot, `${familyName} - ${reportSteps[chatId].action} - ${reportData}`);
        await botSendMessage(bot, chatId, `${lang.ADMIN.SUCCESS_REPORT}`);
        delete reportSteps[chatId];
    }
}

module.exports = { registerAdminCommands };
