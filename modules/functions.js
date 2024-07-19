const puppeteer = require('puppeteer');
const Canvas = require('canvas');
const fs = require('fs');
const { finished } = require('node:stream/promises');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

Canvas.registerFont('./assets/fonts/futur.ttf', { family: 'Futura Bold' })
Canvas.registerFont('./assets/fonts/futura light bt.ttf', { family: 'Futura Light' })
Canvas.registerFont('./assets/fonts/futura medium bt.ttf', { family: 'Futura Medium' })
Canvas.registerFont('./assets/fonts/Futura Medium Italic font.ttf', { family: 'Futura Medium Italic' })

function log(message) {
    let logMsg = `${new Date().toLocaleString("nl-BE", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })} : ${message}`;
    console.log(logMsg);
}

const fetchRanks = async (platform, displayName) => {
    const parameter = displayName.replace(' ', '%20').toLowerCase();
    const api = `https://api.tracker.gg/api/v2/rocket-league/standard/profile/${platform}/${parameter}`;

    const browser = await puppeteer.launch({ args: ['--user-agent=<Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36>'] });
    const page = await browser.newPage();
    await page.goto(api);

    let element, data;
    try {
        element = await page.$eval('pre', el => el.textContent);
        data = JSON.parse(element).data;
    } catch {
        
    }

    await browser.close();

    if (!data) {
        return false
    } else {
        return data;
    }
}

