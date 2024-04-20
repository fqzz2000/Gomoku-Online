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
              <p>Win Rate: {{ user1.winRate.toFixed(2) }}%</p>
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


import { Data } from "../data"


//import axios from 'axios';

import { useRoute } from 'vue-router';
// interface Room {
//   id: string;
//   number: string;
//   player: string;
//   status: 'waiting' | 'playing' | 'ready';
// }
const route = useRoute();
const router = useRouter();
const roomId = route.params.roomId as string;

const username = route.query.username as string;

const userName = ref<string>(username);

const user1 = ref({
  avatar: '/public/uploads/avatar1.png',
  name: 'Alice',
  games: 10,
  winRate: 70,
});

const user2 = ref({
  avatar: '/public/uploads/avatar1.png',
  name: 'Bob',
  games: 20,
  winRate: 80,
});
//const userName = "User"+Math.floor(Math.random() * 1000)
// userid is a uuid
//const userId = uuidv4();




const gameSocket = new GameSocket('http://localhost:8181', localStorage.getItem('token') as string);

onMounted(async () => {

  userName.value = username;
console.log("username in room is :",userName.value);
   
  gameSocket.connect(localStorage.getItem('token') as string);
  gameSocket.onRoomInfo(async (roomInfo) => {
    // alert('Room Info: ' + JSON.stringify(roomInfo));
    console.log("room info for this room is:", roomInfo);
  user1.value.name = roomInfo.users[0].username;
  console.log("user1 in room is :", user1.value.name);
  let ret = await Data.fetchUserProfile(roomInfo.users[0].username, localStorage.getItem('token') as string);
  user1.value.games = ret.totalGame;
  user1.value.winRate = ret.winRate;
  user1.value.avatar = ret.avatar;
  if (roomInfo.users.length > 1) {
    user2.value.name = roomInfo.users[1].username;
    let ret = await Data.fetchUserProfile(roomInfo.users[1].username, localStorage.getItem('token') as string);
    user2.value.games = ret.totalGame;
    user2.value.winRate = ret.winRate;
    user2.value.avatar = ret.avatar;
  } else {
    user2.value.name = 'Empty';
  }
  });
  gameSocket.onGameStart(() => {
      router.push({
        path: '/game',
        query: {
          roomId: roomId,
          userId: userName.value,
          user1name: user1.value.name,
          user2name: user2.value.name,
          user1avatar: user1.value.avatar,
          user2avatar: user2.value.avatar,
          user1games: user1.value.games,
          user2games: user2.value.games,
          user1winRate: user1.value.winRate,
          user2winRate: user2.value.winRate,
        },
      });
    });
if (userName.value !== null) 
  gameSocket.joinRoom(roomId, userName.value, userName.value);
});

function leaveRoom() {
  gameSocket.leaveRoom(roomId, userName.value);
  console.log("this player:",userName.value,'is leaving room:', roomId);
  router.push('/');
  gameSocket.disconnect();
}

function startGame() {
  gameSocket.startGame(roomId);

}





</script>