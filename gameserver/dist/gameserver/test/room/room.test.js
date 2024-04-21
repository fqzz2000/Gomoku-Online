(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "chai", "../../src/room"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const chai_1 = require("chai");
    const room_1 = require("../../src/room");
    describe('Room', () => {
        it('should add a user to the room', () => {
            const room = new room_1.Room('room1');
            const user = { id: 'user1', username: 'User One' };
            room.addUser(user);
            (0, chai_1.expect)(room.getUsers()).to.include(user);
            (0, chai_1.expect)(room.getUserCount()).to.equal(1);
        });
        it('should remove a user from the room', () => {
            const room = new room_1.Room('room1');
            const user = { id: 'user1', username: 'User One' };
            room.addUser(user);
            room.removeUser(user.id);
            (0, chai_1.expect)(room.getUserCount()).to.equal(0);
        });
    });
});
