import * as VueRouter from 'vue-router';

const routes = [
  {
    path: '/login',
    component: () => import('../views/Login.vue'),
    name: 'login',
  },
  {
    path: '/',
    component: () => import('../components/AppLayoutWrapper.vue'),
    name: 'home',
    redirect: { name: 'dashboard' },
    children: [
      {
        path: '/user',
        component: () => import('../views/UsersProfile.vue'),
        name: 'user',
      },
      {
        path: '/dashboard',
        component: () => import('../views/Dashboard.vue'),
        name: 'dashboard',
      },
      {
        path: '/actions',
        component: () => import('../views/Actions.vue'),
        name: 'actions',
      },
      {
        path: '/facilities',
        component: () => import('../views/Facilities.vue'),
        name: 'facilities',
      },
      {
        path: '/inputs',
        component: () => import('../views/Inputs.vue'),
        name: 'inputs',
      },
      {
        path: '/inputs/scope/:scope',
        component: () => import('../views/Inputs.vue'),
        name: 'inputs-scope',
        // params: { scope: null },
      },
      {
        path: '/inputs/facility/:facility',
        component: () => import('../views/Inputs.vue'),
        name: 'inputs-facility',
        // params: { facility: null },
      },
      {
        path: '/equivalents/',
        component: () => import('../views/EquivalentList.vue'),
        name: 'equivalents',
      },
      {
        path: '/report-config/',
        component: () => import('../views/ReportConfig.vue'),
        name: 'reportConfig',
      },
      {
        path: '/project-config/',
        component: () => import('../views/ProjectConfig.vue'),
        name: 'projectConfig',
      },
      {
        path: '/assistant/',
        component: () => import('../views/AiAssistentInput.vue'),
        name: 'assistant',
      },

      {
        path: '/settings/',
        component: () => import('../views/SettingsMain.vue'),
        name: 'settings',
      },
    ],
  },
  // other main routes
  {
    path: '/report-preview',
    component: () => import('../views/ReportPrintPreview.vue'),
    name: 'report-preview',
  },
];

export const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});
