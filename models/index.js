'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(module.filename);
const env = process.env.NODE_ENV || 'production';
console.log(env);
const config = require(__dirname + '/../config/db.json')[env];
var db = {};


let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

db.sequelize = sequelize;
db.snapshot = require('../models/snapshot.js')(sequelize, Sequelize);
db.earnings = require('../models/earnings.js')(sequelize, Sequelize);


module.exports = db;
