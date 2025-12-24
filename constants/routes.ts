const ROUTES = {
  HOME: "/",
  PROFILE: "/profile",
  CATEGORY: (slug: string) => `/category/${slug}`,
  PRODUCT: (id: string) => `/product/${id}`,
  CART: "/cart",
  WISHLIST: "/wishlist",
  ORDERS: "/orders",
  COLLECTION: (slug: string) => `/collection/${slug}`,
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
