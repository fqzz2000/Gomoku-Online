import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue'
import LobbyPage from './components/LobbyPage.vue'
import RoomPage from './components/RoomPage.vue'

import LoginPage from './components/LoginPage.vue'
import BoardPage from './components/BoardPage.vue'
import RegisterPage from './components/RegisterPage.vue'
import ProfilePage from './components/ProfilePage.vue'
import store from './store';
//import store from './store'
createApp(App).use(store).mount('#app');

const routes = [
    {
        path: '/',
        name: 'Lobby',
        component: LobbyPage
    },
    {
        path: '/room/:roomId',
        name: 'Room',
        component: () => import('./components/RoomPage.vue')
    }, 
    {
        path: '/game',
        component: BoardPage

    },
    {
        path: '/register',
        name: 'RegisterPage',
        component: RegisterPage,
      },
    
      {
        path: '/login',
        name: 'Login',
        component: LoginPage
      },
      {
        path: "/profile",
        name: "Profile",
        component: ProfilePage
      }

]

const router = createRouter({
	history: createWebHistory(),
	routes,
})




//import store from './store'; // 导入store

createApp(App)
 // .use(store) // 使用store
  .mount('#app');


createApp(App)
    .use(BootstrapVue)
    .use(BootstrapVueIcons)
    .use(router)
   // .use(store)
    .mount('#app')
