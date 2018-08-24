define("geometry/polygons-group-configs", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PolygonsGroupOrientation;
    (function (PolygonsGroupOrientation) {
        PolygonsGroupOrientation["HORIZONTAL"] = "horizontal";
        PolygonsGroupOrientation["VERTICAL"] = "vertical";
    })(PolygonsGroupOrientation = exports.PolygonsGroupOrientation || (exports.PolygonsGroupOrientation = {}));
    function isPolygonsGroupConfig(config) {
        return config !== undefined &&
            config.maxCountPerLine !== undefined && !isNaN(config.maxCountPerLine) && config.maxCountPerLine > 0 &&
            (config.orientation === undefined || Object.values(PolygonsGroupOrientation).includes(config.orientation)) &&
            config.sideLength !== undefined && !isNaN(config.sideLength) && config.sideLength > 0 &&
            (config.startingPosition === undefined ||
                config.startingPosition >= 0 && config.startingPosition < config.maxCountPerLine);
    }
    exports.isPolygonsGroupConfig = isPolygonsGroupConfig;
});
define("config", ["require", "exports", "geometry/polygons-group-configs"], function (require, exports, polygons_group_configs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Config {
    }
    Config.AVERAGE_CHAR_SIZE = 7.5;
    Config.BUDGET_ELEMENTS_ORIENTATION = polygons_group_configs_1.PolygonsGroupOrientation.HORIZONTAL;
    Config.BUDGET_SUB_ELEMENTS_SPACING = 3;
    Config.GAUGE_CONFIG = {
        barWidth: 15,
        height: 60,
        interval: [-26000000, 26000000],
        needleRadius: 6,
        width: 120,
    };
    Config.IS_USING_DISTINCT_COLORS = false;
    Config.LEVEL_CHANGE_DELAY = 1000;
    Config.MIN_AMOUNT = 50000;
    Config.MAX_COUNT_PER_LINE = 20;
    Config.SIDE_LENGTH = 6;
    Config.TRANSITION_DURATION = 350;
    Config.DEFAULT_POLYGONS_GROUP_CONFIG = {
        maxCountPerLine: Config.MAX_COUNT_PER_LINE,
        orientation: Config.BUDGET_ELEMENTS_ORIENTATION,
        sideLength: Config.SIDE_LENGTH
    };
    exports.Config = Config;
});
define("geometry/point", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function isPoint(point) {
        return point !== undefined &&
            point.x !== undefined && !isNaN(point.x) &&
            point.y !== undefined && !isNaN(point.y);
    }
    exports.isPoint = isPoint;
});
define("geometry/bounding-box", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BoundingBox {
        constructor(position = { x: 0, y: 0 }, width = 0, height = 0) {
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
        get x() {
            return this.position.x;
        }
        get y() {
            return this.position.y;
        }
        isInto(point) {
            return this.position.x <= point.x && this.position.x + this.width >= point.x &&
                this.position.y <= point.y && this.position.y + this.height >= point.y;
        }
        toString() {
            return `x: ${this.position.x} y: ${this.position.y} width: ${this.width} height: ${this.height}`;
        }
    }
    exports.BoundingBox = BoundingBox;
});
define("geometry/polygon", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("geometry/translation", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("geometry/abstract-polygons-group", ["require", "exports", "geometry/bounding-box", "geometry/polygons-group-configs"], function (require, exports, bounding_box_1, polygons_group_configs_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AbstractPolygonsGroup {
        constructor(config) {
            this._boundary = [];
            this._selectionCount = 0;
            this.config = config;
            this._boundary = [];
            this._boundingBox = new bounding_box_1.BoundingBox();
            this._translation = { x: 0, y: 0 };
        }
        get boundary() {
            return this._boundary;
        }
        get boundingBox() {
            return this._boundingBox;
        }
        get config() {
            return {
                maxCountPerLine: this._maxCountPerLine,
                orientation: this._orientation,
                sideLength: this._sideLength,
                startingPosition: this._startingPosition
            };
        }
        set config(config) {
            if (!polygons_group_configs_2.isPolygonsGroupConfig(config)) {
                throw new TypeError('Invalid configuration specified.');
            }
            this._maxCountPerLine = config.maxCountPerLine;
            this._orientation = config.orientation || polygons_group_configs_2.PolygonsGroupOrientation.HORIZONTAL;
            this._sideLength = config.sideLength;
            this._startingPosition = config.startingPosition || 0;
        }
        get selectionCount() {
            return this._selectionCount;
        }
        set selectionCount(count) {
            if (count < 0 || count > this.count) {
                throw new TypeError('The specified count is invalid');
            }
            if (this._selectionCount === count) {
                return;
            }
            this._selectionCount = count;
            const polygons = this.polygons;
            for (let max = this.polygons.length - 1, i = max; i >= 0; --i) {
                polygons[i].isSelected = max - i < count;
            }
        }
        get translation() {
            return this._translation;
        }
        translate(offset) {
            if (this._orientation === polygons_group_configs_2.PolygonsGroupOrientation.HORIZONTAL) {
                this._translation.x = 0;
                this._translation.y = offset;
            }
            else {
                this._translation.x = offset;
                this._translation.y = 0;
            }
        }
        updateBoundary() {
            const boundingBox = this.getBoundingBox({ x: 0, y: 0 }, false);
            const count = this.count + this._startingPosition || 1;
            const padding = 0;
            const hasMoreThanSingleLine = Math.ceil(count / this._maxCountPerLine) > 1;
            this._boundary = [];
            if (hasMoreThanSingleLine) {
                if (this._orientation === polygons_group_configs_2.PolygonsGroupOrientation.HORIZONTAL) {
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
                if (this._orientation === polygons_group_configs_2.PolygonsGroupOrientation.HORIZONTAL) {
                    this._boundary.push({
                        x: boundingBox.x + boundingBox.width + padding,
                        y: boundingBox.y + boundingBox.height - this._sideLength + padding
                    });
                    const width = (count % this._maxCountPerLine) * this._sideLength;
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
                    const height = (count % this._maxCountPerLine) * this._sideLength;
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
                if (this._orientation === polygons_group_configs_2.PolygonsGroupOrientation.HORIZONTAL) {
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
        }
        getBoundingBox(position, isIncludedTemporaryCount = true) {
            let count = this.count;
            if (isIncludedTemporaryCount && this.temporaryCount > 0) {
                count += this.temporaryCount;
            }
            let countPerLine = this._maxCountPerLine;
            if (this.count > 0 && (this._startingPosition + count) / this._maxCountPerLine <= 1) {
                countPerLine = count;
                const offset = this._startingPosition * this._sideLength;
                if (this._orientation === polygons_group_configs_2.PolygonsGroupOrientation.HORIZONTAL) {
                    position.x += offset;
                }
                else {
                    position.y += offset;
                }
            }
            const lineLength = (count > 0) ? countPerLine * this._sideLength : this._sideLength;
            const columnLength = (count > 0)
                ? Math.ceil((this._startingPosition + count) / this._maxCountPerLine) * this._sideLength : this._sideLength;
            if (this._orientation === polygons_group_configs_2.PolygonsGroupOrientation.HORIZONTAL) {
                return new bounding_box_1.BoundingBox(position, lineLength, columnLength);
            }
            return new bounding_box_1.BoundingBox(position, columnLength, lineLength);
        }
    }
    exports.AbstractPolygonsGroup = AbstractPolygonsGroup;
});
define("geometry/polygons-super-group", ["require", "exports", "d3", "geometry/abstract-polygons-group", "geometry/polygons-group-configs"], function (require, exports, d3, abstract_polygons_group_1, polygons_group_configs_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PolygonsSuperGroupState;
    (function (PolygonsSuperGroupState) {
        PolygonsSuperGroupState[PolygonsSuperGroupState["COLLAPSED"] = 0] = "COLLAPSED";
        PolygonsSuperGroupState[PolygonsSuperGroupState["EXPANDED"] = 1] = "EXPANDED";
    })(PolygonsSuperGroupState || (PolygonsSuperGroupState = {}));
    class PolygonsSuperGroup extends abstract_polygons_group_1.AbstractPolygonsGroup {
        constructor(config, spacing) {
            super(config);
            this._children = [];
            this._spacing = spacing;
            this._state = PolygonsSuperGroupState.COLLAPSED;
            this._temporaryCount = 0;
        }
        get count() {
            return this._children.reduce((total, child) => total + child.count, 0);
        }
        set count(count) {
            if (this.count === count) {
                return;
            }
            if (count < 0) {
                throw new RangeError('Invalid count specified.');
            }
            if (this.temporaryCount !== 0) {
                throw new Error('You should not have temporary element before to set a new count.');
            }
            let diffCount = 0;
            const children = this.children;
            const currentCount = this.count;
            children.forEach(c => {
                let ratio;
                if (currentCount === 0) {
                    ratio = 1 / children.length;
                }
                else {
                    ratio = c.count / currentCount;
                }
                const countToApply = Math.round(ratio * count);
                diffCount += Math.abs(c.count - countToApply);
                c.count = countToApply;
            });
            const delta = count - currentCount;
            if (children.length > 0 && Math.abs(delta) !== diffCount) {
                let adjustment = (delta > 0 ? 1 : -1) * (Math.abs(delta) - diffCount);
                children.some(c => {
                    let countToApply = c.count + adjustment;
                    if (countToApply < 0) {
                        countToApply = 0;
                    }
                    if (adjustment < 0) {
                        adjustment += c.count - countToApply;
                    }
                    c.count = countToApply;
                    return adjustment >= 0;
                });
            }
        }
        get polygons() {
            return [].concat.apply([], this.children.map(c => c.polygons));
        }
        get temporaryCount() {
            return this._temporaryCount;
        }
        set temporaryCount(count) {
            if (this._temporaryCount === count) {
                return;
            }
            const children = this.children;
            if (children.length <= 0) {
                return;
            }
            count = Math.max(-this.count, count);
            if (count > 0) {
                if (this.count > 0) {
                    children[children.length - 1].temporaryCount = count;
                }
                else {
                    children[0].temporaryCount = count;
                }
            }
            else {
                if (this._temporaryCount > 0) {
                    children.forEach(c => c.temporaryCount = 0);
                }
                let remainingCount = count;
                for (let i = children.length - 1; i >= 0; --i) {
                    const child = children[i];
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
            this._temporaryCount = count;
        }
        get children() {
            return this._children.sort((a, b) => d3.descending(a.count, b.count));
        }
        get spacing() {
            return this._spacing;
        }
        set spacing(spacing) {
            this._spacing = spacing;
        }
        reshape(startingPosition = 0) {
            this._startingPosition = startingPosition;
            this.update();
        }
        addGroup(group) {
            this._children.push(group);
        }
        removeGroup(group) {
            this._children.splice(this._children.findIndex(c => c === group), 1);
        }
        collapse() {
            this._state = PolygonsSuperGroupState.COLLAPSED;
        }
        expand() {
            this._state = PolygonsSuperGroupState.EXPANDED;
        }
        update() {
            const children = this.children;
            switch (this._state) {
                case PolygonsSuperGroupState.COLLAPSED: {
                    let count = this._startingPosition;
                    let cumulative = 0;
                    children.forEach((c, i) => {
                        const adjustment = (count % this._maxCountPerLine === 0 || i === 0) ? 0 : this._sideLength;
                        c.translate(cumulative - adjustment);
                        c.reshape(count % this._maxCountPerLine);
                        count += c.count;
                        if (this._orientation === polygons_group_configs_3.PolygonsGroupOrientation.HORIZONTAL) {
                            cumulative += c.boundingBox.height - adjustment;
                        }
                        else {
                            cumulative += c.boundingBox.width - adjustment;
                        }
                    });
                    break;
                }
                case PolygonsSuperGroupState.EXPANDED: {
                    this._startingPosition = 0;
                    let cumulative = 0;
                    children.forEach(c => {
                        c.translate(cumulative);
                        c.reshape(0);
                        if (this._orientation === polygons_group_configs_3.PolygonsGroupOrientation.HORIZONTAL) {
                            cumulative += c.boundingBox.height + this._spacing;
                        }
                        else {
                            cumulative += c.boundingBox.width + this._spacing;
                        }
                    });
                }
            }
            this.updateBoundingBox();
        }
        updateBoundingBox() {
            const count = this.count + Math.max(0, this.temporaryCount);
            const maximums = {
                height: this._sideLength,
                width: this._sideLength
            };
            if (count > 0) {
                this._children.forEach(c => {
                    let height = c.translation.y + c.boundingBox.y + c.boundingBox.height;
                    let width = c.translation.x + c.boundingBox.x + c.boundingBox.width;
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
        }
    }
    exports.PolygonsSuperGroup = PolygonsSuperGroup;
});
define("budget/budget-element-group", ["require", "exports", "d3", "config", "geometry/polygons-super-group", "budget/budget-element"], function (require, exports, d3, config_1, polygons_super_group_1, budget_element_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BudgetElementGroup extends budget_element_1.BudgetElement {
        constructor(name = '', description, type = budget_element_1.BudgetElementType.SPENDING, polygonsGroupConfig = config_1.Config.DEFAULT_POLYGONS_GROUP_CONFIG) {
            super(name, description, type);
            this._children = [];
            this._group = new polygons_super_group_1.PolygonsSuperGroup(polygonsGroupConfig, config_1.Config.BUDGET_SUB_ELEMENTS_SPACING);
            this._hasFocus = false;
        }
        get activeLevel() {
            return Math.min(this._level + 1, this._activeLevel);
        }
        set activeLevel(level) {
            if (level < 0) {
                throw new RangeError('Invalid level specified.');
            }
            if (this._activeLevel === level) {
                return;
            }
            this._activeLevel = level;
            this._hasFocus = false;
            this._group.selectionCount = 0;
            this._children.forEach(c => c.activeLevel = level);
            if (this.level + 1 <= this.activeLevel) {
                if (this.level > 0 && this.activeLevel > 1) {
                    this.root.polygonsGroup.spacing = 3 * config_1.Config.BUDGET_SUB_ELEMENTS_SPACING;
                }
                else {
                    this.polygonsGroup.spacing = config_1.Config.BUDGET_SUB_ELEMENTS_SPACING;
                }
                this._group.expand();
            }
            else {
                this._group.collapse();
            }
        }
        get hasFocus() {
            return this._hasFocus;
        }
        set hasFocus(hasFocus) {
            this._hasFocus = hasFocus;
            this.selectedAmount = 0;
            this.children.forEach(c => c.hasFocus = hasFocus);
        }
        get level() {
            return this._level;
        }
        set level(level) {
            if (level < 0) {
                throw new RangeError('Invalid level specified.');
            }
            this._level = level;
            this._children.forEach(c => c.level = level + 1);
        }
        get svgElement() {
            return this._svgElement;
        }
        set svgElement(svgElement) {
            if (!svgElement) {
                throw ReferenceError('The specified element is undefined.');
            }
            this._svgElement = svgElement;
            const levelGroup = svgElement.append('g')
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
            this.children.forEach(c => {
                c.svgElement = svgElement.append('g');
            });
            this._svgElement.append('polygon')
                .attr('class', `boundary boundary${this.level}`);
        }
        get polygonsGroup() {
            return this._group;
        }
        get children() {
            return this._children.sort((a, b) => d3.descending(a.amount, b.amount));
        }
        accept(visitor) {
            visitor.visitBudgetElementGroup(this);
        }
        addChild(element) {
            element.activeLevel = this._activeLevel;
            element.level = this._level + 1;
            element.parent = this;
            this._children.push(element);
            this._group.addGroup(element.polygonsGroup);
        }
        removeChild(element) {
            this._children.splice(this._children.findIndex(c => c === element), 1);
            element.activeLevel = 0;
            element.level = 0;
            element.parent = undefined;
        }
    }
    exports.BudgetElementGroup = BudgetElementGroup;
});
define("geometry/square", ["require", "exports", "d3", "geometry/bounding-box"], function (require, exports, d3, bounding_box_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Square {
        constructor(position, sideLength) {
            if (sideLength < 0) {
                throw new RangeError('The specified side length is invalid.');
            }
            this._id = Square._currentId++;
            this._position = position;
            this._sideLength = sideLength;
            this._boundingBox = new bounding_box_2.BoundingBox(this._position, this._sideLength, this._sideLength);
            this.update();
        }
        get boundingBox() {
            return this._boundingBox;
        }
        get id() {
            return this._id;
        }
        get points() {
            return this._points;
        }
        get position() {
            return this._position;
        }
        set position(position) {
            this._position = position;
            this._boundingBox.position.x = position.x;
            this._boundingBox.position.y = position.y;
            this.update();
        }
        get sideLength() {
            return this._sideLength;
        }
        set sideLength(sideLength) {
            if (sideLength < 0) {
                throw new RangeError('The specified side length is invalid.');
            }
            this._sideLength = sideLength;
            this._boundingBox.height = sideLength;
            this._boundingBox.width = sideLength;
            this.update();
        }
        update() {
            const center = {
                x: this._position.x + this._sideLength / 2,
                y: this._position.y + this._sideLength / 2
            };
            this._points = d3.range(4).map(d => {
                const i = (d < 2) ? d % 2 : (d + 1) % 2;
                const j = Math.floor(d / 2);
                return {
                    x: center.x - ((i === 0) ? 1 : -1) * this._sideLength / 2,
                    y: center.y - ((j === 0) ? 1 : -1) * this._sideLength / 2
                };
            });
        }
    }
    Square._currentId = 0;
    exports.Square = Square;
});
define("geometry/squares-group", ["require", "exports", "d3", "geometry/abstract-polygons-group", "geometry/polygons-group-configs", "geometry/square"], function (require, exports, d3, abstract_polygons_group_2, polygons_group_configs_4, square_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SquaresGroup extends abstract_polygons_group_2.AbstractPolygonsGroup {
        constructor(count, config) {
            super(config);
            this._count = count;
            this._position = { x: 0, y: 0 };
            this._squares = d3.range(this._startingPosition, this._count + this._startingPosition)
                .map(i => new square_1.Square(this.getSquarePosition(i), this._sideLength));
            this._temporaryCount = 0;
            this.updateBoundingBox();
        }
        get config() {
            return super.config;
        }
        set config(config) {
            super.config = config;
            if (this._squares) {
                this._squares.forEach((square, i) => {
                    square.position = this.getSquarePosition(i + this._startingPosition);
                    square.sideLength = this._sideLength;
                });
                this.updateBoundingBox();
            }
        }
        get count() {
            return this._count;
        }
        set count(count) {
            if (this._count === count) {
                return;
            }
            if (count < 0) {
                throw new RangeError(`Invalid count specified (${count}).`);
            }
            if (this._temporaryCount !== 0) {
                throw new Error('You should not have temporary element before to set a new count.');
            }
            this.updateCount(this._count, count);
            this._count = count;
            this.updateBoundingBox();
        }
        get polygons() {
            return this._squares;
        }
        get temporaryCount() {
            return this._temporaryCount;
        }
        set temporaryCount(count) {
            if (this._temporaryCount === count) {
                return;
            }
            count = Math.max(-this._count, count);
            if (count >= 0) {
                if (this._temporaryCount <= 0) {
                    this._temporaryCount = 0;
                    this._squares.forEach(s => s.isTemporary = false);
                }
                this.updateCount(this._count + this._temporaryCount, this._count + count, true);
            }
            else {
                if (this._temporaryCount > 0) {
                    this.updateCount(this._count + this._temporaryCount, this._count, true);
                }
                this._squares.forEach((s, i) => s.isTemporary = i >= this._count + count);
            }
            this._temporaryCount = count;
            this.updateBoundingBox();
        }
        reshape(startingPosition = 0) {
            if (this._startingPosition === startingPosition) {
                return;
            }
            if (startingPosition < 0 || startingPosition >= this._maxCountPerLine) {
                throw new RangeError('Invalid starting position specified.');
            }
            const delta = this._startingPosition - startingPosition;
            const count = Math.min(Math.abs(delta), this._count);
            if (delta > 0) {
                const othersSquares = this._squares.slice(0, this._squares.length - count);
                const squaresToModify = this._squares.slice(this._squares.length - count);
                squaresToModify.forEach((square, i) => {
                    square.position = this.getSquarePosition(i + startingPosition);
                });
                this._squares = squaresToModify.concat(othersSquares);
            }
            else {
                const othersSquares = this._squares.slice(count);
                const squaresToModify = this._squares.slice(0, count);
                squaresToModify.forEach((square, i) => {
                    square.position = this.getSquarePosition(i + startingPosition + othersSquares.length);
                });
                this._squares = othersSquares.concat(squaresToModify);
            }
            this._startingPosition = startingPosition;
            this.updateBoundingBox();
        }
        getSquarePosition(index) {
            const currentPoint = {
                x: this._position.x,
                y: this._position.y
            };
            if (Math.floor(index / this._maxCountPerLine) > 0) {
                const lineOffset = this._sideLength * Math.floor(index / this._maxCountPerLine);
                if (this._orientation === polygons_group_configs_4.PolygonsGroupOrientation.HORIZONTAL) {
                    currentPoint.y += lineOffset;
                }
                else {
                    currentPoint.x += lineOffset;
                }
            }
            const offset = this._sideLength * (index % this._maxCountPerLine);
            if (this._orientation === polygons_group_configs_4.PolygonsGroupOrientation.HORIZONTAL) {
                currentPoint.x += offset;
            }
            else {
                currentPoint.y += offset;
            }
            return currentPoint;
        }
        updateCount(currentCount, newCount, isTemporary = false) {
            if (currentCount > newCount) {
                this._squares = this._squares.slice(0, newCount);
            }
            else {
                this._squares = this._squares.concat(d3.range(currentCount + this._startingPosition, newCount + this._startingPosition)
                    .map(i => {
                    const square = new square_1.Square(this.getSquarePosition(i), this._sideLength);
                    square.isTemporary = isTemporary;
                    return square;
                }));
            }
        }
        updateBoundingBox() {
            this._boundingBox = this.getBoundingBox({
                x: this._position.x,
                y: this._position.y
            });
            this.updateBoundary();
        }
    }
    exports.SquaresGroup = SquaresGroup;
});
define("budget/simple-budget-element", ["require", "exports", "config", "geometry/squares-group", "budget/budget-element"], function (require, exports, config_2, squares_group_1, budget_element_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SimpleBudgetElement extends budget_element_2.BudgetElement {
        constructor(amount = 0, name = '', description = '', type = budget_element_2.BudgetElementType.SPENDING, polygonsGroupConfig = config_2.Config.DEFAULT_POLYGONS_GROUP_CONFIG) {
            super(name, description, type);
            this._group = new squares_group_1.SquaresGroup(Math.round(amount / config_2.Config.MIN_AMOUNT), polygonsGroupConfig);
            this._hasFocus = false;
        }
        get activeLevel() {
            return Math.min(this._level, this._activeLevel);
        }
        set activeLevel(level) {
            if (level < 0) {
                throw new RangeError('Invalid level specified.');
            }
            if (this._activeLevel === level) {
                return;
            }
            this._activeLevel = level;
            this._hasFocus = false;
        }
        get hasFocus() {
            return this._hasFocus;
        }
        set hasFocus(hasFocus) {
            this._hasFocus = hasFocus;
            this._group.selectionCount = 0;
        }
        get level() {
            return this._level;
        }
        set level(level) {
            if (level < 0) {
                level = 0;
            }
            this._level = level;
        }
        get svgElement() {
            return this._svgElement;
        }
        set svgElement(svgElement) {
            if (!svgElement) {
                throw ReferenceError('The specified element is undefined.');
            }
            this._svgElement = svgElement;
            this._svgElement.append('g')
                .attr('class', 'squares');
            this._svgElement.append('polygon')
                .attr('class', `boundary boundary${this.level}`);
        }
        get polygonsGroup() {
            return this._group;
        }
        accept(visitor) {
            visitor.visitSimpleBudgetElement(this);
        }
    }
    exports.SimpleBudgetElement = SimpleBudgetElement;
});
define("budget/visitors/budget-element-visitor", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("budget/budget-element", ["require", "exports", "config"], function (require, exports, config_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BudgetElementType;
    (function (BudgetElementType) {
        BudgetElementType["DEFICIT"] = "deficit";
        BudgetElementType["INCOME"] = "income";
        BudgetElementType["SPENDING"] = "spending";
    })(BudgetElementType = exports.BudgetElementType || (exports.BudgetElementType = {}));
    class BudgetElement {
        constructor(name, description = '', type = BudgetElementType.SPENDING) {
            this._activeLevel = 0;
            this._level = 0;
            this.id = Formatter.formatId(name);
            this.name = name;
            this.description = description;
            this.type = type;
        }
        get amount() {
            return this.polygonsGroup.count * config_3.Config.MIN_AMOUNT;
        }
        set amount(amount) {
            if (amount < 0) {
                throw new TypeError('Invalid amount specified.');
            }
            this.polygonsGroup.count = Math.ceil(amount / config_3.Config.MIN_AMOUNT);
        }
        get isActive() {
            return this._level === this.activeLevel;
        }
        get root() {
            let element = this;
            while (element.parent !== undefined) {
                element = element.parent;
            }
            return element;
        }
        get selectedAmount() {
            return this.polygonsGroup.selectionCount * config_3.Config.MIN_AMOUNT;
        }
        set selectedAmount(selectedAmount) {
            if (selectedAmount < 0) {
                selectedAmount = 0;
            }
            if (this.selectedAmount === selectedAmount) {
                return;
            }
            selectedAmount = Math.min(selectedAmount, this.amount);
            this.polygonsGroup.selectionCount = Math.ceil(selectedAmount / config_3.Config.MIN_AMOUNT);
        }
        get temporaryAmount() {
            return this.polygonsGroup.temporaryCount * config_3.Config.MIN_AMOUNT;
        }
        set temporaryAmount(temporaryAmount) {
            this.polygonsGroup.temporaryCount = Math.ceil(temporaryAmount / config_3.Config.MIN_AMOUNT);
        }
    }
    exports.BudgetElement = BudgetElement;
});
define("budget/budget-config", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function isBudgetElement(budgetElement) {
        let isValid = false;
        if (budgetElement.children && budgetElement.children.length > 0) {
            isValid = budgetElement.children.every(c => isBudgetElement(c));
        }
        else if (budgetElement.amount && !isNaN(budgetElement.amount)) {
            isValid = true;
        }
        return isValid && budgetElement.name;
    }
    function isBudgetConfig(budgetConfig) {
        return !isNaN(budgetConfig.year) && budgetConfig.incomes.length > 0 &&
            budgetConfig.incomes.every(s => isBudgetElement(s)) &&
            budgetConfig.spendings.length > 0 &&
            budgetConfig.spendings.every(s => isBudgetElement(s));
    }
    exports.isBudgetConfig = isBudgetConfig;
});
define("budget/budget", ["require", "exports", "d3", "config", "budget/budget-config", "budget/budget-element", "budget/budget-element-group", "budget/simple-budget-element"], function (require, exports, d3, config_4, budget_config_1, budget_element_3, budget_element_group_1, simple_budget_element_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BudgetState;
    (function (BudgetState) {
        BudgetState["BALANCED"] = "balanced";
        BudgetState["DEFICIT"] = "deficit";
        BudgetState["SURPLUS"] = "surplus";
    })(BudgetState = exports.BudgetState || (exports.BudgetState = {}));
    class Budget {
        constructor(budgetConfig) {
            this.incomes = [];
            this.spendings = [];
            if (!budget_config_1.isBudgetConfig(budgetConfig)) {
                throw new TypeError('Invalid configuration specified.');
            }
            function initialize(e, type, elements) {
                if (e.children && e.children.length > 0) {
                    const group = new budget_element_group_1.BudgetElementGroup(e.name, e.description || '', type);
                    e.children.forEach(c => Budget.initializeBudgetElement(c, type, group));
                    elements.push(group);
                }
                else if (Budget.isAcceptableAmount(e.amount)) {
                    elements.push(new simple_budget_element_1.SimpleBudgetElement(e.amount, e.name, e.description || '', type));
                }
                elements.sort((a, b) => d3.descending(a.amount, b.amount));
            }
            budgetConfig.incomes.forEach(e => initialize(e, budget_element_3.BudgetElementType.INCOME, this.incomes));
            budgetConfig.spendings.forEach(e => initialize(e, budget_element_3.BudgetElementType.SPENDING, this.spendings));
            this.year = budgetConfig.year;
        }
        get elements() {
            return this.incomes.concat(this.spendings)
                .sort((a, b) => d3.descending(a.amount, b.amount));
        }
        get summary() {
            const incomesAmount = this.incomes.reduce((total, income) => total + income.amount + income.temporaryAmount, 0);
            const spendingsAmount = this.spendings.reduce((total, spending) => total + spending.amount + spending.temporaryAmount, 0);
            const delta = incomesAmount - spendingsAmount;
            let state = BudgetState.BALANCED;
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
        }
        static initializeBudgetElement(data, type, parent) {
            if (data.children && data.children.length > 0) {
                Budget._amountStack.push(0);
                const group = new budget_element_group_1.BudgetElementGroup(data.name, data.description || '', type);
                data.children.forEach(c => Budget.initializeBudgetElement(c, type, group));
                const totalAmount = Budget._amountStack[Budget._amountStack.length - 1];
                if (parent) {
                    if (Budget.isAcceptableAmount(group.amount) && group.children.length > 1) {
                        parent.addChild(group);
                    }
                    else if (Budget.isAcceptableAmount(totalAmount)) {
                        parent.addChild(new simple_budget_element_1.SimpleBudgetElement(totalAmount, data.name, data.description || '', type));
                    }
                }
                Budget._amountStack.pop();
                if (Budget._amountStack.length > 0) {
                    Budget._amountStack[Budget._amountStack.length - 1] += totalAmount;
                }
            }
            else if (parent && Budget.isAcceptableAmount(data.amount)) {
                if (Budget._amountStack.length > 0) {
                    Budget._amountStack[Budget._amountStack.length - 1] += data.amount;
                }
                parent.addChild(new simple_budget_element_1.SimpleBudgetElement(data.amount, data.name, data.description || '', type));
            }
        }
        static isAcceptableAmount(amount) {
            return Math.round(amount / config_4.Config.MIN_AMOUNT) > 0;
        }
    }
    Budget._amountStack = [];
    exports.Budget = Budget;
});
define("budget/layouts/layout", ["require", "exports", "d3", "../../../node_modules/d3-simple-gauge/dist/d3-simple-gauge", "config"], function (require, exports, d3, d3_simple_gauge_1, config_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Layout {
        constructor(budget, svgElement) {
            this._budget = budget;
            this._svgElement = svgElement;
            const element = this._svgElement.node();
            this._width = element.clientWidth;
            this._height = element.clientHeight;
        }
        initialize() {
            this._svgElement.attr('viewBox', `0 0 ${this._width} ${this._height}`);
            this._layout = this._svgElement.select('#layout');
            if (!this._layout.size()) {
                this._layout = this._svgElement.append('g')
                    .attr('id', 'layout');
            }
            let separator = this._layout.select('.separator');
            if (separator.size() <= 0) {
                this._layout.append('line')
                    .attr('class', 'separator');
            }
            this._gaugeGroup = this._layout.select('#budget-gauge-group');
            if (this._gaugeGroup.size() <= 0) {
                this._gaugeGroup = this._layout.append('g')
                    .attr('id', 'budget-gauge-group');
                this._gaugeGroup.append('rect')
                    .attr('width', config_5.Config.GAUGE_CONFIG.width)
                    .attr('height', config_5.Config.GAUGE_CONFIG.height + 45)
                    .attr('fill', '#fff');
                this._gaugeGroup.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('x', config_5.Config.GAUGE_CONFIG.width / 2)
                    .attr('y', 95);
                this._gaugeGroup.datum(new d3_simple_gauge_1.SimpleGauge({
                    barWidth: config_5.Config.GAUGE_CONFIG.barWidth,
                    el: this._gaugeGroup.append('g'),
                    height: config_5.Config.GAUGE_CONFIG.height,
                    interval: config_5.Config.GAUGE_CONFIG.interval,
                    needleRadius: config_5.Config.GAUGE_CONFIG.needleRadius,
                    sectionsCount: 2,
                    width: config_5.Config.GAUGE_CONFIG.width
                }));
            }
            if (this._layout.select('#budget-group')) {
                this._budgetGroup = this._layout.append('svg')
                    .attr('id', 'budget-group')
                    .attr('height', this._height - config_5.Config.GAUGE_CONFIG.height);
            }
            this._budgetGroup.attr('viewBox', `0 0 ${this._width} ${this._height}`);
            function initializeBudgetElement(d) {
                const g = d3.select(this);
                const textGroup = g.append('g')
                    .attr('class', 'text-group');
                textGroup.append('text')
                    .attr('class', 'amount')
                    .text(Formatter.formatAmount(d.amount));
                textGroup.append('text')
                    .attr('class', 'label');
                d.svgElement = g.append('g')
                    .attr('class', 'polygons-group');
            }
            const createGroups = (budgetElements, id) => {
                let group = this._budgetGroup.select(`#${id}`);
                if (!group.size()) {
                    group = this._budgetGroup.append('g')
                        .attr('id', id);
                }
                const groups = group.selectAll('g')
                    .data(budgetElements, d => d.id);
                const groupsCreated = groups.enter()
                    .append('g')
                    .each(initializeBudgetElement);
                return groups.merge(groupsCreated);
            };
            this._incomeGroups = createGroups(this._budget.incomes, 'incomes-group');
            this._spendingGroups = createGroups(this._budget.spendings, 'spendings-group');
            this.initializeLayout();
        }
        render() {
            function updateAmount(d) {
                d3.select(this)
                    .select('.amount')
                    .text(Formatter.formatAmount(d.amount + d.temporaryAmount));
            }
            this._incomeGroups = this._incomeGroups.sort((a, b) => d3.descending(a.amount, b.amount))
                .each(updateAmount);
            this._spendingGroups = this._spendingGroups.sort((a, b) => d3.descending(a.amount, b.amount))
                .each(updateAmount);
            const delta = this._budget.summary.delta;
            this._gaugeGroup.datum().value = delta;
            this._layout.select('#budget-gauge-group')
                .select('text')
                .text(Formatter.formatAmount(delta));
            this.renderLayout();
        }
    }
    exports.Layout = Layout;
});
define("budget/visitors/rendering-visitor", ["require", "exports", "config"], function (require, exports, config_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RenderingVisitor {
        constructor(defaultTransitionDuration) {
            this._levelStack = [];
            this._defaultTransitionDuration = this.transitionDuration = defaultTransitionDuration;
        }
        get transitionDuration() {
            return this._transitionDuration;
        }
        set transitionDuration(duration) {
            if (duration < 0) {
                throw new RangeError('The transition duration must be greater or equal to 0.');
            }
            this._transitionDuration = duration;
        }
        resetTransitionDuration() {
            this._transitionDuration = this._defaultTransitionDuration;
        }
        visitBudgetElementGroup(group) {
            if (this._levelStack.length === 0) {
                group.polygonsGroup.update();
            }
            this._levelStack.push(0);
            group.svgElement.selectAll('.empty')
                .remove();
            RenderingVisitor.updateBoundary(group);
            group.children.forEach((c, i) => {
                c.accept(this);
                c.svgElement.transition()
                    .duration(this._transitionDuration)
                    .attr('class', (c.level - 1 === c.activeLevel && config_6.Config.IS_USING_DISTINCT_COLORS) ? `group${i}` : '')
                    .attr('transform', `translate(${c.polygonsGroup.translation.x}, ${c.polygonsGroup.translation.y})`);
            });
            if (group.activeLevel - group.level === 1) {
                const offset = this._levelStack[this._levelStack.length - 1] >= 1 ? 14 : 7;
                const halfOffset = offset / 2;
                const levelGroup = group.svgElement.select('.level-group');
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
                const levelGroup = group.svgElement.select('.level-group');
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
            const count = this._levelStack.pop();
            if (this._levelStack.length >= 1) {
                this._levelStack[this._levelStack.length - 1] += count;
            }
        }
        visitSimpleBudgetElement(element) {
            const polygons = element.svgElement.select('.squares').selectAll('.square')
                .data(element.polygonsGroup.polygons, d => d.id);
            RenderingVisitor.updateBoundary(element);
            polygons.enter()
                .append('polygon')
                .on('animationend', function () {
                if (!element.hasFocus) {
                    this.classList.remove('selected');
                    element.selectedAmount = 0;
                }
            })
                .merge(polygons)
                .attr('class', `square ${element.type}`)
                .classed('focused', element.hasFocus)
                .classed('selected', d => d.isSelected)
                .classed('temporary', d => d.isTemporary)
                .classed('added', d => d.isTemporary && element.temporaryAmount > 0)
                .classed('removed', d => d.isTemporary && element.temporaryAmount < 0)
                .transition()
                .duration(this._transitionDuration)
                .attr('points', d => d.points.map(e => `${e.x} ${e.y}`).join(', '));
            polygons.exit()
                .remove();
            if (element.isActive && element.amount === 0) {
                RenderingVisitor.createEmptyElement(element);
            }
        }
        static createEmptyElement(element) {
            const sideLength = element.polygonsGroup.config.sideLength;
            element.svgElement.append('rect')
                .attr('class', 'square empty')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', sideLength)
                .attr('height', sideLength);
        }
        static updateBoundary(element) {
            element.svgElement.select(`.boundary${element.level}`)
                .attr('points', (element.level - 1 <= element.activeLevel)
                ? element.polygonsGroup.boundary.map(e => `${e.x} ${e.y}`).join(', ')
                : '');
        }
    }
    exports.RenderingVisitor = RenderingVisitor;
});
define("budget/commands/command", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function isCommand(command) {
        return command !== undefined && command.execute !== undefined;
    }
    exports.isCommand = isCommand;
    function isUndoableCommand(command) {
        return isCommand(command) && command.undo !== undefined;
    }
    exports.isUndoableCommand = isUndoableCommand;
});
define("budget/commands/add-command", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AddCommand {
        constructor(element, rendering, layout) {
            this._isFirstTime = true;
            this._amount = element.temporaryAmount;
            this._element = element;
            this._rendering = rendering;
            this._layout = layout;
        }
        execute() {
            this._element.temporaryAmount = 0;
            this._element.amount += this._amount;
            this.update();
        }
        undo() {
            this._element.amount -= this._amount;
            this.update();
        }
        update() {
            this._element.selectedAmount = 0;
            this._rendering.transitionDuration = 0;
            this._element.accept(this._rendering);
            this._rendering.resetTransitionDuration();
            if (this._isFirstTime) {
                this._element.selectedAmount = this._amount;
            }
            const root = this._element.root;
            if (this._isFirstTime || root !== this._element) {
                root.accept(this._rendering);
            }
            this._layout.render();
            this._isFirstTime = false;
        }
    }
    exports.AddCommand = AddCommand;
});
define("utils/event", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Event {
        constructor() {
            this._handlers = [];
        }
        register(handler, context) {
            if (!context) {
                context = this;
            }
            this._handlers.push({ handler: handler, context: context });
        }
        unregister(handler, context) {
            if (!context) {
                context = this;
            }
            this._handlers = this._handlers.filter(h => h.handler !== handler && h.context !== context);
        }
        invoke(data) {
            this._handlers.slice(0).forEach(h => h.handler.call(h.context, data));
        }
    }
    exports.Event = Event;
});
define("budget/commands/command-invoker", ["require", "exports", "utils/event", "budget/commands/command"], function (require, exports, event_1, command_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CommandInvoker {
        constructor() {
            this.onCommandInvoked = new event_1.Event();
            this._commands = [];
            this._currentIndex = -1;
        }
        get canUndo() {
            return this._commands.length >= 1 && this._currentIndex >= 0;
        }
        get canRedo() {
            return this._commands.length >= 1 && this._currentIndex < this._commands.length - 1;
        }
        undo() {
            if (this.canUndo) {
                this._commands[this._currentIndex--].undo();
                this.onCommandInvoked.invoke();
            }
        }
        redo() {
            if (this.canRedo) {
                this._commands[++this._currentIndex].execute();
                this.onCommandInvoked.invoke();
            }
        }
        invoke(command, isSavingCommand = true) {
            if (isSavingCommand && command_1.isUndoableCommand(command)) {
                this._commands = this._commands.slice(0, ++this._currentIndex);
                this._commands.push(command);
            }
            command.execute();
            this.onCommandInvoked.invoke();
        }
    }
    exports.CommandInvoker = CommandInvoker;
});
define("budget/commands/delete-command", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DeleteCommand {
        constructor(element, rendering, layout) {
            this._amount = Math.abs(element.temporaryAmount);
            this._element = element;
            this._rendering = rendering;
            this._layout = layout;
        }
        execute() {
            this._element.temporaryAmount = 0;
            this._element.amount -= this._amount;
            this.update();
        }
        undo() {
            this._element.amount += this._amount;
            this.update();
        }
        update() {
            this._rendering.transitionDuration = 0;
            this._element.accept(this._rendering);
            this._rendering.resetTransitionDuration();
            const root = this._element.root;
            if (this._element !== root) {
                root.accept(this._rendering);
            }
            this._layout.render();
        }
    }
    exports.DeleteCommand = DeleteCommand;
});
define("budget/budget-visualization", ["require", "exports", "d3", "d3-tip", "config", "budget/commands/add-command", "budget/commands/command-invoker", "budget/visitors/rendering-visitor", "budget/commands/delete-command"], function (require, exports, d3, d3Tip, config_7, add_command_1, command_invoker_1, rendering_visitor_1, delete_command_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BudgetVisualization {
        constructor(budget, svgElement, layout, commandInvoker = new command_invoker_1.CommandInvoker(), rendering = new rendering_visitor_1.RenderingVisitor(config_7.Config.TRANSITION_DURATION)) {
            this._isInitialized = false;
            this._budget = budget;
            this._svgElement = svgElement;
            this._layout = layout;
            this._commandInvoker = commandInvoker;
            this._rendering = rendering;
        }
        get budget() {
            return this._budget;
        }
        set activeLevel(activeLevel) {
            this._budget.elements.forEach(e => {
                e.activeLevel = activeLevel;
                e.accept(this._rendering);
            });
            this._layout.render();
        }
        initialize() {
            if (this._isInitialized) {
                throw new Error('The visualization is already initialized.');
            }
            const self = this;
            let hoveredElement = undefined;
            let selectedElement = undefined;
            this._layout.initialize();
            const tip = d3Tip()
                .html(d => {
                let str = `<h1>${d.name} (${Formatter.formatAmount(d.amount)})</h1>`;
                str += d.description ? `<p>${d.description}</p>` : '';
                return str;
            });
            this._svgElement.call(tip);
            const executeCommand = () => {
                if (selectedElement !== undefined && selectedElement.temporaryAmount !== 0) {
                    if (selectedElement.temporaryAmount > 0) {
                        this._commandInvoker.invoke(new add_command_1.AddCommand(selectedElement, this._rendering, this._layout));
                    }
                    else {
                        this._commandInvoker.invoke(new delete_command_1.DeleteCommand(selectedElement, this._rendering, this._layout));
                    }
                }
            };
            d3.select('body')
                .on('wheel', () => {
                if (selectedElement) {
                    const delta = d3.event.deltaY;
                    selectedElement.temporaryAmount += delta / 100 * config_7.Config.MIN_AMOUNT;
                    this._rendering.transitionDuration = 0;
                    selectedElement.root.accept(this._rendering);
                    this._rendering.resetTransitionDuration();
                    this._layout.render();
                }
            })
                .on('click', () => {
                if (selectedElement && selectedElement.hasFocus) {
                    selectedElement.hasFocus = false;
                    selectedElement.accept(this._rendering);
                }
                executeCommand();
                selectedElement = undefined;
            });
            const events = new (class {
                visitBudgetElementGroup(group) {
                    this.subscribe(group);
                    group.svgElement.select('.level-group')
                        .on('mouseenter', () => {
                        hoveredElement = group;
                        tip.direction('w')
                            .offset([0, -8])
                            .attr('class', 'd3-tip level-tip')
                            .show.call(group.svgElement.node(), group);
                    })
                        .on('mouseleave', () => {
                        hoveredElement = undefined;
                        tip.hide();
                    })
                        .on('click', () => {
                        d3.event.stopPropagation();
                        executeCommand();
                        tip.hide();
                        group.activeLevel = group.level;
                        group.root.accept(self._rendering);
                        self._layout.render();
                    });
                    group.children.forEach(c => c.accept(this));
                }
                visitSimpleBudgetElement(element) {
                    this.subscribe(element);
                }
                subscribe(element) {
                    if (!element.svgElement) {
                        throw new TypeError('The SVG element is undefined.');
                    }
                    function showTooltip() {
                        if (element.level > 0) {
                            tip.direction('e')
                                .offset([0, 8])
                                .attr('class', 'd3-tip element-tip')
                                .show.call(element.svgElement.node(), element);
                        }
                    }
                    element.svgElement.on('click', () => {
                        if (element.isActive) {
                            d3.event.stopPropagation();
                            if (selectedElement && selectedElement !== element && selectedElement.hasFocus) {
                                selectedElement.hasFocus = false;
                                selectedElement.accept(self._rendering);
                                executeCommand();
                            }
                            selectedElement = element;
                            element.hasFocus = true;
                            element.accept(self._rendering);
                        }
                    });
                    element.svgElement.on('mouseenter', () => {
                        if (element.isActive) {
                            hoveredElement = element;
                            hoveredElement.svgElement.classed('hovered', true);
                            showTooltip();
                        }
                    });
                    element.svgElement.on('mouseover', () => {
                        if (element.isActive) {
                            hoveredElement = element;
                            hoveredElement.svgElement.classed('hovered', true);
                            showTooltip();
                        }
                    });
                    element.svgElement.on('mouseleave', () => {
                        if (element.isActive && hoveredElement) {
                            hoveredElement.svgElement.classed('hovered', false);
                            hoveredElement = undefined;
                            tip.hide();
                        }
                    });
                    element.svgElement.on('dblclick', () => {
                        if (element.isActive) {
                            executeCommand();
                            selectedElement = undefined;
                            element.activeLevel += 1;
                            element.root.accept(self._rendering);
                            self._layout.render();
                            hoveredElement.svgElement.classed('hovered', false);
                            hoveredElement = undefined;
                            tip.hide();
                        }
                    });
                }
            });
            this._budget.elements.forEach(e => {
                e.accept(events);
                e.accept(this._rendering);
            });
            this._layout.render();
            this._isInitialized = true;
        }
        update(layout, polygonsGroupConfig) {
            if (!this._isInitialized) {
                throw new Error('The visualization is not initialized. Please initialize the visualization first.');
            }
            if (polygonsGroupConfig) {
                const polygonsConfigs = new (class {
                    visitBudgetElementGroup(group) {
                        group.polygonsGroup.config = polygonsGroupConfig;
                        group.children.forEach(c => c.accept(this));
                    }
                    visitSimpleBudgetElement(element) {
                        element.polygonsGroup.config = polygonsGroupConfig;
                    }
                });
                this._budget.elements.forEach(e => {
                    e.accept(polygonsConfigs);
                    e.accept(this._rendering);
                });
            }
            this._layout = layout;
            this._layout.initialize();
            this._layout.render();
        }
    }
    exports.BudgetVisualization = BudgetVisualization;
});
define("budget/layouts/layout-config", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LayoutConfig {
    }
    exports.LayoutConfig = LayoutConfig;
    function isLayoutConfig(config) {
        return !isNaN(config.averageCharSize) && config.averageCharSize > 0 &&
            !isNaN(config.horizontalMinSpacing) && config.horizontalMinSpacing >= 0 &&
            !isNaN(config.horizontalPadding) && config.horizontalPadding >= 0 &&
            !isNaN(config.polygonLength) && config.polygonLength > 0 &&
            !isNaN(config.transitionDuration) && config.transitionDuration >= 0 &&
            !isNaN(config.verticalMinSpacing) && config.verticalMinSpacing >= 0 &&
            !isNaN(config.verticalPadding) && config.verticalPadding >= 0;
    }
    exports.isLayoutConfig = isLayoutConfig;
});
define("budget/layouts/bars-layout", ["require", "exports", "d3", "config", "budget/layouts/layout", "budget/layouts/layout-config"], function (require, exports, d3, config_8, layout_1, layout_config_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BarsLayout extends layout_1.Layout {
        constructor(budget, svgElement, config) {
            super(budget, svgElement);
            if (!layout_config_1.isLayoutConfig(config)) {
                throw new TypeError('Invalid configuration specified.');
            }
            this._config = config;
        }
        initializeLayout() {
            const self = this;
            let maxLabelHeight = 0;
            function initializeLabel(d) {
                const g = d3.select(this);
                let label = d.name;
                const index = label.indexOf(',');
                if (index !== -1) {
                    label = label.substring(0, index);
                }
                const labelWords = label.split(' ');
                let line = '';
                const lines = [];
                labelWords.forEach(w => {
                    if (line.length * self._config.averageCharSize < self._config.polygonLength) {
                        line += (line.length === 0) ? w : ` ${w}`;
                    }
                    else {
                        lines.push(line);
                        line = w;
                    }
                });
                lines.push(line);
                const textGroup = g.select('.text-group')
                    .attr('transform', '');
                textGroup.select('.amount')
                    .attr('text-anchor', 'middle')
                    .attr('x', self._config.polygonLength / 2)
                    .attr('y', 0);
                const labelLines = textGroup.select('.label')
                    .attr('text-anchor', 'middle')
                    .attr('y', 5)
                    .selectAll('tspan')
                    .data(lines);
                labelLines.exit()
                    .remove();
                const labelLinesCreated = labelLines.enter()
                    .append('tspan');
                labelLines.merge(labelLinesCreated)
                    .attr('x', self._config.polygonLength / 2)
                    .attr('dy', 11)
                    .text(d => d);
                const height = textGroup.node().getBBox().height;
                if (maxLabelHeight < height) {
                    maxLabelHeight = height;
                }
            }
            function adjustPolygonsGroup() {
                d3.select(this).select('.polygons-group')
                    .attr('transform', `translate(0, ${maxLabelHeight})`);
            }
            this._incomeGroups.each(initializeLabel)
                .each(adjustPolygonsGroup);
            this._spendingGroups.each(initializeLabel)
                .each(adjustPolygonsGroup);
            const maxCount = Math.max(this._budget.incomes.length, this._budget.spendings.length);
            const approxWidth = this._config.horizontalPadding * 2 + maxCount * this._config.polygonLength +
                (maxCount - 1) * this._config.horizontalMinSpacing;
            const maxElement = this._budget.elements[0];
            const maxPolygonHeight = Math.ceil(maxElement.polygonsGroup.count / maxElement.polygonsGroup.config.maxCountPerLine)
                * maxElement.polygonsGroup.config.sideLength;
            const approxHeight = (this._config.verticalPadding * 2 + maxPolygonHeight + maxLabelHeight) * 2;
            this._width = Math.max(approxWidth, this._width);
            this._height = Math.max(approxHeight, this._height);
            this._svgElement.attr('viewBox', `0 0 ${this._width} ${this._height}`);
            const halfHeight = this._height / 2;
            this._layout.select('.separator')
                .attr('x1', 0)
                .attr('y1', halfHeight)
                .attr('x2', this._width)
                .attr('y2', halfHeight);
            this._gaugeGroup
                .attr('transform', `translate(${this._width / 2 - config_8.Config.GAUGE_CONFIG.width / 2}, ${this._height - 110})`);
            this._layout.select('#incomes-group')
                .attr('transform', 'translate(0, 0)');
            this._layout.select('#spendings-group')
                .attr('transform', `translate(0, ${halfHeight})`);
        }
        renderLayout() {
            const self = this;
            let x;
            function applyTransform(d, i) {
                if (i === 0) {
                    x = self._config.horizontalPadding;
                }
                else {
                    x += self._config.polygonLength + self._config.horizontalMinSpacing;
                }
                return `translate(${x}, ${self._config.verticalPadding})`;
            }
            this._incomeGroups.transition()
                .duration(this._config.transitionDuration)
                .attr('transform', applyTransform);
            this._spendingGroups.transition()
                .duration(this._config.transitionDuration)
                .attr('transform', applyTransform);
        }
    }
    exports.BarsLayout = BarsLayout;
});
define("budget/layouts/grid-layout", ["require", "exports", "d3", "config", "budget/layouts/layout", "budget/layouts/layout-config"], function (require, exports, d3, config_9, layout_2, layout_config_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GridLayout extends layout_2.Layout {
        constructor(budget, svgElement, config) {
            super(budget, svgElement);
            if (!layout_config_2.isLayoutConfig(config)) {
                throw new TypeError('Invalid configuration specified.');
            }
            this._config = config;
        }
        initializeLayout() {
            const self = this;
            const halfWidth = this._width / 2;
            this._layout.select('.separator')
                .attr('x1', halfWidth)
                .attr('y1', 0)
                .attr('x2', halfWidth)
                .attr('y2', this._height);
            this._gaugeGroup
                .attr('transform', `translate(${this._width / 2 - config_9.Config.GAUGE_CONFIG.width / 2}, ${this._height - 110})`);
            function initializeLabel(d) {
                const g = d3.select(this);
                let label = d.name;
                const index = label.indexOf(',');
                if (index !== -1) {
                    label = label.substring(0, index);
                }
                const labelWords = label.split(' ');
                let line = '';
                const lines = [];
                labelWords.forEach(w => {
                    if (line.length * self._config.averageCharSize < self._config.polygonLength) {
                        line += (line.length === 0) ? w : ` ${w}`;
                    }
                    else {
                        lines.push(line);
                        line = w;
                    }
                });
                lines.push(line);
                const textGroup = g.select('.text-group')
                    .attr('transform', '');
                textGroup.select('.amount')
                    .attr('text-anchor', 'middle')
                    .attr('x', self._config.polygonLength / 2)
                    .attr('y', 0);
                const labelLines = textGroup.select('.label')
                    .attr('text-anchor', 'middle')
                    .attr('y', 5)
                    .selectAll('tspan')
                    .data(lines);
                labelLines.exit()
                    .remove();
                const labelLinesCreated = labelLines.enter()
                    .append('tspan');
                labelLines.merge(labelLinesCreated)
                    .attr('x', self._config.polygonLength / 2)
                    .attr('dy', 11)
                    .text(d => d);
            }
            this._layout.select('#incomes-group')
                .attr('transform', 'translate(0, 0)');
            this._layout.select('#spendings-group')
                .attr('transform', `translate(${this._width / 2}, 0)`);
            this._incomeGroups.each(initializeLabel);
            this._spendingGroups.each(initializeLabel);
        }
        renderLayout() {
            const self = this;
            const halfWidth = this._width / 2;
            const count = Math.floor((halfWidth - 2 * this._config.horizontalPadding) /
                (this._config.polygonLength + this._config.horizontalMinSpacing));
            const spacing = (halfWidth - 2 * this._config.horizontalPadding -
                count * this._config.polygonLength) / (count - 1);
            let maxTextHeights = [];
            function findMaxTextHeights(d, i) {
                const textGroup = d3.select(this).select('.text-group');
                if (i === 0) {
                    maxTextHeights = [];
                }
                if (i % count === 0) {
                    maxTextHeights.push(0);
                }
                const index = Math.floor(i / count);
                const height = textGroup.node().getBBox().height;
                if (maxTextHeights[index] < height) {
                    maxTextHeights[index] = height;
                }
            }
            let x, y, maxHeight, maxHeights = [];
            function applyTransform(d, i) {
                if (i === 0) {
                    maxHeights = [];
                    y = self._config.verticalPadding;
                    maxHeight = 0;
                }
                if (i % count === 0) {
                    maxHeights.push(0);
                    x = self._config.horizontalPadding;
                    if (i !== 0) {
                        y += maxHeight + self._config.verticalMinSpacing;
                    }
                    maxHeight = 0;
                }
                else {
                    x += self._config.polygonLength + spacing;
                }
                const maxTextHeight = maxTextHeights[Math.floor(i / count)];
                d3.select(this)
                    .select('.polygons-group')
                    .attr('transform', `translate(0, ${maxTextHeight})`);
                if (d.polygonsGroup.boundingBox.height > maxHeight) {
                    maxHeight = d.polygonsGroup.boundingBox.height + maxTextHeight;
                    maxHeights[Math.floor(i / count)] = maxHeight;
                }
                return `translate(${x}, ${y})`;
            }
            this._incomeGroups.each(findMaxTextHeights)
                .transition()
                .duration(this._config.transitionDuration)
                .attr('transform', applyTransform);
            this._spendingGroups.each(findMaxTextHeights)
                .transition()
                .duration(this._config.transitionDuration)
                .attr('transform', applyTransform);
            this._budgetGroup
                .transition()
                .duration(this._config.transitionDuration)
                .attr('viewBox', () => {
                const computedHeight = d3.sum(maxHeights) + 2 * self._config.verticalPadding +
                    (maxHeights.length - 1) * self._config.verticalMinSpacing + 100;
                const ratio = computedHeight / this._height;
                const computedWidth = this._width;
                return `0 0 ${computedWidth} ${computedHeight}`;
            });
        }
    }
    exports.GridLayout = GridLayout;
});
define("budget/layouts/horizontal-bars-layout", ["require", "exports", "d3", "budget/layouts/layout", "budget/layouts/layout-config", "config"], function (require, exports, d3, layout_3, layout_config_3, config_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class HorizontalBarsLayout extends layout_3.Layout {
        constructor(budget, svgElement, config) {
            super(budget, svgElement);
            if (!layout_config_3.isLayoutConfig(config)) {
                throw new TypeError('Invalid configuration specified.');
            }
            this._config = config;
        }
        initializeLayout() {
            const self = this;
            const maxLengthName = d3.max(this._budget.elements, d => d.name.length);
            let maxLabelWidth = 0;
            function initializeLabel(d) {
                const g = d3.select(this);
                let label = d.name;
                const index = label.indexOf(',');
                if (index !== -1) {
                    label = label.substring(0, index);
                }
                const labelWords = label.split(' ');
                let line = '';
                const lines = [];
                labelWords.forEach(w => {
                    if (line.length * self._config.averageCharSize < maxLengthName * self._config.averageCharSize / 4) {
                        line += (line.length === 0) ? w : ` ${w}`;
                    }
                    else {
                        lines.push(line);
                        line = w;
                    }
                });
                lines.push(line);
                const textGroup = g.select('.text-group');
                textGroup.select('.amount')
                    .attr('text-anchor', 'end')
                    .attr('x', 0)
                    .attr('y', 7);
                const labelLines = textGroup.select('.label')
                    .attr('text-anchor', 'end')
                    .attr('y', 10)
                    .selectAll('tspan')
                    .data(lines);
                labelLines.exit()
                    .remove();
                const labelLinesCreated = labelLines.enter()
                    .append('tspan');
                labelLines.merge(labelLinesCreated)
                    .attr('x', 0)
                    .attr('dy', 11)
                    .text(d => d);
                g.select('.polygons-group')
                    .attr('transform', '');
                const labelWidth = textGroup.node().getBBox().width;
                if (maxLabelWidth < labelWidth) {
                    maxLabelWidth = labelWidth;
                }
            }
            function adjustGroup() {
                const g = d3.select(this);
                g.select('.text-group')
                    .attr('transform', `translate(${maxLabelWidth}, 0)`);
                g.select('.polygons-group')
                    .attr('transform', `translate(${maxLabelWidth + self._config.horizontalPadding}, 0)`);
            }
            this._incomeGroups.each(initializeLabel)
                .each(adjustGroup);
            this._spendingGroups.each(initializeLabel)
                .each(adjustGroup);
            const maxCount = Math.max(this._budget.incomes.length, this._budget.spendings.length);
            const approxHeight = this._config.verticalPadding * 2 + maxCount * this._config.polygonLength +
                (maxCount - 1) * this._config.verticalMinSpacing;
            const maxElement = this._budget.elements[0];
            const maxPolygonHeight = Math.ceil(maxElement.polygonsGroup.count /
                maxElement.polygonsGroup.config.maxCountPerLine) * maxElement.polygonsGroup.config.sideLength;
            const approxWidth = (this._config.horizontalPadding * 2 + maxPolygonHeight + maxLabelWidth +
                self._config.horizontalPadding) * 2;
            this._width = Math.max(approxWidth, this._width);
            this._height = Math.max(approxHeight, this._height);
            this._svgElement.attr('viewBox', `0 0 ${this._width} ${this._height}`);
            const halfWidth = this._width / 2;
            this._layout.select('.separator')
                .attr('x1', halfWidth)
                .attr('y1', 0)
                .attr('x2', halfWidth)
                .attr('y2', this._height);
            this._gaugeGroup
                .attr('transform', `translate(${this._width / 2 - config_10.Config.GAUGE_CONFIG.width / 2}, ${this._height - 110})`);
            this._layout.select('#incomes-group')
                .attr('transform', `translate(${halfWidth}, 0)`);
            this._layout.select('#spendings-group')
                .attr('transform', 'translate(0, 0)');
        }
        renderLayout() {
            const self = this;
            let y;
            function applyTransform(d, i) {
                if (i === 0) {
                    y = self._config.verticalPadding;
                }
                else {
                    y += self._config.polygonLength + self._config.verticalMinSpacing;
                }
                return `translate(${self._config.horizontalPadding}, ${y})`;
            }
            this._incomeGroups.transition()
                .duration(this._config.transitionDuration)
                .attr('transform', applyTransform);
            this._spendingGroups.transition()
                .duration(this._config.transitionDuration)
                .attr('transform', applyTransform);
        }
    }
    exports.HorizontalBarsLayout = HorizontalBarsLayout;
});
define("app", ["require", "exports", "d3", "budget/budget", "budget/budget-visualization", "budget/commands/command-invoker", "budget/layouts/bars-layout", "budget/layouts/grid-layout", "budget/layouts/horizontal-bars-layout", "config", "geometry/polygons-group-configs"], function (require, exports, d3, budget_1, budget_visualization_1, command_invoker_2, bars_layout_1, grid_layout_1, horizontal_bars_layout_1, config_11, polygons_group_configs_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    d3.json('./data/2018/2018.json').then((config) => {
        const svg = d3.select('svg');
        const budget = new budget_1.Budget(config);
        const visualizationConfigs = [
            {
                layout: new grid_layout_1.GridLayout(budget, svg, {
                    averageCharSize: config_11.Config.AVERAGE_CHAR_SIZE,
                    horizontalMinSpacing: 30,
                    horizontalPadding: 40,
                    polygonLength: config_11.Config.SIDE_LENGTH * config_11.Config.MAX_COUNT_PER_LINE,
                    transitionDuration: 500,
                    verticalMinSpacing: 30,
                    verticalPadding: 30
                }),
                polygonsGroupConfig: config_11.Config.DEFAULT_POLYGONS_GROUP_CONFIG
            },
            {
                layout: new horizontal_bars_layout_1.HorizontalBarsLayout(budget, svg, {
                    averageCharSize: config_11.Config.AVERAGE_CHAR_SIZE,
                    horizontalMinSpacing: 30,
                    horizontalPadding: 20,
                    polygonLength: 5 * 5,
                    transitionDuration: 500,
                    verticalMinSpacing: 20,
                    verticalPadding: 30
                }),
                polygonsGroupConfig: {
                    maxCountPerLine: 5,
                    orientation: polygons_group_configs_5.PolygonsGroupOrientation.VERTICAL,
                    sideLength: 5
                }
            },
            {
                layout: new bars_layout_1.BarsLayout(budget, svg, {
                    averageCharSize: config_11.Config.AVERAGE_CHAR_SIZE,
                    horizontalMinSpacing: 30,
                    horizontalPadding: 40,
                    polygonLength: 12 * 5,
                    transitionDuration: 500,
                    verticalMinSpacing: 30,
                    verticalPadding: 30
                }),
                polygonsGroupConfig: {
                    maxCountPerLine: 12,
                    orientation: polygons_group_configs_5.PolygonsGroupOrientation.HORIZONTAL,
                    sideLength: 5
                }
            }
        ];
        const layoutButtons = d3.select('#layouts')
            .selectAll('button')
            .data(visualizationConfigs);
        let activeIndex = 0;
        layoutButtons.on('click', function (d, i) {
            if (activeIndex === i) {
                return;
            }
            activeIndex = i;
            layoutButtons.classed('selected', false);
            d3.select(this).classed('selected', true);
            budgetVisualization.update(d.layout, d.polygonsGroupConfig);
        });
        const commandInvoker = new command_invoker_2.CommandInvoker();
        commandInvoker.onCommandInvoked.register(() => {
            console.log(`Budget state: ${budget.summary.state}`);
            undoButton.property('disabled', !commandInvoker.canUndo);
            redoButton.property('disabled', !commandInvoker.canRedo);
        });
        const undoButton = d3.select('#undo')
            .on('click', () => commandInvoker.undo());
        const redoButton = d3.select('#redo')
            .on('click', () => commandInvoker.redo());
        let activeLevel = 0;
        const upButton = d3.select('#up')
            .on('click', () => {
            if (activeLevel > 0) {
                budgetVisualization.activeLevel = --activeLevel;
            }
            upButton.property('disabled', activeLevel <= 0);
            downButton.property('disabled', activeLevel >= 2);
        });
        const downButton = d3.select('#down')
            .on('click', () => {
            if (activeLevel < 2) {
                budgetVisualization.activeLevel = ++activeLevel;
            }
            upButton.property('disabled', activeLevel <= 0);
            downButton.property('disabled', activeLevel >= 2);
        });
        const budgetVisualization = new budget_visualization_1.BudgetVisualization(budget, svg, visualizationConfigs[0].layout, commandInvoker);
        budgetVisualization.initialize();
    });
});
define("budget/commands/transfer-command", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TransferCommand {
        constructor(source, destination, renderingVisitor, layout) {
            this._isFirstTime = true;
            if (source.type !== destination.type) {
                throw new Error('Invalid transfer. The transfer must be done between same type elements.');
            }
            this._amount = source.selectedAmount;
            this._source = source;
            this._destination = destination;
            this._renderingVisitor = renderingVisitor;
            this._layout = layout;
        }
        execute() {
            this._source.selectedAmount = 0;
            this._source.amount -= this._amount;
            this._destination.amount += this._amount;
            this.update();
        }
        undo() {
            this._source.amount += this._amount;
            this._destination.amount -= this._amount;
            this.update();
        }
        update() {
            this._destination.selectedAmount = 0;
            this._renderingVisitor.transitionDuration = 0;
            this._source.accept(this._renderingVisitor);
            this._destination.accept(this._renderingVisitor);
            this._renderingVisitor.resetTransitionDuration();
            if (this._isFirstTime) {
                this._destination.selectedAmount = this._amount;
            }
            const root1 = this._source.root;
            const root2 = this._destination.root;
            if (root1 !== root2 && root1 !== this._source) {
                root1.accept(this._renderingVisitor);
            }
            if (this._isFirstTime || root2 !== this._destination) {
                root2.accept(this._renderingVisitor);
            }
            this._layout.render();
            this._isFirstTime = false;
        }
    }
    exports.TransferCommand = TransferCommand;
});
class Formatter {
    static formatAmount(amount) {
        let result = amount / Math.pow(10, 6);
        if (Math.abs(result) >= 1) {
            return `${result.toFixed(2).replace('.', ',')} G$`;
        }
        result = amount / Math.pow(10, 3);
        return `${result.toFixed(0).replace('.', ',')} M$`;
    }
    static formatId(name, spaceCharacter = '-') {
        return name.trim().toLowerCase().replace(/[^a-zA-Z ]/g, '').replace(/\s/g, spaceCharacter);
    }
}
define("utils/random", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Random {
        static getRandom() {
            return Math.random();
        }
        static getRandomArbitrary(min, max) {
            return Math.random() * (max - min) + min;
        }
        static getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min;
        }
        static getRandomIntInclusive(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }
    exports.Random = Random;
});
class SvgUtils {
    static getRootBoundingBox(element, rootId) {
        const transform = {
            x: 0,
            y: 0
        };
        let current = element;
        while ((rootId && current.id !== rootId) || (!rootId && current.nodeName !== 'svg')) {
            if (current.transform.baseVal.length > 0) {
                const matrix = current.transform.baseVal[0].matrix;
                transform.x += matrix.e;
                transform.y += matrix.f;
            }
            current = current.parentNode;
        }
        const bBox = element.getBBox();
        return {
            height: bBox.height,
            width: bBox.width,
            x: transform.x + bBox.x,
            y: transform.y + bBox.y
        };
    }
}

//# sourceMappingURL=app.js.map
