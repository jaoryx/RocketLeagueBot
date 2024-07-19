const { twitchChannel, twitchClientId, guildId } = require('../config.json');
const { GetChannelData, GetStreamData, log, CreateEmbed } = require('./functions');
const { getTwitchKey } = require('./auth');
const TwitchChannel = require('../models/TwitchChannel');

module.exports = async (client) => {
    // Check if config is ok
    if (twitchChannel === '') return log('Your discordchannel for the Twitch notifications has not been set so this will not work!');
    const guild = client.guilds.cache.get(guildId);
    const channel = guild.channels.cache.get(twitchChannel);
    if (!channel) return log('Your discordchannel for the Twitch notifications is invalid!');

    log('Twitch module has been started!');

    // Initiate first key
    client.twitchKey = await getTwitchKey();

    // Check streams and send embeds
    setInterval(async () => {
        const savedChannels = await TwitchChannel.find();
        savedChannels.forEach(async twitchChannel => {
            let streamData = await GetStreamData(twitchChannel.channelName, twitchClientId, client.twitchKey);
            if (!streamData) return;
            
            let channelData = await GetChannelData(twitchChannel.channelName, twitchClientId, client.twitchKey);

            let embed = CreateEmbed()
            .setTitle(`🔴 ${streamData.user_name} is now live`)
            .setDescription(`${streamData.title}`)
            .setURL(`https://www.twitch.tv/${streamData.user_login}`)
            .addFields(
                {
                    name: "Playing:",
                    value: `${streamData.game_name}`,
                    inline: true
                },
                {
                    name: "Viewers:",
                    value: `${streamData.viewer_count}`,
                    inline: true
                },
                {
                    name: "Twitch:",
                    value: `[Watch stream live](https://www.twitch.tv/${streamData.user_login})`
                }
            )
            .setFooter({ text: `Started at: ${new Date(streamData.started_at).toLocaleString()}` })
            .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${streamData.user_login}-640x360.jpg?cacheBypass=${(Math.random()).toString()}`)
            .setThumbnail(`${channelData.thumbnail_url}`);

            if (twitchChannel.twitchStreamId == streamData.id) {
                channel.messages.fetch(twitchChannel.discordMessageId).then(msg => {
                    msg.edit({ embeds: [embed] });
                })
            } else {
                await channel.send({ embeds: [embed] }).then(async msg => {
                    twitchChannel.twitchStreamId = streamData.id;
                    twitchChannel.discordMessageId = msg.id;

                    await twitchChannel.save();
                });
            }
        });
    }, 5000);

    // Update key every hour
    setInterval(async () => {
        client.twitchKey = await getTwitchKey();
    }, 60 * 1000 * 60);
}