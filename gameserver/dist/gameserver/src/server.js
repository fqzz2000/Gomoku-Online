var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "socket.io", "http", "./gameServer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const socket_io_1 = require("socket.io");
    const http_1 = __importDefault(require("http"));
    const gameServer_1 = require("./gameServer");
    const port = 8181;
    const server = http_1.default.createServer();
    const gameServer = new gameServer_1.GameServer(new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        }
    }));
    server.listen(port);
    console.log('Server listening on port', port);
});
