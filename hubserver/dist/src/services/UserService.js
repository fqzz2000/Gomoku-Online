var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../models/UserModel", "bcrypt"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserService = void 0;
    const UserModel_1 = __importDefault(require("../models/UserModel"));
    const bcrypt_1 = __importDefault(require("bcrypt"));
    class UserService {
        async updateUserProfile(username, password, email, avatar) {
            try {
                const salt = await bcrypt_1.default.genSalt(10);
                const hashedPassword = await bcrypt_1.default.hash(password, salt);
                const doc = await UserModel_1.default.findOneAndUpdate({ username }, { password: hashedPassword, email, avatar }).exec();
                console.log("update user profile: ", doc);
                return await UserModel_1.default.findOne({ username }).exec();
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(error.message);
                }
                else {
                    throw new Error('An unknown error occurred');
                }
            }
        }
        async getUserByUsername(username) {
            console.log("get username: ", username);
            try {
                console.log("get username: ", username);
                const user = await UserModel_1.default.findOne({ username }).exec();
                return user;
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(error.message);
                }
                else {
                    throw new Error('An unknown error occurred');
                }
            }
        }
        async incrementUserGameStats(username, isWin, isDraw) {
            try {
                const user = await this.getUserByUsername(username);
                if (!user) {
                    throw new Error('User not found');
                }
                user.game_stats.total_games_played += 1;
                if (isWin) {
                    user.game_stats.total_wins += 1;
                }
                else if (!isDraw) {
                    user.game_stats.total_losses += 1;
                }
                user.game_stats.win_rate = user.game_stats.total_wins / user.game_stats.total_games_played;
                await user.save();
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(error.message);
                }
                else {
                    throw new Error('An unknown error occurred');
                }
            }
        }
    }
    exports.UserService = UserService;
});
