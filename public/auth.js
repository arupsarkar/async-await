var app = angular.module("myApp.auth", ['ngCookies']);
var socket = io();


app.factory('AuthInterceptor', function ($rootScope, $q) {
    return {
        request: function (config) {
            return config;
        },
        response: function (response) {
            return response;
        },
        responseError: function (response) {
            if (response === undefined) {
                return;
            }

            if (response.status === 401) {
                $rootScope.$emit('notify.auth-invalid');
            }


            return $q.reject(response);
        }
    };
}).config(function ($httpProvider) {
    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }

    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';

    $httpProvider.interceptors.push('AuthInterceptor');
});


// salesforce authetication OAuth2.0 flow
app.controller('AuthCtrl', function ($scope, $location, $cookies, $http, SalesforceConnectionFactory) {
  console.log('AuthCtrl');
    // Delete the local storage data
    $cookies.put("SF_ACCESS_TOKEN", '');
    $cookies.put("SF_INSTANCE_URL", '');
    // Redirect to the page
    var url = 'https://login.salesforce.com/services/oauth2/authorize?response_type=token&client_id={client_id}&redirect_uri={redirect_uri}';
    var redirectUri = '{protocol}://{host}{port}/callback'.supplant({
        protocol: $location.protocol(),
        host: $location.host(),
        port: $location.port() ? ':' + $location.port() : ''
    });
    console.log('url - ', url);
    console.log('redirectUri - ', redirectUri);
    // Client IDs for dev and qa are configured in the ProductQA org
    var clientMap = {
        'async-await.herokuapp.com': '3MVG9A2kN3Bn17huTvg2gF_6Kh1ATXcOoETtZlqlblwhrO4SEKFjtsUbZXvSydokyfqjlkcFI95bKXoa0n54U',
        'localhost': '3MVG9A2kN3Bn17huTvg2gF_6Kh1ATXcOoETtZlqlblwhrO4SEKFjtsUbZXvSydokyfqjlkcFI95bKXoa0n54U'
    };
    console.log('clientMap[$location.host()] - ', clientMap[$location.host()]);
    window.location.href = url.supplant({
        'client_id': clientMap[$location.host()],
        'redirect_uri': redirectUri
    });
    console.log('returned success.');
    var promise = SalesforceConnectionFactory.connect();
    promise.then(function(successPayload){
      console.log(successPayload.data);
    }, function(errorPayload){
        console.log(errorPayload.data);
    });
});

app.controller('AuthCallbackCtrl', function($scope, $location, $cookies, SalesforceConnectionFactory) {
  $location.path('/home');
});



app.factory('SalesforceConnectionFactory', ['$http',function($http) {


  var config = {
    headers : {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With'
              }
  }

    return {
      connect: function() {
        console.log('StudentFactory - getAll');
        return $http.get('/callback', config)
        .then(function(successPayload){
          console.log(successPayload.data);
        }, function(errorPayload){
          console.log(errorPayload.data);
        });
      }
    }

}]);

String.prototype.supplant = function (o) {
  return this.replace(
    /{([^{}]*)}/g,
    function (a, b) {
      var r = o[b];
      return typeof r === 'string' || typeof r === 'number' ? r : a;
    }
  );
};

(function(){
          var serverData;
          var socket = io();
          socket.on('community', function(data){
            console.log('data', data);
            serverData = data;
            console.log('data received from server.');
            // $location.path('/home');
            console.log('navigating to home.');
            socket.disconnect();
            console.log('serverData outside', serverData);
            if(serverData){
              console.log('serverData inside', serverData);
              var landingUrl = "https://rc-ca-developer-edition.na54.force.com/s";
              window.location.href = landingUrl;
            }
          });
})();
