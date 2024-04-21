<template>
  <b-container fluid lobby>
    <!-- Row for the room list and the user profile/chat section -->
    <b-row>
      <!-- Room List Section -->
      <b-col md="8" class="room-list-section">
        <b-card no-body class="mb-1 semi-transparent" header="Room List">
          <b-list-group flush>
            <!-- Use v-for to list rooms here -->
            <b-list-group-item button v-for="room in rooms" :key="room.id" @click="enterRoom(room)">
              Room {{ room.number }} - Player: {{ room.players.join(', ') }}  [{{ room.status }}]
              <b-button variant="danger" class="float-right" @click.stop="deleteRoom(room.id)">Delete</b-button>
            </b-list-group-item>
          </b-list-group>
        </b-card>
        <b-button @click="addRoom">Add Room</b-button>

      </b-col>

      <!-- User Profile/Chat Section -->
      <b-col md="4">
        <ProfileBlock :user="user" :enable-edit="true" :enable-upload="false"/>
        <b-button variant="danger" @click="logout">Logout</b-button>
        <b-button variant="primary" @click="goToLogin">Login</b-button>

        <b-card no-body header="More Profile or A chat room">
          <!-- Chat or profile content here -->
        </b-card>

      </b-col>
    </b-row>
  </b-container>
</template>


  <script setup lang="ts">
  import axios from 'axios';
  import { onMounted ,ref} from 'vue';
  import { toRaw } from 'vue';
  import { useRouter } from 'vue-router';
  import { getWithToken, postWithToken, deleteWithToken } from '../utils';
  import ProfileBlock from './ProfileBlock.vue';
  const router = useRouter();



  onMounted(() => {
  //const username = localStorage.getItem('username'); 
  //const username=req.user.username;
  fetchRooms();
  fetchUserInfo(); 
  });

  interface Room {
  id: string;
  number: string;
  players: string[];
  status: 'waiting' | 'playing' | 'ready';
}

