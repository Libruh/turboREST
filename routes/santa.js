const express = require('express')
const router = express.Router()
const fs = require('fs-extra')
const { promiseQuery, promiseRead } = require('../scripts/promises')

router.put('/', (req, res) => {

    const santaObj = JSON.parse(req.body.santaObj);

    let query = ''

    query = "INSERT INTO `santalist` (`name`, `email`, `message`, `shirtsize`, `snack`, `color`) VALUES ('"+santaObj['name']+"', '"+santaObj['email']+"', '"+santaObj['message']+"', '"+santaObj['shirtsize']+"', '"+santaObj['snack']+"', '"+santaObj['color']+"')";

    promiseQuery(query).then(() => {
        res.send("Successfully submitted");
    }).catch(err => {
        res.send("Submission failed")
        console.log(err)
    })

})

module.exports = router