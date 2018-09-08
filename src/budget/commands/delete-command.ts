import { BudgetElement } from '../budget-element';
import { Layout } from '../layouts/layout';
import { RenderingVisitor } from '../visitors/rendering-visitor';

import { UndoableCommand } from './command';

export class DeleteCommand implements UndoableCommand {
  readonly amount: number;
  readonly element: BudgetElement;

  private readonly _rendering: RenderingVisitor;
  private readonly _layout: Layout;

  constructor(element: BudgetElement, rendering: RenderingVisitor, layout: Layout) {
    this.amount = Math.abs(element.temporaryAmount);
    this.element = element;
    this._rendering = rendering;
    this._layout = layout;
  }

  execute() {
    this.element.temporaryAmount = 0;
    this.element.amount -= this.amount;
    this.update();
  }

  undo() {
    this.element.amount += this.amount;
    this.update();
  }

  private update() {
    this._rendering.transitionDuration = 0;
    this.element.accept(this._rendering);
    this._rendering.resetTransitionDuration();

    const root = this.element.root;
    if (this.element !== root) {
      root.accept(this._rendering);
    }
    this._layout.render();
  }
}
