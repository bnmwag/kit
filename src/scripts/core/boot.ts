import { emit } from "./lifecycle";

export const boot = async (): Promise<void> => {
    await emit("page:enter");
    document.documentElement.classList.add("is-ready");
    await emit("app:ready");
};
