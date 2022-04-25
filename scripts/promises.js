const fs = require('fs-extra')
const { turboDB } = require('../database/database.js')

const promiseQuery = (query) => {
    return new Promise((resolve, reject) => {
        turboDB.query(query, (err, res) => {
        if (err) {
            reject(err);
            return;
        }
        
        resolve(res);
        })
    })
};

const promiseRead = async filename => {
    return new Promise((resolve, reject) => {
        let empty = {}
        fs.readFile(filename, "utf8", (err, data) => {
            if(data === undefined){
                saveData = JSON.stringify(empty)
                resolve(empty)
            }
            else{
                resolve(JSON.parse(data))
            }
        })
    })
}

module.exports = { promiseQuery, promiseRead }