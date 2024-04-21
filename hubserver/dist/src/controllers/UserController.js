var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../services/UserService", "bcrypt", "jsonwebtoken", "../models/UserModel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserController = exports.loginUser = exports.registerUser = void 0;
    const UserService_1 = require("../services/UserService");
    // userController.ts
    const bcrypt_1 = __importDefault(require("bcrypt"));
    const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
    const UserModel_1 = __importDefault(require("../models/UserModel"));
    const registerUser = async (req, res) => {
        const { username, password, email } = req.body;
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const defaultGameStats = {
            total_games_played: 0,
            total_wins: 0,
            total_losses: 0,
            win_rate: 0,
            average_game_time: 0,
            rank: 'Newbie',
        };
        const user = new UserModel_1.default({
            username,
            password: hashedPassword,
            avatar: "/public/uploads/avatar.png",
            email,
            game_stats: defaultGameStats,
        });
        try {
            const savedUser = await user.save();
            res.status(201).json({ userId: savedUser._id });
        }
        catch (error) {
            console.error("Error registering new user:", error);
            res.status(500).json({ error: 'Error registering new user' });
        }
    };
    exports.registerUser = registerUser;
    const secretKey = process.env.SECRET_KEY || '9b1d8eead0f1b2c3d4e5f6901a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t';
    const loginUser = async (req, res) => {
        const { username, password } = req.body;
        try {
            const user = await UserModel_1.default.findOne({ username }).exec();
            if (user && await bcrypt_1.default.compare(password, user.password)) {
                // 用户认证成功，生成并返回JWT
                const token = jsonwebtoken_1.default.sign({ username: username }, secretKey, { expiresIn: '1h' });
                // 在响应中返回token和用户名
                res.json({ token, username });
            }
            else {
                // 用户认证失败
                res.status(401).json({ error: 'Authentication failed' });
            }
        }
        catch (error) {
            console.error("Error logging in:", error);
            res.status(500).json({ error: 'Server error during login' });
        }
    };
    exports.loginUser = loginUser;
    class UserController {
        constructor() {
            this.userService = new UserService_1.UserService();
        }
        async updateUserProfile(req, res) {
            console.log('Request received');
            const { password, email, avatar, newPassword } = req.body;
            const username = req.user.username;
            const user = await UserModel_1.default.findOne({ username }).exec();
            if (!(user && await bcrypt_1.default.compare(password, user.password))) {
                res.status(401).json({ message: 'Authentication failed' });
                return;
            }
            console.log('start to update user: ', user.username);
            try {
                const user = await this.userService.updateUserProfile(username, newPassword, email, avatar);
                console.log('User updated:', user);
                res.json(user);
            }
            catch (error) {
                console.error('Error updating user:', error);
                if (error instanceof Error) {
                    res.status(500).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'An unknown error occurred' });
                }
            }
        }
        async updateGameResult(req, res) {
            console.log("received request to update Game Result");
            const { gameResult } = req.body;
            const player1 = gameResult.player1;
            const player2 = gameResult.player2;
            const winner = gameResult.winner;
            if (!player1 || !player2 || !winner) {
                res.status(400).json({ message: "Missing 'player1', 'player2', or 'winner'." });
                return;
            }
            console.log("player1: ", player1, " player2: ", player2, " winner: ", winner);
            try {
                await this.userService.incrementUserGameStats(player1, winner === 1, winner === 0);
                await this.userService.incrementUserGameStats(player2, winner === 2, winner === 0);
                res.status(200).json({ message: 'Game result updated successfully' });
            }
            catch (error) {
                console.error('Error updating game result:', error);
                if (error instanceof Error) {
                    res.status(500).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'An unknown error occurred' });
                }
            }
        }
        async getUserProfile(req, res) {
            try {
                console.log('Request received');
                // const username = req.params.username;
                const username = req.user.username;
                console.log('start to get user: ', username);
                const user = await this.userService.getUserByUsername(username);
                console.log('User found:', user);
                if (!user) {
                    res.status(404).json({ message: 'User not found' });
                    console.log('User not found');
                    return;
                }
                res.json(user);
            }
            catch (error) {
                console.error('Error getting user:', error);
                if (error instanceof Error) {
                    res.status(500).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'An unknown error occurred' });
                }
            }
        }
    }
    exports.UserController = UserController;
});
