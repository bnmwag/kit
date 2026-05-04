import { boot } from "@/scripts/core";

import.meta.glob("./services/**/*.ts", { eager: true });
import.meta.glob("./behaviors/**/index.ts", { eager: true });
import.meta.glob("../blocks/**/*.behavior.ts", { eager: true });

void boot();
