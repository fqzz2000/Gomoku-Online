<template>
  <b-container fluid>
    <!-- Row for the room list and the user profile/chat section -->
    <b-row>
      <!-- Room List Section -->
      <b-col md="8" class="room-list-section">
        <b-card no-body class="mb-1" header="Room List">
          <b-list-group flush>
            <!-- Use v-for to list rooms here -->
            <b-list-group-item button v-for="room in rooms" :key="room.id" @click="enterRoom(room)">
              Room {{ room.number }} - Player: {{ room.player }} [{{ room.status }}]
              <b-button variant="danger" class="float-right" @click.stop="deleteRoom(room.id)">Delete</b-button>
            </b-list-group-item>
          </b-list-group>
        </b-card>
        <b-button @click="addRoom">Add Room</b-button>

      </b-col>

      <!-- User Profile/Chat Section -->
      <b-col md="4">
        <b-card no-body class="mb-1" header="The User">
          <b-card-body class="text-center">
            <b-avatar variant="info" size="4rem" class="mb-2"></b-avatar>
            <p>Name: {{ user.name }}</p>
            <p>Games: {{ user.games }}</p>
            <p>Win Rate: {{ user.winRate }}%</p>
          </b-card-body>
        </b-card>
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

  const router = useRouter();
  // import { useStore } from 'vuex';
  // const store = useStore();
  // const user = computed(() => store.state.user);

  onMounted(() => {
  const username = localStorage.getItem('username'); 
  fetchRooms(); 

  
  if (username) {
    fetchUserInfo(username);
  }
});
  // const rooms = ref([
  //   { id: 1, number: 1, player: 'Alice', status: 'waiting' },
  //   { id: 2, number: 2, player: 'Bob', status: 'playing' },
  //   { id: 3, number: 3, player: 'Charlie', status: 'waiting' },
  // ]);
  interface Room {
  id: string;
  number: string;
  player: string;
  status: 'waiting' | 'playing' | 'ready';
}

const rooms = ref<Room[]>([]);

 
  const user = ref({
    avatar: '../assets/images.png',
    name: 'Alice',
    games: 10,
    winRate: 70,
  });


  async function fetchUserInfo(username: string) {
    try {
      const response = await axios.get(`/api/users/${username}`);
      user.value.name = response.data.username;
      console.log('user.value.name',user.value.name);
      console.log('User info:', response.data);
      user.value.games = response.data.game_stats.total_games_played;
      console.log(' user.value.games', user.value.games);
      if (response.data.total_games_played > 0) {
      user.value.winRate = (response.data.game_stats.total_wins / response.data.game_stats.total_games_played) * 100;
    } else {
      console.log('else', user.value.games);
      user.value.winRate = 0; 
    }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Failed to fetch user info:", error);
      }
    }
  }
  const fetchRooms = async () => {
  try {

const response = await axios.get<Room[]>('/api/rooms');
    rooms.value = response.data;
    console.log("room info:",toRaw(rooms.value));
  } catch (error) {
    
  
console.error(error);
  }
};
const addRoom = async () => {
  try {
    const maxNumber = rooms.value.reduce((max, room) => Math.max(max, Number(room.number)), 0);
    const newNumber = maxNumber + 1;
    const response = await axios.post('/api/rooms', { number: newNumber.toString(), player: user.value.name });
    rooms.value.push(response.data);

fetchRooms();
  } catch (error) {
    console.error(error);
  }
};
const deleteRoom = async (roomId:string) => {
  try {
    console.log("Attempting to delete room with ID:", roomId);
    await axios.delete(`/api/rooms/${roomId}`);
    fetchRooms(); // 重新获取房间列表以更新UI
  } catch (error) {
    console.error(error);
  }
};
const enterRoom = async (room: Room) => {
  try {
    // Navigate to the RoomPage with the roomId as a parameter
    console.log("Entering room:", room);
    console.log("user name:", user.value.name);
    await router.push({ name: 'Room', params: { roomId: room.id}, query: { username: user.value.name}});

  } catch (error) {
    console.error(error);
  }
};

  </script>

<style scoped>
/* 为了确保整体一致性，我们延续使用Poppins字体，确保在你的项目中已经引入 */
body {
  font-family: 'Poppins', sans-serif;
}

.room-list-section .b-card,
.b-card.no-body {
  background-color: #D78B9B; /* 使用之前定义的深粉色 */
  color: white; /* 保持文本为白色以确保可读性 */
  border-radius: 8px; /* 添加圆角以保持风格一致 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 添加轻微阴影以提升层次感 */
}

.b-avatar {
  border: 2px solid white; /* 为头像添加白色边框，使其更为突出 */
}

/* 调整列表项的样式 */
.b-list-group-item {
  background-color: #E9D6DF; /* 设置列表项背景为较浅的粉色 */
  color: #5A3A4A; /* 设置文字颜色以提高对比度 */
  border: none; /* 移除边框 */
}

.b-list-group-item:hover {
  background-color: #D3BCC0; /* 鼠标悬停时的背景色 */
}

/* 文本和标题的边框效果 */
.text-center h2, .text-center p {
 
}

/* 调整按钮样式 */
button {
  background-color: #729FCF; /* 设置按钮背景色为蓝色 */
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #567BAE; /* 鼠标悬停时按钮的背景色 */
}
</style>
