(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./gomoku"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Room = void 0;
    const gomoku_1 = require("./gomoku");
    class Room {
        constructor(roomId) {
            this.users = [];
            this.roomId = roomId;
            this.game = new gomoku_1.Gomoku();
        }
        addUser(user) {
            if (this.users.length == 2) {
                return false;
            }
            this.users.push(user);
            return true;
        }
        removeUser(userId) {
            console.log('remove:', userId);
            this.users = this.users.filter(user => user.id !== userId);
        }
        getUserCount() {
            return this.users.length;
        }
        getUsers() {
            return this.users;
        }
        getUserIndex(userId) {
            return this.users.findIndex(user => user.id === userId);
        }
    }
    exports.Room = Room;
});
