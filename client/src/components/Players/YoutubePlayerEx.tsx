import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player/youtube';
import { useSocket } from '../../contexts/SocketContext';
import { PlayerExProps } from '../WatchPlayer';
import { useRoom } from '../../contexts/RoomContext';

const YoutubePlayerEx = ({ room, isPeer }: PlayerExProps) => {
    const initPlayingState = room.roomInfo ? room.roomInfo.isPlaying : true;
    const [playing, setPlaying] = useState<boolean>(initPlayingState);
    const [volume, setVolume] = useState<number | undefined>(undefined);
    const [muted, setMuted] = useState(true);
    const player = useRef<ReactPlayer>(null);
    const pauseByCode = useRef<boolean>(false);
    // Make play accept undefined, so we can ignore first play event when player loaded
    const playedByCode = useRef<boolean | undefined>(initPlayingState ? undefined : false);
    const mediaUrlChanged = useRef(false);
    const { isNewRoom, setIsNewRoom } = useRoom()!;

    const {
        socket,
        queriedTime,
        queryCurrTime,
        togglePlayPause,
        playbackRate,
        changePlaybackRate,
        sendYourTime
    } = useSocket()!;

    useEffect(() => {
        socket.on('toggle-player-state', (state: boolean, time: number | null) => {
            console.log('PLAY/PAUSE Changed to', state, 'TIME', time);
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
                if ('setPlaybackRate' in intPlayer && typeof intPlayer.setPlaybackRate === 'function') {
                    // Youtube, Vimeo
                    intPlayer.setPlaybackRate(rate);
                }
            }
        }
    }

    const onPlayerReady = () => {
        console.log('Player onReady');
        if (room && room.roomInfo && player.current) {
            // console.log('SETTING DEF ROOM INFO', room.roomInfo);
            if (playing) {
                playedByCode.current = true;
            }
            player.current.seekTo(room.roomInfo.currTime, 'seconds');
            changePlayBackRate(room.roomInfo.currSpeed);
        }
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
                // Delay the query so the onPlay event fire first
                setTimeout(() => {
                    queryCurrTime(room.id);
                }, 0);
            }
        }
    }

    const onPlayerPlay = () => {
        console.log('Player onPlay');
        setPlaying(true);

        if (playedByCode.current === false) {
            togglePlayPause(true, room.id, player.current!.getCurrentTime())
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
        />
    );
};

export default YoutubePlayerEx;
