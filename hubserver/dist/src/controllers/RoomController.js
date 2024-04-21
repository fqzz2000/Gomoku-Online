var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../models/RoomModel", "../services/RoomService"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.removePlayerFromRoom = exports.addPlayerToRoom = exports.RoomController = exports.deleteRoomById = exports.getRooms = exports.getRoomById = exports.createRoom = void 0;
    const RoomModel_1 = __importDefault(require("../models/RoomModel"));
    const RoomService_1 = require("../services/RoomService");
    const createRoom = async (req, res) => {
        const { number, players } = req.body;
        const newRoom = new RoomModel_1.default({
            number,
            players: players,
            status: 'waiting'
        });
        try {
            const savedRoom = await newRoom.save();
            res.status(201).json({
                id: savedRoom._id,
                number: savedRoom.number,
                players: savedRoom.players,
                status: savedRoom.status
            });
        }
        catch (error) {
            console.error("Error saving room:", error);
            res.status(500).json({ error: "can not save room" });
        }
    };
    exports.createRoom = createRoom;
    const getRoomById = async (req, res) => {
        const roomId = req.params.roomId;
        try {
            const room = await RoomModel_1.default.findById(roomId);
            if (room) {
                res.json(room);
            }
            else {
                res.status(404).send('Room not found');
            }
        }
        catch (error) {
            console.error("Error finding room by ID:", error);
            res.status(500).send('Internal Server Error');
        }
    };
    exports.getRoomById = getRoomById;
    const getRooms = async (req, res) => {
        try {
            const rooms = await RoomModel_1.default.find();
            const modifiedRooms = rooms.map(room => ({
                id: room._id,
                number: room.number,
                players: room.players,
                status: room.status
            }));
            res.json(modifiedRooms);
        }
        catch (error) {
            res.status(500).json({ error: "can not get room info" });
        }
    };
    exports.getRooms = getRooms;
    const deleteRoomById = async (req, res) => {
        const roomId = req.params.id;
        try {
            const result = await RoomModel_1.default.findByIdAndRemove(roomId);
            if (result) {
                res.status(204).send(); // 204 No Content
            }
            else {
                res.status(404).json({ error: "Room not found" }); // 404 Not Found if the room doesn't exist
            }
        }
        catch (error) {
            console.error("Error deleting room:", error);
            res.status(500).json({ error: "Server error" }); // 500 Internal Server Error
        }
    };
    exports.deleteRoomById = deleteRoomById;
    class RoomController {
        constructor() {
            this.roomService = new RoomService_1.RoomService();
        }
        async updateRoomInfo(req, res) {
            try {
                const { roomId, roomState } = req.body;
                console.log("received request to update room info to: ", roomState, " for room: ", roomId);
                if (!roomId || !roomState) {
                    return res.status(400).json({ message: "Missing 'roomId' or 'roomState'." });
                }
                const updatedRoom = await this.roomService.updateRoomInfo(roomId, roomState);
                return res.status(200).json({
                    message: "Room information updated successfully.",
                    data: updatedRoom,
                });
            }
            catch (error) {
                if (error.message === 'Room not found') {
                    return res.status(404).json({ message: error.message });
                }
                console.error(error);
                return res.status(500).json({ message: "An error occurred on the server." });
            }
        }
    }
    exports.RoomController = RoomController;
    const roomService = new RoomService_1.RoomService();
    const addPlayerToRoom = async (req, res) => {
        const { roomId, playerName } = req.body;
        try {
            const room = await roomService.addPlayerToRoom(roomId, playerName);
            if (room) {
                res.status(200).json(room);
            }
            else {
                res.status(404).json({ message: "Room not found" });
            }
        }
        catch (error) {
            console.error("Error in controller adding player to room:", error);
            res.status(500).json({ message: "Server error" });
        }
    };
    exports.addPlayerToRoom = addPlayerToRoom;
    const removePlayerFromRoom = async (req, res) => {
        const { roomId, playerName } = req.body;
        console.log("removinf start.");
        try {
            console.log("removinf start.");
            const room = await roomService.removePlayerFromRoom(roomId, playerName);
            if (room) {
                res.status(200).json(room);
            }
            else {
                res.status(204).send();
            }
        }
        catch (error) {
            console.error("Error in controller removing player from room:", error);
            res.status(500).json({ message: "Server error" });
        }
    };
    exports.removePlayerFromRoom = removePlayerFromRoom;
});
