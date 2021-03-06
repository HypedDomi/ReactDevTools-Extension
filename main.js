const fs = require("fs");
const path = require("path");
const electron = require("electron");
const REACT_DEVTOOLS_ID = "fmkadmapgofadopljbjfkapdkoienihi";

const findExtension = function () {
    let browserFolders;
    switch (process.platform) {
        case "win32":
            browserFolders = [
                path.resolve(process.env.LOCALAPPDATA, "Google/Chrome/User Data"),
                path.resolve(process.env.LOCALAPPDATA, "Chromium/User Data"),
                path.resolve(process.env.LOCALAPPDATA, "Google/Chrome Beta/User Data"),
                path.resolve(process.env.LOCALAPPDATA, "Google/Chrome SxS/User Data"),
                path.resolve(process.env.LOCALAPPDATA, "Opera Software/Opera Stable"),
                path.resolve(process.env.LOCALAPPDATA, "BraveSoftware/Brave-Browser/User Data"),
                path.resolve(process.env.LOCALAPPDATA, "Vivaldi/User Data"),
                path.resolve(process.env.LOCALAPPDATA, "Microsoft/Edge/User Data")
            ];
            break;
        case "darwin":
            browserFolders = [
                path.resolve(process.env.HOME, "Library/Application Support/Google/Chrome"),
                path.resolve(process.env.HOME, "Library/Application Support/Chromium"),
                path.resolve(process.env.HOME, "Library/Application Support/Google/Chrome Beta"),
                path.resolve(process.env.HOME, "Library/Application Support/Google/Chrome Canary"),
                path.resolve(process.env.HOME, "Library/Application Support/com.operasoftware.Opera"),
                path.resolve(process.env.HOME, "Library/Application Support/BraveSoftware/Brave-Browser"),
                path.resolve(process.env.HOME, "Library/Application Support/Vivaldi")
            ];
            break;
        case "linux":
        default:
            browserFolders = [
                path.resolve(process.env.HOME, ".config/google-chrome"),
                path.resolve(process.env.HOME, ".config/chromium"),
                path.resolve(process.env.HOME, ".config/google-chrome-beta"),
                path.resolve(process.env.HOME, ".config/google-chrome-unstable"),
                path.resolve(process.env.HOME, ".config/opera"),
                path.resolve(process.env.HOME, ".config/BraveSoftware/Brave-Browser"),
                path.resolve(process.env.HOME, ".config/vivaldi"),
                path.resolve(process.env.HOME, ".config/vivaldi-snapshot"),
                path.resolve(process.env.HOME, ".config/microsoft-edge")
            ];
            if ("CHROME_USER_DATA_DIR" in process.env) browserFolders.unshift(process.env.CHROME_USER_DATA_DIR);
            break;
    }

    let foundExtensionPath = null;

    for (const browserFolder of browserFolders) {
        if (!fs.existsSync(browserFolder)) continue;

        const dirs = fs.readdirSync(browserFolder);
        const profiles = dirs.filter(file => file === "Default" || file.startsWith("Profile"));

        if (dirs.includes("Extensions")) profiles.push(".");

        for (const profile of profiles) {
            const extensionFolder = path.join(browserFolder, profile, "Extensions", REACT_DEVTOOLS_ID);
            if (!fs.existsSync(extensionFolder)) continue;

            const versions = fs.readdirSync(extensionFolder);
            if (versions.length === 0) continue;

            return foundExtensionPath = path.resolve(extensionFolder, versions[versions.length - 1]);
        }
        if (foundExtensionPath) break;
    }
    return foundExtensionPath;
};

class ReactDevTools {
    static async install() {
        const extPath = findExtension();
        if (!extPath) return;

        try {
            const ext = await electron.session.defaultSession.loadExtension(extPath);
            if (!ext) return;
        }
        catch (err) { }
    }

    static async remove() {
        const extPath = findExtension();
        if (!extPath) return;

        try {
            await electron.session.defaultSession.removeExtension(extPath);
        }
        catch (err) { }
    }
}


electron.app.whenReady().then(async ()=>{
    await ReactDevTools.install();
});