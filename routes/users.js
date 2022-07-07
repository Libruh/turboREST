const express = require('express')
const router = express.Router()
const moment = require('moment');
const { promiseQuery } = require('../scripts/promises')
const { getTracks } = require('../scripts/spotifyAPI')
const { getUsers } = require('../scripts/discordAPI')

router.get('/discord/:userID', async (req, res) => {
    const userIds = req.params.userID.split("&")
    let discordData = await getUsers(userIds)

    res.send(discordData)
})

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
            let playlistDate = databaseObj[index].playlistDate.toLocaleDateString()
            playlistDate = moment(playlistDate).format('YYYY-MM-DD')

            tracks[track].playlistDate = playlistDate
            index = index+1;
        }
    }

    tracks = tracks.reverse()
    user.tracks = tracks
    user.trackCount = tracks.length

    res.send(user)
})

module.exports = router