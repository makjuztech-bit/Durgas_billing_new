const { Sequelize } = require('sequelize');
const path = require('path');

const storagePath = process.env.DATABASE_PATH || path.join(__dirname, 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: false,
  dialectOptions: {
    timeout: 10000
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Standard SQLite mode (DELETE rollback journal - single clean file, Windows safe)
sequelize.afterConnect((connection) => {
  if (typeof connection.run === 'function') {
    connection.run('PRAGMA journal_mode = DELETE;');
    connection.run('PRAGMA synchronous = NORMAL;');
    connection.run('PRAGMA foreign_keys = ON;');
  }
});

module.exports = sequelize;
