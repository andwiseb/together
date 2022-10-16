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
    readonly createdAt: Date;
    readonly updatedAt: Date;
}