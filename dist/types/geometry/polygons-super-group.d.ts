import { AbstractPolygonsGroup } from './abstract-polygons-group';
import { Polygon } from './polygon';
import { PolygonsGroupConfig } from './polygons-group-configs';
export declare class PolygonsSuperGroup extends AbstractPolygonsGroup {
    private readonly _children;
    private _isMutable;
    private _spacing;
    private _state;
    constructor(config: PolygonsGroupConfig, spacing: number);
    count: number;
    isMutable: boolean;
    readonly invariableCount: number;
    readonly polygons: Polygon[];
    temporaryCount: number;
    readonly children: AbstractPolygonsGroup[];
    spacing: number;
    reshape(startingPosition?: number): void;
    addGroup(group: AbstractPolygonsGroup): void;
    removeGroup(group: AbstractPolygonsGroup): void;
    collapse(): void;
    expand(): void;
    update(): void;
    private updateBoundingBox;
}
