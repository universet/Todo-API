var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250] //strings with lenght 1 to 250
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});

sequelize.sync({
	//force: true
}).then(function () {
	console.log('Everything is synced');

	Todo.findByPk(2).then(function (todo) {
		if(todo) {
			console.log(todo.toJSON());
		}
		else {
			console.log('Todo not found');
		}
	});


/*	Todo.create({
		description: 'Love Yourself',
		completed: false
	}).then(function (todo) {
		return Todo.create({
			description: 'Have fun',
			completed: false
		});
	}).then(function () {
		//return Todo.findByPk(1);
		return Todo.findAll({
			where: {
			completed: false
			}
		});
	}).then(function (todos) {
		if(todos) {
			todos.forEach(function (todo) {
				console.log(todo);
			})
		}
		else {
			console.log('No todos found');
		}
	}).catch(function (e) {
		console.log(e);
		//console.log('Finished!');
		//console.log(todo);
	});
*/
});