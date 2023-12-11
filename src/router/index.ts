import * as VueRouter from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("../layout/AppLayout.vue"),
    name: "home",
    redirect: { name: "dashboard" },
    children: [
      {
        path: "/login",
        component: () => import("../views/Login.vue"),
        name: "login",
      },
      {
        path: "/user",
        component: () => import("../views/UsersProfile.vue"),
        name: "user",
      },
      {
        path: "/dashboard",
        component: () => import("../views/Dashboard.vue"),
        name: "dashboard",
      },
      {
        path: "/actions",
        component: () => import("../views/Actions.vue"),
        name: "actions",
      },
      {
        path: "/facilities",
        component: () => import("../views/Facilities.vue"),
        name: "facilities",
      },
      {
        path: "/inputs/scope/:scope?",
        component: () => import("../views/Inputs.vue"),
        name: "inputs-scope",
        params: { scope: null },
      },
      {
        path: "/inputs/facility/:facility?",
        component: () => import("../views/Inputs.vue"),
        name: "inputs-facility",
        params: { facility: null },
      },
      {
        path: "/equivalents/",
        component: () => import("../views/EquivalentList.vue"),
        name: "equivalents",
      },
      {
        path: "/report-config/",
        component: () => import("../views/ReportConfig.vue"),
        name: "reportConfig",
      },
      {
        path: "/project-config/",
        component: () => import("../views/ProjectConfig.vue"),
        name: "projectConfig",
      },
    ],
  },
  // other main routes
  {
    path: "/report-preview",
    component: () => import("../views/ReportPrintPreview.vue"),
    name: "report-preview",
  },
];

export const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});
