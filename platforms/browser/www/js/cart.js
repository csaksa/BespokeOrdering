'use strict';


angular.module('ngCart', ['ngCart.directives'])

    .config([function () {

    }])

    .provider('$ngCart', function () {
        this.$get = function () {
        };
    })

    .run(['$rootScope', 'ngCart','ngCartItem', 'store', function ($rootScope, ngCart, ngCartItem, store) {

        $rootScope.$on('ngCart:change', function(){
            ngCart.$save();
        });

        if (angular.isObject(store.get('cart'))) {
            ngCart.$restore(store.get('cart'));

        } else {
            ngCart.init();
        }

    }])

    .service('ngCart', ['$rootScope', 'ngCartItem', 'store', 'ngDialog', '$translate', function ($rootScope, ngCartItem, store, ngDialog, $translate) {

        this.init = function(){
            this.$cart = {
                shipping : null,
                taxRate : null,
                tax : null,
                items : []
            };
        };

        this.addItem = function (id, product_type_id, name, price, quantity, step, fabric, parent_id, data) {

            var inCart = this.getItemById(id);
            if (typeof inCart === 'object'){
                //Update quantity of an item if it's already in the cart
                inCart.setQuantity(quantity, false);
                inCart.setStep(step);
            } else {
                var newItem = new ngCartItem(id, product_type_id, name, price, quantity, step, fabric, parent_id, data);
				if (parent_id > 0) {

					var items_for_find_id = this.getItems();
					var counter = 0;
					var position_in_array = 0;
					angular.forEach(items_for_find_id, function (item) {
						counter++;
						if (item.getId() == parent_id)
							position_in_array = counter;
					});
					this.$cart.items.splice(position_in_array, 0, newItem);

				}
				else
					this.$cart.items.push(newItem);
                $rootScope.$broadcast('ngCart:itemAdded', newItem);
            }

            $rootScope.$broadcast('ngCart:change', {});
        };

        this.getItemById = function (itemId) {
            var items = this.getCart().items;
            var build = false;

            angular.forEach(items, function (item) {
                if  (item.getId() === itemId) {
                    build = item;
                }
            });
            return build;
        };

        this.setShipping = function(shipping){
            this.$cart.shipping = shipping;
            return this.getShipping();
        };

        this.getShipping = function(){
            if (this.getCart().items.length == 0) return 0;
            return  this.getCart().shipping;
        };

        this.setTaxRate = function(taxRate){
            this.$cart.taxRate = +parseFloat(taxRate).toFixed(2);
            return this.getTaxRate();
        };

        this.getTaxRate = function(){
            return this.$cart.taxRate
        };

        this.getTax = function(){
            return +parseFloat(((this.getSubTotal()/100) * this.getCart().taxRate )).toFixed(2);
        };

        this.setCart = function (cart) {
            this.$cart = cart;
            return this.getCart();
        };

        this.getCart = function(){
            return this.$cart;
        };

        this.getItems = function(){
            return this.getCart().items;
        };

        this.getTotalItems = function () {
            var count = 0;
            var items = this.getItems();
            angular.forEach(items, function (item) {
                count += item.getQuantity();
            });
            return count;
        };

        this.getTotalUniqueItems = function () {
            return this.getCart().items.length;
        };

        this.getReady = function () {
			var truefalse = true;
            var items = this.getItems();
            angular.forEach(items, function (item) {
                if (item.getStep() != 'ready')
					truefalse = false;
            });
            return truefalse;
        };

        this.getSubTotal = function(){
            var total = 0;
            angular.forEach(this.getCart().items, function (item) {
                total += item.getTotal();
            });
            return +parseFloat(total).toFixed(2);
        };

        this.totalCost = function () {
            return +parseFloat(this.getSubTotal() + this.getShipping() + this.getTax()).toFixed(2);
        };

        this.removeItem = function (index) {
            this.$cart.items.splice(index, 1);
            $rootScope.$broadcast('ngCart:itemRemoved', {});
            $rootScope.$broadcast('ngCart:change', {});

        };

        this.removeItemById = function (id) {

			var cart = this.getCart();

			ngDialog.openConfirm({
				template: 'partials/dialog-confirm.html',
				data: {question: $translate.instant('i18n_cart_deleteproduct_sure').replaceAll("<br>", " ")},
				className: 'ngdialog-theme-default',
                scope: $rootScope
			}).then(function () {

				angular.forEach(cart.items, function (item, index) {
					if  (item.getId() === id) {
						cart.items.splice(index, 1);
						console.log('Delete Item confirmed: '+ id);
					}
				});
				$rootScope.orderDeleteLine(id);

			}, function (reason) {
				console.log('Detele Item cancelled');
			});

			this.setCart(cart);
			$rootScope.$broadcast('ngCart:itemRemoved', {});
			$rootScope.$broadcast('ngCart:change', {});
        };

        this.editItemById = function (id) {
			$rootScope.orderEditLine(id);
        };

        this.editFastItemById = function (id) {
      $rootScope.orderFastEditLine(id);
        };

        this.copyItemById = function (id) {
			$rootScope.orderCopyLine(id);
		}

        this.matchingItemById = function (id, product_type_id) {
			$rootScope.orderAddMatchingLine(id, product_type_id);
		}

    this.matchingFastItemById = function (id, product_type_id) {
  $rootScope.orderFastAddMatchingLine(id, product_type_id);
}

        this.empty = function () {

            $rootScope.$broadcast('ngCart:change', {});
            this.$cart.items = [];
            localStorage.removeItem('cart');
        };

        this.toObject = function() {

            if (this.getItems().length === 0) return false;

            var items = [];
            angular.forEach(this.getItems(), function(item){
                items.push (item.toObject());
            });

            return {
                shipping: this.getShipping(),
                tax: this.getTax(),
                taxRate: this.getTaxRate(),
                subTotal: this.getSubTotal(),
                totalCost: this.totalCost(),
                items:items
            }
        };


        this.$restore = function(storedCart){
            var _self = this;
            _self.init();
            _self.$cart.shipping = storedCart.shipping;
            _self.$cart.tax = storedCart.tax;

            angular.forEach(storedCart.items, function (item) {
                _self.$cart.items.push(new ngCartItem(item._id, item._product_type_id, item._name, item._price, item._quantity, item._step, item._fabric, item._parent_id, item._data));
            });
            this.$save();
        };

        this.$save = function () {
            return store.set('cart', JSON.stringify(this.getCart()));
        }

    }])

    .factory('ngCartItem', ['$rootScope', '$log', function ($rootScope, $log) {

        var item = function (id, product_type_id, name, price, quantity, step, fabric, parent_id, data) {
            this.setId(id);
            this.setProductTypeId(product_type_id);
            this.setName(name);
            this.setPrice(price);
            this.setQuantity(quantity);
            this.setStep(step);
            this.setFabric(fabric);
            this.setParentId(parent_id);
            this.setData(data);
        };


        item.prototype.setId = function(id){
            if (id)  this._id = id;
            else {
                $log.error('An ID must be provided');
            }
        };

        item.prototype.getId = function(){
            return this._id;
        };

        item.prototype.setProductTypeId = function(product_type_id){
            if (product_type_id)  this._product_type_id = product_type_id;
            else {
                $log.error('A product type id must be provided');
            }
        };
        item.prototype.getProductTypeId = function(){
            return this._product_type_id;
        };

        item.prototype.setName = function(name){
            if (name)  this._name = name;
            else {
                $log.error('A name must be provided');
            }
        };
        item.prototype.getName = function(){
            return this._name;
        };

        item.prototype.setPrice = function(price){
            var priceFloat = parseFloat(price);
            if (priceFloat) {
                if (priceFloat <= 0) {
                    $log.error('A price must be over 0');
                } else {
                    this._price = (priceFloat);
                }
            } else {
                $log.error('A price must be provided');
            }
        };
        item.prototype.getPrice = function(){
            return this._price;
        };


        item.prototype.setQuantity = function(quantity, relative){

            var quantityInt = parseInt(quantity);
            if (quantityInt % 1 === 0){
                if (relative === true){
                    this._quantity  += quantityInt;
					if (this._quantity >= 1)
						$rootScope.orderQuantityLine(this._id, this._quantity);
                } else {
                    this._quantity = quantityInt;
                }
                if (this._quantity < 1) this._quantity = 1;

            } else {
                this._quantity = 1;
                $log.info('Quantity must be an integer and was defaulted to 1');
            }
            $rootScope.$broadcast('ngCart:change', {});

        };

        item.prototype.getQuantity = function(){
            return this._quantity;
        };

        item.prototype.setStep = function(step){
            if (step) this._step = step;
            else {
                $log.error('A step must be provided');
            }
        };
        item.prototype.getStep = function(){
            return this._step;
        };

        item.prototype.setFabric = function(fabric){
            this._fabric = fabric;
        };
        item.prototype.getFabric = function(){
            return this._fabric;
        };

        item.prototype.setParentId = function(parent_id){
            this._parent_id = parent_id;
        };
        item.prototype.getParentId = function(){
			if (this._parent_id != undefined && this._parent_id != 'undefined')
				return this._parent_id;
			else
				return '';
        };

        item.prototype.setData = function(data){
            if (data) this._data = data;
        };

        item.prototype.getData = function(){
            if (this._data) return this._data;
            else $log.info('This item has no data');
        };


        item.prototype.getTotal = function(){
            return +parseFloat(this.getQuantity() * this.getPrice()).toFixed(2);
        };

        item.prototype.toObject = function() {
            return {
                id: this.getId(),
                product_type_id: this.getProductTypeId(),
                name: this.getName(),
                price: this.getPrice(),
                quantity: this.getQuantity(),
                step: this.getStep(),
                parent_id: this.getParentId(),
                data: this.getData(),
                total: this.getTotal()
            }
        };

        return item;

    }])

    .service('store', ['$window', function ($window) {

        return {

            get: function (key) {
                if ($window.localStorage [key]) {
                    var cart = angular.fromJson($window.localStorage [key]);
                    return JSON.parse(cart);
                }
                return false;

            },


            set: function (key, val) {

                if (val === undefined) {
                    $window.localStorage .removeItem(key);
                } else {
                    $window.localStorage [key] = angular.toJson(val);
                }
                return $window.localStorage [key];
            }
        }
    }])

    .controller('CartController',['$scope', 'ngCart', function($scope, ngCart) {
        $scope.ngCart = ngCart;

    }])

    .value('version', '0.0.3-rc.1');
