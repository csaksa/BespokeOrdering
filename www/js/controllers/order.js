
probespokeApp.controller('OrderCtrl',
						['$rootScope', '$scope', '$log', '$route', '$routeParams', '$location', '$http', '$translate', '$uibModal', 'ngCart', 'ngDialog', '$sce', '$timeout',
						function ($rootScope, $scope, $log, $route, $routeParams, $location, $http, $translate, $uibModal, ngCart, ngDialog, $sce, $timeout) {

	// Set required ngCart values
	ngCart.setTaxRate(1);
	ngCart.setShipping(1);
		$scope.test_model = 'tata';

	$rootScope.h1 = '';

	$scope.orderCurrentClientId = null;
	$rootScope.orderCurrentMeasurementsId = null;

	/*$scope.orderCurrentOrderId = null;
	$scope.orderCurrentOrderLineId = null;
	$scope.orderCurrentOrderLineParentId = null;
*/
	if($rootScope.order_line_order_id){$scope.orderCurrentOrderId = $rootScope.order_line_order_id;}
	else{$scope.orderCurrentOrderId = null};
	$rootScope.order_line_order_id=null;
	$scope.orderCurrentOrderLineParentId
	$scope.orderCurrentOrderLineId = null

	$scope.orderCurrentProductId = null;
	$scope.orderCurrentProductSteps = null;
	$scope.orderCurrentScreen = null;
	$scope.progressPercentage = 0;

	$rootScope.orderCartShow = true;
	$rootScope.orderCartEmpty = true;
	//$rootScope.orderCartProducts = 0;

	$rootScope.order_cart_photos = false;

	$scope.product_options_json = {};

	// Pages
	$scope.show_products_page = false;
	$scope.show_customize_page = false;
	$scope.show_transmit_page = false;

	// Show
	$scope.show_endofcustomization = false;
	$scope.show_previousbtn = false;
	$scope.show_nextbtn = false;
	$scope.show_progressbar = false;

	$scope.fast_customisation = false;

	$rootScope.cart_show_btn_fillmeasurements = false;
	$rootScope.cart_show_btn_takephotos = false;
	$rootScope.cart_show_btn_submitorder = false;

	// Clean
	ngCart.empty();
	jQuery( "#options-grid" ).empty();

	$rootScope.cartTabsIsActive = [{active:true},{active:false},{active:false}];

	$rootScope.cartTabsSelectProductsTab = function () {
		$rootScope.cartTabsIsActive[0].active = true;
	}

	$rootScope.cartTabsSelectMeasurementsTab = function () {
		$rootScope.cartTabsIsActive[1].active = true;
	}

	$rootScope.cartTabsSelectPhotosTab = function () {
		$rootScope.cartTabsIsActive[2].active = true;
	}

	var a_matchedproduct_ids_nochange = ["301", "302", "303", "304","401", "402", "403", "404", "501", "502", "503", "504"];

	var a_matching_fields = new Array();
	a_matching_fields[5] = '{"501":[{"product_id":3,"field_id":301,"5011":"3011","5012":"3012","5013":"3013","5014":"3014","5015":"3015","5016":"3016","5017":"3017"},{"product_id":4,"field_id":401,"5011":"4011","5012":"4012","5013":"4013","5014":"4014","5015":"4015","5016":"4016","5017":"4017"}],"502":[{"product_id":3,"field_id":302},{"product_id":4,"field_id":402}],"503":[{"product_id":3,"field_id":303,"5031":"3031","5032":"3032"},{"product_id":4,"field_id":403,"5031":"4031","5032":"4032"}],"504":[{"product_id":3,"field_id":304},{"product_id":4,"field_id":404}]}';
	a_matching_fields[4] = '{"401":[{"product_id":3,"field_id":301,"4011":"3011","4012":"3012","4013":"3013","4014":"3014","4015":"3015","4016":"3016","4017":"3017"},{"product_id":5,"field_id":501,"4011":"5011","4012":"5012","4013":"5013","4014":"5014","4015":"5015","4016":"5016","4017":"5017"}],"402":[{"product_id":3,"field_id":302},{"product_id":5,"field_id":502}],"403":[{"product_id":3,"field_id":303,"4031":"3031","4032":"3032"},{"product_id":5,"field_id":503,"4031":"5031","4032":"5032"}],"404":[{"product_id":3,"field_id":304},{"product_id":5,"field_id":504}]}';
	a_matching_fields[3] = '{"301":[{"product_id":4,"field_id":401,"3011":"4011","3012":"4012","3013":"4013","3014":"4014","3015":"4015","3016":"4016","3017":"4017"},{"product_id":5,"field_id":501,"3011":"5011","3012":"5012","3013":"5013","3014":"5014","3015":"5015","3016":"5016","3017":"5017"}],"302":[{"product_id":4,"field_id":402},{"product_id":5,"field_id":502}],"303":[{"product_id":4,"field_id":403,"3031":"4031","3032":"4032"},{"product_id":5,"field_id":503,"3031":"5031","3032":"5032"}],"304":[{"product_id":4,"field_id":404},{"product_id":5,"field_id":504}],"305":[{"product_id":5,"field_id":505,"3052":"5057","3053":"5057","3054":"5057","3055":"5057","3056":"5057"}]}';


	/*
	 * Init
	 */
	var init = function () {

		console.log('');
		console.log('INIT > OrderCtrl');

		// Is client_id defined?
		if ($routeParams.client_id) {

			console.log('INIT > client_id: ' + $routeParams.client_id);

			$scope.orderCurrentClientId = $routeParams.client_id;
			$scope.orderLoadClient();
			$scope.orderLoadProducts();
			$scope.orderLoadProductsOptions();
			$scope.orderLoadProductsOptionsValues();
			$scope.orderLoadMeasurements();

			// Is order_id defined?
			if ($routeParams.order_id) {

				// Check if order is a cart
				db.transaction(function(tx) {

					var sql_check_cart_order = "SELECT * FROM orders WHERE id = '" + $routeParams.order_id + "' AND order_status = 'cart'";

					tx.executeSql(
						sql_check_cart_order,
						[],
						function(tx, results){

							console.log('INIT > DB > ' + sql_check_cart_order);
							var len = results.rows.length;

							// Order is a cart continue, else redirect to the client
							if (len > 0) {

								// Load cart
								$scope.orderCurrentOrderId = $routeParams.order_id;
								$rootScope.orderCurrentMeasurementsId = results.rows.item(0).measurements_id;
								$scope.cartLoadCart($routeParams.opencart);

								// We come back from measurements creation
								if ($routeParams.measurements_id && $routeParams.measurements_id != 'new') {
									$rootScope.orderAsignMeasurementsToOrder($routeParams.measurements_id);
									$rootScope.cartTabsSelectMeasurementsTab();
								}

								// Show available products
								$scope.show_products_page = true;

							} else {

								console.log('INIT > order is not a cart, redirect');
								$scope.go2('/clients-client', 'client_id', $scope.orderCurrentClientId);

							}

						},
						tx_error
					);

				});

			} else {

				// Show available products
				$scope.show_products_page = true;

			}

		}
		else {

			console.log('INIT > no client selected, redirect');
			$scope.go('/clients', 'do', 'select-client-order');

		}
	};


	/*
	 * Load client
	 */
	$scope.orderLoadClient = function() {

		console.log('');
		console.log('FN orderLoadClient > start');

		db.transaction(function(tx) {

			var sql_get_client = "SELECT * FROM clients WHERE id = " + $scope.orderCurrentClientId;

			tx.executeSql(
				sql_get_client,
				[],
				function(tx, results) {

					console.log('FN orderLoadClient > DB > '+ sql_get_client);

					$rootScope.clients = [];

					if (results.rows.length > 0) {

						var client = results.rows.item(0);
						//$scope.client = results.rows.item(0);

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

						// Flag to true if all photos are available
						if (client.photo_front != null && client.photo_front != '' &&
							client.photo_side != null && client.photo_side != '' &&
							client.photo_back != null && client.photo_back != '')
							$rootScope.order_cart_photos = true;

						$rootScope.clients.push(client);

						$scope.$apply();

					}

				},
				tx_error
			);

		});

	};


	/*
	 * Load products
	 */
	$scope.orderLoadProducts = function() {

		console.log('');
		console.log('FN orderLoadProducts > start');

		db.transaction(function(tx) {

			var sql_get_products = "SELECT * FROM products WHERE active = 1 ORDER BY fieldorder";
			tx.executeSql(
				sql_get_products,
				[],
				function(tx, results) {

					console.log('FN orderLoadProducts > DB > '+ sql_get_products);

					$scope.products = [];

					for (var i=0; i<results.rows.length; i++) {

						var product = results.rows.item(i);
						product['name'] = $scope.i18n_from_db(product);
						$scope.products.push(product);
						//$scope.products[ results.rows.item(i).id ] = product;

					}
					$scope.$apply();
					console.log('FN orderLoadProducts > '+ results.rows.length +' products loaded');

				},
				tx_error
			);

		});

	};


	/*
	 * Load products options
	 */
	$scope.orderLoadProductsOptions = function() {

		db.transaction(function(tx) {

			var sql_get_products = "SELECT * FROM products_options";
			tx.executeSql(
				sql_get_products,
				[],
				function(tx, results) {

					console.log('FN orderLoadProductsOptions > DB > '+ sql_get_products);

					$scope.products_options = [];

					for (var i=0; i<results.rows.length; i++) {

						var line = results.rows.item(i);
						$scope.products_options[line.id] = line;

					}

				},
				tx_error
			);

		});

	}

	/*
	 * Load products options values
	 */
	$scope.orderLoadProductsOptionsValues = function() {

		db.transaction(function(tx) {

			var sql_get_products = "SELECT * FROM products_options_values";
			tx.executeSql(
				sql_get_products,
				[],
				function(tx, results) {

					console.log('FN orderLoadProductsOptionsValues > DB > '+ sql_get_products);

					$scope.products_options_values = [];

					for (var i=0; i<results.rows.length; i++) {

						var line = results.rows.item(i);
						$scope.products_options_values[line.id] = line;

					}

				},
				tx_error
			);

		});

	}


	/*
	 * Load measurements
	 */
	$scope.orderLoadMeasurements = function() {

		console.log('');
		console.log('FN orderLoadMeasurements > start');

		db.transaction(function(tx) {

			var sql_get_measurements = "SELECT * FROM measurements WHERE client_id = " + $scope.orderCurrentClientId + " AND active = 1 ORDER BY id DESC";
			tx.executeSql(
				sql_get_measurements,
				[],
				function(tx, results) {

					console.log('FN orderLoadMeasurements > DB > '+ sql_get_measurements);

					$rootScope.measurements = [];

					for (var i=0; i<results.rows.length; i++) {

						var line = results.rows.item(i);
						$rootScope.measurements.push(line);
					}
					$scope.$apply();
					console.log('FN orderLoadMeasurements > '+ results.rows.length +' measurements loaded');

				},
				tx_error
			);

		});

	};


	$rootScope.rootLoadCart = function() {
		$scope.cartLoadCart();
	}

	/*
	 *
	 */
	$scope.cartLoadCart = function (opencart) {

		console.log('');
		console.log('FN cartLoadCart > start');

		db.transaction(function(tx) {

			var query = "SELECT * FROM orders_lines WHERE order_id = " + $scope.orderCurrentOrderId + " ORDER BY id";
			tx.executeSql(
				query,
				[],
				function(tx, results){

					console.log('');
					console.log('FN cartLoadCart > DB > ' + query);

					ngCart.empty();

					if (results.rows.length > 0) {

						$rootScope.orderCartEmpty = false;
						$rootScope.orderCartProducts = results.rows.length;
						$rootScope.orderCartProductsTotal = 0;
						for (var i=0; i < results.rows.length; i++) {

							var line = results.rows.item(i);

							ngCart.addItem(line.id, line.product_id, $scope.orderCartProductName(line.name, line.product_id), 1, line.quantity, line.status, line.fabric_id, line.parent_id, "item");

							$rootScope.orderCartProductsTotal = $rootScope.orderCartProductsTotal + line.quantity;

						}
						console.log('FN cartLoadCart > nbr products: ' + $rootScope.orderCartProducts);

						if ($scope.asideState.open == false && opencart == 1) {
							$scope.openAside('right', true, 'cart.html', 'md');
						}

						$scope.$apply();

					} else {

						$rootScope.orderCartEmpty = true;
						$scope.product_options_json = {};
						jQuery( "#options-grid" ).empty();
						$rootScope.orderCartProducts = 0;
						$rootScope.orderCartProductsTotal = 0;
						console.log('FN cartLoadCart > empty cart');
						$scope.$apply();

					}

					console.log('FN cartLoadCart > end');
					console.log('');

				},
				function(tx, error){ tx_error_adv(query, tx, error) }
			);

		});

	}

	/*
	 *
	 */
	$scope.orderPage = function (product_id, screen) {

		console.log('');
		console.log('FN orderPage > start');

		var last_option_group;

		db.transaction(function(tx) {

			var query = "SELECT * FROM products_pages WHERE product_id = " + product_id + " AND page_id = " + screen;
			tx.executeSql(
				query,
				[],
				function(tx, results) {

					console.log('FN orderPage > DB > '+ query);

					$scope.product_page = results.rows.item(0);
					$rootScope.h1 = $scope.i18n_from_db( $scope.product_page );
					$scope.$apply();

				},
				function(tx, error){ tx_error_adv(query, tx, error) }
			);

			var sql_product_options = "SELECT * FROM products_options WHERE product_id = " + product_id + " AND screen = " + screen + " AND hidden = 0 AND active = 1 ORDER BY sort";

			tx.executeSql(
				sql_product_options,
				[],
				function(tx, results){

					console.log('FN orderPage > DB > ' + sql_product_options);

					$scope.screen_options = [];

					for (var i=0; i < results.rows.length; i++) {

						$scope.orderWriteProductOptions(results.rows.item(i), last_option_group);

					}

				},
				tx_error
			);

		});

	}


	/*
	 *
	 */
	$scope.orderWriteProductOptions = function (option, last_option_group) {

		var html;

		$scope.screen_options.push(option);

		//console.log($scope.product_options_json);

		// News row? css clear before
		var css_clear_before = '';
		if (option.option_group != last_option_group)
			css_clear_before = ' clear-before';

		html =  '<div id="opt_' + option.id + '" data-parent_id="' + option.parent_id + '" class="option form-group ' + css_clear_before + '">\
					<div style="' + option.css + '" class="' + option.class + '">';

		// Display label
		if ( option.display_label == 1 )
			html +=  '<label>' + $scope.i18n_from_db(option) + '</label>';
		else
			html +=  '<label> </label>';

		// Disabled field?
		var disabled = '';
		if ( $scope.orderCurrentOrderLineParentId != null && $scope.orderCurrentOrderLineParentId > 0 ) {
			if ( inArray( option.id, a_matchedproduct_ids_nochange) )
				disabled = ' disabled="disabled"';
		}

		// Required field?
		var required = '';
		if ( option.required == 1 ) {
			required = ' required="required"';
		}

		if (option.type == 'image') {
//[' + css_clear_before+option.option_group+last_option_group + ']
			html += '<div class="images" data-optionid="' + option.id + '"></div>';

		}
		else if (option.type == 'select') {

			html += '<select class="form-control" name="' + option.id + '" data-optionid="' + option.id + '" onchange="orderProductOptionsOnChange(this)"' + required + disabled + '">\
					 </select>';

		}
		else if (option.type == 'color') {

			html += '<input type="text" class="form-control" name="' + option.id + '" data-optionid="' + option.id + '" value="' + input_value + '">';

		}
		else if (option.type == 'checkbox') {

			html += '<input type="text" class="form-control" name="' + option.id + '" data-optionid="' + option.id + '">';/*\
					 <div class="checkbox-inline" style="background:yellow;">\
					 <input type="checkbox" class="form-control" name="' + option.id + '" data-optionid="' + option.id + '" style="position:absolute; margin-top:-20px;">\
					 </div>';*/

		}
		else if (option.type == 'textarea') {

			var input_value = '';
			if ($scope.product_options_json[option.id])
				input_value = $scope.product_options_json[option.id];

			html += '<textarea class="form-control" name="' + option.id + '" data-optionid="' + option.id + '"' + required + '>' + input_value + '</textarea>';

		}
		else {

			var input_value = '';
			if ($scope.product_options_json[option.id])
				input_value = $scope.product_options_json[option.id];

			html += '<input type="text" class="form-control" name="' + option.id + '" data-optionid="' + option.id + '" value="' + input_value + '" autocomplete="off" autocorrect="off" spellcheck="false"' + required + disabled + '>';

		}

		html += '	</div>\
				 </div>';

		// Append html
		if (option.parent_id != 0) {
			jQuery( "#options-grid #opt_"+option.parent_id ).append( html );
		} else {
			jQuery( "#options-grid" ).append( html );
		}
		last_option_group = option.option_group;
		$scope.orderWriteProductOptionsValues(option);

	};


	/*
	 *
	 */
	$scope.orderWriteProductOptionsValues = function (option) {

		db.transaction(function(tx) {
		// Get option values
			var sql_product_options_values = "SELECT * FROM products_options_values WHERE option_id = " + option.id + " AND active = 1 ORDER BY fieldorder";

			tx.executeSql(
				sql_product_options_values,
				[],
				function(tx, results2){

					console.log('FN orderWriteProductOptionsValues > DB > ' + sql_product_options_values);

					for (var j=0; j < results2.rows.length; j++) {
						var option_values = results2.rows.item(j);
						//console.log(option_values.en_US + ' / ' + option.id + ' / ' + option.type);
						//$scope.product_options_values.push(option_values);
						if (option.type == 'image') {

							// Set selected value or default value
							var selected = '';
							var checked = '';
							if ($scope.product_options_json[option.id]) {
								if ($scope.product_options_json[option.id] == option_values.id) {
									selected = ' selected';
									checked = ' checked="checked"';
									if (option_values.onselected != '')
										$scope.orderProductOptionOnSelected(option_values.onselected);
								}
							} else {
								if (option_values.selected == 'true') {
									selected = ' selected';
									checked = ' checked="checked"';
								}
							}

							// Image URI
							if (option_values.image == null || option_values.image == '')
								tmp_uri = 'img/products/blank.png';
							else
								tmp_uri = 'img/products/' + $scope.orderCurrentProductId + '/' + option.id + '/' + option_values.image + '.png';

							html = '<a id="opt_'+ option.id +'_'+option_values.id+ '" onclick="orderProductSelectImage('+ option.id +', '+option_values.id+')" class="optionradio'+selected+ '"><input type="radio" name="opt_'+ option.id + '" value="' +option_values.id+ '" data-onselected="' +option_values.onselected+ '" data-optionid="' + option.id + '"' +checked+'><img src="' + tmp_uri + '"><br>'+ $scope.i18n_from_db(option_values) +'</a>';
							jQuery( "#opt_"+ option.id +" .images[data-optionid="+ option.id +"]" ).append( html );
						}
						else if (option.type == 'select') {

							// Set selected value or default value
							var selected = '';
							if ($scope.product_options_json[option.id]) {
								if ($scope.product_options_json[option.id] == option_values.id) {
									selected = ' selected="selected"';
									if (option_values.onselected != '')
										$scope.orderProductOptionOnSelected(option_values.onselected);
								}
							} else {
								if (option_values.selected == 'true')
									selected = ' selected="selected"';
							}

							html = '<option'+selected+' value="' +option_values.id+ '" data-onselected="' +option_values.onselected+ '">'+ $scope.i18n_from_db(option_values)+'</option>';
							jQuery( "#opt_"+ option.id +" select[data-optionid="+ option.id +"]" ).append( html );
						}
					}

				},
				tx_error
			);
		});
	};


	/*
	 * Check if option have suboption (recursive)
	 */
	orderProductOptionsOnChange = function (el) {

		var selected_option_id = jQuery( el ).attr('data-optionid');
		var selected_option_value = jQuery( el ).val();

		console.log('select ' + selected_option_id + ' changed');

		jQuery( "#options-grid" ).find("[data-parent_id="+selected_option_id+"]").remove();

		var data_onselected = jQuery( el ).find("option[value="+selected_option_value+"]").attr('data-onselected');

		if (data_onselected != '') {
			$scope.orderProductOptionOnSelected(data_onselected);
			//$scope.orderWriteProductSubOptions(data_onselected);
		}

	}


	/*
	 *
	 */
	$scope.orderProductOptionOnSelected = function (suboptions) {

		console.log(suboptions);

		// Hide
		if ( suboptions.indexOf("HIDE") > -1 ) {

			var suboptions = eval( suboptions.replace(/HIDE/g, '') );

			suboptions.forEach(function(suboption_id) {

				//console.log(suboption_id);
				jQuery( '#opt_'+suboption_id ).remove();

			});

		// SUBOPTION
		} else if ( suboptions.indexOf("SHOW") > -1 ) {

			var suboptions = eval( suboptions.replace(/SHOW/g, '') );
			suboptions.forEach(function(suboption_id) {

				// Check if option already exists
				if ( !jQuery( '#opt_' + suboption_id ).length ) {

					db.transaction(function(tx) {

						var sql_product_suboptions = "SELECT * FROM products_options WHERE id = " + suboption_id + " AND active = 1";

						tx.executeSql(sql_product_suboptions, [], function(tx, results) {

							console.log('FN orderProductOptionOnSelected > DB > ' + sql_product_suboptions);

							for (var i=0; i < results.rows.length; i++) {
								$scope.orderWriteProductOptions(results.rows.item(i), '');
							}

						},
						tx_error);

					});

				}

			});

		}

	}

	/*
	 * Change radio check on image click
	 */
	orderProductSelectImage = function(option_id, option_values_id) {

		jQuery('#opt_'+option_id+'_'+option_values_id+' input[type=radio]').prop("checked", true);

		// If onselected is defined
		if ( jQuery('#opt_'+option_id+'_'+option_values_id+' input[type=radio]').attr('data-onselected') != '' )
			$scope.orderProductOptionOnSelected( jQuery('#opt_'+option_id+'_'+option_values_id+' input[type=radio]').attr('data-onselected') );
			//alert(jQuery('#opt_'+option_id+'_'+option_values_id+' input[type=radio]').attr('data-onselected'));

		jQuery('#opt_'+option_id+' .images[data-optionid='+ option_id +'] a').removeClass("selected");
		jQuery('#opt_'+option_id+'_'+option_values_id).addClass("selected");
		console.log('DEBUG > Image '+option_id+'_'+option_values_id+' selected');

	};

	/*
	 * Launch the capturePhoto function
	 */
	$rootScope.orderCapturePhoto = function ( img_id, client_id ) {

		console.log('');
		console.log('FN orderCapturePhoto > start');

		$scope.photoCapturePhoto( img_id, client_id, 'photo_cart' );
		/*$timeout(function() {
			$scope.orderLoadClient();
		}, 1000);*/

	};
	$rootScope.orderCapturePhotoDone = function () {

		console.log('');
		console.log('FN orderCapturePhotoDone > start');

		$scope.orderLoadClient();
	}

	/*
	 * Show the products available for customization
	 */
	$rootScope.orderNewLine = function() {

		console.log('');
		console.log('FN orderNewLine > start');

		// Reset some vars
		$rootScope.h1 = '';
		$scope.orderCurrentOrderLineId = null;
		$scope.orderCurrentOrderLineParentId = null;
		$scope.orderCurrentProductId = null;
		$scope.orderCurrentProductSteps = null;

		// Show/Hide page
		$scope.show_products_page = true;
		$scope.show_customize_page = false;
		$scope.show_transmit_page = false;

		// Hide progressbar
		$scope.show_progressbar = false;

		$scope.product_options_json = {};

		console.log('FN orderNewLine > end');
		console.log('');

	}


	/*
	 * Duplicate order line from order and start customization
	 */
	$rootScope.orderCopyLine = function(line_id) {

		console.log('');
		console.log('FN orderCopyLine > start (order line id: ' + line_id + ')');

		db.transaction(function(tx) {

			var sql_copy_line_in_order = "INSERT INTO orders_lines (order_id, parent_id, product_id, product_options, name, fabric_id, quantity, status) SELECT order_id, parent_id, product_id, product_options, name, fabric_id, quantity, status FROM orders_lines WHERE id = "+ line_id;

			tx.executeSql(
				sql_copy_line_in_order,
				[],
				function(tx, results) {

					$scope.cartLoadCart();
					console.log('FN orderCopyLine > DB > '+ sql_copy_line_in_order);

				},
				tx_error
			);

		});

	}


	/*
	 * When delete item in the cart delete line order and unmatch the matched lines
	 */
	$rootScope.orderDeleteLine = function(line_id) {

		console.log('');
		console.log('FN orderDeleteLine > start (order line id: ' + line_id + ')');

		// Delete order line
		db.transaction(function(tx) {

			var sql_delete_line_in_order = "DELETE FROM orders_lines WHERE id = "+ line_id;
			tx.executeSql(sql_delete_line_in_order, [], tx_result, tx_error);
			console.log('FN orderDeleteLine > DB > '+ sql_delete_line_in_order);

			var sql_unmatch_line_in_order = "UPDATE orders_lines SET parent_id = '' WHERE parent_id = "+ line_id;
			tx.executeSql(sql_unmatch_line_in_order, [], tx_result, tx_error);
			console.log('FN orderDeleteLine > DB > '+ sql_unmatch_line_in_order);

			// If we were editing the deleted line, start new customization
			if (line_id == $scope.orderCurrentOrderLineId) {
				$rootScope.closeCartPanel();
				$rootScope.orderNewLine();
				$scope.cartLoadCart();
			}
			else {
				// Reload Cart
				$scope.cartLoadCart();
			}

		});

	}

	/*
	 * Fast Edit exist orders's line
	 * Load line from database and display product to customize
	 */
	$rootScope.orderFastEditLine = function(line_id) {
		console.log('');
		console.log('FN orderFastEditLine > start (order line id: ' + line_id + ')');
		db.transaction(function(tx) {
			var sql_get_line_product_opions = "SELECT * FROM orders_lines WHERE id = "+ line_id
			tx.executeSql(
				sql_get_line_product_opions,
				[],
				function(tx, results) {
					console.log('Swalalla c est parti');
					$rootScope.order_option_fast=JSON.parse(results.rows.item(0).product_options);
					$rootScope.order_line_id_fast=line_id;
					$rootScope.order_line_parent_id=results.rows.item(0).parent_id;
					$rootScope.order_line_order_id=results.rows.item(0).order_id;
					$location.path('/orderfast')
					.search( 'product_id' , results.rows.item(0).product_id)
					.search( 'client_id' , $scope.orderCurrentClientId)
					.search('order_line',line_id);
					$scope.$apply()
				},
				tx_error
			);

		});
		$rootScope.closeCartPanel();
	};
	/*
	 * Edit exist orders's line
	 * Load line from database and display product to customize
	 */
	$rootScope.orderEditLine = function(line_id) {

		console.log('');
		console.log('FN orderEditLine > start (order line id: ' + line_id + ')');

		// Load line from database
		db.transaction(function(tx) {

			var sql_get_line_product_opions = "SELECT * FROM orders_lines WHERE id = "+ line_id
			tx.executeSql(
				sql_get_line_product_opions,
				[],
				function(tx, results) {

					console.log('FN orderEditLine > DB > '+ sql_get_line_product_opions);

					// Change vars
					$scope.orderCurrentOrderLineId = line_id;
					$scope.orderCurrentOrderLineParentId = results.rows.item(0).parent_id;
					$scope.product_options_json = JSON.parse(results.rows.item(0).product_options);
					console.log('FN orderEditLine > current product JSON');
					console.log($scope.product_options_json);

					// Load current step
					$scope.orderStartCustomization(results.rows.item(0).product_id, results.rows.item(0).status);

					// Close cart panel
					$rootScope.closeCartPanel();

				},
				tx_error
			);

		});

	}
	/*
	 * Add a matching product to another by filling the parent_id field
	 */
	$rootScope.orderAddMatchingLine = function(line_id, product_type_id) {

		console.log('');
		console.log('FN orderAddMatchingLine > start');

		$scope.orderCurrentProductId = product_type_id;

		// Get data from line to match
		db.transaction(function(tx) {

			var sql_get_line_to_match = "SELECT * FROM orders_lines WHERE id = " + line_id;
			tx.executeSql(sql_get_line_to_match, [],
				function(tx, results) {

					console.log('FN orderAddMatchingLine > DB > '+ sql_get_line_to_match);

					console.log( results.rows.item(0) );

					var matching_fields = '';
					json_matching_fields = {};
					var keepGoing = true;
					matching_fields = a_matching_fields[ results.rows.item(0).product_id ];
					json_matching_fields = JSON.parse( matching_fields );

					json_product_options_matched = JSON.parse( results.rows.item(0).product_options );


					$scope.product_options_json = {};
					angular.forEach(json_matching_fields, function(value, key) {
						console.log( key );
						angular.forEach(value, function(value2, key2) {
							if ( value2.product_id == product_type_id ) {
								if ( json_product_options_matched[ key ] != null ) {
									if ( value2[ json_product_options_matched[ key ] ] ) {
										$scope.product_options_json[ value2.field_id ] = value2[ json_product_options_matched[ key ] ];
									} else {
										$scope.product_options_json[ value2.field_id ] = json_product_options_matched[ key ];
									}
								}
							}
						});
					});

					console.log($scope.product_options_json);
					$scope.orderCreateOrderLine($scope.product_options_json, line_id);
					$scope.cartLoadCart();

				}, tx_error);

		});

	}


	/*
	 * When change the quantity in the cart, update the quantity in the order
	 */
	$rootScope.orderQuantityLine = function(line_id, line_quantity) {

		console.log('');
		console.log('FN orderQuantityLine > start (order line id: ' + line_id + ', quantity: '+line_quantity+')');

		db.transaction(function(tx) {

			var sql_quantity_order_lines = "UPDATE orders_lines SET quantity = " + line_quantity + " WHERE id = " + line_id;
			tx.executeSql(
				sql_quantity_order_lines,
				[],
				function(tx, results) {

					console.log('FN orderQuantityLine > DB > '+ sql_quantity_order_lines);
					console.log('FN orderQuantityLine > end');
					console.log('');

				},
				tx_error
			);

		});
	}


	/*
	 * Cart, if click on Delete Order button, ask confirmation, so delete order from database and empty cart, or do nothing
	 */
	$rootScope.orderDeleteOrder = function() {

		console.log('');
		console.log('FN orderDeleteOrder > start (order_id: ' + $scope.orderCurrentOrderId + ')');

		// Ask confirmation before deleting cart
		ngDialog.openConfirm({
			template: 'partials/dialog-confirm.html',
			data: {question: $translate.instant('i18n_cart_deleteorder_sure').replaceAll("<br>", " ")},
			className: 'ngdialog-theme-default'
		}).then(function () {

			// Delete order in database
			db.transaction(function(tx) {

				var sql_delete_order_lines = "DELETE FROM orders_lines WHERE order_id = "+ $scope.orderCurrentOrderId;
				tx.executeSql(
					sql_delete_order_lines,
					[],
					function(tx, results) {

						console.log('FN orderDeleteOrder > DB > '+ sql_delete_order_lines);

						var sql_delete_order = "DELETE FROM orders WHERE id = "+ $scope.orderCurrentOrderId;
						tx.executeSql(sql_delete_order, [],
							function(tx, results) {

								console.log('FN orderDeleteOrder > DB > '+ sql_delete_order);
								console.log('FN orderDeleteOrder > Delete order confirmed');
								console.log('FN orderDeleteOrder > end');
								console.log('');

								// Reload Cart
								$rootScope.orderCartEmpty = true;
								$scope.product_options_json = {};
								jQuery( "#options-grid" ).empty();
								ngCart.empty();
								$scope.orderCurrentOrderId = null;
								$rootScope.orderNewLine();
								$rootScope.closeCartPanel();
								//$scope.cartLoadCart();

							}, tx_error);

					},
					tx_error
				);

			});

		}, function (reason) {

			console.log('FN orderDeleteOrder > Detele order cancelled');
			console.log('FN orderDeleteOrder > end');
			console.log('');

		});
	}


	/*
	 * Cart, if click on Review Order button open order review panel
	 */
	$rootScope.orderReviewOrder = function() {

		console.log('');
		console.log('FN orderReviewOrder > start');

		if ( ngCart.getReady() === false ) {

			ngDialog.open({
				template: 'partials/dialog-msg.html',
				data: {question: $translate.instant('i18n_cart_validateorder_unfinished')},
				className: 'ngdialog-theme-default'
			});
			console.log('FN orderReviewOrder > product not finished');
			return false;

		}

		// Create HTML review
		var html_orderreview_products = '';
		db.transaction(function(tx) {

			var sql_get_order = "SELECT * FROM orders_lines WHERE order_id = " + $scope.orderCurrentOrderId;

			tx.executeSql(sql_get_order, [], function(tx, results){

				// Browse all products
				for (var i=0; i < results.rows.length; i++) {

					var line = results.rows.item(i);

					for (index = 0; index < $scope.products.length; ++index) {

						var value = $scope.products[index];

						if (value.id == line.product_id) {
							html_orderreview_products += '<h2>';
							if (line.parent_id > 0) {
								html_orderreview_products += 'MATCHING ';
							}
							html_orderreview_products += $scope.i18n_from_db(value) + ' ' + line.fabric_id + ' (' + $translate.instant('i18n_orderreview_quantity') + ': ' + line.quantity + ')</h2>';
						}

					}

					html_orderreview_products += '<table>';

					angular.forEach(JSON.parse(line.product_options), function(value, key) {

						//var key_int = parseInt(key);
						//$scope.products_options[ key_int ].en_US
						if ( $scope.products_options[ key ] ) {
							option_label = $scope.i18n_from_db($scope.products_options[ key ]);
							// $scope.products_options[ key ].name

							if ($scope.products_options[ key ].type == 'select' || $scope.products_options[ key ].type == 'image') {
								if ( $scope.products_options_values[ value ] )
									option_value = $scope.i18n_from_db($scope.products_options_values[ value ]);
									// $scope.products_options_values[ value ].name
								else
									option_value = value;
							}
							else
								option_value = value;
						}
						else {
							option_label = key;
							option_value = value;
						}
						html_orderreview_products += '<tr><td>' + option_label + '</td><td>' + option_value + '</td></tr>';

					});
					html_orderreview_products += '</table>';
					if ( line.comments != null )
						html_orderreview_products += '<p>' + line.comments + '</p>';

				}

			},
			tx_error);

		}, tx_error, function(){

			// Measurements page
			var html_orderreview_measurements = '';
			for (index = 0; index < $scope.measurements.length; ++index) {

				var value = $scope.measurements[index];

				if (value.id == $rootScope.orderCurrentMeasurementsId) {

					html_orderreview_measurements += '<h2>' + $translate.instant('i18n_measurements_pagetitle') + '</h2>\
													<h3>' + $translate.instant('i18n_measurements_jacket') + '</h3>\
													<table>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_jacket_neck') + '</td><td>' + value.jacket_neck + ' ' + value.unit_size + '&nbsp;&nbsp;&nbsp;</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_jacket_fullshoulder') + '</td><td>' + value.jacket_fullshoulder + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_jacket_chest') + '</td><td>' + value.jacket_chest + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_jacket_front') + '</td><td>' + value.jacket_front + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_jacket_back') + '</td><td>' + value.jacket_back + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_jacket_stomach') + '</td><td>' + value.jacket_stomach + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_jacket_hips') + '</td><td>' + value.jacket_hips + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_jacket_lengthfront') + '</td><td>' + value.jacket_lengthfront + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_jacket_lengthback') + '</td><td>' + value.jacket_lengthback + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_jacket_sleeve') + '</td><td>' + value.jacket_sleeve + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_jacket_armsize') + '</td><td>' + value.jacket_armsize + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_jacket_cuff') + '</td><td>' + value.jacket_cuff + ' ' + value.unit_size + '</td>\
													</tr>\
												</table>\
												<h3>' + $translate.instant('i18n_measurements_pants') + '</h3>\
												<table>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_pants_waist') + '</td><td>' + value.pants_waist + ' ' + value.unit_size + '&nbsp;&nbsp;&nbsp;</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_pants_hips') + '</td><td>' + value.pants_hips + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_pants_crotch') + '</td><td>' + value.pants_crotch + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_pants_thigh') + '</td><td>' + value.pants_thigh + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_pants_length') + '</td><td>' + value.pants_length + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_pants_bottom') + '</td><td>' + value.pants_bottom + ' ' + value.unit_size + '</td>\
													</tr>\
												</table>\
												<h3>' + $translate.instant('i18n_measurements_waistcoat') + '</h3>\
												<table>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_waistcoat_lengthfront') + '</td><td width="50%">' + value.waistcoat_lengthfront + ' ' + value.unit_size + '&nbsp;&nbsp;&nbsp;</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_waistcoat_lengthback') + '</td><td>' + value.waistcoat_lengthback + ' ' + value.unit_size + '</td>\
													</tr>\
												</table>\
												<h3>' + $translate.instant('i18n_measurements_silhouette') + '</h3>\
												<table>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_silhouette_height') + '</td><td>' + value.silhouette_height  + ' ' + value.unit_size + '&nbsp;&nbsp;&nbsp;</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_silhouette_weight') + '</td><td>' + value.silhouette_weight  + ' ' + value.unit_weight + '</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_silhouette_shoulder') + '</td><td>' + $translate.instant('i18n_measurements_silhouette_chest_' + value.silhouette_shoulder) + '</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_silhouette_neck') + '</td><td>' + $translate.instant('i18n_measurements_silhouette_chest_' + value.silhouette_neck) + '</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_silhouette_posture') + '</td><td>' + $translate.instant('i18n_measurements_silhouette_chest_' + value.silhouette_posture) + '</td>\
													</tr>\
													<tr>\
														<td>' + $translate.instant('i18n_measurements_silhouette_chest') + '</td><td>' + $translate.instant('i18n_measurements_silhouette_chest_' + value.silhouette_chest) + '</td>\
													</tr>\
												</table>';
					if ( value.comments != null && value.comments != '' )
						html_orderreview_measurements += '<h3>' + $translate.instant('i18n_measurements_comments') + '</h3><p>' + value.comments + '</p>';

				}

			}
			$rootScope.html_orderreview = html_orderreview_products + html_orderreview_measurements;

			// Ask confirmation before deleting cart
			ngDialog.open({
				id: 'orderReview',
				template: 'partials/order-review.html',
				className: 'ngdialog-theme-default ngdialog-theme-orderreview',
				data: {}
			});

		});

	}

    $rootScope.orderReviewOrderDisplayOrder = function(){

		console.log('');
		console.log('FN orderReviewOrderDisplayOrder > start');

		return $sce.trustAsHtml($rootScope.html_orderreview);

    };


	/*
	 * Measurements selection
	 */
	$rootScope.orderSelectMeasurements = function() {

		console.log('');
		console.log('FN orderSelectMeasurements > start');

		if ( $scope.measurements.length > 0 ) {

			ngDialog.open({
				template: 'partials/order-measurements.html',
				className: 'ngdialog-theme-default ngdialog-theme-measurements',
				data: {
						question: $translate.instant('i18n_cart_measurements_pleasechoose'),
						client_id: $scope.orderCurrentClientId,
						order_id: $scope.orderCurrentOrderId,
						selected_measurements_id: $rootScope.orderCurrentMeasurementsId,
						measurements: $scope.measurements
					}
			});

		} else {

			//measurements?client_id={{ngDialogData.client_id}}&measurements_id=new&order_id={{ngDialogData.order_id}}

			$rootScope.closeCartPanel();
			//$scope.$apply(function() {
				$location.path( '/measurements' )
						 .search( 'client_id' , $scope.orderCurrentClientId)
						 .search( 'measurements_id' , 'new')
						 .search( 'order_id' , $scope.orderCurrentOrderId);
			//});

		}

	}


	/*
	 * On click "transmit order" button, make checks and submit order
	 */
	$rootScope.cartValidateOrder = function() {
		console.log('');
		console.log('FN cartValidateOrder > start (order id: ' + $scope.orderCurrentOrderId + ')');

		$rootScope.h1 = '';

		// Check today measurement or choose measurement

		// Check if there is product in order
		if ( ngCart.getTotalItems() === 0 ) {

			ngDialog.open({
				template: 'partials/dialog-msg.html',
				data: {question: $translate.instant('i18n_cart_validateorder_noproduct')},
				className: 'ngdialog-theme-default'
			});
			console.log('FN cartValidateOrder > Transmit order cancelled: no product');

		// Check if all product cutomizations are over
		} else if ( ngCart.getReady() === false ) {

			ngDialog.open({
				template: 'partials/dialog-msg.html',
				data: {question: $translate.instant('i18n_cart_validateorder_unfinished')},
				className: 'ngdialog-theme-default'
			});
			console.log('FN cartValidateOrder > Transmit order cancelled: product not finished');

		// Check if measurements_id is defined
		} else if ( $rootScope.orderCurrentMeasurementsId === null || $rootScope.orderCurrentMeasurementsId == '' ) {

			console.log('FN cartValidateOrder > Transmit order cancelled: measurements_id undefined');

			$rootScope.orderSelectMeasurements();

		// Check if there is photos
		} else if ( $scope.clients[0].photo_front == null || $scope.clients[0].photo_front == '' ||
					$scope.clients[0].photo_side == null  || $scope.clients[0].photo_side == ''  ||
					$scope.clients[0].photo_back == null  || $scope.clients[0].photo_back == '') {

			$rootScope.closeCartPanel();
			$location.path( '/clients-client' ).search( 'do' , 'viewclient').search( 'client_id' , $scope.orderCurrentClientId).search( 'order_id' , $scope.orderCurrentOrderId);
			console.log('FN cartValidateOrder > Transmit order cancelled: no photo');

		} else {

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
				console.log('FN cartValidateOrder > Transmit order cancelled: no internet connection');

			} else {

				// Ask confirmation before transmitting order
				ngDialog.openConfirm({
					template: 'partials/cart-transmit.html',
					data: {
						},
					className: 'ngdialog-theme-default'
				}).then(function () {

					console.log('FN cartValidateOrder > Transmit order confirmed');

					$rootScope.closeCartPanel();

					ngDialog.close('orderReview', '');

					$scope.orderTransmitOrder();

				}, function (reason) {
					console.log('FN cartValidateOrder > Transmit order cancelled by user');
				});

			}

		}

	}


	/*
	 * Start or restart the customization of a product
	 */
	$scope.orderStartCustomization = function(product_id, current_screen) {

		console.log('');
		console.log('FN startCustomization > start');

		// Define some vars from product list
		if ($scope.fast_customisation){
			$rootScope.order_line_order_id=$routeParams.order_id;
			$location.path('/orderfast')
			.search( 'product_id' , product_id)
			.search( 'client_id' , $scope.orderCurrentClientId)
			.search('order_line',null);
		}
		else{
		angular.forEach($scope.products, function(value, key) {
			if (value.id == product_id) {
				$scope.orderCurrentProductSteps = value.steps;
			}
		});

		// Define some vars
		$scope.orderCurrentProductId = product_id;
		if (current_screen == 'ready')
			$scope.orderCurrentScreen = 1;
		else
			$scope.orderCurrentScreen = current_screen;
		$scope.progressPercentage = 0;
		$scope.product_options = [];
		$scope.product_options_values = [];

		// Hide products available
		$scope.show_products_page = false;
		$scope.show_customize_page = true;
		$scope.show_transmit_page = false;

		// Previous / Next / Submit
		$scope.orderPreviousNext ($scope.orderCurrentScreen, $scope.orderCurrentProductSteps);

		// Progress Bar
		$scope.orderProgressBar ($scope.orderCurrentScreen, $scope.orderCurrentProductSteps);

		// Option area (display, clean, and load options)
		jQuery( "#options-grid" ).empty();
		$scope.orderPage($scope.orderCurrentProductId, $scope.orderCurrentScreen);

		//$scope.cartLoadCart();
		console.log('FN startCustomization > end');
		console.log('');
	}
	};


	/*
	 * Create new order type "cart"
	 */
	$scope.orderCreateOrder = function(product_options_json) {

		console.log('');
		console.log('FN orderCreateOrder > start');

		db.transaction(function(tx) {

			var today = new Date().toJSON().slice(0,10);

			var sql_create_order = "INSERT INTO orders \
									(reseller_order_id, supplier_order_id, client_id, ordered_date, expected_delivery_date, shipped_date, delivered_date, payment_status, order_status) VALUES \
									(NULL, NULL, " + $scope.orderCurrentClientId + ", '" + today + "', NULL, NULL, NULL, 'unpaid', 'cart')";
			tx.executeSql(
				sql_create_order,
				[],
				function(tx, results) {

					console.log('FN orderCreateOrder > DB > '+ sql_create_order);
					$scope.orderCurrentOrderId = results.insertId;

				},
				tx_error
			);

		}, tx_error, function(){

			$scope.orderCreateOrderLine(product_options_json, '');

			console.log('FN orderCreateOrder > end');
			console.log('');

		});

	};
