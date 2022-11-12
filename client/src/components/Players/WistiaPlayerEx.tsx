import React, { useEffect, useRef, useState } from 'react';
import { PlayerExProps } from '../WatchPlayer';
import ReactPlayer from 'react-player/wistia';
import { useSocket } from '../../contexts/SocketContext';
import { useRoom } from '../../contexts/RoomContext';

const WistiaPlayerEx = ({ room, isPeer }: PlayerExProps) => {
    const initPlayingState = room.roomInfo ? room.roomInfo.isPlaying : true;
    const [playing, setPlaying] = useState<boolean>(initPlayingState);
    const [volume, setVolume] = useState<number | undefined>(undefined);
    const [muted, setMuted] = useState(true);
    const player = useRef<ReactPlayer>(null);
    const pauseByCode = useRef<boolean>(false);
    // Make play accept undefined, so we can ignore first play event when player loaded
    const playedByCode = useRef<boolean | undefined>(initPlayingState ? undefined : false);
    const seekedByCode = useRef<boolean>(false);
    const mediaUrlChanged = useRef(false);
    const { isNewRoom, setIsNewRoom } = useRoom()!;

    const {
        socket,
        queriedTime,
        queryCurrTime,
        togglePlayPause,
        playbackRate,
        changePlaybackRate,
        sendYourTime,
        notifyVideoSeeked,
        notifySeekVideo
    } = useSocket()!;

    useEffect(() => {
        socket.on('toggle-player-state', (state: boolean, time: number | null) => {
            console.log('PLAY/PAUSE Changed to', state, 'TIME', time);
            (state ? playedByCode : pauseByCode).current = true;
            if (time) {
                seekedByCode.current = true;
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
            // playedByCode.current = true;
            if (initPlayingState) {
                seekedByCode.current = true;
            }
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
                if ('playbackRate' in intPlayer && typeof intPlayer.playbackRate === 'function') {
                    intPlayer.playbackRate(rate);
                }
            }
        }
    }

    useEffect(() => {
        if (notifyVideoSeeked !== undefined && player.current) {
            seekedByCode.current = true;
            player.current.seekTo(notifyVideoSeeked, 'seconds');
        }
    }, [notifyVideoSeeked, player.current]);

    const onPlayerReady = () => {
        console.log('Player onReady');
    }

    const onPlayerStart = () => {
        console.log('Player onStart');
        setTimeout(() => {
            if (room && room.roomInfo && player.current) {
                console.log('SETTING DEF ROOM INFO', room.roomInfo);
                // playedByCode.current = true;
                seekedByCode.current = true;
                player.current.seekTo(room.roomInfo.currTime, 'seconds');
                changePlayBackRate(room.roomInfo.currSpeed);
            }
        }, 0);

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

        if (!pauseByCode.current) {
            togglePlayPause(false, room.id, player.current!.getCurrentTime());
        } else {
            pauseByCode.current = false;
        }
    }

    const onPlayerSeek = (seconds: number) => {
        console.log('Player onSeek', seconds, seekedByCode.current);
        // TODO: Hold down and seek it's not fire onSeek
        if (!seekedByCode.current) {
            notifySeekVideo(room.id, seconds);
        } else {
            seekedByCode.current = false;
        }
    }

    const onPlayerError = (error: any, data?: any) => {
        console.log('Player onError', error, data);
    }

    const onPlayerPlaybackRateChange = (rate: number) => {
        changePlaybackRate(room.id, rate);
    }

    const onPlayerEnded = () => {
        console.log('Player OnEnded');
        playedByCode.current = false;
        pauseByCode.current = false;
        setPlaying(false);
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
                     onEnded={onPlayerEnded}
        />
    );
};

export default WistiaPlayerEx;
