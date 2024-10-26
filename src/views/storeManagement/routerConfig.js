import Layout from '@/layout';
import secondAppMain from '@/layout/components/secondAppMain';
const routes = [
  {
    path: "/basicSetting",
    component: Layout,
    redirect: "/basicSetting/store",
    meta: {
      requireAuth: true,
      title: "基础设置",
      icon: "icon-dianpuguanli",
    },
    sort: 3,
    children: [
      {
        path: "/basicSetting/store",
        component: secondAppMain,
        redirect: "/basicSetting/store/storeEbay",
        meta: {
          requireAuth: true,
          title: "店铺管理",
          icon: "icon-dianpuguanli",
        },
        children: [
          {
            path: "/basicSetting/store/storeEbay",
            component: () => import("./pages/ebay"),
            meta: {
              requireAuth: true,
              title: "Ebay",
            }
          },
          {
            path: "/basicSetting/store/storeWalmart",
            component: () => import("./pages/walmart"),
            meta: {
              requireAuth: true,
              title: "Walmart",
            }
          },
          {
            path: "/basicSetting/store/storeTemu",
            component: () => import("./pages/storeTemu"),
            meta: {
              requireAuth: true,
              title: "Temu",
            }
          },
          {
            path: "/basicSetting/store/storeAliExpress",
            component: () => import("./pages/AliExpress"),
            meta: {
              requireAuth: true,
              title: "AliExpress",
            }
          },
          {
            path: "/basicSetting/store/storeTiktok",
            component: () => import("./pages/storeTiktok"),
            meta: {
              requireAuth: true,
              title: "Tiktok",
            }
          },
          {
            path: "/basicSetting/store/storeOtto",
            component: () => import("./pages/storeOtto"),
            meta: {
              requireAuth: true,
              title: "Otto",
            }
          },
          {
            path: "/basicSetting/store/storeReal",
            component: () => import("./pages/storeReal"),
            meta: {
              requireAuth: true,
              title: "Real",
            }
          },
          {
            path: "/basicSetting/store/temuHalfPipe",
            component: () => import("./pages/temuHalfPipe"),
            meta: {
              requireAuth: true,
              title: "Temu半托管",
            }
          },
        ]
      }
    ],
  },
];
export default routes;
