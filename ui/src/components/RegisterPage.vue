<template>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
  <div class="register-container" register>
 
    <form @submit.prevent="registerUser" class="login-form">
      <h2>Register</h2>
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
      email: '',
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
        alert('Registration successful');
        this.$router.push('/login'); // Redirect to login page or home page
      } catch (error) {
        console.error('Registration failed', error);
        let errorMessage = 'Registration failed. Please try again.';
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage += ` Error: ${error.response.data.message}`;
        } else if (error.response && error.response.data) {
          errorMessage += ` Error: ${JSON.stringify(error.response.data)}`;
        } else if (error.message) {
          errorMessage += ` Error: ${error.message}`;
        }
        alert(errorMessage);
      }
    },
    goHome() {
      this.$router.push('/home'); // Redirect to the home page
    }
  },
};
</script>

<style>
/* 使用之前定义的相同风格 */
.register-container {


  
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

body {
  background-image: url('../assets/loginpage.png'); /* 设置背景图片 */
  background-size: cover; /* 覆盖整个可视区域 */
  background-position: center; /* 图片居中显示 */
  background-repeat: no-repeat; /* 不重复图片 */
  background-color: #fff; /* 设置一个基础背景颜色以防图片加载慢 */
}

.login-form {
  padding: 20px;
  background: hsla(209, 53%, 12%, 0.49);
  color: #ffffff;

  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.register label {
  display: block;
  margin-bottom: .5rem;
  color: #ffffff;
}

 input[type="text"],
 input[type="password"],
input[type="email"] {
  width: 100%;
    padding: 0.75rem;
    border: 3px solid #05082f8c;
    border-radius: 10px;
    background-color: #020213ab;
    color: #ffffff;
}

 button {
    width: 100%;
    padding: 0.75rem;
    background-color: #6586a973;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

button:hover {
  background-color: #475262; /* 按钮hover效果颜色 */
}

h2 {
    color: #fff;
    margin-bottom: 2rem;
}
</style>
