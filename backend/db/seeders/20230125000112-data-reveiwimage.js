'use strict';
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'ReviewImages';
    return queryInterface.bulkInsert(options, [
      {
        url: 'www.greenhouse.com'
      },
      {
        url: 'www.bluehouse.com'
      },
      {
        url: 'www.redhouse.com'
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
options.tableName = 'ReviewImages';
     await queryInterface.bulkDelete(options);
  }
};
