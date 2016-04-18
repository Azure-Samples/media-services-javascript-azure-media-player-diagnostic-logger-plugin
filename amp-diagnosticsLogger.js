// The MIT License
//
// Copyright (c) 2016 Southworks
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files 
// (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do 
// so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE 
// FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION 
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(function (mediaPlayer) {
    "use strict";

    mediaPlayer.plugin('diagnosticsLogger', function (options) {
        var player = this,
            callback = function (data) { console.log("Default diagnostics logger callback", data); };

        if (!!options && !!options.callback && typeof (options.callback) === 'function') {
            callback = options.callback;
        }

        init();

        function init() {
            player.ready(handleReady);
            player.addEventListener(mediaPlayer.eventName.error, handleError);
        }

        function handleReady() {
            player.addEventListener(mediaPlayer.eventName.loadedmetadata, handleLoadedMetaData);

            var data = {
                ampVersion: player.getAmpVersion(),
                appName: options.appName,
                userAgent: navigator.userAgent,
                options: {
                    autoplay: player.options().autoplay,
                    heuristicProfile: player.options().heuristicProfile,
                    techOrder: JSON.stringify(player.options().techOrder)
                }
            };

            logData("InstanceCreated", 1, data);
        }

        function handleError() {
            var err = player.error();
            var data = {
                sessionId: player.currentSrc(),
                currentTime: player.currentTime(),
                code: "0x" + err.code.toString(16),
                message: err.message
            };

            logData("Error", 0, data);
        }

        function handleLoadedMetaData() {
            player.addEventListener(mediaPlayer.eventName.playbackbitratechanged, handlePlaybackBitrateChanged);
            player.addEventListener(mediaPlayer.eventName.downloadbitratechanged, handleDownloadBitrateChanged);
            player.addEventListener(mediaPlayer.eventName.play, handlePlay);
            player.addEventListener(mediaPlayer.eventName.playing, handlePlaying);
            player.addEventListener(mediaPlayer.eventName.seeking, handleSeeking);
            player.addEventListener(mediaPlayer.eventName.seeked, handleSeeked);
            player.addEventListener(mediaPlayer.eventName.pause, handlePaused);
            player.addEventListener(mediaPlayer.eventName.waiting, handleWaiting);
            player.addEventListener(mediaPlayer.eventName.fullscreenchange, handleFullScreenChange);
            player.addEventListener(mediaPlayer.eventName.canplaythrough, handleCanPlayThrough);
            player.addEventListener(mediaPlayer.eventName.ended, handleEnded);

            if (player.audioBufferData()) {
                player.audioBufferData().addEventListener(mediaPlayer.bufferDataEventName.downloadfailed, function () {

                    var data = {
                        sessionId: player.currentSrc(),
                        currentTime: player.currentTime(),
                        bufferLevel: player.audioBufferData().bufferLevel,
                        url: player.audioBufferData().downloadFailed.mediaDownload.url,
                        code: "0x" + player.audioBufferData().downloadFailed.code.toString(16),
                        message: player.audioBufferData().downloadFailed
                    };

                    logData("DownloadFailed", 0, data);
                });
            }

            if (player.videoBufferData()) {
                player.videoBufferData().addEventListener(mediaPlayer.bufferDataEventName.downloadfailed, function () {

                    var data = {
                        sessionId: player.currentSrc(),
                        currentTime: player.currentTime(),
                        bufferLevel: player.videoBufferData().bufferLevel,
                        url: player.videoBufferData().downloadFailed.mediaDownload.url,
                        code: "0x" + player.videoBufferData().downloadFailed.code.toString(16),
                        message: player.videoBufferData().downloadFailed
                    };

                    logData("DownloadFailed", 0, data);
                });
            }

            var data = {
                sessionId: player.currentSrc(),
                isLive: player.isLive(),
                duration: player.duration(),
                tech: player.currentTechName(),
                protection: ((player.currentProtectionInfo() && player.currentProtectionInfo()[0]) ? player.currentProtectionInfo()[0].type : "clear")
            };

            logData("PresentationInfo", 1, data);
        }

        function handlePlaybackBitrateChanged(event) {
            logData("PlaybackBitrateChanged", 1, eventData(event));
        }

        function handleDownloadBitrateChanged(event) {
            logData("DownloadBitrateChanged", 1, eventData(event));
        }

        function handleWaiting(event) {
            logData("Waiting", 0, eventData(event));
        }

        function handlePlay(event) {
            logData("Play", 1, eventData(event));
        }

        function handlePlaying(event) {
            logData("Playing", 1, eventData(event));
        }

        function handleSeeking(event) {
            logData("Seeking", 1, eventData(event));
        }

        function handleSeeked(event) {
            logData("Seeked", 1, eventData(event));
        }

        function handlePaused(event) {
            logData("Paused", 1, eventData(event));
        }

        function handleFullScreenChange(event) {
            logData("FullScreenChange", 1, eventData(event));
        }

        function handleCanPlayThrough(event) {
            logData("CanPlayThrough", 1, eventData(event));
        }

        function handleEnded(event) {
            logData("Ended", 1, eventData(event));
        }

        function logData(eventId, level, data) {
            var eventLog = {
                eventId: eventId,
                level: level,
                data: data
            };

            callback(eventLog);
        }

        function eventData(event) {
            return {
                sessionId: player.currentSrc(),
                currentTime: player.currentTime(),
                isLive: player.isLive(),
                event: event.type,
                presentationTimeInSec: event.presentationTimeInSec,
                message: event.message ? event.message : ""
            };
        }
    });
}(window.amp));
