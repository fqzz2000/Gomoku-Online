import { expect } from 'chai';
import sinon from 'sinon';
require('sinon-mongoose');
import { UserService } from '../../src/services/UserService'; 
import User from '../../src/models/UserModel'; 

describe('UserService', () => {
  let userService: UserService;
  let mock: any;

  beforeEach(() => {
    userService = new UserService();
    mock = sinon.mock(User);
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
      expect(user).to.be.eql(expectedUser);
      mock.verify();
    });

    it('should throw an error if an exception occurs', async () => {
      mock.expects('findOne').withArgs({ username: 'testUser' }).chain("exec").rejects(new Error('An error occurred'));

      try {
        await userService.getUserByUsername('testUser');
        // ensure that error has message attribute
      } catch (error : any) {
        expect(error.message).to.equal('An error occurred');
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
        save: sinon.spy()
      };

      mock.expects('findOne').withArgs({ username: 'winnerUser' }).chain("exec").resolves(user);

      await userService.incrementUserGameStats('winnerUser', true, false);
      expect(user.game_stats.total_games_played).to.equal(2);
      expect(user.game_stats.total_wins).to.equal(2);
      expect(user.save.calledOnce).to.be.true;
      mock.verify();
    });

    it('should handle user not found error', async () => {
      mock.expects('findOne').withArgs({ username: 'nonExistentUser' }).chain("exec").resolves(null);

      try {
        await userService.incrementUserGameStats('nonExistentUser', true, false);
      } catch (error : any) {
        expect(error.message).to.equal('User not found');
      }

      mock.verify();
    });
  });
});
