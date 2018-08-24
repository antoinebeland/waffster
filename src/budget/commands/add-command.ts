import { BudgetElement } from '../budget-element';
import { Layout } from '../layouts/layout';
import { RenderingVisitor } from '../visitors/rendering-visitor';

import { UndoableCommand } from './command';

export class AddCommand implements UndoableCommand {
  private readonly _element: BudgetElement;
  private readonly _amount: number;
  private readonly _rendering: RenderingVisitor;
  private readonly _layout: Layout;
  private _isFirstTime = true;

  constructor(element: BudgetElement, rendering: RenderingVisitor, layout: Layout) {
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

  private update() {
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
