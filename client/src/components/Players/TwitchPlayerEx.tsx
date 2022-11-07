import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player/twitch';
import { PlayerExProps } from '../WatchPlayer';
import { useSocket } from '../../contexts/SocketContext';
import { useRoom } from '../../contexts/RoomContext';

const TwitchPlayerEx = ({ room, isPeer }: PlayerExProps) => {
    const [playing, setPlaying] = useState<boolean>(true);
    const [volume, setVolume] = useState<number | undefined>(undefined);
    const [muted, setMuted] = useState(true);
    const {
        togglePlayPause,
        queriedTime,
        sendYourTime,
        changePlaybackRate,
        playbackRate,
        queryCurrTime,
        socket
    } = useSocket()!;
    const { isNewRoom, setIsNewRoom } = useRoom()!;

    const player = useRef<ReactPlayer>(null);
    const pauseByCode = useRef<boolean>(false);
    // Make play accept undefined, so we can ignore first play event when player loaded
    const playedByCode = useRef<boolean | undefined>(undefined);
    const mediaUrlChanged = useRef(false);
    const seekedSeconds = useRef<undefined | number>(undefined);

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
            // If isTwitch
            pauseByCode.current = true;

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

    const onPlayerReady = () => {
        console.log('Player onReady');
    }

    const onPlayerStart = () => {
        console.log('Player onStart');
        setTimeout(() => {
            // Set default player props using stored room info
            if (room && room.roomInfo && player.current) {
                console.log('SETTING DEF ROOM INFO', room.roomInfo);
                playedByCode.current = true;
                // if isTwitch
                pauseByCode.current = true;

                player.current.seekTo(room.roomInfo.currTime, 'seconds');
                changePlayBackRate(room.roomInfo.currSpeed)
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
                console.log('I SEND REQUEST TO QUERY CURRENT TIME');
                queryCurrTime(room.id);
            }
        }
    }

    const onPlayerPlay = () => {
        console.log('Player onPlay', playedByCode.current);
        setPlaying(true);

        let isSeek: number | undefined = undefined;
        if (typeof seekedSeconds.current === 'number') {
            isSeek = seekedSeconds.current;
            seekedSeconds.current = undefined;
        }

        if (playedByCode.current === false) {
            setTimeout(() => {
                    const time = isSeek !== undefined ? isSeek : player.current!.getCurrentTime();
                    togglePlayPause(true, room.id, time);
                },
                0);
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

    const onPlayerSeek = ({ position }: any) => {
        console.log('Player onSeek', position);
        seekedSeconds.current = position;
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
                     onBuffer={() => console.log('Player onBufferStart')}
                     onBufferEnd={() => console.log('Player onBufferEnd')}
                     onPlaybackRateChange={onPlayerPlaybackRateChange}
        />
    );
};

export default TwitchPlayerEx;
