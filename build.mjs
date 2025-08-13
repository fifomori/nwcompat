import * as esbuild from "esbuild";

let start = Date.now();

/**
 * @type {esbuild.BuildOptions}
 */
let esbuildOptions = {
    entryPoints: ["bundle.js"],
    outdir: "dist",
    bundle: true,
    // minify: true,
    keepNames: true,
    globalName: "__requireCache",
    define: { global: "globalThis" },
    // sourcemap: "linked",
    legalComments: "none",
};

await esbuild.build(esbuildOptions);
console.log(`esbuild: finished in ${Date.now() - start}ms`);
