module.exports = (sequelize, DataTypes) => {
    const earnings = sequelize.define('earnings', {
      id: {
        type: DataTypes.INTEGER(20),
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        unsigned: true
      },
      walletId: DataTypes.STRING,
      cb_id: DataTypes.STRING,
      tpoints: { type: DataTypes.INTEGER(20), defaultValue: 0 },
      total_referred: { type: DataTypes.INTEGER(20), defaultValue: 0 },
      total_referred_points: { type: DataTypes.INTEGER(20), defaultValue: 0 },
      total_token_reward: { type: DataTypes.INTEGER(20), defaultValue: 0 },
      tx_hash: { type: DataTypes.TEXT('medium') },
      status: {
        type: DataTypes.ENUM,
        values: ['pending', 'paid'],
        defaulValue: 'pending'
      },
    }, {
      tableName: 'earnings',
      createdAt: 'created_at',
      updatedAt: false,
    });
  
    return earnings;
  };