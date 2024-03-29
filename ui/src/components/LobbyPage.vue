<template>
    <b-container fluid>
      <!-- Row for the room list and the user profile/chat section -->
      <b-row>
        <!-- Room List Section -->
        <b-col md="8" class="room-list-section">
          <b-card no-body class="mb-1" header="Room List">
            <b-list-group flush>
              <!-- Use v-for to list rooms here -->
              <b-list-group-item button v-for="room in rooms" :key="room.id">
                Room {{ room.number }} - Player: {{ room.player }} [{{ room.status }}]
              </b-list-group-item>
            </b-list-group>
          </b-card>
        </b-col>
  
        <!-- User Profile/Chat Section -->
        <b-col md="4">
          <b-card no-body class="mb-1" header="The User">
            <b-card-body class="text-center">
              <b-avatar variant="info" size="4rem" class="mb-2"></b-avatar>
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
    import { ref } from 'vue';
    const rooms = ref([
      { id: 1, number: 1, player: 'Alice', status: 'waiting' },
      { id: 2, number: 2, player: 'Bob', status: 'playing' },
      { id: 3, number: 3, player: 'Charlie', status: 'waiting' },
    ]);
    const user = ref({
      avatar: '../assets/images.png',
      games: 10,
      winRate: 70,
    });
    </script>
  
  <style scoped>
  .room-list-section .b-card {
    background-color: #4d6082;
    color: white;
  }
  </style>
  