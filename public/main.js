var app = angular.module("myApp", ['ngRoute']);

app.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/home', {
      templateUrl: 'home.html',
      controller: 'StudentCtrl'
    })
    .when('/viewStudents', {
      templateUrl: 'viewStudents.html',
      controller: 'StudentCtrl'
    })
    .otherwise({
      redirectTo: '/home'
    });
    //use the HTML5 History API
    // $locationProvider.html5Mode(true);
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
});


// angular.module('StudentController', [])

app.controller('StudentCtrl', function($scope, StudentFactory) {
    // $scope.students = [
    //   {name: 'Mark Waugh', city:'New York'},
    //   {name: 'Steve Jonathan', city:'London'},
    //   {name: 'John Marcus', city:'Paris'}
    // ];
    $scope.message = "Click on the hyper link to view the students list.";
    var promise;
    promise = StudentFactory.getAll();
    promise.then(function(successPayload){
      console.log('client data', JSON.stringify(successPayload.data));
      $scope.students = successPayload.data;
    });

    $scope.createStudent = function(){
      var studentData = $scope.Student;
      console.log('Controller studentData :', JSON.stringify(studentData));
      promise = StudentFactory.create(studentData);
      promise.then(function(successPayload){
        $scope.students = successPayload.data;
      }, function(errorPayload){
        console.log('Error creating student : ', error);
      });
    };


    $scope.deleteStudent = function(){
      var studentData = $scope.Student;
      console.log('Controller studentData :', JSON.stringify(studentData));
      promise = StudentFactory.delete(studentData);
      promise.then(function(successPayload){
        $scope.students = successPayload.data;
      }, function(errorPayload){
        console.log('Error deleting student : ', error);
      });
    };
});

// angular.module('StudentService', [])

  // super simple service
  // each function returns a promise object
app.factory('StudentFactory', ['$http',function($http) {
    return {
      getAll: function() {
        console.log('StudentFactory - getAll');
        return $http.get('/api/students');
      },
      get: function(id) {
        return $http.get('/api/students/' + id);
      },
      create: function(studentData) {
        console.log('Factory create studentData :', JSON.stringify(studentData));
        return $http.post('/api/students/create/' + JSON.stringify(studentData));
      },
      delete: function(studentId) {
        console.log('Factory delete studentData :', JSON.stringify(studentId));
        return $http.delete('/api/students/delete/' + JSON.stringify(studentId));
      }
    }
}]);


// angular.module('todoService', [])

//   // super simple service
//   // each function returns a promise object
//   .factory('Todos', ['$http',function($http) {
//     return {
//       get : function() {
//         return $http.get('/api/todos');
//       },
//       create : function(todoData) {
//         return $http.post('/api/todos', todoData);
//       },
//       delete : function(id) {
//         return $http.delete('/api/todos/' + id);
//       }
//     }
//   }]);