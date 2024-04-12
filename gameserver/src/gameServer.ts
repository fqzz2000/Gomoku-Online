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
    // this.io.use((socket, next) => {
    //   const token = socket.handshake.query.token as string;
    //   // console.log('Authenticating Token:', token);
    //   if (!this.authService.verifyToken(token)) {
    //     return next(new Error('Authentication failed'));
    //   }
    //   console.log('Authentication successful Token:', token);
    //   next();
    // })
    
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      socket.on("getGameState", async (req) => {
        const { token, roomId } = req;
        let username = await this.authService.verifyToken(token);
        if (username === false) {
          socket.emit('error', 'Authentication failed');
          return;
        }
        console.log('User requested game state:', roomId);
        const room = this.rooms.get(roomId);
        if (room === undefined) {
          socket.emit('error', 'Room not found');
          return;
        }
        socket.join(roomId);
        socket.emit('gameState', { board: room.game.getBoard(), round: room.game.getRound() });
      });
      socket.on('joinRoom', async (req) => {
        const { token, roomId, userId, username } = req;
        let usrname = await this.authService.verifyToken(token);
        if (usrname === false) {
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
        const user = { id: usrname, username: usrname }; // Get username from decoded token
        socket.join(roomId);
        // makesure the user is not already in the room
        if (room.getUserIndex(usrname) !== -1) {
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
      
      socket.on("leaveRoom", async (req) => {
        const { token, roomId, userId } = req;
        let usrname = await this.authService.verifyToken(token);
        if (usrname === false) {
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
        room.removeUser(usrname);
        this.io.to(roomId).emit('roomInfo', { roomId: roomId, users: room.getUsers() });
      } );

      socket.on("startGame", async (req) => {
        const { token, roomId } = req;
        let usr = await this.authService.verifyToken(token);
        if (usr === false) {
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

      socket.on("makeMove", async (req) => {
        const { token, roomId, x, y, userId } = req;
        let usrname = await this.authService.verifyToken(token);
        if (usrname === false) {
          socket.emit('error', 'Authentication failed');
          return;
        }
        console.log('User made a move:', x, y, usrname);
        socket.join(roomId);
        const room = this.rooms.get(roomId);
        if (room === undefined) {
          socket.emit('error', 'Room not found');
          return;
        }
        let userIndex = room.getUserIndex(usrname);
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



