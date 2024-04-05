import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue'
import LobbyPage from './components/LobbyPage.vue'
import RoomPage from './components/RoomPage.vue'
import BoardPage from './components/BoardPage.vue'

const routes = [
    {
        path: '/',
        component: LobbyPage
    },
    {
        path: '/room',
        component: RoomPage
    }, 
    {
        path: '/game',
        component: BoardPage
    }
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

createApp(App)
    .use(BootstrapVue)
    .use(BootstrapVueIcons)
    .use(router)
    .mount('#app')
