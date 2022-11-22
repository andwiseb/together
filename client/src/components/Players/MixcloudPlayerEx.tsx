import React, { useEffect, useRef, useState } from 'react';
import { PlayerExProps } from '../WatchPlayer';
import ReactPlayer from 'react-player/mixcloud';
import { useSocket } from '../../contexts/SocketContext';
import { useRoom } from '../../contexts/RoomContext';

const MixcloudPlayerEx = ({ room, isPeer, defMediaUrlChanged }: PlayerExProps) => {
    const initPlayingState = room.roomInfo ? room.roomInfo.isPlaying : true;
    const [playing, setPlaying] = useState<boolean>(initPlayingState);
    const [volume, setVolume] = useState<number | undefined>(undefined);
    const [muted, setMuted] = useState(false);
    const player = useRef<ReactPlayer>(null);
    // MixCloud api first run: onReady - onStart - onPlay - onPause
    // Make pause accept undefined, so we can ignore first pause event when player loaded
    const pauseByCode = useRef<boolean | undefined>(undefined);
    // Make play accept undefined, so we can ignore first play event when player loaded
    const playedByCode = useRef<boolean | undefined>(initPlayingState ? undefined : false);
    const mediaUrlChanged = useRef(defMediaUrlChanged);
    const { isNewRoom, setIsNewRoom } = useRoom()!;

    const {
        socket,
        queriedTime,
        resetQueriedTime,
        queryCurrTime,
        togglePlayPause,
        sendYourTime
    } = useSocket()!;

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
            pauseByCode.current = true;
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
    }

    const onPlayerStart = () => {
        console.log('Player onStart');

        if (isNewRoom) {
            setVolume(0.1);
            setMuted(false);
            setIsNewRoom(false);
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

        if (pauseByCode.current === undefined) {
            pauseByCode.current = true; // to avoid togglePlayPause call
            // Set player defaults
            if (room && room.roomInfo && player.current) {
                console.log('SETTING DEF ROOM INFO', room.roomInfo);
                // if (playing) {
                playedByCode.current = true;
                pauseByCode.current = true;
                // }
                // player.current.getInternalPlayer().play();
                // setPlaying(room.roomInfo.isPlaying);
                player.current.seekTo(room.roomInfo.currTime, 'seconds');
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

            return;
        }

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

export default MixcloudPlayerEx;
