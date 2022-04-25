const express = require('express')
const router = express.Router()
const fs = require('fs-extra')
const { getUsers } = require('../scripts/discordAPI');
const { turboDB } = require('../database/database.js')
const { getTracks, getPlaylist } = require('../scripts/spotifyAPI')
const { promiseQuery, promiseRead } = require('../scripts/promises')

router.get('', (req, res) => {
    let playlists = []
    let query = 'SELECT DISTINCT(DATE_FORMAT(`playlistDate`, \'%Y-%m-%d\')) FROM `tracks` GROUP BY `playlistDate`'
    turboDB.query(query , function (err, rows, fields) {
        if (err){
            console.log(err)
        }
        else{
            for (const row in rows) {
                if (rows.hasOwnProperty(row)) {
                    const playlist = rows[row]
                    playlists.push(playlist['(DATE_FORMAT(`playlistDate`, \'%Y-%m-%d\'))'])
                }
            }

            res.send(JSON.stringify(playlists))
        }
    })
})

router.get('/seasons', async (req, res) => {

    let seasons = []
    let query = 'SELECT DATE_FORMAT(MIN(`playlistDate`), \'%Y-%m-%d\'), `season` from `tracks` GROUP BY `season`;'
    let databaseObj = await promiseQuery(query);

    for (const row in databaseObj) {
        const playlist = databaseObj[row]
        seasons.push(playlist["DATE_FORMAT(MIN(`playlistDate`), \'%Y-%m-%d\')"])   
    }
    res.send(JSON.stringify(seasons))
})


router.get('/spotify/:id', async (req, res) => {
    const playlistID = req.params.id

    playlist = await getPlaylist(playlistID)

    res.send(playlist)
})

router.get('/:date', async (req, res) => {
    const date = req.params.date

    let query = 'SELECT * from `tracks` where `playlistDate` = \''+date+'\''
    let databaseObj = await promiseQuery(query)
    let trackIDs = []
    let contributorIDs = []

    for (const index in databaseObj) {
        if (Object.hasOwnProperty.call(databaseObj, index)) {
            const track = databaseObj[index];
            trackIDs.push(track.trackID)
            contributorIDs.push(track.addedBy)
        }
    }

    let tracks = await getTracks(trackIDs)

    let contributors = await getUsers(contributorIDs)

    for (const index in tracks) {
        if (tracks.hasOwnProperty(index)) {
            try{
                let test = tracks[index].album.images[1].url
            }
            catch(err){
                console.log(tracks[index]);
            }
            const contributorID = databaseObj[index].addedBy
            tracks[index].contributor = contributors[contributorID]
            tracks[index].votes = databaseObj[index].votes
        }
    }


    res.send(JSON.stringify(tracks))
})

router.get('/:date/thumbnail', async (req, res) => {
    const date = req.params.date
    const filename = 'storage/playlists/'+date+'/thumbnail'
    var thumbnail = await promiseRead(filename)

    if(Object.keys(thumbnail).length < 4){
        thumbnail = {}
        let albums = []
        console.log("reinstantiating thumbnail Obj for "+date)

        let query = 'SELECT * from `tracks` where `playlistDate` = \''+req.params.date+'\''
        let result = await promiseQuery(query)
        let tracks = []

        for (const index in result) {
            if (result.hasOwnProperty(index)) {
                const track = result[index];
                tracks.push(track.trackID)
            }
        }

        tracks = await getTracks(tracks)

        let count = 0;

        for (const key in tracks) {
            if (tracks.hasOwnProperty(key)) {
                const track = tracks[key];
                const index = parseInt(key)+1
                if(!albums.includes(track.album.name)){
                    count = count+1
                    thumbnail["track"+count] = track.album.images[1]
                    albums.push(track.album.name)
                }
                if(count == 4){
                    break
                }
            }
        }

        saveData = JSON.stringify(thumbnail)

        fs.outputFile(filename, saveData, err => {
            if(err !== null){
                reject(err)
            }
        })
    }

    res.send(JSON.stringify(thumbnail))
})


module.exports = router