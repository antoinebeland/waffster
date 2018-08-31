export interface Command {
    execute(): any;
}
export interface UndoableCommand extends Command {
    undo(): any;
}
export declare function isCommand(command: any): command is Command;
export declare function isUndoableCommand(command: any): command is UndoableCommand;
