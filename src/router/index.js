import VueRouter from 'vue-router'

import Login from '../views/Login'
import Home from '../views/Home'
import Welcome from '../views/Welcome'
import Users from '../views/user/Users'
import Rights from '../views/power/Rights'
import Roles from '../views/power/Roles'
import Cate from '../views/goods/Cate'
import Params from '../views/goods/Params'
import Goods from '../views/goods/Goods'
import Add from '../views/goods/Add'
import Orders from '../views/orders/Orders'
import Reports from '../views/reports/Reports'

// 创建一个路由器
const router = new VueRouter({
  routes: [
    {
      path: '/',
      redirect: '/login', // 重定向
      component: Login
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/Home',
      name: 'home',
      component: Home,
      redirect: '/welcome',
      children: [
        {path: '/welcome', component: Welcome},
        {path: '/users', component: Users},
        {path: '/rights', component: Rights},
        {path: '/roles', component: Roles},
        {path: '/categories', component: Cate},
        {path: '/params', component: Params},
        {path: '/goods', component: Goods},
        {path: '/goods/add',component: Add},
        {path: '/orders',component: Orders},
        {path: '/reports',component: Reports},
      ]
    },
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从那个路径跳转而来
  // next 是一个函数，表示放行
  //   next() 放行   next('/login') 强制跳转
  if(to.path === '/login') return next()
  const tokenStr = sessionStorage.getItem('token');
  if(!tokenStr) return next('/login')
  next()
})

export default router