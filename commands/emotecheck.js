const axios = require('axios');
const tools = require("../tools/tools.js");
const _ = require("underscore");

module.exports = {
    name: "emotecheck",
    ping: true,
    description: 'This command will give you information about Twitch and 3rd party emotes. Example: "bb emotecheck TriHard"',
    permission: 100,
    category: "Info command",
    execute: async (channel, user, input, perm) => {
        try {
            if (module.exports.permission > perm) {
                return;
            }
            if (!input[2]) {
                return `No emote specified. Example: "bb emotecheck TriHard "`
            }
            let emoteId = input[2];
            console.log(user.emotes)
            if (user.emotes) {
                /*
                 if (input[0].toLowerCase() === "forsenbb") {
                    emoteId = JSON.stringify(user.emotes).split(",")[1].split(":")[0];
                    emoteId = emoteId.substring(1);
                } else {
                    emoteId = JSON.stringify(user.emotes).split(":")[0];
                    emoteId = emoteId.substring(2);
                }
                */
                emoteId = JSON.stringify(user.emotes).split(":")[0];
                emoteId = emoteId.substring(2);


                emoteId = emoteId.slice(0, -1);
                emoteId = `${emoteId}?id=true`;
            } else if (emoteId.split("_")[0] === "emotesv2") {
                emoteId = `${emoteId}?id=true`;
            }

            const emotecheck = await axios.get(`https://api.ivr.fi/v2/twitch/emotes/${emoteId}`, { timeout: 10000 });

            if (!emotecheck.data["error"]) {
                let emotechannel = emotecheck.data["channelName"];
                let tier = emotecheck.data["emoteTier"];
                let url = `https://static-cdn.jtvnw.net/emoticons/v2/${emotecheck.data["emoteID"]}/default/dark/3.0`;
                let emoteType = emotecheck.data["emoteType"];
                let realid = emotecheck.data["emoteID"];
                let emoteStatus = "null";
                if (emotecheck.data["emoteAssetType"]) {
                    emoteStatus = emotecheck.data["emoteAssetType"].toLowerCase();
                }
                let realemote = emotecheck.data["emoteCode"];

                if (emotecheck.data["channelName"]) {
                    if (emotecheck.data["channelName"].toLowerCase() !== emotecheck.data["channelLogin"]) {
                        emotechannel = `${emotecheck.data["channelLogin"]}(${emotecheck.data["channelName"]})`;
                    }
                }

                let ecount = 0;

                try {

                    const emotecount = await axios.get(`https://api.streamelements.com/kappa/v2/chatstats/${channel}/stats`, { timeout: 10000 });
                    let count = emotecount.data["twitchEmotes"];
                    _.each(count, async function (emote) {
                        console.log(emote["emote"], emote["amount"]);
                        if (emote["emote"] === realemote) {
                            ecount = emote["amount"];
                            return;
                        }
                    })
                } catch (err) {
                    console.log(err);
                }



                if (emotechannel === null && emoteType === "SUBSCRIPTIONS") {
                    if (ecount !== 0) {
                        return `${realemote} (ID ${realid}) is an emote (${emoteStatus}) from an unknown banned/deleted channel, the emote has been used ${ecount} times in this chat - ${url}`;
                    }
                    else {
                        return `${realemote} (ID ${realid}) is an emote (${emoteStatus}) from an unknown banned/deleted channel- ${url}`;
                    }
                }
                if (emotechannel === null && emoteType === "PRIME") {
                    if (ecount !== 0) {
                        return `${realemote} (ID ${realid}) is a Twitch prime global ${emoteStatus} emote, the emote has been used ${ecount} times in this chat - ${url}`;
                    }
                    else {
                        return `${realemote} (ID ${realid}) is a Twitch prime global ${emoteStatus} emote - ${url}`;
                    }
                }
                if (emotechannel === null && emoteType === "TURBO") {
                    if (ecount !== 0) {
                        return `${realemote} (ID ${realid}) is a Twitch turbo global ${emoteStatus} emote, the emote has been used ${ecount} times in this chat - ${url}`;
                    }
                    else {
                        return `${realemote} (ID ${realid}) is a Twitch turbo global ${emoteStatus} emote - ${url}`;
                    }
                }
                if (emotechannel === null) {
                    if (ecount !== 0) {
                        return `${realemote} (ID ${realid}) is a Twitch global ${emoteStatus} emote, the emote has been used ${ecount} times in this chat - ${url}`;
                    }
                    else {
                        return `${realemote} (ID ${realid}) is a Twitch global ${emoteStatus} emote - ${url}`;
                    }
                }
                if (emotechannel === "qa_TW_Partner") {
                    if (ecount !== 0) {
                        return `${realemote} (ID ${realid}) is a (Limited time) Twitch global ${emoteStatus} emote, the emote has been used ${ecount} times in this chat - ${url}`;
                    }
                    return `${realemote} (ID ${realid}) is a (Limited time) Twitch global ${emoteStatus} emote - ${url}`;

                }
                if (tier !== null) {
                    if (ecount !== 0) {
                        return `${realemote} (ID ${realid}) is a tier ${tier} ${emoteStatus} emote, from the channel (#${emotechannel}), the emote has been used ${ecount} times in this chat - ${url}`;
                    }
                    return `${realemote} (ID ${realid}) is a tier ${tier} ${emoteStatus} emote, from the channel (#${emotechannel}) - ${url}`;
                } else {
                    if (emoteType === "BITS_BADGE_TIERS") {
                        if (ecount !== 0) {
                            return `${realemote} (ID ${realid}) is a bit emote (${emoteStatus}), from the channel (#${emotechannel}), the emote has been used ${ecount} times in this chat - ${url}`;
                        }
                        return `${realemote} (ID ${realid}) is a bit emote (${emoteStatus}), from the channel (#${emotechannel}) - ${url}`;
                    }
                }
            }

        } catch (err) {
            console.log(err);
        }
        try {
            const streamer = await tools.query(`SELECT * FROM Streamers WHERE username="${channel}"`);
            let emotes = JSON.parse(streamer[0].emote_list);


            const now = new Date().getTime();

            let found = 0;

            let response = "";
            let ecount = 0;
            let foundemote = 0;

            try {
                const emotecount = await axios.get(`https://api.streamelements.com/kappa/v2/chatstats/${channel}/stats`, { timeout: 10000 });
                let bttv = emotecount.data["bttvEmotes"];
                let ffz = emotecount.data["ffzEmotes"];
                _.each(bttv, async function (emote) {
                    if (emote["emote"] === input[2]) {
                        ecount = emote["amount"];
                        foundemote = 1;
                        return;
                    }
                })
                if (foundemote === 0) {
                    _.each(ffz, async function (emote) {
                        if (emote["emote"] === input[2]) {
                            ecount = emote["amount"];
                            foundemote = 1;
                            return;
                        }
                    })
                }
            } catch (err) {
                console.log(err);
            }
            _.each(emotes, async function (emote) {
                if (emote[0] === input[2]) {

                    emote[2] = `(${tools.humanizeDuration(now - emote[2])})`;

                    found = 1;
                    if (emote[5] === "7tv_ZERO_WIDTH") {
                        emote[5] = "7tv (zero width)"
                    }
                    if (ecount !== 0) {
                        response = `${input[2]} is a ${emote[5]} emote, the emote was added to the channel ${emote[2]} ago, and has been used ${ecount} times in this chat. The emote was uploaded by the user "${emote[3]}" - ${emote[4]}`;
                    }
                    else {
                        response = `${input[2]} is a ${emote[5]} emote, the emote was added to the channel ${emote[2]} ago. The emote was uploaded by the user "${emote[3]}" - ${emote[4]}`;

                    }
                    return;
                }

            })

            if (found === 0) {
                const ffzglobal = await axios.get(`https://api.frankerfacez.com/v1/set/global`, { timeout: 10000 });
                const bttvglobal = await axios.get(`https://api.betterttv.net/3/cached/emotes/global`, { timeout: 10000 });
                const stvglobal = await axios.get(`https://api.7tv.app/v2/emotes/global`, { timeout: 10000 });

                let ffzemotes = ffzglobal.data["sets"];
                ffzemotes = ffzemotes["3"];
                ffzemotes = ffzemotes["emoticons"];

                _.each(ffzemotes, async function (emote) {
                    if (emote["name"] === input[2]) {
                        found = 1;
                        let url = emote["urls"];
                        let owner = emote["owner"]
                        if (ecount !== 0) {
                            response = `${input[2]} is a global ffz emote by ${owner["name"]}, the emote has been used ${ecount} times in this chat. - ${url["1"]}`;
                        }
                        else {
                            response = `${input[2]} is a global ffz emote by ${owner["name"]}  - https:${url["1"]}`;

                        }
                        return;
                    }
                })
                if (found === 1) {
                    return response;
                }

                let bttvemotes = bttvglobal.data;

                _.each(bttvemotes, async function (emote) {
                    if (emote["code"] === input[2]) {
                        found = 1;
                        if (ecount !== 0) {
                            response = `${input[2]} is a global bttv emote, the emote has been used ${ecount} times in this chat.`;
                        }
                        else {
                            response = `${input[2]} is a global bttv emote.`;

                        }
                        return;
                    }
                })

                if (found === 1) {
                    return response;
                }

                let svtemotes = stvglobal.data;

                _.each(svtemotes, async function (emote) {
                    if (emote["name"] === input[2]) {
                        found = 1;
                        let url = emote["urls"];
                        url = url[3];

                        if (ecount !== 0) {
                            response = `${input[2]} is a global 7tv emote, the emote has been used ${ecount} times in this chat - ${url[1]}`;
                        }
                        else {
                            response = `${input[2]} is a global 7tv emote - ${url[1]}`;

                        }
                        return;
                    }
                })

            }

            if (found === 1) {
                return response;
            } else {
                return `FeelsDankMan Error: Emote was not found`;
            }


        } catch (err) {
            console.log(err);
            if (err.name) {
                if (err.name === "TimeoutError") {
                    return `FeelsDankMan Banphrase api error: ${err.name}`;
                }
            }
            return `FeelsDankMan Error: ${err.response.data.error}`;
        }
    }
}