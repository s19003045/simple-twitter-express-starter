'use strict';
module.exports = (sequelize, DataTypes) => {
  const Followship = sequelize.define('Followship', {
  }, {
    FollowingId: DataTypes.INTEGER,
    FollowerId: DataTypes.INTEGER
  });
  Followship.associate = function (models) {
    // 這邊不用定義
  };
  return Followship;
};