(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Gomoku = void 0;
    class Gomoku {
        constructor() {
            this.board = [];
            this.winner = -1; // -1 represents the game is still going on 0 represents a draw game
            this.newGame();
            this.round = 1;
        }
        /**
         * Resets the game board and winner status to start a new game.
         */
        newGame() {
            this.board = Array(Gomoku.boardSize).fill(0).map(() => Array(Gomoku.boardSize).fill(0));
            this.winner = -1;
            this.round = 1;
        }
        /**
         * Allocates a piece on the game board at the specified position for the given player.
         *
         * @param pos - The position where the piece should be allocated.
         * @param playerId - The ID of the player.
         * @returns A boolean indicating whether the piece was successfully allocated.
         */
        allocPiece(pos, playerId) {
            if (pos.x < 0 || pos.x >= Gomoku.boardSize || pos.y < 0 || pos.y >= Gomoku.boardSize) {
                return false;
            }
            if (this.board[pos.x][pos.y] !== 0) {
                return false;
            }
            if (this.winner === -1) {
                this.board[pos.x][pos.y] = playerId;
                this.checkWinner(pos, playerId);
                return true;
            }
            return false;
        }
        placePiece(pos, playerId) {
            if (playerId != this.round) {
                return false;
            }
            if (this.allocPiece(pos, playerId)) {
                this.round = 3 - this.round;
                return true;
            }
            return false;
        }
        /**
         * Gets the winner of the Gomoku game.
         *
         * @returns The player number of the winner. Returns -1 if the game is still ongoing.
         */
        getWinner() {
            if (this.winner !== -1) {
                return this.winner;
            }
            // check for draw
            if (this.board.every(row => row.every(cell => cell !== 0))) {
                this.winner = 0;
                return 0;
            }
            return -1; // game is still going on
        }
        /**
         * Checks if a player has won the game based on the given position and player ID.
         * @param pos - The position of the last move made by the player.
         * @param playerId - The ID of the player.
         */
        checkWinner(pos, playerId) {
            const directions = [
                { dx: 1, dy: 0 }, { dx: 0, dy: 1 },
                { dx: 1, dy: 1 }, { dx: 1, dy: -1 }
            ];
            for (const { dx, dy } of directions) {
                let count = 1;
                count += this.countDirection(pos, dx, dy, playerId);
                count += this.countDirection(pos, -dx, -dy, playerId);
                if (count >= 5) {
                    this.winner = playerId;
                    return;
                }
            }
        }
        /**
         * Counts the number of consecutive stones in a given direction starting from a specified position.
         *
         * @param start - The starting position of the stone.
         * @param dx - The change in x-coordinate for each step in the specified direction.
         * @param dy - The change in y-coordinate for each step in the specified direction.
         * @param playerId - The ID of the player whose stones are being counted.
         * @returns The number of consecutive stones in the specified direction.
         */
        countDirection(start, dx, dy, playerId) {
            let count = 0;
            let x = start.x + dx;
            let y = start.y + dy;
            while (x >= 0 && x < Gomoku.boardSize && y >= 0 && y < Gomoku.boardSize && this.board[x][y] === playerId) {
                count++;
                x += dx;
                y += dy;
            }
            return count;
        }
        static getBoardSize() {
            return Gomoku.boardSize;
        }
        getBoard() {
            // console.log("getBoard called")
            // console.log(this.board)
            return this.board;
        }
        getRound() {
            return this.round;
        }
    }
    exports.Gomoku = Gomoku;
    Gomoku.boardSize = 15;
});
