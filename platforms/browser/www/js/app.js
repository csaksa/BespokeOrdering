
// jQuery
	jQuery.noConflict();


// Init vars
	var app_version; // = '0.6.6'
	var db;
	var db_storagemethod;
	var settings = [];
	var db_current_version = 5;
	var db_installed_version = 0;
	//var app_language = 'en_US';
	var pictureSource;   // picture source
	var destinationType; // sets the format of returned value


// Wait for device API libraries to load
	function onLoad() {
		document.addEventListener("deviceready", onDeviceReady, false);
	}


// Catch back event
	function backKeyDown(evt) {
		console.log('Backkkkkkkkkkkkkkkkkkkkkk');
		evt.preventDefault();
		evt.stopPropagation();
	}


// Try get var
	function tryReadVar(o, default_text) {

		var my_var;

		if (o == undefined)
			my_var = default_text;
		else
			my_var = o;

		return my_var;

	}

// onDeviceReady : install/update database & boostrap angular
	function onDeviceReady() {

		console.log('');
		console.log('Device ready');

		// Disable back button
		document.addEventListener("backbutton", backKeyDown, true);

		pictureSource = navigator.camera.PictureSourceType;
		destinationType = navigator.camera.DestinationType;

		app_version = '';

		// DB > Open database
		if (window.sqlitePlugin == undefined) {
			db = window.openDatabase("probespoke", "1.0", "Pro Bespoke", 200000);
			db_storagemethod = 'Native storage';
			console.log('');
			console.log("DB > Database opened (native)");
		} else {
			db = window.sqlitePlugin.openDatabase({name: "probespoke.db", location: 0, androidDatabaseImplementation: 2, androidLockWorkaround: 1}); // location: 2
			db_storagemethod = 'Plugin storage';
			console.log('');
			console.log("DB > Database opened (plugin)");
		}

		// Check if DB installed and if yes get DB version
		// then execute setup or update
		//var db_do_setup = false;
		db.transaction(function(tx) {

/*

DO NOT UNCOMMENT THIS LINES !!!!!!!!!!!!!!!!

tx.executeSql('DROP TABLE IF EXISTS config', [], tx_result, tx_error);
tx.executeSql('DROP TABLE IF EXISTS products', [], tx_result, tx_error);
tx.executeSql('DROP TABLE IF EXISTS products_pages', [], tx_result, tx_error);
tx.executeSql('DROP TABLE IF EXISTS products_options', [], tx_result, tx_error);
tx.executeSql('DROP TABLE IF EXISTS products_options_values', [], tx_result, tx_error);
tx.executeSql('DROP TABLE IF EXISTS orders', [], tx_result, tx_error);
tx.executeSql('DROP TABLE IF EXISTS orders_lines', [], tx_result, tx_error);
tx.executeSql('DROP TABLE IF EXISTS clients', [], tx_result, tx_error);
tx.executeSql('DROP TABLE IF EXISTS measurements', [], tx_result, tx_error);

tx.executeSql("UPDATE config SET value = '0.5.3' WHERE name = 'database_version'");
*/

			tx.executeSql(
				"SELECT * FROM sqlite_master WHERE type = 'table' AND name = 'config'",
				[],
				function(tx, results) {

					var len = results.rows.length;

					if (len == 0) {
						//db_do_setup = true;
						db_installed_version = 0;
						console.log("DB > Database not installed");
					} else {
						console.log("DB > Database already installed");
						tx.executeSql(
							"SELECT value FROM config WHERE name = 'database_version'",
							[],
							function(tx, results) {
								db_installed_version = parseInt(results.rows.item(0).value);
								if (db_installed_version < 1) // Hack to change old db versionning number (0.5.x to 3)
									db_installed_version = 1;
								console.log('DB > Database Version: ' + db_installed_version);
							},
							tx_error
						);
					}
				},
				tx_error
			);

		},
		tx_error,
		function(){

			// If database require update
			if (db_installed_version < db_current_version)
			{

				console.log("DB > Database require update " + db_installed_version + " to " + db_current_version);
				updateDatabase((db_installed_version+1), db_current_version);

			}
			else
				boostrapAngular();

		});
	}


	/*
	 * Call this function to start Angular
	 */
	function boostrapAngular() {

		console.log('');
		console.log("ANGULAR > Call angular boostrap.");

		angular.bootstrap(document, ['probespokeApp']);

		console.log("ANGULAR > App boostraped.");

	}


	/*
	 * Recursive function to install/update the database from installed version (start) till the current version (end)
	 */
	function updateDatabase(start, end) {

		var filename = 'install/' + start + '.sql';
		var data;
		var xhr = new XMLHttpRequest();
		xhr.open("GET", filename, true);
		xhr.onreadystatechange = function () {

			//console.log("DB > load " + filename);

			var done = 4, ok = 200;
			if (xhr.readyState === done && xhr.status === ok) {

				console.log("DB > " + filename + " loaded");

				db.transaction(function(tx) {

					var lines = xhr.responseText.split('\n');
					for(var line = 0; line < lines.length; line++){

						lines[line] = lines[line].replace(/(\r\n|\n|\r)/gm, "");
						lines[line] = lines[line].replace(/(\t)/gm, " ");
						lines[line] = lines[line].trim();

						if ( lines[line].substr(0, 2) != '--' && lines[line] != '') {

							sql = lines[line];
							tx.executeSql(sql);
							//console.log(sql);

						}
					}

				},
				tx_error,
				function(){

					// After executing SQL request, continue update or boostrap
					if (start < end)
						updateDatabase((start+1), end);
					else
						boostrapAngular();

				});
			}
			/*else {
				console.log("DB > " + filename + " fail");
			}*/
		};
		xhr.send(null);
	}


	/*
	 *
	 */
	var probespokeApp = angular.module('probespokeApp', ['ui.bootstrap', 'ngRoute', 'pascalprecht.translate', 'ngAside', 'ngCart', 'ngDialog'])

								.config(function ($routeProvider) {
									$routeProvider
										.when('/', {
											controller: 'MainCtrl',
											templateUrl: 'partials/home.html'
										})
										.when('/order', {
											controller: 'OrderCtrl',
											templateUrl: 'partials/order.html'
										})
										.when('/order-transmit', {
											controller: 'OrderCtrl',
											templateUrl: 'partials/order-transmit.html'
										})
										.when('/sales', {
											controller: 'ClientCtrl',
											templateUrl: 'partials/sales.html'
										})
										.when('/purchases', {
											controller: 'ClientCtrl',
											templateUrl: 'partials/purchases.html'
										})
										.when('/clients', {
											controller: 'ClientCtrl',
											templateUrl: 'partials/clients.html'
										})
										.when('/clients-client', {
											controller: 'ClientCtrl',
											templateUrl: 'partials/clients-client.html'
										})
										.when('/clients-client-new', {
											controller: 'ClientCtrl',
											templateUrl: 'partials/clients-client-edit.html'
										})
										.when('/clients-client-edit', {
											controller: 'ClientCtrl',
											templateUrl: 'partials/clients-client-edit.html'
										})
										.when('/measurements', {
											controller: 'ClientCtrl',
											templateUrl: 'partials/measurements.html'
										})
										.when('/settings', {
											controller: 'SettingsCtrl',
											templateUrl: 'partials/settings.html'
										})
										.when('/orderfast', {
											controller: 'OrderFastCtrl',
											templateUrl: 'partials/orderfast.html'
										})
										.otherwise({redirectTo: '/'});
								})

								.run(function($rootScope) {

									console.log("ANGULAR > Module run");
		//$rootScope.db_install();
									$rootScope.theme_directory = 'probespoke-dark';
									$rootScope.logo_uri = 'themes/' + $rootScope.theme_directory + '/logo.png';
									$rootScope.theme_currency = 'glyphicon-usd';
									$rootScope.debug_level = 0;

								});


	/*
	 *
	 */
	probespokeApp.controller('MainCtrl', function($rootScope, $scope, $log, $route, $routeParams, $location, $http, $aside, $uibModal, ngCart, ngDialog, $translate, $timeout) {

		var init = function () {

			console.log('');
			console.log('ANGULAR > MainCtrl loaded');

			$scope.device_cordova  = tryReadVar(device.cordova, 'Unknown Cordova Version');
			$scope.device_uuid     = tryReadVar(device.uuid, 'Unknown UUID');
			$scope.device_platform = tryReadVar(device.platform, 'Unknown OS');
			$scope.device_model    = tryReadVar(device.model, 'Unknown Model');
			$scope.device_version  = tryReadVar(device.version, 'Unknown OS Version');
			$scope.app_version     = tryReadVar(device.cordova.getAppVersion, 'Unknown App Version');

			$rootScope.h1 = '';

			$scope.app_language = 'en_US';
			$scope.app_config_load();

		};

		$rootScope.orderCartShow = false;
		$rootScope.settings_product_key = '';



		/*
		 * On first launch, check the product key
		 */
		$scope.installSubmitProductKey = function() {

			console.log('');
			console.log('FN installSubmitProductKey > start');

			console.log($scope.submit_product_key);

			// Check internet connection
			if (navigator.connection == undefined)
				var networkState = 'WIFI';
			else
				var networkState = navigator.connection.type;
			if ( networkState == "NONE" ||
				 networkState == "none" ||
				 networkState == "CELL" ||
				 networkState == "cell" ) {

				ngDialog.open({
					template: 'partials/dialog-msg.html',
					data: {question: $translate.instant('i18n_common_needconnection')},
					className: 'ngdialog-theme-default'
				});
				console.log('FN installSubmitProductKey > Failed: no internet connection');

			} else {

				var gateway = 'http://gateway.probespoke.com/product_key.php';

				$scope.xml_data_submit = {};
				$scope.xml_data_submit.product_key = $scope.submit_product_key;
				//$scope.xml_data_submit.device_uuid = device.uuid;
				$scope.xml_data_submit.device_uuid = 'unknown device uuid';

				$http({
					method: 'POST',
					url: gateway,
					data: $scope.xml_data_submit
				}).
				then(function(response) {

					if (response.data.errors) {

						ngDialog.open({
							template: 'partials/dialog-msg.html',
							data: {question: 'Wrong product key, please try again or contact your account manager.'},
							className: 'ngdialog-theme-default'
						});
						console.log( JSON.stringify(response.data.errors) );

					} else {

						// Check Product Key if available
						if (response.data.licence.company_id != undefined) {

							console.log( response.data.licence.product_key );
							console.log( response.data.licence.company_id );
							console.log( response.data.licence.company_name );
							console.log( response.data.licence.seller_id );
							console.log( response.data.licence.seller_fullname );

							db.transaction(function(tx) {
								tx.executeSql("UPDATE config SET value = '" + response.data.licence.product_key + "' WHERE name = 'product_key'", [], tx_result, tx_error);
								tx.executeSql("UPDATE config SET value = '" + response.data.licence.company_id + "' WHERE name = 'company_id'", [], tx_result, tx_error);
								tx.executeSql("UPDATE config SET value = '" + response.data.licence.company_name + "' WHERE name = 'company_name'", [], tx_result, tx_error);
								tx.executeSql("UPDATE config SET value = '" + response.data.licence.seller_id + "' WHERE name = 'seller_id'", [], tx_result, tx_error);
								tx.executeSql("UPDATE config SET value = '" + response.data.licence.seller_fullname + "' WHERE name = 'seller_fullname'", [], tx_result, tx_error);

							},
							tx_error,
							function(){

								// Assign Product Key to settings
								$rootScope.settings_product_key = response.data.licence.product_key;
								settings['company_id'] = response.data.licence.company_id;
								settings['seller_id'] = response.data.licence.seller_id;
								$scope.show_productkey_form = false;
								$scope.$apply();

								console.log('FN installSubmitProductKey > Succeed: Product Key & Company details checked and saved to database');

							});

						}
						// Write wrong product key
						else {

							ngDialog.open({
								template: 'partials/dialog-msg.html',
								data: {question: 'Wrong product key, please try again or contact your account manager.'},
								className: 'ngdialog-theme-default'
							});
							console.log('FN installSubmitProductKey > Failed: wrong Product Key');
							console.log( JSON.stringify(response.data) );

						}
					}

				}, function(response) {

					ngDialog.open({
						template: 'partials/dialog-msg.html',
						data: {question: 'Cannot reach gateway, please try again or contact your account manager.'},
						className: 'ngdialog-theme-default'
					});
					console.log('FN installSubmitProductKey > Failed: cannot reach gateway');

				})

			}

		}

	// DB > Check database version, install or update if required
		$scope.db_install = function() {

			db.transaction(function(tx) {
				tx.executeSql(
					"SELECT * FROM sqlite_master WHERE type = 'table' AND name = 'config'",
					[],
					function(tx, results) {
						var len = results.rows.length;
						if (len == 0) {

							/*var filename = 'install/'+i+'.sql.json';
							$http.get(filename).success(function(data) {

								for (var j = 0; j < data.length; j++){
									var sql = data[j];

									db.transaction(function(tx) {
										tx.executeSql(sql, [], tx_result, tx_error);
									});

								}

							});*/
						}
						else {

							var sql_settings = "SELECT value FROM config WHERE name = 'database_version'";
							tx.executeSql(
								sql_settings,
								[],
								function(tx, results){

									var db_installed_version = parseInt(results.rows.item(0).value) + 1;

									for (var i = db_installed_version; i <= db_current_version; i++) {

										var filename = 'install/'+i+'.sql.json';
										$http.get(filename).success(function(data) {

											for (var j = 0; j < data.length; j++) {
												var sql = data[j];

												db.transaction(function(tx) {
													tx.executeSql(sql, [], tx_result, tx_error);
												});

											}

										});

									}

								},
								tx_error
							);

						}
					},
					tx_error
				);
			});
		}

	// DB > Display tables
		$scope.db_displaytables = function() {
			db.transaction(function(tx) {

			  //  tx.executeSql("SELECT * FROM sqlite_master WHERE type = 'table' AND name <> '__WebKitDatabaseInfoTable__' AND name <> 'sqlite_sequence'", [],
				tx.executeSql("SELECT * FROM sqlite_master WHERE type = 'table'", [],
					function(tx, result){

						var tblText = '<table class="table"><tr><th>ID</th><th>Name</th><th>Nbr Records</th><th>SQL</th></tr>';
						var len = result.rows.length;

						for (var i = 0; i < len; i++) {
							tblText +='<tr><td>' + (i+1) +'</td><td>' + result.rows.item(i).name +'</td><td>' + result.rows.item(i).nbr +'</td><td>' + result.rows.item(i).sql +'</td></tr>';
						}

						tblText +="</table>";

						document.getElementById("page-dev-tables").innerHTML = tblText;

					},
					function(tx, error){
						alert("Error processing SQL: " + error.code);
					}
				);

			});
		}

	// DB > Drop tables for dev purposes
		$scope.db_dropalltables = function() {

			console.log('');
			console.log('FN db_dropalltables > start');

			db.transaction(function(tx) {

				tx.executeSql('DROP TABLE IF EXISTS config', [], tx_result, tx_error);
				tx.executeSql('DROP TABLE IF EXISTS products', [], tx_result, tx_error);
				tx.executeSql('DROP TABLE IF EXISTS products_pages', [], tx_result, tx_error);
				tx.executeSql('DROP TABLE IF EXISTS products_options', [], tx_result, tx_error);
				tx.executeSql('DROP TABLE IF EXISTS products_options_values', [], tx_result, tx_error);
				tx.executeSql('DROP TABLE IF EXISTS orders', [], tx_result, tx_error);
				//tx.executeSql('DROP TABLE IF EXISTS orders_products', [], tx_result, tx_error);
				tx.executeSql('DROP TABLE IF EXISTS orders_lines', [], tx_result, tx_error);
				tx.executeSql('DROP TABLE IF EXISTS clients', [], tx_result, tx_error);
				tx.executeSql('DROP TABLE IF EXISTS measurements', [], tx_result, tx_error);

				tx.executeSql("SELECT * FROM sqlite_master WHERE type = 'table' AND name = 'config'", [],
					function(tx, results) {
						var len = results.rows.length;
						if (len == 0)
						{
							console.log("DB > All tables of this as been deleted.");
							$scope.db_displaytables();
							alert('All tables as been deleted. Please close your app now.');
						}
						else
						{
							console.log("DB > Error while deleting tables.");
							alert('Error while deleting tables.');
						}
					},
					tx_error
				);

			});

		};

	// DB > Save field
		$scope.dbSaveField = function(table, key_name, key_value, field_name, field_value, saving_status) {

			console.log('');
			console.log('FN dbSaveField > start');

			db.transaction(function(tx) {

				var sql_save_field = "UPDATE " + table + " SET " + field_name + " = \"" + field_value + "\" WHERE " + key_name + " = '" + key_value + "'";
				tx.executeSql(sql_save_field, [], tx_result, tx_error);

			//	console.log("FN dbSaveField > DB > " + sql_save_field);

				if (saving_status === true) {
					$scope.database_saving_status = $translate.instant('i18n_common_saving');
					$scope.$apply();
					$timeout(function() {
						$scope.database_saving_status = '';
						$scope.$apply();
					}, 1000);
				}

			});

		}

	// DB > Get field
		$scope.dbGetField = function(table, field_name, key_name, key_value) {

			console.log('');
			console.log('FN dbGetField > start');

			db.transaction(function(tx) {

				var sql_get_field = "SELECT " + field_name + " FROM " + table + " WHERE " + key_name + " = '" + key_value + "'";

				tx.executeSql(
					sql_get_field,
					[],
					function(tx, results){

						console.log('FN dbGetField > DB > ' + sql_get_field);

						var len = results.rows.length;

						if (len > 0) {

						console.log(results.rows.item(0).eval(key_name));
							return results.rows.item(0).eval(key_name);

						}
						else {

							return '';

						}

					},
					tx_error
				);

			});

		}

	// DB > Escape string
		$scope.db_prepare_string = function(value, type) {
			if (value == undefined)
				return '';
			else {
				value = String(value);
				console.log(typeof value + ': ' + value);
				return value.replace(/'/g, "''");
			}
		}

	// Settings > save
		$scope.settings_setting_save = function(key, value) {

			db.transaction(function(tx) {

				tx.executeSql("UPDATE config SET value = '" + value + "' WHERE name = '" + key + "'", [], tx_result, tx_error);

				// If language, update H1
				if (key == 'app_language')
					$rootScope.h1 = $translate.instant('i18n_settings_pagetitle');

				settings[key] = value; // 0.6.02

				$scope.database_saving_status = $translate.instant('i18n_common_saving');
				$scope.$apply();
				$timeout(function() {
					$scope.database_saving_status = '';
					$scope.$apply();
				}, 1000);
			});

		}

	// User > Load user preferences
		$scope.app_config_load = function() {

			db.transaction(function(tx) {
				var sql_settings = "SELECT * FROM config";
				tx.executeSql(
					sql_settings,
					[],
					function(tx, results){

						var len = results.rows.length;

						for (var i=0; i<len; i++) {
							var setting = results.rows.item(i);
							if ( setting.value2 != null && setting.value != '' )
								settings[setting.name] = setting.value2;
							else
								settings[setting.name] = setting.value;
						}

						// Product Key is empty
/*
						if ( settings['product_key'] == '' ) {

							$location.path( '/install' );

						}
*/
						$scope.user_settings_apply();
					},
					tx_error
				);
			});

		};

	// Route > Go
		$scope.go = function ( path, param, value ) {

			console.log("GO > start");

			if (param != undefined) {
				console.log("GO > " + path + "?" + param + "=" + value);
				//$location.path( path ).search({param: value});
				$location.path( path ).search(param, value);
				//.search('foo', 'yipee')
			}
			else {
				console.log("GO > " + path);
				$location.path( path );
			}

		};

	// Route > Go2 (Ummm)
		$scope.go2 = function ( path, param, value ) {

			console.log("GO 2 > start");

			$scope.$apply(function() {

				if (param != undefined) {
					console.log("GO 2 > " + path + "?" + param + "=" + value);
					//$location.path( path ).search({param: value});
					$location.path( path ).search(param, value);
					//.search('foo', 'yipee')
				}
				else {
					console.log("GO 2 > " + path);
					$location.path( path );
				}

			});

		};
		$scope.go3 = function ( url ) {

			console.log("GO > start");

				console.log("GO > " + url);
				$location.path( url );

		};

	// User > load user settings
		$scope.user_settings_apply = function() {
			$rootScope.settings_product_key = settings['product_key'];
			$scope.changeTheme( settings['theme'] );
			$scope.changeLanguage( settings['app_language'] );
			$scope.changeCurrency( settings['currency'] );
			$scope.changeLogo( settings['UI_custom_logo'] );
			$scope.changeBackground( settings['UI_custom_background'] );

			if ($rootScope.settings_product_key == '')
				$scope.show_productkey_form = true;
				$rootScope.menuShow = false;

			console.log("Apply settings");
		};

	// Theme > Change theme
		$scope.changeTheme = function (key) {
			$rootScope.theme_directory = key;
			//$rootScope.$apply();
			//alert($scope.theme_directory+ ' / ' + key);
		}

	// i18n > Change language
		$scope.changeLanguage = function (key) {

			$scope.app_language = key;

			if (key == 'fr_FR')
				$translate.use('fr');
			else if (key == 'es_ES')
				$translate.use('es');
			else if (key == 'th_TH')
				$translate.use('th');
			else
				$translate.use('en');

		};



	// i18n > Change currency
		$scope.changeCurrency = function (currency) {

			if (currency == 'EUR')
				$rootScope.theme_currency = 'glyphicon-euro';
			else
				$rootScope.theme_currency = 'glyphicon-usd';

		}


		/*
		 * Change logo of app, on app loading or on custom logo update
		 */
		$scope.changeLogo = function ( logo_data ) {

			console.log('');
			console.log('FN changeLogo > start');


			if ( logo_data != null && logo_data != '') {
				$rootScope.logo_uri = logo_data;
				//document.getElementById( 'logo2' ).style.background = "url('" + logo_data + "') no-repeat";
			} else {
				//console.log("themes/" + settings['theme'] + "/logo.png");
				$rootScope.logo_uri = '';
				//document.body.style.background = "url('themes/" + settings['theme'] + "/background.jpg') no-repeat";
			}

		}


		/*
		 * Change background image of app, on app loading or on custom background update
		 */
		$scope.changeBackground = function (background_data) {

			console.log('');
			console.log('FN changeBackground > start');

			if ( background_data != null && background_data != '') {
				document.body.style.background = "url('" + background_data + "') no-repeat left top";
				document.body.style.backgroundSize = "cover";
			} else {
				document.body.style.background = null;
				document.body.style.backgroundSize = null;
				//document.body.style.background = "url('themes/" + settings['theme'] + "/background.jpg') no-repeat";
			}

		}


	// MENU / CART
		$scope.asideState = {
			open: false
		};

		$scope.openAside = function(position, backdrop, template, size) {

			$scope.asideState = {
				open: true,
				position: position
			};

			function postClose() {
				$scope.asideState.open = false;
			}

			$aside.open({
				templateUrl: 'partials/' + template,
				placement: position,
				size: size,
				backdrop: backdrop,
				controller: function($scope, $uibModalInstance) {
					$scope.ok = function(e) {
						$uibModalInstance.close();
						//e.stopPropagation();
					};
					$scope.cancel = function(e) {
						$uibModalInstance.dismiss();
						//e.stopPropagation();
					};
					$rootScope.closeCartPanel = function(e) {
						$uibModalInstance.dismiss();
					};
					$rootScope.closeOrderPanel = function(e) {
						$uibModalInstance.dismiss();
					};
				}
			}).result.then(postClose, postClose);

		}

		/*
		 * Display text in user language if available or display defaukt english text
		 */
		$scope.i18n_from_db = function (row) {

			var text = eval('row.'+$scope.app_language);

			if (text != null && text != '' && text != 'TXT_SPANISH' && text != 'TXT_THAI')
				return text;
			else
				return row.en_US;
		}


		/*
		 * Called when a photo is successfully retrieved
		 */
		$scope.photoOnPhotoDataSuccess = function ( imageData ) {
			// Uncomment to view the base64-encoded image data
			//console.log(imageData);

			// Get image handle
			//
			var smallImage = document.getElementById( $scope.photo_img_id );

			// Unhide image elements
			//
			//smallImage.style.display = 'block';

			// Show the captured photo
			// The in-line CSS rules are used to resize the image
			//
			smallImage.src = "data:image/jpeg;base64," + imageData;

			// Save value in database
			var blob = "data:image/jpeg;base64," + imageData;
			//var blob = "data:image/jpeg;base64,";
			$scope.dbSaveField ( 'clients', 'id', $scope.photo_client_id, $scope.photo_img_id, blob, false );

			if ($scope.photo_on_success && $scope.photo_on_success == 'photo_cart')
				$rootScope.orderCapturePhotoDone();
		}


		/*pictureSource = navigator.camera.PictureSourceType;
        destinationType = navigator.camera.DestinationType;*/

		/*
		 * A button will call this function
		 * Take picture using device camera and retrieve image as base64-encoded string
		 */
		$scope.photoCapturePhoto = function ( img_id, client_id, on_success ) {

			$scope.photo_img_id = img_id;
			$scope.photo_client_id = client_id;
			$scope.photo_on_success = on_success;

			navigator.camera.getPicture(
											$scope.photoOnPhotoDataSuccess,
											$scope.photoOnFail,
											{
												quality: 90,
												destinationType: destinationType.DATA_URL,
												targetWidth: 450,
												targetHeight: 600
											}
										);
		}


		/*
		 *
		 */
		$scope.settingsChooseLogo = function () {

			navigator.camera.getPicture(
											$scope.settingsChooseLogoSuccess,
											$scope.photoOnFail,
											{
												allowEdit: true,
												correctOrientation: true,
												destinationType: destinationType.DATA_URL,
												sourceType: pictureSource.PHOTOLIBRARY,
												targetHeight: 90,
												targetWidth: 250
											}
										);
		}


		/*
		 *
		 */
		$scope.settingsChooseBackground = function () {

			navigator.camera.getPicture(
											$scope.settingsChooseBackgroundSuccess,
											$scope.photoOnFail,
											{
												allowEdit: true,
												correctOrientation: true,
												destinationType: destinationType.DATA_URL,
												sourceType: pictureSource.PHOTOLIBRARY,
												targetHeight: window.innerHeight,
												targetWidth: window.innerWidth
											}
										);
		}


		/*
		 *
		 */
		$scope.settingsChooseLogoSuccess = function ( imageData ) {
			var blob = "data:image/jpeg;base64," + imageData;
			document.getElementById( 'custom_logo' ).src = blob;
			//console.log(blob);
			$scope.changeLogo( blob )
			$scope.dbSaveField( 'config', 'name', 'UI_custom_logo', 'value2', blob, true );
		}


		/*
		 *
		 */
		$scope.settingsChooseBackgroundSuccess = function ( imageData ) {
			var blob = "data:image/jpeg;base64," + imageData;
			document.getElementById( 'custom_background' ).src = blob;
			document.body.style.background = "url('"+blob+"') no-repeat left top";
			document.body.style.backgroundSize = "cover";
			//console.log(blob);
			$scope.dbSaveField( 'config', 'name', 'UI_custom_background', 'value2', blob, true );
		}


		/*
		 * On settings page, if remove logo or background button is clicked
		 */
		$scope.settingsRemoveCustom = function ( what ) {

			if ( what == 'logo') {

				settings['UI_custom_logo'] = '';
				$scope.dbSaveField ( 'config', 'name', 'UI_custom_logo', 'value2', '', true );
				$scope.settings_UI_custom_logo = 'img/settings/blank.png';
				document.getElementById( 'custom_logo' ).src = 'img/settings/blank.png';
				$scope.changeLogo('');

			} else if ( what == 'background') {

				settings['UI_custom_background'] = '';
				$scope.dbSaveField ( 'config', 'name', 'UI_custom_background', 'value2', '', true );
				$scope.settings_UI_custom_background = 'img/settings/blank.png';
				document.getElementById( 'custom_background' ).src = 'img/settings/blank.png';
				$scope.changeBackground('');

			}

		}


		/*
		 * Called if something bad happens
		 */
		$scope.photoOnFail = function (message) {
			console.log('Failed because: ' + message);
		}


		/*
		 * Called if something bad happens
		 */
		$scope.orderBuildOrderNumber = function (order_id, client_id, seller_id, company_id) {

			console.log('');
			console.log('FN orderBuildOrderNumber > start ('+company_id+'-'+seller_id+'-'+client_id+'-'+order_id+')');

			if (company_id == undefined)
				company_id = settings['company_id'];

			if (seller_id == undefined)
				seller_id = settings['seller_id'];

			var order_number = company_id+'-'+seller_id+'-'+client_id+'-'+order_id;

			return order_number;

		}


		init();

	});

	probespokeApp.controller('HomeCtrl', function ($rootScope, $scope, $log, $translate) {

	});

	probespokeApp.controller('DevCtrl', function ($rootScope, $scope, $log, $translate) {

	});


function tx_error(tx, error) {
alert(error.code);
alert(error.message);
	console.log('');
	console.log('DB > ----------------------------------------------------------------');
	console.log('DB > Error Code: ' + error.code);
	console.log('DB > Error Message: ' + error.message);
	console.log('DB > ----------------------------------------------------------------');
	console.log('');
	return true;

}

function tx_error_adv(query, tx, error) {

	console.log('');
	console.log('DB > ----------------------------------------------------------------');
	console.log('DB > Error Code: ' + error.code);
	console.log('DB > Error Message: ' + error.message);
	console.log('DB > Query: ' + query);
	console.log('DB > ----------------------------------------------------------------');
	console.log('');
	return true;

}

var errorCB = function (the_error) {
	console.log(the_error);
}

function tx_result(tx, result) {
	//alert('success');
}

function syntaxHighlight(json) {
	json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
		var cls = 'number';
		if (/^"/.test(match)) {
			if (/:$/.test(match)) {
				cls = 'key';
			} else {
				cls = 'string';
			}
		} else if (/true|false/.test(match)) {
			cls = 'boolean';
		} else if (/null/.test(match)) {
			cls = 'null';
		}
		return '<span class="' + cls + '">' + match + '</span>';
	});
}

