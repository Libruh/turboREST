const express = require('express')
const passport = require('passport');
const router = express.Router()

router.get('/', passport.authenticate('discord'));

router.get('/redirect', passport.authenticate('discord', {
    failureRedirect: '/forbidden',
    successRedirect: '/dashboard'
}), (req, res) => {
    res.send(req.user);
});


module.exports = router