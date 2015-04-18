var app = angular.module("ShowTrackerApp", ["ngRoute"]);


app.controller('ShowController', function ($scope, $http) {

});

app.controller('LoginController', function ($scope, $http, $location) {
    $scope.login = function (user) {
        $http.post('/login', user)
        .success(function (response) {
            console.log(response);
        });
    };
});

app.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
        when('/main', {
            templateUrl: '../templates/main.html'
        }).
        when('/register', {
            templateUrl: '../templates/register.html'
        }).
        when('/login', {
            templateUrl: '../templates/login.html',
            controller: 'LoginController'
        }).
        when('/profile', {
            templateUrl: '../templates/profile.html'
        }).
        otherwise({
            redirectTo: '/main'
        });
    }
]);