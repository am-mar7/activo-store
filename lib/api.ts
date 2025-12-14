import { IUser } from "@/models/user.model";
import fetchData from "./handlers/fetch";
import { IAccount } from "@/models/account.model";
import { SignInWithOauthParams } from "@/types/global";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const api = {
  auth: {
    oAuthSignIn: ({
      user,
      providerAccountId,
      provider,
    }: SignInWithOauthParams) =>
      fetchData(`${API_BASE_URL}/auth/signin-with-oauth`, {
        method: "POST",
        body: JSON.stringify({ user, providerAccountId, provider }),
      }),
  },
  users: {
    getAll: () => fetchData(`${API_BASE_URL}/users`),
    getById: (id: string) => fetchData(`${API_BASE_URL}/users/${id}`),
    getByEmail: (email: string) =>
      fetchData(`${API_BASE_URL}/users/email`, {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    create: (userData: Partial<IUser>) =>
      fetchData(`${API_BASE_URL}/users`, {
        method: "POST",
        body: JSON.stringify(userData),
      }),
    update: (id: string, userData: Partial<IUser>) =>
      fetchData(`${API_BASE_URL}/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      }),
    delete: (id: string) =>
      fetchData(`${API_BASE_URL}/users/${id}`, { method: "DELETE" }),
  },
  accounts: {
    getAll: () => fetchData(`${API_BASE_URL}/accounts`),
    getById: (id: string) => fetchData(`${API_BASE_URL}/accounts/${id}`),
    getByProvider: (providerAccountId: string) =>
      fetchData(`${API_BASE_URL}/accounts/provider`, {
        method: "POST",
        body: JSON.stringify({ providerAccountId }),
      }),
    create: (accountData: Partial<IAccount>) =>
      fetchData(`${API_BASE_URL}/accounts`, {
        method: "POST",
        body: JSON.stringify(accountData),
      }),
    update: (id: string, accountData: Partial<IAccount>) =>
      fetchData(`${API_BASE_URL}/accounts/${id}`, {
        method: "PUT",
        body: JSON.stringify(accountData),
      }),
    delete: (id: string) =>
      fetchData(`${API_BASE_URL}/accounts/${id}`, { method: "DELETE" }),
  },
};

export default api;