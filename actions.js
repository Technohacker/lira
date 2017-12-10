const builtin = require("./data/builtin.json"),
    custom = require("./data/custom.json"),
    responses = require("./data/responses.json");

module.exports = {
    sendTextResponse(requestType) {
        console.log(requestType);
        if (responses[requestType]) {
            return responses[requestType][Math.floor(Math.random() * responses[requestType].length)];
        } else {
            return "I don't know what you wanted, sorry :P";
        }
    },
    showTime() {
        return `It's ${new Date().toTimeString()} :D`;
    }
};
