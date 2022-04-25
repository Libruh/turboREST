const express = require('express')
const router = express.Router()
const fs = require('fs-extra')
const { getUsers } = require('../scripts/discordAPI');
const { turboDB } = require('../database/database.js')

router.get('/', async (req, res) => {
    res.send("leaderboard endpoint.")
})

router.get('/users', async (req, res) => {

    let userRecords = {}

    let query = "SELECT `addedby`,`votes` FROM `tracks`"
    
    turboDB.query(query , async (err, rows, fields) => {
        if (err){
            console.log(err)
        }
        else{
            for (const row in rows) {
                if (rows.hasOwnProperty(row)) {
                    const userRecord = rows[row]
                    if(userRecord['addedby']!==null){
                        userID = userRecord['addedby']
                        if(!(userID in userRecords)){
                            userRecords[userID] = userRecord['votes']
                        }
                        else{
                            userRecords[userID] += userRecord['votes']
                        }
                    }
                }
            }

            let sortable = [];
            let userlist = [];
            for (var user in userRecords) {
                sortable.push([user, userRecords[user]]);
                userlist.push(user)
            }
            
            let nicknames = await getUsers(userlist)

            sortable.sort(function(a, b) {
                return b[1] - a[1];
            });

            for (var item in sortable) {
                userID = sortable[item][0]
                if(nicknames[userID] !== 'undefined' && nicknames[userID].nick !== null){
                    sortable[item].push(nicknames[userID].nick)
                }
                else{
                    sortable[item].push(nicknames[userID].user.username)
                }
                sortable[item].push(nicknames[userID].user.avatar)
            }

            res.send(JSON.stringify(sortable))
        }
    })
   
})

router.get('/users/season/:seasonnum', async (req, res) => {

    const seasonnum = req.params.seasonnum

    let userRecords = {}
    
    let query = "SELECT `addedby`,`votes` FROM `tracks` WHERE `season` = "+seasonnum+";"
    

    turboDB.query(query , async (err, rows, fields) => {
        if (err){
            console.log(err)
        }
        else{
            for (const row in rows) {
                if (rows.hasOwnProperty(row)) {
                    const userRecord = rows[row]
                    if(userRecord['addedby']!==null){
                        userID = userRecord['addedby']
                        if(!(userID in userRecords)){
                            userRecords[userID] = userRecord['votes']
                        }
                        else{
                            userRecords[userID] += userRecord['votes']
                        }
                    }
                }
            }

            let sortable = [];
            let userlist = [];
            for (var user in userRecords) {
                sortable.push([user, userRecords[user]]);
                userlist.push(user)
            }

            let nicknames = await getUsers(userlist)

            sortable.sort(function(a, b) {
                return b[1] - a[1];
            });

            for (var item in sortable) {
                userID = sortable[item][0]
                if(nicknames[userID].nick !== null){
                    sortable[item].push(nicknames[userID].nick)
                }
                else{
                    sortable[item].push(nicknames[userID].user.username)
                }
                sortable[item].push(nicknames[userID].user.avatar)
            }

            res.send(JSON.stringify(sortable))
        }
    })
   
})

module.exports = router