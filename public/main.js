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
    .when('/auth', {
      templateUrl: 'auth.html',
      controller: 'AuthCtrl'
    })
    .when('/auth/callback', {
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

    $scope.loginToSalesforce = function(){
      $location.path('/auth');
      $location.replace();
    };
});

// salesforce authetication OAuth2.0 flow
app.controller('AuthCtrl', function($scope, $location, $cookies, $http, SalesforceConnectionFactory) {
    // Delete the local storage data
    $cookies.put("SF_ACCESS_TOKEN", '');
    $cookies.put("SF_INSTANCE_URL", '');
    // Redirect to the page
    var url = 'https://login.salesforce.com/services/oauth2/authorize?response_type=token&client_id={client_id}&redirect_uri={redirect_uri}';
    var redirectUri = '{protocol}://{host}{port}/auth/callback'.supplant({
        protocol: $location.protocol(),
        host: $location.host(),
        port: $location.port() ? ':' + $location.port() : ''
    });
    console.log(url);
    console.log(redirectUri);
    // Client IDs for dev and qa are configured in the ProductQA org
    var clientMap = {
        'async-await.herokuapp.com': '3MVG9A2kN3Bn17huTvg2gF_6Kh1ATXcOoETtZlqlblwhrO4SEKFjtsUbZXvSydokyfqjlkcFI95bKXoa0n54U'
    };
    console.log(clientMap[$location.host()]);
    window.location.href = url.supplant({
        'client_id': clientMap[$location.host()],
        'redirect_uri': redirectUri
    });

});

app.controller('AuthCallbackCtrl', function($scope, $location, $cookies) {
  console.log($location.hash.split('&'));
});


app.factory('SalesforceConnectionFactory', ['$http', function($http){

  return {
    salesforceAuth: function(){
      return $http.get('/salesforce/oauth2/auth')
      .then(function(successPayload){
        console.log('factory success', successPayload.data);
      },function(errorPayload){
        console.log('fatory error', errorPayload.data);
      });
    }
  }
}]);

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

