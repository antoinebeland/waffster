import { expect } from 'chai';
import 'mocha';

import { isPolygonsGroupConfig, PolygonsGroupOrientation } from '../../src/geometry/polygons-group-configs';

describe('isPolygonsGroupConfig1 function', () => {
  it('should indicate that the instances specified is a valid configuration', () => {
    expect(isPolygonsGroupConfig({
      maxCountPerLine: 1,
      sideLength: 1
    })).to.equal(true);

    expect(isPolygonsGroupConfig({
      maxCountPerLine: 1,
      orientation: PolygonsGroupOrientation.HORIZONTAL,
      sideLength: 1
    })).to.equal(true);

    expect(isPolygonsGroupConfig({
      maxCountPerLine: 1,
      sideLength: 1,
    })).to.equal(true);

    expect(isPolygonsGroupConfig({
      maxCountPerLine: 2,
      sideLength: 1,
      startingPosition: 1
    })).to.equal(true);
  });
  it('should indicate that the instances specified is an invalid configuration', () => {
    expect(isPolygonsGroupConfig(undefined)).to.equal(false);
    expect(isPolygonsGroupConfig({})).to.equal(false);

    expect(isPolygonsGroupConfig({
      maxCountPerLine: 0,
      sideLength: 1
    })).to.equal(false);

    expect(isPolygonsGroupConfig({
      maxCountPerLine: 1,
      sideLength: 0
    })).to.equal(false);

    expect(isPolygonsGroupConfig({
      maxCountPerLine: 1,
      orientation: 'invalid',
      sideLength: 1
    })).to.equal(false);

    expect(isPolygonsGroupConfig({
      maxCountPerLine: 2,
      sideLength: 1,
      startingPosition: 2
    })).to.equal(false);
  });
});
