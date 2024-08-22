const crypto = require('crypto');

function generateCode() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
}

module.exports = generateCode;
