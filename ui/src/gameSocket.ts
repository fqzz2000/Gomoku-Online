import { io, Socket } from 'socket.io-client';

/**
 * Represents a socket connection for the game.
 */
export class GameSocket {
    private socket: Socket;
    private serverUrl: string;
    private token: string;

    /**
     * Creates an instance of GameSocket.
     * @param serverUrl The URL of the server to connect to.
     */
    constructor(serverUrl: string, token: string) {
        this.serverUrl = serverUrl;
        this.socket = io(this.serverUrl, {
            query: {
                token: token
            }
        });
        this.token = token;
    }

    /**
     * Connects to the server using the provided token.
     * @param token The authentication token.
     */
    public connect(token: string): void {
        this.socket.auth = { token };
        this.socket.connect();

        this.socket.on('connect_error', (err: { message: any; }) => {
            console.error('Connection error:', err.message);
        });
        this.socket.on("error", (error: any) => {
            alert('Error:'+error);
        } );
    }

    /**
     * Disconnects from the server.
     */
    public disconnect(): void {
        this.socket.disconnect();
    }

    /**
     * Joins a room with the specified ID.
     * @param roomId The ID of the room to join.
     */
    public joinRoom(roomId: string, userId: string, username: string): void {
        this.socket.emit('joinRoom', {token:this.token,roomId: roomId, userId: userId, username:username});
    }

    /**
     * Leaves the room with the specified ID.
     * @param roomId The ID of the room to leave.
     */
    public leaveRoom(roomId: string, userId : string): void {
        this.socket.emit('leaveRoom', {token:this.token,roomId: roomId, userId : userId});
    }

   
    public startGame(roomId: string): void {
        this.socket.emit('startGame', {token:this.token,roomId: roomId});
    }

    public getGameState(roomId: string): void {
        this.socket.emit('getGameState', {token:this.token,roomId: roomId});
    }

    /**
     * Places a game piece on the board.
     * 
     * @param roomId - The ID of the room where the game is being played.
     * @param pos - The position where the game piece should be placed, specified as an object with `x` and `y` coordinates.
     */
    public placePiece(roomId: string, x: number, y: number, userId: string): void {
        this.socket.emit('makeMove', {token:this.token,roomId: roomId, x: x, y: y, userId: userId} );
    }

    /**
     * Registers a callback function to be called when a new game starts.
     * @param callback The callback function to be called with the position of the piece.
     */
    public onGameStart(callback: (res : {gameState: any, round: number}) => void): void {
        this.socket.on('gameStart', callback);
    }

    /**
     * Registers a callback function to be called when a game ends.
     * @param callback The callback function to be called with the winner of the game.
     */
    public onGameEnd(callback: (res : {gameState : any, winner: number}) => void): void {

        this.socket.on('gameEnd', callback);
    }

    /**
     * Registers a callback function to be called when the game state is updated.
     * @param callback The callback function to be called with the updated game state.
     */
    public onGameState(callback: (res : {gameState: any, round:number}) => void): void {
        this.socket.on('gameState', callback);
    }


    /**
     * Registers a callback function to be called when room information is received.
     * @param callback The callback function to be called with the room information.
     */
    public onRoomInfo(callback: (roomInfo: any) => void): void {
        this.socket.on('roomInfo', callback);
    }

    /**
     * Registers a callback function to be called when a user joins the room.
     * @param callback The callback function to be called with the user information.
     */
    public onUserJoined(callback: (user: any) => void): void {
        this.socket.on('userJoined', callback);
    }

    /**
     * Registers a callback function to be called when a user leaves the room.
     * @param callback The callback function to be called with the ID of the user who left.
     */
    public onUserLeft(callback: (userId: string) => void): void {
        this.socket.on('userLeft', callback);
    }



}
