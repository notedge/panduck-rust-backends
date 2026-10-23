const SUBCOMMANDS = new Set(["render", "fixtures", "version", "help"]);

/**
 * Map pre-commander argv to `packing render …` / `packing fixtures list`.
 * Keeps `packing out.svg --algorithm force` and `packing --list-fixtures` working.
 */
export function normalizeLegacyArgv(argv: string[]): string[] {
    const head = argv.slice(0, 2);
    const rest = argv.slice(2);

    if (rest.length === 0) {
        return [...head, "render"];
    }

    if (rest[0] === "--list-fixtures") {
        return [...head, "fixtures", "list"];
    }

    const first = rest[0];
    if (SUBCOMMANDS.has(first)) {
        return argv;
    }

    if (first.startsWith("-")) {
        return [...head, "render", ...rest];
    }

    return [...head, "render", ...rest];
}
