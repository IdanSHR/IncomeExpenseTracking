const { findUserFamily } = require("../../services/family.service");

const { botSendMessage, botSendMessageToAdmins } = require("../../utils/bot");
const botLanguage = process.env.BOT_LANGUAGE;
const lang = require("../../lang/" + botLanguage);
const reportStep = {};

async function registerAdminCommands(bot) {
    bot.onText(/\/report/, async (msg) => {
        handleReportFunction(bot, msg);
    });

    bot.on("callback_query", async (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;

        if (!reportStep[chatId]) {
            return;
        }
        if (data === "cancel" && reportStep[chatId] !== undefined) {
            await botSendMessage(bot, chatId, lang.GENERAL.CANCEL_ACTION, reportStep[chatId].lastMsgId);
            delete reportStep[chatId];
        } else if (data === "report_send_bug" || data === "report_send_suggest") {
            reportStep[chatId].action = data;
            reportStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.ADMIN.PROMPT_DESCRIPTION, reportStep[chatId]?.lastMsgId, "cancel");
        }
    });

    bot.on("message", async (msg) => {
        const chatId = msg.chat.id;
        const reportData = msg.text;

        if (reportData === "/report" || !reportStep[chatId]) {
            return;
        }

        if (reportStep[chatId].action === "report_send_bug" || reportStep[chatId].action === "report_send_suggest") {
            handleReportBug(bot, chatId, reportData);
        }
    });

    async function handleReportFunction(bot, msg) {
        const chatId = msg.chat.id;
        if (!reportStep[chatId]) reportStep[chatId] = {};

        const options = {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{ text: lang.ADMIN.SEND_BUG, callback_data: "report_send_bug" }],
                    [{ text: lang.ADMIN.SEND_SUGGEST, callback_data: "report_send_suggest" }],
                    [{ text: lang.GENERAL.CANCEL, callback_data: "cancel" }],
                ],
            }),
        };

        reportStep[chatId].lastMsgId = await botSendMessage(bot, chatId, lang.ADMIN.PROMPT_REPORT, null, options);
    }

    async function handleReportBug(bot, chatId, reportData) {
        const family = await findUserFamily(chatId);
        const familyName = family?.name || "Unknown";
        await botSendMessageToAdmins(bot, `${familyName} - ${reportStep[chatId].action} - ${reportData}`);
        await botSendMessage(bot, chatId, `${lang.ADMIN.SUCCESS_REPORT}`);
        delete reportStep[chatId];
    }
}

module.exports = { registerAdminCommands, reportStep };
