/// <reference path="../intellisense.d.ts"/>

module.exports = {
    initAPI() {
        return true;
    },
    getNumberOfAchievements() {
        return 84;
    },
    getAchievementNames() {
        return ["GOOD_MORNING", "OYASUMI"];
    },
    getAchievement(name, callback) {
        callback(false);
    },
    activateAchievement(id, successCallback, errorCallback) {
        successCallback();
    },
};
