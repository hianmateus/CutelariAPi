'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'stock', {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      allowNull: true
    });
     
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('products', 'stock');
     
  }
};
