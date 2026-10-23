import type { Cli } from "@vmz/commander";

import { loadPmNapi } from "../node/load.js";

export function registerVersionCommand(cli: Cli): void {
    cli.command("version", "cli.cmd.version").action(() => cmdVersion());
}

export async function cmdVersion(): Promise<number> {
    const napi = await loadPmNapi();
    console.log(napi.pmVersionCode());
    return 0;
}
