function test(){
	console.log("Timeout occurred");
	alert('toto');
}
probespokeApp.controller('ClientCtrl', 
						['$rootScope', '$scope', '$log', '$route', '$routeParams', '$location', '$translate', '$uibModal', 'ngDialog', '$sce', '$timeout', 
						function ($rootScope, $scope, $log, $route, $routeParams, $location, $translate, $uibModal, ngDialog, $sce, $timeout) {

	$rootScope.orderCartShow = false;
	$rootScope.current_page = '';
	$rootScope.h1 = '';

	$scope.client_id = null;
	$scope.order_id = null;
	$scope.measurements_id = null;

	/*
	 * Init Controller (assign parameters and start functions)
	 */
	var init = function () {

		console.log('');
		console.log('INIT > ClientCtrl');

		if ($routeParams.do) {

			$rootScope.current_page = $routeParams.do;

			// Edit Client
			if ($routeParams.do == 'editclient' && $routeParams.client_id) {

				console.log('INIT > editclient');
				$scope.client_id = $routeParams.client_id;

				$rootScope.h1 = $translate.instant('i18n_client_pagetitle');

				$scope.clientsDisplayClient( $scope.client_id );

			}

			// New Client
			else if ($routeParams.do == 'newclient') {

				console.log('INIT > newclient' + $routeParams.do);

				$rootScope.h1 = $translate.instant('i18n_client_pagetitle');

			}

			// View Client
			else if ($routeParams.do == 'viewclient'  && $routeParams.client_id) {

				console.log('INIT > viewclient');
				$scope.client_id = $routeParams.client_id;

				$rootScope.h1 = $translate.instant('i18n_client_pagetitle');

				$scope.clientsDisplayClient( $scope.client_id );
				$scope.clientsDisplayOrders( $scope.client_id );
				$scope.clientsDisplayMeasurements( $scope.client_id );

			}

			// View Sales
			else if ($routeParams.do == 'sales') {

				console.log('INIT > sales');

				$rootScope.h1 = $translate.instant('i18n_sales_pagetitle');
				$scope.orders_filter_cart = true;
				$scope.ordersDisplayOrders();

			}

			// View Purchases
			else if ($routeParams.do == 'purchases') {

				console.log('INIT > purchases');

				$rootScope.h1 = $translate.instant('i18n_purchases_pagetitle');
				$scope.orders_filter_cart = false;
				$scope.ordersDisplayOrders();

			}

			// Load All Clients
			else {

				console.log('INIT > default');
				$scope.client_id = null;

				$rootScope.h1 = $translate.instant('i18n_clientlist_pagetitle');

				$scope.clientsDisplayClients();

			}

		}
		/*else if ($routeParams.id) {

			console.log('INIT > client_id: ' + $routeParams.id);

			$scope.client_id = $routeParams.id;
			$scope.clientsDisplayClient( $scope.client_id );

		}*/
		// Edit Measurements
		else if ($routeParams.client_id && $routeParams.measurements_id) {

			console.log('INIT > client_id: ' + $routeParams.client_id);
			console.log('INIT > measurements_id: ' + $routeParams.measurements_id);

			$rootScope.h1 = $translate.instant('i18n_measurements_pagetitle');
			$scope.client_id = $routeParams.client_id;
			$scope.measurements_id = $routeParams.measurements_id;
			if ($routeParams.order_id)
				$scope.order_id = $routeParams.order_id;
			//$timeout($scope.clientMeasurementsLoad( $routeParams.measurements_id, settings['unit_measurements'] ), 1000); // 0.6.02
			//alert(settings['unit_measurements']);
			$scope.clientMeasurementsLoad( $scope.measurements_id, settings['unit_measurements'], '', '', settings['unit_measurements'] );

		}
		// New Measurements
		else if ($routeParams.client_id) {

			console.log('INIT > client_id: ' + $routeParams.client_id);

			$scope.client_id = $routeParams.client_id;
			if ($routeParams.order_id)
				$scope.order_id = $routeParams.order_id;
			$scope.clientsDisplayClient( $scope.client_id );

		}
		// Load All Clients
		else {

			$scope.client_id = null;
			$rootScope.h1 = $translate.instant('i18n_clientlist_pagetitle');
			$scope.clientsDisplayClients();

		}
	};


	/*
	 * Load products
	 */
	db.transaction(function(tx) {

		var sql_get_products = "SELECT * FROM products WHERE active = 1";
		tx.executeSql(
			sql_get_products, 
			[], 
			function(tx, results) {

				$scope.products = [];

				for (var i=0; i<results.rows.length; i++) {

					var product = results.rows.item(i);
					product['name'] = $scope.i18n_from_db(product);
					$scope.products.push(product);

				}
				console.log('Products loaded');
				//alert(JSON.stringify($scope.products));
				$scope.$apply();

			},
			tx_error
		);

	});


	/*
	 * Display the clients list (can filter, sort, paginate)
	 */
	$scope.clients_filter_order = 'orders_lastdate';
	$scope.clientsDisplayClients = function () {

		console.log('');
		console.log('FN clientsDisplayClients > start');

		var sql_criteria = " WHERE 1";
		var sql_orderby = " ORDER BY orders_lastdate";

		if ($scope.clients_filter_search != undefined) {

			// Clean search field
			var keywords = $scope.clients_filter_search;
			keywords = keywords.replace("'", "");
			keywords = keywords.replace("%", "");
			keywords = keywords.replace('"', '');

			if (keywords != '') {
				sql_criteria = sql_criteria + " AND (company LIKE '%"+keywords+"%' OR \
													 firstname LIKE '%"+keywords+"%' OR \
													 lastname LIKE '%"+keywords+"%' OR \
													 city LIKE '%"+keywords+"%' OR \
													 postalcode LIKE '%"+keywords+"%')";
			}
		}

		if ($scope.searchInactive != undefined) {
			if ($scope.searchInactive == false)
				sql_criteria = sql_criteria + " AND active = 1";
		}
		else {
			sql_criteria = sql_criteria + " AND active = 1";
		}

		if ($scope.clients_filter_order != undefined) {
			var order = $scope.clients_filter_order;
			//alert(order);
			sql_orderby = " ORDER BY "+order;
		}

		db.transaction(function(tx) {
			var sql_load_clients = "SELECT * FROM clients" + sql_criteria + sql_orderby;
			//var sql_load_clients = "SELECT * FROM clients";

			tx.executeSql(
				sql_load_clients, 
				[], 
				function(tx, results){

					console.log('FN clientsDisplayClients > DB > '+sql_load_clients);

					$scope.clients = [];

					for (var i=0; i<results.rows.length; i++) {

						var client = results.rows.item(i);

						if ($routeParams.do && $routeParams.do == 'select-client-order')
							client.goto = "#/order?client_id="+client.id;
						else
							client.goto = "#/clients-client?do=viewclient&client_id="+client.id;

						// Default portrait
						if (client.photo == null)
							client['photo_src'] = 'img/clients/default-grid.jpg';
						else
							client['photo_src'] = client.photo;

						$scope.clients.push(client);
					}

					// Pagination
					$scope.clientsFiltered = [];
					$scope.clients_grid_currentpage = 1;
					$scope.clients_grid_perpage = 9;
					$scope.clients_grid_total_clients = $scope.clients.length;
					$scope.clientsGridChangePage(1);

					$scope.$apply();

				},
				tx_error
			);

		});

	}


	/*
	 * Change page on the client grid
	 */
	$scope.clientsGridChangePage = function (clients_grid_currentpage) {

		console.log('');
		console.log('FN clientsGridChangePage > start');

		var begin = ((clients_grid_currentpage - 1) * $scope.clients_grid_perpage);
		var end = begin + $scope.clients_grid_perpage;

		$scope.clientsFiltered = $scope.clients.slice(begin, end);

		console.log('FN clientsGridChangePage > '+clients_grid_currentpage+' / '+begin+' / '+end);
	}


	/*
	 * Display 1 client information on client view or edit
	 */
	$scope.clientsDisplayClient = function (client_id) {

		console.log('');
		console.log('FN clientsDisplayClient > start');

		db.transaction(function(tx) {

			var sql_load_client = "SELECT * FROM clients WHERE id = " + client_id;
			tx.executeSql(
				sql_load_client, 
				[], 
				function(tx, results){

					console.log('FN clientsDisplayClient > DB > ' + sql_load_client);

					$scope.clients = [];

					if (results.rows.length > 0) {

						var client = results.rows.item(0);

						// Portrait
						if (client.photo == null)
							client['photo_src'] = 'img/clients/default.jpg';
						else
							client['photo_src'] = client.photo;

						// Front picture
						client['photo_front_src'] = 'img/clients/default-front.jpg';
						if (client.photo_front != null)
							client['photo_front_src'] = client.photo_front;

						// Side picture
						client['photo_side_src'] = 'img/clients/default-side.jpg';
						if (client.photo_side != null)
							client['photo_side_src'] = client.photo_side;

						// Back picture
						client['photo_back_src'] = 'img/clients/default-back.jpg';
						if (client.photo_back != null)
							client['photo_back_src'] = client.photo_back;

						// Fullname
						if (client.company != '')
							client['fullname'] = client.firstname + ' ' + client.lastname + ' / ' + client.company + ' (' + client.id + ')';
						else
							client['fullname'] = client.firstname + ' ' + client.lastname + ' (' + client.id + ')';

						// DOB
						if (client.dob != '' && client.dob != 'null') {
							var tmp_dob = new Date(client.dob);
							client['dob2'] = tmp_dob.getFullYear() + '-' + (tmp_dob.getMonth()+1) + '-' + tmp_dob.getDate();
						}

						// Country
						if ( client.country != '' ) {
							angular.forEach($scope.countries, function(value, key) {
								if ( value.code == client.country )
									client['country2'] = value.name;
							});
						}
						else {
							client['country2'] = '';
						}

						// Var for form edit
						$scope.client_id			= client.id;
						$scope.client_company		= client.company;
						$scope.client_firstname		= client.firstname;
						$scope.client_lastname		= client.lastname;
						if (client.dob != null)
							$scope.client_dob		= new Date(client.dob);
						else
							$scope.client_dob		= '';
						$scope.client_phone			= client.phone;
						$scope.client_email			= client.email;
						$scope.client_street1		= client.street1;
						$scope.client_street2		= client.street2;
						$scope.client_city			= client.city;
						$scope.client_postalcode	= client.postalcode;
						$scope.client_state			= client.state;
						$scope.client_country		= client.country;
						$scope.client_language		= client.language;
						$scope.client_applanguage	= client.applanguage;
						$scope.client_currency		= client.currency;
						$scope.client_notes			= client.notes;

						$scope.clients.push(client);

						//alert(typeof $scope.client.dob);


						$scope.$apply();
					}
					else
						return false;

				},
				tx_error
			);

		});

	}


	/*
	 * 
	 */
	$scope.clientEditCancel = function () {

		console.log('');
		console.log('FN clientEditCancel > start');

		if ($scope.client_id != undefined && $scope.client_id != null) {
			$location.path( '/clients-client' ).search( 'do' , 'viewclient').search( 'client_id' , $scope.client_id);
		}
		else {
			$location.path( '/clients').search( 'do' , 'clients');
		}
	}


	/*
	 * 
	 */
	$scope.clientHide = function (id, active) {

		console.log('');
		console.log('FN clientHide > start');

		active = 1 - active;

		var sql_update_client = "UPDATE clients SET active = "+ active +" WHERE id = "+ id;
		db.transaction(function(tx) {
			tx.executeSql(
				sql_update_client, 
				[], 
				function(tx, results) {
					$route.reload();
					//$scope.client.active = active;
					//$rootScope.$apply();
					/*console.log('DB > '+sql_update_client);
						$rootScope.$apply(function() {

							$scope.go('/clients-client', 'id', id);

						});
					if (active == 1) {
						$rootScope.$apply(function() {

							$scope.go('/clients-client', 'id', id);

						});
					}
					else {
						$scope.go('/clients');
					}*/
				}, 
				tx_error
			);
		});
	}


	/*
	 * 
	 */
	$scope.clientsEditSubmit = function (isValid) {

		console.log('');
		console.log('FN clientsEditSubmit > start');

		// check to make sure the form is completely valid
		if (isValid) {

			if ($scope.client_dob == null)
				$scope.client_dob = '';

			if ($scope.client_country == undefined)
				$scope.client_country = '';

			if ($scope.client_applanguage == undefined)
				$scope.client_applanguage = '';

			if ($scope.client_currency == undefined)
				$scope.client_currency = '';

			if ($scope.client_id != null && $scope.client_id > 0) {
				var sql_update_client = "UPDATE clients SET \
										company 	= '"+ $scope.db_prepare_string( $scope.client_company ) +"', \
										firstname 	= '"+ $scope.db_prepare_string( $scope.client_firstname ) +"', \
										lastname 	= '"+ $scope.db_prepare_string( $scope.client_lastname ) +"', \
										email 		= '"+ $scope.db_prepare_string( $scope.client_email ) +"', \
										phone 		= '"+ $scope.db_prepare_string( $scope.client_phone ) +"', \
										dob 		= '"+ $scope.client_dob +"', \
										street1 	= '"+ $scope.db_prepare_string( $scope.client_street1 ) +"', \
										street2 	= '"+ $scope.db_prepare_string( $scope.client_street2 ) +"', \
										city 		= '"+ $scope.db_prepare_string( $scope.client_city ) +"', \
										postalcode 	= '"+ $scope.db_prepare_string( $scope.client_postalcode ) +"', \
										state 		= '"+ $scope.db_prepare_string( $scope.client_state ) +"', \
										country 	= '"+ $scope.client_country +"', \
										language 	= '', \
										applanguage = '"+ $scope.client_applanguage +"', \
										currency 	= '"+ $scope.client_currency +"' \
										WHERE id = "+ $scope.client_id;
				//alert(sql_update_client);
				db.transaction(function(tx) {
					tx.executeSql(
						sql_update_client, 
						[], 
						function(tx, results) {

							//tmp_client_id = results.insertId;
							//$location.path( '/clients-client' ).search( 'do' , 'viewclient').search( 'client_id' , $scope.client_id);
							//$scope.$apply();
							//$rootScope.$apply(function() {
								//console.log('FN clientsEditSubmit > DB > '+sql_update_client);
								//$scope.go('/clients-client', 'id', $scope.clients[0].id);
							//});

						}, 
						tx_error
					);
				}, tx_error, function(){

					$location.path( '/clients-client' ).search( 'do' , 'viewclient').search( 'client_id' , $scope.client_id);
					$scope.$apply();

				});
			}
			else {
				var sql_insert_client = "INSERT INTO clients (company, firstname, lastname, gender, email, phone, dob, street1, street2, city, postalcode, state, country, language, applanguage, currency, active) VALUES ( \
										'"+ $scope.db_prepare_string( $scope.client_company ) +"', \
										'"+ $scope.db_prepare_string( $scope.client_firstname ) +"', \
										'"+ $scope.db_prepare_string( $scope.client_lastname ) +"', \
										'male', \
										'"+ $scope.db_prepare_string( $scope.client_email ) +"', \
										'"+ $scope.db_prepare_string( $scope.client_phone ) +"', \
										'"+ $scope.client_dob +"', \
										'"+ $scope.db_prepare_string( $scope.client_street1 ) +"', \
										'"+ $scope.db_prepare_string( $scope.client_street2 ) +"', \
										'"+ $scope.db_prepare_string( $scope.client_city ) +"', \
										'"+ $scope.db_prepare_string( $scope.client_postalcode ) +"', \
										'"+ $scope.db_prepare_string( $scope.client_state ) +"', \
										'"+ $scope.client_country +"', \
										'', \
										'"+ $scope.client_applanguage +"', \
										'"+ $scope.client_currency +"', \
										1)";

				db.transaction(function(tx) {

					tx.executeSql(
						sql_insert_client, 
						[], 
						function(tx, results) {

							tmp_client_id = results.insertId;
							//alert(tmp_client_id);
							//$location.path( '/clients-client' ).search( 'do' , 'viewclient').search( 'client_id' , results.insertId);
							//$scope.$apply();
							/*$rootScope.$apply(function() {
								//console.log('FN clientsEditSubmit > DB > '+sql_insert_client);
								//$scope.go('/clients-client', 'id', results.insertId);
							});*/

						}, 
						tx_error
					);
				}, tx_error, function(){

					//alert(tmp_client_id);
					if (tmp_client_id) {
						$location.path( '/clients-client' ).search( 'do' , 'viewclient').search( 'client_id' , tmp_client_id);
						$scope.$apply();
					}

				});
			}
		}
		else {
			ngDialog.open({
				template: 'partials/dialog-msg.html',
				data: {question: $translate.instant('i18n_client_error_fillrequired')},
				className: 'ngdialog-theme-default'
			});
		}
		//alert(countries.TZ);

	}


	/*
	 * Display the orders of 1 client on the client view (paginate)
	 */
	$scope.clientsDisplayOrders = function (client_id) {

		console.log('');
		console.log('FN clientsDisplayOrders > start');

		db.transaction(function(tx) {

			var sql_load_client_orders = "SELECT A.*, COUNT(B.quantity) as nbr_products, SUM(B.quantity) as nbr_total_products \
										 FROM orders as A LEFT OUTER JOIN orders_lines as B ON A.id = B.order_id \
										 WHERE A.client_id = "+client_id+" \
										 GROUP BY A.id \
										 ORDER BY A.id DESC";

			tx.executeSql(
				sql_load_client_orders, 
				[], 
				function(tx, results) {

					$scope.orders = [];

					for (var i=0; i<results.rows.length; i++) {

						var order = results.rows.item(i);

						// Order button label
						order['order_status2'] = $translate.instant('i18n_orders_status_' + order.order_status);

						// Nbr products
						if (order.nbr_total_products != null && order.nbr_products != order.nbr_total_products)
							order['nbr_products_2'] = order.nbr_total_products; //order['nbr_products_2'] = order.nbr_products + ' (' + order.nbr_total_products + ')';
						else
							order['nbr_products_2'] = order.nbr_products;
						order['order_number'] = $scope.orderBuildOrderNumber(order.id, order.client_id);

						// Payment Status
						order['payment_status2'] = $translate.instant('i18n_paymentstatus_' + order.payment_status);

						$scope.orders.push(order);
					}

					// Pagination
					$scope.ordersFiltered = [];
					$scope.orders_currentpage = 1;
					$scope.orders_perpage = 4;
					$scope.orders_total_orders = $scope.orders.length;
					$scope.clientOrdersChangePage(1);

					$scope.$apply();

				}, 
				tx_error
			);
		});
	}


	/*
	 * 
	 */
	$scope.clientOrdersChangePage = function (orders_currentpage) {

		console.log('');
		console.log('FN clientOrdersChangePage > start');

		var begin = ((orders_currentpage - 1) * $scope.orders_perpage);
		var end = begin + $scope.orders_perpage;

		$scope.ordersFiltered = $scope.orders.slice(begin, end);

		console.log('FN clientOrdersChangePage > '+orders_currentpage+' / '+begin+' / '+end);
	}


	/*
	 * Cart, if click on Delete Order button, ask confirmation, so delete order from database and empty cart, or do nothing
	 */
	$rootScope.clientsOrdersUpdatePaymentStatus = function(order_id, payment_status) {

		console.log('');
		console.log('FN clientsOrdersUpdatePaymentStatus > start (order_id: ' + order_id + ', payment_status: ' + payment_status + ')');

		db.transaction(function(tx) {

			var sql_update_payment_status = "UPDATE orders SET payment_status = '" + payment_status + "' WHERE id = "+ order_id;
			tx.executeSql(sql_update_payment_status, [], 
				function(tx, results) {

					console.log('FN clientsOrdersUpdatePaymentStatus > DB > '+ sql_update_payment_status);
					$scope.ordersDisplayOrders();

				}, tx_error
			);

		});

	}


	/*
	 * Cart, if click on Delete Order button, ask confirmation, so delete order from database and empty cart, or do nothing
	 */
	$rootScope.clientsOrdersDeleteOrder = function(order_id) {

		console.log('');
		console.log('FN clientsOrdersDeleteOrder > start (order_id: ' + order_id + ')');

		// Ask confirmation before deleting cart
		ngDialog.openConfirm({
			template: 'partials/dialog-confirm.html',
			data: {question: $translate.instant('i18n_cart_deleteorder_sure').replaceAll("<br>", " ")},
			className: 'ngdialog-theme-default'
		}).then(function () {

			// Delete order in database
			db.transaction(function(tx) {

				var sql_delete_order_lines = "DELETE FROM orders_lines WHERE order_id = "+ order_id;
				tx.executeSql(
					sql_delete_order_lines, 
					[], 
					function(tx, results) {

						console.log('FN clientsOrdersDeleteOrder > DB > '+ sql_delete_order_lines);

						var sql_delete_order = "DELETE FROM orders WHERE id = "+ order_id;
						tx.executeSql(sql_delete_order, [],  
							function(tx, results) {
								
								console.log('FN clientsOrdersDeleteOrder > DB > '+ sql_delete_order);
								console.log('FN clientsOrdersDeleteOrder > Delete order confirmed');
								console.log('FN clientsOrdersDeleteOrder > end');
								console.log('');

							}, tx_error);

					}, 
					tx_error
				);

			});
			
		}, function (reason) {

			console.log('FN clientsOrdersDeleteOrder > Detele order cancelled');
			console.log('FN clientsOrdersDeleteOrder > end');
			console.log('');

		});
	}


	/*
	 * Display the measurements of 1 client on the client view (paginate)
	 */
	$scope.clientsDisplayMeasurements = function (client_id) {

		console.log('');
		console.log('FN clientsDisplayMeasurements > start');

		db.transaction(function(tx) {

			var sql_load_client_measurements = "SELECT * FROM measurements WHERE client_id = " + client_id + " AND active = 1 ORDER BY id DESC";

			tx.executeSql(
				sql_load_client_measurements, 
				[], 
				function(tx, results) {

					$scope.measurements = [];

					for (var i=0; i<results.rows.length; i++) {

						var measurement = results.rows.item(i);
						measurement['type2'] = $translate.instant('i18n_client_measurements_type_' + measurement.type);
						measurement['units'] = measurement.unit_size + ' / ' + measurement.unit_weight;

						$scope.measurements.push(measurement);
					}

					$scope.measurementsFiltered = [];
					$scope.measurements_currentpage = 1;
					$scope.measurements_perpage = 4;
					$scope.measurements_total_measurements = $scope.measurements.length;
					$scope.measurementsChangePage(1);

					$scope.$apply();

				}, 
				tx_error
			);
		});
	}


	/*
	 * Change page on the client grid
	 */
	$scope.measurementsChangePage = function (measurements_currentpage) {

		console.log('');
		console.log('FN measurementsChangePage > start');

		var begin = ((measurements_currentpage - 1) * $scope.measurements_perpage);
		var end = begin + $scope.measurements_perpage;

		$scope.measurementsFiltered = $scope.measurements.slice(begin, end);

		console.log('FN measurementsChangePage > '+measurements_currentpage+' / '+begin+' / '+end);
	}


	/*
	 * Display the order panel with the details of the order
	 * @input order_id
	 * @do open overlay with order details inside
	 */
	$scope.clientsDisplayOrderPanel = function (order_id) {

		console.log('');
		console.log('FN clientsDisplayOrderPanel > start');

		// Load products from order
		db.transaction(function(tx) {

			// Load order
			var sql_get_order = "SELECT * FROM orders WHERE id = " + order_id;
			tx.executeSql(
				sql_get_order, 
				[], 
				function(tx, results) {

					console.log('DB > ' + sql_get_order);

					$rootScope.order = [];
					var order = results.rows.item(0);

					order['order_number'] = $scope.orderBuildOrderNumber(order.id, order.client_id);

					$rootScope.payment_status = order.payment_status;

					$rootScope.order.push( order );

					console.log($rootScope.order);

					$scope.$apply();

				}, 
				tx_error
			);

			// Load order lines
			var sql_get_order_lines = "SELECT * FROM orders_lines WHERE order_id = " + order_id + " ORDER BY id";
			tx.executeSql(
				sql_get_order_lines, 
				[], 
				function(tx, results) {

					console.log('DB > ' + sql_get_order_lines);

					$rootScope.order_lines = [];

					for (var i=0; i<results.rows.length; i++) {

						var line = results.rows.item(i);
								//IsNumeric
								//.isInteger()
						//if ( line.status === parseInt( line.status, 10 ) )
						if ( line.status > 0 && line.status < 100 )
							line['status2'] = $translate.instant('i18n_cart_step') + ' ' + line.status;
						else
							line['status2'] = $translate.instant('i18n_orders_status_' + line.status);

						// Default product name
						if (line.name == '') {
							angular.forEach($scope.products, function(value, key) {
								if (value.id == line.product_id) {
									line['name2'] = eval('value.' + $scope.app_language);
								}
							});
						} else {
							line['name2'] = line.name;
						}

						// If matched product, slice not push
						if (line.parent_id > 0) {
							var counter = 0;
							var position_in_array = 0;
							angular.forEach($rootScope.order_lines, function (item) {
								counter++;
								if (item.id == line.parent_id)
									position_in_array = counter;
							});
							$rootScope.order_lines.splice(position_in_array, 0, line);

						} else {
							$rootScope.order_lines.push(line);
						}

					}

					$scope.$apply();

				}, 
				tx_error
			);
		});

		$scope.openAside('right', true, 'clients-client-order.html', 'md');

	}


	/*
	 * Cancel measurements form
	 */
	$scope.clientMeasurementsCancel = function () {

		console.log('');
		console.log('FN clientMeasurementsCancel > start (client_id: '+$scope.client_id+')');

		if ($scope.order_id != undefined) {
			$location.path( '/order' ).search( 'client_id' , $scope.client_id).search( 'order_id' , $scope.order_id).search( 'opencart' , '1');
		}
		else if ($scope.client_id != undefined && $scope.client_id != null)
			$location.path( '/clients-client' ).search( 'do' , 'viewclient').search( 'client_id' , $scope.client_id);
		else
			$scope.go('/clients').search( 'do' , 'clients');

	}

	/*
	 * Cancel/Delete measurements form
	 */
	$scope.clientMeasurementsHide = function () {

		console.log('');
		console.log('FN clientMeasurementsHide > start (measurements_id: '+$scope.measurements_id+')');


		ngDialog.openConfirm({
			template: 'partials/dialog-confirm.html',
			data: {question: $translate.instant('i18n_measurements_delete_sure').replaceAll("<br>", " ")},
			className: 'ngdialog-theme-default',
			scope: $rootScope
		}).then(function () {

			// Deletion confirmed
			db.transaction(function(tx) {

				sql_hide_measurements = "UPDATE measurements SET active = '0' WHERE id = " + $scope.measurements_id;

				tx.executeSql(
					sql_hide_measurements, 
					[], 
					function(tx, results) {

						console.log('FN clientMeasurementsHide > DB > ' + sql_hide_measurements);

					}, 
					tx_error
				);

			}, tx_error, function(){

				console.log('FN clientMeasurementsHide > redirect');

				$scope.$apply(function() {

					if ($scope.order_id != undefined) {
						$location.path( '/order' ).search( 'client_id' , $scope.client_id).search( 'order_id' , $scope.order_id).search( 'opencart' , '1');
					}
					else if ($scope.client_id != undefined && $scope.client_id != null) {
						$location.path( '/clients-client' ).search( 'do' , 'viewclient').search( 'client_id' , $scope.client_id);
					}
					else
						$scope.go('/clients').search( 'do' , 'clients');

				});

			});

		}, function (reason) {
			console.log('FN clientMeasurementsHide > canceled');
		});

	}


	/*
	 * Save measurements to database
	 * - check if form is complete
	 * - save form
	 * - redirect to client view or cart
	 */
	$scope.clientMeasurementsSave = function (action) {

		console.log('');
		console.log('FN clientMeasurementsSave > start');

		// Form control, all fields are required (jQuery)
		var form_completed = true;
		jQuery( "form[name=measurementsForm] input" ).each(function(index, value) {
			
			//console.log( jQuery(this).attr('ng-model') + ': '+ jQuery(this).val() );
			if ( jQuery(this).val() == null || jQuery(this).val() == '' ) {
				//var tmp_model = jQuery(this).attr('ng-model')
				//alert( tmp_model + ' / ' + jQuery(this).val() + ' / ' + $scope.tmp_model );
				form_completed = false;
			}
		});

		// Form not completed
		if ( form_completed == true ) {

			db.transaction(function(tx) {

				var today = new Date().toJSON().slice(0, 10);

				// id & save    > UPDATE
				// id & save as > INSERT
				// no id & save > INSERT
				// If we edit a measurement and we Save we update the record
				if ($scope.measurements_id > 0 && action == 'save') {

					db.transaction(function(tx) {

						sql_hide_measurements = "UPDATE measurements SET active = '0' WHERE id = " + $scope.measurements_id;

						tx.executeSql(
							sql_hide_measurements, 
							[], 
							function(tx, results) {

								console.log('FN clientMeasurementsHide > DB > ' + sql_hide_measurements);

							}, 
							tx_error
						);

					});
					/*var sql_save_measurements = "UPDATE measurements SET \
												client_id = '" + $scope.client_id + "', \
												date = '" + today + "', \
												type = 'body', \
												unit_size = '" + $scope.db_prepare_string( $scope.measurements_unitsize ) + "', \
												unit_weight = '" + $scope.db_prepare_string( $scope.measurements_unitweight ) + "', \
												jacket_neck = '" + $scope.db_prepare_string( $scope.measurements_jacket_neck ) + "', \
												jacket_fullshoulder = '" + $scope.db_prepare_string( $scope.measurements_jacket_fullshoulder ) + "', \
												jacket_chest = '" + $scope.db_prepare_string( $scope.measurements_jacket_chest ) + "', \
												jacket_front = '" + $scope.db_prepare_string( $scope.measurements_jacket_front ) + "', \
												jacket_back = '" + $scope.db_prepare_string( $scope.measurements_jacket_back ) + "', \
												jacket_stomach = '" + $scope.db_prepare_string( $scope.measurements_jacket_stomach ) + "', \
												jacket_hips = '" + $scope.db_prepare_string( $scope.measurements_jacket_hips ) + "', \
												jacket_lengthfront = '" + $scope.db_prepare_string( $scope.measurements_jacket_lengthfront ) + "', \
												jacket_lengthback = '" + $scope.db_prepare_string( $scope.measurements_jacket_lengthback ) + "', \
												jacket_sleeve = '" + $scope.db_prepare_string( $scope.measurements_jacket_sleeve ) + "', \
												jacket_armsize = '" + $scope.db_prepare_string( $scope.measurements_jacket_armsize ) + "', \
												jacket_cuff = '" + $scope.db_prepare_string( $scope.measurements_jacket_cuff ) + "', \
												pants_waist = '" + $scope.db_prepare_string( $scope.measurements_pants_waist ) + "', \
												pants_hips = '" + $scope.db_prepare_string( $scope.measurements_pants_hips ) + "', \
												pants_crotch = '" + $scope.db_prepare_string( $scope.measurements_pants_crotch ) + "', \
												pants_thigh = '" + $scope.db_prepare_string( $scope.measurements_pants_thigh ) + "', \
												pants_length = '" + $scope.db_prepare_string( $scope.measurements_pants_length ) + "', \
												pants_bottom = '" + $scope.db_prepare_string( $scope.measurements_pants_bottom ) + "', \
												shoes_size = '" + $scope.db_prepare_string( $scope.measurements_shoes_size ) + "', \
												waistcoat_lengthfront = '" + $scope.db_prepare_string( $scope.measurements_waistcoat_lengthfront ) + "', \
												waistcoat_lengthback = '" + $scope.db_prepare_string( $scope.measurements_waistcoat_lengthback ) + "', \
												silhouette_height = '" + $scope.db_prepare_string( $scope.measurements_silhouette_height ) + "', \
												silhouette_weight = '" + $scope.db_prepare_string( $scope.measurements_silhouette_weight ) + "', \
												silhouette_shoulder = '" + $scope.db_prepare_string( $scope.measurements_silhouette_shoulder ) + "', \
												silhouette_neck = '" + $scope.db_prepare_string( $scope.measurements_silhouette_neck ) + "', \
												silhouette_posture = '" + $scope.db_prepare_string( $scope.measurements_silhouette_posture ) + "', \
												silhouette_chest = '" + $scope.db_prepare_string( $scope.measurements_silhouette_chest ) + "', \
												comments = '" + $scope.db_prepare_string( $scope.measurements_comments ) + "', \
												active = 1\
												WHERE id = " + $scope.measurements_id;

					tx.executeSql(
						sql_save_measurements, 
						[], 
						function(tx, results) {

							tmp_client_id = $scope.measurements_id;
							console.log('FN clientMeasurementsSave > DB > ' + sql_save_measurements);

						}, 
						tx_error
					);*/

				}
				/*else {*/

					var sql_save_measurements = "INSERT INTO measurements (\
													client_id, \
													date, \
													type, \
													unit_size, \
													unit_weight, \
													jacket_neck, \
													jacket_fullshoulder, \
													jacket_chest, \
													jacket_front, \
													jacket_back, \
													jacket_stomach, \
													jacket_hips, \
													jacket_lengthfront, \
													jacket_lengthback, \
													jacket_sleeve, \
													jacket_armsize, \
													jacket_cuff, \
													pants_waist, \
													pants_hips, \
													pants_crotch, \
													pants_thigh, \
													pants_length, \
													pants_bottom, \
													shoes_size, \
													waistcoat_lengthfront, \
													waistcoat_lengthback, \
													silhouette_height, \
													silhouette_weight, \
													silhouette_shoulder, \
													silhouette_neck, \
													silhouette_posture, \
													silhouette_chest, \
													comments, \
													active \
												) \
												VALUES (\
													'" + $scope.client_id + "', \
													'" + today + "', \
													'body', \
													'" + $scope.db_prepare_string( $scope.measurements_unitsize ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_unitweight ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_jacket_neck ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_jacket_fullshoulder ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_jacket_chest ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_jacket_front ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_jacket_back ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_jacket_stomach ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_jacket_hips ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_jacket_lengthfront ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_jacket_lengthback ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_jacket_sleeve ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_jacket_armsize ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_jacket_cuff ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_pants_waist ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_pants_hips ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_pants_crotch ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_pants_thigh ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_pants_length ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_pants_bottom ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_shoes_size ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_waistcoat_lengthfront ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_waistcoat_lengthback ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_silhouette_height ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_silhouette_weight ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_silhouette_shoulder ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_silhouette_neck ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_silhouette_posture ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_silhouette_chest ) + "', \
													'" + $scope.db_prepare_string( $scope.measurements_comments ) + "', \
													1\
												)";

					tx.executeSql(
						sql_save_measurements, 
						[], 
						function(tx, results) {

							tmp_client_id = results.insertId;
							console.log('FN clientMeasurementsSave > DB > ' + sql_save_measurements);

						}, 
						tx_error
					);

				//}

			}, tx_error, function(){

				if (tmp_client_id) {
					$scope.$apply(function() {

						if ($scope.order_id != undefined) {
							$location.path( '/order' ).search( 'client_id' , $scope.client_id).search( 'order_id' , $scope.order_id).search( 'measurements_id' , tmp_client_id).search( 'opencart' , '1');
						}
						else
							$location.path( '/clients-client' ).search( 'do' , 'viewclient').search( 'client_id' , $scope.client_id);

					});
				}

			});

		} else {

			console.log('FN clientMeasurementsSave > form not complete');
			ngDialog.open({
				template: 'partials/dialog-msg.html',
				data: {question: $translate.instant('i18n_forms_controls_allfieldsrequired')},
				className: 'ngdialog-theme-default'
			});

		}

		//alert(sql_save_measurements);
	}

	$scope.countries = [
						{code: 'AF', name: 'Afghanistan'}, 
						{code: 'AL', name: 'Albania'}, 
						{code: 'DZ', name: 'Algeria'}, 
						{code: 'AS', name: 'American Samoa'}, 
						{code: 'AD', name: 'Andorre'}, 
						{code: 'AO', name: 'Angola'}, 
						{code: 'AI', name: 'Anguilla'}, 
						{code: 'AQ', name: 'Antarctica'}, 
						{code: 'AG', name: 'Antigua and Barbuda'}, 
						{code: 'AR', name: 'Argentina'}, 
						{code: 'AM', name: 'Armenia'}, 
						{code: 'AW', name: 'Aruba'}, 
						{code: 'AU', name: 'Australia'}, 
						{code: 'AT', name: 'Austria'}, 
						{code: 'AZ', name: 'Azerbaijan'}, 
						{code: 'BS', name: 'Bahamas'}, 
						{code: 'BH', name: 'Bahrain'}, 
						{code: 'BD', name: 'Bangladesh'}, 
						{code: 'BB', name: 'Barbade'}, 
						{code: 'BY', name: 'Belarus'}, 
						{code: 'BE', name: 'Belgium'}, 
						{code: 'BZ', name: 'Belize'}, 
						{code: 'BJ', name: 'Benin'}, 
						{code: 'BM', name: 'Bermuda'}, 
						{code: 'BT', name: 'Bhutan'}, 
						{code: 'BO', name: 'Bolivia'}, 
						{code: 'BQ', name: 'Bonaire, Sint Eustatius and Saba'}, 
						{code: 'BA', name: 'Bosnia and Herzegovina'}, 
						{code: 'BW', name: 'Botswana'}, 
						{code: 'BV', name: 'Bouvet Island'}, 
						{code: 'BR', name: 'Brazil'}, 
						{code: 'IO', name: 'British Indian Ocean Territory'}, 
						{code: 'VG', name: 'British Virgin Islands'}, 
						{code: 'BN', name: 'Brunei'}, 
						{code: 'BG', name: 'Bulgaria'}, 
						{code: 'BF', name: 'Burkina Faso'}, 
						{code: 'BI', name: 'Burundi'}, 
						{code: 'KH', name: 'Cambodia'}, 
						{code: 'CM', name: 'Cameroon'}, 
						{code: 'CA', name: 'Canada'}, 
						{code: 'CV', name: 'Cape Verde'}, 
						{code: 'KY', name: 'Cayman Islands'}, 
						{code: 'CF', name: 'Central African Republic'}, 
						{code: 'TD', name: 'Chad'}, 
						{code: 'CL', name: 'Chile'}, 
						{code: 'CN', name: 'China'}, 
						{code: 'CX', name: 'Christmas Island'}, 
						{code: 'CC', name: 'Cocos (Keeling) Islands'}, 
						{code: 'CO', name: 'Colombia'}, 
						{code: 'KM', name: 'Comoros'}, 
						{code: 'CG', name: 'Congo'}, 
						{code: 'CD', name: 'Congo (Dem. Rep.)'}, 
						{code: 'CK', name: 'Cook Islands'}, 
						{code: 'CR', name: 'Costa Rica'}, 
						{code: 'ME', name: 'Crna Gora'}, 
						{code: 'HR', name: 'Croatia'}, 
						{code: 'CU', name: 'Cuba'}, 
						{code: 'CW', name: 'Curaçao'}, 
						{code: 'CY', name: 'Cyprus'}, 
						{code: 'CZ', name: 'Czech Republic'}, 
						{code: 'CI', name: "Côte D'Ivoire"}, 
						{code: 'DK', name: 'Denmark'}, 
						{code: 'DJ', name: 'Djibouti'}, 
						{code: 'DM', name: 'Dominica'}, 
						{code: 'DO', name: 'Dominican Republic'}, 
						{code: 'TL', name: 'East Timor'}, 
						{code: 'EC', name: 'Ecuador'}, 
						{code: 'EG', name: 'Egypt'}, 
						{code: 'SV', name: 'El Salvador'}, 
						{code: 'GQ', name: 'Equatorial Guinea'}, 
						{code: 'ER', name: 'Eritrea'}, 
						{code: 'EE', name: 'Estonia'}, 
						{code: 'ET', name: 'Ethiopia'}, 
						{code: 'FK', name: 'Falkland Islands'}, 
						{code: 'FO', name: 'Faroe Islands'}, 
						{code: 'FJ', name: 'Fiji'}, 
						{code: 'FI', name: 'Finland'}, 
						{code: 'FR', name: 'France'}, 
						{code: 'GF', name: 'French Guiana'}, 
						{code: 'PF', name: 'French Polynesia'}, 
						{code: 'TF', name: 'French Southern Territories'}, 
						{code: 'GA', name: 'Gabon'}, 
						{code: 'GM', name: 'Gambia'}, 
						{code: 'GE', name: 'Georgia'}, 
						{code: 'DE', name: 'Germany'}, 
						{code: 'GH', name: 'Ghana'}, 
						{code: 'GI', name: 'Gibraltar'}, 
						{code: 'GR', name: 'Greece'}, 
						{code: 'GL', name: 'Greenland'}, 
						{code: 'GD', name: 'Grenada'}, 
						{code: 'GP', name: 'Guadeloupe'}, 
						{code: 'GU', name: 'Guam'}, 
						{code: 'GT', name: 'Guatemala'}, 
						{code: 'GG', name: 'Guernsey and Alderney'}, 
						{code: 'GN', name: 'Guinea'}, 
						{code: 'GW', name: 'Guinea-Bissau'}, 
						{code: 'GY', name: 'Guyana'}, 
						{code: 'HT', name: 'Haiti'}, 
						{code: 'HM', name: 'Heard and McDonald Islands'}, 
						{code: 'HN', name: 'Honduras'}, 
						{code: 'HK', name: 'Hong Kong'}, 
						{code: 'HU', name: 'Hungary'}, 
						{code: 'IS', name: 'Iceland'}, 
						{code: 'IN', name: 'India'}, 
						{code: 'ID', name: 'Indonesia'}, 
						{code: 'IR', name: 'Iran'}, 
						{code: 'IQ', name: 'Iraq'}, 
						{code: 'IE', name: 'Ireland'}, 
						{code: 'IM', name: 'Isle of Man'}, 
						{code: 'IL', name: 'Israel'}, 
						{code: 'IT', name: 'Italy'}, 
						{code: 'JM', name: 'Jamaica'}, 
						{code: 'JP', name: 'Japan'}, 
						{code: 'JE', name: 'Jersey'}, 
						{code: 'JO', name: 'Jordan'}, 
						{code: 'KZ', name: 'Kazakhstan'}, 
						{code: 'KE', name: 'Kenya'}, 
						{code: 'KI', name: 'Kiribati'}, 
						{code: 'KP', name: 'Korea (North)'}, 
						{code: 'KR', name: 'Korea (South)'}, 
						{code: 'KW', name: 'Kuwait'}, 
						{code: 'KG', name: 'Kyrgyzstan'}, 
						{code: 'LA', name: 'Laos'}, 
						{code: 'LV', name: 'Latvia'}, 
						{code: 'LB', name: 'Lebanon'}, 
						{code: 'LS', name: 'Lesotho'}, 
						{code: 'LR', name: 'Liberia'}, 
						{code: 'LY', name: 'Libya'}, 
						{code: 'LI', name: 'Liechtenstein'}, 
						{code: 'LT', name: 'Lithuania'}, 
						{code: 'LU', name: 'Luxembourg'}, 
						{code: 'MO', name: 'Macao'}, 
						{code: 'MK', name: 'Macedonia'}, 
						{code: 'MG', name: 'Madagascar'}, 
						{code: 'MW', name: 'Malawi'}, 
						{code: 'MY', name: 'Malaysia'}, 
						{code: 'MV', name: 'Maldives'}, 
						{code: 'ML', name: 'Mali'}, 
						{code: 'MT', name: 'Malta'}, 
						{code: 'MH', name: 'Marshall Islands'}, 
						{code: 'MQ', name: 'Martinique'}, 
						{code: 'MR', name: 'Mauritania'}, 
						{code: 'MU', name: 'Mauritius'}, 
						{code: 'YT', name: 'Mayotte'}, 
						{code: 'MX', name: 'Mexico'}, 
						{code: 'FM', name: 'Micronesia'}, 
						{code: 'MD', name: 'Moldova'}, 
						{code: 'MC', name: 'Monaco'}, 
						{code: 'MN', name: 'Mongolia'}, 
						{code: 'MS', name: 'Montserrat'}, 
						{code: 'MA', name: 'Morocco'}, 
						{code: 'MZ', name: 'Mozambique'}, 
						{code: 'MM', name: 'Myanmar'}, 
						{code: 'NA', name: 'Namibia'}, 
						{code: 'NR', name: 'Nauru'}, 
						{code: 'NP', name: 'Nepal'}, 
						{code: 'NL', name: 'Netherlands'}, 
						{code: 'AN', name: 'Netherlands Antilles'}, 
						{code: 'NC', name: 'New Caledonia'}, 
						{code: 'NZ', name: 'New Zealand'}, 
						{code: 'NI', name: 'Nicaragua'}, 
						{code: 'NE', name: 'Niger'}, 
						{code: 'NG', name: 'Nigeria'}, 
						{code: 'NU', name: 'Niue'}, 
						{code: 'NF', name: 'Norfolk Island'}, 
						{code: 'MP', name: 'Northern Mariana Islands'}, 
						{code: 'NO', name: 'Norway'}, 
						{code: 'OM', name: 'Oman'}, 
						{code: 'PK', name: 'Pakistan'}, 
						{code: 'PW', name: 'Palau'}, 
						{code: 'PS', name: 'Palestine'}, 
						{code: 'PA', name: 'Panama'}, 
						{code: 'PG', name: 'Papua New Guinea'}, 
						{code: 'PY', name: 'Paraguay'}, 
						{code: 'PE', name: 'Peru'}, 
						{code: 'PH', name: 'Philippines'}, 
						{code: 'PN', name: 'Pitcairn'}, 
						{code: 'PL', name: 'Poland'}, 
						{code: 'PT', name: 'Portugal'}, 
						{code: 'PR', name: 'Puerto Rico'}, 
						{code: 'QA', name: 'Qatar'}, 
						{code: 'RO', name: 'Romania'}, 
						{code: 'RU', name: 'Russia'}, 
						{code: 'RW', name: 'Rwanda'}, 
						{code: 'RE', name: 'Réunion'}, 
						{code: 'BL', name: 'Saint Barthélemy'}, 
						{code: 'SH', name: 'Saint Helena'}, 
						{code: 'KN', name: 'Saint Kitts and Nevis'}, 
						{code: 'LC', name: 'Saint Lucia'}, 
						{code: 'MF', name: 'Saint Martin'}, 
						{code: 'PM', name: 'Saint Pierre and Miquelon'}, 
						{code: 'VC', name: 'Saint Vincent and the Grenadines'}, 
						{code: 'WS', name: 'Samoa'}, 
						{code: 'SM', name: 'San Marino'}, 
						{code: 'SA', name: 'Saudi Arabia'}, 
						{code: 'SN', name: 'Senegal'}, 
						{code: 'RS', name: 'Serbia'}, 
						{code: 'SC', name: 'Seychelles'}, 
						{code: 'SL', name: 'Sierra Leone'}, 
						{code: 'SG', name: 'Singapore'}, 
						{code: 'SX', name: 'Sint Maarten'}, 
						{code: 'SK', name: 'Slovakia'}, 
						{code: 'SI', name: 'Slovenia'}, 
						{code: 'SB', name: 'Solomon Islands'}, 
						{code: 'SO', name: 'Somalia'}, 
						{code: 'ZA', name: 'South Africa'}, 
						{code: 'GS', name: 'South Georgia and the South Sandwich Islands'}, 
						{code: 'SS', name: 'South Sudan'}, 
						{code: 'ES', name: 'Spain'}, 
						{code: 'LK', name: 'Sri Lanka'}, 
						{code: 'SD', name: 'Sudan'}, 
						{code: 'SR', name: 'Suriname'}, 
						{code: 'SJ', name: 'Svalbard and Jan Mayen'}, 
						{code: 'SZ', name: 'Swaziland'}, 
						{code: 'SE', name: 'Sweden'}, 
						{code: 'CH', name: 'Switzerland'}, 
						{code: 'SY', name: 'Syria'}, 
						{code: 'ST', name: 'São Tomé and Príncipe'}, 
						{code: 'TW', name: 'Taiwan'}, 
						{code: 'TJ', name: 'Tajikistan'}, 
						{code: 'TZ', name: 'Tanzania'}, 
						{code: 'TH', name: 'Thailand'}, 
						{code: 'TG', name: 'Togo'}, 
						{code: 'TK', name: 'Tokelau'}, 
						{code: 'TO', name: 'Tonga'}, 
						{code: 'TT', name: 'Trinidad and Tobago'}, 
						{code: 'TN', name: 'Tunisia'}, 
						{code: 'TR', name: 'Turkey'}, 
						{code: 'TM', name: 'Turkmenistan'}, 
						{code: 'TC', name: 'Turks and Caicos Islands'}, 
						{code: 'TV', name: 'Tuvalu'}, 
						{code: 'UG', name: 'Uganda'}, 
						{code: 'UA', name: 'Ukraine'}, 
						{code: 'AE', name: 'United Arab Emirates'}, 
						{code: 'GB', name: 'United Kingdom'}, 
						{code: 'UM', name: 'United States Minor Outlying Islands'}, 
						{code: 'US', name: 'United States of America'}, 
						{code: 'UY', name: 'Uruguay'}, 
						{code: 'UZ', name: 'Uzbekistan'}, 
						{code: 'VU', name: 'Vanuatu'}, 
						{code: 'VA', name: 'Vatican City'}, 
						{code: 'VE', name: 'Venezuela'}, 
						{code: 'VN', name: 'Vietnam'}, 
						{code: 'VI', name: 'Virgin Islands of the United States'}, 
						{code: 'WF', name: 'Wallis and Futuna'}, 
						{code: 'EH', name: 'Western Sahara'}, 
						{code: 'YE', name: 'Yemen'}, 
						{code: 'ZM', name: 'Zambia'}, 
						{code: 'ZW', name: 'Zimbabwe'}, 
						{code: 'AX', name: 'Åland Islands'}
					  ];

	/*
	 * 
	 */
	$scope.clientCountryDisplay = function (code) {

				
		/*angular.forEach($scope.countries, function(value, key) {
		}*/

	}


	/*
	 * Load measurements from database, if no measurements_id set, display last measurements for size unit
	 */
	$scope.clientMeasurementsLoad = function (measurements_id, unit_measurements, unit_weight, unit_size, measurements_allowances) {

		console.log('');
		console.log('FN clientMeasurementsLoad > start');

		/**/
		//alert(unit_measurements);
		/*$scope.measurements_unitsize = settings['unit_measurements'];
		$scope.measurements_unitweight = settings['unit_weight'];*/
		$scope.measurements_unitsize = 'cm';
		$scope.measurements_unitweight = 'kg';

		$scope.measurements_show_allowances = 'true';

		// If measurements_id load it, if not load previous client measurements, if not don't load anything
		if ( measurements_id > 0 ) {

			console.log('FN clientMeasurementsLoad > measurements_id: ' + measurements_id);

			$scope.measurements_save_button_label = $translate.instant('i18n_common_btn_saveacopy');

			db.transaction(function(tx) {

				var sql_load_measurements = "SELECT * FROM measurements WHERE id = " + measurements_id;

				tx.executeSql(
					sql_load_measurements, 
					[], 
					function(tx, results) {

						console.log('FN clientMeasurementsLoad > DB > ' + sql_load_measurements);

						// parseFloat()
						var measurements = results.rows.item(0);
						$scope.measurements_jacket_neck = ( measurements.jacket_neck );
						$scope.measurements_jacket_fullshoulder = ( measurements.jacket_fullshoulder );
						$scope.measurements_jacket_chest = ( measurements.jacket_chest );
						$scope.measurements_jacket_front = ( measurements.jacket_front );
						$scope.measurements_jacket_back = ( measurements.jacket_back );
						$scope.measurements_jacket_stomach = ( measurements.jacket_stomach );
						$scope.measurements_jacket_hips = ( measurements.jacket_hips );
						$scope.measurements_jacket_lengthfront = ( measurements.jacket_lengthfront );
						$scope.measurements_jacket_lengthback = ( measurements.jacket_lengthback );
						$scope.measurements_jacket_sleeve = ( measurements.jacket_sleeve );
						$scope.measurements_jacket_armsize = ( measurements.jacket_armsize );
						$scope.measurements_jacket_cuff = ( measurements.jacket_cuff );
						$scope.measurements_pants_waist = ( measurements.pants_waist );
						$scope.measurements_pants_hips = ( measurements.pants_hips );
						$scope.measurements_pants_crotch = ( measurements.pants_crotch );
						$scope.measurements_pants_thigh = ( measurements.pants_thigh );
						$scope.measurements_pants_length = ( measurements.pants_length );
						$scope.measurements_pants_bottom = ( measurements.pants_bottom );
						$scope.measurements_shoes_size = ( measurements.shoes_size );
						$scope.measurements_waistcoat_lengthfront = ( measurements.waistcoat_lengthfront );
						$scope.measurements_waistcoat_lengthback = ( measurements.waistcoat_lengthback );
						$scope.measurements_silhouette_height = ( measurements.silhouette_height );
						$scope.measurements_silhouette_weight = ( measurements.silhouette_weight );
						$scope.measurements_silhouette_shoulder = measurements.silhouette_shoulder;
						$scope.measurements_silhouette_neck = measurements.silhouette_neck;
						$scope.measurements_silhouette_posture = measurements.silhouette_posture;
						$scope.measurements_silhouette_chest = measurements.silhouette_chest;
						$scope.measurements_comments = measurements.comments;

						$scope.$apply();
					}, 
					tx_error
				);
			});

		} else {

			$scope.measurements_save_button_label = $translate.instant('i18n_common_btn_save');

			$scope.measurements_silhouette_shoulder = 'normal';
			$scope.measurements_silhouette_neck = 'normal';
			$scope.measurements_silhouette_posture = 'normal';
			$scope.measurements_silhouette_chest = 'normal';
		}

	}


	/*
	 * Display all orders (sales page)
	 */
	$scope.ordersDisplayOrders = function () {

		console.log('');
		console.log('FN ordersDisplayOrders > start');

		var sql_criteria = " WHERE 1";

		if ($scope.orders_filter_search != undefined) {

			// Clean search field
			var keywords = $scope.orders_filter_search;
			keywords = keywords.replace("'", "");
			keywords = keywords.replace("%", "");
			keywords = keywords.replace('"', '');

			if (keywords != '') {
				sql_criteria = sql_criteria + " AND (C.company LIKE '%"+keywords+"%' OR C.firstname LIKE '%"+keywords+"%' OR C.lastname LIKE '%"+keywords+"%' OR B.tracking_number LIKE '%"+keywords+"%')";
			}
		}

		if ($scope.orders_filter_cart != undefined && $scope.orders_filter_cart == true) {
			
		}
		else {
			sql_criteria = sql_criteria + " AND A.order_status <> 'cart'";
		}

		db.transaction(function(tx) {

			var sql_load_clients_orders = "SELECT A.*, COUNT(B.quantity) as nbr_products, SUM(B.quantity) as nbr_total_products, \
												C.firstname, C.lastname \
										 FROM \
											orders as A \
											LEFT OUTER JOIN orders_lines as B ON A.id = B.order_id \
											LEFT OUTER JOIN clients as C ON A.client_id = C.id \
										 "+sql_criteria+" \
										 GROUP BY A.id \
										 ORDER BY A.id DESC";
			tx.executeSql(
				sql_load_clients_orders, 
				[], 
				function(tx, results) {

					console.log('FN ordersDisplayOrders > DB > ' + sql_load_clients_orders);

					$scope.orders = [];

					for (var i=0; i<results.rows.length; i++) {

						var order = results.rows.item(i);

						// Order button label
						order['order_status2'] = $translate.instant('i18n_orders_status_'+order.order_status);

						//clientsDisplayOrderPanel('+order.id+')
						//openAside('right', true, 'cart.html', 'md')

						// Nbr products
						if (order.nbr_total_products != null && order.nbr_products != order.nbr_total_products)
							order['nbr_products_2'] = order.nbr_total_products;
							//order['nbr_products_2'] = order.nbr_products + ' (' + order.nbr_total_products + ')';
						else
							order['nbr_products_2'] = order.nbr_products;
						order['order_number'] = $scope.orderBuildOrderNumber(order.id, order.client_id);

						// Payment Status
						order['payment_status2'] = $translate.instant('i18n_paymentstatus_' + order.payment_status);

						$scope.orders.push(order);
					}

					// Pagination
					$scope.ordersFiltered = [];
					$scope.orders_currentpage = 1;
					$scope.orders_perpage = 5;
					$scope.orders_total_orders = $scope.orders.length;
					$scope.clientOrdersChangePage(1);

					$scope.$apply();

				}, 
				tx_error
			);
		});

	}

	init();

}]);