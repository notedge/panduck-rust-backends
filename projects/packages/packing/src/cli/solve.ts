import { readFileSync, writeFileSync } from "node:fs";

import type { Checkpoint } from "../checkpoint.js";
import { boundGap, type Fixture } from "../fixtures.js";
import { loadPmNapi, renderSvgNode, solvePackingResumeNode } from "../node/load.js";
import type { Problem, Solution, SolverId } from "../problem.js";

function loadCheckpoint(path: string): Checkpoint {
    return JSON.parse(readFileSync(path, "utf8")) as Checkpoint;
}

export interface SolveRun {
    code: number;
    solution?: Solution;
    checkpoint?: Checkpoint;
}

export interface SolveOptions {
    fixture?: Fixture;
    checkpointIn?: string;
    checkpointOut?: string;
    iterBudget?: number;
}

export async function runSolve(
    problem: Problem,
    solver: SolverId,
    out: string,
    options: SolveOptions = {},
): Promise<SolveRun> {
    const napi = await loadPmNapi();
    let solution: Solution;
    let checkpoint: Checkpoint | undefined;

    try {
        const resume = await solvePackingResumeNode(napi, problem, solver, {
            checkpoint: options.checkpointIn ? loadCheckpoint(options.checkpointIn) : null,
            iterBudget: options.iterBudget,
        });
        solution = resume.solution;
        checkpoint = resume.checkpoint;
    } catch (error) {
        console.error(`solve failed: ${error instanceof Error ? error.message : String(error)}`);
        return { code: 2 };
    }

    if (options.checkpointOut) {
        writeFileSync(options.checkpointOut, JSON.stringify(checkpoint, null, 2), "utf8");
    }

    try {
        const svg = await renderSvgNode(napi, problem, solution);
        writeFileSync(out, svg, "utf8");
    } catch (error) {
        console.error(`write failed: ${error instanceof Error ? error.message : String(error)}`);
        return { code: 1 };
    }

    const metrics = solution.metrics as Solution["metrics"] & {
        radius_sum?: number;
        objective_value?: number;
    };
    const gap = options.fixture ? boundGap(options.fixture, solution) : null;
    const gapMsg = gap != null ? ` bound_gap=${gap.toFixed(6)}` : "";
    const prefix = options.fixture ? `id=${options.fixture.id} ` : "";
    const cpMsg = checkpoint
        ? ` iterations=${checkpoint.total_iterations} checkpoint_budget=${checkpoint.iter_budget}`
        : "";
    console.error(
        `wrote ${out} — ${prefix}count=${metrics.count} density=${(metrics.density * 100).toFixed(2)}% radius_sum=${(metrics.radius_sum ?? 0).toFixed(6)} feasible=${solution.feasible} obj=${(metrics.objective_value ?? 0).toFixed(6)}${gapMsg}${cpMsg}`,
    );
    return { code: 0, solution, checkpoint };
}
