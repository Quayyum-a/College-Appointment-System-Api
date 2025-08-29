module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
      password: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.ENUM('student', 'professor'), allowNull: false },
    },
    { tableName: 'users', timestamps: true }
  );

  return User;
};
