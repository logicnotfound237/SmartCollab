const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'smartcollab.sqlite'),
  logging: false
});

// Import models
const User = require('./User');
const Task = require('./Task');
const ChatMessage = require('./ChatMessage');
const Room = require('./Room');
const RoomMember = require('./RoomMember');

// Initialize models
User.initModel(sequelize);
Task.initModel(sequelize);
ChatMessage.initModel(sequelize);
Room.initModel(sequelize);
RoomMember.initModel(sequelize);

// Define associations
User.hasMany(ChatMessage, { foreignKey: 'senderId' });
ChatMessage.belongsTo(User, { foreignKey: 'senderId' });

User.hasMany(RoomMember, { foreignKey: 'userId' });
RoomMember.belongsTo(User, { foreignKey: 'userId' });

Room.hasMany(RoomMember, { foreignKey: 'roomId' });
RoomMember.belongsTo(Room, { foreignKey: 'roomId' });

Room.hasMany(ChatMessage, { foreignKey: 'roomId' });
ChatMessage.belongsTo(Room, { foreignKey: 'roomId' });

Room.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

module.exports = {
  sequelize,
  User,
  Task,
  ChatMessage,
  Room,
  RoomMember
};