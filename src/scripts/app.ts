import { boot } from "@/scripts/core";

import.meta.glob("./services/**/*.ts", { eager: true });
import.meta.glob("./behaviors/**/*.ts", { eager: true });

void boot();
