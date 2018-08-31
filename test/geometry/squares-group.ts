import { expect } from 'chai';
import 'mocha';

import { Polygon } from '../../src/geometry/polygon';
import { PolygonsGroupOrientation } from '../../src/geometry/polygons-group-configs';
import { Square } from '../../src/geometry/square';
import { SquaresGroup } from '../../src/geometry/squares-group';

function validatePolygons(polygons: Polygon[], expectedPolygons: Polygon[]) {
  expect(polygons.length).to.equal(expectedPolygons.length);
  polygons.forEach((d, i) => {
    const expectedPolygon = expectedPolygons[i];
    expect(d.position.x).to.equal(expectedPolygon.position.x);
    expect(d.position.y).to.equal(expectedPolygon.position.y);
    d.points.forEach((p, j) => {
      const expectedPoint = expectedPolygon.points[j];
      expect(p.x).to.equal(expectedPoint.x);
      expect(p.y).to.equal(expectedPoint.y);
    });
  });
}

describe('SquaresGroup class', () => {
  describe('#constructor()', () => {
    it('should initialize a squares group correctly', () => {
      const config = {
        count: 4,
        maxCountPerLine: 2,
        sideLength: 2
      };
      const squaresGroup = new SquaresGroup(config.count, {
        maxCountPerLine: config.maxCountPerLine,
        sideLength: config.sideLength
      });
      expect(squaresGroup.boundingBox.x).to.equal(0);
      expect(squaresGroup.boundingBox.y).to.equal(0);
      expect(squaresGroup.boundingBox.width).to.equal(4);
      expect(squaresGroup.boundingBox.height).to.equal(4);

      expect(squaresGroup.count).to.equal(config.count);
      expect(squaresGroup.polygons.length).to.equal(config.count);
    });
    it('should throw an exception when the count is invalid', () => {
      expect(() => new SquaresGroup(-1, {
        maxCountPerLine: 2,
        sideLength: 2
      })).to.throw('Invalid count specified.');
    });
    it('should throw an exception when the configuration specified is invalid', () => {
      expect(() => new SquaresGroup(2, undefined)).to.throw('Invalid configuration specified.');
    });
  });
  describe('#config', () => {
    it('should get the right config associated with the group', () => {
      const config = {
        count: 4,
        maxCountPerLine: 2,
        sideLength: 2,
        startingPosition: 1
      };
      const squaresGroup = new SquaresGroup(config.count, {
        maxCountPerLine: config.maxCountPerLine,
        sideLength: config.sideLength,
        startingPosition: config.startingPosition
      });
      const configRetrieved = squaresGroup.config;

      expect(configRetrieved.maxCountPerLine).to.equal(config.maxCountPerLine);
      expect(configRetrieved.startingPosition).to.equal(config.startingPosition);
      expect(configRetrieved.orientation).to.equal(PolygonsGroupOrientation.HORIZONTAL);
      expect(configRetrieved.sideLength).to.equal(config.sideLength);
    });
    it('should set the config specified and update the group with the new values', () => {

    });
  });
  /*describe('#polygons', () => {
    it('should return the right polygons when the orientation is horizontal', () => {
      const squares = [
        new Square({ x: 0, y: 0 }, 2),
        new Square({ x: 2, y: 0 }, 2),
        new Square({ x: 4, y: 0 }, 2)
      ];
      const squaresGroup = new SquaresGroup({
        count: squares.length,
        maxCountPerLine: 4,
        orientation: PolygonsGroupOrientation.HORIZONTAL,
        sideLength: 2,
        startingPosition: 0
      });
      expect(squaresGroup.count).to.equal(squares.length);
      validatePolygons(squaresGroup.polygons, squares);

      expect(squaresGroup.boundingBox.x).to.equal(0);
      expect(squaresGroup.boundingBox.y).to.equal(0);
      expect(squaresGroup.boundingBox.width).to.equal(6);
      expect(squaresGroup.boundingBox.height).to.equal(2);
    });
    it('should return the right polygons when the starting position is not 0 and the orientation is horizontal', () => {
      const squares = [
        new Square({ x: 4, y: 0 }, 2),
        new Square({ x: 6, y: 0 }, 2),
        new Square({ x: 0, y: 2 }, 2),
        new Square({ x: 2, y: 2 }, 2),
        new Square({ x: 4, y: 2 }, 2),
        new Square({ x: 6, y: 2 }, 2)
      ];
      const squaresGroup = new SquaresGroup({
        count: squares.length,
        maxCountPerLine: 4,
        orientation: PolygonsGroupOrientation.HORIZONTAL,
        sideLength: 2,
        startingPosition: 2
      });
      expect(squaresGroup.count).to.equal(squares.length);
      validatePolygons(squaresGroup.polygons, squares);

      expect(squaresGroup.boundingBox.x).to.equal(0);
      expect(squaresGroup.boundingBox.y).to.equal(0);
      expect(squaresGroup.boundingBox.width).to.equal(8);
      expect(squaresGroup.boundingBox.height).to.equal(4);
    });
    it('should return the right polygons when the position is not (0, 0) and the orientation is horizontal', () => {
      const squares = [
        new Square({ x: 2, y: 2 }, 2),
        new Square({ x: 4, y: 2 }, 2),
        new Square({ x: 6, y: 2 }, 2),
        new Square({ x: 8, y: 2 }, 2),
        new Square({ x: 2, y: 4 }, 2),
        new Square({ x: 4, y: 4 }, 2)
      ];
      const squaresGroup = new SquaresGroup({
        count: squares.length,
        maxCountPerLine: 4,
        orientation: PolygonsGroupOrientation.HORIZONTAL,
        position: { x: 2, y: 2 },
        sideLength: 2,
        startingPosition: 0
      });
      expect(squaresGroup.count).to.equal(squares.length);
      validatePolygons(squaresGroup.polygons, squares);

      expect(squaresGroup.boundingBox.x).to.equal(2);
      expect(squaresGroup.boundingBox.y).to.equal(2);
      expect(squaresGroup.boundingBox.width).to.equal(8);
      expect(squaresGroup.boundingBox.height).to.equal(4);
    });
    it('should return the right polygons when the orientation is vertical', () => {
      const squares = [
        new Square({ x: 0, y: 0 }, 2),
        new Square({ x: 0, y: 2 }, 2),
        new Square({ x: 0, y: 4 }, 2)
      ];
      const squaresGroup = new SquaresGroup({
        count: squares.length,
        maxCountPerLine: 4,
        orientation: PolygonsGroupOrientation.VERTICAL,
        sideLength: 2,
        startingPosition: 0
      });
      expect(squaresGroup.count).to.equal(squares.length);
      validatePolygons(squaresGroup.polygons, squares);

      expect(squaresGroup.boundingBox.x).to.equal(0);
      expect(squaresGroup.boundingBox.y).to.equal(0);
      expect(squaresGroup.boundingBox.width).to.equal(2);
      expect(squaresGroup.boundingBox.height).to.equal(6);
    });
    it('should return the right polygons when the starting position is not 0 and the orientation is vertical', () => {
      const squares = [
        new Square({ x: 0, y: 4 }, 2),
        new Square({ x: 0, y: 6 }, 2),
        new Square({ x: 2, y: 0 }, 2),
        new Square({ x: 2, y: 2 }, 2),
        new Square({ x: 2, y: 4 }, 2),
        new Square({ x: 2, y: 6 }, 2)
      ];
      const squaresGroup = new SquaresGroup({
        count: squares.length,
        maxCountPerLine: 4,
        orientation: PolygonsGroupOrientation.VERTICAL,
        sideLength: 2,
        startingPosition: 2
      });
      expect(squaresGroup.count).to.equal(squares.length);
      validatePolygons(squaresGroup.polygons, squares);

      expect(squaresGroup.boundingBox.x).to.equal(0);
      expect(squaresGroup.boundingBox.y).to.equal(0);
      expect(squaresGroup.boundingBox.width).to.equal(4);
      expect(squaresGroup.boundingBox.height).to.equal(8);
    });
    it('should return the right polygons when the position is not (0, 0) and the orientation is vertical', () => {
      const squares = [
        new Square({ x: 2, y: 2 }, 2),
        new Square({ x: 2, y: 4 }, 2),
        new Square({ x: 2, y: 6 }, 2),
        new Square({ x: 2, y: 8 }, 2),
        new Square({ x: 4, y: 2 }, 2),
        new Square({ x: 4, y: 4 }, 2)
      ];
      const squaresGroup = new SquaresGroup({
        count: squares.length,
        maxCountPerLine: 4,
        orientation: PolygonsGroupOrientation.VERTICAL,
        position: { x: 2, y: 2 },
        sideLength: 2,
        startingPosition: 0
      });
      expect(squaresGroup.count).to.equal(squares.length);
      validatePolygons(squaresGroup.polygons, squares);

      expect(squaresGroup.boundingBox.x).to.equal(2);
      expect(squaresGroup.boundingBox.y).to.equal(2);
      expect(squaresGroup.boundingBox.width).to.equal(4);
      expect(squaresGroup.boundingBox.height).to.equal(8);
    });
  });
  describe('#count', () => {
    it('should do nothing when the new count set is equal to the actual count', () => {
      const squares = [
        new Square({ x: 0, y: 0 }, 2),
        new Square({ x: 2, y: 0 }, 2),
        new Square({ x: 0, y: 2 }, 2),
        new Square({ x: 2, y: 2 }, 2)
      ];
      const squaresGroup = new SquaresGroup({
        count: squares.length,
        maxCountPerLine: 2,
        sideLength: 2
      });
      validateGroup();
      squaresGroup.count = squares.length;
      validateGroup();

      function validateGroup() {
        expect(squaresGroup.count).to.equal(squares.length);
        validatePolygons(squaresGroup.polygons, squares);
        expect(squaresGroup.boundingBox.x).to.equal(0);
        expect(squaresGroup.boundingBox.y).to.equal(0);
        expect(squaresGroup.boundingBox.width).to.equal(4);
        expect(squaresGroup.boundingBox.height).to.equal(4);
      }
    });
    it('should remove extra polygons when the new count set is lower than the actual count', () => {
      let squares = [
        new Square({ x: 0, y: 0 }, 2),
        new Square({ x: 2, y: 0 }, 2),
        new Square({ x: 0, y: 2 }, 2),
        new Square({ x: 2, y: 2 }, 2)
      ];
      const squaresGroup = new SquaresGroup({
        count: squares.length,
        maxCountPerLine: 2,
        sideLength: 2
      });
      expect(squaresGroup.count).to.equal(squares.length);
      squaresGroup.count = 2;
      squares = squares.slice(0, 2);

      expect(squaresGroup.count).to.equal(squares.length);
      validatePolygons(squaresGroup.polygons, squares);
      expect(squaresGroup.boundingBox.x).to.equal(0);
      expect(squaresGroup.boundingBox.y).to.equal(0);
      expect(squaresGroup.boundingBox.width).to.equal(4);
      expect(squaresGroup.boundingBox.height).to.equal(2);
    });
    it('should remove all polygons when the new count set is 0', () => {
      let squares = [
        new Square({ x: 0, y: 0 }, 2),
        new Square({ x: 2, y: 0 }, 2),
        new Square({ x: 0, y: 2 }, 2),
        new Square({ x: 2, y: 2 }, 2)
      ];
      const squaresGroup = new SquaresGroup({
        count: squares.length,
        maxCountPerLine: 2,
        sideLength: 2
      });
      expect(squaresGroup.count).to.equal(squares.length);
      squaresGroup.count = 0;

      expect(squaresGroup.count).to.equal(0);
      validatePolygons(squaresGroup.polygons, []);
      expect(squaresGroup.boundingBox.x).to.equal(0);
      expect(squaresGroup.boundingBox.y).to.equal(0);
      expect(squaresGroup.boundingBox.width).to.equal(0);
      expect(squaresGroup.boundingBox.height).to.equal(0);
    });
    it('should create new polygons when the new count set is higher than the actual count', () => {
      let squares = [
        new Square({ x: 0, y: 0 }, 2),
        new Square({ x: 2, y: 0 }, 2),
        new Square({ x: 0, y: 2 }, 2),
        new Square({ x: 2, y: 2 }, 2)
      ];
      const squaresGroup = new SquaresGroup({
        count: squares.length,
        maxCountPerLine: 2,
        sideLength: 2
      });
      expect(squaresGroup.count).to.equal(squares.length);
      squaresGroup.count = 6;
      squares = squares.concat([
        new Square({ x: 0, y: 4 }, 2),
        new Square({ x: 2, y: 4 }, 2)
      ]);

      expect(squaresGroup.count).to.equal(squares.length);
      validatePolygons(squaresGroup.polygons, squares);
      expect(squaresGroup.boundingBox.x).to.equal(0);
      expect(squaresGroup.boundingBox.y).to.equal(0);
      expect(squaresGroup.boundingBox.width).to.equal(4);
      expect(squaresGroup.boundingBox.height).to.equal(6);
    });
    it('should throw an exception when the count set is invalid', () => {
      const squaresGroup = new SquaresGroup({
        count: 4,
        maxCountPerLine: 2,
        sideLength: 2
      });
      expect(() => squaresGroup.count = -1).to.throw('Invalid count specified.');
    });
  });
  describe('#getSubgroup()', () => {
    it('should get a valid subgroup when the orientation is horizontal', () => {
      const squares = [
        new Square({ x: 0, y: 0 }, 2),
        new Square({ x: 2, y: 0 }, 2),
        new Square({ x: 4, y: 0 }, 2),
        new Square({ x: 6, y: 0 }, 2),
        new Square({ x: 0, y: 2 }, 2),
        new Square({ x: 2, y: 2 }, 2)
      ];
      const squaresGroup = new SquaresGroup({
        count: squares.length,
        maxCountPerLine: 4,
        orientation: PolygonsGroupOrientation.HORIZONTAL,
        sideLength: 2,
        startingPosition: 0
      });
      expect(squaresGroup.count).to.equal(squares.length);

      const subgroup = squaresGroup.getSubgroup(2, 4);

      expect(subgroup.count).to.equal(2);
      validatePolygons(subgroup.polygons, squares.slice(2, 4));
      expect(subgroup.boundingBox.x).to.equal(4);
      expect(subgroup.boundingBox.y).to.equal(0);
      expect(subgroup.boundingBox.width).to.equal(4);
      expect(subgroup.boundingBox.height).to.equal(2);
    });
    it('should get a valid subgroup when the orientation is vertical', () => {
      const squares = [
        new Square({ x: 0, y: 0 }, 2),
        new Square({ x: 0, y: 2 }, 2),
        new Square({ x: 0, y: 4 }, 2),
        new Square({ x: 2, y: 0 }, 2),
        new Square({ x: 2, y: 2 }, 2),
        new Square({ x: 2, y: 4 }, 2)
      ];
      const squaresGroup = new SquaresGroup({
        count: squares.length,
        maxCountPerLine: 3,
        orientation: PolygonsGroupOrientation.VERTICAL,
        sideLength: 2,
        startingPosition: 0
      });
      expect(squaresGroup.count).to.equal(squares.length);

      const subgroup = squaresGroup.getSubgroup(1, 3);

      expect(subgroup.count).to.equal(2);
      validatePolygons(subgroup.polygons, squares.slice(1, 3));
      expect(subgroup.boundingBox.x).to.equal(0);
      expect(subgroup.boundingBox.y).to.equal(2);
      expect(subgroup.boundingBox.width).to.equal(2);
      expect(subgroup.boundingBox.height).to.equal(4);
    });
    it('should throw an exception if the start position is invalid', () => {
      const squaresGroup = new SquaresGroup({
        count: 4,
        maxCountPerLine: 2,
        sideLength: 2
      });
      expect(() => squaresGroup.getSubgroup(-1, 2)).to.throw('Invalid start position specified.');
    });
    it('should throw an exception if the end position is invalid', () => {
      const squaresGroup = new SquaresGroup({
        count: 4,
        maxCountPerLine: 2,
        sideLength: 2
      });
      expect(() => squaresGroup.getSubgroup(2, -1)).to.throw('Invalid end position specified.');
    });
    it('should throw an exception if the range is invalid', () => {
      const squaresGroup = new SquaresGroup({
        count: 4,
        maxCountPerLine: 2,
        sideLength: 2
      });
      expect(() => squaresGroup.getSubgroup(2, 1)).to.throw('Invalid range specified.');
    });
  });
  describe('#reset()', () => {
    it('should do nothing when the initial starting position is not changed', () => {
      const squares = [
        new Square({ x: 0, y: 0 }, 2),
        new Square({ x: 2, y: 0 }, 2),
        new Square({ x: 4, y: 0 }, 2)
      ];
      const squaresGroup = new SquaresGroup({
        count: squares.length,
        maxCountPerLine: 4,
        sideLength: 2
      });
      expect(squaresGroup.count).to.equal(squares.length);

      squaresGroup.reset();

      expect(squaresGroup.count).to.equal(squares.length);
      validatePolygons(squaresGroup.polygons, squares);
      expect(squaresGroup.boundingBox.x).to.equal(0);
      expect(squaresGroup.boundingBox.y).to.equal(0);
      expect(squaresGroup.boundingBox.width).to.equal(6);
      expect(squaresGroup.boundingBox.height).to.equal(2);
    });
    it('should reset the group to the initial position when the starting position is not equal to the initial', () => {
      const squares = [
        new Square({ x: 16, y: 0 }, 2),
        new Square({ x: 18, y: 0 }, 2)
      ];
      const squaresGroup = new SquaresGroup({
        count: squares.length,
        maxCountPerLine: 10,
        sideLength: 2,
        startingPosition: 8
      });
      expect(squaresGroup.count).to.equal(squares.length);

      squaresGroup.reshape(2);
      squaresGroup.reset();

      expect(squaresGroup.count).to.equal(squares.length);
      validatePolygons(squaresGroup.polygons, squares);
      expect(squaresGroup.boundingBox.x).to.equal(16);
      expect(squaresGroup.boundingBox.y).to.equal(0);
      expect(squaresGroup.boundingBox.width).to.equal(4);
      expect(squaresGroup.boundingBox.height).to.equal(2);
    });
  });
  describe('#reshape()', () => {
    it('should do nothing when the new starting position is equal to the actual position', () => {
      const squares = [
        new Square({ x: 0, y: 0 }, 2),
        new Square({ x: 2, y: 0 }, 2),
        new Square({ x: 4, y: 0 }, 2),
        new Square({ x: 6, y: 0 }, 2),
        new Square({ x: 0, y: 2 }, 2),
        new Square({ x: 2, y: 2 }, 2)
      ];
      const squaresGroup = new SquaresGroup({
        count: squares.length,
        maxCountPerLine: 4,
        sideLength: 2
      });
      expect(squaresGroup.count).to.equal(squares.length);
      squaresGroup.reshape();

      expect(squaresGroup.count).to.equal(squares.length);
      validatePolygons(squaresGroup.polygons, squares);
      expect(squaresGroup.boundingBox.x).to.equal(0);
      expect(squaresGroup.boundingBox.y).to.equal(0);
      expect(squaresGroup.boundingBox.width).to.equal(8);
      expect(squaresGroup.boundingBox.height).to.equal(4);
    });
    it('should reshape the group correctly when the starting position specified is lower than the actual', () => {
      const squares = [
        new Square({ x: 2, y: 0 }, 2),
        new Square({ x: 4, y: 0 }, 2),
        new Square({ x: 6, y: 0 }, 2),
        new Square({ x: 0, y: 2 }, 2),
        new Square({ x: 2, y: 2 }, 2),
        new Square({ x: 4, y: 2 }, 2)
      ];
      const squaresGroup = new SquaresGroup({
        count: squares.length,
        maxCountPerLine: 4,
        sideLength: 2,
        startingPosition: 3
      });
      expect(squaresGroup.count).to.equal(squares.length);
      squaresGroup.reshape(1);

      expect(squaresGroup.count).to.equal(squares.length);
      validatePolygons(squaresGroup.polygons, squares);
      expect(squaresGroup.boundingBox.x).to.equal(0);
      expect(squaresGroup.boundingBox.y).to.equal(0);
      expect(squaresGroup.boundingBox.width).to.equal(8);
      expect(squaresGroup.boundingBox.height).to.equal(4);
    });
    it('should reshape the group correctly when the starting position specified is higher than the actual', () => {
      const squares = [
        new Square({ x: 4, y: 0 }, 2),
        new Square({ x: 6, y: 0 }, 2),
        new Square({ x: 0, y: 2 }, 2),
        new Square({ x: 2, y: 2 }, 2),
        new Square({ x: 4, y: 2 }, 2),
        new Square({ x: 6, y: 2 }, 2)
      ];
      const squaresGroup = new SquaresGroup({
        count: squares.length,
        maxCountPerLine: 4,
        sideLength: 2,
        startingPosition: 1
      });
      expect(squaresGroup.count).to.equal(squares.length);
      squaresGroup.reshape(2);

      expect(squaresGroup.count).to.equal(squares.length);
      validatePolygons(squaresGroup.polygons, squares);
      expect(squaresGroup.boundingBox.x).to.equal(0);
      expect(squaresGroup.boundingBox.y).to.equal(0);
      expect(squaresGroup.boundingBox.width).to.equal(8);
      expect(squaresGroup.boundingBox.height).to.equal(4);
    });
    it('should reshape the group correctly when the group is smaller than the shift to do', () => {
      const squares = [
        new Square({ x: 0, y: 0 }, 2),
        new Square({ x: 2, y: 0 }, 2)
      ];
      const squaresGroup = new SquaresGroup({
        count: squares.length,
        maxCountPerLine: 4,
        sideLength: 2,
        startingPosition: 2
      });
      expect(squaresGroup.count).to.equal(squares.length);
      squaresGroup.reshape(0);

      expect(squaresGroup.count).to.equal(squares.length);
      validatePolygons(squaresGroup.polygons, squares);
      expect(squaresGroup.boundingBox.x).to.equal(0);
      expect(squaresGroup.boundingBox.y).to.equal(0);
      expect(squaresGroup.boundingBox.width).to.equal(4);
      expect(squaresGroup.boundingBox.height).to.equal(2);
    });
    it('should throw an exception if the starting position is invalid', () => {
      const squaresGroup = new SquaresGroup({
        count: 4,
        maxCountPerLine: 2,
        sideLength: 2
      });
      expect(() => squaresGroup.reshape(-1)).to.throw('Invalid starting position specified.');
      expect(() => squaresGroup.reshape(2)).to.throw('Invalid starting position specified.');
    });
  });*/
});
