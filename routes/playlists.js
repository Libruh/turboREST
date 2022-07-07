const express = require('express')
const moment = require('moment')
const mergeImg = require('merge-img')
const router = express.Router()
const fs = require('fs');
const { turboDB } = require('../database/database.js')
const { getTracks, getPlaylist } = require('../scripts/spotifyAPI');
const { getUsers } = require('../scripts/discordAPI')
const { promiseQuery } = require('../scripts/promises');

const path = '/home/turbo/web/RESTapi/storage/thumbnails/'

async function getArt(date=undefined){

    if (date != undefined) {
        query = `SELECT * FROM tracks WHERE playlistDate = '${date}' ORDER BY addedAt`
    } else {
        query = `SELECT * FROM tracks ORDER BY addedAt DESC LIMIT 48`
    }
    const rows = await promiseQuery(query)
    
    let trackIds = []
    for(const index in rows){
        const row = rows[index]
        trackIds.push(row.trackID)
    }
    
    const trackData = await getTracks(trackIds)

    let imgURLs = []
    for(const index in trackData){
        const track = trackData[index]
        if (track.album.images.length > 0) {
            imgURLs.push(track.album.images)
        }
        else{
            console.log("No images found for "+track.id);
        }
    }

    return(imgURLs)
}

async function getThumbnails(date){

    let existingThumbnails = new Set()
    let existingTinyThumbnails = new Set()
    fs.readdirSync(path).forEach(file => {
        existingThumbnails.add(file.substring(0, file.length - 4))
    });
    fs.readdirSync(`${path}/tiny`).forEach(file => {
        existingTinyThumbnails.add(file.substring(0, file.length - 4))
    });

    if (!existingThumbnails.has(date) || !existingTinyThumbnails.has(date)){
        
        const bigPath = `${path}/${date}.png`
        if (fs.existsSync(bigPath)) { fs.unlinkSync(bigPath) }
        const tinyPath = `${path}/tiny/${date}.png`
        if (fs.existsSync(tinyPath)) { fs.unlinkSync(tinyPath) }
        
        console.log("Generating thumbnail for "+date);
        
        const albumArt = await getArt(date)

        let bigURLs = []
        let tinyURLs = []
        for(const index in albumArt){
            if (bigURLs.length >= 4) break
            bigURL = albumArt[index][1].url
            tinyURL = albumArt[index][2].url
            
            if (!bigURLs.includes(bigURL)) {
                bigURLs.push(bigURL)
                tinyURLs.push(tinyURL)
            }
        }
        
        let incomplete = false
        while(bigURLs.length < 4){
            incomplete = true
            bigURLs.push(`${path}/../bigBlank.png`)
            tinyURLs.push(`${path}/../tinyBlank.png`)
        }
        
        const options = {
            direction: false,
            color: 0x141414ff,
            align: "center"
        }

        big1 = await mergeImg([bigURLs[0], bigURLs[1]], options)
        big2 = await mergeImg([bigURLs[2], bigURLs[3]], options)
        
        tiny1 = await mergeImg([tinyURLs[0], tinyURLs[1]], options)
        tiny2 = await mergeImg([tinyURLs[2], tinyURLs[3]], options)
                
        options.direction = true
        finalBig = await mergeImg([big1, big2], options)
        finalTiny = await mergeImg([tiny1, tiny2], options)

        if(!incomplete){
            const incompletePath = `${path}/incomplete/${date}.png`
            if (fs.existsSync(incompletePath)) { fs.unlinkSync(incompletePath) }

            console.log(`${path}tiny/${date}.png`);

            finalBig.write(`${path}${date}.png`, () => console.log(`Created big thumbnail for ${date}`));
            finalTiny.write(`${path}/tiny/${date}.png`, () => console.log(`Created tiny thumbnail for ${date}`));
        } else {
            finalBig.write(`${path}/incomplete/${date}.png`, () => console.log(`Created incomplete thumbnail for ${date}`)); 
            return `https://turboaf.net:5039/api/playlist/thumbnail/incomplete/${date}`
        }
    }
    let thumbnails = {
        'big': `https://turboaf.net:5039/api/playlist/thumbnail/${date}`,
        'tiny': `https://turboaf.net:5039/api/playlist/thumbnail/tiny/${date}`
    }
    return thumbnails
}

