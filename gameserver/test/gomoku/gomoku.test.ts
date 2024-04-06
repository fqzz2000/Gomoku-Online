import { Gomoku } from '../../src/gomoku'
import 'mocha';
import { expect } from 'chai';


describe('Gomoku Game Logic', () => {
  let game : Gomoku;

  beforeEach(() => {
    game = new Gomoku();
  });
  it ('should start with round 1', () => {
    expect(game.getRound()).to.equal(1);
  });
  it('should start with no winner', () => {
    expect(game.getWinner()).to.equal(-1);
  });

  it('should allow placing a piece on the board', () => {
    expect(game.allocPiece({ x: 0, y: 0 }, 1)).to.be.true;
    expect(game.getWinner()).to.equal(-1); // Still no winner
  });

  it ("should prevent same player from playing twice in a row", () => {
    game.placePiece({ x: 0, y: 0 }, 2);
    expect(game.placePiece({ x: 1, y: 1 }, 2)).to.be.false;
  });

  it ("should alternate between players", () => {
    game.placePiece({ x: 0, y: 0 }, 1);
    expect(game.placePiece({ x: 1, y: 1 }, 2)).to.be.true;
    expect(game.getRound()).to.equal(1);
  });

  it ("should prevent placing a piece out of bounds", () => {
    expect(game.allocPiece({ x: -1, y: 0 }, 1)).to.be.false;
    expect(game.allocPiece({ x: 0, y: -1 }, 1)).to.be.false;
    expect(game.allocPiece({ x: 20, y: 0 }, 1)).to.be.false;
    expect(game.allocPiece({ x: 0, y: 20 }, 1)).to.be.false;
  });

  it('should prevent placing a piece on an occupied space', () => {
    game.placePiece({ x: 0, y: 0 }, 1);
    expect(game.allocPiece({ x: 0, y: 0 }, 2)).to.be.false;
  });

  it('should detect a horizontal win', () => {
    for (let i = 0; i < 5; i++) {
      game.allocPiece({ x: i, y: 0 }, 1);
    }
    expect(game.getWinner()).to.equal(1);
  });

  it('should detect a vertical win', () => {
    for (let i = 0; i < 5; i++) {
      game.allocPiece({ x: 0, y: i }, 1);
    }
    expect(game.getWinner()).to.equal(1);
  });

  it('should detect a diagonal win', () => {
    for (let i = 0; i < 5; i++) {
      game.allocPiece({ x: i, y: i }, 1);
    }
    expect(game.getWinner()).to.equal(1);
  });

  it('should detect a draw when the board is full', () => {
    for (let x = 0; x < Gomoku.getBoardSize(); x++) {
      let color = (x % 2 === 0) ? 1 : 2;
      for (let y = 0; y < Gomoku.getBoardSize(); y++) {
        if (y % 3 === 0) {
          color = (color === 1) ? 2 : 1;
        }
        game.allocPiece({ x, y }, color);
      }
    }
    expect(game.getWinner()).to.equal(0); // Draw
  });

});