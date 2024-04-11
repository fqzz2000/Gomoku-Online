<template>
    <b-container fluid class="vh-100">
      <!-- Outer Row for User/Empty section and Profile/Chat -->
      <b-row class="h-100">
        <!-- User/Empty Section -->
        <b-col cols="8" class="d-flex flex-column align-items-center justify-content-center bg-primary text-white">
            <b-avatar :src="user1.avatar" size="6rem" class="mb-2"></b-avatar>
            <h2 class="mb-2">{{ user1.name }}</h2>
        <b-button variant="success" class="w-25 mb-4" @click="startGame">Start</b-button>
            <b-avatar :src="user2.avatar" size="6rem" class="mb-2"></b-avatar>
            <h2 class="mb-2">{{ user2.name }}</h2>
            <b-button variant="danger" class="w-25" @click="leaveRoom">Leave</b-button>
        </b-col>
  
        <!-- Profile/Chat Section -->
        <b-col cols="4" class="bg-secondary">
          <b-card no-body class="h-50 d-flex flex-column align-items-center justify-content-center">
            <b-card-text>
              <b-avatar :src="user1.avatar" size="4rem" class="mb-2"></b-avatar>
              <p>Games: {{ user1.games }}</p>
              <p>Win Rate: {{ user1.winRate }}%</p>
            </b-card-text>
          </b-card>
          <b-card no-body class="h-50 bg-info">
            <b-card-header class="h-100 d-flex align-items-center justify-content-center">
              More Profile or A chat room
            </b-card-header>
          </b-card>
        </b-col>
      </b-row>
    </b-container>

</template>


<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { GameSocket } from '../gameSocket'; 
import { useRouter } from 'vue-router';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useRoute } from 'vue-router';
interface Room {
  id: string;
  number: string;
  player: string;
  status: 'waiting' | 'playing' | 'ready';
}
const route = useRoute();
const router = useRouter();
const roomId = route.params.roomId as string;
const username = route.query.username as string;

const userName = ref<string>(username);

const user1 = ref({
  avatar: '../assets/images.png',
  name: 'Alice',
  games: 10,
  winRate: 70,
});

const user2 = ref({
  avatar: '../assets/images.png',
  name: 'Bob',
  games: 20,
  winRate: 80,
});
//const userName = "User"+Math.floor(Math.random() * 1000)
// userid is a uuid
//const userId = uuidv4();




const gameSocket = new GameSocket('http://localhost:8181');

onMounted(async () => {
  userName.value = username;

   
  gameSocket.connect('your_jwt_token_here');
  gameSocket.onRoomInfo((roomInfo) => {
    // alert('Room Info: ' + JSON.stringify(roomInfo));
    gameSocket.onGameStart(() => {
      router.push({
        path: '/game',
        query: {
          roomId: roomId,
          userId: userName.value,
          user1: user1.value.name,
          user2: user2.value.name,

        },
      });
    });
  user1.value.name = roomInfo.users[0].username;
  if (roomInfo.users.length > 1) {
    user2.value.name = roomInfo.users[1].username;
  } else {
    user2.value.name = 'Empty';
  }
  });
if (userName.value !== null) 
  gameSocket.joinRoom(roomId, userName.value, userName.value);
});

function leaveRoom() {
  gameSocket.leaveRoom(roomId, userName.value);
  router.push('/');
  gameSocket.disconnect();
}

function startGame() {
  gameSocket.startGame(roomId);

}


</script>