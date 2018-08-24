export interface Command {
  execute();
}

export interface UndoableCommand extends Command {
  undo();
}

export function isCommand(command: any): command is Command {
  return command !== undefined && command.execute !== undefined;
}

export function isUndoableCommand(command: any): command is UndoableCommand {
  return isCommand(command) && (command as any).undo !== undefined;
}
