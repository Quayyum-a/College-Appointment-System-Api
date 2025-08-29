const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

let sequelize;
if (isTest) {
  sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'college_appointments',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'Password@2001',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      dialect: 'mysql',
      logging: false,
    }
  );
}

const databaseModels = {};

databaseModels.User = require('../models/User')(sequelize, DataTypes);
databaseModels.Availability = require('../models/Availability')(sequelize, DataTypes);
databaseModels.Appointment = require('../models/Appointment')(sequelize, DataTypes);

function applyAssociations() {
  const { User, Availability, Appointment } = databaseModels;

  User.hasMany(Availability, { foreignKey: 'professorId', as: 'availabilities' });
  Availability.belongsTo(User, { foreignKey: 'professorId', as: 'professor' });

  User.hasMany(Appointment, { foreignKey: 'studentId', as: 'studentAppointments' });
  Appointment.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

  User.hasMany(Appointment, { foreignKey: 'professorId', as: 'professorAppointments' });
  Appointment.belongsTo(User, { foreignKey: 'professorId', as: 'professor' });

  Availability.hasOne(Appointment, { foreignKey: 'availabilityId', as: 'appointment' });
  Appointment.belongsTo(Availability, { foreignKey: 'availabilityId', as: 'availability' });
}

async function initModels() {
  await sequelize.authenticate();
  applyAssociations();
  await sequelize.sync({ force: isTest });
}

module.exports = { sequelize, ...databaseModels, initModels };
