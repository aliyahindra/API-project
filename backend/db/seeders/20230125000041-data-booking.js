'use strict';
const bcrypt = require("bcryptjs");

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
        startDate: '2022-01-01',
        endDate: '2022-01-02'
      },
      {
        spotId: 2,
        userId: 2,
        startDate: '2022-02-01',
        endDate: '02-02-02'
      },
      {
        spotId: 3,
        userId: 3,
        startDate: '2022-03-01',
        endDate: '03-03-02'
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
options.tableName = 'Bookings';
     await queryInterface.bulkDelete(options);
  }
};
