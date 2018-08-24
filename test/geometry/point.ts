import { expect } from 'chai';
import 'mocha';

import { isPoint } from '../../src/geometry/point';

describe('isPoint function', () => {
  it('should indicate that the instances specified is a point.', () => {
    expect(isPoint({ x: 10, y: 10 })).to.equal(true);
    expect(isPoint({ x: -10, y: -10 })).to.equal(true);
  });
  it('should indicate that the instances specified is not a point.', () => {
    expect(isPoint(undefined)).to.equal(false);
    expect(isPoint({})).to.equal(false);
    expect(isPoint({ x: 10 })).to.equal(false);
    expect(isPoint({ y: 10 })).to.equal(false);
    expect(isPoint({ x: 'invalid', y: 10 })).to.equal(false);
    expect(isPoint({ x: -10, y: 'invalid' })).to.equal(false);
    expect(isPoint({ x: 'invalid', y: 'invalid' })).to.equal(false);
  });
});
