var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore'); //refactoring todo by id

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

//GET /todos
app.get('/todos', function(req, res) {
	var queryParams = req.query;
	var filteredTodos = todos;

	if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {completed: true});
	}
	else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {completed: false});
	}

	if(queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function (todo) {
			return(todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1);
		});
	}

	res.json(filteredTodos);
});

//GET / todo/:id
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10); //string to int coversion with base 10
	var matchedTodo = _.findWhere(todos, {id: todoId});
		//var matchedTodo;
		//todos.forEach(function (todo) {
		//	if(todoId === todo.id) {
		//		matchedTodo = todo;
		//	}
		//});
	if(matchedTodo) {
		res.json(matchedTodo);
	}
	else {
		res.status(404).send();	
	}
	
	//res.send('Asking for todo with id: ' + req.params.id)
});

//POST /todos -> access to data which is send along with this request
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	//use _.pick to only pick description and completed

	//console.log('Description: ' + body.description);
	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) { //trim is a method which removes spaces
		return res.status(404).send();
	}
	//set body.description to be trimmed value
	body.description = body.description.trim();
	body.id = todoNextId;
	todoNextId++;

	todos.push(body);

	res.json(body);
});

//DELETE -> http method, url -> /todos/id
app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	if(!matchedTodo) {
		res.status(404).json({"error": "No todo found with that id"});
	} 
	else {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}
});

//PUT /todos/:id
app.put('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	var body = _.pick(req.body, 'description', 'completed');
	var validAttr = {};

	if(!matchedTodo) {
		return(res.status(404).send());
	}

	if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttr.completed = body.completed;
	}
	else if(body.hasOwnProperty('completed')) {
		return(res.status(404).send());
	}

	if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) { //trim is a method which removes spaces
		validAttr.description = body.description;
	}
	else if(body.hasOwnProperty('description')) {
		return(res.status(404).send());
	}
	//method extend -> let us copy propoerties from one object to another
	_.extend(matchedTodo, validAttr);
	res.json(matchedTodo);
});

app.listen(PORT, function () {
	console.log('Express listening on port: ' + PORT + '!');
});