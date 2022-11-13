import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player/facebook';
import { PlayerExProps } from '../WatchPlayer';
import { useSocket } from '../../contexts/SocketContext';
import { useRoom } from '../../contexts/RoomContext';

const FacebookPlayerEx = ({ room, isPeer }: PlayerExProps) => {
    const initPlayingState = room.roomInfo ? room.roomInfo.isPlaying : true;
    const [playing, setPlaying] = useState<boolean>(initPlayingState);
    const [volume, setVolume] = useState<number | undefined>(undefined);
    const [muted, setMuted] = useState(true);
    const {
        togglePlayPause,
        resetQueriedTime,
        queriedTime,
        sendYourTime,
        changePlaybackRate,
        playbackRate,
        queryCurrTime,
        socket
    } = useSocket()!;

    const player = useRef<ReactPlayer>(null);
    const pauseByCode = useRef<boolean>(false);
    // Make play accept undefined, so we can ignore first play event when player loaded
    const playedByCode = useRef<boolean | undefined>(initPlayingState ? undefined : false);
    const mediaUrlChanged = useRef(false);
    const { isNewRoom, setIsNewRoom } = useRoom()!;

    useEffect(() => {
        socket.on('toggle-player-state', (state: boolean, time: number | null) => {
            console.log('PLAY/PAUSE Changed to', state, 'TIME', time);
            (state ? playedByCode : pauseByCode).current = true;
            if (typeof time === 'number') {
                player.current!.seekTo(time, 'seconds');
            }
            setPlaying(state);

            // Check Possible seek event
            if (state && playing === state) {
                // Fire the play event manually to apply the seek
                setTimeout(() => {
                    // If playedByCode still true that mean onPlay not fired, so fire it manually
                    if (playedByCode.current) {
                        console.log('FIRING ON-PLAY MANUALLY');
                        onPlayerPlay();
                    }
                }, 500);
            }
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
        if (typeof queriedTime === 'number' && player.current) {
            console.log('I QUERIED TIME AND IT IS', queriedTime);
            player.current.seekTo(queriedTime, 'seconds');
            resetQueriedTime();
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
            console.log('SETTING DEF ROOM INFO', room.roomInfo);
            if (playing) {
                playedByCode.current = true;
            }
            player.current.seekTo(room.roomInfo.currTime, 'seconds');
            changePlayBackRate(room.roomInfo.currSpeed);
        }
    }

    const onPlayerReady = () => {
        console.log('Player onReady');
        // if isFacebook
        setPlayerDefaults();
    }

    const onPlayerStart = () => {
        console.log('Player onStart');
        if (isNewRoom) {
            setVolume(0.1);
            setMuted(false);
            setIsNewRoom(false);
        }

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
        console.log('Player onPlay', playedByCode.current);
        setPlaying(true);

        if (playedByCode.current === false) {
            setTimeout(() => togglePlayPause(true, room.id, player.current!.getCurrentTime()), 500);
        } else {
            playedByCode.current = false;
        }
    }

    const onPlayerPause = () => {
        console.log('Player onPause', pauseByCode.current);
        setPlaying(false);

        if (!pauseByCode.current) {
            togglePlayPause(false, room.id, player.current!.getCurrentTime());
        } else {
            pauseByCode.current = false;
        }
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
        <ReactPlayer className='react-player' controls url={room.mediaUrl}
                     width='100%' height='100%' ref={player}
                     playing={playing} muted={muted} volume={volume}
                     onReady={onPlayerReady}
                     onStart={onPlayerStart}
                     onPlay={onPlayerPlay}
                     onPause={onPlayerPause}
                     onSeek={onPlayerSeek}
                     onError={onPlayerError}
                     onPlaybackRateChange={onPlayerPlaybackRateChange}
                     config={{
                         attributes: {
                             'data-height': 540,
                         }
                     }}
        />
    );
};

export default FacebookPlayerEx;
