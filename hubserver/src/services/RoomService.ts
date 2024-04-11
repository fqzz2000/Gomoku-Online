import  Room, { IRoom } from '../models/RoomModel';

export class RoomService {
    public async updateRoomInfo(roomId : string, roomState : "waiting" | "playing" | "ready" | "ended") : Promise<IRoom> {
        const room = await Room.findOne({ roomId: roomId });
        if (!room) {
            throw new Error('Room not found');
        }

        room.status = roomState;
        await room.save();

        return room;
    }
}