const rooms = ref<Room[]>([]);

 
  const user = ref({
    avatar: '/public/uploads/avatar.png',
    name: 'Alice',
    games: 10,
    winRate: 70,
    email: "123@123.com"
  });



  async function fetchUserInfo() {
    try {
     const username = "xsasa";
      
      console.log('User info is fetching');
      const response = await getWithToken(`/api/users/${username}`, localStorage.getItem('token') as string);

      user.value = {
      avatar: response.data.avatar || '../assets/images.png', 
      name: response.data.username, 
      games: response.data.game_stats.total_games_played,
      winRate: response.data.game_stats.total_games_played === 0 ? 0 : (response.data.game_stats.total_wins / response.data.game_stats.total_games_played) * 100,
      email: response.data.email

      }
      console.log('User info fetched:', response.data);
    
    
  
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to fetch user info:', error.response?.data.error);
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }
}
  const fetchRooms = async () => {
  try {

const response = await getWithToken('/api/rooms', localStorage.getItem('token') as string);

    rooms.value = response.data;
    console.log("room info:",toRaw(rooms.value));
  } catch (error) {
    
  
console.error(error);
  }
};
const addRoom = async () => {
  try {
    console.log("Adding a new room, token:", localStorage.getItem('token'));
    const maxNumber = rooms.value.reduce((max, room) => Math.max(max, Number(room.number)), 0);
    const newNumber = maxNumber + 1;
    const response = await axios.post('/api/rooms', {
      number: newNumber.toString(),
      players: [user.value.name],
      status: 'waiting'  // Make sure new rooms are set to 'waiting'
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const newRoom = response.data;
    rooms.value.push(newRoom);
    enterRoom(newRoom);  // Redirect to the new room immediately
    fetchRooms();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 检查HTTP状态码
      if (error.response && error.response.status === 403) {
        alert('You do not have permission to perform this action.');  // 显示警告消息
      } else {
        console.error('Failed to add room:', error.response?.data || 'An unknown error occurred');
      }
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }
};
function goToLogin() {
  router.push('/login');  // 确保这里的路径与你的路由配置匹配
}

const deleteRoom = async (roomId: string) => {
  try {
    console.log("Attempting to delete room with ID:", roomId);
    await axios.delete(`/api/rooms/${roomId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    fetchRooms(); 
  } catch (error) {
    if (axios.isAxiosError(error)) {
    
      if (error.response && error.response.status === 403) {
        alert('You do not have permission to delete this room.');  
      } else {
        console.error('Failed to delete room:', error.response?.data || 'An unknown error occurred');
      }
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }
};

const enterRoom = async (room: Room) => {
  try {
    if (room.status === 'waiting') {
   
      const response = await axios.post('/api/rooms/:roomId/players/add', {
        roomId: room.id,
        playerName: user.value.name
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.status === 200) {
        console.log("User added to room:", response.data);
        await router.push({ name: 'Room', params: { roomId: room.id }, query: { username: user.value.name }});
      } else {
        console.error('Failed to join room:', response.data);
        alert('Failed to join room.');
      }
    } else {
      console.log(`Cannot enter room ${room.number}: Room is not in waiting status.`);
      alert(`Cannot enter room ${room.number}: Room is currently ${room.status}.`);
    }
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error('Error entering room:', error);
    alert(`Error entering room: ${error.message}`);
  } else {
   
    console.error('Error entering room:', error);
    alert('Error entering room: An unknown error occurred.');

  }
}

};
const logout = async () => {
  try {
    await axios.post('/api/logout'); 
    localStorage.removeItem('token'); 
    router.push('/login'); 
  } catch (error) {
    console.error('Logout failed:', error);
    alert('Logout failed, please try again.');
  }
};

  </script>

<style scoped>
/* 为了确保整体一致性，我们延续使用Poppins字体，确保在你的项目中已经引入 */
.lobby * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Poppins', sans-serif; /* 使用Poppins字体 */
}
.lobby body {
  background-image: url('../assets/loginpage.png'); /* 确保图片路径正确 */
  background-size: cover; /* 覆盖整个可视区域 */
  background-position: center; /* 图片居中显示 */
  background-repeat: no-repeat; /* 不重复图片 */
  background-attachment: fixed; /* 背景图片固定，不随页面滚动 */
}

.room-list-section .b-card,
.b-card.no-body,
.login-form {
  background-color: rgba(255, 255, 255, 0.5); /* 透明度设置为0.5，表示50%透明 */
}

.register-container {
  background-color: rgba(255, 255, 255, 0.5); /* 调整alpha值到0.5实现半透明效果 */
  color: white; /* 保持文本为白色以确保可读性 */
  border-radius: 8px; /* 添加圆角以保持风格一致 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 添加轻微阴影以提升层次感 */
}

.b-avatar {
  border: 2px solid white; /* 为头像添加白色边框，使其更为突出 */
}

/* 调整列表项的样式 */
.b-list-group-item {
  background-color: rgba(233, 214, 223, 0.5); /* 调整背景色和透明度 */
  color: #5A3A4A; /* 设置文字颜色以提高对比度 */
  border: none; /* 移除边框 */
}

.b-list-group-item:hover {
  background-color: rgba(211, 188, 192, 0.7); /* 鼠标悬停时的背景色，略增加透明度 */
}

/* 文本和标题的边框效果 */
.text-center h2, .text-center p {
 
}

/* 调整按钮样式 */

button {
  background-color: rgb(8 37 69 / 70%); /* 设置按钮背景色为蓝色，并加上透明度 */
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: rgba(86, 122, 174, 0.9); /* 鼠标悬停时按钮的背景色，减少透明度使按钮更显眼 */
}
/* 组件的 <style scoped> 标签内或全局样式文件中 */
.semi-transparent {
  background-color: rgba(255, 255, 255, 0.5); /* 设置半透明的白色背景 */
}

</style>
