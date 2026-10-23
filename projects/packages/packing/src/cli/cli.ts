import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { createCli } from "@vmz/commander";

import { registerFixturesCommand } from "./fixtures-cmd.js";
import { registerRenderCommand } from "./render-cmd.js";
import { registerVersionCommand } from "./version-cmd.js";

function buildPackingCli() {
    const localesRoot = join(dirname(fileURLToPath(import.meta.url)), "../../locales");
    const cli = createCli("packing").locales(localesRoot).intro("cli.intro");

    registerRenderCommand(cli);
    registerFixturesCommand(cli);
    registerVersionCommand(cli);

    return cli;
}

export async function runCli(argv: string[]): Promise<number> {
    try {
        return await buildPackingCli().parse(argv);
    } catch (error) {
        console.error(`error: ${error instanceof Error ? error.message : String(error)}`);
        return 1;
    }
}
