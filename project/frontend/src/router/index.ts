import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/properties',
      name: 'properties',
      component: () => import('../views/Properties.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tenants',
      name: 'tenants',
      component: () => import('../views/Tenants.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/Settings.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('inmovel_token');
  const expiresStr = localStorage.getItem('inmovel_session_expires');
  const isExpired = expiresStr ? Date.now() > parseInt(expiresStr, 10) : true;

  if (to.meta.requiresAuth && (!token || isExpired)) {
    localStorage.removeItem('inmovel_token');
    localStorage.removeItem('inmovel_user');
    localStorage.removeItem('inmovel_session_expires');
    next({ name: 'login' });
  } else if ((to.name === 'login' || to.path === '/') && (token && !isExpired)) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

export default router;
