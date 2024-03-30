import { Gomoku } from '../../src/gomoku/gomoku'
import 'mocha';
import { expect } from 'chai';


describe('Gomoku Game Logic', () => {
  let game: Gomoku;

  beforeEach(() => {
    game = new Gomoku();
  });

  it('should start with no winner', () => {
    expect(game.getWinner()).to.equal(-1);
  });

  it('should allow placing a piece on the board', () => {
    expect(game.allocPiece({ x: 0, y: 0 }, 1)).to.be.true;
    expect(game.getWinner()).to.equal(-1); // Still no winner
  });

  it('should prevent placing a piece on an occupied space', () => {
    game.allocPiece({ x: 0, y: 0 }, 1);
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
      for (let y = 0; y < Gomoku.getBoardSize(); y++) {
        game.allocPiece({ x, y }, y % 2 === 0 ? 1 : 2);
      }
    }
    // Manually overwrite the last piece to not trigger a win condition
    game.allocPiece({ x: Gomoku.getBoardSize() - 1, y: Gomoku.getBoardSize() - 1 }, 1);
    expect(game.getWinner()).to.equal(0); // Draw
  });

});