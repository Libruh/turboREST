const express = require('express')
const router = express.Router()
const fs = require('fs-extra')
const { turboDB } = require('../database/database.js')
const { promiseQuery, promiseRead } = require('../scripts/promises')
const { getTracks } = require('../scripts/spotifyAPI')
const { getUsers } = require('../scripts/discordAPI')

router.put('/santas', (req, res) => {

    const santaObj = JSON.parse(req.body.santaObj);

    let query = ''

    query = "INSERT INTO `santalist` (`name`, `email`, `message`, `shirtsize`, `snack`, `color`, `state`, `city`, `street`, `zip`) VALUES ('"+santaObj['name']+"', '"+santaObj['email']+"', '"+santaObj['message']+"', '"+santaObj['shirtsize']+"', '"+santaObj['snack']+"', '"+santaObj['color']+"', '"+santaObj['address']['state']+"', '"+santaObj['address']['city']+"', '"+santaObj['address']['street']+"', '"+santaObj['address']['zip']+"')";

    promiseQuery(query).then(() => {
        res.send("Successfully submitted");
    }).catch(err => {
        res.send("Submission failed")
        console.log(err)
    })

})

module.exports = router