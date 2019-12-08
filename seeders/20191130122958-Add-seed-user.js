"use strict";
const faker = require("faker");
const bcrypt = require("bcrypt-nodejs");

module.exports = {
  up: (queryInterface, Sequelize) => {
    // 建立 root(role:admin), user1(role:user), user2(role:user) 三個 user 種子
    queryInterface.bulkInsert(
      "Users",
      [
        {
          name: "root",
          email: "root@example.com",
          password: bcrypt.hashSync("12345678", bcrypt.genSaltSync(10), null),
          avatar: faker.image.imageUrl(),
          introduction: faker.lorem.text().substring(0, 200),
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "user1",
          email: "user1@example.com",
          password: bcrypt.hashSync("12345678", bcrypt.genSaltSync(10), null),
          avatar: faker.image.imageUrl(),
          introduction: faker.lorem.text().substring(0, 200),
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "user2",
          email: "user2@example.com",
          password: bcrypt.hashSync("12345678", bcrypt.genSaltSync(10), null),
          avatar: faker.image.imageUrl(),
          introduction: faker.lorem.text().substring(0, 200),
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );

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
