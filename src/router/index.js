import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/views/Home.vue"),
    name: "home",
  },
  {
    path: "/friendship",
    component: () => import("@/views/Friendship/FriendshipView.vue"),
    name: "friendship",
  },
  {
    path: "/create",
    component: () => import("@/views/Create/CreateView.vue"),
    name: "create",
  },
  {
    path: "/user",
    name: "user",
    children: [
      {
        path: "login",
        component: () => import("@/views/User/Account/LoginView.vue"),
        name: "login",
      },
      {
        path: "register",
        component: () => import("@/views/User/Account/RegisterView.vue"),
        name: "register",
      },
      {
        path: "space",
        component: () => import("@/views/User/Space/SpaceView.vue"),
        name: "space",
      },
      {
        path: "profile",
        component: () => import("@/views/User/Profile/ProfileView.vue"),
        name: "profile",
      },
    ],
  },
  {
    path: "/404",
    component: () => import("@/views/Error/404View.vue"),
    name: "404",
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export default router;
