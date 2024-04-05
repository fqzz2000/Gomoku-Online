export class Gomoku {
    private static boardSize: number = 15;
    private board: number[][];
    private winner: number;
    private round: number;
  
    constructor() {
      this.board = [];
      this.winner = -1; // -1 represents the game is still going on 0 represents a draw game
      this.newGame();
      this.round = 1;
    }
  
    /**
     * Resets the game board and winner status to start a new game.
     */
    newGame(): void {
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
    allocPiece(pos: { x: number, y: number }, playerId: number): boolean {
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

    placePiece(pos: {x : number, y: number}, playerId: number): boolean {
        if (playerId != this.round) {
            return false;
        }
        this.round = 3 - this.round;
        return this.allocPiece(pos, playerId);
    }

  
    /**
     * Gets the winner of the Gomoku game.
     * 
     * @returns The player number of the winner. Returns -1 if the game is still ongoing.
     */
    getWinner(): number {
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
    private checkWinner(pos: { x: number, y: number }, playerId: number): void {
      const directions = [
        { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, 
        { dx: 1, dy: 1 }, { dx: 1, dy: -1 } 
      ];
  
      for (const {dx, dy} of directions) {
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
    private countDirection(start: { x: number, y: number }, dx: number, dy: number, playerId: number): number {
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

    public static getBoardSize(): number {
        return Gomoku.boardSize;
    }

    public getBoard(): number[][] {
        return this.board;
    }

    public getRound(): number {
        return this.round;
    }
  }
  