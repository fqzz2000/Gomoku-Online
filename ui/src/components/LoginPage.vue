<template>
    <div class="login-container">
      <form @submit.prevent="loginUser">
        <div class="form-group">
          <label for="username">Username:</label>
          <input v-model="username" type="text" id="username" required>
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input v-model="password" type="password" id="password" required>
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        username: '',
        password: '',
      };
    },
    methods: {
      async loginUser() {
        try {
          const response = await axios.post('/api/login', {
            username: this.username,
            password: this.password,
          });
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            this.$router.push({ name: 'Lobby' }); 
          } else {
            alert('Authentication failed');
          }
        } catch (error) {
          console.error('Authentication failed', error);
          alert('Login failed: ' + error.message);
        }
      },
    },
  };
  </script>
  
  <style>
  /* 添加一些基本样式 */
  .form-group {
    margin-bottom: 1rem;
  }
  label {
    display: block;
  }
  input[type="text"],
  input[type="password"] {
    width: 100%;
    padding: 0.5rem;
  }
  button {
    padding: 0.5rem 1rem;
  }
  </style>
  