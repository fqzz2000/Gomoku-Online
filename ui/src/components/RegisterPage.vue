<template>
  <div class="register-container">
    <h2>Register</h2>
    <form @submit.prevent="registerUser" class="login-form">
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
  },
};
</script>

<style>
/* 使用之前定义的相同风格 */
.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #FADADD;
}

.login-form {
  padding: 20px;
  background: #D78B9B;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  color: #ffffff;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: .5rem;
  color: #ffffff;
}

input[type="text"],
input[type="password"],
input[type="email"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #BDA0BC;
  border-radius: 4px;
  background-color: #E9D6DF;
  color: #5A3A4A;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #729FCF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #567BAE;
}

h2 {
  color: #333;
  
  margin-bottom: 2rem;
}
</style>
