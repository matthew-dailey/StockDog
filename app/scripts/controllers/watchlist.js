'use strict';

/**
 * @ngdoc function
 * @name stockDogApp.controller:WatchlistCtrl
 * @description
 * # WatchlistCtrl
 * Controller of the stockDogApp
 */
angular.module('stockDogApp')
  .controller('WatchlistCtrl', function ($scope, $routeParams, $modal,
    WatchlistService, CompanyService) {
      
      $scope.companies = CompanyService.query();
      $scope.watchlist = WatchlistService.query($routeParams.listId);
      $scope.stocks = $scope.watchlist.stocks;
      $scope.newStock = {};
      var addStockModal = $modal({
        scope: $scope,
        template: 'views/templates/addstock-modal.html',
        show: false
      });
      
      $scope.showStockModal = function() {
        addStockModal.$promise.then(addStockModal.show);
      };

      $scope.addStock = function() {
        // $scope.newStock has been populated by the modal this is attached to
        var fullCompany = _.find($scope.companies, function(company) {
          return company.label === $scope.newStock.company;
        });
        $scope.watchlist.addStock({
          listId: $routeParams.listId,
          company: fullCompany,
          shares: $scope.newStock.shares
        });
        addStockModal.hide();
        console.log('Adding new stock ' + JSON.stringify($scope.newStock));
        $scope.newStock = {};
      };
  });
