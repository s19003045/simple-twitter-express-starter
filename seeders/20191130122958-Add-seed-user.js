"use strict";
const faker = require("faker");
const bcrypt = require("bcrypt-nodejs");

module.exports = {
  up: (queryInterface, Sequelize) => {
    // 新增5個user資料
    return queryInterface.bulkInsert(
      "Users",
      Array.from({ length: 5 }).map(d => ({
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: bcrypt.hashSync("12345678", bcrypt.genSaltSync(10), null),
        avatar: faker.image.imageUrl(),
        introduction: faker.lorem.text().substring(0, 20),
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {});
  }
};
