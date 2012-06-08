/* App Controllers */

var todomvc = angular.module('todomvc', []);

function TodoController($scope, $location, persistencejs) {
	$scope.todos = []; loadTodos();

	if($location.path()=='') $location.path('/');
	$scope.location = $location;

	$scope.$watch(function() {return $location.path(); }, function(path) { 
		$scope.filter = path == '/active' ? 
			{ done: false } : path == '/completed' ?
				{ done: true } : null;
	});

	function loadTodos() {
		persistencejs.fetchAll($scope);
	};
	
	$scope.refresh = function(){ $scope.$apply(); }
	
	$scope.todoForms = {
		one: '{} item left',
		other: '{} items left'
	};

	$scope.addTodo = function() {
		if (this.newTodo.trim().length === 0) {
			return;
		}

		$scope.todos.push({
			title: this.newTodo,
			done: false,
			editing: false
		});
		
		persistencejs.add(this.newTodo);
		this.newTodo = '';
	};

	$scope.editTodo = function(todo) {
		//cancel any active editing operation
		$scope.todos.forEach(function(val) {
			val.editing = false;
		});
		todo.editing = true;
	};

	$scope.finishEditing = function(todo) {
		if (todo.title.trim().length === 0) {
			$scope.removeTodo(todo);
			persistencejs.remove(todo);
		} else {
			todo.editing = false;
			persistencejs.edit($scope.editTodoStartContent, todo.title);
		}
	};

	$scope.removeTodo = function(todo) {
		for (var i = 0, len = $scope.todos.length; i < len; ++i) {
			if (todo === $scope.todos[i]) {
				$scope.todos.splice(i, 1);
			}
		}
		persistencejs.remove(todo);
	};

	$scope.remainingTodos = function() {
		return $scope.todos.filter(function(val) {
			return !val.done;
		});
	};

	$scope.doneTodos = function() {
		return $scope.todos.filter(function(val) {
			return val.done;
		});
	}

	$scope.clearDoneTodos = function() {
		$scope.todos = $scope.remainingTodos();
		persistencejs.clearCompletedItems();
	};

	$scope.toggleDone = function(todo){
		persistencejs.changeStatus(todo);
	}

	$scope.markAllDone = function() {
		var markDone = true;
		if (!$scope.remainingTodos().length) {
			markDone = false;
		}
		$scope.todos.forEach(function(todo) {
			if(todo.done !== markDone){
				persistencejs.changeStatus(todo);
			}
			todo.done = markDone;
		});
	};
};
