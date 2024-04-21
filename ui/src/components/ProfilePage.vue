<template>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
  <div class="container update-info-page">
    <div class="row">
      <div class="col-md-6">
        <h2>Profile</h2>
        <ProfileBlock :user="user" :enableEdit="false" :enableUpload="true" @avatar-updated="handleAvatarUpdated"/>
      </div>
      <div class="col-md-6">
        <h2>Update Info</h2>
        <b-form @submit.prevent="updateProfile">
          <b-form-group label="Input Old Password: " label-for="input-old-password">
            <b-form-input id="input-old-password" type="password" v-model="form.password" required placeholder="Please input your password"></b-form-input>
          </b-form-group>
          <b-form-group label="Input New Password:" label-for="input-password">
            <b-form-input id="input-password" type="password" v-model="form.newPassword" required placeholder="Please input your password"></b-form-input>
          </b-form-group>
          <b-form-group label="Verify New Password:" label-for="input-confirm-password">
            <b-form-input id="input-confirm-password" type="password" v-model="confirmedPassword" :class="{'is-invalid': !passwordMatch}" required placeholder="Please input your password"></b-form-input>
          </b-form-group>
          <div v-if="!passwordMatch" class="invalid-feedback" style="display: block;">
            Password inconsistent
          </div>
          <b-form-group label="Update Email:" label-for="input-email">
            <b-form-input id="input-email" type="email" v-model="form.email" required placeholder="Please input your email"></b-form-input>
          </b-form-group>
          <b-button type="submit" variant="primary">Submit</b-button>
        </b-form>
        <b-button @click="backToLobby">Return</b-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import ProfileBlock from './ProfileBlock.vue';
import { postWithToken } from '../utils';
import { Data } from '../data';
import { useRouter } from 'vue-router';

const router = useRouter();
const confirmedPassword = ref('');
const user = ref({
    avatar: '/public/uploads/avatar.png',
    name: '张三',
    games: 10,
    winRate: 70,
    email: ""
});
const form = ref({
    password: '',
    email: '',
    newPassword: '',
    avatar: '/public/uploads/avatar.png',
});

const passwordMatch = computed(() => form.value.newPassword === confirmedPassword.value);

onMounted(async () => {
    const ret = await Data.fetchUserProfile("321", localStorage.getItem('token') as string);
    user.value = {
        avatar: ret.avatar || '../assets/images.png',
        name: ret.username,
        games: ret.totalGame,
        winRate: ret.winRate,
        email: ret.email
    }
});

async function updateProfile() {
    const res = await postWithToken('/api/users/updateProfile', form.value, localStorage.getItem('token') as string);
    if (res === null) {
        alert('Update failed');
    } else if (res.status === 200) {
        alert('Update successfully');
        const ret = await Data.fetchUserProfile("321", localStorage.getItem('token') as string);
        user.value = {
            avatar: ret.avatar || '../assets/images.png',
            name: ret.username,
            games: ret.totalGame,
            winRate: ret.winRate,
            email: ret.email
        }
    }
}

function handleAvatarUpdated(avatar: string) {
    user.value.avatar = avatar;
    form.value.avatar = avatar;
    console.log('Avatar updated:', avatar);
}

function backToLobby() {
    router.push('/');
}
</script>
<style scoped>
.update-info-container .container {
  background-color: rgba(255, 255, 255, 0.65); /* 设置背景色为白色，透明度为65% */
  padding: 20px; /* 添加一些内边距 */
  border-radius: 8px; /* 可选的圆角 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 可选的轻微阴影增加深度感 */
}

.update-info-container .b-form {
  background-color: rgba(14, 30, 45, 0.5); /* 为表单设置透明度更低的背景以突出表单区域 */
  padding: 20px;
  border-radius: 8px;
}

.update-info-container .form-group {
  margin-bottom: 1.5rem;
}

.update-info-container input[type="text"], 
.update-info-container input[type="password"], 
.update-info-container input[type="email"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc; /* 轻微的边框强调输入框 */
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.5); /* 输入框也采用轻微透明效果 */
  color: #ffffff;
}

.update-info-container button {
  width: 100%;
  padding: 0.75rem;
  background-color: #6586a973; /* 按钮颜色 */
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.update-info-container button:hover {
  background-color: #004494; /* 鼠标悬浮时的按钮背景色变化 */
}

.update-info-container .is-invalid {
  border-color: red; /* 无效输入的边框颜色 */
}

.update-info-container .invalid-feedback {
  color: red; /* 错误信息的文字颜色 */
  font-size: 0.875em;
}
</style>
<style scoped>
.update-info-container .container {
  background-color: rgba(255, 255, 255, 0.65); /* 设置背景色为白色，透明度为65% */
  padding: 20px; /* 添加一些内边距 */
  border-radius: 8px; /* 可选的圆角 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 可选的轻微阴影增加深度感 */
}

.update-info-container .b-form {
  background-color: rgba(14, 30, 45, 0.5); /* 为表单设置透明度更低的背景以突出表单区域 */
  padding: 20px;
  border-radius: 8px;
}

.update-info-container .form-group {
  margin-bottom: 1.5rem;
}

.update-info-container input[type="text"], 
.update-info-container input[type="password"], 
.update-info-container input[type="email"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc; /* 轻微的边框强调输入框 */
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.5); /* 输入框也采用轻微透明效果 */
  color: #ffffff;
}

.update-info-container button {
  width: 100%;
  padding: 0.75rem;
  background-color: #6586a973; /* 按钮颜色 */
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.update-info-container button:hover {
  background-color: #004494; /* 鼠标悬浮时的按钮背景色变化 */
}
.update-info-page {   background-color: rgba(255, 255, 255, 0.65); }
.update-info-container .is-invalid {
  border-color: red; /* 无效输入的边框颜色 */
}
.update-info-container .b-form-group label {
  color: #333333; /* 这样只会影响拥有 unique-login-form 类的表单内的label */
}
.update-info-container .invalid-feedback {
  color: red; /* 错误信息的文字颜色 */
  font-size: 0.875em;
}

.update-info-page h2, .update-info-page label, .update-info-page input, .update-info-page button {   color: #333; /* 深灰色 */ }
</style>
