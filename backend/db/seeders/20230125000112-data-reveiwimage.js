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
        reviewId: 1,
        url: 'www.greenhouse.com'
      },
      {
        reviewId: 2,
        url: 'www.bluehouse.com'
      },
      {
        reviewId: 3,
        url: 'www.redhouse.com'
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
options.tableName = 'ReviewImages';
     await queryInterface.bulkDelete(options);
  }
};
