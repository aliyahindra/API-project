'use strict';
const bcrypt = require("bcryptjs");
const { Spot, SpotImage } = require('../models')

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Spots';
    return queryInterface.bulkInsert(options, [
      {
       ownerId: 1,
       address: '111 N Smith St',
       city: 'Portland',
       state: 'OR',
       country: 'USA',
       lat: 11,
       lng: 11,
       name: 'BLUE HOUSE',
       description: 'charming bungalow',
       price: 150
      },
      {
        ownerId: 2,
        address: '222 S Grant St',
        city: 'Portland',
        state: 'OR',
        country: 'USA',
        lat: 22,
        lng: 22,
        name: 'GREEN HOUSE',
        description: 'vinatge farm house',
        price: 200
       },
       {
        ownerId: 3,
        address: '333 N Smith St',
        city: 'Portland',
        state: 'OR',
        country: 'USA',
        lat: 33,
        lng: 33,
        name: 'RED HOUSE',
        description: 'mid-century ranch',
        price: 300
       },

    ], {});
  },

  down: async (queryInterface, Sequelize) => {
options.tableName = 'Spots';
     await queryInterface.bulkDelete(options);
  }
};
