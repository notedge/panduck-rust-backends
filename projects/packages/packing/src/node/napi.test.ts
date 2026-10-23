import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SolverPresets, circlesInDisk } from "../problem.js";
import { loadPmNapi, renderSvgNode, solvePackingNode } from "./load.js";

describe("pm-napi", () => {
    it("loads native binding and solves circles in disk", async () => {
        const napi = await loadPmNapi();
        assert.ok(napi.pmVersionCode() >= 4_000);

        const problem = circlesInDisk(1, 10, 19);
        const solution = await solvePackingNode(napi, problem, SolverPresets.cpuConcentric);
        assert.ok(solution.placements.length > 0);
        assert.equal(solution.feasible, true);

        const svg = await renderSvgNode(napi, problem, solution);
        assert.match(svg, /<svg[\s>]/);
    });
});
