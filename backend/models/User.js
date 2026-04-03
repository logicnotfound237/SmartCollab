const { DataTypes, Model } = require('sequelize');

class User extends Model {
  static initModel(sequelize) {
    User.init({
      id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
      },
      email: { 
        type: DataTypes.STRING, 
        unique: true, 
        allowNull: false 
      },
      password: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      name: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      avatar: { 
        type: DataTypes.STRING 
      },
      role: { 
        type: DataTypes.STRING, 
        defaultValue: 'Team Member' 
      },
      joinDate: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
      },
      preferences: {
        type: DataTypes.JSON,
        defaultValue: {
          defaultLanguage: 'en',
          theme: 'light',
          notifications: true
        }
      },
      isOnline: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    }, {
      sequelize,
      modelName: 'User',
      tableName: 'users'
    });
  }
}

module.exports = User;