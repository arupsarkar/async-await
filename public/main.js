var app = angular.module("myApp", ['ngRoute', 'myApp.auth']);

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
    .when('/auth', {
        templateUrl: 'auth.html',
        controller: 'AuthCtrl'
    })
    .when('/callback', {
        templateUrl: 'auth-callback.html',
        controller: 'AuthCallbackCtrl'
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

app.controller('StudentCtrl', function($scope, StudentFactory, $location) {

    $scope.message = "Click on the hyper link to view the students list.";
    var promise;
    promise = StudentFactory.getAll();
    promise.then(function(successPayload){
      console.log('client data', JSON.stringify(successPayload.data));
      $scope.students = successPayload.data;
    });

    $scope.queriedStudent;
    $scope.getStudent = function(){
        var studentData = $scope.Student;
        promise = StudentFactory.get(studentData.id);
        promise.then(function(data){
          $scope.queriedStudent = data;
        }, function(error){
          console.info('Error - ', JSON.stringify(error));
        });
    };

    $scope.createStudent = function(){
      var studentData = $scope.Student;
      console.log('Controller studentData :', JSON.stringify(studentData));
      promise = StudentFactory.create(studentData);
      promise.then(function(data){
        console.info('data', JSON.stringify(data));
        // console.info('saved student : ', JSON.stringify(successPayload.));
        $scope.students = data;
      }, function(errorPayload){
        console.log('Error creating student : ', errorPayload);
      });
    };


    $scope.deleteStudent = function(){
      var studentData = $scope.Student;
      console.log('Controller studentData :', JSON.stringify(studentData));
      promise = StudentFactory.delete(studentData.id);
      promise.then(function(successPayload){
        // $scope.students = successPayload.data;
        $scope.students = successPayload;
      }, function(errorPayload){
        console.log('Error deleting student : ', errorPayload);
      });
    };

});

  // super simple service
  // each function returns a promise object
app.factory('StudentFactory', ['$http',function($http) {

  var config = {
    headers : {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'}
  }

    return {
      getAll: function() {
        console.log('StudentFactory - getAll');
        return $http.get('/api/students');
      },
      get: function(id) {
        console.log('id', id);
        var config = {
          params: {
            'studentId': id
          }
        }
        return $http.get('/api/students/id', config)
              .then(function(successPayload){
                console.info('Success - ', successPayload);
                return successPayload.data;
              }, function(errorPayload){
                console.error('Error - ', successPayload);
              });
      },
      create: function(studentData) {
        var data = studentData;
        console.info('Factory create studentData :', data, config);
        return $http.post('/api/students/create', data)
                  .then(function(successPayload){
                    console.log('Factory create student success : ', successPayload.data);
                    return successPayload.data;
                  },function(errorPayload){
                    console.log('Factory create student error : ', errorPayload);
                  });
      },
      delete: function(studentId) {
        console.log('Factory delete studentData :', studentId);
        var config = {
          params: {
            'studentId': studentId
          }
        };

        //return $http.delete('/api/students/delete/' + JSON.stringify(studentId));
        return $http.delete('/api/students/delete', config)
                  .then(function(successPayload){
                    console.log('Factory create student success : ', successPayload.data);
                    return successPayload.data;
                  }, function(errorPayload){
                    console.log('Factory create student error : ', errorPayload);
                  });
      }
    }
}]);

