import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player/dailymotion';
import { PlayerExProps } from '../WatchPlayer';
import { useSocket } from '../../contexts/SocketContext';
import { useRoom } from '../../contexts/RoomContext';

const DailyMotionPlayerEx = ({ room, isPeer }: PlayerExProps) => {
    const initPlayingState = room.roomInfo ? room.roomInfo.isPlaying : true;
    const [playing, setPlaying] = useState<boolean>(initPlayingState);
    const [volume, setVolume] = useState<number | undefined>(undefined);
    const [muted, setMuted] = useState(true);
    const {
        togglePlayPause,
        queriedTime,
        sendYourTime,
        resetQueriedTime,
        queryCurrTime,
        socket
    } = useSocket()!;
    const { isNewRoom, setIsNewRoom } = useRoom()!;

    const player = useRef<ReactPlayer>(null);
    const pauseByCode = useRef<boolean>(false);
    // Make play accept undefined, so we can ignore first play event when player loaded
    const playedByCode = useRef<boolean | undefined>(initPlayingState ? undefined : false);
    const mediaUrlChanged = useRef(false);

    useEffect(() => {
        socket.on('toggle-player-state', (state: boolean, time: number | null) => {
            console.log('PLAY/PAUSE Changed to', state, 'TIME', time);
            (state ? playedByCode : pauseByCode).current = true;
            if (typeof time === 'number') {
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
        if (typeof queriedTime === 'number' && player.current) {
            // console.log('I QUERIED TIME AND IT IS', queriedTime);
            playedByCode.current = true;
            player.current.seekTo(queriedTime, 'seconds');
            resetQueriedTime();
        }
    }, [queriedTime, player.current]);

    useEffect(() => {
        if (sendYourTime && player.current) {
            sendYourTime(player.current.getCurrentTime());
        }
    }, [sendYourTime]);

    const setPlayerDefaults = () => {
        // Set default player props using stored room info
        if (room && room.roomInfo && player.current) {
            // console.log('SETTING DEF ROOM INFO', room.roomInfo);
            if (playing) {
                playedByCode.current = true;
            }

            player.current.seekTo(room.roomInfo.currTime, 'seconds');
            // changePlayBackRate(room.roomInfo.currSpeed); // Not implemented by the player
        }
    }

    const onPlayerReady = () => {
        console.log('Player onReady');
    }

    const onPlayerStart = () => {
        console.log('Player onStart');
        // Delay setting defaults so the initial onPlay event get fired first
        setTimeout(() => setPlayerDefaults(), 0);

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
        console.log('Player onPlay');
        setPlaying(true);

        if (playedByCode.current === false) {
            /*setTimeout(() => togglePlayPause(true, room.id, player.current!.getCurrentTime()),
                500);*/
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
        />
    );
};

export default DailyMotionPlayerEx;
