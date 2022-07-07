const express = require('express')
const router = express.Router()
const fs = require('fs-extra')
const { getUsers } = require('../scripts/discordAPI');
const { turboDB } = require('../database/database.js')

router.get('/', async (req, res) => {
    res.send("updated leaderboard endpoint.")
})

router.get('/users/:season?', async (req, res) => {
    const season = req.params.season

    let query = "SELECT `addedby`,`votes` FROM `tracks`"
    if (season){
        query += " WHERE `season` = "+parseInt(season)
    }
    
    turboDB.query(query , async (err, rows, fields) => {
        if (err){
            console.log(err)
        }
        else{
            // Create the Obj

            let leaderboardData = {}

            for (const row in rows) {
                const user = rows[row];
                userId = user.addedby
                votes = user.votes
                
                if (userId != null){
                    if (leaderboardData[userId] !== undefined) {
                        leaderboardData[userId] = leaderboardData[userId] + votes
                    } else {
                        leaderboardData[userId] = votes
                    }
                }
            }

            // Sort it

            let sortedUsers = [];
            for (var votes in leaderboardData) {
                sortedUsers.push([votes, leaderboardData[votes]]);
            }

            sortedUsers.sort(function(a, b) {
                return b[1] - a[1];
            });

            // Add the Discord Data

            let userIds = []
            for (var index in sortedUsers) {
                userIds.push(sortedUsers[index][0])
            }
            discordUsers = await getUsers(userIds)
            
            let leaderboard = []

            let place = 0
            for (const key in discordUsers) {
                place += 1
                const userObj = discordUsers[key] 
                if(!userObj['nick'].includes("Deleted")){
                    leaderboard.push({
                        'nick': userObj['nick'],
                        'id': userObj['user']['id'],
                        'avatar': `https://cdn.discordapp.com/avatars/${userObj['user']['id']}/${userObj['user']['avatar']}.jpg`,
                        'votes': leaderboardData[userObj['user']['id']],
                        'place': place
                    })
                }
            }


            res.send(JSON.stringify(leaderboard))
        }
    })
   
})

module.exports = router