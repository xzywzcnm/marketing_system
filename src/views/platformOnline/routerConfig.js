import Layout from '@/layout';
const routes = [
  {
    path: '/online',
    component: Layout,
    redirect: '/onlineEbay',
    meta: {
      requireAuth: true,
      title: "产品在线",
      icon: "icon-similarproduct"
    },
    sort: 1,
    children: [
      {
        path: "/onlineEbay",
        component: () => import("./pages/ebay"),
        meta: {
          requireAuth: true,
          title: "Ebay",
          otitle: 'Ebay在线'
        }
      },
      {
        path: "/onlineWalmart",
        component: () => import("./pages/walmart"),
        meta: {
          requireAuth: true,
          title: "Walmart",
          otitle: 'Walmart在线'
        }
      },
      {
        path: "/onlineWalmartWFS",
        component: () => import("./pages/walmartWFS.vue"),
        meta: {
          requireAuth: true,
          title: "Walmart（WFS）",
          otitle: 'Walmart（WFS）'
        }
      },
      {
        path: "/online-detail",
        component: () => import("../components/detail"),
        meta: {
          requireAuth: true,
          title: "产品详情"
        },
        hidden: true,
      },
      {
        path: "/onlineAbnormalLink",
        component: () => import("./pages/abnormalLink"),
        meta: {
          requireAuth: true,
          title: "异常修改链接"
        },
      },
      {
        path: "/onlineTemu",
        component: () => import("./pages/temu"),
        meta: {
          requireAuth: true,
          title: "Temu在线"
        },
      },
      {
        path: "/onlineOtto",
        component: () => import("./pages/otto"),
        meta: {
          requireAuth: true,
          title: "Otto在线"
        },
      },
      {
        path: "/onlineAliExpress",
        component: () => import("./pages/aliExpress"),
        meta: {
          requireAuth: true,
          title: "AliExpress"
        },
      },
      {
        path: "/onlineTiktok",
        component: () => import("./pages/onlineTiktok"),
        meta: {
          requireAuth: true,
          title: "Tiktok在线"
        },
      },
      {
        path: "/onlineReal",
        component: () => import("./pages/real"),
        meta: {
          requireAuth: true,
          title: "Real在线"
        },
      },
      {
        path: "/onlineTemuHalfPipe",
        component: () => import("./pages/temuHalfPipe"),
        meta: {
          requireAuth: true,
          title: "Temu半托管"
        },
      },
    ]
  }
];

export default routes
