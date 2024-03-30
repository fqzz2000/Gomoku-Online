import { Server } from "socket.io";
import { AuthService } from './AuthService';
import { Room } from './room';
import http from 'http';
import { Socket } from "dgram";

export class GameServer {
  private io: Server;
  private authService: AuthService = new AuthService();
  private rooms: Map<string, Room> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.io.on('connection', (socket) => {
      socket.on('joinRoom', (token: string, roomId: string) => {
        if (!this.authService.verifyToken(token)) {
          socket.emit('error', 'Authentication failed');
          return;
        }

        if (!this.rooms.has(roomId)) {
          this.rooms.set(roomId, new Room(roomId));
        }

        const room = this.rooms.get(roomId);
        if (room === undefined) {
          socket.emit('error', 'Room not found');
          return;
        }
        const user = { id: socket.id, username: 'example' }; // Get username from decoded token
        room.addUser(user);

        socket.join(roomId);
        socket.emit('roomInfo', { roomId, users: room.getUsers() });

        socket.to(roomId).emit('userJoined', user);
      });
      
      socket.on('disconnect', (token:string, roomId: string) => {
        if (!this.authService.verifyToken(token)) {
          socket.emit('error', 'Authentication failed');
          return;
        }

        const room = this.rooms.get(roomId);
        if (room === undefined) {
          socket.emit('error', 'Room not found');
          return;
        }
        room.removeUser(socket.id);
        socket.to(roomId).emit('roomInfo', { roomId, users: room.getUsers() });
      });
    });
    
  }
}


const server = http.createServer();
const gameServer = new GameServer(new Server(server));
