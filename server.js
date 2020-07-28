var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore'); //refactoring todo by id
var db = require('./db.js');
var User = require('./models/user.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

//GET /todos
app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var query = req.query;
	var where = {};

	if(query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	}
	else if(query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}
	if(query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query + '%'
		};
	}
	db.todo.findAll({where: where}).then(function (todos) {
		res.json(todos);
	}, function (e) {
		res.status(500).send();
	});

	/*var filteredTodos = todos;

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {
			completed: true
		});
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {
			completed: false
		});
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function(todo) {
			return (todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1);
		});
	}

	res.json(filteredTodos);
	*/
});

//GET / todo/:id
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10); //string to int coversion with base 10
	db.todo.findByPk(todoId).then(function (todo) {
		if(!!todo) { //!! means value which is not a boolean
			res.json(todo.toJSON());
		}
		else {
			res.status(404).send();
		}
	}, function (e) {
		res.status(500).send(); //500 -> server error
	});


	/*var matchedTodo = _.findWhere(todos, {
		id: todoId
	});
	//var matchedTodo;
	*/
	//todos.forEach(function (todo) {
	//	if(todoId === todo.id) {
	//		matchedTodo = todo;
	//	}
	//});
	/*if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}
	*/
	//res.send('Asking for todo with id: ' + req.params.id)
});

//POST /todos -> access to data which is send along with this request
app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	
	db.todo.create(body).then(function (todo) {
		req.user.addTodo(todo).then(function () {
			return todo.reload();
		}).then(function (todo) {
			res.json(todo.toJSON());
		});
	}, function (e) {
		res.status(404).json(e);
	});

	/*//use _.pick to only pick description and completed

	//console.log('Description: ' + body.description);
	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) { //trim is a method which removes spaces
		return res.status(404).send();
	}
	//set body.description to be trimmed value
	body.description = body.description.trim();
	body.id = todoNextId;
	todoNextId++;

	todos.push(body);

	res.json(body);*/
});

//DELETE -> http method, url -> /todos/id
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId
		} 
	}).then(function (rowsDeleted) {
		if(rowsDeleted === 0) {
			res.status(404).json({
				error: 'No todo with id'
			});
		}
		else {
			res.status(204).send(); //if everything went well and there is nothng to send back
		}
	}, function () {
		res.status(500).send();
	});
	/*var matchedTodo = _.findWhere(todos, {
		id: todoId
	});
	if (!matchedTodo) {
		res.status(404).json({
			"error": "No todo found with that id"
		});
	} else {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}*/
});

//PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};

	/*var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	if (!matchedTodo) {
		return (res.status(404).send());
	}
	*/
	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) { //trim is a method which removes spaces
		attributes.description = body.description;
	}
	//method extend -> let us copy propoerties from one object to another
	/*_.extend(matchedTodo, validAttr);
	res.json(matchedTodo);*/
	db.todo.findByPk(todoId).then(function (todo) {
		if(todo) {
			todo.update(attributes).then(function (todo) {
				res.json(todo.toJSON());
			}, function (e) {
				res.status(404).json(e);
			});
		}
		else {
			res.status(404).send();
		}
	}, function () {
		res.status(500).send();
	});
});

//POST /users
app.post('/users', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');
	//const foundUser = await User.prototype.toPublicJSON();
	db.user.create(body).then(function (user) {
		res.json(user.toPublicJSON());
	}, function (e) {
		res.status(400).json(e);
	});
});

//POST /users/login
app.post('/users/:login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	
	db.user.authenticate(body).then(function (user) {
		token = user.generateToken('authentication');
		if(token) {
			res.header('Auth', token).json(user.toPublicJSON());
		}
		else {
			res.status(401).send();	
		}
	}, function () {
		res.status(401).send();
	});

});

db.sequelize.sync({force: true}).then(function () {  //{force: true}
	app.listen(PORT, function() {
		console.log('Express listening on port: ' + PORT + '!');
	});	
});

