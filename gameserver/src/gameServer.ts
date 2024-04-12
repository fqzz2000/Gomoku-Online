import { Server } from "socket.io";
import express, { Request, Response, NextFunction } from 'express';
import { AuthService } from './AuthService';
import { Room } from './room';
import { Gomoku } from "./gomoku";
import axios from 'axios';


const port = 8181;



export class GameServer {
  private io: Server;
  private authService: AuthService = new AuthService();
  private rooms: Map<string, Room> = new Map();

  private static changeRoomState(roomId: string, roomState: string) {
    axios.post('http://localhost:8131/api/UpdateRoomState', { roomId: roomId, roomState: roomState})
      .then((res) => {
        console.log(`statusCode: ${res.status}`);
        console.log(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  private static updateGameResult(user1 : string, user2 : string, winner : number) {
    axios.post('http://localhost:8131/api/UpdateGameResult', { gameResult:{ winner : winner, player1 : user1, player2 : user2}})
      .then((res) => {
        console.log(`statusCode: ${res.status}`);
        console.log(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  constructor(io: Server) {
    this.io = io;
    
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      socket.on("getGameState", (req) => {
        const { token, roomId } = req;
        if (!this.authService.verifyToken(token)) {
          socket.emit('error', 'Authentication failed');
          return;
        }
        const room = this.rooms.get(roomId);
        if (room === undefined) {
          socket.emit('error', 'Room not found');
          return;
        }
        socket.emit('gameState', { board: room.game.getBoard(), round: room.game.getRound() });
      });
      socket.on('joinRoom', (req) => {
        const { token, roomId, userId, username } = req;
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
        const user = { id: userId, username: username }; // Get username from decoded token
        socket.join(roomId);
        // makesure the user is not already in the room
        if (room.getUserIndex(userId) !== -1) {
          console.log("duplicate user", user , "in room", roomId)
          console.log("current users in room", room.getUsers())
          
          this.io.to(roomId).emit('roomInfo', { roomId: roomId, users: room.getUsers() });
          return;
        }
        console.log("add user", user , "to room", roomId)
        if (!room.addUser(user)) {
          socket.emit('error', 'Room is full');
          return;
        }


        // socket.emit('roomInfo', { roomId, users: room.getUsers() });
        this.io.to(roomId).emit('roomInfo', { roomId: roomId, users: room.getUsers() });
      });
      
      socket.on("leaveRoom", (req) => {
        const { token, roomId, userId } = req;
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
        room.removeUser(userId);
        this.io.to(roomId).emit('roomInfo', { roomId: roomId, users: room.getUsers() });
      } );

      socket.on("startGame", (req) => {
        const { token, roomId } = req;
        if (!this.authService.verifyToken(token)) {
          socket.emit('error', 'Authentication failed');
          return;
        }
        // check if the room exists and has 2 users
        const room = this.rooms.get(roomId);
        if (room === undefined) {
          socket.emit('error', 'Room not found');
          return;
        }
        if (room.getUserCount() !== 2) {
          socket.emit('error', 'Room does not have enough users');
          return;
        }
        // start the game
        room.game.newGame();
        // inform the hub server
        GameServer.changeRoomState(roomId, 'playing');
        // send the game state to the users
        this.io.to(roomId).emit('gameStart', { board: room.game.getBoard(), round: room.game.getRound() });
      });

      socket.on("makeMove", (req) => {
        const { token, roomId, x, y, userId } = req;
        if (!this.authService.verifyToken(token)) {
          socket.emit('error', 'Authentication failed');
          return;
        }
        console.log('User made a move:', x, y, userId);
        socket.join(roomId);
        const room = this.rooms.get(roomId);
        if (room === undefined) {
          socket.emit('error', 'Room not found');
          return;
        }
        let userIndex = room.getUserIndex(userId);
        if (userIndex === -1) {
          socket.emit('error', 'User not found');
          return;
        }
        if (room.game.getWinner() !== -1) {
          this.io.to(roomId).emit('gameEnd', { board:room.game.getBoard(), winner: room.game.getWinner() });
          return;
        }
        if (room.game.getRound() !== userIndex + 1) {
          socket.emit('error', 'Not your turn');
          return;
        }
        if (!room.game.placePiece({x : y, y : x}, userIndex + 1)) {
          socket.emit('error', 'Invalid move');
          return;
        }
        this.io.to(roomId).emit('gameState', { board: room.game.getBoard(), round: room.game.getRound() });
        console.log('Game state broadcasted');
        if (room.game.getWinner() !== -1) {
          this.io.to(roomId).emit('gameEnd', { board:room.game.getBoard(), winner: room.game.getWinner() });
          // inform the hub server
          GameServer.changeRoomState(roomId, 'ended');
          // update the game result
          GameServer.updateGameResult(room.getUsers()[0].username, room.getUsers()[1].username, room.game.getWinner());
        }
      });

    });
    
  }
}



