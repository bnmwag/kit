let isPending = false;
let releaseFn: () => void = () => {};
let gatePromise: Promise<void> = Promise.resolve();

const init = () => {
    if (typeof document === "undefined") return;
    if (!document.querySelector("[data-preloader]")) return;
    isPending = true;
    gatePromise = new Promise<void>((resolve) => {
        releaseFn = resolve;
    });
};

init();

export const releaseEntrance = (): void => {
    if (!isPending) return;
    isPending = false;
    releaseFn();
};

export const awaitEntrance = async (delaySeconds = 0): Promise<void> => {
    const wasPending = isPending;
    await gatePromise;
    if (wasPending && delaySeconds > 0) {
        await new Promise<void>((resolve) =>
            setTimeout(resolve, delaySeconds * 1000),
        );
    }
};