router.get('',  async (req, res) => {
    query = `SELECT DISTINCT playlistDate FROM tracks ORDER BY playlistDate`
    turboDB.query(query , async function (err, rows, fields) {
        if (err){
            console.log(err)
            return
        }
        
        const playlists = []

        lastDate = undefined
        for(const index in rows){
            const row = rows[index]
            playlistDate = moment(row['playlistDate']).format('YYYY-MM-DD')

            const thumbnails = await getThumbnails(playlistDate)
            playlists.push({
                "playlistDate": playlistDate,
                "thumbnails": thumbnails,
                "current": false
            })
            lastDate = playlistDate
        }

        const artData = await getArt()
        let returnArt = []
        for (const index in artData) {
            const art = artData[index];
            returnArt.push(art[1].url)
        }

        playlists.push({
            "playlistDate": lastDate,
            "art": returnArt,
            "current": true
        })

        res.send(playlists)
    })
})

router.get('/thumbnail/:date',  async (req, res) => {
    const date = req.params.date
    const file = `${path}${date}.png`

    if (fs.existsSync(file)) {
        res.sendFile(file)
    } else {
        res.sendStatus(404); 
    }
})

router.get('/thumbnail/tiny/:date',  async (req, res) => {
    const date = req.params.date
    const file = `${path}/tiny/${date}.png`

    if (fs.existsSync(file)) {
        res.sendFile(file)
    } else {
        res.sendStatus(404); 
    }
})

router.get('/thumbnail/incomplete/:date',  async (req, res) => {
    const date = req.params.date
    const file = `${path}/incomplete/${date}.png`

    if (fs.existsSync(file)) {
        res.sendFile(file)
    } else {
        res.sendStatus(404); 
    }
})

router.get('/:date',  async (req, res) => {
    const date = req.params.date
    
    switch (req.query.sort) {
        case "date":
            
            if (req.query.direction == "reverse") {
                query = `SELECT * FROM tracks WHERE playlistDate = '${date}' ORDER BY addedAt DESC`
            } else {
                query = `SELECT * FROM tracks WHERE playlistDate = '${date}' ORDER BY addedAt ASC`
            }
            break;

        case "votes":
            if (req.query.direction == "reverse") {
                query = `SELECT * FROM tracks WHERE playlistDate = '${date}' ORDER BY votes DESC, addedAt`
            } else {
                query = `SELECT * FROM tracks WHERE playlistDate = '${date}' ORDER BY votes ASC, addedAt`
            }
            break;
    
        default:
            query = `SELECT * FROM tracks WHERE playlistDate = '${date}' ORDER BY addedAt`
    }

    const rows = await promiseQuery(query)

    let databaseData = {}
    let userIds = []
    let trackIds = []

    for(const index in rows){
        const row = rows[index]
        trackIds.push(row.trackID)
        userIds.push(row.addedBy)
        databaseData[row.trackID] = row
    }

    const trackData = await getTracks(trackIds)
    const userData = await getUsers(userIds)

    let response = []

    for(const index in trackIds){
        const trackId = trackIds[index]
        const spotifyData = trackData[trackId]

        response.push({
            'trackId': trackId,
            'title': spotifyData['name'],
            'artists': spotifyData['artists'],
            'href': spotifyData['external_urls']['spotify'],
            'art': spotifyData['album']['images'],
            'addedBy': userData[databaseData[trackId].addedBy],
            'votes': databaseData[trackId].votes
        })
    }

    res.send(response)
})

module.exports = router