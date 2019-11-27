'use strict';
module.exports = (sequelize, DataTypes) => {
  const Followship = sequelize.define('Followship', {
    followingId: DataTypes.INTEGER,
    followerId: DataTypes.INTEGER
  }, {});
  Followship.associate = function (models) {
    // 這邊不用定義
  };
  return Followship;
};