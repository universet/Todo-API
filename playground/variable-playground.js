var person = {
	name: 'Tejaswini',
	age: 21
};

function updatePerson(obj) {
	//obj = {
	//	name: 'Tejaswini',  --> does'n ubdate but assign value
	//	age: 22
	//};
	obj.age = 22; //--> updates value
}

updatePerson(person);
console.log(person);

//Array example
var grades = [15, 89];

function addGrades(grades) {
	grades.push(100);
	debugger; //starts debugging from here
}

addGrades(grades);
console.log(grades);