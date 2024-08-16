/// <reference path="../intellisense.d.ts"/>

// YSP_VideoPlayer patched for pixi v6
// merged with patches from GTP_OmoriFixes
// source: https://github.com/suppayami/yami-small-plugins

/*:
 * @plugindesc v1.0.0 Plugin used for playing video.
 * @author Dr.Yami
 *
 * @help
 * Use script call:
 *   ysp.VideoPlayer.loadVideo(videoName) - Preload Video
 *   ysp.VideoPlayer.releaseVideo(videoName) - Release memory for a Video
 *   ysp.VideoPlayer.newVideo(videoName, id) - Create new Video object with id
 *   ysp.VideoPlayer.playVideoById(id) - Play a Video object by id
 *   ysp.VideoPlayer.stopVideoById(id) - Stop a Video object by id
 *   ysp.VideoPlayer.setLoopById(id) - Make a Video object playing loop by id
 *   ysp.VideoPlayer.getVideoById(id) - Get Video object by id
 *   ysp.VideoPlayer.isReady() - Check if all videos have been loaded
 *
 * Video Object is a PIXI.Sprite object, can be re-position by modifying x and y props
 * To preload a (or many) video(s), use loadVideo(videoName) followed by a loop in
 * an event, break the loop when isReady() returns true
 */

nwcompat.patches.push({
    stage: "onload",
    name: "YSP_VideoPlayer",
    patch: () => {
        let videoCache = {};
        let videoMap = {};

        const loadVideo = (videoName) => {
            if (videoCache[videoName]) {
                return videoCache[videoName];
            }
            let texture = PIXI.Texture.from(`movies/${videoName}`, { resourceOptions: { autoPlay: false } });
            videoCache[videoName] = texture;
            return texture;
        };

        const newVideo = (videoName, id = "video") => {
            let video = new PIXI.Sprite(loadVideo(videoName));
            video.update = () => {
                video.texture.update();

                const baseTexture = video.texture.baseTexture;
                if (video.width !== baseTexture.width || video.height !== baseTexture.height) {
                    video.width = baseTexture.width;
                    video.height = baseTexture.height;
                }
            };
            videoMap[id] = video;

            // Making video responsive to BGM audio;
            video.texture.baseTexture.resource.source.volume *= ConfigManager.bgmVolume / 100;
            video.texture.baseTexture.loop = false;
            video.texture.baseTexture.resource.source.loop = false; // Being sure that the video does not loop

            // debug
            video.texture.baseTexture.resource.source.onerror = () => {
                console.error(
                    `Error ${video.texture.baseTexture.resource.source.error.code}; details: ${video.texture.baseTexture.resource.source.error.message}`
                );
            };
            return video;
        };

        const playVideo = (video) => {
            SceneManager._scene._spriteset.addVideo(video);
            video.texture.baseTexture.resource.source.play();
        };

        const playVideoById = (id) => {
            let video = getVideoById(id);
            playVideo(video);
        };

        const playVideos = () => {
            if (Object.keys(videoMap).length <= 0) return;

            for (let id in videoMap) {
                let video = videoMap[id];

                if (!video) continue;
                if (!video.texture) continue;
                if (!video.texture.baseTexture.resource.source.paused) continue;

                if (!!hasVideoFinished(parseInt(id))) {
                    continue;
                }
                video.texture.baseTexture.resource.source.play();
            }
        };

        const pauseVideos = () => {
            if (Object.keys(videoMap).length <= 0) return;

            for (let id in videoMap) {
                let video = videoMap[id];

                if (!video) continue;
                if (!video.texture) continue;
                if (video.texture.baseTexture.resource.source.paused) continue;

                video.texture.baseTexture.resource.source.pause();
            }
        };

        const stopVideo = (video) => {
            SceneManager._scene._spriteset.removeVideo(video);
            video.texture.baseTexture.resource.source.pause();
        };

        const stopVideoById = (id) => {
            const video = getVideoById(id);
            stopVideo(video);
            delete videoMap[id];
        };

        const setLoop = (video) => {
            video.texture.baseTexture.resource.source.loop = true;
        };

        const setLoopById = (id) => {
            const video = getVideoById(id);
            setLoop(video);
        };

        const releaseVideo = (videoName) => {
            delete videoCache[videoName];
        };

        const getVideoById = (id) => {
            return videoMap[id];
        };

        const isReady = () => {
            return !Object.values(videoCache).some((video) => !video.baseTexture.valid);
        };

        const hasVideoFinished = (id) => {
            const video = getVideoById(id);
            if (!video) {
                console.warn(`It seems that video of ID "${id}" was not playing. The method will return TRUE`);
                return true;
            }

            const source = video.texture.baseTexture.resource.source;
            return source.currentTime >= source.duration;
        };

        Spriteset_Base = class extends Spriteset_Base {
            createUpperLayer() {
                this.createVideos();
                super.createUpperLayer();
            }

            createVideos() {
                this._videosContainer = new Sprite();
                this.addChild(this._videosContainer);
            }

            addVideo(video) {
                this._videosContainer.addChild(video);
            }

            removeVideo(video) {
                this._videosContainer.removeChild(video);
            }
        };

        window.ysp = window.ysp || {};
        window.ysp.VideoPlayer = {
            newVideo,
            loadVideo,
            playVideo,
            playVideoById,
            playVideos, // GTP_OmoriFixes
            pauseVideos, // GTP_OmoriFixes
            stopVideoById,
            setLoopById,
            releaseVideo,
            getVideoById,
            isReady,
            hasVideoFinished, // GTP_OmoriFixes
        };
    },
});
