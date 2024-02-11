/// <reference path="../intellisense.d.ts"/>

const achievements = require("./achievements");

module.exports = {
    initAPI() {
        const fs = require("fs");
        const pp = require("path");
        const base = pp.dirname(process.mainModule.filename);

        const savePath = pp.join(base, "save");
        const configPath = pp.join(savePath, "nwcompat.json");

        if (!fs.existsSync(savePath)) fs.mkdirSync(savePath);
        if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, "{}");

        const file = JSON.parse(fs.readFileSync(configPath, "ascii") || "{}");
        if (Array.isArray(file.achievements)) nwcompat.achievements = file.achievements;
        else nwcompat.achievements = [];

        return true;
    },
    getNumberOfAchievements() {
        return Object.keys(achievements).length;
    },
    getAchievementNames() {
        return Object.keys(achievements);
    },
    getAchievement(name, callback) {
        callback(!!nwcompat.achievements[name]);
    },
    activateAchievement(id, successCallback, errorCallback) {
        const info = achievements[id];
        if (!info) {
            console.error(`greenworks.activateAchievement: '${id}' not found`);
            return errorCallback();
        }

        nwcompat.achievements[id] = true;
        successCallback(true);

        const fs = require("fs");
        const pp = require("path");
        const base = pp.dirname(process.mainModule.filename);

        const configPath = pp.join(base, "save", "nwcompat.json");
        fs.writeFileSync(configPath, JSON.stringify({ achievements: nwcompat.achievements }));

        const el = nwcompat.createAchievementElement(info.name, info.description, info.img, id);
        document.querySelector(".chromori_achievement_area").appendChild(el);

        setTimeout(() => {
            document.getElementById(id)?.remove();
        }, 5000);
    },
};
