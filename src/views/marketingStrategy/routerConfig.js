import Layout from '@/layout';
const routes = [{
  path: "/marketing-strategy",
  component: Layout,
  redirect: "/strategy-index",
  meta: {
    requireAuth: true,
    title: "营销功能",
    icon: "icon-dianpuguanli",
  },
  sort: 4,
  children: [
    {
      path: "/strategy-index",
      component: () => import("./pages/marketingStrategy"),
      meta: {
        requireAuth: true,
        title: "营销策略"
      }
    },
    {
      path: "/strategy-application",
      component: () => import("./pages/application"),
      meta: {
        requireAuth: true,
        title: "策略应用"
      },
      hidden: true,
    },
    {
      path: "/sale-price",
      component: () => import("./pages/salePrice"),
      meta: {
        requireAuth: true,
        title: "售价估算"
      }
    },
  ]
}];
export default routes;
