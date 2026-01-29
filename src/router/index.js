import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/views/Home.vue"),
    name: "home",
    meta: {
      isAuthorized: false,
    }
  },
  {
    path: "/friendship",
    component: () => import("@/views/Friendship/FriendshipView.vue"),
    name: "friendship",
    meta: {
      isAuthorized: true,
    }
  },
  {
    path: "/create",
    component: () => import("@/views/Create/CreateView.vue"),
    name: "create",
    meta: {
      isAuthorized: true,
    }
  },
  {
    path: "/user",
    name: "user",
    children: [
      {
        path: "space/:user_id",
        component: () => import("@/views/User/Space/SpaceView.vue"),
        name: "space",
        meta: {
          isAuthorized: true,
        }
      },
      {
        path: "profile",
        component: () => import("@/views/User/Profile/ProfileView.vue"),
        name: "profile",
        meta: {
          isAuthorized: true,
        }
      },
    ],
  },
  {
    path: "/404",
    component: () => import("@/views/Error/404View.vue"),
    name: "404",
    meta: {
      isAuthorized: false,
    }
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
import { ElMessage } from "element-plus";

router.beforeEach((to, from, next) => {
  if (to.meta.isAuthorized && !localStorage.getItem("token")) {
    ElMessage.error("请先登录喵~");
    next({ name: "login" });
  } else {
    next();
  }
});

export default router;
