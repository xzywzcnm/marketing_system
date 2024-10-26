import Layout from '@/layout';
const routes = [{
  path: "/financial-account",
  component: Layout,
  redirect: "/account-walmart",
  meta: {
    requireAuth: true,
    title: "财务账单获取",
    icon: "icon-dianpuguanli",
  },
  children: [{
    path: "/account-walmart",
    component: () => import("./pages/accountWalmart"),
    meta: {
      requireAuth: true,
      title: "walmart收款账单"
    }
  },
  ]
}];
export default routes;