const createRanksCanvas = async (data, platform, client) => {
    let stats, casuals, duels, doubles, standards, tournament;

    data.segments.forEach(segment => {
        switch (segment.metadata.name) {
            case 'Lifetime':
                stats = segment;
                break;

            case 'Casual':
                casuals = segment;
                break;

            case 'Ranked Duel 1v1':
                if (segment.type === "playlist")
                    duels = segment;
                break;

            case 'Ranked Doubles 2v2':
                if (segment.type === "playlist")
                    doubles = segment;
                break;

            case 'Ranked Standard 3v3':
                if (segment.type === "playlist")
                    standards = segment;
                break;

            case 'Tournament Matches':
                if (segment.type === "playlist")
                    tournament = segment;
                break;
        }
    });

    const canvas = Canvas.createCanvas(800, 450);
    const ctx = canvas.getContext('2d');
    const background = await Canvas.loadImage('./assets/images/rlbackground.png')
    ctx.drawImage(background, 0, 0, 800, 450);

    ctx.fillStyle = '#ffffff'
    ctx.font = '25px Futura Bold'

    ctx.fillText(`${data.platformInfo.platformUserHandle} (${client.platformsNames[platform]})`, 65, 46);
    let img = await Canvas.loadImage(returnSeasonRank(stats.stats.seasonRewardLevel.metadata.rankName))
    ctx.drawImage(img, 500, 12, 50, 50);
    ctx.font = '25px Futura Medium'
    ctx.fillText(stats.stats.seasonRewardLevel.metadata.rankName === "None" ? "Unranked" : stats.stats.seasonRewardLevel.metadata.rankName, 550, 46);

    ctx.font = '25px Futura Medium'
    ctx.fillText('Duel (1v1)', 18, 105);
    if (duels) {
        ctx.font = '23px Futura Medium'
        ctx.fillStyle = client.rankColors[duels.stats.tier.metadata.name]
        ctx.fillText(duels.stats.tier.metadata.name, 18, 150)
        ctx.fillStyle = '#ffffff'
        ctx.font = '23px Futura Medium'
        ctx.fillText(duels.stats.division.metadata.name, 18, 180)
        ctx.font = '20px Futura Light'
        ctx.fillText(`${duels.stats.rating.value} MMR`, 18, 210)
        ctx.fillText(`Top ${Math.round((100 - duels.stats.rating.percentile) * 10) / 10}%`, 18, 240)
        img = await Canvas.loadImage(duels.stats.tier.metadata.iconUrl)
        ctx.drawImage(img, 230, 70, 150, 150);
        ctx.font = '20px Futura Medium'
        if (duels.stats.winStreak.metadata.type === "win") {
            ctx.fillStyle = 'green'
            ctx.fillText(`Win streak: ${duels.stats.winStreak.displayValue}`, 240, 230);
        } else {
            ctx.fillStyle = 'red'
            ctx.fillText(`Loss streak: ${duels.stats.winStreak.displayValue}`, 240, 230);
        }
        ctx.fillStyle = '#ffffff'
    } else {
        ctx.font = '23px Futura Medium'
        ctx.fillText('Unranked', 18, 150)
        ctx.font = '20px Futura Light'
        ctx.fillText(`600 MMR`, 18, 210)
        img = await Canvas.loadImage("https://static.wikia.nocookie.net/rocketleague/images/0/00/Unranked_icon.png")
        ctx.drawImage(img, 230, 70, 150, 150);
    }

    ctx.font = '25px Futura Medium'
    ctx.fillText('Doubles (2v2)', 418, 105);
    if (doubles) {
        ctx.font = '23px Futura Medium'
        ctx.fillStyle = client.rankColors[doubles.stats.tier.metadata.name]
        ctx.fillText(doubles.stats.tier.metadata.name, 418, 150)
        ctx.fillStyle = '#ffffff'
        ctx.font = '23px Futura Medium'
        ctx.fillText(doubles.stats.division.metadata.name, 418, 180)
        ctx.font = '20px Futura Light'
        ctx.fillText(`${doubles.stats.rating.value} MMR`, 418, 210)
        ctx.fillText(`Top ${Math.round((100 - doubles.stats.rating.percentile) * 10) / 10}%`, 418, 240)
        img = await Canvas.loadImage(doubles.stats.tier.metadata.iconUrl)
        ctx.drawImage(img, 630, 70, 150, 150);
        ctx.font = '20px Futura Medium'
        if (doubles.stats.winStreak.metadata.type === "win") {
            ctx.fillStyle = 'green'
            ctx.fillText(`Win streak: ${doubles.stats.winStreak.displayValue}`, 640, 230);
        } else {
            ctx.fillStyle = 'red'
            ctx.fillText(`Loss streak: ${doubles.stats.winStreak.displayValue}`, 640, 230);
        }
        ctx.fillStyle = '#ffffff'
    } else {
        ctx.font = '23px Futura Medium'
        ctx.fillText('Unranked', 418, 150)
        ctx.font = '20px Futura Light'
        ctx.fillText(`600 MMR`, 418, 210)
        img = await Canvas.loadImage("https://static.wikia.nocookie.net/rocketleague/images/0/00/Unranked_icon.png")
        ctx.drawImage(img, 630, 70, 150, 150);
    }

    ctx.font = '25px Futura Medium'
    ctx.fillText('Standard (3v3)', 18, 295);
    if (standards) {
        ctx.font = '23px Futura Medium'
        ctx.fillStyle = client.rankColors[standards.stats.tier.metadata.name]
        ctx.fillText(standards.stats.tier.metadata.name, 18, 340)
        ctx.fillStyle = '#ffffff'
        ctx.font = '23px Futura Medium'
        ctx.fillText(standards.stats.division.metadata.name, 18, 370)
        ctx.font = '20px Futura Light'
        ctx.fillText(`${standards.stats.rating.value} MMR`, 18, 400)
        ctx.fillText(`Top ${Math.round((100 - standards.stats.rating.percentile) * 10) / 10}%`, 18, 430)
        img = await Canvas.loadImage(standards.stats.tier.metadata.iconUrl)
        ctx.drawImage(img, 230, 260, 150, 150);
        ctx.font = '20px Futura Medium'
        if (standards.stats.winStreak.metadata.type === "win") {
            ctx.fillStyle = 'green'
            ctx.fillText(`Win streak: ${standards.stats.winStreak.displayValue}`, 240, 420);
        } else {
            ctx.fillStyle = 'red'
            ctx.fillText(`Loss streak: ${standards.stats.winStreak.displayValue}`, 240, 420);
        }
        ctx.fillStyle = '#ffffff'
    } else {
        ctx.font = '23px Futura Medium'
        ctx.fillText('Unranked', 18, 340)
        ctx.font = '20px Futura Light'
        ctx.fillText(`600 MMR`, 18, 400)
        img = await Canvas.loadImage("https://static.wikia.nocookie.net/rocketleague/images/0/00/Unranked_icon.png")
        ctx.drawImage(img, 230, 260, 150, 150);
    }

    ctx.font = '25px Futura Medium'
    ctx.fillText('Tournament', 418, 295);
    if (tournament) {
        ctx.font = '23px Futura Medium'
        ctx.fillStyle = client.rankColors[tournament.stats.tier.metadata.name]
        ctx.fillText(tournament.stats.tier.metadata.name, 418, 340)
        ctx.fillStyle = '#ffffff'
        ctx.font = '23px Futura Medium'
        ctx.fillText(tournament.stats.division.metadata.name, 418, 370)
        ctx.font = '20px Futura Light'
        ctx.fillText(`${tournament.stats.rating.value} MMR`, 418, 400)
        ctx.fillText(`Top ${Math.round((100 - tournament.stats.rating.percentile) * 10) / 10}%`, 418, 430)
        img = await Canvas.loadImage(tournament.stats.tier.metadata.iconUrl)
        ctx.drawImage(img, 630, 260, 150, 150);
        ctx.font = '20px Futura Medium'
        if (tournament.stats.winStreak.metadata.type === "win") {
            ctx.fillStyle = 'green'
            ctx.fillText(`Win streak: ${tournament.stats.winStreak.displayValue}`, 640, 420);
        } else {
            ctx.fillStyle = 'red'
            ctx.fillText(`Loss streak: ${tournament.stats.winStreak.displayValue}`, 640, 420);
        }
        ctx.fillStyle = '#ffffff'
    } else {
        ctx.font = '23px Futura Medium'
        ctx.fillText('Unranked', 418, 340)
        ctx.font = '20px Futura Light'
        ctx.fillText(`600 MMR`, 418, 400)
        img = await Canvas.loadImage("https://static.wikia.nocookie.net/rocketleague/images/0/00/Unranked_icon.png")
        ctx.drawImage(img, 630, 260, 150, 150);
    }

    const fileName = `${genName()}.png`;
    const out = fs.createWriteStream(fileName);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    await finished(out);
    return fileName;
}

