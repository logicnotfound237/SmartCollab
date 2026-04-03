const { DataTypes, Model } = require('sequelize');

class RoomMember extends Model {
  static initModel(sequelize) {
    RoomMember.init({
      id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
      },
      userId: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
      },
      roomId: { 
        type: DataTypes.UUID, 
        allowNull: false 
      },
      role: { 
        type: DataTypes.ENUM('owner', 'admin', 'member'),
        defaultValue: 'member'
      },
      preferences: {
        type: DataTypes.JSON,
        defaultValue: {}
      },
      joinedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      modelName: 'RoomMember',
      tableName: 'room_members',
      indexes: [
        {
          unique: true,
          fields: ['userId', 'roomId']
        }
      ]
    });
  }
}

module.exports = RoomMember;