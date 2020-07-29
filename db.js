var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var path = require('path');
var sequelize;

if(env === 'production') { // To conect to postgres server on heroku
	sequelize = new Sequelize(process.env.DATABASE_URL, { 
		dialect: 'postgres'
	});
}
else {
	sequelize = new Sequelize(undefined, undefined, undefined, {
		'dialect': 'sqlite',
		'storage': __dirname + '/data/dev-todo-api.sqlite'
	});
}

var db = {};

db.todo = require(path.join(__dirname, '/models/todo.js'))(sequelize, Sequelize.DataTypes);
db.user = require(path.join(__dirname, '/models/user.js'))(sequelize, Sequelize.DataTypes);
db.token = require(path.join(__dirname, '/models/token.js'))(sequelize, Sequelize.DataTypes);
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.todo.belongsTo(db.user); // for association
db.user.hasMany(db.todo);

module.exports = db;