import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { OnProgressProps } from 'react-player/base';
import { useSocket } from '../contexts/SocketContext';
import { RoomModel } from '../types';
import { useRoom } from '../contexts/RoomContext';

const WatchPlayer = ({ room }: { room: RoomModel }) => {
    const [justStarted, setJustStarted] = useState<boolean>(true);
    const [playing, setPlaying] = useState<boolean>(true);
    const [volume, setVolume] = useState<number | undefined>(undefined);
    const {
        togglePlayPause,
        playingChanged,
        queriedTime,
        sendYourTime,
        changePlaybackRate,
        playbackRate
    } = useSocket()!;

    const { setPlayerRef, initVideoTime } = useRoom()!;
    const player = useRef<ReactPlayer>(null);

    useEffect(() => {
        if (justStarted) {
            setJustStarted(false);
            return;
        }
        setPlaying(playingChanged);
    }, [playingChanged]);

    useEffect(() => {
        if (initVideoTime !== undefined && player.current) {
            player.current.seekTo(initVideoTime);
        }
    }, [initVideoTime, player.current]);

    useEffect(() => {
        if (queriedTime !== undefined && player.current) {
            // console.log('I QUERIED TIME AND IT IS', queriedTime);
            player.current.seekTo(queriedTime);
            // TODO: Should set `queriedTime = undefined` after using it?!
        }
    }, [queriedTime, player.current]);

    useEffect(() => {
        // console.log('Checking for sendYourTime', player.current)
        if (sendYourTime && player.current) {
            // console.log('I am sending my time', player.current.getCurrentTime());
            sendYourTime(player.current.getCurrentTime());
        }
    }, [sendYourTime]);

    useEffect(() => {
        if (player.current) {
            const intPlayer = player.current.getInternalPlayer();
            if (intPlayer) {
                if ('setPlaybackRate' in intPlayer) {
                    // Youtube, Vimeo
                    intPlayer.setPlaybackRate(playbackRate);
                } else if ('playbackRate' in intPlayer) {
                    // Wistia
                    intPlayer.playbackRate(playbackRate);
                }
            }
        }
    }, [playbackRate]);


    const onPlayerReady = (reactPlayer: ReactPlayer) => {
        // Set player ref
        setPlayerRef(reactPlayer);
    }

    const onPlayerStart = () => {
        console.log('Player onStart');
    }

    const onPlayerPlay = () => {
        console.log('Player onPlay');
        togglePlayPause(true, room.id, player.current!.getCurrentTime());
    }

    const onPlayerPause = () => {
        console.log('Player onPause');
        togglePlayPause(false, room.id, player.current!.getCurrentTime());
    }

    const onPlayerProgress = (state: OnProgressProps) => {
        // console.log('Player onProgress', state);
    }

    const onPlayerDuration = (duration: number) => {
        // console.log('Player onDuration', duration);
    }

    const onPlayerSeek = (seconds: number) => {
        console.log('Player onSeek', seconds);
    }

    const onPlayerError = (error: any, data?: any) => {
        console.log('Player onError', error, data);
    }

    const onPlayerPlaybackRateChange = (rate: number) => {
        // console.log('Player onPlaybackRateChange', rate);
        changePlaybackRate(room.id, rate);
    }

    return (
        <ReactPlayer className='react-player' controls url={room.mediaUrl}
                     width='100%' height='100%' ref={player}
                     playing={playing} volume={volume} muted={true}
                     onReady={onPlayerReady}
                     onStart={onPlayerStart}
                     onPlay={onPlayerPlay}
                     onProgress={onPlayerProgress}
                     onDuration={onPlayerDuration}
                     onPause={onPlayerPause}
                     onSeek={onPlayerSeek}
                     onError={onPlayerError}
                     onPlaybackRateChange={onPlayerPlaybackRateChange}
                     config={{
                         facebook: {
                             attributes: {
                                 'data-height': 540,
                             },
                         },
                     }}
        />
    );
};

export default WatchPlayer;
