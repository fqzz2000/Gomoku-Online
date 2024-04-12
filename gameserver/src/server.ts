import { Server } from "socket.io";
import { AuthService } from './AuthService';
import { Room } from './room';
import http from 'http';
import { Socket } from "dgram";
import {GameServer} from './gameServer';


const port = 8181;
const server = http.createServer();
const gameServer = new GameServer(new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"], 
  }
}));
server.listen(port,'0.0.0.0')
console.log('Server listening on port', port);