import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/views/Home/HomeView.vue"),
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
import { useUserStore } from "@/stores/userStore";
import { useNavbarStore } from "@/stores/navbarStore";

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const navbarStore = useNavbarStore();
  if (to.meta.isAuthorized && !userStore.isLogin) {
    // 访问需要登录的页面时，如果未登录，返回首页并打开登录窗口
    router.push('/');
    navbarStore.openLoginModal();
  } else {
    next();
  }
});

export default router;
