import PageWithSSR from './PageWithSSR';
import PageWithoutSSR from './PageWithoutSSR';

// This is a static route configuration. It should include all of your top level
// routes, regardless of whether they are going to server render. In fact, you
// can totally point multiple routes to the same component! This is great for
// when you only need to server render a handful of routes and not your entire
// application!
const routes = [
  {
    path: '/',
    component: PageWithSSR,
    // this name property is optional, but I'm using it to generate the nav
    name: 'PageWithSSR',
    exact: true,
  },
  {
    path: '/pagewithoutssr',
    component: PageWithoutSSR,
    name: 'PageWithoutSSR',
    exact: true,
  },
];

export default routes;
