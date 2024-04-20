import { log } from 'console';
import  Room, { IRoom } from '../models/RoomModel';
//import mongoose from 'mongoose';
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
    public async addPlayerToRoom(roomId: string, playerName: string): Promise<IRoom | null> {
        try {
            const room = await Room.findByIdAndUpdate(
                roomId, 
                { $addToSet: { players: playerName } },
                { new: true, session: null } // 使用 session 为 null，除非您需要事务处理
            );
            return room;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Error adding player to room: ${error.message}`);
            } else {
                throw new Error('Error adding player to room: An unknown error occurred');
            }
        }
    }


    public async removePlayerFromRoom(roomId: string, playerName: string): Promise<IRoom | null> {
        try {
            console.log("remove player:",playerName,"from:", roomId)
            const room = await Room.findByIdAndUpdate(
                roomId, 
                { $pull: { players: playerName } },
                { new: true, session: null } // 使用 session 为 null，除非您需要事务处理
            );

            if (room && room.players.length === 0) {
               
                await Room.findByIdAndRemove(roomId);
                return null;
            }
            return room;
        }  catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Error removing player from room: ${error.message}`);
            } else {
                throw new Error('Error removing player from room: An unknown error occurred');
            }
        }
    }
}
// RoomService.ts




