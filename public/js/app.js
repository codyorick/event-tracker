var app = angular.module("ShowTrackerApp", ["ngRoute"]);


app.controller('ShowController', function ($scope, $http, $location, $rootScope) {
    $scope.logout = function () {
        $http.post("/logout")
        .success(function () {
            $rootScope.currentUser = null;
            $location.url("/main");
        });
    }

    $scope.searchUser = function (user) {
        $location.url("/profile/" + user);
    }
});

app.controller('SearchController', function ($scope, $http, $location, $rootScope) {

});

app.controller('ProfileController', function ($scope, $http, $location, $rootScope, $routeParams) {
    $http.get('/user/' + $routeParams.username)
    .success(function (user) {
        if (!user) {
            $scope.errorMessage = "User not found";
        } else {
            $scope.profileUser = user;
        }
        setButtons();
    })
    .error(function (data) {
        $scope.errorMessage = data;
    });

    $scope.addFriend = function () {
        $http.put('/friend', $scope.profileUser)
        .success(function (response) {
            $rootScope.currentUser = response;
            setButtons();
        });
    };

    $scope.unfriend = function () {
        $http.put('/unfriend', $scope.profileUser)
        .success(function (response) {
            $rootScope.currentUser = response;
            setButtons();
        });
    };

    // check if logged in user is already following profile user, and not ourselves
    function setButtons() {
        if ($routeParams.username != $rootScope.currentUser.username) {
            if ($rootScope.currentUser.friends.indexOf($routeParams.username) == -1) {  // we aren't following them yet, show friend button
                $scope.friendbutton = true;
                $scope.unfriendbutton = false;
            } else {
                $scope.unfriendbutton = true;
                $scope.friendbutton = false;
            }
        }
    }
});

app.controller('LoginController', function ($scope, $http, $location, $rootScope) {
    $scope.login = function (user) {
        $http.post('/login', user)
        .success(function (response) {
            console.log(response);
            $rootScope.currentUser = response;
            $location.url("/profile");
        })
        .error(function (response) {
            $scope.errorMessage = "Error: Incorrect login info."
        })
    };
});

app.controller('RegisterController', function ($scope, $http, $location, $rootScope) {
    $scope.register = function (user) {
        $http.post('/register', user)
        .success(function (response) {
            console.log(user);
            $rootScope.currentUser = user;
            $location.url("/profile");
        })
        .error(function (response) {
            $scope.errorMessage = response;
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
        when('/profile/:username', {
            templateUrl: '../templates/profile.html',
            controller: 'ProfileController',
            resolve: {
                logincheck: checkLogin
            }
        }).
        when('/search', {
            templateUrl: '../templates/search.html',
            controller: 'SearchController'
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
