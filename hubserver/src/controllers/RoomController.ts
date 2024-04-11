import Room from '../models/RoomModel';
import { Request, Response } from 'express';
import { RoomService } from '../services/RoomService';
export const createRoom = async (req: Request, res: Response) => {
    const { number, player } = req.body;
    const newRoom = new Room({ number, player, status: 'waiting' });
  
    try {
      const savedRoom = await newRoom.save();
      res.status(201).json({
        id: savedRoom._id,
        number: savedRoom.number,
        player: savedRoom.player,
        status: savedRoom.status
      });
    } catch (error) {
      console.error("Error saving room:", error);
      res.status(500).json({ error: "can not save room" });
    }
  };
export const getRoomById = async (req: Request, res: Response) => {
    const roomId = req.params.roomId;
    try {
      const room = await Room.findById(roomId);
      if (room) {
        res.json(room);
      } else {
        res.status(404).send('Room not found');
      }
    } catch (error) {
      console.error("Error finding room by ID:", error);
      res.status(500).send('Internal Server Error');
    }
  };
export const getRooms = async (req: Request, res: Response) => {
    try {
      const rooms = await Room.find();
      const modifiedRooms = rooms.map(room => ({
        id: room._id,
        number: room.number,
        player: room.player,
        status: room.status
      }));
      res.json(modifiedRooms);
    } catch (error) {
      res.status(500).json({ error: "can not get room info" });
    }
  };
  export const deleteRoomById = async (req: Request, res: Response) => {
    const roomId = req.params.id;
    try {
        const result = await Room.findByIdAndRemove(roomId);
        if (result) {
            res.status(204).send(); // 204 No Content
        } else {
            res.status(404).json({ error: "Room not found" }); // 404 Not Found if the room doesn't exist
        }
    } catch (error) {
        console.error("Error deleting room:", error);
        res.status(500).json({ error: "Server error" }); // 500 Internal Server Error
    }
};

export class RoomController {
    private roomService: RoomService;

    constructor() {
        this.roomService = new RoomService();
    }

    public async updateRoomInfo(req : Request, res : Response) {
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
        } catch (error : any) {
            if (error.message === 'Room not found') {
                return res.status(404).json({ message: error.message });
            }
            console.error(error);
            return res.status(500).json({ message: "An error occurred on the server." });
        }
    }
}
