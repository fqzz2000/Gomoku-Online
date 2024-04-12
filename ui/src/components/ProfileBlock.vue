<!-- <template>
<b-card no-body class="mb-1" header="The User">
    <b-card-body class="text-center">
      <b-avatar variant="info" size="4rem" class="mb-2" :src="props.user.avatar"></b-avatar>
      <p>Name: {{ props.user.name }}</p>
      <p>Games: {{ props.user.games }}</p>
      <p>Win Rate: {{ props.user.winRate.toFixed(2) }}%</p>
    </b-card-body>
  </b-card>
</template> -->

<template>
    <b-card class="mb-3 shadow-sm" header="User Profile" header-bg-variant="primary" header-text-variant="white" align="center">
      <b-avatar :src="user.avatar" size="6rem" class="mb-3"></b-avatar>
      <b-card-text>
        <h5>{{ user.name }}</h5>
        <p>Games Played: {{ user.games }}</p>
        <p>Win Rate: {{ user.winRate.toFixed(2) }}%</p>
      </b-card-text>
      <b-button v-if="enableEdit" variant="primary">Edit Profile</b-button>

    </b-card>
  </template>
<script setup lang="ts">
    const props = defineProps<{
        user: {
            avatar: string;
            name: string;
            games: number;
            winRate: number;
        };
        enableEdit: boolean;
    }>();
</script>