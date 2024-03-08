import * as VueRouter from 'vue-router';

const routes = [
  {
    path: '/login',
    component: () => import('../views/user/Login.vue'),
    name: 'login',
  },
  {
    path: '/',
    component: () => import('../components/layout/AppLayoutWrapper.vue'),
    name: 'home',
    redirect: { name: 'dashboard' },
    children: [
      {
        path: 'demo',
        component: () => import('../components/dashboard/demo/Demo.vue'),
        name: 'demo',
      },
      {
        path: 'demo-data-generator',
        component: () =>
          import('../components/assistants/DemoDataGenerator.vue'),
        name: 'demo-data-generator',
      },
      {
        path: 'dashboard',
        component: () => import('../views/dashboard/Dashboard.vue'),
        name: 'dashboard',
      },
      {
        path: 'actions',
        component: () => import('../views/inputs/Actions.vue'),
        name: 'actions',
      },
      {
        path: 'facilities',
        component: () => import('../views/inputs/Facilities.vue'),
        name: 'facilities',
      },
      {
        path: 'inputs',
        component: () => import('../views/inputs/Inputs.vue'),
        name: 'inputs',
        children: [
          {
            path: 'scope/:scope',
            component: () => import('../views/inputs/Inputs.vue'),
            name: 'inputs-scope',
            // params: { scope: null },
          },
          {
            path: 'facility/:facility',
            component: () => import('../views/inputs/Inputs.vue'),
            name: 'inputs-facility',
            // params: { facility: null },
          },
        ]
      },
      {
        path: 'equivalents/',
        component: () => import('../views/config/EquivalentList.vue'),
        name: 'equivalents',
      },
      // {
      //   path: '/report-config/',
      //   component: () => import('../views/ReportConfig.vue'),
      //   name: 'reportConfig',
      // },
      {
        path: 'assistant/',
        component: () => import('../views/inputs/AiAssistentInput.vue'),
        name: 'assistant',
      },
      {
        path: 'settings', // :category?
        component: () => import('../views/config/SettingsMain.vue'),
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
            component: () => import('../views/config/ProjectsAndSites.vue'),
            name: 'project-general',
          },
          {
            path: 'project-reports',
            component: () => import('../views/config/ReportConfig.vue'),
            name: 'project-reports',
          },
          {
            path: 'project-targets',
            component: () =>
              import('../components/targets/TargetDefinition.vue'),
            name: 'project-targets',
          },
          {
            path: 'project-equivalents',
            component: () => import('../views/config/EquivalentList.vue'),
            name: 'project-equivalents',
          },
        ],
      },
    ],
  },
  // other main routes
  {
    path: '/report-preview',
    component: () => import('../views/dashboard/ReportPrintPreview.vue'),
    name: 'report-preview',
  },
];

export const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});
