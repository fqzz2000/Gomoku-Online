var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "chai", "sinon", "../../src/services/UserService", "../../src/models/UserModel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const chai_1 = require("chai");
    const sinon_1 = __importDefault(require("sinon"));
    require('sinon-mongoose');
    const UserService_1 = require("../../src/services/UserService");
    const UserModel_1 = __importDefault(require("../../src/models/UserModel"));
    describe('UserService', () => {
        let userService;
        let mock;
        beforeEach(() => {
            userService = new UserService_1.UserService();
            mock = sinon_1.default.mock(UserModel_1.default);
        });
        afterEach(() => {
            mock.restore();
        });
        describe('getUserByUsername', () => {
            it('should return a user if it exists', async () => {
                const expectedUser = {
                    username: 'testUser',
                    game_stats: {
                        total_games_played: 0,
                        total_wins: 0,
                        total_losses: 0,
                        win_rate: 0
                    }
                };
                mock.expects('findOne').withArgs({ username: 'testUser' }).chain("exec").resolves(expectedUser);
                const user = await userService.getUserByUsername('testUser');
                (0, chai_1.expect)(user).to.be.eql(expectedUser);
                mock.verify();
            });
            it('should throw an error if an exception occurs', async () => {
                mock.expects('findOne').withArgs({ username: 'testUser' }).chain("exec").rejects(new Error('An error occurred'));
                try {
                    await userService.getUserByUsername('testUser');
                    // ensure that error has message attribute
                }
                catch (error) {
                    (0, chai_1.expect)(error.message).to.equal('An error occurred');
                }
                mock.verify();
            });
        });
        describe('incrementUserGameStats', () => {
            it('should increment user stats correctly for a win', async () => {
                const user = {
                    username: 'winnerUser',
                    game_stats: {
                        total_games_played: 1,
                        total_wins: 1,
                        total_losses: 0,
                        win_rate: 1
                    },
                    save: sinon_1.default.spy()
                };
                mock.expects('findOne').withArgs({ username: 'winnerUser' }).chain("exec").resolves(user);
                await userService.incrementUserGameStats('winnerUser', true, false);
                (0, chai_1.expect)(user.game_stats.total_games_played).to.equal(2);
                (0, chai_1.expect)(user.game_stats.total_wins).to.equal(2);
                (0, chai_1.expect)(user.save.calledOnce).to.be.true;
                mock.verify();
            });
            it('should handle user not found error', async () => {
                mock.expects('findOne').withArgs({ username: 'nonExistentUser' }).chain("exec").resolves(null);
                try {
                    await userService.incrementUserGameStats('nonExistentUser', true, false);
                }
                catch (error) {
                    (0, chai_1.expect)(error.message).to.equal('User not found');
                }
                mock.verify();
            });
        });
    });
});
