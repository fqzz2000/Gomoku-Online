import { expect } from 'chai';
import { createServer, Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { GameServer } from '../../src/gameServer';

describe('GameServer', () => {
  let httpServer: HttpServer;
  let io: SocketIOServer;
  let clientSocket: ClientSocket;
  let clientSocket2: ClientSocket;

  beforeEach((done) => {
    httpServer = createServer();
    io = new SocketIOServer(httpServer);
    new GameServer(io); // 假设GameServer构造函数正确地初始化了socket.io事件监听器
    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      clientSocket = Client(`http://localhost:${port}`);
      clientSocket2 = Client(`http://localhost:${port}`);
      clientSocket.on('connect', done);
    });
  });

  afterEach(() => {
    io.close();
    clientSocket.close();
    clientSocket2.close();
  });

  it('should join a room', (done) => {
    clientSocket.emit('joinRoom', 'validToken', 'room1');
    clientSocket.on('roomInfo', (data) => {
      expect(data).to.have.property('roomId', 'room1');
      done();
    });
  });

  it('two clients should join the same room', (done) => {
    clientSocket.emit('joinRoom', 'validToken', 'room2');
    clientSocket2.emit('joinRoom', 'validToken', 'room2');
    clientSocket.on('roomInfo', (data) => {
      expect(data).to.have.property('roomId', 'room2');
      clientSocket2.on('roomInfo', (data) => {
        expect(data).to.have.property('roomId', 'room2');
        done();
      });
    });
    clientSocket.on('userJoined', (data) => {
      expect(data).to.have.property('id', clientSocket2.id);
    })
  });

  it('two clients join different rooms', (done) => {
    clientSocket.emit('joinRoom', 'validToken', 'room3');
    clientSocket2.emit('joinRoom', 'validToken', 'room4');
    clientSocket.on('roomInfo', (data) => {
      expect(data).to.have.property('roomId', 'room3');
      clientSocket2.on('roomInfo', (data) => {
        expect(data).to.have.property('roomId', 'room4');
        done();
      });
    });
  });

  it ('should emit roomInfo event when a user disconnects', (done) => {
    clientSocket.emit('joinRoom', 'validToken', 'room5');
    clientSocket2.emit('joinRoom', 'validToken', 'room5');
    clientSocket2.on('roomInfo', (data) => {
      expect(data.users).to.have.lengthOf(2);
      clientSocket2.disconnect();
    });
    clientSocket.on('roomInfo', (data) => {
      expect(data.users).to.have.lengthOf(1);
      done();
    });
  });



});
