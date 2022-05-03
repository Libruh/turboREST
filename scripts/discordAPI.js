const axios = require('axios');
const { Client, Intents, GuildResolvable } = require('discord.js');
const { timeout } = require('nodemon/lib/config');
const { discord } = require('../config.json');

let clientReady = false

const allIntents = new Intents(32767);
const client = new Client({ intents: allIntents });

client.once('ready', () => {
    console.log('Discord.js is ready, clearing functions to run...');
    clientReady = true
});

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

// There is definitely a better way to do this, but this seems to work pretty well for now.
// If you're reading this and know a better way, let me know please!
async function readyBuffer() {
    const promise = new Promise(async (resolve) => {
        while (1) {
            if (clientReady) {
                resolve(1)
                return
            }
            else {
                await sleep(1000)
            }
        }
    });
    return promise
}

async function getUsers(contributorIds) {
    await readyBuffer()

    let users = {}

    let guildData = await client.guilds.cache.get(discord.mainServerId)

    for (const contributorId of contributorIds) {
        user = ""

        let globalProfile = {}
        let guildProfile = {}
        let failCount = 0

        if (contributorId === null){
            return undefined
        }

        while(failCount < 5){
            try {
                globalProfile = await client.users.fetch(contributorId)
                guildProfile = await guildData.members.cache.get(contributorId)
                break
            } catch (error) {
                failCount += 1
                console.log("ERROR: "+error);
                console.log("failCount: "+failCount+", Trying again...\n");
                await sleep(1000)
            }
        }
        if(failCount >= 5){
            return undefined
        }

        let sContributor = {}

        try {
            
            if (typeof guildProfile !== "undefined" && guildProfile.nickname !== null) {
                sContributor.nick = guildProfile.nickname
            }
            else {
                sContributor.nick = globalProfile.username
            }
            sContributor.user = globalProfile

            users[contributorId] = sContributor
        }
        catch (err) {
            console.log(err);
        }
    }

    return users
}

client.login(discord.token);

module.exports = { getUsers }