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

async function getUsers(userIds) {
    await readyBuffer()

    const guild = await client.guilds.fetch(discord.mainServerId)
    const guildMembers = await guild.members.fetch({user: userIds})
    let userData = {}
    
    for (const index in userIds) {
        const userId = userIds[index];
        let userObj = null
        try {
            userObj = await client.users.fetch(userId)
        } catch (error) {
            // Likely means user was deleted or ID is malformed
            if(error.httpStatus !== 404){
              throw error
            }
            continue
        }

        if (guildMembers.get(userId)){
            guildMember = guildMembers.get(userId)

            userData[userId] = {
                nick: guildMember.nickname ? guildMember.nickname : userObj.username,
                color: guildMember.roles.highest.color.toString(16),
                user: userObj
            }

            // There is an order of precedence to this list, most important ---> least important
            awardRoles = ["916260182714105856", "916255128774922280", "916254838717825055"]

            for (const index in awardRoles) {
                if (guildMember._roles.includes(awardRoles[index])) {
                    awardRole = guildMember.roles.cache.get(awardRoles[index])
                    userData[userId].award = {
                        name: awardRole.name,
                        icon: `https://cdn.discordapp.com/role-icons/${awardRole.id}/${awardRole.icon}.png`
                    }
                }
            }

        } else {
            userData[userId] = {
                nick: userObj.username,
                user: userObj
            }
            
        }

    }
    return userData
}

client.login(discord.token);

module.exports = { getUsers }