/*import { expect } from 'chai';
import * as d3 from 'd3';
import 'mocha';

import { BudgetElementGroup } from '../../src/budget/budget-element-group';
import { SimpleBudgetElement } from '../../src/budget/simple-budget-element';
import { Random } from '../../src/utils/random';

describe('BudgetElementGroup class', () => {
  describe('#constructor()', () => {
    it('should initialize the group correctly when no name was specified', () => {
      const group = new BudgetElementGroup();

      expect(group.name).to.equal('');
      expect(group.children.length).to.equal(0);
    });
    it('should initialize the group correctly when a name was specified', () => {
      const name = 'Group\'s name';
      const group = new BudgetElementGroup(name);

      expect(group.name).to.equal(name);
      expect(group.children.length).to.equal(0);
    });
  });
  describe('#amount', () => {
    it('should return 0 when the group has no child', () => {
      const group = new BudgetElementGroup();
      expect(group.amount).to.equal(0);
    });
    it('should return the sum of children\'s amount', () => {
      const amounts = d3.range(Random.getRandomIntInclusive(2, 5))
        .map(() => Random.getRandomIntInclusive(1, 20));
      const total = amounts.reduce((total, amount) => total + amount, 0);

      const group = new BudgetElementGroup();
      amounts.forEach(a => group.addChild(new SimpleBudgetElement(a)));

      expect(group.children.length).to.equal(amounts.length);
      expect(group.amount).to.equal(total);
    });
    it('should set nothing when the group has no child', () => {
      const group = new BudgetElementGroup();
      group.amount = Random.getRandomIntInclusive(1, 100);
      expect(group.amount).to.equal(0);
    });
    it('should set a proportional amount to his children when the initial amount is not 0', () => {
      const expectedAmount = [ 125, 100, 25 ];
      const group = new BudgetElementGroup();
      group.addChild(new SimpleBudgetElement(10));
      group.addChild(new SimpleBudgetElement(40));
      group.addChild(new SimpleBudgetElement(50));

      expect(group.amount).to.equal(100);
      group.amount = 250;
      expect(group.amount).to.equal(250);
      group.children.forEach((c, i) => {
        expect(c.amount).to.equal(expectedAmount[i]);
      });
    });
    it('should set a proportional amount to his children when the initial amount is 0', () => {
      const group = new BudgetElementGroup();
      group.addChild(new SimpleBudgetElement(0));
      group.addChild(new SimpleBudgetElement(0));
      group.addChild(new SimpleBudgetElement(0));

      expect(group.amount).to.equal(0);
      group.amount = 120;
      expect(group.amount).to.equal(120);
      group.children.forEach(c => {
        expect(c.amount).to.equal(40);
      });
    });
  });
  describe('#activeLevel', () => {
    it('should return 0 when the active level is not modified', () => {
      const group = new BudgetElementGroup();
      expect(group.activeLevel).to.equal(0);
    });
    it('should set the new active level to his children', () => {
      const group = new BudgetElementGroup();
      group.addChild(new SimpleBudgetElement(Random.getRandomIntInclusive(1, 100)));
      group.addChild(new SimpleBudgetElement(Random.getRandomIntInclusive(1, 100)));
      group.addChild(new SimpleBudgetElement(Random.getRandomIntInclusive(1, 100)));

      expect(group.children.length).to.equal(3);
      expect(group.activeLevel).to.equal(0);
      group.children.forEach(c => {
        expect(c.activeLevel).to.equal(0);
      });

      group.activeLevel = 1;
      expect(group.activeLevel).to.equal(1);
      group.children.forEach(c => {
        expect(c.activeLevel).to.equal(1);
      });
    });
    it('should throw an exception when the specified level is invalid', () => {
      const group = new BudgetElementGroup();
      expect(() => group.activeLevel = -1).to.throw('Invalid level specified.');
    });
  });
  describe('#level', () => {
    it('should return 0 for the base group', () => {
      const group = new BudgetElementGroup();
      expect(group.level).to.equal(0);
    });
    it('should set the right level to his children', () => {
      const baseLevel = Random.getRandomInt(1, 100);
      const group = new BudgetElementGroup();
      group.addChild(new SimpleBudgetElement(Random.getRandomIntInclusive(1, 100)));
      group.addChild(new SimpleBudgetElement(Random.getRandomIntInclusive(1, 100)));

      // When the base level is 0.
      group.children.forEach(c => {
        expect(c.level).to.equal(1);
      });
      group.level = baseLevel;

      expect(group.level).to.equal(baseLevel);
      group.children.forEach(c => {
        expect(c.level).to.equal(baseLevel + 1);
      });
      it('should throw an exception when the specified level is invalid', () => {
        const group = new BudgetElementGroup();
        expect(() => group.level = -1).to.throw('Invalid level specified.');
      });
    });
  });
  describe('#render()', () => {
    // TODO
    //it('should', () => {

    //});
  });
  describe('#addChild()', () => {
    it('should add a new child to the group', () => {
      const children = d3.range(Random.getRandomIntInclusive(2, 5))
        .map(() => new SimpleBudgetElement(Random.getRandomIntInclusive(1, 100)))
        .sort((a, b) => d3.descending(a.amount, b.amount));

      const group = new BudgetElementGroup();
      expect(group.children.length).to.equal(0);

      children.forEach(c => group.addChild(c));
      expect(group.children.length).to.equal(group.children.length);
      group.children.forEach((c, i) => {
        expect(c).equal(children[i]);
      });
    });
  });
  describe('#removeChild()', () => {
    it('should remove the specified child to the group', () => {

    });
  });
});
*/
