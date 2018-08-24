import { expect } from 'chai';
import 'mocha';

import { BoundingBox } from '../../src/geometry/bounding-box';

describe('BoundingBox class', () => {
  describe('#constructor()', () => {
    it('should initializes the bounding box with the default values', () => {
      const x = 0;
      const y = 0;
      const width = 0;
      const height = 0;
      const boundingBox = new BoundingBox();

      expect(boundingBox.height).to.equal(height);
      expect(boundingBox.width).to.equal(width);

      expect(boundingBox.x).to.equal(x);
      expect(boundingBox.position.x).to.equal(x);

      expect(boundingBox.y).to.equal(y);
      expect(boundingBox.position.y).to.equal(y);
    });
    it('should initializes the bounding box correctly', () => {
      const x = 5;
      const y = 10;
      const width = 20;
      const height = 10;
      const boundingBox = new BoundingBox({ x: x, y: y }, width, height);

      expect(boundingBox.height).to.equal(height);
      expect(boundingBox.width).to.equal(width);

      expect(boundingBox.x).to.equal(x);
      expect(boundingBox.position.x).to.equal(x);

      expect(boundingBox.y).to.equal(y);
      expect(boundingBox.position.y).to.equal(y);
    });
    it('should throw an error if the specified width is invalid', () => {
      const x = 5;
      const y = 10;
      const width = -20;
      const height = 10;
      expect(() => new BoundingBox({ x: x, y: y }, width, height)).to.throw('Invalid width specified.');
    });
    it('should throw an error if the specified height is invalid', () => {
      const x = 5;
      const y = 10;
      const width = 20;
      const height = -10;
      expect(() => new BoundingBox({ x: x, y: y }, width, height)).to.throw('Invalid height specified.');
    });
  });
  describe('#isInto()', () => {
    it('should that the specified points are into the bounding box', () => {
      const x = 5;
      const y = 10;
      const width = 20;
      const height = 10;
      const boundingBox = new BoundingBox({ x: x, y: y }, width, height);

      expect(boundingBox.isInto({ x: x, y: y })).to.equal(true);
      expect(boundingBox.isInto({ x: x + width, y: y })).to.equal(true);
      expect(boundingBox.isInto({ x: x, y: y + height })).to.equal(true);
      expect(boundingBox.isInto({ x: x + width, y: y + height })).to.equal(true);
      expect(boundingBox.isInto({ x: x + width / 2, y: y + height / 2 })).to.equal(true);
    });
    it('should that the specified points are outside the bounding box', () => {
      const delta = 0.0001;
      const x = 5;
      const y = 10;
      const width = 20;
      const height = 10;
      const boundingBox = new BoundingBox({ x: x, y: y }, width, height);

      expect(boundingBox.isInto({ x: x - delta, y: y })).to.equal(false);
      expect(boundingBox.isInto({ x: x + width, y: y - delta })).to.equal(false);
      expect(boundingBox.isInto({ x: x, y: y + height + delta })).to.equal(false);
      expect(boundingBox.isInto({ x: x + width + delta, y: y + height })).to.equal(false);
    });
  });
  describe('#toString()', () => {
    it('should return a string with the values of the bounding box', () => {
      const x = 5;
      const y = 10;
      const width = 20;
      const height = 10;
      const boundingBox = new BoundingBox({ x: x, y: y }, width, height);
      expect(boundingBox.toString()).to.equal(`x: ${x} y: ${y} width: ${width} height: ${height}`);
    });
  });
});
