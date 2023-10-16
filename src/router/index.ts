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
        path: "/inputs/:scope?",
        component: () => import("../views/Inputs.vue"),
        name: "inputs",
      },
      {
        path: "/equivalents/",
        component: () => import("../views/EquivalentList.vue"),
        name: "equivalents",
      },
    ],
  },
];

export const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});
