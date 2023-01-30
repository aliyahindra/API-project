'use strict';
const bcrypt = require("bcryptjs");
const { Booking, Spot, SpotImage } = require('../models')

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Bookings';
    return queryInterface.bulkInsert(options, [
      {
        spotId: 1,
        userId: 1,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-02')
      },
      {
        spotId: 2,
        userId: 2,
        startDate: new Date('2023-02-01'),
        endDate: new Date('2023-02-02')
      },
      {
        spotId: 3,
        userId: 3,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-02')
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
options.tableName = 'Bookings';
     await queryInterface.bulkDelete(options);
  }
};
