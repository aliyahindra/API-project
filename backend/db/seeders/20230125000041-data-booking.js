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
        startDate: '2022-01-01',
        endDate: '2022-01-02'
      },
      {
        startDate: '2022-02-01',
        endDate: '02-02-02'
      },
      {
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
