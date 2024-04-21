<template>
    <div>
      <b-table striped hover :items="sortedUsers" :fields="fields"></b-table>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { BTable } from 'bootstrap-vue';
  import { getWithoutToken } from '../utils';
  // Sample data structure for users.
  // You would replace this with your actual API call to fetch users.
  const users = ref<{username: string, winRate: number, totalGames: number}[]>([]);
  
  const fields = [
    { key: 'rank', label: 'Rank' },
    { key: 'username', label: 'Username' },
    { key: 'winRate', label: 'Win Rate' },
    { key: 'totalGames', label: 'total Games' },

  ];
  
  // Sorting users based on winRate and totalGames.
  const sortedUsers = computed(() => {
    return users.value
      .slice()
      .sort((a, b) => {
        if (a.winRate === b.winRate) {
          return b.totalGames - a.totalGames;
        }
        return b.winRate - a.winRate;
      })
      .map((user, index) => ({ username: user.username, winRate: user.winRate.toFixed(2), totalGames: user.totalGames, rank: index + 1 }));
  });

  async function fetchRankInfo() {
    // Fetch users from API.
    await getWithoutToken('/api/rank').then((response) => {
      users.value = response.data;
    });
}

    onMounted(async () => {
    // Fetch users from API on component mount.
    await fetchRankInfo();
    });
  </script>
  
  <style>
  /* Add any additional styling you need here */
  </style>
  