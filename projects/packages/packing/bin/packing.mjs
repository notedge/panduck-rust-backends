#!/usr/bin/env node
import { runCli } from "../dist/cli/cli.js";
import { normalizeLegacyArgv } from "../dist/cli/legacy.js";

const code = await runCli(normalizeLegacyArgv(process.argv));
process.exit(code);
