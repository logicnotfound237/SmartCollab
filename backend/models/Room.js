const { DataTypes, Model } = require('sequelize');

class Room extends Model {
  static initModel(sequelize) {
    Room.init({
      id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
      },
      name: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      createdBy: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
      },
      settings: {
        type: DataTypes.JSON,
        defaultValue: {
          profanityFilter: true,
          allowTranslations: true,
          maxMembers: 50,
          isPublic: true
        }
      },
      inviteCode: {
        type: DataTypes.STRING,
        unique: true
      }
    }, {
      sequelize,
      modelName: 'Room',
      tableName: 'rooms'
    });
  }
}

module.exports = Room;