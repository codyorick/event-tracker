var app = angular.module("ShowTrackerApp", ["ngRoute"]);


app.controller('ShowController', function ($scope, $http, $location, $rootScope) {
    $scope.logout = function () {
        $http.post("/logout")
        .success(function () {
            $rootScope.currentUser = null;
            $location.url("/main");
        });
    }
});

app.controller('LoginController', function ($scope, $http, $location, $rootScope) {
    $scope.login = function (user) {
        $http.post('/login', user)
        .success(function (response) {
            console.log(response);
            $rootScope.currentUser = response;
            $location.url("/profile");
        });
    };
});

app.controller('RegisterController', function ($scope, $http, $location, $rootScope) {
    $scope.register = function (user) {
        $http.post('/register', user)
        .success(function (response) {
            console.log(user);
            $rootScope.currentUser = user;
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
            templateUrl: '../templates/register.html',
            controller: 'RegisterController'
        }).
        when('/login', {
            templateUrl: '../templates/login.html',
            controller: 'LoginController'
        }).
        when('/profile', {
            templateUrl: '../templates/profile.html',
            resolve: {
                logincheck: checkLogin
            }
        }).
        otherwise({
            redirectTo: '/main'
        });
    }
]);

var checkLogin = function ($q, $timeout, $http, $location, $rootScope) {
    var deferred = $q.defer();
    $http.get('/loggedin').success(function (user) {
        $rootScope.errorMessage = null;
        if (user !== '0') {
            $rootScope.currentUser = user;
            deferred.resolve();
        } else {
            $rootScope.errorMessage = 'Please log in.';
            deferred.reject();
            $location.url('/login');
        }
    });
    return deferred.promise;
};
