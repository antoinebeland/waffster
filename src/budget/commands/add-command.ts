import { BudgetElement } from '../budget-element';
import { Layout } from '../layouts/layout';
import { RenderingVisitor } from '../visitors/rendering-visitor';

import { UndoableCommand } from './command';

export class AddCommand implements UndoableCommand {
  readonly element: BudgetElement;
  readonly amount: number;

  private readonly _rendering: RenderingVisitor;
  private readonly _layout: Layout;
  private _isFirstTime = true;

  constructor(element: BudgetElement, rendering: RenderingVisitor, layout: Layout) {
    this.amount = element.temporaryAmount;
    this.element = element;
    this._rendering = rendering;
    this._layout = layout;
  }

  execute() {
    this.element.temporaryAmount = 0;
    this.element.amount += this.amount;
    this.update();
  }

  undo() {
    this.element.amount -= this.amount;
    this.update();
  }

  private update() {
    this.element.selectedAmount = 0;
    this._rendering.transitionDuration = 0;
    this.element.accept(this._rendering);
    this._rendering.resetTransitionDuration();

    if (this._isFirstTime) {
      this.element.selectedAmount = this.amount;
    }
    const root = this.element.root;
    if (this._isFirstTime || root !== this.element) {
      root.accept(this._rendering);
    }
    this._layout.render();
    this._isFirstTime = false;
  }
}
