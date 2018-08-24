import { BudgetElement } from '../budget-element';
import { Layout } from '../layouts/layout';
import { RenderingVisitor } from '../visitors/rendering-visitor';

import { UndoableCommand } from './command';

export class DeleteCommand implements UndoableCommand {
  private readonly _amount: number;
  private readonly _element: BudgetElement;
  private readonly _rendering: RenderingVisitor;
  private readonly _layout: Layout;

  constructor(element: BudgetElement, rendering: RenderingVisitor, layout: Layout) {
    this._amount = Math.abs(element.temporaryAmount);
    this._element = element;
    this._rendering = rendering;
    this._layout = layout;
  }

  execute() {
    this._element.temporaryAmount = 0;
    this._element.amount -= this._amount;
    this.update();
  }

  undo() {
    this._element.amount += this._amount;
    this.update();
  }

  private update() {
    this._rendering.transitionDuration = 0;
    this._element.accept(this._rendering);
    this._rendering.resetTransitionDuration();

    const root = this._element.root;
    if (this._element !== root) {
      root.accept(this._rendering);
    }
    this._layout.render();
  }
}
