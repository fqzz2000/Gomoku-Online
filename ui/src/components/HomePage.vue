<template>
    <div class="home-page">
      <img src="../assets/homepage.png" alt="Background" class="background-image">
      <div class="buttons-container">
        <router-link to="/login" class="button-login"></router-link>
        <router-link to="/register" class="button-register"></router-link>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: 'HomePage'
  });
  </script>
  
  <style scoped>
  .home-page {
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  
  .background-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -1;
  }
  
  .buttons-container {
    display: flex;
    flex-direction: column;
    gap: 100px;
  }
  
  .button-login {
  padding: 54px 60px;
  font-size: 16px;
  color: white;
  border: none;
  border-radius: 39px;
  cursor: pointer;
  width: 288px;
  background-image: url('../assets/loginbutton.jpg'); /* Path to your login image */
  background-size: cover;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-position: center;
}

.button-register {
  padding: 54px 60px;
  font-size: 25px;
  color: white;
  border: none;
  width: 280px;
  border-radius: 39px;
  cursor: pointer;
  background-image: url('../assets/registerbutton.jpg'); /* Path to your register image */
  background-size: cover;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-position: center;
}




.button-register:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}
.button-register:active {
  transform: translateY(-1px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}
.button-login:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}
.button-login:active {
  transform: translateY(-1px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}



  </style>
  