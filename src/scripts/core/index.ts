import "./runner";

export { boot } from "./boot";
export { emit, on } from "./lifecycle";
export { defineBehavior } from "./behaviors";
export { defineService } from "./services";
export { awaitEntrance, releaseEntrance } from "./entrance";
export type {
    IBehaviorConfig,
    ILifecycleEvent,
    IServiceConfig,
} from "./types";
