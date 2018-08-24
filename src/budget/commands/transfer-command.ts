import { BudgetElement } from '../budget-element';
import { Layout } from '../layouts/layout';
import { RenderingVisitor } from '../visitors/rendering-visitor';

import { UndoableCommand } from './command';

export class TransferCommand implements UndoableCommand {
  private readonly _amount: number;
  private readonly _source: BudgetElement;
  private readonly _destination: BudgetElement;
  private readonly _renderingVisitor: RenderingVisitor;
  private readonly _layout: Layout;
  private _isFirstTime = true;

  constructor(source: BudgetElement, destination: BudgetElement, renderingVisitor: RenderingVisitor, layout: Layout) {
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

  private update() {
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
