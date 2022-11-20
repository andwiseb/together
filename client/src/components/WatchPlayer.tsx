import React, { useMemo } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { RoomModel } from '../types';
import YoutubePlayerEx from './Players/YoutubePlayerEx';
import TwitchPlayerEx from './Players/TwitchPlayerEx';
import FacebookPlayerEx from './Players/FacebookPlayerEx';
import DailyMotionPlayerEx from './Players/DailyMotionPlayerEx';
import VimeoPlayerEx from './Players/VimeoPlayerEx';
import FilePlayerEx from './Players/FilePlayerEx';
import SoundCloudPlayerEx from './Players/SoundCloudPlayerEx';
import StreamablePlayerEx from './Players/StreamablePlayerEx';
import WistiaPlayerEx from './Players/WistiaPlayerEx';
import MixcloudPlayerEx from './Players/MixcloudPlayerEx';
import VidyardPlayerEx from './Players/VidyardPlayerEx';
import KalturaPlayerEx from './Players/KalturaPlayerEx';

const MATCH_YOUTUBE = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})|youtube\.com\/playlist\?list=|youtube\.com\/user\//
const MATCH_TWITCH_VIDEO = /(?:www\.|go\.)?twitch\.tv\/videos\/(\d+)($|\?)/
const MATCH_TWITCH_CHANNEL = /(?:www\.|go\.)?twitch\.tv\/([a-z0-9_]+)($|\?)/
export const MATCH_DAILYMOTION = /^(?:(?:https?):)?(?:\/\/)?(?:www\.)?(?:(?:dailymotion\.com(?:\/embed)?\/video)|dai\.ly)\/([a-zA-Z0-9]+)(?:(?:_[\w_-]+)(?:[\w.#_-]+)?|(?:\?playlist=([a-zA-Z0-9]+)))?$/
const MATCH_VIMEO = /vimeo\.com\/(?!progressive_redirect).+/
const MATCH_VIMEO_FILE = /vimeo\.com\/external\/[0-9]+\..+/
const MATCH_FACEBOOK = /^https?:\/\/(www\.)?facebook\.com.*\/(video(s)?|watch|story)(\.php?|\/).+$/
const MATCH_FACEBOOK_WATCH = /^https?:\/\/fb\.watch\/.+$/
const MATCH_SOUNDCLOUD = /(?:soundcloud\.com|snd\.sc)\/[^.]+$/
const MATCH_STREAMABLE = /streamable\.com\/([a-z0-9]+)$/
const MATCH_WISTIA = /(?:wistia\.(?:com|net)|wi\.st)\/(?:medias|embed)\/(?:iframe\/)?(.*)$/
const MATCH_MIXCLOUD = /mixcloud\.com\/([^/]+\/[^/]+)/
const MATCH_VIDYARD = /vidyard.com\/(?:watch\/)?([a-zA-Z0-9-_]+)/
const MATCH_KALTURA = /^https?:\/\/[a-zA-Z]+\.kaltura.(com|org)\/p\/([0-9]+)\/sp\/([0-9]+)00\/embedIframeJs\/uiconf_id\/([0-9]+)\/partner_id\/([0-9]+)(.*)entry_id.([a-zA-Z0-9-_].*)$/

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
    const isSoundCloud = useMemo(() => MATCH_SOUNDCLOUD.test(room.mediaUrl), [room.mediaUrl]);
    const isStreamable = useMemo(() => MATCH_STREAMABLE.test(room.mediaUrl), [room.mediaUrl]);
    const isWistia = useMemo(() => MATCH_WISTIA.test(room.mediaUrl), [room.mediaUrl]);
    const isMixcloud = useMemo(() => MATCH_MIXCLOUD.test(room.mediaUrl), [room.mediaUrl]);
    const isVidyard = useMemo(() => MATCH_VIDYARD.test(room.mediaUrl), [room.mediaUrl]);
    const isKaltura = useMemo(() => MATCH_KALTURA.test(room.mediaUrl), [room.mediaUrl]);

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

    if (isSoundCloud) {
        return (<SoundCloudPlayerEx room={room} isPeer={isPeer} />);
    }

    if (isStreamable) {
        return (<StreamablePlayerEx room={room} isPeer={isPeer} />);
    }

    if (isWistia) {
        return (<WistiaPlayerEx room={room} isPeer={isPeer} />);
    }

    if (isMixcloud) {
        return (<MixcloudPlayerEx room={room} isPeer={isPeer} />);
    }

    if (isVidyard) {
        return (<VidyardPlayerEx room={room} isPeer={isPeer} />);
    }

    if (isKaltura) {
        return (<KalturaPlayerEx room={room} isPeer={isPeer} />);
    }

    return <FilePlayerEx room={room} isPeer={isPeer} />;
};

export default WatchPlayer;
