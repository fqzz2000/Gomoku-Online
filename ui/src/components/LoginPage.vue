<template>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
  <div class="login-container">
    <form @submit.prevent="loginUser" class="login-form">
      <h2>Login</h2>
      <div class="form-group">
        <label for="username">Username:</label>
        <input v-model="username" type="text" id="username" required>
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input v-model="password" type="password" id="password" required>
      </div>
      <button type="submit">Login with JWT</button>
      <button type="button" @click="loginWithOIDC">Login with OIDC</button> <!-- 新增的 OIDC 登录按钮 -->
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
          localStorage.setItem('username', this.username);
          this.$router.push({ name: 'Lobby' }); 
        } else {
          alert('Authentication failed');
        }
      } catch (error) {
        console.error('Authentication failed', error);
        alert('Login failed: ' + error.message);
      }
    },
    loginWithOIDC() {
      // 重定向到后端的 OIDC 登录路由
      window.location.href = '/login/oidc';
      
    }
  
  },
};
</script>

<style>
/* 基本重置 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Poppins', sans-serif; /* 使用Poppins字体 */
}

body {
  background-color: #FADADD; /* 设定背景颜色为温馨的粉色 */
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-form {
  padding: 20px;
  background: #D78B9B;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: .5rem;
  color: #555; /* 字体颜色稍微深一点，提高可读性 */
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #BDA0BC; /* 输入框边框颜色 */
  border-radius: 4px;
  background-color: #E9D6DF; /* 输入框背景颜色 */
  color: #5A3A4A; /* 输入文字颜色 */
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #729FCF; /* 按钮背景颜色 */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #567BAE; /* 按钮hover效果颜色 */
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}
</style>
