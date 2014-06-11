/********************************* Function.prototype.bind polyfill for phantomjs ********************************/
/* */
/* */	if (!Function.prototype.bind) {
/* */		Function.prototype.bind = function (oThis) {
/* */			if (typeof this !== "function") {
/* */				throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
/* */			}
/* */			var aArgs = Array.prototype.slice.call(arguments, 1);
/* */			var fToBind = this;
/* */			var fNOP = function () {};
/* */			var fBound = function () {
/* */				var target = this instanceof fNOP && oThis ? this : oThis;
/* */				var args = aArgs.concat(Array.prototype.slice.call(arguments));
/* */				return fToBind.apply(target, args);
/* */			};
/* */			fNOP.prototype = this.prototype;
/* */			fBound.prototype = new fNOP();
/* */			return fBound;
/* */		};
/* */	}
/* */
/*****************************************************************************************************************/

var GIVE_UP_DELAY = 10000;

(function () {
	var config = {
		dev: {
			host: "localhost:3000"
		},
		test: {
			host: "test.api.mondora.com"
		},
		prod: {
			host: "api.mondora.com",
			ssl: true
		}
	};
	var cfg;
	if (/b/.test(APP_VERSION)) {
		cfg = config.dev;
	} else if (/t/.test(APP_VERSION)) {
		cfg = config.test;
	} else {
		cfg = config.prod;
	}
	//TODO Use ng-asteroid, fool!
	var deferred = Q.defer();
	window.Ceres = new Asteroid(cfg.host, cfg.ssl, cfg.debug);
	Ceres.on("connected", function () {
		deferred.resolve();
	});
	Ceres.ddp.on("socket_close", function () {
		console.log("Closed");
	});
	window.CERES_CONNECTED = deferred.promise.timeout(GIVE_UP_DELAY);
})();

angular.module("mnd-web", [

	// Third party modules
	"ui.bootstrap",
	"ui.router",
	"mnd.sprinkle",
	"mnd.dashboard",
	"angularFileUpload",
	"ngSanitize",
	"RecursionHelper",

	// App modules
	"mnd-web.templates",
	"mnd-web.methods",
	// Components
	"mnd-web.components.dashboard",
	"mnd-web.components.mindmap",
	"mnd-web.components.center",
	"mnd-web.components.check-mobile",
	"mnd-web.components.clear-selection",
	"mnd-web.components.menu-editor",
	"mnd-web.components.cig-image",
	"mnd-web.components.pomodoro",
	"mnd-web.components.user-input",
	// Apps
	// ...
	// Pages
	"mnd-web.pages.home",
	"mnd-web.pages.staticHome",
	"mnd-web.pages.personalHome",
	// TODO dynamic injection
	"mnd-web.pages.profile",
	"mnd-web.pages.page",
	"mnd-web.pages.admin",
	"mnd-web.pages.pomodoro.list",
	"mnd-web.pages.pomodoro.view",
	"mnd-web.pages.team",
	"mnd-web.pages.user",
	"mnd-web.pages.post.edit",
	"mnd-web.pages.post.view",
	"mnd-web.pages.post.list",
	"mnd-web.pages.channel.edit",
	"mnd-web.pages.channel.view",
	"mnd-web.pages.topic"

])

.factory("TimeoutPromiseService", function ($q, $timeout, $state) {
	var timeoutPromise = function (promise, t) {
		var deferred = $q.defer();
		var timer = $timeout(function () {
			deferred.reject("timeout");
			$state.go("serverProblems");
		}, t);
		promise.then(function (res) {
			$timeout.cancel(timer);
			deferred.resolve(res);
		}, function (err) {
			$timeout.cancel(timer);
			deferred.reject(err);
			$state.go("serverProblems");
		});
		return deferred.promise;
	};
	return {
		timeoutPromise: timeoutPromise
	};
})

.config(function ($locationProvider) {
	$locationProvider.hashPrefix("!");
})

.config(function ($stateProvider, $urlRouterProvider) {

	// Here we should configure ng-asteroid before the router

	$stateProvider.state("root", {
		abstract: true,
        templateUrl: "root.html",
		resolve: {
			resumingLogin: function (TimeoutPromiseService, $state) {
				return CERES_CONNECTED
					.then(function () {
						var resProm = Ceres.resumeLoginPromise;
						if (resProm.isPending()) {
							return TimeoutPromiseService.timeoutPromise(resProm, GIVE_UP_DELAY)
								.finally(function () {
									return true;
								});
						}
						return true;
					})
					.then(function () {
						var sub = Ceres.subscribe("configurations");
						return TimeoutPromiseService.timeoutPromise(sub.ready, GIVE_UP_DELAY);
					})
					.fail(function () {
						$state.go("staticHome");
					});
			}
		}
    });

    $stateProvider.state("home", {
        url: "/",
		parent: "root",
        templateUrl: "pages/home/home.html",
		controller: "HomeController",
		onEnter: function ($rootScope, $state) {
			if ($rootScope.user) {
				$state.go("personalHome");
			}
		},
		public: true
    });

    $stateProvider.state("staticHome", {
        url: "/staticHome",
        templateUrl: "pages/staticHome/staticHome.html",
		controller: "StaticHomeController",
		public: true
    });

    $stateProvider.state("approach", {
        url: "/approach",
		parent: "root",
        templateUrl: "pages/page/page.html",
		resolve: {
			/*
			pageSub: function ($stateParams, TimeoutPromiseService) {
				var sub = Ceres.subscribe("singlePage", $stateParams.pageName);
				return TimeoutPromiseService.timeoutPromise(sub.ready, GIVE_UP_DELAY);
			}
			*/
		},
		controller: "PageController",
		public: true
    });

    $stateProvider.state("personalHome", {
        url: "/home",
		parent: "root",
        templateUrl: "pages/personalHome/personalHome.html",
		controller: "PersonalHomeController"
    });

    $stateProvider.state("notFound", {
        url: "/notFound",
		parent: "root",
        templateUrl: "pages/notFound/notFound.html",
		public: true
    });

    $stateProvider.state("serverProblems", {
        url: "/serverProblems",
		parent: "root",
        templateUrl: "pages/serverProblems/serverProblems.html",
		public: true
    });

	// Apps
	// TODO make this dynamic
    $stateProvider.state("profile", {
        url: "/profile",
		parent: "root",
        templateUrl: "pages/profile/profile.html",
		controller: "ProfileController"
    });

    $stateProvider.state("admin", {
        url: "/admin",
		parent: "root",
        templateUrl: "pages/admin/admin.html",
		controller: "AdminController"
    });

    $stateProvider.state("pomodoroList", {
        url: "/pomodoro",
		parent: "root",
        templateUrl: "pages/pomodoro/list/pomodoroList.html",
		controller: "PomodoroListController",
		resolve: {
			pomoSub: function (TimeoutPromiseService) {
				var sub = Ceres.subscribe("pomodoros");
				return TimeoutPromiseService.timeoutPromise(sub.ready, GIVE_UP_DELAY);
			}
		}
    });
    $stateProvider.state("pomodoroView", {
        url: "/pomodoro/:pomodoroId",
		parent: "root",
        templateUrl: "pages/pomodoro/view/pomodoroView.html",
		controller: "PomodoroViewController",
		resolve: {
			pomoSub: function (TimeoutPromiseService, $stateParams) {
				var sub = Ceres.subscribe("singlePomodoro", $stateParams.pomodoroId);
				return TimeoutPromiseService.timeoutPromise(sub.ready, GIVE_UP_DELAY);
			}
		}
    });
	// END apps

    $stateProvider.state("user", {
        url: "/user/:userId",
		parent: "root",
        templateUrl: "pages/user/user.html",
		controller: "UserController",
		resolve: {
			userSub: function ($stateParams, TimeoutPromiseService) {
				var sub = Ceres.subscribe("singleUser", $stateParams.userId);
				return TimeoutPromiseService.timeoutPromise(sub.ready, GIVE_UP_DELAY);
			},
			posts: function (TimeoutPromiseService, $stateParams) {
				var meth = Ceres.call("getPostsByAuthor", $stateParams.userId);
				return TimeoutPromiseService.timeoutPromise(meth.result, GIVE_UP_DELAY);
			}
		},
		public: true
    });

    $stateProvider.state("team", {
        url: "/team",
		parent: "root",
        templateUrl: "pages/team/team.html",
		controller: "TeamController",
		resolve: {
			userSub: function (TimeoutPromiseService) {
				var sub = Ceres.subscribe("teamUsers");
				return TimeoutPromiseService.timeoutPromise(sub.ready, GIVE_UP_DELAY);
			}
		},
		public: true
    });

    $stateProvider.state("postView", {
        url: "/post/:postId",
		parent: "root",
        templateUrl: "pages/post/view/postView.html",
		controller: "PostViewController",
		resolve: {
			postSub: function ($stateParams, TimeoutPromiseService) {
				var sub = Ceres.subscribe("singlePost", $stateParams.postId);
				return TimeoutPromiseService.timeoutPromise(sub.ready, GIVE_UP_DELAY);
			}
		},
		public: true
    });

    $stateProvider.state("postEdit", {
        url: "/post/:postId/edit",
		parent: "root",
        templateUrl: "pages/post/edit/postEdit.html",
		controller: "PostEditController",
		resolve: {
			postSub: function ($stateParams, TimeoutPromiseService) {
				var sub = Ceres.subscribe("singlePost", $stateParams.postId);
				return TimeoutPromiseService.timeoutPromise(sub.ready, GIVE_UP_DELAY);
			}
		}
    });

    $stateProvider.state("postList", {
        url: "/posts",
		parent: "root",
        templateUrl: "pages/post/list/postList.html",
		controller: "PostListController",
		resolve: {
			postSub: function (TimeoutPromiseService) {
				var sub = Ceres.subscribe("latestPosts");
				return TimeoutPromiseService.timeoutPromise(sub.ready, GIVE_UP_DELAY);
			}
		},
		public: true
    });

    $stateProvider.state("topic", {
        url: "/topic/:name",
		parent: "root",
        templateUrl: "pages/topic/topic.html",
		controller: "TopicController",
		resolve: {
			topic: function (TimeoutPromiseService, $stateParams) {
				var meth = Ceres.call("getTopic", $stateParams.name);
				return TimeoutPromiseService.timeoutPromise(meth.result, GIVE_UP_DELAY);
			}
		},
		public: true
    });

    $urlRouterProvider.otherwise("/");

})

