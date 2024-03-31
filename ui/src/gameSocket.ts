import { io, Socket } from 'socket.io-client';

/**
 * Represents a socket connection for the game.
 */
export class GameSocket {
    private socket: Socket;
    private serverUrl: string;

    /**
     * Creates an instance of GameSocket.
     * @param serverUrl The URL of the server to connect to.
     */
    constructor(serverUrl: string) {
        this.serverUrl = serverUrl;
        this.socket = io(this.serverUrl);
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
    public joinRoom(roomId: string, username: string): void {
        this.socket.emit('joinRoom', {token:"placeholder",roomId: roomId, username:username});
    }

    /**
     * Leaves the room with the specified ID.
     * @param roomId The ID of the room to leave.
     */
    public leaveRoom(roomId: string): void {
        this.socket.emit('leaveRoom', {token:"placeholder",roomId: roomId});
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
