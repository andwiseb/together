import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { OnProgressProps } from 'react-player/base';
import { useSocket } from '../contexts/SocketContext';
import { RoomModel } from '../types';
import { useRoom } from '../contexts/RoomContext';

const WatchPlayer = ({ room, isPeer }: { room: RoomModel, isPeer: boolean }) => {
    const initPlayingState = room.roomInfo ? room.roomInfo.isPlaying : true;
    const [playing, setPlaying] = useState<boolean>(initPlayingState);
    const [volume,] = useState<number | undefined>(undefined);
    const {
        togglePlayPause,
        queriedTime,
        sendYourTime,
        changePlaybackRate,
        playbackRate,
        queryCurrTime,
        socket
    } = useSocket()!;

    const { setPlayerRef } = useRoom()!;
    const player = useRef<ReactPlayer>(null);
    const pauseByCode = useRef<boolean>(false);
    // Make play accept undefined, so we can ignore first play event when player loaded
    const playedByCode = useRef<boolean | undefined>(initPlayingState ? undefined : false);
    const mediaUrlChanged = useRef(false);

    useEffect(() => {
        socket.on('toggle-player-state', (state: boolean, time: number | null) => {
            // console.log('PLAY/PAUSE Change to', state);
            (state ? playedByCode : pauseByCode).current = true;
            if (time) {
                player.current!.seekTo(time, 'seconds');
            }
            setPlaying(state);
        });

        // Get listener handler of this event because we have 2 listeners for it
        const mediaChangeEventListener = socket.on('media-url-changed', () => {
            mediaUrlChanged.current = true;
        });

        return () => {
            socket.off('toggle-player-state');
            socket.off('media-url-changed', mediaChangeEventListener as any);
        };
    }, []);

    useEffect(() => {
        if (queriedTime !== undefined && player.current) {
            // console.log('I QUERIED TIME AND IT IS', queriedTime);
            playedByCode.current = true;
            player.current.seekTo(queriedTime, 'seconds');
        }
    }, [queriedTime, player.current]);

    useEffect(() => {
        if (sendYourTime && player.current) {
            sendYourTime(player.current.getCurrentTime());
        }
    }, [sendYourTime]);

    useEffect(() => {
        changePlayBackRate(playbackRate);
    }, [playbackRate, player.current]);

    const changePlayBackRate = (rate: number) => {
        if (player.current) {
            const intPlayer = player.current.getInternalPlayer();
            if (intPlayer) {
                if ('setPlaybackRate' in intPlayer) {
                    // Youtube, Vimeo
                    intPlayer.setPlaybackRate(rate);
                } else if ('playbackRate' in intPlayer && typeof intPlayer.playbackRate === 'function') {
                    // Wistia
                    intPlayer.playbackRate(rate);
                }
            }
        }
    }

    const setPlayerDefaults = () => {
        // Set default player props using stored room info
        if (room && room.roomInfo && player.current) {
            // console.log('SETTING DEF ROOM INFO', room.roomInfo);
            player.current.seekTo(room.roomInfo.currTime, 'seconds');
            changePlayBackRate(room.roomInfo.currSpeed);
        }
    }

    const onPlayerReady = (reactPlayer: ReactPlayer) => {
        console.log('Player onReady');
        // Set player ref
        setPlayerRef(reactPlayer);
        if (!playing) {
            setPlayerDefaults();
        }
    }

    const onPlayerStart = () => {
        console.log('Player onStart');
        setPlayerDefaults();

        // Don't query for current time when media-url changed
        if (mediaUrlChanged.current) {
            mediaUrlChanged.current = false;
        } else {
            // If Peer is joined, emit message to ask other users for current video time to seek to it
            if (isPeer) {
                queryCurrTime(room.id);
            }
        }
    }

    const onPlayerPlay = () => {
        console.log('Player onPlay');
        setPlaying(true);

        if (playedByCode.current === false) {
            togglePlayPause(true, room.id, player.current!.getCurrentTime());
        } else {
            playedByCode.current = false;
        }
    }

    const onPlayerPause = () => {
        console.log('Player onPause');
        setPlaying(false);

        if (!pauseByCode.current) {
            togglePlayPause(false, room.id, player.current!.getCurrentTime());
        } else {
            pauseByCode.current = false;
        }
    }

    const onPlayerProgress = (state: OnProgressProps) => {
        // console.log('Player onProgress', state.playedSeconds);
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
        changePlaybackRate(room.id, rate);
    }

    return (
        <>
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
        </>
    );
};

export default WatchPlayer;
