'use strict';
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Reviews';
    return queryInterface.bulkInsert(options, [
      {
        review: 'Great Spot!',
        stars: 5
      },
      {
        review: 'Nice',
        stars: 4
      },
      {
        review: 'Ok',
        stars: 3
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
options.tableName = 'Reviews';
     await queryInterface.bulkDelete(options);
  }
};