String.prototype.replaceAll = function(s,r){return this.split(s).join(r)}


/*
 * Same PHP in_array
 */
	function inArray(needle, haystack) {
		var length = haystack.length;
		for(var i = 0; i < length; i++) {
			if(haystack[i] == needle) return true;
		}
		return false;
	}


function scrolify(tblAsJQueryObject, height){
	var oTbl = tblAsJQueryObject;

	// for very large tables you can remove the four lines below
	// and wrap the table with <div> in the mark-up and assign
	// height and overflow property
	var oTblDiv = jQuery("<div/>");
	oTblDiv.css('height', height);
	oTblDiv.css('overflow','scroll');
	oTbl.wrap(oTblDiv);

	// save original width
	oTbl.attr("data-item-original-width", oTbl.width());
	oTbl.find('thead tr td').each(function(){
		jQuery(this).attr("data-item-original-width",jQuery(this).width());
	});
	oTbl.find('tbody tr:eq(0) td').each(function(){
		jQuery(this).attr("data-item-original-width",jQuery(this).width());
	});


	// clone the original table
	var newTbl = oTbl.clone();

	// remove table header from original table
	oTbl.find('thead tr').remove();
	// remove table body from new table
	newTbl.find('tbody tr').remove();

	oTbl.parent().parent().prepend(newTbl);
	newTbl.wrap("<div/>");

	// replace ORIGINAL COLUMN width
	newTbl.width(newTbl.attr('data-item-original-width'));
	newTbl.find('thead tr td').each(function(){
		jQuery(this).width(jQuery(this).attr("data-item-original-width"));
	});
	oTbl.width(oTbl.attr('data-item-original-width'));
	oTbl.find('tbody tr:eq(0) td').each(function(){
		jQuery(this).width(jQuery(this).attr("data-item-original-width"));
	});
}


/*
 * jQuery functions
 */
jQuery( document ).ready(function() {

	// In customization process, on focus on input text, keyboard appear, so hide fixed pogress bar
	jQuery( document ).on("focus blur", "#page-measurements textarea", function() {

		jQuery(this).toggleClass('textarea-big');

	});
	jQuery( document ).on("focus blur", "#page-order input[type=text]", function() {

		if ( jQuery('#page-order .progress').is(":visible") ) {
			jQuery('#page-order .progress').hide(0);
		}

	});
	jQuery( document ).on("blur", "#page-order input[type=text]", function() {

		if ( jQuery('#page-order .progress').not(":visible") ) {
			jQuery('#page-order .progress').show(1000);
		}

	});


});
