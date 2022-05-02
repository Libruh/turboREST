const Sequelize = require("sequelize");
const mysql = require('mysql2');
const { db } = require('../config.json');

var turboDB  = mysql.createPool({
    host            : db.host,
    user            : db.user,
    password        : db.password,
    database        : db.database
});

async function test_connection(){
    try {
        console.log('Database connected');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}

const sequelize = new Sequelize(db.database, db.username, db.password, {
  host: db.host,
  dialect: db.dialect,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

test_connection()

module.exports = { turboDB, sequelize }
