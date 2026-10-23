import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

/** Prefer explicit INPUT_VERSION. Else strip leading `v` from tag `vX.Y.Z`. */
function resolveVersion() {
    const input = (process.env.INPUT_VERSION || "").trim().replace(/^v/i, "");
    if (input) return input;
    const ref = (process.env.GITHUB_REF || "").trim();
    const fromRef = ref.match(/^refs\/tags\/v(.+)$/i);
    if (fromRef) return fromRef[1];
    const name = (process.env.GITHUB_REF_NAME || "").trim();
    if (/^v\d+\.\d+\.\d+/i.test(name)) return name.slice(1);
    return "";
}

const version = resolveVersion();

function walkFiles(dir, acc = []) {
    if (!fs.existsSync(dir)) return acc;
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const st = fs.statSync(full);
        if (st.isDirectory()) walkFiles(full, acc);
        else acc.push(full);
    }
    return acc;
}

function findNativeBinding(fileName) {
    const files = walkFiles(path.join(root, "_engines"));
    const hit = files.find((f) => path.basename(f) === fileName);
    if (!hit) {
        throw new Error(`missing native binding ${fileName} under _engines/`);
    }
    return hit;
}

function writeJson(filePath, data) {
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function preparePackageJson(pkgDir, { workspaceDepToVersion = false } = {}) {
    const pkgPath = path.join(pkgDir, "package.json");
    const j = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    delete j.private;
    if (version) {
        j.version = version;
        if (j.optionalDependencies) {
            for (const key of Object.keys(j.optionalDependencies)) {
                j.optionalDependencies[key] = version;
            }
        }
        if (workspaceDepToVersion && j.dependencies?.["@sxo/packing"] === "workspace:*") {
            j.dependencies["@sxo/packing"] = version;
        }
    }
    const ghRepo = (process.env.GITHUB_REPOSITORY || "").trim() || "oovm/packing-man";
    const directory = path.relative(root, pkgDir).split(path.sep).join("/");
    j.repository = {
        type: "git",
        url: `git+https://github.com/${ghRepo}.git`,
        directory,
    };
    j.homepage = `https://github.com/${ghRepo}/tree/dev/${directory}#readme`;
    j.bugs = { url: `https://github.com/${ghRepo}/issues` };
    j.publishConfig = { ...(j.publishConfig || {}), access: "public" };
    if (!j.license) j.license = "MIT";
    writeJson(pkgPath, j);
}

const platforms = [
    ["packing-win32-x64", "pm.win32-x64-msvc.node"],
    ["packing-win32-arm64", "pm.win32-arm64-msvc.node"],
    ["packing-linux-x64", "pm.linux-x64-gnu.node"],
    ["packing-linux-arm64", "pm.linux-arm64-gnu.node"],
    ["packing-darwin-x64", "pm.darwin-x64.node"],
    ["packing-darwin-arm64", "pm.darwin-arm64.node"],
];

for (const [pkg, binding] of platforms) {
    const destDir = path.join(root, "projects", "packages", pkg);
    const dest = path.join(destDir, "lib", binding);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(findNativeBinding(binding), dest);
    try {
        fs.chmodSync(dest, 0o755);
    } catch {
        // windows
    }
    preparePackageJson(destDir);
}

const wasmSrc = path.join(
    root,
    "projects",
    "packages",
    "packing-unknown-wasm32",
    "lib",
    "pm_wasm_bg.wasm",
);
if (!fs.existsSync(wasmSrc)) {
    throw new Error(`missing wasm artifact ${wasmSrc} — run pnpm run build:wasm`);
}

preparePackageJson(path.join(root, "projects", "packages", "packing-unknown-wasm32"), {
    workspaceDepToVersion: true,
});
preparePackageJson(path.join(root, "projects", "packages", "packing"));

console.log("npm packages prepared", version || "(package.json versions)");
