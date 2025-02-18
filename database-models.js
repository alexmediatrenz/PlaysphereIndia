const { Sequelize } = require('sequelize');
const config = require('../config/config');

const sequelize = new Sequelize(config.database.postgres.url, {
  logging: config.app.environment === 'development',
  dialectOptions: {
    ssl: config.app.environment === 'production' ? {
      require: true,
      rejectUnauthorized: false,
    } : false,
  },
});

const User = require('./User')(sequelize);
const Game = require('./Game')(sequelize);
const GameSession = require('./GameSession')(sequelize);
const ChatMessage = require('./ChatMessage')(sequelize);
const ChatRoom = require('./ChatRoom')(sequelize);
const Achievement = require('./Achievement')(sequelize);
const UserAchievement = require('./UserAchievement')(sequelize);

// Define relationships
User.hasMany(GameSession);
GameSession.belongsTo(User);

Game.hasMany(GameSession);
GameSession.belongsTo(Game);

User.hasMany(ChatMessage);
ChatMessage.belongsTo(User);

ChatRoom.hasMany(ChatMessage);
ChatMessage.belongsTo(ChatRoom);

User.belongsToMany(ChatRoom, { through: 'UserChatRooms' });
ChatRoom.belongsToMany(User, { through: 'UserChatRooms' });

User.belongsToMany(Achievement, { through: UserAchievement });
Achievement.belongsToMany(User, { through: UserAchievement });

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: config.app.environment === 'development' });
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  User,
  Game,
  GameSession,
  ChatMessage,
  ChatRoom,
  Achievement,
  UserAchievement,
  syncDatabase,
};
