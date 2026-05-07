import fs from "fs";
import path from "path";
import { build } from "vite";
import { execSync } from "child_process";

export async function publishToNpm() {
    const cwd = process.cwd();
    const manifestPath = path.join(cwd, "wwv-manifest.json");
    
    if (!fs.existsSync(manifestPath)) {
        throw new Error("No wwv-manifest.json found in current directory");
    }
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    
    console.log(`[WWV CLI] Compiling bundle for NPM...`);
    await build({
        root: cwd,
        build: {
            lib: {
                entry: path.resolve(cwd, manifest.dev_entry || "src/index.ts"),
                name: 'WWVPlugin',
                formats: ['es'],
                fileName: () => 'frontend.mjs'
            },
            outDir: 'dist',
            emptyOutDir: true
        }
    });

    console.log(`[WWV CLI] Generating package.json...`);
    // Create a temporary package.json required for NPM publish
    const packageJsonPath = path.join(cwd, "package.json");
    const packageJson = {
        name: manifest.id, // e.g. @username/my-plugin
        version: manifest.version,
        description: manifest.description,
        main: "dist/frontend.mjs",
        type: "module",
        files: ["dist", "wwv-manifest.json", "data"],
        keywords: ["worldwideview", "plugin", manifest.category],
        author: manifest.author || ""
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    console.log(`[WWV CLI] Publishing to NPM...`);
    try {
        execSync(`npm publish --access public`, { stdio: "inherit", cwd });
    } catch (err) {
        console.error(`[WWV CLI] NPM publish failed. Please ensure you are logged in via 'npm login'.`);
        throw err;
    } finally {
        // Clean up the generated package.json so it doesn't clutter the dev's repo
        fs.unlinkSync(packageJsonPath);
    }

    console.log(`[WWV CLI] Notifying WorldWideView Marketplace...`);
    try {
        const targetUrl = process.env.WWV_MARKETPLACE_URL || "https://marketplace.worldwideview.dev";
        await fetch(`${targetUrl}/api/webhooks/npm-publish`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pluginId: manifest.id, version: manifest.version })
        });
        console.log(`[WWV CLI] Marketplace notified.`);
    } catch (err: any) {
        console.warn(`[WWV CLI] Could not notify marketplace: ${err.message}. It will be indexed on the next sweep.`);
    }

    console.log(`\n🚀 Success! Version ${manifest.version} published globally to NPM.`);
}
