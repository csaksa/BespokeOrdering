
	probespokeApp.controller('InstallCtrl',
							['$rootScope', '$scope', '$log', '$route', '$routeParams', '$location', '$translate', '$uibModal',
							function ($rootScope, $scope, $log, $route, $routeParams, $location, $translate, $uibModal) {

		$rootScope.menuShow = false;
		$rootScope.orderCartShow = false;
		$rootScope.h1 = '';

		/*
		 * Init
		 */
		var init = function () {



		};

		$scope.installSubmitProductKey = function() {

			console.log('');
			console.log('FN installSubmitProductKey > start');

			console.log($scope.product_key);

		}

		init();

	}]);
