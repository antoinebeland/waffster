import { Event } from '../../utils/event';

import { isUndoableCommand, Command, UndoableCommand } from './command';

export class CommandInvoker {
  onCommandInvoked: Event<void> = new Event<void>();

  private _commands: UndoableCommand[] = [];
  private _currentIndex = -1;

  get canUndo(): boolean {
    return this._commands.length >= 1 && this._currentIndex >= 0;
  }

  get canRedo(): boolean {
    return this._commands.length >= 1 && this._currentIndex < this._commands.length - 1;
  }

  undo() {
    if (this.canUndo) {
      this._commands[this._currentIndex--].undo();
      this.onCommandInvoked.invoke();
    }
  }

  redo() {
    if (this.canRedo) {
      this._commands[++this._currentIndex].execute();
      this.onCommandInvoked.invoke();
    }
  }

  invoke(command: Command, isSavingCommand = true) {
    if (isSavingCommand && isUndoableCommand(command)) {
      this._commands = this._commands.slice(0, ++this._currentIndex);
      this._commands.push(command);
    }
    command.execute();
    this.onCommandInvoked.invoke();
  }
}
