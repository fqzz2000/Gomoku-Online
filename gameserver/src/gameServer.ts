import { Server } from "socket.io";
import { AuthService } from './AuthService';
import { Room } from './room';
const port = 8181;
export class GameServer {
  private io: Server;
  private authService: AuthService = new AuthService();
  private rooms: Map<string, Room> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      socket.on('joinRoom', (req) => {
        const { token, roomId, username } = req;
        if (!this.authService.verifyToken(token)) {
          socket.emit('error', 'Authentication failed');
          return;
        }
        console.log('User joined room:', roomId);
        console.log('Username:', username);

        if (!this.rooms.has(roomId)) {
          this.rooms.set(roomId, new Room(roomId));
        }

        const room = this.rooms.get(roomId);
        if (room === undefined) {
          socket.emit('error', 'Room not found');
          return;
        }
        const user = { id: socket.id, username: username }; // Get username from decoded token
        if (!room.addUser(user)) {
          socket.emit('error', 'Room is full');
          return;
        }

        socket.join(roomId);
        // socket.emit('roomInfo', { roomId, users: room.getUsers() });
        this.io.to(roomId).emit('roomInfo', { roomId: roomId, users: room.getUsers() });
      });
      
      socket.on("leaveRoom", (req) => {
        const { token, roomId } = req;
        if (!this.authService.verifyToken(token)) {
          socket.emit('error', 'Authentication failed');
          return;
        }
        console.log('User left room:', roomId);
        const room = this.rooms.get(roomId);
        if (room === undefined) {
          socket.emit('error', 'Room not found');
          return;
        }
        socket.leave(roomId);
        room.removeUser(socket.id);
        this.io.to(roomId).emit('roomInfo', { roomId: roomId, users: room.getUsers() });
      } );
    });
    
  }
}



