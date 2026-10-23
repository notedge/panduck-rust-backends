import type { Cli } from "@vmz/commander";

import { allFixturePaths } from "../fixtures.js";

export function registerFixturesCommand(cli: Cli): void {
    cli.command("fixtures", "cli.cmd.fixtures")
        .command("list", "cli.cmd.fixtures.list")
        .action(() => cmdFixturesList());
}

export function cmdFixturesList(): number {
    for (const path of allFixturePaths()) {
        console.log(path);
    }
    return 0;
}
