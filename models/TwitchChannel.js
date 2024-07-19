const mongoose = require('mongoose');

const TwitchSchema = new mongoose.Schema({
    channelName: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    discordUserId: {
        type: mongoose.SchemaTypes.String,
        default: ''
    },
    twitchStreamId: {
        type: mongoose.SchemaTypes.String,
        default: '',
    },
    discordMessageId: {
        type: mongoose.SchemaTypes.String,
        default: ''
    }
});

module.exports = mongoose.model('TwitchChannel', TwitchSchema);