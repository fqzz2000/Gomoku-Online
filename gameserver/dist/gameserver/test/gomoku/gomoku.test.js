(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../src/gomoku", "mocha", "chai"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const gomoku_1 = require("../../src/gomoku");
    require("mocha");
    const chai_1 = require("chai");
    describe('Gomoku Game Logic', () => {
        let game;
        beforeEach(() => {
            game = new gomoku_1.Gomoku();
        });
        it('should start with round 1', () => {
            (0, chai_1.expect)(game.getRound()).to.equal(1);
        });
        it('should start with no winner', () => {
            (0, chai_1.expect)(game.getWinner()).to.equal(-1);
        });
        it('should allow placing a piece on the board', () => {
            (0, chai_1.expect)(game.allocPiece({ x: 0, y: 0 }, 1)).to.be.true;
            (0, chai_1.expect)(game.getWinner()).to.equal(-1); // Still no winner
        });
        it("should prevent same player from playing twice in a row", () => {
            game.placePiece({ x: 0, y: 0 }, 2);
            (0, chai_1.expect)(game.placePiece({ x: 1, y: 1 }, 2)).to.be.false;
        });
        it("should alternate between players", () => {
            game.placePiece({ x: 0, y: 0 }, 1);
            (0, chai_1.expect)(game.placePiece({ x: 1, y: 1 }, 2)).to.be.true;
            (0, chai_1.expect)(game.getRound()).to.equal(1);
        });
        it("should prevent placing a piece out of bounds", () => {
            (0, chai_1.expect)(game.allocPiece({ x: -1, y: 0 }, 1)).to.be.false;
            (0, chai_1.expect)(game.allocPiece({ x: 0, y: -1 }, 1)).to.be.false;
            (0, chai_1.expect)(game.allocPiece({ x: 20, y: 0 }, 1)).to.be.false;
            (0, chai_1.expect)(game.allocPiece({ x: 0, y: 20 }, 1)).to.be.false;
        });
        it('should prevent placing a piece on an occupied space', () => {
            game.placePiece({ x: 0, y: 0 }, 1);
            (0, chai_1.expect)(game.allocPiece({ x: 0, y: 0 }, 2)).to.be.false;
        });
        it('should detect a horizontal win', () => {
            for (let i = 0; i < 5; i++) {
                game.allocPiece({ x: i, y: 0 }, 1);
            }
            (0, chai_1.expect)(game.getWinner()).to.equal(1);
        });
        it('should detect a vertical win', () => {
            for (let i = 0; i < 5; i++) {
                game.allocPiece({ x: 0, y: i }, 1);
            }
            (0, chai_1.expect)(game.getWinner()).to.equal(1);
        });
        it('should detect a diagonal win', () => {
            for (let i = 0; i < 5; i++) {
                game.allocPiece({ x: i, y: i }, 1);
            }
            (0, chai_1.expect)(game.getWinner()).to.equal(1);
        });
        it('should detect a draw when the board is full', () => {
            for (let x = 0; x < gomoku_1.Gomoku.getBoardSize(); x++) {
                let color = (x % 2 === 0) ? 1 : 2;
                for (let y = 0; y < gomoku_1.Gomoku.getBoardSize(); y++) {
                    if (y % 3 === 0) {
                        color = (color === 1) ? 2 : 1;
                    }
                    game.allocPiece({ x, y }, color);
                }
            }
            (0, chai_1.expect)(game.getWinner()).to.equal(0); // Draw
        });
    });
});
