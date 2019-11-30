'use strict';
const faker = require('faker')
const bcrypt = require('bcrypt-nodejs')

module.exports = {
  up: (queryInterface, Sequelize) => {
    // 建立 root(role:admin), user1(role:user), user2(role:user) 三個 user 種子
    queryInterface.bulkInsert('Users', [{
      name: 'root',
      email: 'root@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      avatar: faker.image.imageUrl(),
      introduction: faker.lorem.text().substring(0, 200),
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      name: 'user1',
      email: 'user1@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      avatar: faker.image.imageUrl(),
      introduction: faker.lorem.text().substring(0, 200),
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      name: 'user2',
      email: 'user2@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      avatar: faker.image.imageUrl(),
      introduction: faker.lorem.text().substring(0, 200),
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    // 建立 5 個 faker user(role:user) 種子
    queryInterface.bulkInsert('Users',
      Array.from({ length: 5 }).map(d =>
        ({
          name: faker.name.findName(),
          email: faker.internet.email(),
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          avatar: faker.image.imageUrl(),
          introduction: faker.lorem.text().substring(0, 200),
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {});

    // 建立 80 個 tweets 種子
    queryInterface.bulkInsert('Tweets',
      Array.from({ length: 80 }).map(d =>
        ({
          description: faker.lorem.text().substring(0, 140), //字數少於140
          UserId: Math.floor(Math.random() * 8) + 1,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {});

    // 建立 300 個 replies 種子
    queryInterface.bulkInsert('Replies',
      Array.from({ length: 300 }).map(d =>
        ({
          comment: faker.lorem.text().substring(0, 120), //設定 comment 字數少於 120
          UserId: Math.floor(Math.random() * 8) + 1,
          TweetId: Math.floor(Math.random() * 80) + 1,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {});

    // 建立 300 個 likes 種子
    queryInterface.bulkInsert('Likes',
      Array.from({ length: 300 }).map(d =>
        ({
          UserId: Math.floor(Math.random() * 8) + 1,
          TweetId: Math.floor(Math.random() * 80) + 1,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {});

    // 建立 300 個 followships 種子
    return queryInterface.bulkInsert('Followships', [
      {
        followingId: 1,
        followerId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        followingId: 1,
        followerId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        followingId: 2,
        followerId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        followingId: 2,
        followerId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        followingId: 5,
        followerId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        followingId: 5,
        followerId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        followingId: 7,
        followerId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        followingId: 7,
        followerId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('Users', null, {})
    queryInterface.bulkDelete('Tweets', null, {})
    queryInterface.bulkDelete('Replies', null, {})
    queryInterface.bulkDelete('Likes', null, {})
    return queryInterface.bulkDelete('Followships', null, {})
  }
};
