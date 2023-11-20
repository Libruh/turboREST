const express = require('express')
const router = express.Router()
const { getRelatedArtists, getArtist, getArtists } = require('../scripts/spotifyAPI');

// getRelatedArtists("38SKxCyfrmNWqWunb9wGHP")

router.get('/map',  async (req, res) => {
    
    let jsonFile = require("../storage/parsedSample.json");
    
    res.json(jsonFile);
    
})


router.post('/',  async (req, res) => {

    artistIds = req.body.artistIds
    
    let data = await getArtists(artistIds)

    res.json({
        ...data
    });
    
})

router.get('/:artistId',  async (req, res) => {

    console.log(req.params);
    
    let data = await getArtist(req.params.artistId)

    res.json({
        ...data
    });
    
})




module.exports = router