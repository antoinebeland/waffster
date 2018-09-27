/*! budgetviz v0.5.0 | (c) Antoine Béland | GNU GPLv3 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-array'), require('d3-collection'), require('d3-selection'), require('d3-transition'), require('d3-shape'), require('d3-ease'), require('d3-scale')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-array', 'd3-collection', 'd3-selection', 'd3-transition', 'd3-shape', 'd3-ease', 'd3-scale'], factory) :
  (factory((global.budgetviz = {}),global.d3,global.d3,global.d3,global.d3,global.d3,global.d3,global.d3));
}(this, (function (exports,d3Array,d3Collection,d3,d3Transition,d3Shape,d3Ease,d3Scale) { 'use strict';

  var d3Array__default = 'default' in d3Array ? d3Array['default'] : d3Array;
  d3Collection = d3Collection && d3Collection.hasOwnProperty('default') ? d3Collection['default'] : d3Collection;
  var d3__default = 'default' in d3 ? d3['default'] : d3;
  d3Transition = d3Transition && d3Transition.hasOwnProperty('default') ? d3Transition['default'] : d3Transition;
  d3Shape = d3Shape && d3Shape.hasOwnProperty('default') ? d3Shape['default'] : d3Shape;
  d3Ease = d3Ease && d3Ease.hasOwnProperty('default') ? d3Ease['default'] : d3Ease;
  d3Scale = d3Scale && d3Scale.hasOwnProperty('default') ? d3Scale['default'] : d3Scale;

  (function (PolygonsGroupOrientation) {
      PolygonsGroupOrientation["HORIZONTAL"] = "horizontal";
      PolygonsGroupOrientation["VERTICAL"] = "vertical";
  })(exports.Orientation || (exports.Orientation = {}));
  function isPolygonsGroupConfig(config) {
      return config !== undefined &&
          config.maxCountPerLine !== undefined && !isNaN(config.maxCountPerLine) && config.maxCountPerLine > 0 &&
          (config.orientation === undefined || Object.values(exports.Orientation).includes(config.orientation)) &&
          config.sideLength !== undefined && !isNaN(config.sideLength) && config.sideLength > 0 &&
          (config.startingPosition === undefined ||
              config.startingPosition >= 0 && config.startingPosition < config.maxCountPerLine);
  }

  var Config = (function () {
      function Config() {
      }
      Config.AVERAGE_CHAR_SIZE = 7.5;
      Config.BUDGET_ELEMENTS_ORIENTATION = exports.Orientation.HORIZONTAL;
      Config.BUDGET_SUB_ELEMENTS_SPACING = 3;
      Config.GAUGE_CONFIG = {
          barWidth: 12.5,
          height: 55,
          interval: [-26000000, 26000000],
          needleRadius: 5.5,
          width: 110,
      };
      Config.IS_USING_DISTINCT_COLORS = false;
      Config.LEVEL_CHANGE_DELAY = 1000;
      Config.MIN_AMOUNT = 50000;
      Config.MAX_COUNT_PER_LINE = 20;
      Config.SIDE_LENGTH = 8;
      Config.TRANSITION_DURATION = 350;
      Config.DEFAULT_POLYGONS_GROUP_CONFIG = {
          maxCountPerLine: Config.MAX_COUNT_PER_LINE,
          orientation: Config.BUDGET_ELEMENTS_ORIENTATION,
          sideLength: Config.SIDE_LENGTH
      };
      return Config;
  }());

  (function (BudgetElementType) {
      BudgetElementType["DEFICIT"] = "deficit";
      BudgetElementType["INCOME"] = "income";
      BudgetElementType["SPENDING"] = "spending";
  })(exports.BudgetElementType || (exports.BudgetElementType = {}));
  function isFeedbackMessage(feedbackMessage) {
      return feedbackMessage && feedbackMessage.interval !== undefined && feedbackMessage.interval.length === 2 &&
          !isNaN(feedbackMessage.interval[0]) && !isNaN(feedbackMessage.interval[1]) &&
          feedbackMessage.interval[0] <= feedbackMessage.interval[1] && feedbackMessage.message !== undefined;
  }
  function isBudgetElementConfig(config) {
      return config && config.name !== undefined && config.description !== undefined && config.type !== undefined &&
          !isNaN(config.minAmount) && config.minAmount > 0 && (config.feedbackMessages === undefined ||
          config.feedbackMessages !== undefined && config.feedbackMessages.every(function (f) { return isFeedbackMessage(f); }));
  }

  function isBudgetAdjustment(adjustment) {
      return !isNaN(adjustment.amount) && adjustment.name && adjustment.type && adjustment.type &&
          Object.values(exports.BudgetElementType).includes(adjustment.type);
  }
  function isBudgetElement(budgetElement) {
      var isValid = false;
      if (budgetElement.children && budgetElement.children.length > 0) {
          isValid = budgetElement.children.every(function (c) { return isBudgetElement(c); });
      }
      else if (budgetElement.amount && !isNaN(budgetElement.amount)) {
          isValid = true;
      }
      return isValid && budgetElement.name;
  }
  function isBudgetConfig(budgetConfig) {
      return !isNaN(budgetConfig.year) &&
          budgetConfig.adjustments === undefined ||
          (budgetConfig.adjustments.length >= 0 && budgetConfig.adjustments.every(function (a) { return isBudgetAdjustment(a); })) &&
              budgetConfig.incomes.length > 0 && budgetConfig.incomes.every(function (s) { return isBudgetElement(s); }) &&
              budgetConfig.spendings.length > 0 && budgetConfig.spendings.every(function (s) { return isBudgetElement(s); });
  }

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  /* global Reflect, Promise */

  var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return extendStatics(d, b);
  };

  function __extends(d, b) {
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

  var BoundingBox = (function () {
      function BoundingBox(position, width, height) {
          if (position === void 0) { position = { x: 0, y: 0 }; }
          if (width === void 0) { width = 0; }
          if (height === void 0) { height = 0; }
          if (width < 0) {
              throw new RangeError('Invalid width specified.');
          }
          if (height < 0) {
              throw new RangeError('Invalid height specified.');
          }
          this.position = position;
          this.width = width;
          this.height = height;
      }
      Object.defineProperty(BoundingBox.prototype, "x", {
          get: function () {
              return this.position.x;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(BoundingBox.prototype, "y", {
          get: function () {
              return this.position.y;
          },
          enumerable: true,
          configurable: true
      });
      BoundingBox.prototype.isInto = function (point) {
          return this.position.x <= point.x && this.position.x + this.width >= point.x &&
              this.position.y <= point.y && this.position.y + this.height >= point.y;
      };
      BoundingBox.prototype.toString = function () {
          return "x: " + this.position.x + " y: " + this.position.y + " width: " + this.width + " height: " + this.height;
      };
      return BoundingBox;
  }());

  var AbstractPolygonsGroup = (function () {
      function AbstractPolygonsGroup(config) {
          this._boundary = [];
          this._selectionCount = 0;
          this.config = config;
          this._boundary = [];
          this._boundingBox = new BoundingBox();
          this._translation = { x: 0, y: 0 };
          this.id = ++AbstractPolygonsGroup._currentId;
      }
      Object.defineProperty(AbstractPolygonsGroup.prototype, "boundary", {
          get: function () {
              return this._boundary;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(AbstractPolygonsGroup.prototype, "boundingBox", {
          get: function () {
              return this._boundingBox;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(AbstractPolygonsGroup.prototype, "config", {
          get: function () {
              return this.getBaseConfig();
          },
          set: function (config) {
              this.setBaseConfig(config);
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(AbstractPolygonsGroup.prototype, "selectionCount", {
          get: function () {
              return this._selectionCount;
          },
          set: function (count) {
              if (count < 0 || count > this.count) {
                  throw new TypeError('The specified count is invalid');
              }
              if (this._selectionCount === count) {
                  return;
              }
              this._selectionCount = count;
              var polygons = this.polygons;
              for (var max = this.polygons.length - 1, i = max; i >= 0; --i) {
                  polygons[i].isSelected = max - i < count;
              }
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(AbstractPolygonsGroup.prototype, "translation", {
          get: function () {
              return this._translation;
          },
          enumerable: true,
          configurable: true
      });
      AbstractPolygonsGroup.prototype.translate = function (offset) {
          if (this._orientation === exports.Orientation.HORIZONTAL) {
              this._translation.x = 0;
              this._translation.y = offset;
          }
          else {
              this._translation.x = offset;
              this._translation.y = 0;
          }
      };
      AbstractPolygonsGroup.prototype.getBaseConfig = function () {
          return {
              maxCountPerLine: this._maxCountPerLine,
              orientation: this._orientation,
              sideLength: this._sideLength,
              startingPosition: this._startingPosition
          };
      };
      AbstractPolygonsGroup.prototype.setBaseConfig = function (config) {
          if (!isPolygonsGroupConfig(config)) {
              throw new TypeError('Invalid configuration specified.');
          }
          this._maxCountPerLine = config.maxCountPerLine;
          this._orientation = config.orientation || exports.Orientation.HORIZONTAL;
          this._sideLength = config.sideLength;
          this._startingPosition = config.startingPosition || 0;
      };
      AbstractPolygonsGroup.prototype.updateBoundary = function () {
          var boundingBox = this.getBoundingBox({ x: 0, y: 0 }, false);
          var count = this.count + this._startingPosition || 1;
          var padding = 0;
          var hasMoreThanSingleLine = Math.ceil(count / this._maxCountPerLine) > 1;
          this._boundary = [];
          if (hasMoreThanSingleLine) {
              if (this._orientation === exports.Orientation.HORIZONTAL) {
                  this._boundary.push({
                      x: boundingBox.x + this._startingPosition * this._sideLength - padding,
                      y: boundingBox.y - padding
                  });
              }
              else {
                  this._boundary.push({
                      x: boundingBox.x - padding,
                      y: boundingBox.y + this._startingPosition * this._sideLength - padding
                  });
              }
          }
          else {
              this._boundary.push({
                  x: boundingBox.x - padding,
                  y: boundingBox.y - padding
              });
          }
          this._boundary.push({
              x: boundingBox.x + boundingBox.width + padding,
              y: boundingBox.y - padding
          });
          if (count % this._maxCountPerLine !== 0 && hasMoreThanSingleLine) {
              if (this._orientation === exports.Orientation.HORIZONTAL) {
                  this._boundary.push({
                      x: boundingBox.x + boundingBox.width + padding,
                      y: boundingBox.y + boundingBox.height - this._sideLength + padding
                  });
                  var width = (count % this._maxCountPerLine) * this._sideLength;
                  this._boundary.push({
                      x: boundingBox.x + width + padding,
                      y: boundingBox.y + boundingBox.height - this._sideLength + padding
                  });
                  this._boundary.push({
                      x: boundingBox.x + width + padding,
                      y: boundingBox.y + boundingBox.height + padding
                  });
              }
              else {
                  var height = (count % this._maxCountPerLine) * this._sideLength;
                  this._boundary.push({
                      x: boundingBox.x + boundingBox.width + padding,
                      y: boundingBox.y + height + padding
                  });
                  this._boundary.push({
                      x: boundingBox.x + boundingBox.width - this._sideLength + padding,
                      y: boundingBox.y + height + padding
                  });
                  this._boundary.push({
                      x: boundingBox.x + boundingBox.width - this._sideLength + padding,
                      y: boundingBox.y + boundingBox.height + padding
                  });
              }
          }
          else {
              this._boundary.push({
                  x: boundingBox.x + boundingBox.width + padding,
                  y: boundingBox.y + boundingBox.height + padding
              });
          }
          this._boundary.push({
              x: boundingBox.x - padding,
              y: boundingBox.y + boundingBox.height + padding
          });
          if (this._startingPosition !== 0 && hasMoreThanSingleLine) {
              if (this._orientation === exports.Orientation.HORIZONTAL) {
                  this._boundary.push({
                      x: boundingBox.x - padding,
                      y: boundingBox.y + this._sideLength - padding
                  });
                  this._boundary.push({
                      x: boundingBox.x + this._startingPosition * this._sideLength - padding,
                      y: boundingBox.y + this._sideLength - padding
                  });
              }
              else {
                  this._boundary.push({
                      x: boundingBox.x + this._sideLength - padding,
                      y: boundingBox.y - padding
                  });
                  this._boundary.push({
                      x: boundingBox.x + this._sideLength - padding,
                      y: boundingBox.y + this._startingPosition * this._sideLength - padding
                  });
              }
          }
      };
      AbstractPolygonsGroup.prototype.getBoundingBox = function (position, isIncludedTemporaryCount) {
          if (isIncludedTemporaryCount === void 0) { isIncludedTemporaryCount = true; }
          var count = this.count;
          if (isIncludedTemporaryCount && this.temporaryCount > 0) {
              count += this.temporaryCount;
          }
          var countPerLine = this._maxCountPerLine;
          if (this.count > 0 && (this._startingPosition + count) / this._maxCountPerLine <= 1) {
              countPerLine = count;
              var offset = this._startingPosition * this._sideLength;
              if (this._orientation === exports.Orientation.HORIZONTAL) {
                  position.x += offset;
              }
              else {
                  position.y += offset;
              }
          }
          var lineLength = (count > 0) ? countPerLine * this._sideLength : this._sideLength;
          var columnLength = (count > 0)
              ? Math.ceil((this._startingPosition + count) / this._maxCountPerLine) * this._sideLength : this._sideLength;
          if (this._orientation === exports.Orientation.HORIZONTAL) {
              return new BoundingBox(position, lineLength, columnLength);
          }
          return new BoundingBox(position, columnLength, lineLength);
      };
      AbstractPolygonsGroup._currentId = 0;
      return AbstractPolygonsGroup;
  }());

  var PolygonsSuperGroupState;
  (function (PolygonsSuperGroupState) {
      PolygonsSuperGroupState[PolygonsSuperGroupState["COLLAPSED"] = 0] = "COLLAPSED";
      PolygonsSuperGroupState[PolygonsSuperGroupState["EXPANDED"] = 1] = "EXPANDED";
  })(PolygonsSuperGroupState || (PolygonsSuperGroupState = {}));
  var PolygonsSuperGroup = (function (_super) {
      __extends(PolygonsSuperGroup, _super);
      function PolygonsSuperGroup(config, spacing) {
          var _this = _super.call(this, config) || this;
          _this._children = [];
          _this._isMutable = true;
          _this._spacing = spacing;
          _this._state = PolygonsSuperGroupState.COLLAPSED;
          return _this;
      }
      Object.defineProperty(PolygonsSuperGroup.prototype, "count", {
          get: function () {
              return this._children.reduce(function (total, child) { return total + child.count; }, 0);
          },
          set: function (count) {
              if (this.count === count) {
                  return;
              }
              if (!this._isMutable) {
                  throw new Error('the group cannot be modified.');
              }
              var invariableCount = this.invariableCount;
              count -= invariableCount;
              if (count < 0) {
                  throw new RangeError('Invalid count specified. Be sure to specify a number above the invariable count.');
              }
              if (this.temporaryCount !== 0) {
                  throw new Error('You should not have temporary element before to set a new count.');
              }
              var diffCount = 0;
              var children = this.children.filter(function (c) { return c.isMutable; });
              var currentCount = this.count - invariableCount;
              children.forEach(function (c) {
                  var ratio;
                  if (currentCount === 0) {
                      ratio = 1 / children.length;
                  }
                  else {
                      ratio = c.count / currentCount;
                  }
                  var countToApply = Math.round(ratio * count);
                  diffCount += Math.abs(c.count - countToApply);
                  c.count = countToApply;
              });
              var delta = count - currentCount;
              if (children.length > 0 && Math.abs(delta) !== diffCount) {
                  var adjustment_1 = (delta > 0 ? 1 : -1) * (Math.abs(delta) - diffCount);
                  children.some(function (c) {
                      var countToApply = c.count + adjustment_1;
                      if (countToApply < 0) {
                          countToApply = 0;
                      }
                      if (adjustment_1 < 0) {
                          adjustment_1 += c.count - countToApply;
                      }
                      c.count = countToApply;
                      return adjustment_1 >= 0;
                  });
              }
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(PolygonsSuperGroup.prototype, "isMutable", {
          get: function () {
              return this._isMutable;
          },
          set: function (isMutable) {
              this._isMutable = isMutable;
              this.children.forEach(function (c) { return c.isMutable = isMutable; });
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(PolygonsSuperGroup.prototype, "invariableCount", {
          get: function () {
              return this._children.reduce(function (total, child) { return total + child.invariableCount; }, 0);
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(PolygonsSuperGroup.prototype, "polygons", {
          get: function () {
              return [].concat.apply([], this.children.map(function (c) { return c.polygons; }));
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(PolygonsSuperGroup.prototype, "temporaryCount", {
          get: function () {
              return this._children.reduce(function (total, child) { return total + child.temporaryCount; }, 0);
          },
          set: function (count) {
              var temporaryCount = this.temporaryCount;
              if (this.temporaryCount === count) {
                  return;
              }
              var children = this.children;
              if (children.length <= 0) {
                  return;
              }
              count = Math.max(!this.isMutable ? -this.count : -this.count + this.invariableCount, count);
              if (count > 0) {
                  if (this.count > 0) {
                      children[children.length - 1].temporaryCount = count;
                  }
                  else {
                      children[0].temporaryCount = count;
                  }
              }
              else {
                  if (this.temporaryCount > 0) {
                      children.forEach(function (c) { return c.temporaryCount = 0; });
                  }
                  var remainingCount = count;
                  for (var i = children.length - 1; i >= 0; --i) {
                      var child = children[i];
                      if (Math.abs(remainingCount) - child.count >= 0) {
                          child.temporaryCount = -child.count;
                          remainingCount += child.count;
                      }
                      else {
                          child.temporaryCount = remainingCount;
                          remainingCount = 0;
                      }
                  }
              }
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(PolygonsSuperGroup.prototype, "children", {
          get: function () {
              return this._children.sort(function (a, b) {
                  var compare = d3Array.descending(a.count, b.count);
                  if (compare === 0) {
                      compare = d3Array.ascending(a.id, b.id);
                  }
                  return compare;
              });
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(PolygonsSuperGroup.prototype, "spacing", {
          get: function () {
              return this._spacing;
          },
          set: function (spacing) {
              this._spacing = spacing;
          },
          enumerable: true,
          configurable: true
      });
      PolygonsSuperGroup.prototype.reshape = function (startingPosition) {
          if (startingPosition === void 0) { startingPosition = 0; }
          this._startingPosition = startingPosition;
          this.update();
      };
      PolygonsSuperGroup.prototype.addGroup = function (group) {
          this._children.push(group);
      };
      PolygonsSuperGroup.prototype.removeGroup = function (group) {
          this._children.splice(this._children.findIndex(function (c) { return c === group; }), 1);
      };
      PolygonsSuperGroup.prototype.collapse = function () {
          this._state = PolygonsSuperGroupState.COLLAPSED;
      };
      PolygonsSuperGroup.prototype.expand = function () {
          this._state = PolygonsSuperGroupState.EXPANDED;
      };
      PolygonsSuperGroup.prototype.update = function () {
          var _this = this;
          var children = this.children;
          switch (this._state) {
              case PolygonsSuperGroupState.COLLAPSED: {
                  var count_1 = this._startingPosition;
                  var cumulative_1 = 0;
                  children.forEach(function (c, i) {
                      var adjustment = 0;
                      if (c.count > 0) {
                          adjustment = (count_1 % _this._maxCountPerLine === 0 || i === 0) ? 0 : _this._sideLength;
                          c.translate(cumulative_1 - adjustment);
                          c.reshape(count_1 % _this._maxCountPerLine);
                          count_1 += c.count;
                          if (_this._orientation === exports.Orientation.HORIZONTAL) {
                              cumulative_1 += c.boundingBox.height - adjustment;
                          }
                          else {
                              cumulative_1 += c.boundingBox.width - adjustment;
                          }
                      }
                      else {
                          c.translate(0);
                          c.reshape(0);
                      }
                  });
                  break;
              }
              case PolygonsSuperGroupState.EXPANDED: {
                  this._startingPosition = 0;
                  var cumulative_2 = 0;
                  children.forEach(function (c) {
                      c.translate(cumulative_2);
                      c.reshape(0);
                      if (_this._orientation === exports.Orientation.HORIZONTAL) {
                          cumulative_2 += c.boundingBox.height + _this._spacing;
                      }
                      else {
                          cumulative_2 += c.boundingBox.width + _this._spacing;
                      }
                  });
              }
          }
          this.updateBoundingBox();
      };
      PolygonsSuperGroup.prototype.updateBoundingBox = function () {
          var _this = this;
          var count = this.count + Math.max(0, this.temporaryCount);
          var maximums = {
              height: this._sideLength,
              width: this._sideLength
          };
          if (count > 0) {
              this._children
                  .filter(function (c) { return _this._state === PolygonsSuperGroupState.EXPANDED || c.count > 0 || c.temporaryCount > 0; })
                  .forEach(function (c) {
                  var height = c.translation.y + c.boundingBox.y + c.boundingBox.height;
                  var width = c.translation.x + c.boundingBox.x + c.boundingBox.width;
                  if (maximums.height < height) {
                      maximums.height = height;
                  }
                  if (maximums.width < width) {
                      maximums.width = width;
                  }
              });
          }
          this._boundingBox.height = maximums.height;
          this._boundingBox.width = maximums.width;
          this.updateBoundary();
      };
      return PolygonsSuperGroup;
  }(AbstractPolygonsGroup));

  var Formatter = (function () {
      function Formatter() {
      }
      Formatter.formatAmount = function (amount) {
          var result = amount / Math.pow(10, 6);
          if (Math.abs(result) >= 1) {
              return result.toFixed(2).replace('.', ',') + " G$";
          }
          result = amount / Math.pow(10, 3);
          return result.toFixed(0).replace('.', ',') + " M$";
      };
      Formatter.formatId = function (name, spaceCharacter) {
          if (spaceCharacter === void 0) { spaceCharacter = '-'; }
          return name.trim().toLowerCase().replace(/[^a-zA-Z ]/g, '').replace(/\s/g, spaceCharacter);
      };
      return Formatter;
  }());

  var BudgetElement = (function () {
      function BudgetElement(config) {
          this._activeLevel = 0;
          this._level = 0;
          if (!isBudgetElementConfig(config)) {
              throw new TypeError('Invalid configuration specified.');
          }
          this.id = Formatter.formatId(config.name);
          this.name = config.name;
          this.description = config.description;
          this.type = config.type;
          this._minAmount = config.minAmount;
          this._feedbackMessages = config.feedbackMessages;
      }
      Object.defineProperty(BudgetElement.prototype, "amount", {
          get: function () {
              return this.polygonsGroup.count * this._minAmount;
          },
          set: function (amount) {
              if (!this.isMutable) {
                  throw new Error('Impossible to change the amount associated with the element.');
              }
              if (amount < 0) {
                  throw new TypeError('Invalid amount specified.');
              }
              this.polygonsGroup.count = Math.ceil(amount / this._minAmount);
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(BudgetElement.prototype, "feedbackMessage", {
          get: function () {
              var initialAmount = this.initialAmount;
              if (initialAmount === 0) {
                  return '';
              }
              var percent = Math.round(this.amount / initialAmount * 100);
              var feedback = this._feedbackMessages.find(function (f) { return f.interval[0] <= percent && f.interval[1] >= percent; });
              var message = feedback ? feedback.message : '';
              if (!feedback && this.parent !== undefined) {
                  message = this.parent.feedbackMessage;
              }
              return message;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(BudgetElement.prototype, "isActive", {
          get: function () {
              return this._level === this.activeLevel;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(BudgetElement.prototype, "isMutable", {
          get: function () {
              return this.polygonsGroup.isMutable;
          },
          set: function (isMutable) {
              this.polygonsGroup.isMutable = isMutable;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(BudgetElement.prototype, "root", {
          get: function () {
              var element = this;
              while (element.parent !== undefined) {
                  element = element.parent;
              }
              return element;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(BudgetElement.prototype, "selectedAmount", {
          get: function () {
              return this.polygonsGroup.selectionCount * this._minAmount;
          },
          set: function (selectedAmount) {
              if (selectedAmount < 0) {
                  selectedAmount = 0;
              }
              if (this.selectedAmount === selectedAmount) {
                  return;
              }
              selectedAmount = Math.min(selectedAmount, this.amount);
              this.polygonsGroup.selectionCount = Math.ceil(selectedAmount / this._minAmount);
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(BudgetElement.prototype, "temporaryAmount", {
          get: function () {
              return this.polygonsGroup.temporaryCount * this._minAmount;
          },
          set: function (temporaryAmount) {
              this.polygonsGroup.temporaryCount = Math.ceil(temporaryAmount / this._minAmount);
          },
          enumerable: true,
          configurable: true
      });
      return BudgetElement;
  }());

  var BudgetElementGroup = (function (_super) {
      __extends(BudgetElementGroup, _super);
      function BudgetElementGroup(config, polygonsGroupConfig) {
          var _this = _super.call(this, config) || this;
          _this._children = [];
          _this._group = new PolygonsSuperGroup(polygonsGroupConfig, Config.BUDGET_SUB_ELEMENTS_SPACING);
          _this._hasFocus = false;
          _this.isMutable = config.isMutable;
          return _this;
      }
      Object.defineProperty(BudgetElementGroup.prototype, "activeLevel", {
          get: function () {
              return Math.min(this._level + 1, this._activeLevel);
          },
          set: function (level) {
              if (level < 0) {
                  throw new RangeError('Invalid level specified.');
              }
              if (this._activeLevel === level) {
                  return;
              }
              this._activeLevel = level;
              this._hasFocus = false;
              this._group.selectionCount = 0;
              this._children.forEach(function (c) { return c.activeLevel = level; });
              if (this.level + 1 <= this.activeLevel) {
                  if (this.level > 0 && this.activeLevel > 1) {
                      this.root.polygonsGroup.spacing = 3 * Config.BUDGET_SUB_ELEMENTS_SPACING;
                  }
                  else {
                      this.polygonsGroup.spacing = Config.BUDGET_SUB_ELEMENTS_SPACING;
                  }
                  this._group.expand();
              }
              else {
                  this._group.collapse();
              }
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(BudgetElementGroup.prototype, "hasFocus", {
          get: function () {
              return this._hasFocus;
          },
          set: function (hasFocus) {
              this._hasFocus = hasFocus;
              this.selectedAmount = 0;
              this.children.forEach(function (c) { return c.hasFocus = hasFocus; });
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(BudgetElementGroup.prototype, "initialAmount", {
          get: function () {
              return this._children.reduce(function (total, child) { return total + child.initialAmount; }, 0);
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(BudgetElementGroup.prototype, "level", {
          get: function () {
              return this._level;
          },
          set: function (level) {
              if (level < 0) {
                  throw new RangeError('Invalid level specified.');
              }
              this._level = level;
              this._children.forEach(function (c) { return c.level = level + 1; });
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(BudgetElementGroup.prototype, "polygonsGroup", {
          get: function () {
              return this._group;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(BudgetElementGroup.prototype, "svgElement", {
          get: function () {
              return this._svgElement;
          },
          set: function (svgElement) {
              if (!svgElement) {
                  throw ReferenceError('The specified element is undefined.');
              }
              this._svgElement = svgElement;
              var levelGroup = svgElement.append('g')
                  .attr('class', 'level-group');
              levelGroup.append('rect')
                  .attr('x', 0)
                  .attr('y', 0)
                  .attr('width', 0)
                  .attr('height', 0);
              levelGroup.append('line')
                  .attr('x1', 0)
                  .attr('y1', 0)
                  .attr('x2', 0)
                  .attr('y2', 0);
              this.children.forEach(function (c) {
                  c.svgElement = svgElement.append('g');
              });
              this._svgElement.append('polygon')
                  .attr('class', "boundary boundary" + this.level);
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(BudgetElementGroup.prototype, "children", {
          get: function () {
              return this._children.sort(function (a, b) { return d3Array.descending(a.amount, b.amount); });
          },
          enumerable: true,
          configurable: true
      });
      BudgetElementGroup.prototype.accept = function (visitor) {
          visitor.visitBudgetElementGroup(this);
      };
      BudgetElementGroup.prototype.reset = function () {
          if (!this.isMutable) {
              return;
          }
          this._children.forEach(function (c) { return c.reset(); });
      };
      BudgetElementGroup.prototype.addChild = function (element) {
          element.activeLevel = this._activeLevel;
          element.level = this._level + 1;
          element.parent = this;
          if (!this.isMutable) {
              element.isMutable = false;
          }
          this._children.push(element);
          this._group.addGroup(element.polygonsGroup);
      };
      BudgetElementGroup.prototype.removeChild = function (element) {
          this._children.splice(this._children.findIndex(function (c) { return c === element; }), 1);
          element.activeLevel = 0;
          element.level = 0;
          element.parent = undefined;
      };
      return BudgetElementGroup;
  }(BudgetElement));

  var Square = (function () {
      function Square(position, sideLength) {
          if (sideLength < 0) {
              throw new RangeError('The specified side length is invalid.');
          }
          this._id = Square._currentId++;
          this._position = position;
          this._sideLength = sideLength;
          this._boundingBox = new BoundingBox(this._position, this._sideLength, this._sideLength);
          this.update();
      }
      Object.defineProperty(Square.prototype, "boundingBox", {
          get: function () {
              return this._boundingBox;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Square.prototype, "id", {
          get: function () {
              return this._id;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Square.prototype, "points", {
          get: function () {
              return this._points;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Square.prototype, "position", {
          get: function () {
              return this._position;
          },
          set: function (position) {
              this._position = position;
              this._boundingBox.position.x = position.x;
              this._boundingBox.position.y = position.y;
              this.update();
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Square.prototype, "sideLength", {
          get: function () {
              return this._sideLength;
          },
          set: function (sideLength) {
              if (sideLength < 0) {
                  throw new RangeError('The specified side length is invalid.');
              }
              this._sideLength = sideLength;
              this._boundingBox.height = sideLength;
              this._boundingBox.width = sideLength;
              this.update();
          },
          enumerable: true,
          configurable: true
      });
      Square.prototype.update = function () {
          var _this = this;
          var center = {
              x: this._position.x + this._sideLength / 2,
              y: this._position.y + this._sideLength / 2
          };
          this._points = d3Array.range(4).map(function (d) {
              var i = (d < 2) ? d % 2 : (d + 1) % 2;
              var j = Math.floor(d / 2);
              return {
                  x: center.x - ((i === 0) ? 1 : -1) * _this._sideLength / 2,
                  y: center.y - ((j === 0) ? 1 : -1) * _this._sideLength / 2
              };
          });
      };
      Square._currentId = 0;
      return Square;
  }());

  var SquaresGroup = (function (_super) {
      __extends(SquaresGroup, _super);
      function SquaresGroup(count, config) {
          var _this = this;
          if (count < 0) {
              throw new RangeError('Invalid count specified.');
          }
          _this = _super.call(this, config) || this;
          _this.isMutable = true;
          _this._count = count;
          _this._position = { x: 0, y: 0 };
          _this._squares = d3Array.range(_this._startingPosition, _this._count + _this._startingPosition)
              .map(function (i) { return new Square(_this.getSquarePosition(i), _this._sideLength); });
          _this._temporaryCount = 0;
          _this.updateBoundingBox();
          return _this;
      }
      Object.defineProperty(SquaresGroup.prototype, "config", {
          get: function () {
              return _super.prototype.getBaseConfig.call(this);
          },
          set: function (config) {
              var _this = this;
              _super.prototype.setBaseConfig.call(this, config);
              if (this._squares) {
                  this._squares.forEach(function (square, i) {
                      square.position = _this.getSquarePosition(i + _this._startingPosition);
                      square.sideLength = _this._sideLength;
                  });
                  this.updateBoundingBox();
              }
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(SquaresGroup.prototype, "count", {
          get: function () {
              return this._count;
          },
          set: function (count) {
              if (this._count === count) {
                  return;
              }
              if (!this.isMutable) {
                  throw new Error('The group cannot be modified.');
              }
              if (count < 0) {
                  throw new RangeError("Invalid count specified (" + count + ").");
              }
              if (this._temporaryCount !== 0) {
                  throw new Error('You should not have temporary element before to set a new count.');
              }
              this.updateCount(this._count, count);
              this._count = count;
              this.updateBoundingBox();
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(SquaresGroup.prototype, "invariableCount", {
          get: function () {
              return !this.isMutable ? this._count : 0;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(SquaresGroup.prototype, "polygons", {
          get: function () {
              return this._squares;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(SquaresGroup.prototype, "temporaryCount", {
          get: function () {
              return this._temporaryCount;
          },
          set: function (count) {
              var _this = this;
              if (this._temporaryCount === count) {
                  return;
              }
              count = Math.max(-this._count, count);
              if (count >= 0) {
                  if (this._temporaryCount <= 0) {
                      this._temporaryCount = 0;
                      this._squares.forEach(function (s) { return s.isTemporary = false; });
                  }
                  this.updateCount(this._count + this._temporaryCount, this._count + count, true);
              }
              else {
                  if (this._temporaryCount > 0) {
                      this.updateCount(this._count + this._temporaryCount, this._count, true);
                  }
                  this._squares.forEach(function (s, i) { return s.isTemporary = i >= _this._count + count; });
              }
              this._temporaryCount = count;
              this.updateBoundingBox();
          },
          enumerable: true,
          configurable: true
      });
      SquaresGroup.prototype.reshape = function (startingPosition) {
          var _this = this;
          if (startingPosition === void 0) { startingPosition = 0; }
          if (this._startingPosition === startingPosition) {
              return;
          }
          if (startingPosition < 0 || startingPosition >= this._maxCountPerLine) {
              throw new RangeError('Invalid starting position specified.');
          }
          var delta = this._startingPosition - startingPosition;
          var count = Math.min(Math.abs(delta), this._count);
          if (delta > 0) {
              var othersSquares = this._squares.slice(0, this._squares.length - count);
              var squaresToModify = this._squares.slice(this._squares.length - count);
              squaresToModify.forEach(function (square, i) {
                  square.position = _this.getSquarePosition(i + startingPosition);
              });
              this._squares = squaresToModify.concat(othersSquares);
          }
          else {
              var othersSquares_1 = this._squares.slice(count);
              var squaresToModify = this._squares.slice(0, count);
              squaresToModify.forEach(function (square, i) {
                  square.position = _this.getSquarePosition(i + startingPosition + othersSquares_1.length);
              });
              this._squares = othersSquares_1.concat(squaresToModify);
          }
          this._startingPosition = startingPosition;
          this.updateBoundingBox();
      };
      SquaresGroup.prototype.getSquarePosition = function (index) {
          var currentPoint = {
              x: this._position.x,
              y: this._position.y
          };
          if (Math.floor(index / this._maxCountPerLine) > 0) {
              var lineOffset = this._sideLength * Math.floor(index / this._maxCountPerLine);
              if (this._orientation === exports.Orientation.HORIZONTAL) {
                  currentPoint.y += lineOffset;
              }
              else {
                  currentPoint.x += lineOffset;
              }
          }
          var offset = this._sideLength * (index % this._maxCountPerLine);
          if (this._orientation === exports.Orientation.HORIZONTAL) {
              currentPoint.x += offset;
          }
          else {
              currentPoint.y += offset;
          }
          return currentPoint;
      };
      SquaresGroup.prototype.updateCount = function (currentCount, newCount, isTemporary) {
          var _this = this;
          if (isTemporary === void 0) { isTemporary = false; }
          if (currentCount > newCount) {
              this._squares = this._squares.slice(0, newCount);
          }
          else {
              this._squares = this._squares.concat(d3Array.range(currentCount + this._startingPosition, newCount + this._startingPosition)
                  .map(function (i) {
                  var square = new Square(_this.getSquarePosition(i), _this._sideLength);
                  square.isTemporary = isTemporary;
                  return square;
              }));
          }
      };
      SquaresGroup.prototype.updateBoundingBox = function () {
          this._boundingBox = this.getBoundingBox({
              x: this._position.x,
              y: this._position.y
          });
          this.updateBoundary();
      };
      return SquaresGroup;
  }(AbstractPolygonsGroup));

  var SimpleBudgetElement = (function (_super) {
      __extends(SimpleBudgetElement, _super);
      function SimpleBudgetElement(config, amount, polygonsGroupConfig) {
          if (amount === void 0) { amount = 0; }
          var _this = _super.call(this, config) || this;
          _this.initialAmount = amount;
          _this._group = new SquaresGroup(Math.round(amount / _this._minAmount), polygonsGroupConfig);
          _this._hasFocus = false;
          _this.isMutable = config.isMutable;
          return _this;
      }
      Object.defineProperty(SimpleBudgetElement.prototype, "activeLevel", {
          get: function () {
              return Math.min(this._level, this._activeLevel);
          },
          set: function (level) {
              if (level < 0) {
                  throw new RangeError('Invalid level specified.');
              }
              if (this._activeLevel === level) {
                  return;
              }
              this._activeLevel = level;
              this._hasFocus = false;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(SimpleBudgetElement.prototype, "hasFocus", {
          get: function () {
              return this._hasFocus;
          },
          set: function (hasFocus) {
              this._hasFocus = hasFocus;
              this._group.selectionCount = 0;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(SimpleBudgetElement.prototype, "level", {
          get: function () {
              return this._level;
          },
          set: function (level) {
              if (level < 0) {
                  level = 0;
              }
              this._level = level;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(SimpleBudgetElement.prototype, "polygonsGroup", {
          get: function () {
              return this._group;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(SimpleBudgetElement.prototype, "svgElement", {
          get: function () {
              return this._svgElement;
          },
          set: function (svgElement) {
              if (!svgElement) {
                  throw ReferenceError('The specified element is undefined.');
              }
              this._svgElement = svgElement;
              this._svgElement.append('g')
                  .attr('class', 'squares');
              this._svgElement.append('polygon')
                  .attr('class', "boundary boundary" + this.level);
          },
          enumerable: true,
          configurable: true
      });
      SimpleBudgetElement.prototype.accept = function (visitor) {
          visitor.visitSimpleBudgetElement(this);
      };
      SimpleBudgetElement.prototype.reset = function () {
          if (!this.isMutable) {
              return;
          }
          this.amount = this.initialAmount;
      };
      return SimpleBudgetElement;
  }(BudgetElement));

  var BudgetState;
  (function (BudgetState) {
      BudgetState["BALANCED"] = "balanced";
      BudgetState["DEFICIT"] = "deficit";
      BudgetState["SURPLUS"] = "surplus";
  })(BudgetState || (BudgetState = {}));
  var Budget = (function () {
      function Budget(budgetConfig, minAmount, polygonsGroupConfig) {
          if (minAmount === void 0) { minAmount = Config.MIN_AMOUNT; }
          if (polygonsGroupConfig === void 0) { polygonsGroupConfig = Config.DEFAULT_POLYGONS_GROUP_CONFIG; }
          var _this = this;
          this.adjustments = [];
          this.incomes = [];
          this.spendings = [];
          if (!isBudgetConfig(budgetConfig)) {
              throw new TypeError('Invalid configuration specified.');
          }
          if (minAmount <= 0) {
              throw new RangeError('The min amount must be greater than 0.');
          }
          this.minAmount = minAmount;
          this.year = budgetConfig.year;
          this._polygonsGroupConfig = polygonsGroupConfig;
          this.adjustments = budgetConfig.adjustments.map(function (a) {
              a.amount = Math.round(a.amount / minAmount) * minAmount;
              return a;
          });
          var initialize = function (e, type, elements) {
              if (e.children && e.children.length > 0) {
                  var group_1 = new BudgetElementGroup(_this.getBudgetElementConfig(e, type), _this._polygonsGroupConfig);
                  e.children.forEach(function (c) { return _this.initializeBudgetElement(c, type, group_1); });
                  elements.push(group_1);
              }
              else if (_this.isAcceptableAmount(e.amount)) {
                  elements.push(new SimpleBudgetElement(_this.getBudgetElementConfig(e, type), e.amount, _this._polygonsGroupConfig));
              }
              elements.sort(function (a, b) { return d3Array.descending(a.amount, b.amount); });
          };
          budgetConfig.incomes.forEach(function (e) { return initialize(e, exports.BudgetElementType.INCOME, _this.incomes); });
          budgetConfig.spendings.forEach(function (e) { return initialize(e, exports.BudgetElementType.SPENDING, _this.spendings); });
      }
      Object.defineProperty(Budget.prototype, "elements", {
          get: function () {
              return this.incomes.concat(this.spendings)
                  .sort(function (a, b) { return d3Array.descending(a.amount, b.amount); });
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Budget.prototype, "summary", {
          get: function () {
              var incomesAmount = this.incomes.reduce(function (total, income) { return total + income.amount + income.temporaryAmount; }, 0);
              var spendingsAmount = this.spendings.reduce(function (total, spending) { return total + spending.amount + spending.temporaryAmount; }, 0);
              this.adjustments.forEach(function (a) {
                  switch (a.type) {
                      case exports.BudgetElementType.INCOME:
                          incomesAmount += a.amount;
                          break;
                      case exports.BudgetElementType.SPENDING:
                          spendingsAmount += a.amount;
                  }
              });
              var delta = incomesAmount - spendingsAmount;
              var state = BudgetState.BALANCED;
              if (delta < 0) {
                  state = BudgetState.DEFICIT;
              }
              else if (delta > 0) {
                  state = BudgetState.SURPLUS;
              }
              return {
                  delta: delta,
                  incomesAmount: incomesAmount,
                  spendingsAmount: spendingsAmount,
                  state: state
              };
          },
          enumerable: true,
          configurable: true
      });
      Budget.prototype.getElementByName = function (name) {
          function getElement(e) {
              if (e.name === name) {
                  return e;
              }
              if (e instanceof BudgetElementGroup && e.children && e.children.length !== 0) {
                  var element_1 = undefined;
                  e.children.some(function (c) {
                      element_1 = getElement(c);
                      return element_1;
                  });
                  return element_1;
              }
          }
          var element = undefined;
          this.elements.some(function (e) {
              element = getElement(e);
              return element;
          });
          return element;
      };
      Budget.prototype.getBudgetElementConfig = function (element, type) {
          return {
              description: element.description || '',
              feedbackMessages: element.feedback || [],
              isMutable: element.isMutable !== undefined ? element.isMutable : true,
              minAmount: this.minAmount,
              name: element.name,
              type: type,
          };
      };
      Budget.prototype.initializeBudgetElement = function (data, type, parent) {
          var _this = this;
          if (data.children && data.children.length > 0) {
              Budget._amountStack.push(0);
              var group_2 = new BudgetElementGroup(this.getBudgetElementConfig(data, type), this._polygonsGroupConfig);
              data.children.forEach(function (c) { return _this.initializeBudgetElement(c, type, group_2); });
              var totalAmount = Budget._amountStack[Budget._amountStack.length - 1];
              if (parent) {
                  if (this.isAcceptableAmount(group_2.amount) && group_2.children.length > 1) {
                      parent.addChild(group_2);
                  }
                  else if (this.isAcceptableAmount(totalAmount)) {
                      parent.addChild(new SimpleBudgetElement(this.getBudgetElementConfig(data, type), totalAmount, this._polygonsGroupConfig));
                  }
              }
              Budget._amountStack.pop();
              if (Budget._amountStack.length > 0) {
                  Budget._amountStack[Budget._amountStack.length - 1] += totalAmount;
              }
          }
          else if (parent && this.isAcceptableAmount(data.amount)) {
              if (Budget._amountStack.length > 0) {
                  Budget._amountStack[Budget._amountStack.length - 1] += data.amount;
              }
              parent.addChild(new SimpleBudgetElement(this.getBudgetElementConfig(data, type), data.amount, this._polygonsGroupConfig));
          }
      };
      Budget.prototype.isAcceptableAmount = function (amount) {
          return Math.round(amount / this.minAmount) > 0;
      };
      Budget._amountStack = [];
      return Budget;
  }());

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var C__Users_Antoine_Desktop_budgetviz_node_modules_d3Tip_dist = createCommonjsModule(function (module, exports) {
  (function (global, factory) {
    module.exports = factory(d3Collection, d3__default);
  }(commonjsGlobal, (function (d3Collection$$1,d3Selection) {
    /**
     * d3.tip
     * Copyright (c) 2013-2017 Justin Palmer
     *
     * Tooltips for d3.js SVG visualizations
     */
    // Public - constructs a new tooltip
    //
    // Returns a tip
    function index() {
      var direction   = d3TipDirection,
          offset      = d3TipOffset,
          html        = d3TipHTML,
          rootElement = document.body,
          node        = initNode(),
          svg         = null,
          point       = null,
          target      = null;

      function tip(vis) {
        svg = getSVGNode(vis);
        if (!svg) return
        point = svg.createSVGPoint();
        rootElement.appendChild(node);
      }

      // Public - show the tooltip on the screen
      //
      // Returns a tip
      tip.show = function() {
        var args = Array.prototype.slice.call(arguments);
        if (args[args.length - 1] instanceof SVGElement) target = args.pop();

        var content = html.apply(this, args),
            poffset = offset.apply(this, args),
            dir     = direction.apply(this, args),
            nodel   = getNodeEl(),
            i       = directions.length,
            coords,
            scrollTop  = document.documentElement.scrollTop ||
          rootElement.scrollTop,
            scrollLeft = document.documentElement.scrollLeft ||
          rootElement.scrollLeft;

        nodel.html(content)
          .style('opacity', 1).style('pointer-events', 'all');

        while (i--) nodel.classed(directions[i], false);
        coords = directionCallbacks.get(dir).apply(this);
        nodel.classed(dir, true)
          .style('top', (coords.top + poffset[0]) + scrollTop + 'px')
          .style('left', (coords.left + poffset[1]) + scrollLeft + 'px');

        return tip
      };

      // Public - hide the tooltip
      //
      // Returns a tip
      tip.hide = function() {
        var nodel = getNodeEl();
        nodel.style('opacity', 0).style('pointer-events', 'none');
        return tip
      };

      // Public: Proxy attr calls to the d3 tip container.
      // Sets or gets attribute value.
      //
      // n - name of the attribute
      // v - value of the attribute
      //
      // Returns tip or attribute value
      // eslint-disable-next-line no-unused-vars
      tip.attr = function(n, v) {
        if (arguments.length < 2 && typeof n === 'string') {
          return getNodeEl().attr(n)
        }

        var args =  Array.prototype.slice.call(arguments);
        d3Selection.selection.prototype.attr.apply(getNodeEl(), args);
        return tip
      };

      // Public: Proxy style calls to the d3 tip container.
      // Sets or gets a style value.
      //
      // n - name of the property
      // v - value of the property
      //
      // Returns tip or style property value
      // eslint-disable-next-line no-unused-vars
      tip.style = function(n, v) {
        if (arguments.length < 2 && typeof n === 'string') {
          return getNodeEl().style(n)
        }

        var args = Array.prototype.slice.call(arguments);
        d3Selection.selection.prototype.style.apply(getNodeEl(), args);
        return tip
      };

      // Public: Set or get the direction of the tooltip
      //
      // v - One of n(north), s(south), e(east), or w(west), nw(northwest),
      //     sw(southwest), ne(northeast) or se(southeast)
      //
      // Returns tip or direction
      tip.direction = function(v) {
        if (!arguments.length) return direction
        direction = v == null ? v : functor(v);

        return tip
      };

      // Public: Sets or gets the offset of the tip
      //
      // v - Array of [x, y] offset
      //
      // Returns offset or
      tip.offset = function(v) {
        if (!arguments.length) return offset
        offset = v == null ? v : functor(v);

        return tip
      };

      // Public: sets or gets the html value of the tooltip
      //
      // v - String value of the tip
      //
      // Returns html value or tip
      tip.html = function(v) {
        if (!arguments.length) return html
        html = v == null ? v : functor(v);

        return tip
      };

      // Public: sets or gets the root element anchor of the tooltip
      //
      // v - root element of the tooltip
      //
      // Returns root node of tip
      tip.rootElement = function(v) {
        if (!arguments.length) return rootElement
        rootElement = v == null ? v : functor(v);

        return tip
      };

      // Public: destroys the tooltip and removes it from the DOM
      //
      // Returns a tip
      tip.destroy = function() {
        if (node) {
          getNodeEl().remove();
          node = null;
        }
        return tip
      };

      function d3TipDirection() { return 'n' }
      function d3TipOffset() { return [0, 0] }
      function d3TipHTML() { return ' ' }

      var directionCallbacks = d3Collection$$1.map({
            n:  directionNorth,
            s:  directionSouth,
            e:  directionEast,
            w:  directionWest,
            nw: directionNorthWest,
            ne: directionNorthEast,
            sw: directionSouthWest,
            se: directionSouthEast
          }),
          directions = directionCallbacks.keys();

      function directionNorth() {
        var bbox = getScreenBBox(this);
        return {
          top:  bbox.n.y - node.offsetHeight,
          left: bbox.n.x - node.offsetWidth / 2
        }
      }

      function directionSouth() {
        var bbox = getScreenBBox(this);
        return {
          top:  bbox.s.y,
          left: bbox.s.x - node.offsetWidth / 2
        }
      }

      function directionEast() {
        var bbox = getScreenBBox(this);
        return {
          top:  bbox.e.y - node.offsetHeight / 2,
          left: bbox.e.x
        }
      }

      function directionWest() {
        var bbox = getScreenBBox(this);
        return {
          top:  bbox.w.y - node.offsetHeight / 2,
          left: bbox.w.x - node.offsetWidth
        }
      }

      function directionNorthWest() {
        var bbox = getScreenBBox(this);
        return {
          top:  bbox.nw.y - node.offsetHeight,
          left: bbox.nw.x - node.offsetWidth
        }
      }

      function directionNorthEast() {
        var bbox = getScreenBBox(this);
        return {
          top:  bbox.ne.y - node.offsetHeight,
          left: bbox.ne.x
        }
      }

      function directionSouthWest() {
        var bbox = getScreenBBox(this);
        return {
          top:  bbox.sw.y,
          left: bbox.sw.x - node.offsetWidth
        }
      }

      function directionSouthEast() {
        var bbox = getScreenBBox(this);
        return {
          top:  bbox.se.y,
          left: bbox.se.x
        }
      }

      function initNode() {
        var div = d3Selection.select(document.createElement('div'));
        div
          .style('position', 'absolute')
          .style('top', 0)
          .style('opacity', 0)
          .style('pointer-events', 'none')
          .style('box-sizing', 'border-box');

        return div.node()
      }

      function getSVGNode(element) {
        var svgNode = element.node();
        if (!svgNode) return null
        if (svgNode.tagName.toLowerCase() === 'svg') return svgNode
        return svgNode.ownerSVGElement
      }

      function getNodeEl() {
        if (node == null) {
          node = initNode();
          // re-add node to DOM
          rootElement.appendChild(node);
        }
        return d3Selection.select(node)
      }

      // Private - gets the screen coordinates of a shape
      //
      // Given a shape on the screen, will return an SVGPoint for the directions
      // n(north), s(south), e(east), w(west), ne(northeast), se(southeast),
      // nw(northwest), sw(southwest).
      //
      //    +-+-+
      //    |   |
      //    +   +
      //    |   |
      //    +-+-+
      //
      // Returns an Object {n, s, e, w, nw, sw, ne, se}
      function getScreenBBox(targetShape) {
        var targetel   = target || targetShape;

        while (targetel.getScreenCTM == null && targetel.parentNode != null) {
          targetel = targetel.parentNode;
        }

        var bbox       = {},
            matrix     = targetel.getScreenCTM(),
            tbbox      = targetel.getBBox(),
            width      = tbbox.width,
            height     = tbbox.height,
            x          = tbbox.x,
            y          = tbbox.y;

        point.x = x;
        point.y = y;
        bbox.nw = point.matrixTransform(matrix);
        point.x += width;
        bbox.ne = point.matrixTransform(matrix);
        point.y += height;
        bbox.se = point.matrixTransform(matrix);
        point.x -= width;
        bbox.sw = point.matrixTransform(matrix);
        point.y -= height / 2;
        bbox.w = point.matrixTransform(matrix);
        point.x += width;
        bbox.e = point.matrixTransform(matrix);
        point.x -= width / 2;
        point.y -= height / 2;
        bbox.n = point.matrixTransform(matrix);
        point.y += height;
        bbox.s = point.matrixTransform(matrix);

        return bbox
      }

      // Private - replace D3JS 3.X d3.functor() function
      function functor(v) {
        return typeof v === 'function' ? v : function() {
          return v
        }
      }

      return tip
    }

    return index;

  })));
  });

  var Event = (function () {
      function Event() {
          this._handlers = [];
      }
      Event.prototype.register = function (handler, context) {
          if (!context) {
              context = this;
          }
          this._handlers.push({ handler: handler, context: context });
      };
      Event.prototype.unregister = function (handler, context) {
          if (!context) {
              context = this;
          }
          this._handlers = this._handlers.filter(function (h) { return h.handler !== handler && h.context !== context; });
      };
      Event.prototype.invoke = function (data) {
          this._handlers.slice(0).forEach(function (h) { return h.handler.call(h.context, data); });
      };
      return Event;
  }());

  var AddCommand = (function () {
      function AddCommand(element, rendering, layout) {
          this._isFirstTime = true;
          if (!element.isMutable) {
              throw new Error('The specified element cannot be modified.');
          }
          this.amount = element.temporaryAmount;
          this.element = element;
          this._rendering = rendering;
          this._layout = layout;
      }
      AddCommand.prototype.execute = function () {
          this.element.temporaryAmount = 0;
          this.element.amount += this.amount;
          this.update();
      };
      AddCommand.prototype.undo = function () {
          this.element.amount -= this.amount;
          this.update();
      };
      AddCommand.prototype.update = function () {
          this.element.selectedAmount = 0;
          this._rendering.transitionDuration = 0;
          this.element.accept(this._rendering);
          this._rendering.resetTransitionDuration();
          if (this._isFirstTime) {
              this.element.selectedAmount = this.amount;
          }
          var root = this.element.root;
          if (this._isFirstTime || root !== this.element) {
              root.accept(this._rendering);
          }
          this._layout.render();
          this._isFirstTime = false;
      };
      return AddCommand;
  }());

  function isCommand(command) {
      return command !== undefined && command.execute !== undefined;
  }
  function isUndoableCommand(command) {
      return isCommand(command) && command.undo !== undefined;
  }

  var CommandInvoker = (function () {
      function CommandInvoker() {
          this.onCommandInvoked = new Event();
          this._commands = [];
          this._currentIndex = -1;
      }
      Object.defineProperty(CommandInvoker.prototype, "canUndo", {
          get: function () {
              return this._commands.length >= 1 && this._currentIndex >= 0;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(CommandInvoker.prototype, "canRedo", {
          get: function () {
              return this._commands.length >= 1 && this._currentIndex < this._commands.length - 1;
          },
          enumerable: true,
          configurable: true
      });
      CommandInvoker.prototype.undo = function () {
          if (this.canUndo) {
              this._commands[this._currentIndex--].undo();
              this.onCommandInvoked.invoke();
          }
      };
      CommandInvoker.prototype.redo = function () {
          if (this.canRedo) {
              this._commands[++this._currentIndex].execute();
              this.onCommandInvoked.invoke();
          }
      };
      CommandInvoker.prototype.invoke = function (command, isSavingCommand) {
          if (isSavingCommand === void 0) { isSavingCommand = true; }
          if (isSavingCommand && isUndoableCommand(command)) {
              this._commands = this._commands.slice(0, ++this._currentIndex);
              this._commands.push(command);
          }
          command.execute();
          this.onCommandInvoked.invoke(command);
      };
      return CommandInvoker;
  }());

  var DeleteCommand = (function () {
      function DeleteCommand(element, rendering, layout) {
          if (!element.isMutable) {
              throw new Error('The specified element cannot be modified.');
          }
          this.amount = Math.abs(element.temporaryAmount);
          this.element = element;
          this._rendering = rendering;
          this._layout = layout;
      }
      DeleteCommand.prototype.execute = function () {
          this.element.temporaryAmount = 0;
          this.element.amount -= this.amount;
          this.update();
      };
      DeleteCommand.prototype.undo = function () {
          this.element.amount += this.amount;
          this.update();
      };
      DeleteCommand.prototype.update = function () {
          this._rendering.transitionDuration = 0;
          this.element.accept(this._rendering);
          this._rendering.resetTransitionDuration();
          var root = this.element.root;
          if (this.element !== root) {
              root.accept(this._rendering);
          }
          this._layout.render();
      };
      return DeleteCommand;
  }());

  var RenderingVisitor = (function () {
      function RenderingVisitor(defaultTransitionDuration) {
          this._levelStack = [];
          this._defaultTransitionDuration = this.transitionDuration = defaultTransitionDuration;
      }
      Object.defineProperty(RenderingVisitor.prototype, "transitionDuration", {
          get: function () {
              return this._transitionDuration;
          },
          set: function (duration) {
              if (duration < 0) {
                  throw new RangeError('The transition duration must be greater or equal to 0.');
              }
              this._transitionDuration = duration;
          },
          enumerable: true,
          configurable: true
      });
      RenderingVisitor.prototype.resetTransitionDuration = function () {
          this._transitionDuration = this._defaultTransitionDuration;
      };
      RenderingVisitor.prototype.visitBudgetElementGroup = function (group) {
          var _this = this;
          if (this._levelStack.length === 0) {
              group.polygonsGroup.update();
          }
          this._levelStack.push(0);
          group.svgElement.selectAll('.empty')
              .remove();
          RenderingVisitor.updateBoundary(group);
          group.children.forEach(function (c, i) {
              c.accept(_this);
              c.svgElement.classed("group" + i, (c.level - 1 === c.activeLevel && Config.IS_USING_DISTINCT_COLORS))
                  .transition()
                  .duration(_this._transitionDuration)
                  .attr('transform', "translate(" + c.polygonsGroup.translation.x + ", " + c.polygonsGroup.translation.y + ")");
          });
          if (group.activeLevel - group.level === 1) {
              var offset = this._levelStack[this._levelStack.length - 1] >= 1 ? 14 : 7;
              var halfOffset = offset / 2;
              var levelGroup = group.svgElement.select('.level-group');
              levelGroup.select('rect')
                  .transition()
                  .duration(this._transitionDuration)
                  .attr('x', -offset)
                  .attr('y', -halfOffset)
                  .attr('height', group.polygonsGroup.boundingBox.height + offset)
                  .attr('width', offset);
              levelGroup.select('line')
                  .transition()
                  .duration(this._transitionDuration)
                  .attr('x1', -offset)
                  .attr('y1', -halfOffset)
                  .attr('x2', -offset)
                  .attr('y2', group.polygonsGroup.boundingBox.height + halfOffset);
              this._levelStack[this._levelStack.length - 1] = 1;
          }
          else {
              var levelGroup = group.svgElement.select('.level-group');
              levelGroup.select('rect')
                  .transition()
                  .duration(this._transitionDuration)
                  .attr('x', 0)
                  .attr('y', 0)
                  .attr('height', 0)
                  .attr('width', 0);
              levelGroup.select('line')
                  .transition()
                  .duration(this._transitionDuration)
                  .attr('x1', 0)
                  .attr('y1', 0)
                  .attr('x2', 0)
                  .attr('y2', 0);
          }
          if (group.isActive && group.amount === 0) {
              RenderingVisitor.createEmptyElement(group);
          }
          var count = this._levelStack.pop();
          if (this._levelStack.length >= 1) {
              this._levelStack[this._levelStack.length - 1] += count;
          }
      };
      RenderingVisitor.prototype.visitSimpleBudgetElement = function (element) {
          var polygons = element.svgElement.select('.squares').selectAll('.square')
              .data(element.polygonsGroup.polygons, function (d) { return d.id; });
          var selectedAmount = element.selectedAmount;
          RenderingVisitor.updateBoundary(element);
          polygons.enter()
              .append('polygon')
              .on('animationend', function (d) {
              d.isSelected = false;
              this.classList.remove('selected');
              if (selectedAmount > 0) {
                  selectedAmount = 0;
                  element.selectedAmount = 0;
              }
          })
              .merge(polygons)
              .attr('class', "square " + element.type)
              .classed('focused', element.hasFocus)
              .classed('selected', function (d) { return d.isSelected; })
              .classed('temporary', function (d) { return d.isTemporary; })
              .classed('added', function (d) { return d.isTemporary && element.temporaryAmount > 0; })
              .classed('removed', function (d) { return d.isTemporary && element.temporaryAmount < 0; })
              .transition()
              .duration(this._transitionDuration)
              .attr('points', function (d) { return d.points.map(function (e) { return e.x + " " + e.y; }).join(', '); });
          polygons.exit()
              .remove();
          if (element.isActive && element.amount === 0) {
              RenderingVisitor.createEmptyElement(element);
          }
      };
      RenderingVisitor.createEmptyElement = function (element) {
          var sideLength = element.polygonsGroup.config.sideLength;
          element.svgElement.append('rect')
              .attr('class', 'square empty')
              .attr('x', 0)
              .attr('y', 0)
              .attr('width', sideLength)
              .attr('height', sideLength);
      };
      RenderingVisitor.updateBoundary = function (element) {
          element.svgElement.select(".boundary" + element.level)
              .attr('points', (element.level - 1 <= element.activeLevel)
              ? element.polygonsGroup.boundary.map(function (e) { return e.x + " " + e.y; }).join(', ')
              : '');
      };
      return RenderingVisitor;
  }());

  var BudgetVisualization = (function () {
      function BudgetVisualization(budget, svgElement, layout, commandInvoker, rendering) {
          if (commandInvoker === void 0) { commandInvoker = new CommandInvoker(); }
          if (rendering === void 0) { rendering = new RenderingVisitor(Config.TRANSITION_DURATION); }
          var _this = this;
          this.onActionExecuted = new Event();
          this.onInvalidActionExecuted = new Event();
          this._isEnabled = true;
          this._isInitialized = false;
          this.budget = budget;
          this.svgElement = svgElement;
          this._layout = layout;
          this.commandInvoker = commandInvoker;
          this.rendering = rendering;
          this.tip = C__Users_Antoine_Desktop_budgetviz_node_modules_d3Tip_dist()
              .html(function (d) {
              var str = "<strong>" + d.name + " (" + Formatter.formatAmount(d.amount + d.temporaryAmount) + ")</strong>";
              str += d.description ? "<p>" + d.description + "</p>" : '';
              return str;
          });
          this.commandInvoker.onCommandInvoked.register(function (command) { return _this.onActionExecuted.invoke(command); });
      }
      Object.defineProperty(BudgetVisualization.prototype, "activeLevel", {
          set: function (activeLevel) {
              var _this = this;
              this.budget.elements.forEach(function (e) {
                  e.activeLevel = activeLevel;
                  e.accept(_this.rendering);
              });
              this._layout.render();
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(BudgetVisualization.prototype, "isEnabled", {
          get: function () {
              return this._isEnabled;
          },
          set: function (isEnabled) {
              this._isEnabled = isEnabled;
              this.svgElement.classed('disabled', !isEnabled);
              if (!isEnabled) {
                  this.activeLevel = 0;
              }
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(BudgetVisualization.prototype, "layout", {
          get: function () {
              return this._layout;
          },
          enumerable: true,
          configurable: true
      });
      BudgetVisualization.prototype.initialize = function () {
          var _this = this;
          if (this._isInitialized) {
              throw new Error('The visualization is already initialized.');
          }
          var self = this;
          var hoveredElement = undefined;
          var selectedElement = undefined;
          this.svgElement.attr('class', 'budget-visualization');
          this._layout.initialize();
          this.svgElement.call(this.tip);
          var executeCommand = function () {
              if (selectedElement !== undefined && selectedElement.temporaryAmount !== 0) {
                  if (selectedElement.isMutable) {
                      if (selectedElement.temporaryAmount > 0) {
                          _this.commandInvoker.invoke(new AddCommand(selectedElement, _this.rendering, _this._layout));
                      }
                      else {
                          _this.commandInvoker.invoke(new DeleteCommand(selectedElement, _this.rendering, _this._layout));
                      }
                  }
                  else {
                      selectedElement.temporaryAmount = 0;
                      _this.rendering.transitionDuration = 0;
                      selectedElement.accept(_this.rendering);
                      _this.rendering.resetTransitionDuration();
                      var root = selectedElement.root;
                      if (root !== selectedElement) {
                          root.accept(_this.rendering);
                      }
                      _this._layout.render();
                      _this.onInvalidActionExecuted.invoke(selectedElement);
                  }
              }
          };
          d3.select('body')
              .on('wheel', function () {
              if (_this._isEnabled && selectedElement) {
                  var delta = d3.event.deltaY / 100;
                  delta = (delta >= 0) ? Math.ceil(delta) : Math.floor(delta);
                  selectedElement.temporaryAmount += delta * _this.budget.minAmount;
                  _this.rendering.transitionDuration = 0;
                  selectedElement.root.accept(_this.rendering);
                  _this.rendering.resetTransitionDuration();
                  _this._layout.transitionDuration = 0;
                  _this._layout.render();
                  _this._layout.resetTransitionDuration();
              }
          })
              .on('keydown', function () {
              if (_this._isEnabled && selectedElement) {
                  var isValidKey = false;
                  switch (d3.event.key) {
                      case 'ArrowUp':
                          isValidKey = true;
                          selectedElement.temporaryAmount -= _this.budget.minAmount;
                          break;
                      case 'ArrowDown':
                          isValidKey = true;
                          selectedElement.temporaryAmount += _this.budget.minAmount;
                          break;
                  }
                  if (!isValidKey) {
                      return;
                  }
                  _this.rendering.transitionDuration = 0;
                  selectedElement.root.accept(_this.rendering);
                  _this.rendering.resetTransitionDuration();
                  _this._layout.transitionDuration = 0;
                  _this._layout.render();
                  _this._layout.resetTransitionDuration();
              }
          })
              .on('click', function () {
              if (_this._isEnabled && selectedElement && selectedElement.hasFocus) {
                  selectedElement.hasFocus = false;
                  selectedElement.accept(_this.rendering);
              }
              executeCommand();
              selectedElement = undefined;
          });
          var events = new ((function () {
              function class_1() {
              }
              class_1.prototype.visitBudgetElementGroup = function (group) {
                  var _this = this;
                  this.subscribe(group);
                  group.svgElement.select('.level-group')
                      .on('mouseenter', function () {
                      if (!self._isEnabled) {
                          return;
                      }
                      hoveredElement = group;
                      self.tip.direction('w')
                          .offset([0, -8])
                          .attr('class', 'd3-tip level-tip')
                          .show.call(group.svgElement.node(), group);
                  })
                      .on('mouseleave', function () {
                      if (!self._isEnabled) {
                          return;
                      }
                      hoveredElement = undefined;
                      self.tip.hide();
                  })
                      .on('click', function () {
                      if (!self._isEnabled) {
                          return;
                      }
                      d3.event.stopPropagation();
                      executeCommand();
                      self.tip.hide();
                      group.activeLevel = group.level;
                      group.root.accept(self.rendering);
                      self._layout.render();
                  });
                  group.children.forEach(function (c) { return c.accept(_this); });
              };
              class_1.prototype.visitSimpleBudgetElement = function (element) {
                  this.subscribe(element);
              };
              class_1.prototype.subscribe = function (element) {
                  if (!element.svgElement) {
                      throw new TypeError('The SVG element is undefined.');
                  }
                  function showTooltip() {
                      if (element.level > 0) {
                          self.tip.direction('e')
                              .offset([0, 8])
                              .attr('class', 'd3-tip element-tip')
                              .show.call(element.svgElement.node(), element);
                      }
                  }
                  element.svgElement.on('click', function () {
                      if (self._isEnabled && element.isActive) {
                          d3.event.stopPropagation();
                          if (selectedElement && selectedElement !== element && selectedElement.hasFocus) {
                              selectedElement.hasFocus = false;
                              selectedElement.accept(self.rendering);
                              executeCommand();
                          }
                          element.hasFocus = !element.hasFocus;
                          element.accept(self.rendering);
                          if (!element.hasFocus) {
                              executeCommand();
                              selectedElement = undefined;
                          }
                          else {
                              selectedElement = element;
                          }
                      }
                  });
                  element.svgElement.on('mouseenter', function () {
                      if (self._isEnabled && element.isActive) {
                          hoveredElement = element;
                          hoveredElement.svgElement.classed('hovered', true);
                          showTooltip();
                      }
                  });
                  element.svgElement.on('mouseover', function () {
                      if (self._isEnabled && element.isActive) {
                          hoveredElement = element;
                          hoveredElement.svgElement.classed('hovered', true);
                          showTooltip();
                      }
                  });
                  element.svgElement.on('mouseleave', function () {
                      if (self._isEnabled && element.isActive && hoveredElement) {
                          hoveredElement.svgElement.classed('hovered', false);
                          hoveredElement = undefined;
                          self.tip.hide();
                      }
                  });
                  element.svgElement.on('dblclick', function () {
                      if (self._isEnabled && element.isActive) {
                          executeCommand();
                          selectedElement = undefined;
                          element.activeLevel += 1;
                          element.root.accept(self.rendering);
                          self._layout.render();
                          hoveredElement.svgElement.classed('hovered', false);
                          hoveredElement = undefined;
                          self.tip.hide();
                      }
                  });
              };
              return class_1;
          }()));
          this.budget.elements.forEach(function (e) {
              e.accept(events);
              e.accept(_this.rendering);
          });
          this._layout.render();
          this._isInitialized = true;
      };
      BudgetVisualization.prototype.reset = function () {
          var _this = this;
          this.budget.elements.forEach(function (e) {
              e.activeLevel = 0;
              e.reset();
              e.accept(_this.rendering);
          });
          this._layout.render();
      };
      BudgetVisualization.prototype.update = function (layout, polygonsGroupConfig) {
          var _this = this;
          if (!this._isInitialized) {
              throw new Error('The visualization is not initialized. Please initialize the visualization first.');
          }
          if (polygonsGroupConfig) {
              var polygonsConfigs_1 = new ((function () {
                  function class_2() {
                  }
                  class_2.prototype.visitBudgetElementGroup = function (group) {
                      var _this = this;
                      group.polygonsGroup.config = polygonsGroupConfig;
                      group.children.forEach(function (c) { return c.accept(_this); });
                  };
                  class_2.prototype.visitSimpleBudgetElement = function (element) {
                      element.polygonsGroup.config = polygonsGroupConfig;
                  };
                  return class_2;
              }()));
              this.budget.elements.forEach(function (e) {
                  e.accept(polygonsConfigs_1);
                  e.accept(_this.rendering);
              });
          }
          this._layout = layout;
          this._layout.initialize();
          this._layout.render();
      };
      return BudgetVisualization;
  }());

  var d3SimpleGauge = createCommonjsModule(function (module, exports) {
  (function (global, factory) {
    {
      factory(exports, d3Shape, d3Ease, d3Array__default, d3Scale, d3__default, d3Transition);
    }
  })(commonjsGlobal, function (exports, _d3Shape, _d3Ease, _d3Array, _d3Scale, _d3Selection) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.SimpleGauge = undefined;

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    var _createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();

    var CONSTANTS = {
      BAR_WIDTH: 40,
      CHAR_INSET: 10,
      EASE_TYPE: _d3Ease.easeElastic,
      NEEDLE_ANIMATION_DELAY: 0,
      NEEDLE_ANIMATION_DURATION: 3000,
      NEEDLE_RADIUS: 15,
      PAD_RAD: 0.05
    };

    var percToDeg = function percToDeg(perc) {
      return perc * 360;
    };
    var degToRad = function degToRad(deg) {
      return deg * Math.PI / 180;
    };
    var percToRad = function percToRad(perc) {
      return degToRad(percToDeg(perc));
    };

    /**
     * Defines the needle used in the gauge.
     */

    var Needle = function () {
      /**
       * Initializes a new instance of the Needle class.
       *
       * @param config                      The configuration to use to initialize the needle.
       * @param config.animationDelay       The delay in ms before to start the needle animation.
       * @param config.animationDuration    The duration in ms of the needle animation.
       * @param config.color                The color to use for the needle.
       * @param config.easeType             The ease type to use for the needle animation.
       * @param config.el                   The parent element of the needle.
       * @param config.length               The length of the needle.
       * @param config.percent              The initial percentage to use.
       * @param config.radius               The radius of the needle.
       */
      function Needle(config) {
        _classCallCheck(this, Needle);

        this._animationDelay = config.animationDelay;
        this._animationDuration = config.animationDuration;
        this._color = config.color;
        this._easeType = config.easeType;
        this._el = config.el;
        this._length = config.length;
        this._percent = config.percent;
        this._radius = config.radius;
        this._initialize();
      }

      /**
       * Updates the needle position based on the percentage specified.
       *
       * @param percent      The percentage to use.
       */


      _createClass(Needle, [{
        key: 'update',
        value: function update(percent) {
          var self = this;
          this._el.transition().delay(this._animationDelay).ease(this._easeType).duration(this._animationDuration).selectAll('.needle').tween('progress', function () {
            var thisElement = this;
            var delta = percent - self._percent;
            var initialPercent = self._percent;
            return function (progressPercent) {
              self._percent = initialPercent + progressPercent * delta;
              return (0, _d3Selection.select)(thisElement).attr('d', self._getPath(self._percent));
            };
          });
        }
      }, {
        key: '_initialize',
        value: function _initialize() {
          this._el.append('circle').attr('class', 'needle-center').attr('cx', 0).attr('cy', 0).attr('r', this._radius);

          this._el.append('path').attr('class', 'needle').attr('d', this._getPath(this._percent));

          if (this._color) {
            this._el.select('.needle-center').style('fill', this._color);

            this._el.select('.needle').style('fill', this._color);
          }
        }
      }, {
        key: '_getPath',
        value: function _getPath(percent) {
          var halfPI = Math.PI / 2;
          var thetaRad = percToRad(percent / 2); // half circle

          var centerX = 0;
          var centerY = 0;

          var topX = centerX - this._length * Math.cos(thetaRad);
          var topY = centerY - this._length * Math.sin(thetaRad);

          var leftX = centerX - this._radius * Math.cos(thetaRad - halfPI);
          var leftY = centerY - this._radius * Math.sin(thetaRad - halfPI);

          var rightX = centerX - this._radius * Math.cos(thetaRad + halfPI);
          var rightY = centerY - this._radius * Math.sin(thetaRad + halfPI);

          return 'M ' + leftX + ' ' + leftY + ' L ' + topX + ' ' + topY + ' L ' + rightX + ' ' + rightY;
        }
      }]);

      return Needle;
    }();

    var SimpleGauge = exports.SimpleGauge = function () {
      /**
       * Initializes a new instance of the SimpleGauge class.
       *
       * @param config                        The configuration to use to initialize the gauge.
       * @param [config.animationDelay]       The delay in ms before to start the needle animation. By default, the value
       *                                      is 0.
       * @param [config.animationDuration]    The duration in ms of the needle animation. By default, the value is 3000.
       * @param [config.barWidth]             The bar width of the gauge. By default, the value is 40.
       * @param [config.chartInset]           The char inset to use. By default, the value is 10.
       * @param [config.easeType]             The ease type to use for the needle animation. By default, the value is
       *                                      "d3.easeElastic".
       * @param config.el                     The D3 element to use to create the gauge (must be a group or an SVG element).
       * @param config.height                 The height of the gauge.
       * @param [config.interval]             The interval (min and max values) of the gauge. By default, the interval
       *                                      ia [0, 1].
       * @param [config.needleColor]          The needle color.
       * @param [config.needleRadius]         The radius of the needle. By default, the radius is 15.
       * @param [config.percent]              The percentage to use for the needle position. By default, the value is 0.
       * @param config.sectionsCount          The number of sections in the gauge.
       * @param [config.sectionsColors]       The color to use for each section.
       * @param config.width                  The width of the gauge.
       */
      function SimpleGauge(config) {
        _classCallCheck(this, SimpleGauge);

        if (!config.el) {
          throw new Error('The element must be valid.');
        }
        if (isNaN(config.height) || config.height <= 0) {
          throw new RangeError('The height must be a positive number.');
        }
        if (isNaN(config.sectionsCount) || config.sectionsCount <= 0) {
          throw new RangeError('The sections count must be a positive number.');
        }
        if (isNaN(config.width) || config.width <= 0) {
          throw new RangeError('The width must be a positive number.');
        }
        if (config.animationDelay !== undefined && (isNaN(config.animationDelay) || config.animationDelay < 0)) {
          throw new RangeError('The transition delay must be greater or equal to 0.');
        }
        if (config.animationDuration !== undefined && (isNaN(config.animationDuration) || config.animationDuration < 0)) {
          throw new RangeError('The transition duration must be greater or equal to 0.');
        }
        if (config.barWidth !== undefined && (isNaN(config.barWidth) || config.barWidth <= 0)) {
          throw new RangeError('The bar width must be a positive number.');
        }
        if (config.chartInset !== undefined && (isNaN(config.chartInset) || config.chartInset < 0)) {
          throw new RangeError('The chart inset must be greater or equal to 0.');
        }
        if (config.needleRadius !== undefined && (isNaN(config.needleRadius) || config.needleRadius < 0)) {
          throw new RangeError('The needle radius must be greater or equal to 0.');
        }
        if (config.sectionsColors !== undefined && config.sectionsColors.length !== config.sectionsCount) {
          throw new RangeError('The sectionsColors length must match with the sectionsCount.');
        }

        this._animationDelay = config.animationDelay !== undefined ? config.animationDelay : CONSTANTS.NEEDLE_ANIMATION_DELAY;

        this._animationDuration = config.animationDuration !== undefined ? config.animationDuration : CONSTANTS.NEEDLE_ANIMATION_DURATION;

        this._chartInset = config.chartInset !== undefined ? config.chartInset : CONSTANTS.CHAR_INSET;

        this._barWidth = config.barWidth || CONSTANTS.BAR_WIDTH;
        this._easeType = config.easeType || CONSTANTS.EASE_TYPE;
        this._el = config.el;
        this._height = config.height;
        this._needleRadius = config.needleRadius !== undefined ? config.needleRadius : CONSTANTS.NEEDLE_RADIUS;
        this._sectionsCount = config.sectionsCount;
        this._width = config.width;
        this._sectionsColors = config.sectionsColors;
        this._needleColor = config.needleColor;

        this.interval = config.interval || [0, 1];
        this.percent = config.percent !== undefined ? config.percent : 0;

        this._initialize();
      }

      /**
       * Gets the interval of the gauge.
       *
       * @returns {Array}   An array of two elements that represents the min and the max values of the gauge.
       */


      _createClass(SimpleGauge, [{
        key: '_initialize',


        /**
         * Initializes the simple gauge.
         *
         * @private
         */
        value: function _initialize() {
          var _this = this;

          var sectionPercentage = 1 / this._sectionsCount / 2;
          var padRad = CONSTANTS.PAD_RAD;

          var totalPercent = 0.75; // Start at 270deg
          var radius = Math.min(this._width, this._height * 2) / 2;

          this._chart = this._el.append('g').attr('transform', 'translate(' + this._width / 2 + ', ' + this._height + ')');

          this._arcs = this._chart.selectAll('.arc').data((0, _d3Array.range)(1, this._sectionsCount + 1)).enter().append('path').attr('class', function (sectionIndex) {
            return 'arc chart-color' + sectionIndex;
          }).attr('d', function (sectionIndex) {
            var arcStartRad = percToRad(totalPercent);
            var arcEndRad = arcStartRad + percToRad(sectionPercentage);
            totalPercent += sectionPercentage;

            var startPadRad = sectionIndex === 0 ? 0 : padRad / 2;
            var endPadRad = sectionIndex === _this._sectionsCount ? 0 : padRad / 2;
            var arc = (0, _d3Shape.arc)().outerRadius(radius - _this._chartInset).innerRadius(radius - _this._chartInset - _this._barWidth).startAngle(arcStartRad + startPadRad).endAngle(arcEndRad - endPadRad);

            return arc(_this);
          });

          if (this._sectionsColors) {
            this._arcs.style('fill', function (sectionIndex) {
              return _this._sectionsColors[sectionIndex - 1];
            });
          }

          this._needle = new Needle({
            animationDelay: this._animationDelay,
            animationDuration: this._animationDuration,
            color: this._needleColor,
            easeType: this._easeType,
            el: this._chart,
            length: this._height * 0.5,
            percent: this._percent,
            radius: this._needleRadius
          });
          this._update();
        }

        /**
         * Updates the active arc and the gauge status (min or max) based on the current percent.
         *
         * @private
         */

      }, {
        key: '_update',
        value: function _update() {
          var _this2 = this;

          if (!this._arcs) {
            return;
          }
          this._arcs.classed('active', function (d, i) {
            return i === Math.floor(_this2._percent * _this2._sectionsCount) || i === _this2._arcs.size() - 1 && _this2._percent === 1;
          });
          this._chart.classed('min', this._percent === 0);
          this._chart.classed('max', this._percent === 1);
        }
      }, {
        key: 'interval',
        get: function get() {
          return this._scale.domain();
        }

        /**
         * Sets the interval of the gauge (min and max values).
         *
         * @param interval
         */
        ,
        set: function set(interval) {
          if (!(interval instanceof Array) || interval.length !== 2 || isNaN(interval[0]) || isNaN(interval[1]) || interval[0] > interval[1]) {
            throw new Error('The interval specified is invalid.');
          }
          this._scale = (0, _d3Scale.scaleLinear)().domain(interval).range([0, 1]).clamp(true);
        }

        /**
         * Gets the needle percent.
         *
         * @returns {number|*}    The percentage position of the needle.
         */

      }, {
        key: 'percent',
        get: function get() {
          return this._percent;
        }

        /**
         * Sets the needle percent. The percent must be between 0 and 1.
         *
         * @param percent         The percentage to set.
         */
        ,
        set: function set(percent) {
          if (isNaN(percent) || percent < 0 || percent > 1) {
            throw new RangeError('The percentage must be between 0 and 1.');
          }
          if (this._needle) {
            this._needle.update(percent);
          }
          this._percent = percent;
          this._update();
        }

        /**
         * Sets the needle position based on the specified value inside the interval.
         * If the value specified is outside the interval, the value will be
         * clamped to fit inside the domain.
         *
         * @param value           The value to use to set the needle position.
         */

      }, {
        key: 'value',
        set: function set(value) {
          if (isNaN(value)) {
            throw new Error('The specified value must be a number.');
          }
          this.percent = this._scale(value);
        }
      }]);

      return SimpleGauge;
    }();
  });
  });

  var d3SimpleGauge$1 = unwrapExports(d3SimpleGauge);

  function isLayoutConfig(config) {
      return !isNaN(config.amountTextHeight) && config.amountTextHeight > 0 &&
          !isNaN(config.averageCharSize) && config.averageCharSize > 0 &&
          !isNaN(config.horizontalMinSpacing) && config.horizontalMinSpacing >= 0 &&
          !isNaN(config.horizontalPadding) && config.horizontalPadding >= 0 &&
          !isNaN(config.polygonLength) && config.polygonLength > 0 &&
          !isNaN(config.titleLineHeight) && config.titleLineHeight > 0 &&
          !isNaN(config.transitionDuration) && config.transitionDuration >= 0 &&
          !isNaN(config.verticalMinSpacing) && config.verticalMinSpacing >= 0 &&
          !isNaN(config.verticalPadding) && config.verticalPadding >= 0;
  }

  var Layout = (function () {
      function Layout(budget, svgElement, config) {
          if (!isLayoutConfig(config)) {
              throw new TypeError('Invalid configuration specified.');
          }
          this._budget = budget;
          this._svgElement = svgElement;
          this._config = config;
          this._config.isGaugeDisplayed = config.isGaugeDisplayed !== undefined ? config.isGaugeDisplayed : true;
          this._defaultTransitionDuration = config.transitionDuration;
          var bbox = this._svgElement.node().getBoundingClientRect();
          this._width = bbox.width;
          this._height = bbox.height;
      }
      Object.defineProperty(Layout.prototype, "transitionDuration", {
          get: function () {
              return this._config.transitionDuration;
          },
          set: function (duration) {
              if (duration < 0) {
                  throw new RangeError('The transition duration must be greater or equal to 0.');
              }
              this._config.transitionDuration = duration;
          },
          enumerable: true,
          configurable: true
      });
      Layout.prototype.initialize = function () {
          var _this = this;
          this._svgElement.attr('viewBox', "0 0 " + this._width + " " + this._height);
          this._layoutElement = this._svgElement.select('#layout');
          if (!this._layoutElement.size()) {
              this._layoutElement = this._svgElement.append('g')
                  .attr('id', 'layout');
          }
          if (this._config.isGaugeDisplayed) {
              this._gaugeGroup = this._layoutElement.select('#budget-gauge-group');
              if (this._gaugeGroup.size() <= 0) {
                  this._gaugeGroup = this._layoutElement.append('g')
                      .attr('id', 'budget-gauge-group')
                      .attr('class', 'budget-gauge-group');
                  this._gaugeGroup.append('rect')
                      .attr('width', Config.GAUGE_CONFIG.width)
                      .attr('height', Config.GAUGE_CONFIG.height + 45)
                      .attr('fill', '#fff');
                  this._gaugeGroup.append('text')
                      .attr('text-anchor', 'middle')
                      .attr('x', Config.GAUGE_CONFIG.width / 2)
                      .attr('y', 95);
                  this._gaugeGroup.datum(new d3SimpleGauge$1.SimpleGauge({
                      barWidth: Config.GAUGE_CONFIG.barWidth,
                      el: this._gaugeGroup.append('g'),
                      height: Config.GAUGE_CONFIG.height,
                      interval: Config.GAUGE_CONFIG.interval,
                      needleRadius: Config.GAUGE_CONFIG.needleRadius,
                      sectionsCount: 2,
                      width: Config.GAUGE_CONFIG.width
                  }));
              }
          }
          if (this._layoutElement.select('#budget-group')) {
              this._budgetGroup = this._layoutElement.append('svg')
                  .attr('id', 'budget-group')
                  .datum({});
              if (this._config.isGaugeDisplayed) {
                  this._budgetGroup.attr('height', this._height - Config.GAUGE_CONFIG.height);
              }
              else {
                  this._budgetGroup.attr('height', this._height);
              }
          }
          function initializeBudgetElement(d) {
              var g = d3.select(this);
              var textGroup = g.append('g')
                  .attr('class', 'text-group');
              textGroup.append('text')
                  .attr('class', 'element-amount')
                  .text(Formatter.formatAmount(d.amount));
              textGroup.append('text')
                  .attr('class', 'element-name');
              d.svgElement = g.append('g')
                  .attr('class', 'polygons-group');
          }
          var createGroups = function (budgetElements, id) {
              var group = _this._budgetGroup.select("#" + id);
              if (!group.size()) {
                  group = _this._budgetGroup.append('g')
                      .attr('id', id);
              }
              var groups = group.selectAll('g')
                  .data(budgetElements, function (d) { return d.id; });
              var groupsCreated = groups.enter()
                  .append('g')
                  .each(initializeBudgetElement);
              return groups.merge(groupsCreated);
          };
          this._incomeGroups = createGroups(this._budget.incomes, 'incomes-group');
          this._spendingGroups = createGroups(this._budget.spendings, 'spendings-group');
          this.initializeLayout();
      };
      Layout.prototype.render = function () {
          function updateAmount(d) {
              d3.select(this)
                  .select('.element-amount')
                  .text(Formatter.formatAmount(d.amount + d.temporaryAmount));
          }
          this._incomeGroups = this._incomeGroups
              .sort(Layout.sortElements)
              .each(updateAmount);
          this._spendingGroups = this._spendingGroups
              .sort(Layout.sortElements)
              .each(updateAmount);
          if (this._config.isGaugeDisplayed) {
              var delta = this._budget.summary.delta;
              this._gaugeGroup.datum().value = delta;
              this._layoutElement.select('#budget-gauge-group')
                  .select('text')
                  .text(Formatter.formatAmount(delta));
          }
          this.renderLayout();
      };
      Layout.prototype.resetTransitionDuration = function () {
          this._config.transitionDuration = this._defaultTransitionDuration;
      };
      Layout.sortElements = function (a, b) {
          var compare = d3Array.descending(a.amount, b.amount);
          if (compare === 0) {
              compare = d3Array.ascending(a.name, b.name);
          }
          return compare;
      };
      return Layout;
  }());

  var BarsLayout = (function (_super) {
      __extends(BarsLayout, _super);
      function BarsLayout(budget, svgElement, config) {
          return _super.call(this, budget, svgElement, config) || this;
      }
      BarsLayout.prototype.initializeLayout = function () {
          var self = this;
          var maxLabelHeight = 0;
          function initializeLabel(d) {
              var g = d3.select(this);
              var label = d.name;
              var index = label.indexOf(',');
              if (index !== -1) {
                  label = label.substring(0, index);
              }
              var labelWords = label.split(' ');
              var line = '';
              var lines = [];
              labelWords.forEach(function (w) {
                  if (line.length * self._config.averageCharSize < self._config.polygonLength) {
                      line += (line.length === 0) ? w : " " + w;
                  }
                  else {
                      lines.push(line);
                      line = w;
                  }
              });
              lines.push(line);
              var textGroup = g.select('.text-group')
                  .attr('transform', '');
              textGroup.select('.amount')
                  .attr('text-anchor', 'middle')
                  .attr('x', self._config.polygonLength / 2)
                  .attr('y', 0);
              var labelLines = textGroup.select('.label')
                  .attr('text-anchor', 'middle')
                  .attr('y', 5)
                  .selectAll('tspan')
                  .data(lines);
              labelLines.exit()
                  .remove();
              var labelLinesCreated = labelLines.enter()
                  .append('tspan');
              labelLines.merge(labelLinesCreated)
                  .attr('x', self._config.polygonLength / 2)
                  .attr('dy', 11)
                  .text(function (d) { return d; });
              var height = textGroup.node().getBBox().height;
              if (maxLabelHeight < height) {
                  maxLabelHeight = height;
              }
          }
          function adjustPolygonsGroup() {
              d3.select(this).select('.polygons-group')
                  .attr('transform', "translate(0, " + maxLabelHeight + ")");
          }
          this._incomeGroups.each(initializeLabel)
              .each(adjustPolygonsGroup);
          this._spendingGroups.each(initializeLabel)
              .each(adjustPolygonsGroup);
          var maxCount = Math.max(this._budget.incomes.length, this._budget.spendings.length);
          var approxWidth = this._config.horizontalPadding * 2 + maxCount * this._config.polygonLength +
              (maxCount - 1) * this._config.horizontalMinSpacing;
          var maxElement = this._budget.elements[0];
          var maxPolygonHeight = Math.ceil(maxElement.polygonsGroup.count / maxElement.polygonsGroup.config.maxCountPerLine)
              * maxElement.polygonsGroup.config.sideLength;
          var approxHeight = (this._config.verticalPadding * 2 + maxPolygonHeight + maxLabelHeight) * 2;
          this._width = Math.max(approxWidth, this._width);
          this._height = Math.max(approxHeight, this._height);
          this._svgElement.attr('viewBox', "0 0 " + this._width + " " + this._height);
          var halfHeight = this._height / 2;
          this._layoutElement.select('.separator')
              .attr('x1', 0)
              .attr('y1', halfHeight)
              .attr('x2', this._width)
              .attr('y2', halfHeight);
          this._gaugeGroup
              .attr('transform', "translate(" + (this._width / 2 - Config.GAUGE_CONFIG.width / 2) + ", " + (this._height - 110) + ")");
          this._layoutElement.select('#incomes-group')
              .attr('transform', 'translate(0, 0)');
          this._layoutElement.select('#spendings-group')
              .attr('transform', "translate(0, " + halfHeight + ")");
      };
      BarsLayout.prototype.renderLayout = function () {
          var self = this;
          var x;
          function applyTransform(d, i) {
              if (i === 0) {
                  x = self._config.horizontalPadding;
              }
              else {
                  x += self._config.polygonLength + self._config.horizontalMinSpacing;
              }
              return "translate(" + x + ", " + self._config.verticalPadding + ")";
          }
          this._incomeGroups.transition()
              .duration(this._config.transitionDuration)
              .attr('transform', applyTransform);
          this._spendingGroups.transition()
              .duration(this._config.transitionDuration)
              .attr('transform', applyTransform);
      };
      return BarsLayout;
  }(Layout));

  var MIN_COUNT_PER_LINE = 5;
  var GridLayout = (function (_super) {
      __extends(GridLayout, _super);
      function GridLayout(budget, svgElement, config, minCountPerLine) {
          if (minCountPerLine === void 0) { minCountPerLine = MIN_COUNT_PER_LINE; }
          var _this = _super.call(this, budget, svgElement, config) || this;
          if (minCountPerLine <= 0) {
              throw new RangeError('The min count per line must be a positive number.');
          }
          var maxCountElements = Math.max(budget.spendings.length, budget.incomes.length);
          _this._countPerLine = Math.min(minCountPerLine, maxCountElements);
          _this._spacing = (_this._countPerLine > 1) ? _this._config.horizontalMinSpacing : 0;
          _this._budgetWidth = 2 * (2 * _this._config.horizontalPadding + _this._countPerLine *
              _this._config.polygonLength + (_this._countPerLine - 1) * _this._spacing);
          return _this;
      }
      GridLayout.prototype.initializeLayout = function () {
          var _this = this;
          this._budgetGroup.attr('viewBox', "0 0 " + this._budgetWidth + " " + this._height);
          if (this._gaugeGroup) {
              this._gaugeGroup.attr('transform', "translate(" + (this._width / 2 - Config.GAUGE_CONFIG.width / 2) + ", " + (this._height - 110) + ")");
          }
          var initializeLabel = function (d, i, nodes) {
              var g = d3.select(nodes[i]);
              var name = d.name;
              var index = name.indexOf(',');
              if (index !== -1) {
                  name = name.substring(0, index);
              }
              var nameWords = name.split(' ');
              var line = '';
              var lines = [];
              nameWords.forEach(function (w) {
                  if (line.length * _this._config.averageCharSize < _this._config.polygonLength) {
                      line += (line.length === 0) ? w : " " + w;
                  }
                  else {
                      lines.push(line);
                      line = w;
                  }
              });
              lines.push(line);
              var textGroup = g.select('.text-group')
                  .attr('transform', '');
              textGroup.select('.element-amount')
                  .attr('text-anchor', 'middle')
                  .attr('x', _this._config.polygonLength / 2)
                  .attr('y', 0);
              var labelLines = textGroup.select('.element-name')
                  .attr('text-anchor', 'middle')
                  .attr('y', _this._config.amountTextHeight * 0.3)
                  .selectAll('tspan')
                  .data(lines);
              labelLines.exit()
                  .remove();
              var labelLinesCreated = labelLines.enter()
                  .append('tspan');
              labelLines.merge(labelLinesCreated)
                  .attr('x', _this._config.polygonLength / 2)
                  .attr('dy', _this._config.titleLineHeight)
                  .text(function (d) { return d; });
              g.datum().textHeight = _this._config.amountTextHeight + _this._config.titleLineHeight * lines.length;
          };
          this._layoutElement.select('#incomes-group')
              .attr('transform', 'translate(0, 0)');
          this._layoutElement.select('#spendings-group')
              .attr('transform', "translate(" + this._budgetWidth / 2 + ", 0)");
          this._incomeGroups.each(initializeLabel);
          this._spendingGroups.each(initializeLabel);
      };
      GridLayout.prototype.renderLayout = function () {
          var _this = this;
          var maxTextHeights = [];
          var findMaxTextHeights = function (d, i) {
              if (i === 0) {
                  maxTextHeights = [];
              }
              if (i % _this._countPerLine === 0) {
                  maxTextHeights.push(0);
              }
              var index = Math.floor(i / _this._countPerLine);
              var height = d.textHeight;
              if (maxTextHeights[index] < height) {
                  maxTextHeights[index] = height;
              }
          };
          var x, y, groupIndex, maxHeight, maxGroupHeights = [];
          var applyTransform = function (d, i, nodes) {
              if (i === 0) {
                  groupIndex = maxGroupHeights.length;
                  maxGroupHeights.push([]);
                  y = _this._config.verticalPadding;
                  maxHeight = 0;
              }
              if (i % _this._countPerLine === 0) {
                  maxGroupHeights[groupIndex].push(0);
                  x = _this._config.horizontalPadding;
                  if (i !== 0) {
                      y += maxHeight + _this._config.verticalMinSpacing;
                  }
                  maxHeight = 0;
              }
              else {
                  x += _this._config.polygonLength + _this._spacing;
              }
              var maxTextHeight = maxTextHeights[Math.floor(i / _this._countPerLine)];
              d3.select(nodes[i])
                  .select('.polygons-group')
                  .attr('transform', "translate(0, " + maxTextHeight + ")");
              if (d.polygonsGroup.boundingBox.height > maxHeight) {
                  maxHeight = d.polygonsGroup.boundingBox.height + maxTextHeight;
                  maxGroupHeights[groupIndex][Math.floor(i / _this._countPerLine)] = maxHeight;
              }
              return "translate(" + x + ", " + y + ")";
          };
          this._incomeGroups.each(findMaxTextHeights)
              .transition()
              .duration(this._config.transitionDuration)
              .attr('transform', applyTransform);
          this._spendingGroups.each(findMaxTextHeights)
              .transition()
              .duration(this._config.transitionDuration)
              .attr('transform', applyTransform);
          var maxHeightsSum = maxGroupHeights.map(function (d) { return d3Array.sum(d); });
          var index = maxHeightsSum.indexOf(Math.max.apply(Math, maxHeightsSum));
          var computedHeight = maxHeightsSum[index] + 2 * this._config.verticalPadding +
              (maxGroupHeights[index].length - 1) * this._config.verticalMinSpacing + 100;
          if (computedHeight !== this._budgetGroup.datum().computedHeight) {
              this._budgetGroup.datum().computedHeight = computedHeight;
              this._budgetGroup
                  .transition()
                  .duration(this._config.transitionDuration)
                  .attr('viewBox', function () { return "0 0 " + _this._budgetWidth + " " + computedHeight; });
          }
      };
      return GridLayout;
  }(Layout));

  var HorizontalBarsLayout = (function (_super) {
      __extends(HorizontalBarsLayout, _super);
      function HorizontalBarsLayout(budget, svgElement, config) {
          return _super.call(this, budget, svgElement, config) || this;
      }
      HorizontalBarsLayout.prototype.initializeLayout = function () {
          var self = this;
          var maxLengthName = d3Array.max(this._budget.elements, function (d) { return d.name.length; });
          var maxLabelWidth = 0;
          function initializeLabel(d) {
              var g = d3.select(this);
              var label = d.name;
              var index = label.indexOf(',');
              if (index !== -1) {
                  label = label.substring(0, index);
              }
              var labelWords = label.split(' ');
              var line = '';
              var lines = [];
              labelWords.forEach(function (w) {
                  if (line.length * self._config.averageCharSize < maxLengthName * self._config.averageCharSize / 4) {
                      line += (line.length === 0) ? w : " " + w;
                  }
                  else {
                      lines.push(line);
                      line = w;
                  }
              });
              lines.push(line);
              var textGroup = g.select('.text-group');
              textGroup.select('.amount')
                  .attr('text-anchor', 'end')
                  .attr('x', 0)
                  .attr('y', 7);
              var labelLines = textGroup.select('.label')
                  .attr('text-anchor', 'end')
                  .attr('y', 10)
                  .selectAll('tspan')
                  .data(lines);
              labelLines.exit()
                  .remove();
              var labelLinesCreated = labelLines.enter()
                  .append('tspan');
              labelLines.merge(labelLinesCreated)
                  .attr('x', 0)
                  .attr('dy', 11)
                  .text(function (d) { return d; });
              g.select('.polygons-group')
                  .attr('transform', '');
              var labelWidth = textGroup.node().getBBox().width;
              if (maxLabelWidth < labelWidth) {
                  maxLabelWidth = labelWidth;
              }
          }
          function adjustGroup() {
              var g = d3.select(this);
              g.select('.text-group')
                  .attr('transform', "translate(" + maxLabelWidth + ", 0)");
              g.select('.polygons-group')
                  .attr('transform', "translate(" + (maxLabelWidth + self._config.horizontalPadding) + ", 0)");
          }
          this._incomeGroups.each(initializeLabel)
              .each(adjustGroup);
          this._spendingGroups.each(initializeLabel)
              .each(adjustGroup);
          var maxCount = Math.max(this._budget.incomes.length, this._budget.spendings.length);
          var approxHeight = this._config.verticalPadding * 2 + maxCount * this._config.polygonLength +
              (maxCount - 1) * this._config.verticalMinSpacing;
          var maxElement = this._budget.elements[0];
          var maxPolygonHeight = Math.ceil(maxElement.polygonsGroup.count /
              maxElement.polygonsGroup.config.maxCountPerLine) * maxElement.polygonsGroup.config.sideLength;
          var approxWidth = (this._config.horizontalPadding * 2 + maxPolygonHeight + maxLabelWidth +
              self._config.horizontalPadding) * 2;
          this._width = Math.max(approxWidth, this._width);
          this._height = Math.max(approxHeight, this._height);
          this._svgElement.attr('viewBox', "0 0 " + this._width + " " + this._height);
          var halfWidth = this._width / 2;
          this._layoutElement.select('.separator')
              .attr('x1', halfWidth)
              .attr('y1', 0)
              .attr('x2', halfWidth)
              .attr('y2', this._height);
          this._gaugeGroup
              .attr('transform', "translate(" + (this._width / 2 - Config.GAUGE_CONFIG.width / 2) + ", " + (this._height - 110) + ")");
          this._layoutElement.select('#incomes-group')
              .attr('transform', "translate(" + halfWidth + ", 0)");
          this._layoutElement.select('#spendings-group')
              .attr('transform', 'translate(0, 0)');
      };
      HorizontalBarsLayout.prototype.renderLayout = function () {
          var self = this;
          var y;
          function applyTransform(d, i) {
              if (i === 0) {
                  y = self._config.verticalPadding;
              }
              else {
                  y += self._config.polygonLength + self._config.verticalMinSpacing;
              }
              return "translate(" + self._config.horizontalPadding + ", " + y + ")";
          }
          this._incomeGroups.transition()
              .duration(this._config.transitionDuration)
              .attr('transform', applyTransform);
          this._spendingGroups.transition()
              .duration(this._config.transitionDuration)
              .attr('transform', applyTransform);
      };
      return HorizontalBarsLayout;
  }(Layout));

  exports.Budget = Budget;
  exports.BudgetElement = BudgetElement;
  exports.BudgetElementGroup = BudgetElementGroup;
  exports.BudgetVisualization = BudgetVisualization;
  exports.SimpleBudgetElement = SimpleBudgetElement;
  exports.AddCommand = AddCommand;
  exports.DeleteCommand = DeleteCommand;
  exports.CommandInvoker = CommandInvoker;
  exports.BarsLayout = BarsLayout;
  exports.GridLayout = GridLayout;
  exports.HorizontalBarsLayout = HorizontalBarsLayout;
  exports.RenderingVisitor = RenderingVisitor;
  exports.Config = Config;
  exports.Formatter = Formatter;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=budgetviz.js.map
