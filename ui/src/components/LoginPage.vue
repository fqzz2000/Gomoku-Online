<template>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
  <div class="login-container login">
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
      <button type="button" @click="goHome">Back to Home</button>
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
      
    },
    goHome() {
      this.$router.push('/home'); // Redirect to the home page
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
  background-image: url('../assets/loginpage.png'); /* 设置背景图片 */
  background-size: cover; /* 覆盖整个可视区域 */
  background-position: center; /* 图片居中显示 */
  background-repeat: no-repeat; /* 不重复图片 */
  background-color: #000; /* 设置一个基础背景颜色以防图片加载慢 */
}


 .login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login .login-form {
  padding: 20px;
  background:#0e1e2d7d;

  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}



.login .form-group {
  margin-bottom: 1.5rem;
}

.login label {
  display: block;
  margin-bottom: .5rem;
  color: #eceff0; /* 字体颜色稍微深一点，提高可读性 */
}

.login input[type="text"],
.login input[type="password"] {
  width: 100%;
    padding: 0.75rem;
    border: 3px solid #05082f8c;
    border-radius: 10px;
    background-color: #020213ab;
    color: #fff;
}
.login button {
    width: 100%;
    padding: 0.75rem;
    background-color: #6586a973;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.login button:hover {
  background-color: #475262; /* 按钮hover效果颜色 */
}

.login h2 {
    color: #fff;
    margin-bottom: 2rem;
}
</style>
