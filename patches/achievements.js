nwcompat.patches.push({
    stage: "preload",
    patch: () => {
        const style = document.createElement("style");
        style.innerHTML = `.chromori_achievement_area {
            z-index: 9999;
            user-select: none;
            position: absolute;
            bottom: 0;
            right: 0;
            overflow-y: hidden;
        }

        .chromori_achievement {
            width: 283px;
            height: 70px;
            animation: 5s linear 0s 1 slideInFromBottom;
            background: linear-gradient(#23262e, #0e141b);
        }

        .chromori_achievement_text {
            display: flex;
            height: 100%;
            flex-direction: column;
            justify-content: center;
        }

        .chromori_achievement_text>div {
            font-size: 12px;
            font-family: Helvetica;
        }

        .chromori_achievement_name {
            color: #ededee;
        }

        .chromori_achievement_desc {
            color: #646b72;
        }

        @keyframes slideInFromBottom {
            0% {
                transform: translateY(100%);
            }

            5% {
                transform: translateY(0%);
            }

            95% {
                transform: translateY(0%);
            }

            100% {
                transform: translateY(100%);
            }
        }

        .chromori_achievement_icon {
            width: 44px;
            height: 44px;
            float: left;
            margin: 13px 16px 13px 10px;
            background-size: cover;
        }`;
        document.head.appendChild(style);

        const area = document.createElement("div");
        area.className = "chromori_achievement_area";
        document.head.appendChild(area);

        nwcompat.achievements = [];
        nwcompat.createAchievementElement = function (name, description, icon, id) {
            const el = document.createElement("div");
            el.className = "chromori_achievement";
            el.id = id;
            el.innerHTML = `<div class="chromori_achievement_icon" style="background-image: url(${icon})"></div>
                <div class="chromori_achievement_text">
                <div class="chromori_achievement_name">${name}</div>
                <div class="chromori_achievement_desc">${description}</div>
                </div>`;
            return el;
        };
    },
});
