import React, { useEffect, useRef, useState } from 'react';
import { PlayerExProps } from '../WatchPlayer';
import ReactPlayer from 'react-player/kaltura';
import { useSocket } from '../../contexts/SocketContext';

// TODO: Not sync anything yet :(

const KalturaPlayerEx = ({ room, isPeer }: PlayerExProps) => {
    const [playing, setPlaying] = useState<boolean>(true);
    const player = useRef<ReactPlayer>(null);
    const pauseByCode = useRef<boolean>(false);
    // Make play accept undefined, so we can ignore first play event when player loaded
    const playedByCode = useRef<boolean | undefined>(undefined);
    const mediaUrlChanged = useRef(false);

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
            console.log('I QUERIED TIME AND IT IS', queriedTime);
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
    }

    const onPlayerStart = () => {
        console.log('Player onStart');
        if (room && room.roomInfo && player.current) {
            console.log('SETTING DEF ROOM INFO', room.roomInfo);
            playedByCode.current = true;
            player.current.seekTo(room.roomInfo.currTime, 'seconds');
            changePlayBackRate(room.roomInfo.currSpeed);
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
                     playing={playing} muted={true}
                     onReady={onPlayerReady}
                     onStart={onPlayerStart}
                     onPlay={onPlayerPlay}
                     onPause={onPlayerPause}
                     onSeek={onPlayerSeek}
                     onError={onPlayerError}
                     onBuffer={() => console.log('Player onBufferStart')}
                     onBufferEnd={() => console.log('Player onBufferEnd')}
                     onPlaybackRateChange={onPlayerPlaybackRateChange}
        />
    );
};

export default KalturaPlayerEx;
