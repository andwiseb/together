import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player/soundcloud';
import { useSocket } from '../../contexts/SocketContext';
import { PlayerExProps } from '../WatchPlayer';
import { useRoom } from '../../contexts/RoomContext';

const SoundCloudPlayerEx = ({ room, isPeer, defMediaUrlChanged }: PlayerExProps) => {
    const initPlayingState = !isPeer ? true : (room.roomInfo ? room.roomInfo.isPlaying : true);
    const [playing, setPlaying] = useState<boolean>(initPlayingState);
    const [volume, setVolume] = useState<number | undefined>(undefined);
    const [muted, setMuted] = useState(false);
    const player = useRef<ReactPlayer>(null);
    const pauseByCode = useRef<boolean | undefined>(undefined);
    // Make play accept undefined, so we can ignore first play event when player loaded
    const playedByCode = useRef<boolean | undefined>(initPlayingState ? undefined : false);
    const mediaUrlChanged = useRef(defMediaUrlChanged);

    const {
        socket,
        queriedTime,
        queryCurrTime,
        resetQueriedTime,
        togglePlayPause,
        sendYourTime
    } = useSocket()!;
    const { isNewRoom, setIsNewRoom } = useRoom()!;

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
            console.log('I QUERIED TIME AND IT IS', queriedTime);
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

    const onPlayerReady = () => {
        console.log('Player onReady');
        if (room && room.roomInfo && player.current) {
            console.log('SETTING DEF ROOM INFO', room.roomInfo);
            if (playing) {
                playedByCode.current = true;
                pauseByCode.current = true;
            }
            player.current.seekTo(room.roomInfo.currTime, 'seconds');
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
                queryCurrTime(room.id);
            }
        }
    }

    const onPlayerPlay = () => {
        console.log('Player onPlay', playedByCode.current);
        setPlaying(true);

        if (playedByCode.current === false) {
            togglePlayPause(true, room.id, player.current!.getCurrentTime())
        } else {
            playedByCode.current = false;
        }
    }

    const onPlayerPause = () => {
        console.log('Player onPause', pauseByCode.current);
        setPlaying(false);

        if (pauseByCode.current === false) {
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

export default SoundCloudPlayerEx;
