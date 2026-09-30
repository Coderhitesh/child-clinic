const CryptoJS = require('crypto-js');
const env = require('../config/env');

const encrypt = (text) => {
  if (text === undefined || text === null) return text;
  return CryptoJS.AES.encrypt(String(text), env.ENCRYPTION_KEY).toString();
};

const decrypt = (cipher) => {
  if (!cipher) return cipher;
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, env.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
};

module.exports = { encrypt, decrypt };
