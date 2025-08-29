module.exports = (sequelize, DataTypes) => {
  const Availability = sequelize.define(
    'Availability',
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      professorId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      date: { type: DataTypes.DATEONLY, allowNull: false },
      timeSlot: { type: DataTypes.STRING, allowNull: false },
      isBooked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    { tableName: 'availabilities', timestamps: true }
  );

  return Availability;
};
