export interface UserModel {
    id: string;
    username: string;
    readonly rooms?: RoomModel[];
}

export interface RoomModel {
    id: string;
    mediaUrl: string;
    link: string;
    user?: UserModel;
    userId: string;
    roomInfo?: RoomInfoModel;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export interface RoomInfoModel {
    room?: RoomModel;
    roomId: string;
    isOpened: boolean;
    currTime: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}