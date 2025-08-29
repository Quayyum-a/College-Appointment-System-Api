module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define(
    'Appointment',
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      studentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      professorId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      availabilityId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      status: { type: DataTypes.ENUM('booked', 'cancelled'), allowNull: false, defaultValue: 'booked' },
    },
    { tableName: 'appointments', timestamps: true }
  );

  return Appointment;
};
