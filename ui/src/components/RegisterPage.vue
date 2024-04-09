<template>
  <div class="register-container">
    <h2>Register</h2>
    <form @submit.prevent="registerUser">
      <div class="form-group">
        <label for="username">Username</label>
        <input v-model="username" type="text" id="username" required>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input v-model="password" type="password" id="password" required>
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input v-model="email" type="email" id="email" required>
      </div>

      <button type="submit">Register</button>
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
    email: '', // 添加这一行
  };
},

  methods: {
    async registerUser() {
  try {
    const response = await axios.post('/api/register', {
      username: this.username,
      password: this.password,
      email: this.email,
    });
    console.log('username:',username);
    alert('Registration successful');
    this.$router.push('/login'); // Redirect to login page or home page
  } catch (error) {
    console.error('username:',username);
    console.error('Registration failed', error);
    // 检查error.response是否存在，然后再尝试访问.data.message
    let errorMessage = 'Registration failed. Please try again.';
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage += ` Error: ${error.response.data.message}`;
    } else if (error.response && error.response.data) {
      // 如果服务器返回的错误没有message属性，但有其他形式的响应体
      errorMessage += ` Error: ${JSON.stringify(error.response.data)}`;
    } else if (error.message) {
      // 如果error.response不存在，但error.message存在
      errorMessage += ` Error: ${error.message}`;
    }
    alert(errorMessage);
  }
},

  },
};
</script>

<style>
/* Add your styles here */
</style>
