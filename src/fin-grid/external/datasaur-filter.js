/* eslint-env commonjs */

'use strict';

(function() {

var DataSourceIndexed = window.datasaur.indexed;

/**
 * @interface filterInterface
 */

/**
 * @name filterInterface#test
 * @method
 * @param {object} dataRow - Object representing a row in the grid containing all the fields listed in {@link DataSource#fields|fields}.
 * @returns {boolean}
 * * `true` - include in grid (row passes through filter)
 * * `false` - exclude from grid (row is blocked by filter)
 */

/**
 * Before calling {@link filterInterface#test} on the grid (_i.e.,_ on every row), it is worth calling `enabled`.
 * @name filterInterface#enabled
 * @type {boolean}
 * * `true` - Filter expression is non null (for filter-tree this means that it contains one or more leaf nodes)
 * * `false` - Filter expression is null
 */

/**
 * @name controller
 * @implements filterInterface
 * @memberOf DataSourceGlobalFilter#
 */

/**
 * @constructor
 * @extends DataSourceIndexed
 */
var DataSourceGlobalFilter = DataSourceIndexed.extend('DataSourceGlobalFilter', {

    /**
     * INCLUDED FOR BACKWARDS COMPATIBILITY FOR VERSIONS OF HYPERGRID < 1.2.10
     * @param {filterInterface} [controller] - If undefined, deletes filter.
     * @memberOf DataSourceGlobalFilter#
     */
    set: function(controller) {
        this.controller = controller || this.newController();
    },

    get: function() {
        return this.controller;
    },

    /**
     * @memberOf DataSourceGlobalFilter#
     */
    apply: function() {
        if (this.controller.enabled) {
            this.buildIndex(this.filterTest);
        } else {
            this.clearIndex();
        }
    },

    /**
     * @implements filterPredicate
     * @memberOf DataSourceGlobalFilter#
     */
    filterTest: function(r, rowObject) {
        return this.controller.test(rowObject);
    },

    /**
     *
     * @memberOf DataSourceGlobalFilter#
     * @returns {number}
     */
    getRowCount: function() {
        return this.controller.enabled ? this.index.length : this.dataSource.getRowCount();
    }
});

Object.defineProperty(DataSourceGlobalFilter.prototype, 'type', { value: 'filter' }); // read-only property

window.datasaur.filter = DataSourceGlobalFilter;
})();