.run(function ($rootScope, $state, MndSidebarService) {

    $rootScope.safeApply = function (fn) {
        var phase = $rootScope.$$phase;
        if (phase === "$apply" || phase === "$digest") {
            if (typeof fn === "function") {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

	$rootScope.Ceres = Ceres;
	Ceres.subscribe("userAdditionalInfo");
	Ceres.subscribe("allUsers");
	$rootScope.Configurations = Ceres.createCollection("configurations");
	$rootScope.Posts = Ceres.createCollection("posts");
	$rootScope.Channels = Ceres.createCollection("channels");
	$rootScope.Users = Ceres.createCollection("users");

	Ceres.on("login", function (userId) {
		$rootScope.loggedInUserQuery = $rootScope.Users.reactiveQuery({_id: userId});
		$rootScope.safeApply(function () {
			$rootScope.user = $rootScope.loggedInUserQuery.result[0];
			$rootScope.signedIn = true;
		});
		$rootScope.loggedInUserQuery.on("change", function () {
			$rootScope.safeApply(function () {
				$rootScope.user = $rootScope.loggedInUserQuery.result[0];
			});
		});
	});
	Ceres.on("logout", function () {
		$rootScope.safeApply(function () {
			delete $rootScope.user;
			$rootScope.signedIn = false;
			if (!$state.current.public) {
				$state.go("home");
			}
		});
	});

	$rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) { 
		if (MndSidebarService.getSidebarStatus()) {
			MndSidebarService.toggleSidebarStatus();
		}
		$rootScope.$broadcast("sidebarStatusChanged");
		if (toState.name === "home" && $rootScope.user) {
			event.preventDefault(); 
			$state.go("personalHome");
		}
	});

})

.controller("MainController", function ($scope) {
	$scope.login = function () {
		$scope.Ceres.loginWithTwitter();
	};
	$scope.logout = function () {
		$scope.Ceres.logout();
	};
});

// This module defines application-wide methods
angular.module("mnd-web.methods", [])

.factory("AppMethods", function (
	$rootScope,
	$state,
	$stateParams
) {

	var addPost = function () {
		var user = $rootScope.user;
		if (!user) {
			return;
		}
		var post = {
			userId: user._id,
			map: {},
			authors: [{
				userId: user._id,
				screenName: user.profile.screenName,
				name: user.profile.name,
				pictureUrl: user.profile.pictureUrl
			}],
			comments: [],
			published: false
		};
		$rootScope.Posts.insert(post).remote.then(function (id) {
			$state.go("postEdit", {postId: id});
		}, function (err) {
			console.log(err);
		});
	};

	var addChannel = function () {
		var user = $rootScope.user;
		if (!user) {
			return;
		}
		var channel = {
			userId: user._id,
			curators: [{
				userId: user._id,
				screenName: user.profile.screenName,
				name: user.profile.name,
				pictureUrl: user.profile.pictureUrl
			}],
			groups: [],
			members: []
		};
		$rootScope.Channels.insert(channel).remote.then(function (id) {
			$state.go("channelEdit", {channelId: id});
		}, function (err) {
			console.log(err);
		});
	};

	var noop = function () {};

	return {
		addPost: addPost,
		addChannel: addChannel,
		noop: noop
	};

});

angular.module("mnd-web.components.center", [])

.directive("mndCenter", function ($timeout) {
	return {
		restrict: "A",
		priority: 1000,
		compile: function () {
			return {
				post: function ($scope, $element) {
					$timeout(function () {
						var el = $element[0];
						var par = el.parentElement;
						var elWidth = parseInt(window.getComputedStyle(el).width, 10);
						var parWidth = par.offsetWidth;
						var margin = (parWidth - elWidth) / 2 - 50;
						el.style.marginLeft = margin + "px";
					}, 0)
				} 
			}
		}

	}
});
angular.module("mnd-web.components.check-mobile", [])

.factory("CheckMobileService", function () {
	return {
		isMobile: function () {
			var bodyEl = document.getElementsByTagName("body")[0];
			var bodyElWidth = parseInt(window.getComputedStyle(bodyEl).width, 10);
			var mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
			var mobileWidth = bodyElWidth < 767;
			return mobileUserAgent || mobileWidth;
		}
	}
});
angular.module("mnd-web.components.cig-image", [])

.directive("mndCigImage", function () {
	return {
		restrict: "EA",
		scope: {
			source: "=",
			size: "@"
		},
		link: function ($scope, $element){
			// Save the size as number
			var size = parseInt($scope.size, 10);
			// Get acceptable border sizes
			var borderSize = size / 20;
			if (borderSize < 1) borderSize = 1;
			if (borderSize > 6) borderSize = 6;
			// Add the required class to the external div
			$element.addClass("picture-circle-in-grey");
			var insertImage = function () {
				var img = new Image();
				img.addEventListener("load", function () {
					if ($scope.imageLoaded) return;
					$scope.imageLoaded = true;
					$element.empty();
					if (img.width >= img.height) {
						img.height = size;
					} else {
						img.width = size;
					}
					$element.append(img);
					var style = window.getComputedStyle(img);
					var top = ((parseFloat(style.height, 10) - size) / -2) - borderSize;
					if (!isNaN(top)) {
						img.style.top = top + "px";
					}
					var left = ((parseFloat(style.width, 10) - size) / -2) - borderSize;
					if (!isNaN(left)) {
						img.style.left = left + "px";
					}
				}, false);
				img.src = $scope.source;
			};
			$scope.$watch("source", function () {
				$scope.imageLoaded = false;
				insertImage();
			});
			$element.css({
				width: size + "px",
				height: size + "px",
				"border-width": borderSize + "px"
			});
		}
	};

});

angular.module("mnd-web.components.clear-selection", [])

.factory("ClearWindowSelectionService", function () {
	var clearWindowSelection = function () {
		if (window.getSelection) {
			if (window.getSelection().empty) {
				window.getSelection().empty();
			} else if (window.getSelection().removeAllRanges) {
				window.getSelection().removeAllRanges();
			}
		} else if (document.selection) {
			document.selection.empty();
		}
	};
	return {
		clear: clearWindowSelection
	};
});

angular.module("mnd-web.components.dashboard", [])

.controller("SidebarController", function ($scope, $state, AppMethods) {

	$scope.actions = AppMethods;

	// Get a personalised menu
	var getMenu = function () {
		var user = $scope.user;
		var items = [];
		menuConfig.items.forEach(function (item) {
			// Don't display the item if only avaliable
			// to signedIn users
			if (item.loginRequired && !user) {
				return;
			}
			// Don't display the item if it requires a role
			// and the user is not signed in or doesn't have
			// that role
			if (item.roles) {
				if (!user || !user.roles) {
					return;
				}
				var noneMatches = user.roles.reduce(function (pre, cur, idx, arr) {
					if (!pre) return pre;
					return item.roles.indexOf(arr[idx]) === -1;
				}, true);
				if (noneMatches) {
					return;
				}
			}
			// The above checks didn't fail. We can now add
			// the item
			items.push(item);
		});
		return {
			items: items
		};
	};

	var menuConfigQuery = $scope.Configurations.reactiveQuery({name: "menu"});
	var menuConfig = menuConfigQuery.result[0];
	// Make the menu reactive by listening to changes,
	// both in the configuration and the logged in user
	menuConfigQuery.on("change", function () {
		$scope.safeApply(function () {
			menuConfig = menuConfigQuery.result[0];
			$scope.menu = getMenu();
		});
	});
	$scope.$watch("user", function () {
		$scope.menu = getMenu();
	});

});

angular.module("mnd-web.components.menu-editor", [])

.directive("mndMenuEditor", function (AppMethods) {
	return {
		restrict: "EA",
		templateUrl: "components/menu-editor/menu-editor.html",
		scope: {
			items: "="
		},
		link: function ($scope) {
			$scope.availableActions = Object.keys(AppMethods);
			$scope.menu = {
				// Move functions
				moveUp: function (index, event) {
					event.stopPropagation();
					var item = $scope.items[index];
					$scope.items.splice(index, 1);
					$scope.items.splice(index - 1, 0, item);
				},
				moveDown: function (index, event) {
					event.stopPropagation();
					var item = $scope.items[index];
					$scope.items.splice(index, 1);
					$scope.items.splice(index + 1, 0, item);
				},
				moveSubitemUp: function (item, index, event) {
					event.stopPropagation();
					var subitem = item.items[index];
					item.items.splice(index, 1);
					item.items.splice(index - 1, 0, subitem);
				},
				moveSubitemDown: function (item, index, event) {
					event.stopPropagation();
					var subitem = item.items[index];
					item.items.splice(index, 1);
					item.items.splice(index + 1, 0, subitem);
				},
				// Add functions
				addItem: function () {
					$scope.items.push({
						title: "Your title here",
						type: "link"
					});
				},
				addSubitem: function (item) {
					item.items = item.items || [];
					item.items.push({
						title: "Your title here",
						type: "link"
					});
				},
				// Delete functions
				deleteItem: function (index) {
					$scope.items.splice(index, 1);
				},
				deleteSubitem: function (item, index) {
					item.items.splice(index, 1);
				}
			};
		}
	};
});

angular.module("mnd-web.components.mindmap", [])

.directive("mndMindMapRecursive", function (RecursionHelper) {
	return {
		restrict: "EA",
		replace: true,
		templateUrl: "components/mindmap/mindmaprecursive.html",
		scope: {
			map: "=",
			edit: "=?",
			child: "=?"
		},
		compile: function (element) {
			return RecursionHelper.compile(element, function ($scope, $element) {
				$scope.autodestroy = function () {
					if ($scope.child) {
						var parent = $scope.$parent.$parent.map.children;
						var index = parent.indexOf($scope.map);
						parent.splice(index, 1);
					}
				};
				$scope.addChild = function () {
					if (!$scope.map) $scope.map = {};
					if (!$scope.map.children) $scope.map.children = [];
					$scope.map.children.push({});
				};
			});
		}
	};
})

.directive("mndMindMap", function () {
	return {
		restrict: "EA",
		replace: true,
		templateUrl: "components/mindmap/mindmap.html",
		scope: {
			map: "=",
			edit: "=?",
			child: "=?"
		}
	}
})

angular.module("mnd-web.components.pomodoro", [])

.factory("PomodoroService", function ($rootScope) {

	var Pomodoros = $rootScope.Ceres.createCollection("pomodoros");

	var start = function (pomodoro) {
		return $rootScope.Ceres.call("startPomodoro", pomodoro._id);
	};

	var pause = function (pomodoro) {
		return $rootScope.Ceres.call("pausePomodoro", pomodoro._id);
	};

	var stop = function (pomodoro) {
		return $rootScope.Ceres.call("stopPomodoro", pomodoro._id);
	};

	var addParticipant = function (pomodoro, participantId) {
		return $rootScope.Ceres.call("addPomodoroParticipant", pomodoro._id, participantId);
	};

	var setDuration = function (pomodoro, duration) {
		return $rootScope.Ceres.call("setPomodoroDuration", pomodoro._id, duration);
	};

	var calculateElapsed = function (pomodoro) {
		return pomodoro.events.reduce(function (pre, cur, idx, arr) {
			if (idx % 2 === 1) {
				pre += arr[idx].time - arr[idx - 1].time;
				return pre;
			} else if (idx === (arr.length - 1)) {
				pre += Date.now() - arr[idx].time;
				return pre;
			} else {
				return pre;
			}
		}, 0);
	};
	var calculateRemaining = function (pomodoro) {
		var elapsed = calculateElapsed(pomodoro);
		var remaining = pomodoro.duration - elapsed;
		if (remaining < 1000) {
			remaining = 0;
		}
		return remaining;
	};

	return {
		start: start,
		pause: pause,
		stop: stop,
		addParticipant: addParticipant,
		setDuration: setDuration,
		calculateRemaining: calculateRemaining
	};
})

.directive("mndPomodoroTimer", function ($interval, PomodoroService) {
	return {
		restrict: "EA",
		templateUrl: "components/pomodoro/pomodoro-timer.html",
		replace: true,
		scope: {
			pomodoro: "=",
			size: "@?"
		},
		link: function ($scope, $element) {

			///////////
			// Setup //
			///////////
			
			var CW = parseInt($scope.size || "100", 10);
			var HCW = CW / 2;
			$scope.format = "mm:ss";

			var svg = $element.find("svg");
			var path = $element.find("path");
			var circle = $element.find("circle");
			var div = $element.find("div");

			$element.css({
				width: CW + "px",
				height: CW + "px"
			});

			svg.attr("width", CW);
			svg.attr("height", CW);
			svg.attr("viewbox", "0 0 " + CW + " " + CW);

			path.attr("transform", "translate(" + HCW + ", " + HCW + ")");

			circle.attr("r", HCW * 0.7);
			circle.attr("transform", "translate(" + HCW + ", " + HCW + ")");

			div.css({
				"height": CW + "px",
				"line-height": CW + "px",
				"font-size": CW * 0.20 + "px"
			});

			///////////////////////
			// Drawing functions //
			///////////////////////

			var drawCircle = function () {
				if ($scope.remaining === 0) {
					path.remove();
					circle.attr("r", HCW);
					return;
				}
				var angleInRadiants = (1 - $scope.remaining/$scope.pomodoro.duration) * 2 * Math.PI;
				var x = Math.sin(angleInRadiants) * HCW;
				var y = Math.cos(angleInRadiants) * HCW * -1;
				var widerThanPI = (angleInRadiants > Math.PI ) ? 1 : 0;
				var animation = "M 0 0 v -" + HCW + " A " + HCW + " " + HCW + " 1 " + widerThanPI + " 1 " + x + " " + y + " z";
				path.attr("d", animation);
			};

			var render = function () {
				$scope.remaining = PomodoroService.calculateRemaining($scope.pomodoro);
				drawCircle();
			};

			////////////////////
			// Initial render //
			////////////////////
			
			render();

			/////////////////
			// Timer setup //
			/////////////////

			var interval;
			$scope.$watch("pomodoro.status", function (status) {
				if (status === "running") {
					interval = $interval(function () {
						render();
						if ($scope.remaining === 0) {
							$interval.cancel(interval);
							PomodoroService.stop($scope.pomodoro);
						}
					}, 1000);
				} else if (status === "puased") {
					$interval.cancel(interval);
				} else if (status === "stopped") {
					$interval.cancel(interval);
					$scope.remaining = 0;
				}
			});
			// Clear the interval when the scope is destroyed
			$scope.$on("$destroy", function () {
				$interval.cancel(interval);
			});

		}
	};
})

.directive("mndPomodoroSummary", function ($interval, PomodoroService) {
	return {
		restrict: "EA",
		templateUrl: "components/pomodoro/pomodoro-summary.html",
		replace: true
	};
});

angular.module("mnd-web.components.user-input", [])

.filter("filterByNameAndScreenName", function() {
	return function (users, input) {
		var filteredUsers = [];
		var ire = new RegExp(input, "i");
		users.forEach(function (user) {
			if (
				user.profile &&
				(ire.test(user.profile.name) || ire.test(user.profile.screenName))
			) {
				filteredUsers.push(user);
			}
		});
		return filteredUsers;
	};
})

.directive("mndUserInput", function ($rootScope, $compile) {
	return {
		restrict: "A",
		terminal: true,
		priority: 1000,
		scope: {
			userModel: "="
		},
		controller: function ($scope) {
			var usersRQ = $rootScope.Users.reactiveQuery({});
			usersRQ.on("change", function () {
				$scope.users = usersRQ.result;
			});
			$scope.users = usersRQ.result;
		},
		compile: function (element, attrs) {
			element.attr("ng-model", "userModel");
			element.attr("typeahead", "user as user.profile.name for user in users | filterByNameAndScreenName : $viewValue");
			element.attr("typeahead-template-url", "components/user-input/user-input.html");
			element.removeAttr("mnd-user-input");
			element.removeAttr("data-mnd-user-input");
			return {
				pre: function ($scope, iElement, iAttrs, controller) {
				},
				post: function ($scope, iElement, iAttrs, controller) {  
					$compile(iElement)($scope);
				}
			};
		}
	};
});

angular.module("mnd-web.pages.admin", [])

.controller("AdminController", function ($scope, $interval, $upload) {

	// Configurations
	$scope.amazonS3Config = $scope.Configurations.reactiveQuery({name: "amazonS3"}).result[0];
	$scope.homeConfig = $scope.Configurations.reactiveQuery({name: "home"}).result[0];
	$scope.menuConfig = $scope.Configurations.reactiveQuery({name: "menu"}).result[0];

	///////////////////
	// Save function //
	///////////////////

	var menuConfigCache = angular.copy($scope.menuConfig);
	delete menuConfigCache._id;
	var homeConfigCache = angular.copy($scope.homeConfig);
	delete homeConfigCache._id;
	var amazonS3ConfigCache = angular.copy($scope.amazonS3Config);
	delete amazonS3ConfigCache._id;

	$scope.save = function () {

		// Menu configuration
		menuConfig = angular.copy($scope.menuConfig);
		delete menuConfig._id;
		// Only perform the update if there were modifications
		if (!angular.equals(menuConfig, menuConfigCache)) {
			menuConfigCache = menuConfig;
			$scope.Configurations.update($scope.menuConfig._id, menuConfig).remote.fail(function (err) {
				console.log(err);
			});
		}

		// Home configuration
		homeConfig = angular.copy($scope.homeConfig);
		delete homeConfig._id;
		// Only perform the update if there were modifications
		if (!angular.equals(homeConfig, homeConfigCache)) {
			homeConfigCache = homeConfig;
			$scope.Configurations.update($scope.homeConfig._id, homeConfig).remote.fail(function (err) {
				console.log(err);
			});
		}

		// AmazonS3 configuration
		var amazonS3Config = angular.copy($scope.amazonS3Config);
		delete amazonS3Config._id;
		// Only perform the update if there were modifications
		if (!angular.equals(amazonS3Config, amazonS3ConfigCache)) {
			amazonS3ConfigCache = amazonS3Config;
			$scope.Configurations.update($scope.amazonS3Config._id, amazonS3Config).remote.fail(function (err) {
				console.log(err);
			});
		}

	};

	var interval = $interval($scope.save, 1000);
	$scope.$on("$destroy", function () {
		$interval.cancel(interval);
	});

});

angular.module("mnd-web.pages.home", [])

.controller("HomeController", function ($scope, $sce, $state) {

	var homeConfig = $scope.Configurations.reactiveQuery({name: "home"}).result[0];
	$scope.sprinkleText = homeConfig.sprinkleText;
	$scope.banner = homeConfig.banner;
	$scope.payoff = homeConfig.payoff;

	$scope.login = function () {
		$scope.Ceres.loginWithTwitter().then(function () {
			$state.go("personalHome");
		});
	};

	//$scope.videoSource = "http://mnd-website.s3.amazonaws.com/Mnd-Alps.mp4";
	var videoSource = "http://mnd-website.s3.amazonaws.com/Mnd-Alps.mp4";
	$scope.videoSource = $sce.trustAsResourceUrl(videoSource);

	//video poster
	var videoPoster = "http://s3.amazonaws.com/mnd-website/vd-back.jpg";
	$scope.videoPoster = $sce.trustAsResourceUrl(videoPoster);

});

angular.module("mnd-web.pages.page", [])

.controller("PageController", function ($scope) {

});

angular.module("mnd-web.pages.personalHome", [])

.controller("PersonalHomeController", function ($scope) {

	$scope.isAdmin = function () {
		if ($scope.user && Array.isArray($scope.user.roles)) {
			return $scope.user.roles.indexOf("configure") !== -1;
		}
	};

});

angular.module("mnd-web.pages.profile", [])

.controller("ProfileController", function ($scope, $interval, $upload) {

	// AmazonS3Config
	var amazonS3Config = $scope.Configurations.reactiveQuery({name: "amazonS3"}).result[0];

	////////////////////
	// Profile object //
	////////////////////

	$scope.profile = $scope.user.profile || {};



	////////////////////
	// Medium editors //
	////////////////////

	var name = document.getElementById("profileNameEditor");
	name.innerHTML = $scope.profile.name || "";
	var nameEditorOptions = {
		placeholder: "Name",
		disableToolbar: true,
		forcePlainText: true,
		disableReturn: true
	};
	new MediumEditor(name, nameEditorOptions);

	var screenName = document.getElementById("profileScreenNameEditor");
	screenName.innerHTML = $scope.profile.screenName || "";
	var screenNameEditorOptions = {
		placeholder: "Screen Name",
		disableToolbar: true,
		forcePlainText: true,
		disableReturn: true
	};
	new MediumEditor(screenName, screenNameEditorOptions);

	var email = document.getElementById("profileEmailEditor");
	email.innerHTML = $scope.profile.email || "";
	var emailEditorOptions = {
		placeholder: "Email",
		disableToolbar: true,
		forcePlainText: true,
		disableReturn: true
	};
	new MediumEditor(email, emailEditorOptions);

	var facebook = document.getElementById("profileFacebookEditor");
	facebook.innerHTML = $scope.profile.facebookUrl || "";
	var facebookEditorOptions = {
		placeholder: "Facebook profile url",
		disableToolbar: true,
		forcePlainText: true,
		disableReturn: true
	};
	new MediumEditor(facebook, facebookEditorOptions);

	var twitter = document.getElementById("profileTwitterEditor");
	twitter.innerHTML = $scope.profile.twitterUrl || "";
	var twitterEditorOptions = {
		placeholder: "Twitter profile url",
		disableToolbar: true,
		forcePlainText: true,
		disableReturn: true
	};
	new MediumEditor(twitter, twitterEditorOptions);

	var linkedIn = document.getElementById("profileLinkedInEditor");
	linkedIn.innerHTML = $scope.profile.linkedInUrl || "";
	var linkedInEditorOptions = {
		placeholder: "LinkedIn profile url",
		disableToolbar: true,
		forcePlainText: true,
		disableReturn: true
	};
	new MediumEditor(linkedIn, linkedInEditorOptions);

	var github = document.getElementById("profileGithubEditor");
	github.innerHTML = $scope.profile.githubUrl || "";
	var githubEditorOptions = {
		placeholder: "Github profile url",
		disableToolbar: true,
		forcePlainText: true,
		disableReturn: true
	};
	new MediumEditor(github, githubEditorOptions);

	var motto = document.getElementById("profileMottoEditor");
	motto.innerHTML = $scope.profile.motto || "";
	var mottoEditorOptions = {
		placeholder: "Click to edit",
		disableToolbar: true,
		forcePlainText: true,
		disableReturn: true
	};
	new MediumEditor(motto, mottoEditorOptions);

	var bio = document.getElementById("profileBioEditor");
	bio.innerHTML = $scope.user.profile.bio || "";
	var bioEditorOptions = {
		placeholder: "Click to edit",
		buttonLabels: "fontawesome",
		buttons: [
			"bold",
			"italic",
			"anchor",
			"header1",
			"header2",
			"quote"
		]
	};
	new MediumEditor(bio, bioEditorOptions);



	//////////////////
	// Image upload //
	//////////////////

	// Bind click on the image icon to the click on the (hidden) input element
	$scope.clickFileInput = function () {
		document.querySelector("#profilePictureFileInput").click();
	};

	$scope.abortUpload = function () {
		$scope.uploadProgress = 0;
		$scope.isUploading = false;
		$scope.imageUpload.abort();
		delete $scope.imageUpload;
	};

	$scope.onFileSelect = function (files) {
		var file = files[0];
		if (!/image/g.test(file.type)) {
			alert("Devi caricare un'immagine.");
			return;
		}
		var randomPrefix = Math.round(Math.random() * 1E16);
		var fileName = randomPrefix + "__" + file.name;
		var uploadOptions = {
			url: amazonS3Config.postUrl,
			method: "POST",
			data: {
				"key": fileName,
				"acl": "public-read",
				"Content-Type": file.type
			},
			file: file
		};
		$scope.isUploading = true;
		$scope.imageUpload = $upload.upload(uploadOptions)
			.progress(function (evt) {
				$scope.uploadProgress = parseInt(100.0 * evt.loaded / evt.total);
			})
			.success(function (response) {
				$scope.uploadProgress = 100;
				$scope.isUploading = false;
				$scope.profile.pictureUrl = amazonS3Config.getUrl + fileName;
				$scope.save();
			});
	};



	///////////////////
	// Save function //
	///////////////////

	// Only update on change
	var profileCache = angular.copy($scope.profile);

	$scope.save = function () {
		// Update innerHTML-s
		$scope.profile.bio = bio.innerHTML;
		$scope.profile.name = name.innerHTML;
		$scope.profile.screenName = screenName.innerHTML;
		$scope.profile.email = email.innerHTML;
		$scope.profile.motto = motto.innerHTML;
		$scope.profile.facebookUrl = facebook.innerHTML;
		$scope.profile.twitterUrl = twitter.innerHTML;
		$scope.profile.linkedInUrl = linkedIn.innerHTML;
		$scope.profile.githubUrl = github.innerHTML;

		var profile = angular.copy($scope.profile);
		if (!angular.equals(profile, profileCache)) {
			profileCache = profile;
			$scope.Users.update($scope.user._id, {profile: profile}).remote.fail(function (err) {
				console.log(err);
			});
		}

	};
	var interval = $interval($scope.save, 2000);
	$scope.$on("$destroy", function () {
		$interval.cancel(interval);
	});



});

angular.module("mnd-web.pages.team", [])

.controller("TeamController", function ($scope) {

	var teamQuery = $scope.Users.reactiveQuery({mondoraTeamMember: true});
	teamQuery.on("change", function () {
		$scope.safeApply(function () {
			$scope.team = teamQuery.result;
		});
	});
	$scope.team = teamQuery.result;

	$scope.sendLinkedInProfile = function (url) {
		$scope.Ceres.call("sendLinkedInProfileUrl", url);
		$scope.linkSent = true;
	};

	$scope.checkLink = function (url) {
		return /linkedin\.com/.test(url);
	};

});

angular.module("mnd-web.pages.staticHome", [])

.controller("StaticHomeController", function ($scope, $sce) {

	$scope.sprinkleText = "Essere al passo con i tempi, concreti e con una stretta e profonda visione tecnologica: questo è il modo con il quale ci caratterizziamo";

	// Video
	var videoSource = "http://mnd-website.s3.amazonaws.com/Mnd-Alps.mp4";
	$scope.videoSource = $sce.trustAsResourceUrl(videoSource);

	// Video poster
	var videoPoster = "http://s3.amazonaws.com/mnd-website/vd-back.jpg";
	$scope.videoPoster = $sce.trustAsResourceUrl(videoPoster);

});

angular.module("mnd-web.pages.topic", [])

.controller("TopicController", function ($scope, topic) {
	$scope.topic = topic;
});

angular.module("mnd-web.pages.user", [])

.controller("UserController", function ($scope, $stateParams, posts) {

	/////////////////
	// User object //
	/////////////////

	$scope.user = $scope.Users.reactiveQuery({_id: $stateParams.userId}).result[0];
	$scope.posts = posts;

	$scope.isUser = function () {
		return $scope.$root.user._id === $scope.user._id;
	};

});

angular.module("mnd-web.pages.channel.edit", [])

.controller("ChannelEditController", function (
	$scope,
	$interval,
	$state,
	$stateParams,
	$upload,
	CheckMobileService
) {

	// AmazonS3Config
	var amazonS3Config = $scope.Configurations.reactiveQuery({name: "amazonS3"}).result[0];

	//////////////////////////////
	// Retrieve channel to edit //
	//////////////////////////////

	var id = $stateParams.channelId;
	$scope.channel = $scope.Channels.reactiveQuery({_id: id}).result[0];

	if (!$scope.channel) {
		$state.go("notFound");
		return;
	}

	/////////////////////////
	///// check mobile //////
	/////////////////////////

	$scope.isMobile = CheckMobileService.isMobile();

	/////////////////////////
	// Init medium editors //
	/////////////////////////

	var title = document.getElementById("channelTitleEditor");
	title.innerHTML = $scope.channel.title || "";
	var titleEditorOptions = {
		placeholder: "Titolo",
		disableToolbar: true,
		forcePlainText: true,
		disableReturn: true
	};
	new MediumEditor(title, titleEditorOptions);

	var subtitle = document.getElementById("channelSubtitleEditor");
	subtitle.innerHTML = $scope.channel.subtitle || "";
	var subtitleEditorOptions = {
		placeholder: "Sottotitolo",
		disableToolbar: true,
		forcePlainText: true,
		disableReturn: true
	};
	new MediumEditor(subtitle, subtitleEditorOptions);

	var body = document.getElementById("channelBodyEditor");
	body.innerHTML = $scope.channel.body || "";
	var bodyEditorOptions = {
		placeholder: "Corpo",
		buttonLabels: "fontawesome",
		buttons: [
			"bold",
			"italic",
			"anchor",
			"header1",
			"header2",
			"quote"
		]
	};
	new MediumEditor(body, bodyEditorOptions);

	/////////////////////////////////////
	// Channel publishing and deleting //
	/////////////////////////////////////

	$scope.toggleDelete = function () {
		$scope.showDelete = !$scope.showDelete;
		var body = document.querySelector("body");
		angular.element(body).toggleClass("modal-open");
	};
	$scope.deleteChannel = function () {
		$scope.Channels.remove(id).remote.then(function () {
			$state.go("home");
		}, function () {
			alert("An error occurred.");
		});
	};
	$scope.isOwner = function () {
		return $scope.user && $scope.channel.userId === $scope.user._id;
	};

	//////////////////
	// Image upload //
	//////////////////

	// Bind click to click on the (hidden) input element
	$scope.clickFileInput = function (target) {
		document.getElementById(target).click();
	};

	$scope.isUploading = {};
	$scope.uploadProgress = {};
	var imageUpload = {};
	var afterUpload = {};
	var beforeUpload = {};

	$scope.abortUpload = function (target) {
		$scope.uploadProgress[target] = 0;
		$scope.isUploading[target] = false;
		imageUpload[target].abort();
		delete imageUpload[target];
	};

	$scope.onFileSelect = function (files, target) {
		var file = files[0];
		if (!/image/g.test(file.type)) {
			alert("Devi caricare un'immagine.");
			return;
		}
		var randomPrefix = Math.round(Math.random() * 1E16);
		var fileName = randomPrefix + "__" + file.name;
		var uploadOptions = {
			url: amazonS3Config.channelUrl,
			method: "POST",
			data: {
				"key": fileName,
				"acl": "public-read",
				"Content-Type": file.type
			},
			file: file
		};
		var baseUrl = amazonS3Config.getUrl;

		beforeUpload[target]();
		$scope.uploadProgress[target] = 0;
		$scope.isUploading[target] = true;
		imageUpload[target] = $upload.upload(uploadOptions)
			.progress(function (evt) {
				$scope.uploadProgress[target] = parseInt(100.0 * evt.loaded / evt.total);
			})
			.success(function (response) {
				$scope.uploadProgress[target] = 100;
				$scope.isUploading[target] = false;
				afterUpload[target](baseUrl + fileName);
			});
	};

	/////////////////
	// Main image //
	/////////////////

	$scope.mainImageIsDisplayed = function () {
		if (!$scope.channel) return;
		return $scope.channel.mainImageUrl !== undefined;
	};

	beforeUpload.mainImage = function () {};

	afterUpload.mainImage = function (url) {
		$scope.channel.mainImageUrl = url;
	}; 

	///////////////////
	// Save function //
	///////////////////

	// Only update on change
	var channelCache = {
		title: $scope.channel.title,
		subtitle: $scope.channel.subtitle,
		body: $scope.channel.body,
		mainImageUrl: $scope.channel.mainImageUrl
	};

	$scope.save = function () {
		if ($scope.dontSave) {
			return;
		}
		// Update innerHTML-s
		$scope.channel.title = title.innerHTML;
		$scope.channel.subtitle = subtitle.innerHTML;
		$scope.channel.body = body.innerHTML;

		var channel = {
			title: $scope.channel.title,
			subtitle: $scope.channel.subtitle,
			body: $scope.channel.body,
			mainImageUrl: $scope.channel.mainImageUrl
		};
		if (!angular.equals(channel, channelCache)) {
			channelCache = channel;
			$scope.Channels.update(id, channel).remote.fail(function (err) {
				console.log(err);
			});
		}
	};
	var interval = $interval($scope.save, 2500);
	$scope.$on("$destroy", function () {
		$interval.cancel(interval);
	});

});

angular.module("mnd-web.pages.channel.view", [])

.controller("ChannelViewController", function () {

});

angular.module("mnd-web.pages.pomodoro.list", [])

.controller("PomodoroListController", function ($scope, $interval) {

	var POMODORO_DEFAULT_DURATION = 25 * 60 * 1000;

	var user = $scope.user;

	var Pomodoros = $scope.Ceres.createCollection("pomodoros");

	$scope.addPomodoro = function () {
		var pomodoro = {
			userId: user._id,
			participants: [{
				userId: user._id,
				screenName: user.profile.screenName,
				name: user.profile.name,
				pictureUrl: user.profile.pictureUrl
			}],
			events: [],
			status: "paused",
			duration: POMODORO_DEFAULT_DURATION
		};
		Pomodoros.insert(pomodoro).remote.fail(function (err) {
			console.log(err);
		});
	};

	var pomodorosRQ = Pomodoros.reactiveQuery({});
	pomodorosRQ.on("change", function () {
		$scope.safeApply(function () {
			$scope.pomodoros = pomodorosRQ.result;
		});
	});
	$scope.pomodoros = pomodorosRQ.result;

});

angular.module("mnd-web.pages.pomodoro.view", [])

.controller("PomodoroViewController", function ($scope, $stateParams, PomodoroService) {
	var Pomodoros = $scope.Ceres.createCollection("pomodoros");
	var pomodoroRQ = Pomodoros.reactiveQuery({_id: $stateParams.pomodoroId});
	pomodoroRQ.on("change", function () {
		$scope.safeApply(function () {
			$scope.pomodoro = pomodoroRQ.result[0];
		});
	});
	$scope.pomodoro = pomodoroRQ.result[0];
	$scope.addParticipant = function () {
		PomodoroService.addParticipant($scope.pomodoro, $scope.participant._id);
		$scope.participant = "";
	};
	$scope.start = function () {
		PomodoroService.start($scope.pomodoro);
	};
	$scope.pause = function () {
		PomodoroService.pause($scope.pomodoro);
	};
	$scope.stop = function () {
		PomodoroService.stop($scope.pomodoro);
	};
	var FIVE_MINUTES = 1 * 15 * 1000;
	$scope.plusFiveMinutes = function () {
		var newDuration = $scope.pomodoro.duration + FIVE_MINUTES;
		PomodoroService.setDuration($scope.pomodoro, newDuration);
	};
	$scope.minusFiveMinutes = function () {
		if (PomodoroService.calculateRemaining($scope.pomodoro) < FIVE_MINUTES) {
			return;
		}
		var newDuration = $scope.pomodoro.duration - FIVE_MINUTES;
		PomodoroService.setDuration($scope.pomodoro, newDuration);
	};
});

angular.module("mnd-web.pages.post.edit", [])

.controller("PostEditController", function (
	$scope,
	$interval,
	$state,
	$stateParams,
	$templateCache,
	$compile,
	$upload,
	CheckMobileService,
	ClearWindowSelectionService
) {

	// AmazonS3Config
	var amazonS3Config = $scope.Configurations.reactiveQuery({name: "amazonS3"}).result[0];

	///////////////////////////
	// Retrieve post to edit //
	///////////////////////////

	var id = $stateParams.postId;
	$scope.post = $scope.Posts.reactiveQuery({_id: id}).result[0];

	if (!$scope.post) {
		$state.go("notFound");
		return;
	}

	/////////////////////////
	///// check mobile //////
	/////////////////////////

	$scope.isMobile = CheckMobileService.isMobile();

	/////////////////////////
	// Init medium editors //
	/////////////////////////

	var title = document.getElementById("postTitleEditor");
	title.innerHTML = $scope.post.title || "";
	var titleEditorOptions = {
		placeholder: "Titolo",
		disableToolbar: true,
		forcePlainText: true,
		disableReturn: true
	};
	new MediumEditor(title, titleEditorOptions);

	var subtitle = document.getElementById("postSubtitleEditor");
	subtitle.innerHTML = $scope.post.subtitle || "";
	var subtitleEditorOptions = {
		placeholder: "Sottotitolo",
		disableToolbar: true,
		forcePlainText: true,
		disableReturn: true
	};
	new MediumEditor(subtitle, subtitleEditorOptions);

	var body = document.getElementById("postBodyEditor");
	body.innerHTML = $scope.post.body || "";
	var bodyEditorOptions = {
		placeholder: "Corpo",
		buttonLabels: "fontawesome",
		buttons: [
			"bold",
			"italic",
			"anchor",
			"header1",
			"header2",
			"quote"
		]
	};
	new MediumEditor(body, bodyEditorOptions);

	//////////////////////////////////
	// Post publishing and deleting //
	//////////////////////////////////

	$scope.toggleDelete = function () {
		$scope.showDelete = !$scope.showDelete;
		var body = document.querySelector("body");
		angular.element(body).toggleClass("modal-open");
	};
	$scope.deletePost = function () {
		$scope.Posts.remove(id).remote.then(function () {
			$state.go("home");
		}, function () {
			alert("An error occurred.");
		});
	};
	$scope.publishPost = function () {
		$scope.post.published = true;
		$scope.save();
	};
	$scope.unpublishPost = function () {
		$scope.post.published = false;
		$scope.save();
	};
	$scope.isOwner = function () {
		return $scope.user && $scope.post.userId === $scope.user._id;
	};

	//////////////////
	// Image upload //
	//////////////////

	// Bind click to click on the (hidden) input element
	$scope.clickFileInput = function (target) {
		document.getElementById(target).click();
	};

	$scope.isUploading = {};
	$scope.uploadProgress = {};
	var imageUpload = {};
	var afterUpload = {};
	var beforeUpload = {};

	$scope.abortUpload = function (target) {
		$scope.uploadProgress[target] = 0;
		$scope.isUploading[target] = false;
		imageUpload[target].abort();
		delete imageUpload[target];
	};

	$scope.onFileSelect = function (files, target) {
		var file = files[0];
		if (!/image/g.test(file.type)) {
			alert("Devi caricare un'immagine.");
			return;
		}
		var randomPrefix = Math.round(Math.random() * 1E16);
		var fileName = randomPrefix + "__" + file.name;
		var uploadOptions = {
			url: amazonS3Config.postUrl,
			method: "POST",
			data: {
				"key": fileName,
				"acl": "public-read",
				"Content-Type": file.type
			},
			file: file
		};
		var baseUrl = amazonS3Config.getUrl;

		beforeUpload[target]();
		$scope.uploadProgress[target] = 0;
		$scope.isUploading[target] = true;
		imageUpload[target] = $upload.upload(uploadOptions)
			.progress(function (evt) {
				$scope.uploadProgress[target] = parseInt(100.0 * evt.loaded / evt.total);
			})
			.success(function (response) {
				$scope.uploadProgress[target] = 100;
				$scope.isUploading[target] = false;
				afterUpload[target](baseUrl + fileName);
			});
	};

	/////////////////
	// Title image //
	/////////////////

	$scope.titleImageIsDisplayed = function () {
		if (!$scope.post) return;
		return $scope.post.titleImageUrl !== undefined;
	};

	beforeUpload.titleImage = function () {};

	afterUpload.titleImage = function (url) {
		$scope.post.titleImageUrl = url;
	}; 

	////////////////
	// Body image //
	////////////////

	var rightClickToolbar = document.getElementById("rightClickToolbar");
	var imageTargetParagraph;
	var imagePositioningToolbar = document.getElementById("imagePositioningToolbar");
	var imageTarget;
	var progressbarTemplate = $templateCache.get("pages/post/edit/progressbar.html");
	var progressbar;
	var imageTemplate = $templateCache.get("pages/post/edit/bodyImage.html");

	beforeUpload.bodyImage = function () {
		$scope.dontSave = true;
		progressbar = $compile(progressbarTemplate)($scope);
		imageTargetParagraph.after(progressbar);
	};

	afterUpload.bodyImage = function (url) {
		progressbar.remove();
		$scope.dontSave = false;
		var scope = $scope.$new();
		scope.url = url;
		var image = $compile(imageTemplate)(scope);
		imageTargetParagraph.after(image);
	};

	body.addEventListener("contextmenu", function (e) {
		if (e.toElement.tagName === "IMG") return;
		imageTargetParagraph = angular.element(e.toElement);
		e.preventDefault();
		ClearWindowSelectionService.clear();
		rightClickToolbar.style.display = "block";
		var computedStyle = window.getComputedStyle(rightClickToolbar);
		var width = parseInt(computedStyle.width, 10);
		var height = parseInt(computedStyle.height, 10);
		rightClickToolbar.style.top = (e.layerY - (height + 20)) + "px";
		rightClickToolbar.style.left = (e.layerX - width/2) + "px";
		var listener = function () {
			rightClickToolbar.style.display = "none";
			document.removeEventListener("click", listener);
		};
		document.addEventListener("click", listener);
	});

	body.addEventListener("click", function (e) {
		if (e.toElement.tagName !== "IMG") return;
		imageTarget = angular.element(e.toElement);
		imagePositioningToolbar.style.display = "block";
		var computedStyle = window.getComputedStyle(imagePositioningToolbar);
		var width = parseInt(computedStyle.width, 10);
		var height = parseInt(computedStyle.height, 10);
		window.a = imageTarget;
		imagePositioningToolbar.style.top = (imageTarget[0].offsetTop - (height + 20)) + "px";
		imagePositioningToolbar.style.left = (imageTarget[0].offsetLeft + imageTarget[0].clientWidth/2 - width/2) + "px";
		var listener = function (e) {
			if (e.toElement.tagName === "IMG") return;
			imagePositioningToolbar.style.display = "none";
			document.removeEventListener("click", listener);
		};
		setTimeout(function () {
			document.addEventListener("click", listener);
		}, 100);
	});

	$scope.moveImage = {
		left: function () {
			imageTarget.removeClass("bodyImageLeft bodyImageCenter bodyImageRight");
			imageTarget.addClass("bodyImageLeft");
		},
		center: function () {
			imageTarget.removeClass("bodyImageLeft bodyImageCenter bodyImageRight");
			imageTarget.addClass("bodyImageCenter");
		},
		right: function () {
			imageTarget.removeClass("bodyImageLeft bodyImageCenter bodyImageRight");
			imageTarget.addClass("bodyImageRight");
		}
	};

	$scope.removeImage = function () {
		imageTarget.remove();
	};

	///////////////////
	// Save function //
	///////////////////

	var processMap = function (map, isChild) {
		if (isChild) {
			if (!map.href || map.href.slice(0, 10) === "/#!/topic/") {
				map.href = "/#!/topic/" + map.text;
			} else if (map.href.slice(0, 7) !== "http://") {
				map.href = "http://" + map.href;

			}
		}
		if (!map.children) return;
		map.children.map(function (child) {
			processMap(child, true);
		});
	};

	// Only update on change
	var postCache = angular.copy($scope.post);
	delete postCache._id;
	delete postCache.userId;
	delete postCache.authors;

	$scope.save = function () {
		if ($scope.dontSave) {
			return;
		}
		// Update innerHTML-s
		$scope.post.title = title.innerHTML;
		$scope.post.subtitle = subtitle.innerHTML;
		$scope.post.body = body.innerHTML;
		processMap($scope.post.map);

		// Strip properties which can't be updated
		var post = angular.copy($scope.post);
		delete post._id;
		delete post.userId;
		delete post.authors;
		if (!angular.equals(post, postCache)) {
			postCache = post;
			$scope.Posts.update(id, post).remote.fail(function (err) {
				console.log(err);
			});
		}
	};
	var interval = $interval($scope.save, 2500);
	$scope.$on("$destroy", function () {
		$interval.cancel(interval);
	});

});

angular.module("mnd-web.pages.post.list", [])

.controller("PostListController", function ($scope) {
	$scope.posts = $scope.Posts.reactiveQuery({});
});

angular.module("mnd-web.pages.post.view", [])

.factory("firstLevelHtmlParser", function () {
	var parse = function (html) {
		var div = document.createElement("div");
		div.innerHTML = html;
		var children = Array.prototype.map.call(div.children, function (node) {
			return node.outerHTML;
		});
		return children;
	};
	return {
		parse: parse
	};
})

.directive("readonlyEditor", function (ClearWindowSelectionService) {

	var Tweet = function (screenName) {
		this.button = document.createElement("button");
		this.button.className = "medium-editor-action";
		this.button.innerHTML = "<i class=\"fa fa-twitter\"></i>";
		this.button.onclick = function () {
			var tweetBaseUrl = "https://twitter.com/intent/tweet?text=";
			var tweetText = "\"" + window.getSelection().toString() + "\" - @";
			tweetText += screenName + " " + window.location.href;
			var url = tweetBaseUrl + tweetText;
			var popup = window.open(url, "popup", "height=420,width=550");
			ClearWindowSelectionService.clear();
			if (!popup.focus) {
				popup.focus();
			}
		};
	};
	Tweet.prototype.constructor = Tweet;
	Tweet.prototype.getButton = function() {
		return this.button;
	};
	var Highlight = function ($scope) {
		this.button = document.createElement("button");
		this.button.className = "medium-editor-action";
		this.button.innerHTML = "<i class=\"fa fa-comment\"></i>";
		this.button.onclick = function () {
			$scope.safeApply(function () {
				$scope.closeCommentBar();
				$scope.openCommentBarAt($scope.$index);
				$scope.comment.anchor = window.getSelection().toString();
				ClearWindowSelectionService.clear();
			});
		};
	};
	Highlight.prototype.constructor = Highlight;
	Highlight.prototype.getButton = function() {
		return this.button;
	};
	return {
		link: function ($scope, $element) {
			var readonlyEditorOptions = {
				placeholder: "",
				disableEditing: true,
				buttons: ["tweet", "highlight"],
				extensions: {
					tweet: new Tweet($scope.post.authors[0].screenName),
					highlight: new Highlight($scope)
				}
			};
			$element[0].innerHTML = $scope.child;
			new MediumEditor($element[0], readonlyEditorOptions);
		}
	};
})

.filter("filterCommentsByParagraph", function () {
	return function (comments, paragraph) {
		var filteredComments = [];
		comments.forEach(function (comment) {
			if (comment.paragraph === paragraph) {
				filteredComments.push(comment);
			}
		});
		return filteredComments;
	};
})

.filter("filterCommentsByUser", function () {
	return function (comments, user, isAuthor) {
		var userId;
		if (user) userId = user._id;
		var filteredComments = [];
		comments.forEach(function (comment) {
			// If the user is an author, display it
			// If the comment belongs to the current user, display it
			// If the comment is approved, display it
			if (isAuthor || comment.approved || comment.userId === userId) {
				filteredComments.push(comment);
			}
		});
		return filteredComments;
	};
})

.controller("PostViewController", function (
	$scope,
	$timeout,
	$stateParams,
	$state,
	$filter,
	firstLevelHtmlParser,
	CheckMobileService
) {

	///////////////////////////
	// Retrieve post to edit //
	///////////////////////////

	var id = $stateParams.postId;
	var postQuery = $scope.Posts.reactiveQuery({_id: id});
	postQuery.on("change", function () {
		$scope.safeApply(function () {
			$scope.post = postQuery.result[0];
		});
	});
	$scope.post = postQuery.result[0];

	if (!$scope.post) {
		$state.go("notFound");
		return;
	}

	/////////////////////////
	///// check mobile //////
	/////////////////////////

	$scope.isMobile = CheckMobileService.isMobile();

	////////////////////////////////////////////////////
	// Parse post.body into first generation children //
	////////////////////////////////////////////////////

	$scope.bodyChildren = function () {
		if (!$scope.post) return;
		return firstLevelHtmlParser.parse($scope.post.body);
	};

	///////////////////////////////////////
	// Reading time placeholder variable //
	///////////////////////////////////////

	$scope.estimateReadingTime = 0;

	////////////////////////////////////////////////
	// Set various properties that shape the html //
	////////////////////////////////////////////////

	$scope.titleImageIsDisplayed = function () {
		if (!$scope.post) return;
		return $scope.post.titleImageUrl !== undefined;
	};

	$scope.isAuthor = function () {
		if (!$scope.post) return;
		var isAuthor = false;
		if ($scope.user) {
			$scope.post.authors.forEach(function (author) {
				if (author.userId === $scope.user._id) {
					isAuthor = true;
				}
			});
		}
		return isAuthor;
	};

	$scope.commentBarStatus = [];

	$scope.closeCommentBar = function () {
		$scope.commentBarIsOpen = false;
		$scope.commentBarStatus = [];
	};

	$scope.openCommentBarAt = function (index, event) {
		$scope.commentBarIsOpen = true;
		$scope.commentBarStatus[index] = true;
	};

	$scope.commentBarIsOpenAt = function (index) {
		return $scope.commentBarStatus[index];
	};

	$scope.ownsComment = function (comment) {
		if ($scope.user) {
			return comment.userId === $scope.user._id;
		}
	};

	$scope.paragraphHasComments = function (index) {
		if (!$scope.post) return;
		var paragraphComments = $filter("filterCommentsByParagraph")($scope.post.comments, index);
		if ($scope.isAuthor()) {
			return paragraphComments.length > 0;
		}
		var approvedComments = $filter("filterCommentsByUser")(paragraphComments, $scope.user);
		return approvedComments.length > 0;
	};

	$scope.paragraphCommentsLength = function (index) {
		if (!$scope.post) return;
		var paragraphComments = $filter("filterCommentsByParagraph")($scope.post.comments, index);
		if ($scope.isAuthor()) {
			return paragraphComments.length;
		}
		var approvedComments = $filter("filterCommentsByUser")(paragraphComments, $scope.user);
		return approvedComments.length;
	};

	/////////////////////////////////////
	// Comment model related functions //
	/////////////////////////////////////

	$scope.comment = {};

	$scope.deleteComment = function (comment) {
		var promises = $scope.Ceres.call("deleteCommentFromPost", id, comment._id);
		promises.updated.then(function () {
			$scope.post = $scope.Posts.db.get(id);
			$scope.$apply();
		});
	};

	$scope.publishComment = function (comment) {
		$scope.Ceres.call("publishCommentOfPost", id, comment._id);
	};

	$scope.saveCommentAt = function (index) {
		$scope.comment.paragraph = index;
		$scope.Ceres.call("addCommentToPost", id, $scope.comment);
		$scope.comment.text = "";
	};

	///////////////////////////////
	// Comment text highlighting //
	///////////////////////////////

	$scope.setHighlight = function (comment) {
		var p = document.querySelectorAll(".first-level-html-container .simplebox")[comment.paragraph];
		var html = p.innerHTML;
		var highlighted = "<span class=\"post-view-highlight\">" + comment.anchor + "</span>";
		html = html.replace(comment.anchor, highlighted);
		p.innerHTML = html;
	};

	$scope.clearHighlight = function (comment) {
		var p = document.querySelectorAll(".first-level-html-container .simplebox")[comment.paragraph];
		var html = p.innerHTML;
		var highlighted = "<span class=\"post-view-highlight\">" + comment.anchor + "</span>";
		html = html.replace(highlighted, comment.anchor);
		p.innerHTML = html;
	};

});
