import { expect } from 'chai';
import { Room } from '../../src/room';

describe('Room', () => {
  it('should add a user to the room', () => {
    const room = new Room('room1');
    const user = { id: 'user1', username: 'User One' };
    room.addUser(user);

    expect(room.getUsers()).to.include(user);
    expect(room.getUserCount()).to.equal(1);
  });

  it('should remove a user from the room', () => {
    const room = new Room('room1');
    const user = { id: 'user1', username: 'User One' };
    room.addUser(user);
    room.removeUser(user.id);

    expect(room.getUserCount()).to.equal(0);
  });
});
