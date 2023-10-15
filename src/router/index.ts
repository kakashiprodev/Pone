import * as VueRouter from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("../layout/AppLayout.vue"),
    name: "home",
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
        path: "/inputs",
        component: () => import("../views/Inputs.vue"),
        name: "inputs",
      },
      {
        path: "/scope1",
        component: () => import("../views/Inputs.vue"),
        name: "scope1",
      },
    ],
  },
];

export const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes,
});
