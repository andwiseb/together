import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { OnProgressProps } from 'react-player/base';
import { useSocket } from '../contexts/SocketContext';
import { RoomModel } from '../types';

const WatchPlayer = ({ room }: { room: RoomModel }) => {
    const [justStarted, setJustStarted] = useState<boolean>(true);
    const [playing, setPlaying] = useState<boolean>(true);
    const [volume, setVolume] = useState<number | undefined>(undefined);
    const { togglePlayPause, playingChanged } = useSocket()!;

    useEffect(() => {
        if (justStarted) {
            setJustStarted(false);
            return;
        }
        setPlaying(playingChanged);
    }, [playingChanged]);


    const onPlayerStart = () => {
        console.log('Player onStart');
    }

    const onPlayerPlay = () => {
        console.log('Player onPlay');
        togglePlayPause(true, room.link);
    }

    const onPlayerPause = () => {
        console.log('Player onPause');
        togglePlayPause(false, room.link);
    }

    const onPlayerProgress = (state: OnProgressProps) => {
        console.log('Player onProgress', state);
    }

    const onPlayerDuration = (duration: number) => {
        console.log('Player onDuration', duration);
    }

    const onPlayerSeek = (seconds: number) => {
        console.log('Player onSeek', seconds);
    }

    const onPlayerError = (error: any, data?: any) => {
        console.log('Player onError', error, data);
    }

    return (
        <ReactPlayer className='react-player' controls url={room.mediaUrl}
                     width='100%' height='100%'
                     playing={playing} volume={volume}
                     onStart={onPlayerStart}
                     onPlay={onPlayerPlay}
                     onProgress={onPlayerProgress}
                     onDuration={onPlayerDuration}
                     onPause={onPlayerPause}
                     onSeek={onPlayerSeek}
                     onError={onPlayerError}
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
