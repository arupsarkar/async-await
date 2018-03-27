var app = angular.module("myApp.auth", ['ngCookies']);

// salesforce authetication OAuth2.0 flow
app.controller('AuthCtrl', function ($scope, $location, $cookies, $http, SalesforceConnectionFactory) {
  console.log('AuthCtrl');
    // // Delete the local storage data
    // $cookies.put("SF_ACCESS_TOKEN", '');
    // $cookies.put("SF_INSTANCE_URL", '');
    // // Redirect to the page
    // var url = 'https://login.salesforce.com/services/oauth2/authorize?response_type=token&client_id={client_id}&redirect_uri={redirect_uri}';
    // var redirectUri = '{protocol}://{host}{port}/callback'.supplant({
    //     protocol: $location.protocol(),
    //     host: $location.host(),
    //     port: $location.port() ? ':' + $location.port() : ''
    // });
    // console.log(url);
    // console.log(redirectUri);
    // // Client IDs for dev and qa are configured in the ProductQA org
    // var clientMap = {
    //     'async-await.herokuapp.com': '3MVG9A2kN3Bn17huTvg2gF_6Kh1ATXcOoETtZlqlblwhrO4SEKFjtsUbZXvSydokyfqjlkcFI95bKXoa0n54U',
    //     'localhost': '3MVG9A2kN3Bn17huTvg2gF_6Kh1ATXcOoETtZlqlblwhrO4SEKFjtsUbZXvSydokyfqjlkcFI95bKXoa0n54U'
    // };
    // console.log(clientMap[$location.host()]);
    // window.location.href = url.supplant({
    //     'client_id': clientMap[$location.host()],
    //     'redirect_uri': redirectUri
    // });
    var promise;
    promise = SalesforceConnectionFactory.connect();
    promise.then(function(successPayload){
      console.log('success client data', JSON.stringify(successPayload.data));
    },function(errorPayload){
        console.log('error client data', JSON.stringify(errorPayload.data));
    });

});

app.controller('AuthCallbackCtrl', function($scope, $location, $cookies, SalesforceConnectionFactory) {
  console.log($location.hash.split('&'));
});



app.factory('SalesforceConnectionFactory', ['$http',function($http) {


  var config = {
    headers : {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'}
  }

    return {
      connect: function() {
        console.log('StudentFactory - getAll');
        return $http.get('/auth')
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
