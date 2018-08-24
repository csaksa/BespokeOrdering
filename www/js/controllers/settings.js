
	probespokeApp.controller('SettingsCtrl', 
							['$rootScope', '$scope', '$log', '$route', '$routeParams', '$location', '$translate', '$uibModal', 
							function ($rootScope, $scope, $log, $route, $routeParams, $location, $translate, $uibModal) {

		$rootScope.orderCartShow = false;
		$rootScope.h1 = $translate.instant('i18n_settings_pagetitle');

		/*
		 * Init
		 */
		var init = function () {

			$scope.settingsLoadProducts();
			$scope.db_displaytables();

			// Load current settings
			db.transaction(function(tx) {
				var sql_settings = "SELECT * FROM config";
				tx.executeSql(
					sql_settings, 
					[], 
					function(tx, results){

						var len = results.rows.length;
						var settings = [];

						for (var i=0; i<len; i++) {
							var setting = results.rows.item(i);
							if ( setting.value2 != null && setting.value != '' )
								settings[setting.name] = setting.value2;
							else
								settings[setting.name] = setting.value;
						}
						$scope.settings_appversion_model = settings['app_version'];
						$scope.settings_databaseversion_model = settings['database_version'];
						$scope.settings_storagemethod_model = db_storagemethod;
						$scope.settings_productkey_model = settings['product_key'];
						$scope.settings_unitmeasurements_model = settings['unit_measurements'];
						$scope.settings_unitheight_model = settings['unit_height'];
						$scope.settings_unitweight_model = settings['unit_weight'];
						$scope.settings_measurementsallowances_model = settings['measurements_allowances'];
						$scope.settings_applanguage_model = settings['app_language'];
						$scope.settings_currency_model = settings['currency'];
						$scope.settings_theme_model = settings['theme'];
						$scope.settings_dev_mode_model = settings['dev_mode'];
						$scope.settings_supplier_gateway_model = settings['supplier_gateway'];
						$scope.settings_reseller_gateway_model = settings['reseller_gateway'];

						$scope.settings_company_id_model = settings['company_id'];
						$scope.settings_company_name_model = settings['company_name'];
						$scope.settings_seller_id_model = settings['seller_id'];
						$scope.settings_seller_fullname_model = settings['seller_fullname'];

						if (settings['UI_custom_logo'] != '')
							$scope.settings_UI_custom_logo = settings['UI_custom_logo'];
						else
							$scope.settings_UI_custom_logo = 'img/settings/blank.png';//'themes/' + $scope.settings_theme_model + '/logo.png';//

						if (settings['UI_custom_background'] != '')
							$scope.settings_UI_custom_background = settings['UI_custom_background'];
						else
							$scope.settings_UI_custom_background = 'img/settings/blank.png';//'themes/' + $scope.settings_theme_model + '/background.jpg';

						//console.log(settings['UI_custom_background']);

						$scope.$apply();

					},
					tx_error
				);

			});
		};


		/*
		 * Load Products
		 */
		$scope.settingsLoadProducts = function() {

			console.log('');
			console.log('FN settingsLoadProducts > start');

			db.transaction(function(tx) {

				var sql_get_products = "SELECT * FROM products WHERE active = 1";
				tx.executeSql(
					sql_get_products, 
					[], 
					function(tx, results) {

						console.log('FN settingsLoadProducts > DB > '+ sql_get_products);

						$scope.products = [];

						for (var i=0; i<results.rows.length; i++) {

							var product = results.rows.item(i);

							product['name'] = $scope.i18n_from_db(product);

							if ( results.rows.item(i).user_active == 1 )
								product['user_active_model'] = true;
							else
								product['user_active_model'] = false;

							$scope.products.push(product);
							//$scope.products[ results.rows.item(i).id ] = product;

						}
						$scope.$apply();
						console.log('FN settingsLoadProducts > '+ results.rows.length +' products loaded');

					},
					tx_error
				);

			});

		};


		/*
		 * 
		 */
		$scope.settingsProductsToggle = function( product_id, user_active_model) {

			var user_active = 0;
			if ( user_active_model == true ) {
				user_active = 1;
			}
			$scope.dbSaveField('products', 'id', product_id, 'user_active', user_active, true);

		};

		init();

	}]);