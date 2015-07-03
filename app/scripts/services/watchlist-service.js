'use strict';

/**
 * @ngdoc service
 * @name stockDogApp.WatchlistService
 * @description
 * # WatchlistService
 * Service in the stockDogApp.
 */
angular.module('stockDogApp')
    .service('WatchlistService', function WatchlistService() {
    var StockModel = {
        save: function () {
            var watchlist = findById(this.listId);
            watchlist.recalculate();
            saveModel();
        }
    };
    
    // Augment watchlists with additional helper functions
    var WatchlistModel = {
        addStock: function (stock) {
            console.log('Adding stock ' + JSON.stringify(stock));
            var existingStock = _.find(this.stocks, function (s) {
                return s.company === stock.company;
            });
            if (existingStock) {
                console.log('stock exists');
                existingStock.shares += stock.shares;
            } else {
                console.log('new stock');
                _.extend(stock, StockModel);
                this.stocks.push(stock);
            }
            this.recalculate();
            saveModel();
        },
        removeStock: function (stock) {
            _.remove(this.stocks, function (s) {
                return s.company === stock.company;
            });
            this.recalculate();
            saveModel();
        },
        recalculate: function () {
            var calcs = _.reduce(this.stocks, function (calcs, stock) {
                calcs.shares += stock.shares;
                calcs.marketValue += stock.marketValue;
                calcs.dayChange += stock.dayChange;
                return calcs;
            }, { shares: 0, marketValue: 0, dayChange: 0 });

            this.shares = calcs.shares;
            this.marketValue = calcs.marketValue;
            this.dayChange = calcs.dayChange;
        }
    };
    
    // AngularJS will instantiate a singleton by calling "new" on this function
    // [1] Helper: Load watchlists from localStorage
    var loadModel = function () {
        var model = {
            watchlists: localStorage['StockDog.watchlists'] ?
                JSON.parse(localStorage['StockDog.watchlists']) : [],
            nextId: localStorage['StockDog.nextId'] ?
                parseInt(localStorage['StockDog.nextId']) : 0
        };
        _.each(model.watchlists, function (watchlist) {
            _.extend(watchlist, WatchlistModel);
            _.each(watchlist.stocks, function (stock) {
                _.extend(stock, StockModel);
            });
        });
        return model;
    };

    // [2] Helper: Save watchlists to localStorage
    var saveModel = function () {
        localStorage['StockDog.watchlists'] = JSON.stringify(Model.watchlists);
        localStorage['StockDog.nextId'] = Model.nextId;
    };

    // [3] Helper: Use lodash to find a watchlist with given ID
    var findById = function (listId) {
        return _.find(Model.watchlists, function (watchlist) {
            return watchlist.id === parseInt(listId);
        });
    };

    // [4] Return all watchlists or find by given ID
    this.query = function (listId) {
        if (listId) {
            return findById(listId);
        } else {
            return Model.watchlists;
        }
    };

    // [5] Save a new watchlist to watchlists model
    this.save = function (watchlist) {
        watchlist.id = Model.nextId++;
        watchlist.stocks = [];
        _.extend(watchlist, WatchlistModel);
        Model.watchlists.push(watchlist);
        saveModel();
    };

    // [6] Remove given watchlist from watchlists model
    this.remove = function (watchlist) {
        _.remove(Model.watchlists, function (list) {
            return list.id === watchlist.id;
        });
        saveModel();
    };

    // [7] Initialize Model for this singleton service
    var Model = loadModel();
});
