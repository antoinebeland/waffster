import { expect } from 'chai';
import 'mocha';

import {
  isPolygonsGroupConfig1, isPolygonsGroupConfig2, PolygonsGroupOrientation
} from '../../src/geometry/polygons-group-configs';

describe('isPolygonsGroupConfig1 function', () => {
  it('should indicate that the instances specified is a valid configuration', () => {
    expect(isPolygonsGroupConfig1({
      count: 1,
      maxCountPerLine: 1,
      sideLength: 1
    })).to.equal(true);

    expect(isPolygonsGroupConfig1({
      count: 1,
      maxCountPerLine: 1,
      orientation: PolygonsGroupOrientation.HORIZONTAL,
      sideLength: 1
    })).to.equal(true);

    expect(isPolygonsGroupConfig1({
      count: 1,
      maxCountPerLine: 1,
      position: { x: 1, y: 1 },
      sideLength: 1
    })).to.equal(true);

    expect(isPolygonsGroupConfig1({
      count: 1,
      maxCountPerLine: 2,
      sideLength: 1,
      startingPosition: 1
    })).to.equal(true);
  });
  it('should indicate that the instances specified is an invalid configuration', () => {
    expect(isPolygonsGroupConfig1(undefined)).to.equal(false);
    expect(isPolygonsGroupConfig1({})).to.equal(false);

    expect(isPolygonsGroupConfig1({
      count: -1,
      maxCountPerLine: 1,
      sideLength: 1
    })).to.equal(false);

    expect(isPolygonsGroupConfig1({
      count: 1,
      maxCountPerLine: 0,
      sideLength: 1
    })).to.equal(false);

    expect(isPolygonsGroupConfig1({
      count: 1,
      maxCountPerLine: 1,
      sideLength: 0
    })).to.equal(false);

    expect(isPolygonsGroupConfig1({
      count: 1,
      maxCountPerLine: 1,
      orientation: 'invalid',
      sideLength: 1
    })).to.equal(false);

    expect(isPolygonsGroupConfig1({
      count: 1,
      maxCountPerLine: 1,
      position: {},
      sideLength: 1
    })).to.equal(false);

    expect(isPolygonsGroupConfig1({
      count: 1,
      maxCountPerLine: 2,
      sideLength: 1,
      startingPosition: 2
    })).to.equal(false);
  });
});

describe('isPolygonsGroupConfig2 function', () => {
  it('should indicate that the instances specified is a valid configuration', () => {
    expect(isPolygonsGroupConfig2({
      maxCountPerLine: 2,
      polygons: [],
      sideLength: 1,
      startingPosition: 1
    })).to.equal(true);

    expect(isPolygonsGroupConfig2({
      maxCountPerLine: 1,
      orientation: PolygonsGroupOrientation.VERTICAL,
      polygons: [],
      sideLength: 1,
      startingPosition: 0
    })).to.equal(true);

    expect(isPolygonsGroupConfig2({
      maxCountPerLine: 2,
      polygons: [],
      position: {
        x: 1,
        y: 1
      },
      sideLength: 1,
      startingPosition: 1
    })).to.equal(true);
  });
  it('should indicate that the instances specified is an invalid configuration', () => {
    expect(isPolygonsGroupConfig2(undefined)).to.equal(false);
    expect(isPolygonsGroupConfig2({})).to.equal(false);

    expect(isPolygonsGroupConfig2({
      maxCountPerLine: 0,
      polygons: [],
      sideLength: 1,
      startingPosition: 0
    })).to.equal(false);

    expect(isPolygonsGroupConfig2({
      maxCountPerLine: 1,
      polygons: {},
      sideLength: 1,
      startingPosition: 0
    })).to.equal(false);

    expect(isPolygonsGroupConfig2({
      maxCountPerLine: 1,
      polygons: [],
      sideLength: 0,
      startingPosition: 0
    })).to.equal(false);

    expect(isPolygonsGroupConfig2({
      maxCountPerLine: 1,
      polygons: [],
      sideLength: 1,
      startingPosition: 1
    })).to.equal(false);

    expect(isPolygonsGroupConfig2({
      maxCountPerLine: 1,
      orientation: 'invalid',
      polygons: [],
      sideLength: 1,
      startingPosition: 1
    })).to.equal(false);

    expect(isPolygonsGroupConfig2({
      maxCountPerLine: 1,
      polygons: [],
      position: {},
      sideLength: 1,
      startingPosition: 0
    })).to.equal(false);
  });
});
