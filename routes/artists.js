const express = require('express')
const router = express.Router()
const { getRelatedArtists, getArtist } = require('../scripts/spotifyAPI');

// getRelatedArtists("38SKxCyfrmNWqWunb9wGHP")

router.get('',  async (req, res) => {
    console.log("hit")
    
    res.send("test")
})

router.get('/:artistId/',  async (req, res) => {
    
    const artistId = req.params.artistId;
    const artistData = await getArtist(artistId)

    res.send(artistData)
    
})

router.get('/:artistId/getRelatedArtists',  async (req, res) => {
    
    const artistId = req.params.artistId;
    const relatedArtists = await getRelatedArtists(artistId)

    res.send(relatedArtists)
    
})

module.exports = router