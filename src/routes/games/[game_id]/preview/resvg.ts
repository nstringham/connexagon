import { initWasm } from "@resvg/resvg-wasm";
import resvgWasmFileUrl from "@resvg/resvg-wasm/index_bg.wasm?url";
import { readFile } from "node:fs/promises";

const resvgWasmFile = await readFile("." + resvgWasmFileUrl);
await initWasm(resvgWasmFile);

export { Resvg } from "@resvg/resvg-wasm";
