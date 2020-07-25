var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
	id: 1,
	description: 'Meet mom!',
	completed: false
}, {
	id: 2,
	description: 'Love yourself',
	completed: false
}, {
	id: 3,
	description: 'Spread Happiness',
	completed: true
}];

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

//GET /todos
app.get('/todos', function(req, res) {
	res.json(todos);
});

//GET / todo/:id
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10); //string to int coversion with base 10
	var matchedTodo;
	todos.forEach(function (todo) {
		if(todoId === todo.id) {
			matchedTodo = todo;
		}
	});
	if(matchedTodo) {
		res.json(matchedTodo);
	}
	else {
		res.status(404).send();	
	}
	
	//res.send('Asking for todo with id: ' + req.params.id)
});

app.listen(PORT, function () {
	console.log('Express listening on port: ' + PORT + '!');
});