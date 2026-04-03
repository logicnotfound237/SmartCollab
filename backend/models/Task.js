const { DataTypes, Model } = require('sequelize');

class Task extends Model {
  static initModel(sequelize) {
    Task.init({
      id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
      },
      title: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      status: { 
        type: DataTypes.ENUM('pending', 'in-progress', 'completed'), 
        defaultValue: 'pending' 
      },
      priority: { 
        type: DataTypes.ENUM('low', 'medium', 'high'), 
        defaultValue: 'medium' 
      },
      assignee: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      dueDate: { 
        type: DataTypes.DATE 
      },
      project: { 
        type: DataTypes.STRING, 
        defaultValue: 'General' 
      }
    }, {
      sequelize,
      modelName: 'Task',
      tableName: 'tasks'
    });
  }
}

module.exports = Task;