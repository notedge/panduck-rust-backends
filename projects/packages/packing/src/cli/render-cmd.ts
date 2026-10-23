import type { Cli, ParsedOptions } from "@vmz/commander";

import { loadFixtureByPath } from "../fixtures.js";
import { circlesInDisk } from "../problem.js";
import { solverForProblem, solverFromAlgorithmFlag } from "../solver.js";
import { count, num, positional, str } from "./options.js";
import { runSolve } from "./solve.js";

export function registerRenderCommand(cli: Cli): void {
    cli.command("render", "cli.cmd.render")
        .option("-o, --out <path>", "cli.opt.out")
        .option("--container-r <n>", "cli.opt.container-r")
        .option("--circle-r <n>", "cli.opt.circle-r")
        .option("--count <n>", "cli.opt.count")
        .option("--algorithm <name>", "cli.opt.algorithm")
        .option("--fixture <path>", "cli.opt.fixture")
        .option("--checkpoint-in <path>", "cli.opt.checkpoint-in")
        .option("--checkpoint-out <path>", "cli.opt.checkpoint-out")
        .option("--iter-budget <n>", "cli.opt.iter-budget")
        .action((options) => cmdRender(options));
}

export async function cmdRender(options: ParsedOptions): Promise<number> {
    const checkpointIn = str(options, "checkpoint-in");
    const checkpointOut = str(options, "checkpoint-out");
    const iterBudget = num(options, "iter-budget");
    const fixturePath = str(options, "fixture");
    const out = str(options, "out") ?? positional(options, 0) ?? "packing.svg";

    if (fixturePath) {
        const fixture = loadFixtureByPath(fixturePath);
        if (!fixture) {
            console.error(`unknown fixture: ${fixturePath}`);
            console.error("use: packing fixtures list");
            return 1;
        }
        const result = await runSolve(fixture.problem, solverForProblem(fixture.problem), out, {
            fixture,
            checkpointIn,
            checkpointOut,
            iterBudget,
        });
        return result.code;
    }

    const containerR = num(options, "container-r", 10) ?? 10;
    const circleR = num(options, "circle-r", 1) ?? 1;
    const circleCount = count(options, "count", 19);
    const algorithm = str(options, "algorithm") ?? "force";
    const problem = circlesInDisk(circleR, containerR, circleCount);
    const solver = solverFromAlgorithmFlag(algorithm);
    const result = await runSolve(problem, solver, out, {
        checkpointIn,
        checkpointOut,
        iterBudget,
    });
    return result.code;
}
