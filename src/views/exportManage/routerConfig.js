import Layout from '@/layout';
const routes = [
  {
    path: "/exportManage",
    component: Layout,
    redirect: "/exportManage/export",
    meta: {
      requireAuth: true,
      title: "基础功能",
    },
    children: [
      {
        path: "/exportManage/export",
        component: () => import("./pages/export"),
        meta: {
          requireAuth: true,
          title: "导出查看",
        }
      },
      {
        path: "/exportManage/import",
        component: () => import("./pages/import"),
        meta: {
          requireAuth: true,
          title: "导入查看",
        }
      },
    ],
  },
];
export default routes;