;'use strict';


angular.module('ngCart.directives', ['ngCart.fulfilment'])

    .controller('CartController', ['$scope', 'ngCart', function($scope, ngCart) {
        $scope.ngCart = ngCart;
    }])

    .directive('ngcartAddtocart', ['ngCart', function(ngCart){
        return {
            restrict : 'E',
            controller : 'CartController',
            scope: {
                id:'@',
                product_type_id:'@',
                name:'@',
                quantity:'@',
                quantityMax:'@',
                step:'@',
                fabric:'@',
                parent_id:'@',
                price:'@',
                data:'='
            },
            transclude: true,
            templateUrl: 'partials/cart-addtocart.html',
            link:function(scope, element, attrs){
                scope.attrs = attrs;
                scope.inCart = function(){
                    return  ngCart.getItemById(attrs.id);
                };

                if (scope.inCart()){
                    scope.q = ngCart.getItemById(attrs.id).getQuantity();
                } else {
                    scope.q = parseInt(scope.quantity);
                }

                scope.qtyOpt =  [];
                for (var i = 1; i <= scope.quantityMax; i++) {
                    scope.qtyOpt.push(i);
                }

            }

        };
    }])

    .directive('ngcartCart', [function(){
        return {
            restrict : 'E',
            controller : 'CartController',
            scope: {},
            templateUrl: 'partials/cart-details.html',
            link:function(scope, element, attrs){

            }
        };
    }])

    .directive('ngcartSummary', [function(){
        return {
            restrict : 'E',
            controller : 'CartController',
            scope: {},
            transclude: true,
            templateUrl: 'partials/cart-summary.html'
        };
    }])

    .directive('ngcartCheckout', [function(){
        return {
            restrict : 'E',
            controller : ('CartController', ['$scope', 'ngCart', 'fulfilmentProvider', function($scope, ngCart, fulfilmentProvider) {
                $scope.ngCart = ngCart;

                $scope.checkout = function () {
                    fulfilmentProvider.setService($scope.service);
                    fulfilmentProvider.setSettings($scope.settings);
                    var promise = fulfilmentProvider.checkout();
                    console.log(promise);
                }
            }]),
            scope: {
                service:'@',
                settings:'='
            },
            transclude: true,
            templateUrl: 'partials/cart-checkout.html'
        };
    }]);


angular.module('ngCart.fulfilment', [])

    .service('fulfilmentProvider', ['$injector', function($injector){

        this._obj = {
            service : undefined,
            settings : undefined
        };

        this.setService = function(service){
            this._obj.service = service;
        };

        this.setSettings = function(settings){
            this._obj.settings = settings;
        };

        this.checkout = function(){
            var provider = $injector.get('ngCart.fulfilment.' + this._obj.service);
              return provider.checkout(this._obj.settings);

        }

    }])

	.service('ngCart.fulfilment.log', ['$q', '$log', 'ngCart', function($q, $log, ngCart){

			this.checkout = function(){

				var deferred = $q.defer();

				$log.info(ngCart.toObject());
				deferred.resolve({
					cart:ngCart.toObject()
				});

				return deferred.promise;

			}

	 }])

	.service('ngCart.fulfilment.http', ['$http', 'ngCart', function($http, ngCart){

			this.checkout = function(settings){
				return $http.post(settings.url,
					{data:ngCart.toObject()})
			}
	 }])


	.service('ngCart.fulfilment.paypal', ['$http', 'ngCart', function($http, ngCart){


	}]);
