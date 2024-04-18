import Vue from 'vue'
import Router from 'vue-router'
import imServer from '@/components/Server/Server'
import imClient from '@/components/Client/Client'

Vue.use(Router)

export default new Router({
    routes: [
        { path: '/', redirect: 'Server' },
        { path: '/Server', name: 'Server', component: imServer },
        { path: '/Client', name: 'Client', component: imClient },
    ]
})
