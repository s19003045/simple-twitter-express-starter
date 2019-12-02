"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    // 建立 8 個 followships 種子
    return queryInterface.bulkInsert("Followships", [
      {
        followingId: 3,
        followerId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        followingId: 4,
        followerId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        followingId: 6,
        followerId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        followingId: 8,
        followerId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        followingId: 9,
        followerId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        followingId: 10,
        followerId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Followships", null, {});
  }
};
