'use strict';
const bcrypt = require("bcryptjs");
const { Review, Booking, Spot, SpotImage } = require('../models')


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
        spotId: 1,
        userId: 1,
        review: 'Great Spot!',
        stars: 5
      },
      {
        spotId: 2,
        userId: 2,
        review: 'Nice',
        stars: 4
      },
      {
        spotId: 3,
        userId: 3,
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
