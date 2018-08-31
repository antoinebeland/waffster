import { Event } from '../../utils/event';
import { Command } from './command';
export declare class CommandInvoker {
    onCommandInvoked: Event<void>;
    private _commands;
    private _currentIndex;
    readonly canUndo: boolean;
    readonly canRedo: boolean;
    undo(): void;
    redo(): void;
    invoke(command: Command, isSavingCommand?: boolean): void;
}
