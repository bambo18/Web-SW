// store/index.js
// Chooses between memoryStore and mysqlStore depending on process.env.DB

const useDb = process.env.DB === 'mysql';
let store;
if (useDb) {
  store = require('./mysqlStore');
} else {
  store = require('./memoryStore');
}

module.exports = store;
