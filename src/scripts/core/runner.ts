import { mountAll, unmountAll } from "./behaviors";
import { on } from "./lifecycle";
import {
    startAppServices,
    startPageServices,
    stopPageServices,
} from "./services";

on("page:enter", async () => {
    await startPageServices();
    await mountAll();
});

on("page:leave", async () => {
    unmountAll();
    stopPageServices();
});

on("app:ready", async () => {
    await startAppServices();
});