/*
	* Change parameter of fast customisation
*/

	$scope.settingsFastCustomisation = function() {
		$scope.fast_customisation= !$scope.fast_customisation;
		console.log($scope.fast_customisation);
		;
}

	/*
	 * Create new order line
	 */
	$scope.orderCreateOrderLine = function(product_options_json, parent_id) {

		console.log('');
		console.log('FN orderCreateOrderLine > start');

		db.transaction(function(tx) {

			var fabric_id = $scope.orderFabricInJSON();

			var sql_save_line_in_order = "INSERT INTO \
											orders_lines (\
													order_id, \
													parent_id, \
													product_id, \
													product_options, \
													name, \
													fabric_id, \
													quantity, \
													status\
											) \
											VALUES (\
												'" + $scope.orderCurrentOrderId + "', \
												'" + parent_id + "', \
												'" + $scope.orderCurrentProductId + "', \
												'" + $scope.db_prepare_string( JSON.stringify(product_options_json) ) + "', \
												'', \
												'" + $scope.db_prepare_string( fabric_id ) + "', \
												1, \
												1\
											)";
			tx.executeSql(
				sql_save_line_in_order,
				[],
				function(tx, results) {

					console.log('FN orderCreateOrderLine > DB > '+ sql_save_line_in_order);
					$scope.orderCurrentOrderLineId = results.insertId;
					ngCart.addItem($scope.orderCurrentOrderLineId,
								   $scope.orderCurrentProductId,
								   $scope.orderCartProductName('', $scope.orderCurrentProductId),
								   1,
								   1,
								   1,
								   fabric_id,
								   parent_id,
								   "item");

					$rootScope.orderCartEmpty = false;
					console.log('FN orderCreateOrderLine > end');
					console.log('');

				},
				tx_error
			);

		});

	};

	/*
	 * Update existing order line in database and update cart
	 */
	$scope.orderUpdateOrderLine = function(product_options_json, order_line_status) {

		console.log('');
		console.log('FN orderUpdateOrderLine > start');

		db.transaction(function(tx) {

			var fabric_id = $scope.orderFabricInJSON();

			var sql_save_line_in_order = "UPDATE orders_lines SET \
											product_options = '" + $scope.db_prepare_string( JSON.stringify(product_options_json) ) + "', \
											fabric_id = '" + $scope.db_prepare_string( fabric_id ) + "', \
											status = '" + order_line_status + "' \
											WHERE id = '" + $scope.orderCurrentOrderLineId + "'";
			//tx.executeSql(sql_save_line_in_order);
			tx.executeSql(
				sql_save_line_in_order,
				[],
				function(tx, results) {

					console.log('FN orderUpdateOrderLine > DB > '+ sql_save_line_in_order);
					ngCart.addItem($scope.orderCurrentOrderLineId, $scope.orderCurrentProductId, $scope.orderCartProductName('', $scope.orderCurrentProductId), 1, 1, order_line_status, fabric_id, $scope.orderCurrentOrderLineParentId, "item");

					console.log('FN orderUpdateOrderLine > end');
					console.log('');

				},
				tx_error
			);

		});

	};


	/*
	 * Find the fabric_id in the JSON
	 */
	$scope.orderFabricInJSON = function() {

		console.log('');
		console.log('FN orderFabricInJSON > start');

		var return_value = '';
		var keepGoing = true;

		angular.forEach($scope.products, function(value, key) {
			if(keepGoing) {
				if (value.id == $scope.orderCurrentProductId) {
					keepGoing = false;
					return_value = $scope.product_options_json[ value.field_id_fabric_id ];
				}
			}
		});

		return return_value;

	};


	/*
	 * Load new product screen
	 * Save options product into orders_line (create or update)
	 * Call next screen display
	 */
	$scope.orderChangeScreen = function(to) {

		console.log('');
		console.log('FN orderChangeScreen > start');

		var tmp_current_screen = $scope.orderCurrentScreen;
		var form_error = false;
		var matching_fields = false;

		// Remove options_id not on this page from the JSON product_options_json
		angular.forEach( $scope.products_options, function(value, key) {
			if ( value.product_id == $scope.orderCurrentProductId && value.screen == $scope.orderCurrentScreen ) {

				delete $scope.product_options_json[ value.id ];
				console.log('FN orderChangeScreen > Delete option_id ' + value.id + ' from product_options_json' );
			}
		});
		jQuery( "#options-grid input[type=radio]:checked" ).each(function(index, value) {

			//delete $scope.product_options_json[ jQuery(this).attr('data-optionid') ];
			$scope.product_options_json[ jQuery(this).attr('data-optionid') ] = jQuery(this).val();

			if ( inArray( jQuery(this).attr('data-optionid'), a_matchedproduct_ids_nochange) ) {
				matching_fields = true;
			}

		});
		jQuery( "#options-grid select" ).each(function(index, value) {

			if (form_error == false) {

				if ( jQuery(this).attr('required') && ( jQuery(this).find( "option:selected" ).text() == '' || jQuery(this).find( "option:selected" ).text() == '-' ) ) {
					form_error = true;
					var field_label = jQuery(this).siblings('label').text();
					ngDialog.open({
						template: 'partials/dialog-msg.html',
						data: {question: field_label + $translate.instant('i18n_forms_controls_isempty')},
						className: 'ngdialog-theme-default'
					});
				}

				//delete $scope.product_options_json[ jQuery(this).attr('data-optionid') ];
				$scope.product_options_json[ jQuery(this).attr('data-optionid') ] = jQuery(this).val();

				if ( inArray( jQuery(this).attr('data-optionid'), a_matchedproduct_ids_nochange) ) {
					matching_fields = true;
				}

			}

		});
		jQuery( "#options-grid input[type=text]" ).each(function(index, value) {

			if (form_error == false) {

				if ( jQuery(this).attr('required') && jQuery(this).val() == '' ) {
					form_error = true;
					var field_label = jQuery(this).siblings('label').text();
					ngDialog.open({
						template: 'partials/dialog-msg.html',
						data: {question: field_label + $translate.instant('i18n_forms_controls_isempty')},
						className: 'ngdialog-theme-default'
					});
				}

				//delete $scope.product_options_json[ jQuery(this).attr('data-optionid') ];
				$scope.product_options_json[ jQuery(this).attr('data-optionid') ] = jQuery(this).val();

				if ( inArray( jQuery(this).attr('data-optionid'), a_matchedproduct_ids_nochange) ) {
					matching_fields = true;
				}

			}

		});
		jQuery( "#options-grid textarea" ).each(function(index, value) {

			if (form_error == false) {

				//delete $scope.product_options_json[ jQuery(this).attr('data-optionid') ];
				$scope.product_options_json[ jQuery(this).attr('data-optionid') ] = jQuery(this).val();

				if ( inArray( jQuery(this).attr('data-optionid'), a_matchedproduct_ids_nochange) ) {
					matching_fields = true;
				}

			}

		});

//		console.log('DEBUG > '+ JSON.stringify($scope.product_options_json) );

		if (form_error === true)
			return false;

		// If matching field update matched fields
		if ( matching_fields == true && ($scope.orderCurrentOrderLineParentId == null || $scope.orderCurrentOrderLineParentId == 0) ) {

			console.log('FN orderChangeScreen > matching fields detected, try to update matched products');

			db.transaction(function(tx) {

				var query = "SELECT * FROM orders_lines WHERE parent_id = " + $scope.orderCurrentOrderLineId;
				tx.executeSql(
					query,
					[],
					function(tx, results){

						console.log('FN orderChangeScreen > DB > ' + query);

						for ( var i=0; i<results.rows.length; i++ ) {

							json_matched_product = JSON.parse( results.rows.item(i).product_options );
							var json_matching_product = $scope.product_options_json;
							console.log( "FN orderChangeScreen > " + JSON.stringify( json_matched_product ) );


							//var matching_fields = a_matching_fields[ $scope.orderCurrentProductId ];
							json_matching_fields = JSON.parse( a_matching_fields[ $scope.orderCurrentProductId ] );


							//$scope.product_options_json = {};
							angular.forEach(json_matching_fields, function(value, key) {
								angular.forEach(value, function(value2, key2) {
									if ( value2.product_id == results.rows.item(i).product_id ) {
								//console.log( key );

										if ( json_matching_product[ key ] != null ) {
											//console.log( value2.product_id+'/'+results.rows.item(i).product_id+' put '+key+' into field '+value2.field_id );
											if ( value2[ json_matching_product[ key ] ] ) {
												//console.log( value2[ json_matching_product[ key ] ] );
												json_matched_product[ value2.field_id ] = value2[ json_matching_product[ key ] ];
											} else {
												//console.log( value2.field_id+': '+json_matched_product[ value2.field_id ] );
												//console.log( value2.field_id+': '+json_matching_product[ key ] );
												json_matched_product[ value2.field_id ] = json_matching_product[ key ];
											}
										}
									}
								});
							});

							// Save matched product options
							var fabric_id = $scope.orderFabricInJSON();
							var query_upd = "UPDATE orders_lines SET fabric_id = '"+ $scope.db_prepare_string(fabric_id) +"', product_options = '" + $scope.db_prepare_string( JSON.stringify(json_matched_product) ) + "' WHERE id = " + results.rows.item(i).id;
							tx.executeSql(
											query_upd,
											[],
											function(tx, results) {
												console.log('FN orderChangeScreen > DB > ' + query_upd);
											},
											function(tx, error) {
												tx_error_adv(query_upd, tx, error);
											}
										);
							console.log( "FN orderChangeScreen > " + JSON.stringify( json_matched_product ) );

						}


					},
					function(tx, error){ tx_error_adv(query, tx, error) }
				);

			});

		}

		// Order line Status
		if (tmp_current_screen >= $scope.orderCurrentProductSteps)
			var order_line_status = 'ready';
		else
			var order_line_status = tmp_current_screen;

		// Create/Update order/order line
		if ($scope.orderCurrentOrderId == null) {

			$scope.orderCreateOrder($scope.product_options_json);

		} else if ($scope.orderCurrentOrderLineId == null) {

			$scope.orderCreateOrderLine($scope.product_options_json, '');

		} else {

			$scope.orderUpdateOrderLine($scope.product_options_json, order_line_status);

		}

		// Go to next page
		if (to == 'next') {
			$scope.orderCurrentScreen = parseInt(tmp_current_screen) + 1;
		}
		else {
			$scope.orderCurrentScreen = parseInt(tmp_current_screen) - 1;
		}
		console.log('FN orderChangeScreen > New screen: ' + $scope.orderCurrentScreen);

		// Previous / Next / Submit
		$scope.orderPreviousNext ($scope.orderCurrentScreen, $scope.orderCurrentProductSteps);

		// Progress Bar
		$scope.orderProgressBar ($scope.orderCurrentScreen, $scope.orderCurrentProductSteps);

		//alert($scope.orderCurrentScreen);
		jQuery( "#options-grid" ).empty();

		// Load options
		if ( $scope.orderCurrentScreen <= $scope.orderCurrentProductSteps )
			$scope.orderPage( $scope.orderCurrentProductId, $scope.orderCurrentScreen);

		console.log('FN orderChangeScreen > end');
		console.log('');

	};


	/*
	 * Update previous next buttons
	 */
	$scope.orderPreviousNext = function(current_step, steps) {

		console.log('');
		console.log('FN orderPreviousNext > start');

		// Previous button
		if (current_step > 1)
			$scope.show_previousbtn = true;
		else
			$scope.show_previousbtn = false

		// Next button
		if (current_step <= steps) {
			$scope.show_nextbtn = true;
			$scope.show_endofcustomization = false;
		} else {
			$scope.show_nextbtn = false;
			$scope.show_endofcustomization = true;
			$rootScope.h1 = '';

			/*$rootScope.orderNewLine();
			$scope.openAside('right', true, 'cart.html', 'md');*/
		}

		console.log('FN orderPreviousNext > ' + (current_step-1) +'/'+ steps);
		console.log('FN orderPreviousNext > end');
		console.log('');

	};


	/*
	 * Update progress bar value
	 */
	$scope.orderProgressBar = function(current_step, steps) {

		console.log('');
		console.log('FN progressBar > start');

		$scope.progressPercentage = Math.round((current_step-1) / steps * 100);
		$scope.show_progressbar = true;

		console.log('FN progressBar > ' + (current_step-1) +'/'+ steps);
		console.log('FN progressBar > end');
		console.log('');

	};


	/*
	 * Set default product name for unnamed products
	 */
	$scope.orderCartProductName = function(name, product_id) {

		console.log('');
		console.log('FN orderCartProductName > start');

		// Set product name
		if (name == '') {
			angular.forEach($scope.products, function(value, key) {
				if (value.id == product_id) {
					name = eval('value.' + $scope.app_language);
				}
			});
		}

		return name;

	};


	/*
	 * Save measurements_id to order
	 */
	$rootScope.orderAsignMeasurementsToOrder = function(measurements_id) {

		console.log('');
		console.log('FN orderAsignMeasurementsToOrder > start (measurements_id: '+measurements_id+')');

		if (measurements_id != null && measurements_id > 0) {

			db.transaction(function(tx) {

				var sql_set_measurements_id = "UPDATE orders SET measurements_id = " + measurements_id + " WHERE id = " + $scope.orderCurrentOrderId;

				tx.executeSql(
					sql_set_measurements_id,
					[],
					function(tx, results) {

						$rootScope.orderCurrentMeasurementsId = measurements_id;
						console.log('FN orderAsignMeasurementsToOrder > DB > '+ sql_set_measurements_id);
						console.log('FN orderAsignMeasurementsToOrder > end');
						$scope.$apply();

					},
					tx_error
				);

			});

		} else {

			console.log('FN orderAsignMeasurementsToOrder > measurements_id incorrect');
			console.log('FN orderAsignMeasurementsToOrder > end');

		}

	};

	/*
	 * Save measurements_id to order
	 */
	$rootScope.orderGoMeasurements = function() {

		console.log('');
		console.log('FN orderGoMeasurements > start');

		$rootScope.closeCartPanel();
		$location.path( '/measurements' )
				 .search( 'client_id' , $scope.orderCurrentClientId)
				 .search( 'measurements_id' , 'new')
				 .search( 'order_id' , $scope.orderCurrentOrderId);

	};

	/*
	 * Save order to PDF to transmit to us and factory
	 */
	$scope.orderTransmitOrder = function() {

		console.log('');
		console.log('FN orderTransmitOrder > start');

		// Show/hide page
		$scope.show_products_page = false;
		$scope.show_customize_page = false;
		$scope.show_transmit_page = true;

		$rootScope.orderCartShow = false;
		$rootScope.h1 = '';

		$scope.transmit_status = 'inprogress';
		//$scope.$apply();

		$scope.orderToPDF();
		$scope.orderToXML();

	}


	/*
	 * Transmit JSON document to Gateway
	 */
	$scope.orderToXML = function() {

		console.log("");
		console.log("FN orderToXML > start");

		var gateway = settings['supplier_gateway'] + '/index.php'; // Prod & Test
		//var gateway = settings['supplier_gateway'] + '/index.php?environment=test'; // Test
		//var gateway = 'http://gateway.probespoke.dev/index.php'; // Dev

		json_data_submit = {};
		json_data_submit.environment = 'prod'; // change for [prod/test]
		json_data_submit.product_key = $scope.submit_product_key;
		json_data_submit.device_uuid = device.uuid;
		json_data_submit.device_uuid = 'unknown device uuid';

		json_data_submit.secret_key = 'd67fds98bF';
		json_data_submit.app_product_key = settings['product_key'];
		json_data_submit.app_version = settings['app_version'];
		json_data_submit.company_id = settings['company_id'];
		json_data_submit.reseller_id = settings['seller_id'];
		json_data_submit.reseller_private_customer_id = $scope.orderCurrentClientId;
		json_data_submit.order_id = $scope.orderCurrentOrderId;
		json_data_submit.reseller_private_measurements_id = $rootScope.orderCurrentMeasurementsId;

		// Measurements
		for (index = 0; index < $scope.measurements.length; ++index) {

			var value = $scope.measurements[index];

			if (value.id == $rootScope.orderCurrentMeasurementsId) {
				json_data_submit.measurements = value;
			}

		}

		// Photos
		a_photos = {};
		a_photos.front = $scope.clients[0].photo_front;
		a_photos.side  = $scope.clients[0].photo_side;
		a_photos.back  = $scope.clients[0].photo_back;

		// Products
		a_products = [];
		db.transaction(function(tx) {

			var sql_get_order = "SELECT * FROM orders_lines WHERE order_id = " + $scope.orderCurrentOrderId;

			tx.executeSql(sql_get_order, [], function(tx, results){

				console.log('FN orderToXML > DB > ' + sql_get_order);

				// Browse all products

				for (var i=0; i < results.rows.length; i++) {

					var line = results.rows.item(i);

					a_products.push(line);

				}

			},
			tx_error);

		}, tx_error, function(){

			json_data_submit.products = a_products;
			json_data_submit.photos = a_photos;

			$http({
				method: 'POST',
				url: gateway,
				data: json_data_submit
			}).
			then(function(response) {

	//alert(JSON.stringify(response));

			}, function(response) {

	//alert(JSON.stringify(response));

			})
			console.log(json_data_submit);

		});

	}


	/*
	 * Save order to PDF to transmit to us and factory
	 * jsPDF
	 * http://pdfmake.org/
	 */
	$scope.orderToPDF = function() {

		console.log("");
		console.log("FN orderToPDF > start");

		var doc = new jsPDF('p', 'pt');
		doc.setFont('helvetica', 'normal');
		doc.setFontSize(12);

		var PDF_current_page = 0;
		var PDF_total_pages = 4;
		var PDF_nbr_products = 0;
		var PDF_qty_products = 0;
		var html_header = '<header style="margin-top:30px;"><table>\
								<tr>\
									<td>Date: </td>\
									<td>order:</td>\
								</tr>\
							</table></header>';

		// Header
		var write_header = function() {
			doc.rect(20, 20, 555, 40);
			doc.setFontType("bold");
			doc.text(30, 35, 'Date: ' + new Date().toJSON().slice(0,10));
			doc.text(30, 55, 'Products: ' + PDF_nbr_products);
			doc.text(240, 35, 'Company ID: ' + settings['company_id']);
			doc.text(240, 55, 'Reseller ID: ' + settings['seller_id']);
			doc.text(430, 35, 'Reseller Order ID: ' + $scope.orderCurrentOrderId);
			doc.text(430, 55, 'Reseller Customer ID: ' + $scope.orderCurrentClientId);
			doc.setFontType("normal");
		}

		doc.setFontType("normal");

		db.transaction(function(tx) {

			var sql_get_order = "SELECT * FROM orders_lines WHERE order_id = " + $scope.orderCurrentOrderId;

			tx.executeSql(sql_get_order, [], function(tx, results){

				console.log('FN orderToPDF > DB > ' + sql_get_order);

				PDF_total_pages = PDF_total_pages + results.rows.length;
				PDF_nbr_products = results.rows.length;

				// Browse all products
				for (var i=0; i < results.rows.length; i++) {

					var line = results.rows.item(i);

					write_header();
					doc.setFontType("bold");
					for (index = 0; index < $scope.products.length; ++index) {

						var value = $scope.products[index];

						if (value.id == line.product_id) {
							if (line.parent_id > 0) {
								doc.text( 'MATCHING ' + value.en_US, 20, 90);
							} else {
								doc.text( value.en_US, 20, 90);
							}
						}

					}
					doc.text('Fabric: ' + line.fabric_id, 250, 90);
					doc.text('Quantity: ' + line.quantity, 500, 90);
					doc.setFontType("normal");


					var html_product_options = '<table style="width:200px;">\
								<tr>\
									<td>Option Name</td>\
									<td>Option Value</td>\
								</tr>';

					angular.forEach(JSON.parse(line.product_options), function(value, key) {

						//var key_int = parseInt(key);
						//$scope.products_options[ key_int ].en_US
						if ( $scope.products_options[ key ] ) {
							option_label = $scope.products_options[ key ].name; // + ' / ' + $scope.products_options[ key ].th_TH

							if ($scope.products_options[ key ].type == 'select' || $scope.products_options[ key ].type == 'image') {
								if ( $scope.products_options_values[ value ] )
									option_value = $scope.products_options_values[ value ].en_US; // + ' / ' + $scope.products_options_values[ value ].th_TH
								else
									option_value = value;
							}
							else
								option_value = value;
						}
						else {
							option_label = key;
							option_value = value;
						}
						html_product_options += '<tr><td>' + option_label + '</td><td>' + option_value + '</td></tr>';

					});
					html_product_options += '</table>';
					if ( line.comments != null )
						html_product_options += '<p>' + line.comments + '</p>';

					doc.fromHTML( html_product_options, 20, 100);
					doc.text('Page ' + (++PDF_current_page) + '/' + PDF_total_pages, 20, 820);

					doc.addPage();

				}

			},
			tx_error);

		}, tx_error, function(){

			// Measurements page
			for (index = 0; index < $scope.measurements.length; ++index) {

				var value = $scope.measurements[index];

				if (value.id == $rootScope.orderCurrentMeasurementsId) {

					var html_measurements = '<table width="100%">\
													<tr>\
														<td width="50%">Jacket&nbsp;&nbsp;&nbsp;&nbsp;</td>\
														<td width="50%"></td>\
													</tr>\
													<tr>\
														<td>Neck</td><td>' + value.jacket_neck + ' ' + value.unit_size + '&nbsp;&nbsp;&nbsp;</td>\
													</tr>\
													<tr>\
														<td>Full Shoulder</td><td>' + value.jacket_fullshoulder + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>Chest</td><td>' + value.jacket_chest + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>Front</td><td>' + value.jacket_front + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>Back</td><td>' + value.jacket_back + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>Stomach</td><td>' + value.jacket_stomach + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>Hips</td><td>' + value.jacket_hips + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>Length (Front)</td><td>' + value.jacket_lengthfront + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>Length (Back)</td><td>' + value.jacket_lengthback + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>Sleeve</td><td>' + value.jacket_sleeve + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>Arm Size</td><td>' + value.jacket_armsize + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>Cuff</td><td>' + value.jacket_cuff + ' ' + value.unit_size + '</td>\
													</tr>\
												</table>\
												<table width="100%">\
													<tr>\
														<td>Pants&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>\
														<td></td>\
													</tr>\
													<tr>\
														<td>Waist</td><td>' + value.pants_waist + ' ' + value.unit_size + '&nbsp;&nbsp;&nbsp;</td>\
													</tr>\
													<tr>\
														<td>Hips</td><td>' + value.pants_hips + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>Crotch</td><td>' + value.pants_crotch + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>Thigh</td><td>' + value.pants_thigh + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>Length</td><td>' + value.pants_length + ' ' + value.unit_size + '</td>\
													</tr>\
													<tr>\
														<td>Bottom</td><td>' + value.pants_bottom + ' ' + value.unit_size + '</td>\
													</tr>\
												</table>\
												<table width="100%">\
													<tr>\
														<td>Waistcoat</td>\
														<td></td>\
													</tr>\
													<tr>\
														<td>Length (Front)</td><td>' + value.waistcoat_lengthfront + ' ' + value.unit_size + '&nbsp;&nbsp;&nbsp;</td>\
													</tr>\
													<tr>\
														<td>Length (Back)</td><td>' + value.waistcoat_lengthback + ' ' + value.unit_size + '</td>\
													</tr>\
												</table>\
												<table width="100%">\
													<tr>\
														<td>Silhouette&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>\
														<td></td>\
													</tr>\
													<tr>\
														<td>Size</td><td>' + value.silhouette_height  + ' ' + value.unit_size + '&nbsp;&nbsp;&nbsp;</td>\
													</tr>\
													<tr>\
														<td>Weight</td><td>' + value.silhouette_weight  + ' ' + value.unit_weight + '</td>\
													</tr>\
													<tr>\
														<td>Shoulder</td><td>' + value.silhouette_shoulder + '</td>\
													</tr>\
													<tr>\
														<td>Neck</td><td>' + value.silhouette_neck + '</td>\
													</tr>\
													<tr>\
														<td>Posture</td><td>' + value.silhouette_posture + '</td>\
													</tr>\
													<tr>\
														<td>Chest</td><td>' + value.silhouette_chest + '</td>\
													</tr>\
												</table>';
					if ( value.comments != null )
						html_measurements += '<p>' + value.comments + '</p>';

				}

			}
			write_header();
			doc.setFontType("bold");
			doc.text('Measurements', 20, 90);
			doc.setFontType("normal");
			doc.fromHTML( html_measurements, 20, 100);
			doc.text('Page ' + (++PDF_current_page) + '/' + PDF_total_pages, 20, 820);
			doc.addPage();

			// Photo Front
			write_header();
			doc.addImage( $scope.clients[0].photo_front, 'JPEG', 25, 75, 540, 720);
			doc.text('Page ' + (++PDF_current_page) + '/' + PDF_total_pages, 20, 820);
			doc.addPage();

			// Photo Side
			write_header();
			doc.addImage( $scope.clients[0].photo_side, 'JPEG', 25, 75, 540, 720);
			doc.text('Page ' + (++PDF_current_page) + '/' + PDF_total_pages, 20, 820);
			doc.addPage();

			// Photo Back
			write_header();
			doc.addImage( $scope.clients[0].photo_back, 'JPEG', 25, 75, 540, 720);
			doc.text('Page ' + (++PDF_current_page) + '/' + PDF_total_pages, 20, 820);

			// Stock PDF into var
			var pdfOutput = doc.output("blob");

			//NEXT SAVE IT TO THE DEVICE'S LOCAL FILE SYSTEM
			console.log("file system...");
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {

			   console.log(fileSystem.name);
			   console.log(fileSystem.root.name);
			   console.log(fileSystem.root.fullPath);

				var file_name = "Order_" + settings['company_id'] + "_" + settings['seller_id'] + "_" + $scope.orderCurrentClientId + "_" + $scope.orderCurrentOrderId + ".pdf";
				fileSystem.root.getFile(file_name, {create: true}, function(entry) {
					var fileEntry = entry;
					console.log(entry.nativeURL);

					entry.createWriter(function(writer) {

						writer.onwrite = function(evt) {
							console.log("write success");
							$scope.orderUploadFile(entry.nativeURL);
						};

						console.log("writing to file");
						writer.write( pdfOutput );
					}, function(error) {
						$scope.transmit_status = 'failed';
						$rootScope.orderCartShow = true;
						console.log(error);
					});

				}, function(error) {
					$scope.transmit_status = 'failed';
					$rootScope.orderCartShow = true;
					console.log(error);
				});
			},
			function(event){
				$scope.transmit_status = 'failed';
				$rootScope.orderCartShow = true;
				console.log( evt.target.error.code );
			});

		});
	};


	/*
	 * Upload file on server
	 */
	$scope.orderUploadFile = function(fileURL) {

		var options = new FileUploadOptions();
		options.fileKey = "file";
		options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
		filename_for_delete = fileURL.substr(fileURL.lastIndexOf('/') + 1);
		options.mimeType = "text/pdf";

		var params = {};
		params.secret_key = 'd67fds98bF';
		params.product_key = settings['product_key'];
		params.company_id = settings['company_id'];
		params.seller_id = settings['seller_id'];
		params.client_id = $scope.orderCurrentClientId;
		params.order_id = $scope.orderCurrentOrderId;

		options.params = params;

		// Init upload
		var ft = new FileTransfer();

		// Upload progress
		ft.onprogress = function(progressEvent) {
		};

		// Upload
		ft.upload(
			fileURL,
			encodeURI("http://app.probespoke.com/upload.php"),
			function (result) {

				console.log("Code = " + result.responseCode);
				console.log("Response = " + result.response);
				console.log("Sent = " + result.bytesSent);

				// Change order status from "cart" to "transmitted"
				db.transaction(function(tx) {

					tx.executeSql("UPDATE orders SET order_status = 'transmitted' WHERE id = " + $scope.orderCurrentOrderId);
					tx.executeSql("UPDATE orders_lines SET status = 'transmitted' WHERE order_id = " + $scope.orderCurrentOrderId);

				}, tx_error, function(){

						// Congratulation
						$scope.transmit_status = 'succeed';
						$scope.$apply();

						// Delete PDF file
						console.log("file system...");
						window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
							fileSystem.root.getFile(filename_for_delete, {create: false, exclusive: false}, function(entry) {

								entry.remove();
								console.log('Deleting ' + filename_for_delete);

							}, function(error) {
								console.log(error);
							});
						},
						function(event){
							console.log( evt.target.error.code );
						});
				});

			},
			function (error) {

				// Alert
				console.log("upload error source " + error.source);
				console.log("upload error target " + error.target);
				$scope.transmit_status = 'failed';
				$rootScope.orderCartShow = true;

			},
			options,
			true);

	}

	init();

}]);
