const axios = require('axios');
const { twitchClientId, twitchClientSecret } = require('../config.json');

module.exports = {
    async authenticate(authCode) {
        let ret = {};

        const options = {
            method: "POST",
            url: "https://api.epicgames.dev/epic/oauth/v2/token",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "basic ZWM2ODRiOGM2ODdmNDc5ZmFkZWEzY2IyYWQ4M2Y1YzY6ZTFmMzFjMjExZjI4NDEzMTg2MjYyZDM3YTEzZmM4NGQ="
            },
            data: {
                grant_type: "authorization_code",
                code: authCode
            }
        }

        try {
            let response = await axios(options);
            let data = response.data;
            let token_details = parseJwt(data.access_token);
            ret = {
                success: true,
                message: token_details.dn
            };
        } catch(err) {
            ret = {
                message: err.response.data.errorMessage,
                success: false
            }
        }

        return ret;
    },

    async getTwitchKey() {
        return new Promise(async (resolve, reject) => {
            const options = {
                method: "POST",
                url: `https://id.twitch.tv/oauth2/token?client_id=${twitchClientId}&client_secret=${twitchClientSecret}&grant_type=client_credentials`
            }

            try {
                let response = await axios(options);
                resolve(response.data.access_token);
            } catch(e) {
                console.log(e)
                reject(e);
            }
        })
    }
}

function parseJwt (token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}