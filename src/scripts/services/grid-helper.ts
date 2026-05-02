import { defineService } from "@/scripts/core";

if (import.meta.env.DEV) {
    defineService({
        name: "grid-helper",
        scope: "app",
        async setup() {
            const { default: GridHelper } = await import(
                "@locomotivemtl/grid-helper"
            );
            new GridHelper({
                columns: "var(--grid-columns)",
                gutterWidth: "var(--spacing-grid-gutter)",
                marginWidth: "var(--spacing-grid-margin)",
            });
        },
    });
}
