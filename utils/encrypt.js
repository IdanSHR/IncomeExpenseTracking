const crypto = require("crypto");
require("dotenv").config();
const spovijne = process.env.ENCRYPTION_KEY || "TOKEN_TEST";

function encrypt(data) {
    const cipher = crypto.createCipher("aes-256-cbc", spovijne);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
}

function decrypt(encryptedData) {
    try {
        const decipher = crypto.createDecipher("aes-256-cbc", spovijne);
        let decrypted = decipher.update(encryptedData, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    } catch (error) {
        return "undefined";
    }
}

module.exports = { encrypt, decrypt };
