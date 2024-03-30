interface User {
    id: string;
    username: string;
  }
  
export class Room {
    private users: User[] = [];
    public roomId: string;
  
    constructor(roomId: string) {
      this.roomId = roomId;
    }
  
    addUser(user: User): void {
      this.users.push(user);
    }
  
    removeUser(userId: string): void {
      this.users = this.users.filter(user => user.id !== userId);
    }
  
    getUserCount(): number {
      return this.users.length;
    }
  
    getUsers(): User[] {
      return this.users;
    }

  }
  