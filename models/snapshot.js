module.exports = (sequelize, DataTypes) => {
    const snapshot = sequelize.define('snapshot', {
        id: {
            type: DataTypes.INTEGER(20),
            unique: true,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unsigned: true
        },
        address: {
            type: DataTypes.STRING,
            unique: true,
        },
        balance:{ type: DataTypes.DOUBLE(16, 8) , defaultValue: 0 },
        block:{ type:  DataTypes.INTEGER(20) , defaultValue: 0 },
        tx: DataTypes.STRING,
        status: {
            type: DataTypes.ENUM,
            values: ['unclaimed', 'claimed'],
            defaulValue: 'unclaimed'
        },
    }, {
        tableName: 'snapshot',
        createdAt: 'created_at',
        updatedAt: false,
    });
    return snapshot;
};