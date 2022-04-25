const express = require('express')
const router = express.Router()
const fs = require('fs-extra')
const { turboDB } = require('../database/database.js')
const { promiseQuery } = require('../scripts/promises')


router.put('/votes', (req, res) => {

    const trackID = req.body.trackID
    const mode = req.body.mode

    let query = ''

    if (mode === 'increment'){
        query = "UPDATE `tracks` SET `votes` = `votes` + 1 WHERE `trackID` = '"+trackID+"'";
    }
    else if( mode === 'decrement'){
        query = "UPDATE `tracks` SET `votes` = `votes` - 1 WHERE `trackID` = '"+trackID+"'";
    }

    promiseQuery(query).then(() => {
        res.send("Vote changed");
    }).catch(err => {
        res.send("Failed to change vote")
    })

})

module.exports = router
