const achievements = require("./achievements");

module.exports = {
    initAPI() {
        if (!(nwcompat.game in achievements)) {
            console.error(`greenworks.initAPI: no achievements found for game '${nwcompat.game}'`);
            return false;
        }

        return true;
    },
    getNumberOfAchievements() {
        return Object.keys(achievements[nwcompat.game]).length;
    },
    getAchievementNames() {
        return Object.keys(achievements[nwcompat.game]);
    },
    getAchievement(name, callback) {
        callback(!!nwcompat.savedData.achievements[name]);
    },
    activateAchievement(id, successCallback, errorCallback) {
        const info = achievements[nwcompat.game][id];
        if (!info) {
            console.error(`greenworks.activateAchievement: '${id}' not found`);
            return errorCallback();
        }

        if (nwcompat.savedData.achievements[id] === true) {
            return;
        }

        nwcompat.savedData.achievements[id] = true;
        nwcompat.saveData();

        successCallback(true);

        const el = nwcompat.createAchievementElement(info.name, info.description, info.img, id);
        document.querySelector(".nwcompat-achievement-area").appendChild(el);

        setTimeout(() => {
            document.getElementById(id)?.remove();
        }, 5000);
    },
};
