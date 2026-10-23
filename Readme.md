# VuTeX

Language-neutral document typesetting and rendering in Rust.

> **VuTeX is a product name, not a TeX renderer.** TeX, Markdown, MDX, Typst, and Notedown are input adapters only.

## Pipeline

```text
Source Language → Adapter → Canonical Document IR → Layout → Presentation → Output
```

## Crate layout

```text
vutex-types              IDs, diagnostics, conversion reports
vutex-document           Canonical document IR
vutex-style              Semantic styles and themes
vutex-layout             Layout hints and layout plans
vutex-text               Shaping and line breaking
vutex-presentation       Display and flow presentation IR
vutex-render             Renderer contracts
vutex-render-pdf/svg/html/raster
vutex-input-notedown/markdown/mdx/typst/tex
```

Design truth lives outside this repository. Implementation follows the VuTeX Living docs in the parent workspace.

## Quick start

```bash
cargo check --workspace
cargo test --workspace
```

## Status

Scaffold stage: `pm-*` / Packing Man template removed; `vutex-*` crates provide contracts and stubs only.
