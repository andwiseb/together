import React, { useMemo } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { RoomModel } from '../types';
import YoutubePlayerEx from './Players/YoutubePlayerEx';
import TwitchPlayerEx from './Players/TwitchPlayerEx';
import FacebookPlayerEx from './Players/FacebookPlayerEx';
import DailyMotionPlayerEx from './Players/DailyMotionPlayerEx';
import VimeoPlayerEx from './Players/VimeoPlayerEx';
import FilePlayerEx from './Players/FilePlayerEx';

const MATCH_YOUTUBE = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})|youtube\.com\/playlist\?list=|youtube\.com\/user\//
const MATCH_TWITCH_VIDEO = /(?:www\.|go\.)?twitch\.tv\/videos\/(\d+)($|\?)/
const MATCH_TWITCH_CHANNEL = /(?:www\.|go\.)?twitch\.tv\/([a-z0-9_]+)($|\?)/
const MATCH_DAILYMOTION = /^(?:(?:https?):)?(?:\/\/)?(?:www\.)?(?:(?:dailymotion\.com(?:\/embed)?\/video)|dai\.ly)\/([a-zA-Z0-9]+)(?:_[\w_-]+)?$/
const MATCH_VIMEO = /vimeo\.com\/(?!progressive_redirect).+/
const MATCH_VIMEO_FILE = /vimeo\.com\/external\/[0-9]+\..+/
const MATCH_FACEBOOK = /^https?:\/\/(www\.)?facebook\.com.*\/(video(s)?|watch|story)(\.php?|\/).+$/
const MATCH_FACEBOOK_WATCH = /^https?:\/\/fb\.watch\/.+$/

export interface PlayerExProps {
    room: RoomModel,
    isPeer: boolean,
}

const WatchPlayer = ({ room }: { room: RoomModel }) => {
    // const initPlayingState = room.roomInfo ? room.roomInfo.isPlaying : true;
    /*const [playing, setPlaying] = useState<boolean>(true);
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
    const playedByCode = useRef<boolean | undefined>(undefined);
    const mediaUrlChanged = useRef(false);*/

    const { userList } = useSocket()!;
    const isPeer = useMemo(() => userList?.length > 1, [userList]);
    const isYoutube = useMemo(() => MATCH_YOUTUBE.test(room.mediaUrl), [room.mediaUrl]);
    const isTwitch = useMemo(() => MATCH_TWITCH_VIDEO.test(room.mediaUrl) ||
        MATCH_TWITCH_CHANNEL.test(room.mediaUrl), [room.mediaUrl]);
    const isVimeo = useMemo(() => MATCH_VIMEO.test(room.mediaUrl) ||
        MATCH_VIMEO_FILE.test(room.mediaUrl), [room.mediaUrl]);
    const isDailyMotion = useMemo(() => MATCH_DAILYMOTION.test(room.mediaUrl), [room.mediaUrl]);
    const isFacebook = useMemo(() => MATCH_FACEBOOK.test(room.mediaUrl) ||
        MATCH_FACEBOOK_WATCH.test(room.mediaUrl), [room.mediaUrl]);
    // console.log('PLATFORM', { isYoutube, isTwitch, isFacebook, isVimeo, isDailyMotion });

    /*useEffect(() => {
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
            if (isTwitch || isFacebook) {
                pauseByCode.current = true;
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
                if ('setPlaybackRate' in intPlayer) {
                    // Youtube, Vimeo
                    intPlayer.setPlaybackRate(rate);
                } else if ('playbackRate' in intPlayer && typeof intPlayer.playbackRate === 'function') {
                    // Wistia
                    intPlayer.playbackRate(rate);
                }
            }
        }
    }*/

    /*const setPlayerDefaults = () => {
        // Set default player props using stored room info
        if (room && room.roomInfo && player.current) {
            // console.log('SETTING DEF ROOM INFO', room.roomInfo);
            playedByCode.current = true;
            if (isTwitch) {
                pauseByCode.current = true;
            }
            player.current.seekTo(room.roomInfo.currTime, 'seconds');
            changePlayBackRate(room.roomInfo.currSpeed);
        }
    }

    const onPlayerReady = (reactPlayer: ReactPlayer) => {
        console.log('Player onReady');
        // Set player ref
        setPlayerRef(reactPlayer);
        // if (!playing) {
        if (isYoutube || isFacebook) {
            setPlayerDefaults();
        }
        // }
    }

    const onPlayerStart = () => {
        console.log('Player onStart');
        if (isTwitch) {
            setPlayerDefaults();
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
            setTimeout(() => togglePlayPause(true, room.id, player.current!.getCurrentTime()),
                500);
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
    }*/

    if (isYoutube) {
        return (<YoutubePlayerEx room={room} isPeer={isPeer} />);
    }

    if (isTwitch) {
        return (<TwitchPlayerEx room={room} isPeer={isPeer} />);
    }

    if (isFacebook) {
        return (<FacebookPlayerEx room={room} isPeer={isPeer} />);
    }

    if (isDailyMotion) {
        return (<DailyMotionPlayerEx room={room} isPeer={isPeer} />);
    }

    if (isVimeo) {
        return (<VimeoPlayerEx room={room} isPeer={isPeer} />);
    }

    return <FilePlayerEx room={room} isPeer={isPeer} />;


    /*return (
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
                         onBuffer={() => console.log('Player onBufferStart')}
                         onBufferEnd={() => console.log('Player onBufferEnd')}
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
    );*/
};

export default WatchPlayer;
