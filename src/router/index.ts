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
      // {
      //   path: '/report-config/',
      //   component: () => import('../views/ReportConfig.vue'),
      //   name: 'reportConfig',
      // },
      {
        path: '/assistant/',
        component: () => import('../views/AiAssistentInput.vue'),
        name: 'assistant',
      },
      {
        path: 'settings', // :category?
        component: () => import('../views/SettingsMain.vue'),
        name: 'settings',
        redirect: { name: 'user-settings' },
        children: [
          {
            path: 'user-settings',
            component: () =>
              import('../components/usersprofile/UserSettings.vue'),
            name: 'user-settings',
          },
          {
            path: 'user-password',
            component: () =>
              import('../components/usersprofile/ChangePassword.vue'),
            name: 'user-password',
          },
          {
            path: 'project-general',
            component: () => import('../views/ProjectsAndSites.vue'),
            name: 'project-general',
          },
          {
            path: 'project-reports',
            component: () => import('../views/ReportConfig.vue'),
            name: 'project-reports',
          },
          {
            path: 'project-targets',
            component: () => import('../components/TargetDefinition.vue'),
            name: 'project-targets',
          },
          {
            path: 'project-equivalents',
            component: () => import('../views/EquivalentList.vue'),
            name: 'project-equivalents',
          },
        ],
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
