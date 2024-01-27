import fs from "fs/promises";

import babel from "@babel/core";
import * as esbuild from "esbuild";

const files = [
    { name: "patches", npm: false },
    { name: "require", npm: true },
];

const babelOptions = babel.loadOptions({
    compact: false,
    presets: ["@babel/preset-env"],
});

try {
    await fs.mkdir("dist");
} catch (e) {}

for (const file of files) {
    let start = Date.now();

    /**
     * @type {esbuild.BuildOptions}
     */
    let esbuildOptions = {
        entryPoints: [`${file.name}/index.js`],
        bundle: true,
        write: false,
        legalComments: "none",
    };

    if (file.npm) {
        esbuildOptions = {
            ...esbuildOptions,
            globalName: "__requireCache",
            define: { global: "globalThis" },
        };
    }

    const build = await esbuild.build(esbuildOptions);
    console.log(`esbuild: '${file.name}' finished in ${Date.now() - start}ms`);

    const outputFile = build.outputFiles[0];
    if (!file.npm) {
        await fs.writeFile(`dist/${file.name}.js`, outputFile.contents);
    } else {
        start = Date.now();
        const transform = await babel.transformAsync(outputFile.text, babelOptions);
        console.log(`babel: '${file.name}' finished in ${Date.now() - start}ms`);

        await fs.writeFile(`dist/${file.name}.js`, transform.code);
    }
}
