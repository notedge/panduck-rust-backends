import type { ParsedOptions } from "@vmz/commander";

export function str(options: ParsedOptions, key: string): string | undefined {
    const value = options[key];
    return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function num(options: ParsedOptions, key: string, defaultValue?: number): number | undefined {
    const raw = str(options, key);
    if (raw === undefined) {
        return defaultValue;
    }
    const value = Number(raw);
    return Number.isFinite(value) ? value : defaultValue;
}

export function count(options: ParsedOptions, key: string, defaultValue: number): number {
    const value = Math.trunc(num(options, key, defaultValue) ?? defaultValue);
    return value > 0 ? value : defaultValue;
}

export function positional(options: ParsedOptions, index = 0): string | undefined {
    const value = options._[index];
    return typeof value === "string" && value.length > 0 ? value : undefined;
}