const processRanks = (rankdata) => {
    let ranks = [];

    rankdata.segments.forEach(segment => {
        if (segment.type === 'playlist'){
            ranks.push({
                name: segment.metadata.name,
                rank: segment.stats.tier.metadata.name,
                division: segment.stats.division.metadata.name,
                mmr: segment.stats.rating.value
            });
        }
    });

    return ranks;
}

const returnSeasonRank = (rank) => {
    let rankPng;

    switch (rank) {
        case 'None':
            rankPng = 'https://static.wikia.nocookie.net/rocketleague/images/8/87/Season_reward_level_none.png/revision/latest?cb=20210708192227';
            break;

        case 'Bronze':
            rankPng = 'https://static.wikia.nocookie.net/rocketleague/images/7/72/Season_reward_level_bronze.png/revision/latest?cb=20210708192226';
            break;

        case 'Silver':
            rankPng = 'https://static.wikia.nocookie.net/rocketleague/images/c/c5/Season_reward_level_silver.png/revision/latest?cb=20210708192228';
            break;

        case 'Gold':
            rankPng = 'https://static.wikia.nocookie.net/rocketleague/images/0/05/Season_reward_level_gold.png/revision/latest?cb=20210708192229';
            break;

        case 'Platinum':
            rankPng = 'https://static.wikia.nocookie.net/rocketleague/images/c/c0/Season_reward_level_platinum.png/revision/latest?cb=20210708192229';
            break;

        case 'Diamond':
            rankPng = 'https://static.wikia.nocookie.net/rocketleague/images/f/f9/Season_reward_level_diamond.png/revision/latest?cb=20210708192230';
            break;

        case 'Champion':
            rankPng = 'https://static.wikia.nocookie.net/rocketleague/images/9/9a/Season_reward_level_champion.png/revision/latest?cb=20210708192231';
            break;

        case 'Grand Champion':
            rankPng = 'https://static.wikia.nocookie.net/rocketleague/images/3/33/Season_reward_level_grand_champion.png/revision/latest?cb=20210709125539';
            break;

        case 'Supersonic Legend':
            rankPng = 'https://static.wikia.nocookie.net/rocketleague/images/e/ef/Season_reward_level_supersonic_legend.png/revision/latest?cb=20210728124209';
            break;

        default:
            break;
    }

    return rankPng;
}

function genName() {
    let txt = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 5; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return txt;
}

function CreateEmbed() {
    let embed = new EmbedBuilder()
    .setColor('#A98143')
    .setFooter({ text: 'Rising Alliance', iconURL: 'https://i.imgur.com/E4WEv9h.png' })
    .setTimestamp();

    return embed;
}

async function GetChannelData(channelName, clientId, authkey) {
    return new Promise(async (resolve, reject) => {
        const options = {
            method: "GET",
            url: `https://api.twitch.tv/helix/search/channels?query=${channelName}`,
            headers: {
                'Client-Id': clientId,
                'Authorization': `Bearer ${authkey}`
            }
        }

        try {
            let response = await axios(options);
            let channelsFound = response.data.data;
            let doesExist = false;
            for (let i=0; i < channelsFound.length; i++) {
                if (channelsFound[i].broadcaster_login.toLowerCase() == channelName.toLowerCase()) {
                    doesExist = true;
                    resolve(channelsFound[i]);
                } 
            }
            
            if (!doesExist) resolve(false);

        } catch (e) {
            resolve(false);
        }
    });
}

async function GetStreamData(channelName, clientId, authkey) {
    return new Promise(async (resolve, reject) => {
        const options = {
            method: "GET",
            url: `https://api.twitch.tv/helix/streams?user_login=${channelName}`,
            headers: {
                'Client-Id': clientId,
                'Authorization': `Bearer ${authkey}`
            }
        }

        try {
            let response = await axios(options);
            let streamData = response.data.data;
            if (streamData.length === 0) {
                resolve(false);
            } else {
                resolve(streamData[0]);
            }
        } catch (e) {
            resolve(false);
        }
    });
}

module.exports = { log, returnSeasonRank, fetchRanks, createRanksCanvas, CreateEmbed, processRanks, GetChannelData, GetStreamData }