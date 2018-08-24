import { expect } from 'chai';
import 'mocha';

import { isPoint, Point } from '../../src/geometry/point';
import { Square } from '../../src/geometry/square';

function validatePosition(actualPosition: Point, expectedPosition: Point) {
  expect(isPoint(actualPosition)).to.equal(true);
  expect(actualPosition.x).to.equal(expectedPosition.x);
  expect(actualPosition.y).to.equal(expectedPosition.y);
}

describe('Square class', () => {
  describe('#constructor()', () => {
    it('should initialize a square correctly', () => {
      const position = {
        x: 1,
        y: 1
      };
      const sideLength = 2;
      const square = new Square(position, sideLength);
      expect(square.id).to.equal(0);
      expect(square.boundingBox.position.x).to.equal(position.x);
      expect(square.boundingBox.position.y).to.equal(position.y);
      expect(square.boundingBox.width).to.equal(sideLength);
      expect(square.boundingBox.height).to.equal(sideLength);
    });
    it('should throw an exception when the specified side length is invalid', () => {
      expect(() => new Square({ x: 1, y: 1 }, -1)).to.throw('The specified side length is invalid.');
    });
  });
  describe('#points', () => {
    it('should return the points in clockwise order', () => {
      const position = {
        x: 1,
        y: 1
      };
      const sideLength = 2;
      const square = new Square(position, sideLength);
      expect(square.points.length).to.equal(4);
      validatePosition(square.points[0], { x: 1, y: 1 });
      validatePosition(square.points[1], { x: 3, y: 1 });
      validatePosition(square.points[2], { x: 3, y: 3 });
      validatePosition(square.points[3], { x: 1, y: 3 });
    });
  });
  describe('#position', () => {
    it('should get the right position', () => {
      const position = {
        x: 1,
        y: 1
      };
      const sideLength = 2;
      const square = new Square(position, sideLength);
      expect(square.position.x).to.equal(position.x);
      expect(square.position.y).to.equal(position.y);
    });
    it('should set the right position and update the square', () => {
      const position = {
        x: 1,
        y: 1
      };
      const newPosition = {
        x: 2,
        y: 2
      };
      const sideLength = 2;
      const square = new Square(position, sideLength);
      square.position = newPosition;
      expect(square.position.x).to.equal(newPosition.x);
      expect(square.position.y).to.equal(newPosition.y);

      expect(square.boundingBox.position.x).to.equal(newPosition.x);
      expect(square.boundingBox.position.y).to.equal(newPosition.y);
      expect(square.boundingBox.width).to.equal(sideLength);
      expect(square.boundingBox.height).to.equal(sideLength);

      expect(square.points.length).to.equal(4);
      validatePosition(square.points[0], { x: 2, y: 2 });
      validatePosition(square.points[1], { x: 4, y: 2 });
      validatePosition(square.points[2], { x: 4, y: 4 });
      validatePosition(square.points[3], { x: 2, y: 4 });
    });
  });
});
