const express = require('express')
const router = express.Router()
const fs = require('fs-extra')
const { turboDB } = require('../database/database.js')
const { promiseQuery, promiseRead } = require('../scripts/promises')
const { getTracks } = require('../scripts/spotifyAPI')
const { getUsers } = require('../scripts/discordAPI')

router.get('/:userID', async (req, res) => {
    const userID = req.params.userID
    let trackIDs = []
    let user = await getUsers([userID])
    user = user[userID]

    let query = 'SELECT * FROM `tracks` WHERE addedBy = \'' + userID + '\''
    let databaseObj = await promiseQuery(query)

    for (const index in databaseObj) {
        if (databaseObj.hasOwnProperty(index)) {
            const track = databaseObj[index];
            trackIDs.push(track.trackID)
        }
    }

    tracks = await getTracks(trackIDs)

    let index = 0;
    for (const track in tracks) {
        if (Object.hasOwnProperty.call(tracks, track)) {
            tracks[track].votes = databaseObj[index].votes
            index = index+1;
        }
    }

    tracks = tracks.reverse()
    user.tracks = tracks
    user.trackCount = tracks.length

    res.send(user)
})

module.exports = router