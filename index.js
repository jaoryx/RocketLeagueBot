const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { botToken, dbString } = require('./config.json');
const functions = require('./modules/functions');
const { default: mongoose } = require('mongoose');

// Initiating everything
const client = new Client({ 
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds
    ] 
});

client.twitchKey = "";

client.commands = new Collection();
client.events = new Collection();
client.rankRoles = {};

client.log = functions.log;
client.color = '#A98143';
client.logoURL = 'https://i.imgur.com/E4WEv9h.png';

client.platformsNames = {
    "steam": "Steam",
    "epic": "Epic Games",
    "psn": "PlayStation Network",
    "xbl": "Xbox Live",
    "switch": "Nintendo Switch"
}

client.rankColors = {
    "Bronze I": "bronze",
    "Bronze II": "bronze",
    "Bronze III": "bronze",
    "Bronze IV": "bronze",
    "Silver I": "silver",
    "Silver II": "silver",
    "Silver III": "silver",
    "Silver IV": "silver",
    "Gold I": "gold",
    "Gold II": "gold",
    "Gold III": "gold",
    "Gold IV": "gold",
    "Platinum I": "cyan",
    "Platinum II": "cyan",
    "Platinum III": "cyan",
    "Platinum IV": "cyan",
    "Diamond I": "blue",
    "Diamond II": "blue",
    "Diamond III": "blue",
    "Diamond IV": "blue",
    "Champion I": "purple",
    "Champion II": "purple",
    "Champion III": "purple",
    "Champion IV": "purple",
    "Grand Champion I": "red",
    "Grand Champion II": "red",
    "Grand Champion III": "red",
    "Grand Champion IV": "red",
    "Supersonic Legend": "white"
};

client.customEmojis = {
    logo: '<:RALogo:1242460888632524800>',
    success: "<a:tick:1242461307186319492>",
    error: "❌",
    loading: "<a:loading:1242486293720469574>"
};

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

// Login Events
mongoose.connect(dbString)
.then(() => {
    client.log('Connected to the database!');
}).catch(error => {
    client.log('Could not connect to the database: ' + error);
});

client.rest.on("rateLimited", console.log);

client.login(botToken);