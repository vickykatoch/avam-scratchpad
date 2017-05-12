(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* eslint-env browser */

'use strict';

var Column = window.fin.Hypergrid.behaviors.Column; // try require('fin-hypergrid/src/behaviors/Column') when externalized

function Hypersorter(grid, targets) {
    this.grid = grid;

    this.install(targets);

    this.sorts = [];

    grid.behavior.dataModel.charMap.mixIn({
        ASC: '\u25b2', // UPWARDS_BLACK_ARROW, aka '▲'
        DESC: '\u25bc' // DOWNWARDS_BLACK_ARROW, aka '▼'
    });

    grid.addInternalEventListener('fin-column-sort', function(c, keys){
        grid.toggleSort(c, keys);
    });
}

Hypersorter.prototype.name = 'Hypersorter';

Hypersorter.prototype.install = function(targets) {
    var Hypergrid = this.grid.constructor;
    Hypergrid.defaults.mixIn(require('./mix-ins/defaults'));
    Hypergrid.prototype.mixIn(require('./mix-ins/grid'));
    targets = targets || {};
    (targets.Behavior && targets.Behavior.prototype || Object.getPrototypeOf(this.grid.behavior)).mixIn(require('./mix-ins/behavior'));
    (targets.Column || Column).prototype.mixIn(require('./mix-ins/column'));
    (targets.DataModel && targets.DataModel.prototype || Object.getPrototypeOf(this.grid.behavior.dataModel)).mixIn(require('./mix-ins/dataModel'));
};

/** @typedef {object} sortSpecInterface
 * @property {number} columnIndex
 * @property {number} direction
 * @property {string} [type]
 */

/**
 * @implements dataControlInterface#properties
 * @desc See {@link sortSpecInterface} for available sort properties.
 * @memberOf Hypersorter.prototype
 */
Hypersorter.prototype.properties = function(properties) {
    var result, value,
        columnSort = this.grid.behavior.dataModel.getColumnSortState(properties.COLUMN.index);

    if (columnSort) {
        if (properties.GETTER) {
            result = columnSort[properties.GETTER];
            if (result === undefined) {
                result = null;
            }
        } else {
            for (var key in properties) {
                value = properties[key];
                columnSort[key] = typeof value === 'function' ? value() : value;
            }
        }
    }

    return result;
};

window.fin.Hypergrid.Hypersorter = Hypersorter;

},{"./mix-ins/behavior":2,"./mix-ins/column":3,"./mix-ins/dataModel":4,"./mix-ins/defaults":5,"./mix-ins/grid":6}],2:[function(require,module,exports){
'use strict';

module.exports = {

    /**
     * @summary The behaviors's sorter data controller.
     * @desc This getter/setter is syntactic sugar for calls to `getController` and `setController`.
     * @memberOf Behavior#
     */
    get sorter() {
        return this.getController('sorter');
    },
    set sorter(sorter) {
        this.setController('sorter', sorter);
    },

    /**
     * @memberOf Behavior.prototype
     * @param {number} c - grid column index.
     * @param {string[]} keys
     */
    toggleSort: function(c, keys) {
        var column = this.getActiveColumn(c);
        if (column) {
            column.toggleSort(keys);
        }
    },
    sortChanged: function(hiddenColumns){
        if (removeHiddenColumns(
                this.sorter.sorts,
                hiddenColumns || this.getHiddenColumns()
        )) {
            this.reindex();
        }
    }

};
//Logic to moved to adapter layer outside of Hypergrid Core
function removeHiddenColumns(oldSorted, hiddenColumns){
    var dirty = false;
    oldSorted.forEach(function(i) {
        var j = 0,
            colIndex;
        while (j < hiddenColumns.length) {
            colIndex = hiddenColumns[j].index + 1; //hack to get around 0 index
            if (colIndex === i) {
                hiddenColumns[j].unSort();
                dirty = true;
                break;
            }
            j++;
        }
    });
    return dirty;
}

},{}],3:[function(require,module,exports){
'use strict';

module.exports = {
    toggleSort: function(keys) {
        this.dataModel.toggleSort(this, keys);
    },

    unSort: function(deferred) {
        this.dataModel.unSortColumn(this, deferred);
    }
};

},{}],4:[function(require,module,exports){
'use strict';

module.exports = {

    /**
     * @summary The behaviors's sorter data controller.
     * @desc This getter/setter is syntactic sugar for calls to `getController` and `setController`.
     * @param {dataControlInterface|undefined|null} sorter
     * @memberOf Behavior#
     */
    get sorter() {
        return this.getController('sorter');
    },
    set sorter(sorter) {
        this.setController('sorter', sorter);
    },

    /**
     * @memberOf dataModels.JSON.prototype
     * @param column
     * @param keys
     */
    toggleSort: function(column, keys) {
        this.incrementSortState(column, keys);
        this.serializeSortState();
        this.reindex();
    },
    /**
     * @memberOf dataModels.JSON.prototype
     * @param column
     * @param {boolean} deferred
     */
    unSortColumn: function(column, deferred) {
        var sortSpec = this.getColumnSortState(column.index);

        if (sortSpec) {
            this.sorter.sorts.splice(sortSpec.rank, 1); //Removed from sorts
            if (!deferred) {
                this.reindex();
            }
        }

        this.serializeSortState();
    },

    /**
     * @param {number} columnIndex
     * @returns {sortSpecInterface}
     */
    getColumnSortState: function(columnIndex){
        var rank,
            sort = this.sorter.sorts.find(function(sort, index) {
                rank = index;
                return sort.columnIndex === columnIndex;
            });

        return sort && { sort: sort, rank: rank };
    },

    /**
     * @memberOf dataModels.JSON.prototype
     * @param column
     * @param {string[]} keys
     * @return {object[]} sorts
     */
    incrementSortState: function(column, keys) {
        var sorts = this.sorter.sorts,
            columnIndex = column.index,
            columnSchema = this.schema[columnIndex],
            sortSpec = this.getColumnSortState(columnIndex);

        if (!sortSpec) { // was unsorted
            if (keys.indexOf('CTRL') < 0) {
                sorts.length = 0;
            }
            sorts.unshift({
                columnIndex: columnIndex, // so define and...
                direction: 1, // ...make ascending
                type: columnSchema.type
            });
        } else if (sortSpec.sort.direction > 0) { // was ascending
            sortSpec.sort.direction = -1; // so make descending
        } else { // was descending
            this.unSortColumn(column, true); // so make unsorted
        }

        //Minor improvement, but this check can happen earlier and terminate earlier
        sorts.length = Math.min(sorts.length, this.grid.properties.maxSortColumns);
    },

    serializeSortState: function(){
        this.grid.properties.sorts = this.sorter.sorts;
    },

    /**
     * @memberOf dataModels.JSON.prototype
     * @param index
     * @param returnAsString
     * @desc Provides the unicode character used to denote visually if a column is a sorted state
     * @returns {*}
     */
    getSortImageForColumn: function(columnIndex) {
        var sorts = this.sorter.sorts,
            sortSpec = this.getColumnSortState(columnIndex),
            result, rank;

        if (sortSpec) {
            var directionKey = sortSpec.sort.direction > 0 ? 'ASC' : 'DESC',
                arrow = this.charMap[directionKey];

            result = arrow + ' ';

            if (sorts.length > 1) {
                rank = sorts.length - sortSpec.rank;
                result = rank + result;
            }
        }

        return result;
    }
};

},{}],5:[function(require,module,exports){
'use strict';

exports.maxSortColumns = 3;

},{}],6:[function(require,module,exports){
'use strict';

module.exports = {

    /**
     * @summary The behaviors's sorter data controller.
     * @desc This getter/setter is syntactic sugar for calls to `getController` and `setController`.
     * @memberOf Hypergrid#
     */
    get sorter() {
        return this.getController('sorter');
    },
    set sorter(sorter) {
        this.setController('sorter', sorter);
    },

    /**
     * @memberOf Hypergrid#
     * @param event
     */
    toggleSort: function(event) {
        if (!this.abortEditing()) { return; }

        var behavior = this.behavior,
            self = this,
            c = event.detail.column,
            keys =  event.detail.keys;

        behavior.toggleSort(c, keys);

        setTimeout(function() {
            self.synchronizeScrollingBoundaries();
            behavior.autosizeAllColumns();
            self.repaint();
        }, 10);
    }

};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9ia2F0b2NoL3dvcmsvZmluLWh5cGVyZ3JpZC9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2JrYXRvY2gvd29yay9maW4taHlwZXJncmlkL2FkZC1vbnMvaHlwZXItc29ydGVyL2Zha2VfZWUzYWE2NDkuanMiLCIvVXNlcnMvYmthdG9jaC93b3JrL2Zpbi1oeXBlcmdyaWQvYWRkLW9ucy9oeXBlci1zb3J0ZXIvbWl4LWlucy9iZWhhdmlvci5qcyIsIi9Vc2Vycy9ia2F0b2NoL3dvcmsvZmluLWh5cGVyZ3JpZC9hZGQtb25zL2h5cGVyLXNvcnRlci9taXgtaW5zL2NvbHVtbi5qcyIsIi9Vc2Vycy9ia2F0b2NoL3dvcmsvZmluLWh5cGVyZ3JpZC9hZGQtb25zL2h5cGVyLXNvcnRlci9taXgtaW5zL2RhdGFNb2RlbC5qcyIsIi9Vc2Vycy9ia2F0b2NoL3dvcmsvZmluLWh5cGVyZ3JpZC9hZGQtb25zL2h5cGVyLXNvcnRlci9taXgtaW5zL2RlZmF1bHRzLmpzIiwiL1VzZXJzL2JrYXRvY2gvd29yay9maW4taHlwZXJncmlkL2FkZC1vbnMvaHlwZXItc29ydGVyL21peC1pbnMvZ3JpZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekhBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29sdW1uID0gd2luZG93LmZpbi5IeXBlcmdyaWQuYmVoYXZpb3JzLkNvbHVtbjsgLy8gdHJ5IHJlcXVpcmUoJ2Zpbi1oeXBlcmdyaWQvc3JjL2JlaGF2aW9ycy9Db2x1bW4nKSB3aGVuIGV4dGVybmFsaXplZFxuXG5mdW5jdGlvbiBIeXBlcnNvcnRlcihncmlkLCB0YXJnZXRzKSB7XG4gICAgdGhpcy5ncmlkID0gZ3JpZDtcblxuICAgIHRoaXMuaW5zdGFsbCh0YXJnZXRzKTtcblxuICAgIHRoaXMuc29ydHMgPSBbXTtcblxuICAgIGdyaWQuYmVoYXZpb3IuZGF0YU1vZGVsLmNoYXJNYXAubWl4SW4oe1xuICAgICAgICBBU0M6ICdcXHUyNWIyJywgLy8gVVBXQVJEU19CTEFDS19BUlJPVywgYWthICfilrInXG4gICAgICAgIERFU0M6ICdcXHUyNWJjJyAvLyBET1dOV0FSRFNfQkxBQ0tfQVJST1csIGFrYSAn4pa8J1xuICAgIH0pO1xuXG4gICAgZ3JpZC5hZGRJbnRlcm5hbEV2ZW50TGlzdGVuZXIoJ2Zpbi1jb2x1bW4tc29ydCcsIGZ1bmN0aW9uKGMsIGtleXMpe1xuICAgICAgICBncmlkLnRvZ2dsZVNvcnQoYywga2V5cyk7XG4gICAgfSk7XG59XG5cbkh5cGVyc29ydGVyLnByb3RvdHlwZS5uYW1lID0gJ0h5cGVyc29ydGVyJztcblxuSHlwZXJzb3J0ZXIucHJvdG90eXBlLmluc3RhbGwgPSBmdW5jdGlvbih0YXJnZXRzKSB7XG4gICAgdmFyIEh5cGVyZ3JpZCA9IHRoaXMuZ3JpZC5jb25zdHJ1Y3RvcjtcbiAgICBIeXBlcmdyaWQuZGVmYXVsdHMubWl4SW4ocmVxdWlyZSgnLi9taXgtaW5zL2RlZmF1bHRzJykpO1xuICAgIEh5cGVyZ3JpZC5wcm90b3R5cGUubWl4SW4ocmVxdWlyZSgnLi9taXgtaW5zL2dyaWQnKSk7XG4gICAgdGFyZ2V0cyA9IHRhcmdldHMgfHwge307XG4gICAgKHRhcmdldHMuQmVoYXZpb3IgJiYgdGFyZ2V0cy5CZWhhdmlvci5wcm90b3R5cGUgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMuZ3JpZC5iZWhhdmlvcikpLm1peEluKHJlcXVpcmUoJy4vbWl4LWlucy9iZWhhdmlvcicpKTtcbiAgICAodGFyZ2V0cy5Db2x1bW4gfHwgQ29sdW1uKS5wcm90b3R5cGUubWl4SW4ocmVxdWlyZSgnLi9taXgtaW5zL2NvbHVtbicpKTtcbiAgICAodGFyZ2V0cy5EYXRhTW9kZWwgJiYgdGFyZ2V0cy5EYXRhTW9kZWwucHJvdG90eXBlIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzLmdyaWQuYmVoYXZpb3IuZGF0YU1vZGVsKSkubWl4SW4ocmVxdWlyZSgnLi9taXgtaW5zL2RhdGFNb2RlbCcpKTtcbn07XG5cbi8qKiBAdHlwZWRlZiB7b2JqZWN0fSBzb3J0U3BlY0ludGVyZmFjZVxuICogQHByb3BlcnR5IHtudW1iZXJ9IGNvbHVtbkluZGV4XG4gKiBAcHJvcGVydHkge251bWJlcn0gZGlyZWN0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW3R5cGVdXG4gKi9cblxuLyoqXG4gKiBAaW1wbGVtZW50cyBkYXRhQ29udHJvbEludGVyZmFjZSNwcm9wZXJ0aWVzXG4gKiBAZGVzYyBTZWUge0BsaW5rIHNvcnRTcGVjSW50ZXJmYWNlfSBmb3IgYXZhaWxhYmxlIHNvcnQgcHJvcGVydGllcy5cbiAqIEBtZW1iZXJPZiBIeXBlcnNvcnRlci5wcm90b3R5cGVcbiAqL1xuSHlwZXJzb3J0ZXIucHJvdG90eXBlLnByb3BlcnRpZXMgPSBmdW5jdGlvbihwcm9wZXJ0aWVzKSB7XG4gICAgdmFyIHJlc3VsdCwgdmFsdWUsXG4gICAgICAgIGNvbHVtblNvcnQgPSB0aGlzLmdyaWQuYmVoYXZpb3IuZGF0YU1vZGVsLmdldENvbHVtblNvcnRTdGF0ZShwcm9wZXJ0aWVzLkNPTFVNTi5pbmRleCk7XG5cbiAgICBpZiAoY29sdW1uU29ydCkge1xuICAgICAgICBpZiAocHJvcGVydGllcy5HRVRURVIpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGNvbHVtblNvcnRbcHJvcGVydGllcy5HRVRURVJdO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBwcm9wZXJ0aWVzW2tleV07XG4gICAgICAgICAgICAgICAgY29sdW1uU29ydFtrZXldID0gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nID8gdmFsdWUoKSA6IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSHlwZXJzb3J0ZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgLyoqXG4gICAgICogQHN1bW1hcnkgVGhlIGJlaGF2aW9ycydzIHNvcnRlciBkYXRhIGNvbnRyb2xsZXIuXG4gICAgICogQGRlc2MgVGhpcyBnZXR0ZXIvc2V0dGVyIGlzIHN5bnRhY3RpYyBzdWdhciBmb3IgY2FsbHMgdG8gYGdldENvbnRyb2xsZXJgIGFuZCBgc2V0Q29udHJvbGxlcmAuXG4gICAgICogQG1lbWJlck9mIEJlaGF2aW9yI1xuICAgICAqL1xuICAgIGdldCBzb3J0ZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldENvbnRyb2xsZXIoJ3NvcnRlcicpO1xuICAgIH0sXG4gICAgc2V0IHNvcnRlcihzb3J0ZXIpIHtcbiAgICAgICAgdGhpcy5zZXRDb250cm9sbGVyKCdzb3J0ZXInLCBzb3J0ZXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyT2YgQmVoYXZpb3IucHJvdG90eXBlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGMgLSBncmlkIGNvbHVtbiBpbmRleC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBrZXlzXG4gICAgICovXG4gICAgdG9nZ2xlU29ydDogZnVuY3Rpb24oYywga2V5cykge1xuICAgICAgICB2YXIgY29sdW1uID0gdGhpcy5nZXRBY3RpdmVDb2x1bW4oYyk7XG4gICAgICAgIGlmIChjb2x1bW4pIHtcbiAgICAgICAgICAgIGNvbHVtbi50b2dnbGVTb3J0KGtleXMpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBzb3J0Q2hhbmdlZDogZnVuY3Rpb24oaGlkZGVuQ29sdW1ucyl7XG4gICAgICAgIGlmIChyZW1vdmVIaWRkZW5Db2x1bW5zKFxuICAgICAgICAgICAgICAgIHRoaXMuc29ydGVyLnNvcnRzLFxuICAgICAgICAgICAgICAgIGhpZGRlbkNvbHVtbnMgfHwgdGhpcy5nZXRIaWRkZW5Db2x1bW5zKClcbiAgICAgICAgKSkge1xuICAgICAgICAgICAgdGhpcy5yZWluZGV4KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn07XG4vL0xvZ2ljIHRvIG1vdmVkIHRvIGFkYXB0ZXIgbGF5ZXIgb3V0c2lkZSBvZiBIeXBlcmdyaWQgQ29yZVxuZnVuY3Rpb24gcmVtb3ZlSGlkZGVuQ29sdW1ucyhvbGRTb3J0ZWQsIGhpZGRlbkNvbHVtbnMpe1xuICAgIHZhciBkaXJ0eSA9IGZhbHNlO1xuICAgIG9sZFNvcnRlZC5mb3JFYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgdmFyIGogPSAwLFxuICAgICAgICAgICAgY29sSW5kZXg7XG4gICAgICAgIHdoaWxlIChqIDwgaGlkZGVuQ29sdW1ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbEluZGV4ID0gaGlkZGVuQ29sdW1uc1tqXS5pbmRleCArIDE7IC8vaGFjayB0byBnZXQgYXJvdW5kIDAgaW5kZXhcbiAgICAgICAgICAgIGlmIChjb2xJbmRleCA9PT0gaSkge1xuICAgICAgICAgICAgICAgIGhpZGRlbkNvbHVtbnNbal0udW5Tb3J0KCk7XG4gICAgICAgICAgICAgICAgZGlydHkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaisrO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRpcnR5O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0b2dnbGVTb3J0OiBmdW5jdGlvbihrZXlzKSB7XG4gICAgICAgIHRoaXMuZGF0YU1vZGVsLnRvZ2dsZVNvcnQodGhpcywga2V5cyk7XG4gICAgfSxcblxuICAgIHVuU29ydDogZnVuY3Rpb24oZGVmZXJyZWQpIHtcbiAgICAgICAgdGhpcy5kYXRhTW9kZWwudW5Tb3J0Q29sdW1uKHRoaXMsIGRlZmVycmVkKTtcbiAgICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgIC8qKlxuICAgICAqIEBzdW1tYXJ5IFRoZSBiZWhhdmlvcnMncyBzb3J0ZXIgZGF0YSBjb250cm9sbGVyLlxuICAgICAqIEBkZXNjIFRoaXMgZ2V0dGVyL3NldHRlciBpcyBzeW50YWN0aWMgc3VnYXIgZm9yIGNhbGxzIHRvIGBnZXRDb250cm9sbGVyYCBhbmQgYHNldENvbnRyb2xsZXJgLlxuICAgICAqIEBwYXJhbSB7ZGF0YUNvbnRyb2xJbnRlcmZhY2V8dW5kZWZpbmVkfG51bGx9IHNvcnRlclxuICAgICAqIEBtZW1iZXJPZiBCZWhhdmlvciNcbiAgICAgKi9cbiAgICBnZXQgc29ydGVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDb250cm9sbGVyKCdzb3J0ZXInKTtcbiAgICB9LFxuICAgIHNldCBzb3J0ZXIoc29ydGVyKSB7XG4gICAgICAgIHRoaXMuc2V0Q29udHJvbGxlcignc29ydGVyJywgc29ydGVyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlck9mIGRhdGFNb2RlbHMuSlNPTi5wcm90b3R5cGVcbiAgICAgKiBAcGFyYW0gY29sdW1uXG4gICAgICogQHBhcmFtIGtleXNcbiAgICAgKi9cbiAgICB0b2dnbGVTb3J0OiBmdW5jdGlvbihjb2x1bW4sIGtleXMpIHtcbiAgICAgICAgdGhpcy5pbmNyZW1lbnRTb3J0U3RhdGUoY29sdW1uLCBrZXlzKTtcbiAgICAgICAgdGhpcy5zZXJpYWxpemVTb3J0U3RhdGUoKTtcbiAgICAgICAgdGhpcy5yZWluZGV4KCk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyT2YgZGF0YU1vZGVscy5KU09OLnByb3RvdHlwZVxuICAgICAqIEBwYXJhbSBjb2x1bW5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGRlZmVycmVkXG4gICAgICovXG4gICAgdW5Tb3J0Q29sdW1uOiBmdW5jdGlvbihjb2x1bW4sIGRlZmVycmVkKSB7XG4gICAgICAgIHZhciBzb3J0U3BlYyA9IHRoaXMuZ2V0Q29sdW1uU29ydFN0YXRlKGNvbHVtbi5pbmRleCk7XG5cbiAgICAgICAgaWYgKHNvcnRTcGVjKSB7XG4gICAgICAgICAgICB0aGlzLnNvcnRlci5zb3J0cy5zcGxpY2Uoc29ydFNwZWMucmFuaywgMSk7IC8vUmVtb3ZlZCBmcm9tIHNvcnRzXG4gICAgICAgICAgICBpZiAoIWRlZmVycmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWluZGV4KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNlcmlhbGl6ZVNvcnRTdGF0ZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY29sdW1uSW5kZXhcbiAgICAgKiBAcmV0dXJucyB7c29ydFNwZWNJbnRlcmZhY2V9XG4gICAgICovXG4gICAgZ2V0Q29sdW1uU29ydFN0YXRlOiBmdW5jdGlvbihjb2x1bW5JbmRleCl7XG4gICAgICAgIHZhciByYW5rLFxuICAgICAgICAgICAgc29ydCA9IHRoaXMuc29ydGVyLnNvcnRzLmZpbmQoZnVuY3Rpb24oc29ydCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICByYW5rID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNvcnQuY29sdW1uSW5kZXggPT09IGNvbHVtbkluZGV4O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHNvcnQgJiYgeyBzb3J0OiBzb3J0LCByYW5rOiByYW5rIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJPZiBkYXRhTW9kZWxzLkpTT04ucHJvdG90eXBlXG4gICAgICogQHBhcmFtIGNvbHVtblxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IGtleXNcbiAgICAgKiBAcmV0dXJuIHtvYmplY3RbXX0gc29ydHNcbiAgICAgKi9cbiAgICBpbmNyZW1lbnRTb3J0U3RhdGU6IGZ1bmN0aW9uKGNvbHVtbiwga2V5cykge1xuICAgICAgICB2YXIgc29ydHMgPSB0aGlzLnNvcnRlci5zb3J0cyxcbiAgICAgICAgICAgIGNvbHVtbkluZGV4ID0gY29sdW1uLmluZGV4LFxuICAgICAgICAgICAgY29sdW1uU2NoZW1hID0gdGhpcy5zY2hlbWFbY29sdW1uSW5kZXhdLFxuICAgICAgICAgICAgc29ydFNwZWMgPSB0aGlzLmdldENvbHVtblNvcnRTdGF0ZShjb2x1bW5JbmRleCk7XG5cbiAgICAgICAgaWYgKCFzb3J0U3BlYykgeyAvLyB3YXMgdW5zb3J0ZWRcbiAgICAgICAgICAgIGlmIChrZXlzLmluZGV4T2YoJ0NUUkwnKSA8IDApIHtcbiAgICAgICAgICAgICAgICBzb3J0cy5sZW5ndGggPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc29ydHMudW5zaGlmdCh7XG4gICAgICAgICAgICAgICAgY29sdW1uSW5kZXg6IGNvbHVtbkluZGV4LCAvLyBzbyBkZWZpbmUgYW5kLi4uXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAxLCAvLyAuLi5tYWtlIGFzY2VuZGluZ1xuICAgICAgICAgICAgICAgIHR5cGU6IGNvbHVtblNjaGVtYS50eXBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChzb3J0U3BlYy5zb3J0LmRpcmVjdGlvbiA+IDApIHsgLy8gd2FzIGFzY2VuZGluZ1xuICAgICAgICAgICAgc29ydFNwZWMuc29ydC5kaXJlY3Rpb24gPSAtMTsgLy8gc28gbWFrZSBkZXNjZW5kaW5nXG4gICAgICAgIH0gZWxzZSB7IC8vIHdhcyBkZXNjZW5kaW5nXG4gICAgICAgICAgICB0aGlzLnVuU29ydENvbHVtbihjb2x1bW4sIHRydWUpOyAvLyBzbyBtYWtlIHVuc29ydGVkXG4gICAgICAgIH1cblxuICAgICAgICAvL01pbm9yIGltcHJvdmVtZW50LCBidXQgdGhpcyBjaGVjayBjYW4gaGFwcGVuIGVhcmxpZXIgYW5kIHRlcm1pbmF0ZSBlYXJsaWVyXG4gICAgICAgIHNvcnRzLmxlbmd0aCA9IE1hdGgubWluKHNvcnRzLmxlbmd0aCwgdGhpcy5ncmlkLnByb3BlcnRpZXMubWF4U29ydENvbHVtbnMpO1xuICAgIH0sXG5cbiAgICBzZXJpYWxpemVTb3J0U3RhdGU6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMuZ3JpZC5wcm9wZXJ0aWVzLnNvcnRzID0gdGhpcy5zb3J0ZXIuc29ydHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJPZiBkYXRhTW9kZWxzLkpTT04ucHJvdG90eXBlXG4gICAgICogQHBhcmFtIGluZGV4XG4gICAgICogQHBhcmFtIHJldHVybkFzU3RyaW5nXG4gICAgICogQGRlc2MgUHJvdmlkZXMgdGhlIHVuaWNvZGUgY2hhcmFjdGVyIHVzZWQgdG8gZGVub3RlIHZpc3VhbGx5IGlmIGEgY29sdW1uIGlzIGEgc29ydGVkIHN0YXRlXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZ2V0U29ydEltYWdlRm9yQ29sdW1uOiBmdW5jdGlvbihjb2x1bW5JbmRleCkge1xuICAgICAgICB2YXIgc29ydHMgPSB0aGlzLnNvcnRlci5zb3J0cyxcbiAgICAgICAgICAgIHNvcnRTcGVjID0gdGhpcy5nZXRDb2x1bW5Tb3J0U3RhdGUoY29sdW1uSW5kZXgpLFxuICAgICAgICAgICAgcmVzdWx0LCByYW5rO1xuXG4gICAgICAgIGlmIChzb3J0U3BlYykge1xuICAgICAgICAgICAgdmFyIGRpcmVjdGlvbktleSA9IHNvcnRTcGVjLnNvcnQuZGlyZWN0aW9uID4gMCA/ICdBU0MnIDogJ0RFU0MnLFxuICAgICAgICAgICAgICAgIGFycm93ID0gdGhpcy5jaGFyTWFwW2RpcmVjdGlvbktleV07XG5cbiAgICAgICAgICAgIHJlc3VsdCA9IGFycm93ICsgJyAnO1xuXG4gICAgICAgICAgICBpZiAoc29ydHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIHJhbmsgPSBzb3J0cy5sZW5ndGggLSBzb3J0U3BlYy5yYW5rO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJhbmsgKyByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMubWF4U29ydENvbHVtbnMgPSAzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgIC8qKlxuICAgICAqIEBzdW1tYXJ5IFRoZSBiZWhhdmlvcnMncyBzb3J0ZXIgZGF0YSBjb250cm9sbGVyLlxuICAgICAqIEBkZXNjIFRoaXMgZ2V0dGVyL3NldHRlciBpcyBzeW50YWN0aWMgc3VnYXIgZm9yIGNhbGxzIHRvIGBnZXRDb250cm9sbGVyYCBhbmQgYHNldENvbnRyb2xsZXJgLlxuICAgICAqIEBtZW1iZXJPZiBIeXBlcmdyaWQjXG4gICAgICovXG4gICAgZ2V0IHNvcnRlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29udHJvbGxlcignc29ydGVyJyk7XG4gICAgfSxcbiAgICBzZXQgc29ydGVyKHNvcnRlcikge1xuICAgICAgICB0aGlzLnNldENvbnRyb2xsZXIoJ3NvcnRlcicsIHNvcnRlcik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJPZiBIeXBlcmdyaWQjXG4gICAgICogQHBhcmFtIGV2ZW50XG4gICAgICovXG4gICAgdG9nZ2xlU29ydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmFib3J0RWRpdGluZygpKSB7IHJldHVybjsgfVxuXG4gICAgICAgIHZhciBiZWhhdmlvciA9IHRoaXMuYmVoYXZpb3IsXG4gICAgICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIGMgPSBldmVudC5kZXRhaWwuY29sdW1uLFxuICAgICAgICAgICAga2V5cyA9ICBldmVudC5kZXRhaWwua2V5cztcblxuICAgICAgICBiZWhhdmlvci50b2dnbGVTb3J0KGMsIGtleXMpO1xuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLnN5bmNocm9uaXplU2Nyb2xsaW5nQm91bmRhcmllcygpO1xuICAgICAgICAgICAgYmVoYXZpb3IuYXV0b3NpemVBbGxDb2x1bW5zKCk7XG4gICAgICAgICAgICBzZWxmLnJlcGFpbnQoKTtcbiAgICAgICAgfSwgMTApO1xuICAgIH1cblxufTtcbiJdfQ==
