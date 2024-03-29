import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue'
import LobbyPage from './components/LobbyPage.vue'

const routes = [
    {
    path: '/',
    component: LobbyPage
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
