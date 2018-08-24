probespokeApp.controller('OrderFastCtrl',
						['$rootScope', '$scope', '$log', '$route', '$routeParams', '$location', '$http', '$translate', '$uibModal', 'ngCart', 'ngDialog', '$sce', '$timeout',
						function ($rootScope, $scope, $log, $route, $routeParams, $location, $http, $translate, $uibModal, ngCart, ngDialog, $sce, $timeout) {

$scope.product_options_json = {};
ngCart.setTaxRate(1);
ngCart.setShipping(1);

$scope.orderCurrentClientId = $routeParams.client_id;

if($rootScope.order_line_id_fast){$scope.orderCurrentOrderLineId = $rootScope.order_line_id_fast;}
else{$scope.orderCurrentOrderLineId = null};
if($rootScope.order_line_parent_id){$scope.orderCurrentOrderLineParentId = $rootScope.order_line_parent_id;}
else{$scope.orderCurrentOrderLineParentId = null};
if($rootScope.order_line_order_id){$scope.orderCurrentOrderId = $rootScope.order_line_order_id;}
else{$scope.orderCurrentOrderId = null};

console.log('Parent Id ='+$scope.orderCurrentOrderLineParentId);
console.log('Order ID ='+$scope.orderCurrentOrderId);
console.log('Order Line ID ='+$scope.orderCurrentOrderLineId)

$scope.orderCurrentProductId=$routeParams.product_id;

var a_matchedproduct_ids_nochange = ["301", "302", "303", "304","401", "402", "403", "404", "501", "502", "503", "504"];

var a_matching_fields = new Array();

$rootScope.h1 = '';

var init = function () {
	console.log('');
	console.log('INIT > OrderFast');


 $scope.orderFastWriteOption = function(){
	 if($rootScope.order_option_fast){$scope.product_options_json=$rootScope.order_option_fast;}
	 var product_id = $scope.orderCurrentProductId;
	 var sql_product_options = "SELECT * FROM products_options WHERE product_id = " + product_id  + " AND active = 1 ORDER BY id";
	 	var name_product='pants';
	 	if (product_id == 3)
	 		{name_product='jacket';}
	 	else if (product_id == 1)
	 		{name_product='shirt';}
	 	else if (product_id == 5)
	 		{name_product='waistcoat';}
		console.log(name_product);
		console.log('<span translate="i18n_measurements_'+name_product+'"></span>');
	 	$rootScope.h1 = 'Page de Création Rapide : '+$translate.instant('i18n_measurements_'+name_product);

	 db.transaction(function(tx) {
	 tx.executeSql(
		 sql_product_options,
		 [],
		 function(tx, results){

			 console.log('FN orderFastPage > DB > ' + sql_product_options);
			 console.log(results.rows.length);
			 for (var i=0; i < results.rows.length; i++) {
				 var option = results.rows.item(i);
				 var html;

		 		html =  '<div class="form-group">\
							<div id="opt_' + option.id + '" data-parent_id="' + option.parent_id + '">';

		 		// Display label
		 			html +=  '<label>' + $scope.i18n_from_db(option) + '</label>';

		 		// Disabled field?
		 		var disabled = '';
				var disabled = '';

				if ( $scope.orderCurrentOrderLineParentId != null && $scope.orderCurrentOrderLineParentId > 0 ) {
					if ( inArray( option.id, a_matchedproduct_ids_nochange) )
						disabled = ' disabled="disabled"';
				}
		 		if (option.hidden == true) {
		 				disabled = ' disabled="disabled"';
		 		}

		 		// Required field?
		 		var required = '';
		 		if ( option.required == 1 ) {
		 			required = ' required="required"';
		 		}

		 		if (option.type == 'image') {
		 //Les images ont traitées comme des selections
		 html += '<select class="form-control" name="' + option.id + '" data-optionid="' + option.id + '" onchange="orderFastProductOptionsOnChange(this)"' + required + disabled + '">\
					</select>';

		 		}
		 		else if (option.type == 'select') {

		 			html += '<select class="form-control" name="' + option.id + '" data-optionid="' + option.id + '" onchange="orderFastProductOptionsOnChange(this)"' + required + disabled + '">\
		 					 </select>';

		 		}
		 		else if (option.type == 'color') {

		 			html += '<input type="text" class="form-control" name="' + option.id + '" data-optionid="' + option.id + '">';

		 		}
		 		else if (option.type == 'checkbox') {

		 			html += '<input type="text" class="form-control" name="' + option.id + '" data-optionid="' + option.id + '">';

		 		}
		 		else if (option.type == 'textarea') {

					var input_value = '';
					if ($scope.product_options_json[option.id])
						input_value = $scope.product_options_json[option.id];

		 			html += '<textarea class="form-control" name="' + option.id + '" data-optionid="' + option.id + '"' + required + '>'+ input_value + '</textarea>';

		 		}
		 		else {

					var input_value = '';
					if ($scope.product_options_json[option.id])
						input_value = $scope.product_options_json[option.id];

		 			html += '<input type="text" class="form-control" name="' + option.id + '" data-optionid="' + option.id +'" value="' + input_value + '" autocomplete="off" autocorrect="off" spellcheck="false"' + required + disabled + '>';

		 		}

		 		html += '	</div>\
		 				 </div>';

				console.log(html);
		 		if (option.parent_id != 0) {
		 			jQuery( "#FastOrdering-grid #opt_"+option.parent_id ).append( html );
		 		} else {
		 			jQuery( "#FastOrdering-grid" ).append( html );
		 		}
		 		last_option_group = option.option_group;
		 		$scope.orderFastWriteProductOptionsValues(option);

			 }

		 },
		 tx_error
	 );
 	});


 };
//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
//A
//A
//A
//A
//A                              Fin de la fonction OrderFastWrite Option
//A
//A
//A
//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

$scope.orderFastWriteProductOptionsValues = function(option){
		console.log($scope.product_options_json);
	db.transaction(function(tx) {
		var sql_product_options_values = "SELECT * FROM products_options_values WHERE option_id = " + option.id + " AND active = 1 ORDER BY fieldorder";
		tx.executeSql(
			sql_product_options_values,
			[],
			function(tx, results2){
				console.log('FN orderWriteProductOptionsValues > DB > ' + sql_product_options_values);
				for (var j=0; j < results2.rows.length; j++) {
					var option_values = results2.rows.item(j);

						var selected = '';
						if ($scope.product_options_json[option.id]) {
							if ($scope.product_options_json[option.id] == option_values.id) {
								selected = ' selected';
								checked = ' checked="checked"';
							}
						} else {
							if (option_values.selected == 'true') {
								selected = ' selected';
								checked = ' checked="checked"';
							}
						}

						html = '<option'+selected+' value="' +option_values.id+ '" data-onselected="' +option_values.onselected+ '">'+ $scope.i18n_from_db(option_values)+'</option>';
						jQuery( "#opt_"+ option.id +" select[data-optionid="+ option.id +"]" ).append( html );
				}

			},
			tx_error
		);
	});
	};
	//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
	//A
	//A
	//A
	//A
	//A                              Fin de la fonction OrderFastWrite Option Value
	//A
	//A
	//A
	//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
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
						$scope.products.push(product);					}
					$scope.$apply();
					console.log('FN orderLoadProducts > '+ results.rows.length +' products loaded');
				},
				tx_error
			);
		});
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
	 * Find the fabric_id in the JSON
	 */
	$scope.orderFabricInJSON = function() {
		console.log('');
		console.log('FN orderFabricInJSON > start');
		var return_value = '';
		var keepGoing = true;
		console.log('DEBUG > '+ JSON.stringify($scope.product) );
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

$scope.orderFastCancel = function(){
		console.log('J\'annule ma commande');
		$location.path( '/order')
		.search('order_line',$scope.orderCurrentOrderId)
		.search( 'product_id' , null);
	};

	/*
	 * Create new order type "cart"
	 */
	$scope.orderFastCreateOrder = function(product_options_json) {
		console.log('');
		console.log('FN orderFastCreateOrder > start');
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
					$scope.orderFastCreateOrderLine(product_options_json, '');
					console.log('FN orderFastCreateOrder > end');
					console.log('');
				});
	};

	$scope.orderFastCreateOrderLine = function(product_options_json, parent_id){
		console.log('');
		console.log('FN orderFastCreateOrderLine > start');
		db.transaction(function(tx) {
			var fabric_id = $scope.orderFabricInJSON();
			console.log('Fabric_id='+fabric_id);
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
					$rootScope.orderCartProductsTotal = $rootScope.orderCartProductsTotal + 1;
					console.log('FN orderCreateOrderLine > end');
					console.log('');
				},
				tx_error
			);$scope.goToOrder();
		});
	};

	$scope.orderFastUpdateOrderLine = function(product_options_json){
	console.log('');
	console.log('FN orderFastUpdateOrderLine > start');
	db.transaction(function(tx) {
		var fabric_id = $scope.orderFabricInJSON();
		var sql_save_line_in_order = "UPDATE orders_lines SET \
										product_options = '" + $scope.db_prepare_string( JSON.stringify(product_options_json) ) + "', \
										fabric_id = '" + $scope.db_prepare_string( fabric_id ) + "', \
										status = 'ready' \
										WHERE id = '" + $scope.orderCurrentOrderLineId + "'";
		tx.executeSql(
			sql_save_line_in_order,
			[],
			function(tx, results) {
				console.log('FN orderUpdateOrderLine > DB > '+ sql_save_line_in_order);
				ngCart.addItem($scope.orderCurrentOrderLineId, $scope.orderCurrentProductId, $scope.orderCartProductName('', $scope.orderCurrentProductId), 1, 1, 'ready', fabric_id, $scope.orderCurrentOrderLineParentId, "item");
				console.log('FN orderUpdateOrderLine > end');
				console.log('');
			},
			tx_error
		); $scope.goToOrder();

	});
	};

	$scope.goToOrder = function(){
		$rootScope.rootLoadCart();
		$rootScope.orderCartEmpty = false;
		$rootScope.order_line_order_id=$scope.orderCurrentOrderId;
		$scope.openAside('right', true, 'cart.html', 'md');
		console.log('OrderId qu on envoie '+$scope.orderCurrentOrderId);
		$location.path( '/order')
		.search('order_line',$scope.orderCurrentOrderId)
		.search( 'product_id' , null);
	}

	$scope.orderFastSave = function(param){
		console.log('');
		console.log('FN orderFastSave > start');
		var form_error = false;
		var matching_fields = false;
		$scope.orderLoadProducts();

		jQuery( "#FastOrdering-grid select" ).each(function(index, value) {
			if (form_error == false) {
				if ( jQuery(this).attr('required') && !(jQuery(this).attr('disabled')) &&( jQuery(this).find( "option:selected" ).text() == '' || jQuery(this).find( "option:selected" ).text() == '-' ) ) {
					form_error = true;
					var field_label = jQuery(this).siblings('label').text();
					ngDialog.open({
						template: 'partials/dialog-msg.html',
						data: {question: field_label + $translate.instant('i18n_forms_controls_isempty')},
						className: 'ngdialog-theme-default'
					});
				}
				$scope.product_options_json[ jQuery(this).attr('data-optionid') ] = jQuery(this).val();
			}
		});

		jQuery( "#FastOrdering-grid input[type=text]" ).each(function(index, value) {
			if (form_error == false) {
				if ( jQuery(this).attr('required') && !(jQuery(this).attr('disabled')) && jQuery(this).val() == '' ) {
					form_error = true;
					var field_label = jQuery(this).siblings('label').text();
					ngDialog.open({
						template: 'partials/dialog-msg.html',
						data: {question: field_label + $translate.instant('i18n_forms_controls_isempty')},
						className: 'ngdialog-theme-default'
					});
				}
				$scope.product_options_json[ jQuery(this).attr('data-optionid') ] = jQuery(this).val();
			}
		});

		jQuery( "#FastOrdering-grid textarea" ).each(function(index, value) {
			if (form_error == false) {
				$scope.product_options_json[ jQuery(this).attr('data-optionid') ] = jQuery(this).val();
			}
		});

		console.log('DEBUG > '+ JSON.stringify($scope.product_options_json) );

		if (form_error === true){return false;}
		console.log('Order_id='+$scope.orderCurrentOrderId);
		console.log('OrderLine_id='+$scope.orderCurrentOrderLineId);

		// Create/Update order/order line
		if ($scope.orderCurrentOrderId == null) {
			$scope.orderFastCreateOrder($scope.product_options_json);
		} else if ($scope.orderCurrentOrderLineId == null) {
			$scope.orderFastCreateOrderLine($scope.product_options_json, '');
		} else {
			$scope.orderFastUpdateOrderLine($scope.product_options_json);
		}
	};

 orderFastProductOptionsOnChange = function(el){
	var selected_option_id = jQuery( el ).attr('data-optionid');
	var selected_option_value = jQuery( el ).val();
	console.log('select ' + selected_option_id + ' changed');
	var data_onselected = jQuery( el ).find("option[value="+selected_option_value+"]").attr('data-onselected');
	if (data_onselected != '') {

		// Hide
		if ( data_onselected.indexOf("HIDE") > -1 ) {
			var data_onselected = eval( data_onselected.replace(/HIDE/g, '') );
			data_onselected.forEach(function(suboption_id) {
				console.log('input[name="'+suboption_id+'"]' );
				jQuery( 'input[name="'+suboption_id+'"]' ).prop('disabled', true);
			});
		// SUBOPTION

		} else if ( data_onselected.indexOf("SHOW") > -1) {

			var data_onselected = eval( data_onselected.replace(/SHOW/g, '') );
			console.log(data_onselected);
			data_onselected.forEach(function(suboption_id) {
				var dis=false;
				if ( $scope.orderCurrentOrderLineParentId != null && $scope.orderCurrentOrderLineParentId > 0 ) {
					if ( inArray( suboption_id, a_matchedproduct_ids_nochange) )
					dis=true;
				}
				console.log('input[name="'+suboption_id+'"] SHOW' );
				jQuery( 'input[name="'+suboption_id+'"],select[name="'+suboption_id+'"],color[name="'+suboption_id+'"]' ).prop('disabled', dis);
		});
	};
	};
};

$scope.orderFastWriteOption();
};

init();

}]);
