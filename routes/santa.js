const express = require("express");
const router = express.Router();
const fs = require("fs-extra");
const { promiseQuery } = require("../scripts/promises");
const mysql = require("mysql2");

function escapeValue(value) {
    // Escape special characters in the input value
    if (typeof value === "string") {
        return `'${value.replace(/'/g, "''")}'`;
    }
    return value;
}

router.put("/", (req, res) => {
    const santaObj = JSON.parse(req.body.santaObj);

    // Escape and sanitize input values
    const escapedSantaObj = {
        name: escapeValue(santaObj["name"]),
        email: escapeValue(santaObj["email"]),
        message: escapeValue(santaObj["message"]),
        shirtsize: escapeValue(santaObj["shirtsize"]),
        snack: escapeValue(santaObj["snack"]),
        color: escapeValue(santaObj["color"]),
    };

    // Construct the SQL query
    const query = `INSERT INTO santalist (name, email, message, shirtsize, snack, color) VALUES (${escapedSantaObj.name}, ${escapedSantaObj.email}, ${escapedSantaObj.message}, ${escapedSantaObj.shirtsize}, ${escapedSantaObj.snack}, ${escapedSantaObj.color})`;

    promiseQuery(query)
        .then(() => {
            res.send("Successfully submitted");
        })
        .catch((err) => {
            res.send("Submission failed");
            console.error(err);
        });
});

module.exports = router;
