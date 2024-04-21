var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../models/RoomModel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RoomService = void 0;
    const RoomModel_1 = __importDefault(require("../models/RoomModel"));
    //import mongoose from 'mongoose';
    class RoomService {
        async updateRoomInfo(roomId, roomState) {
            const room = await RoomModel_1.default.findOne({ roomId: roomId });
            if (!room) {
                throw new Error('Room not found');
            }
            room.status = roomState;
            await room.save();
            return room;
        }
        async addPlayerToRoom(roomId, playerName) {
            try {
                const room = await RoomModel_1.default.findByIdAndUpdate(roomId, { $addToSet: { players: playerName } }, { new: true, session: null } // 使用 session 为 null，除非您需要事务处理
                );
                return room;
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Error adding player to room: ${error.message}`);
                }
                else {
                    throw new Error('Error adding player to room: An unknown error occurred');
                }
            }
        }
        async removePlayerFromRoom(roomId, playerName) {
            try {
                console.log("remove player:", playerName, "from:", roomId);
                const room = await RoomModel_1.default.findByIdAndUpdate(roomId, { $pull: { players: playerName } }, { new: true, session: null } // 使用 session 为 null，除非您需要事务处理
                );
                if (room && room.players.length === 0) {
                    await RoomModel_1.default.findByIdAndRemove(roomId);
                    return null;
                }
                return room;
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Error removing player from room: ${error.message}`);
                }
                else {
                    throw new Error('Error removing player from room: An unknown error occurred');
                }
            }
        }
    }
    exports.RoomService = RoomService;
});
// RoomService.ts
