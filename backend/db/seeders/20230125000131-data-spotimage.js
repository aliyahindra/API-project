'use strict';
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'SpotImages';
    return queryInterface.bulkInsert(options, [
      {
        spotId: 1,
        url: 'www.greenhouseimage.com',
        preview: true
      },
      {
        spotId: 1,
        url: 'www.bluehouseimage.com',
        preview: true
      },
      {
        spotId: 1,
        url: 'www.redhouseimage.com',
        preview: false
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
options.tableName = 'SpotImages';
     await queryInterface.bulkDelete(options);
  }
};
