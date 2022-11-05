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
};

export default WatchPlayer;
