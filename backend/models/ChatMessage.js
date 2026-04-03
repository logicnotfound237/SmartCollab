const { DataTypes, Model } = require('sequelize');

class ChatMessage extends Model {
  static initModel(sequelize) {
    ChatMessage.init({
      id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
      },
      roomId: { 
        type: DataTypes.UUID, 
        allowNull: false 
      },
      senderId: { 
        type: DataTypes.INTEGER 
      },
      senderName: { 
        type: DataTypes.STRING 
      },
      message: { 
        type: DataTypes.TEXT, 
        allowNull: false 
      },
      translated: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
      },
      translation: { 
        type: DataTypes.TEXT 
      },
      detectedLanguage: { 
        type: DataTypes.STRING, 
        defaultValue: 'en' 
      },
      targetLanguage: { 
        type: DataTypes.STRING, 
        defaultValue: 'en' 
      },
      originalMessage: { 
        type: DataTypes.TEXT 
      },
      timestamp: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
      },
      reactions: {
        type: DataTypes.JSON,
        defaultValue: {}
      }
    }, {
      sequelize,
      modelName: 'ChatMessage',
      tableName: 'chat_messages'
    });
  }
}

module.exports = ChatMessage;