'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
      await queryInterface.bulkInsert('fakultas', [{
        nama: 'Ilmu Pendidikan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama: 'Teknik',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama: 'Agribisnis',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
      
     */
    await queryInterface.bulkDelete('fakultas', null, {});
  }
};
