const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
};

export const DASHBOARDROUTES = {
  HOME: "/dashboard",
  ORDERS: "/dashboard/orders",
  USERS: "/dashboard/users",
  PRODUCTS: "/dashboard/products",
  ADDPRODUCT: "/dashboard/products/add",
  EDITPRODUCT: (id: string) => `/dashboard/products/edit/${id}`,
  CATEGORYS: "/dashboard/categorys",
  ADDCATEGORY: "/dashboard/categorys/add",
  EDITCATEGORY: (id: string) => `/dashboard/categorys/edit/${id}`,
  PROMOCODES: "/dashboard/promocodes",
  REVIEWS: "/dashboard/reviews",
};
export default ROUTES;
