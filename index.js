const TelegramBot = require("node-telegram-bot-api");
const NLPHandler = require("./nlp-handler");
const fs = require("fs");

const builtin = require("./data/builtin.json");
const custom = require("./data/custom.json");

let actions = require("./actions");
let handler = new NLPHandler();

Object.keys(builtin).forEach(key => handler.teach(key, builtin[key]));
Object.keys(custom).forEach(key => handler.teach(key, custom[key]));
handler.think();

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_TOKEN;

// Create a bot that uses "polling" to fetch new updates
const bot = new TelegramBot(token, {
    polling: true
});

bot.onText(/\/heylira(?:@LiraThePABot)?$/, msg => {
    bot.sendMessage(msg.chat.id, "At your service :D");
});

bot.onText(/\/heylira(?:@LiraThePABot)? (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const req = match[1];

    if (/training time/.test(req)) {
        bot.sendMessage(chatId, "Teach me using /teachlira <action> <phrase> :D");
        return;
    }

    let request = handler.interpret(req);
    console.log(request);
    if (request.guess.includes("?")) {
        // Parameterized call
        let requestArr = request.guess.split("?"),
            action = requestArr[0],
            parameter = requestArr[1];

        if (actions[action]) {
            bot.sendMessage(chatId, actions[action](parameter));
        }
    } else if (actions[request.guess]) {
        bot.sendMessage(chatId, actions[request.guess]());
    } else {
        bot.sendMessage(chatId, "I'm not sure of what you wanted, sorry :P");
    }
});

bot.onText(/\/teachlira(?:@LiraThePABot)? (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const data = match[1].split(" "),
        label = data[0],
        phrase = data.slice(1, data.length).join(" ");

    if (builtin[label]) {
        builtin[label].push(phrase);
    } else {
        if (!custom[label]) {
            custom[label] = [];
        }

        custom[label].push(phrase);
    }

    handler.teach(label, [phrase]);
    handler.think();

    bot.sendMessage(chatId, "I have learnt a new phrase! :D");
});

bot.onText(/\/reloadlira(?:@LiraThePABot)?/, (msg, match) => {
    const chatId = msg.chat.id;
    console.log("Lira has reloaded actions");
    actions = require("./actions");

    bot.sendMessage(chatId, "Actions reloaded, ready for new behaviour :D");
});

bot.on("new_chat_participant", (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, `Hello, ${msg.new_chat_members[0].first_name}! :D`);
});

setInterval(() => {
    fs.writeFile(__dirname + "/data/builtin.json", JSON.stringify(builtin, null, 4), err => {
        if (err) console.error("Unable to save builtin phrases: ", err);
        fs.writeFile(__dirname + "/data/custom.json", JSON.stringify(custom, null, 4), err => {
            if (err) console.error("Unable to save custom phrases: ", err);
        });
    });
}, 10000);

console.log("Lira is ready to help! :D");
