import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { SignInSchema } from "./lib/validation";
import api from "./lib/api";
import { ActionResponse } from "./types/global";
import { IUserDoc } from "./models/user.model";
import { IAccountDoc } from "./models/account.model";
import bcrypt from "bcryptjs";


export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      async authorize(credentials) {
        const validatedData = SignInSchema.safeParse(credentials);

        if (!validatedData.success) return null;

        const { email, password } = validatedData.data;

        const { data: user } = (await api.users.getByEmail(
          email
        )) as ActionResponse<IUserDoc>;
        if (!user) return null;

        const { data: account } = (await api.accounts.getByProvider(
          email
        )) as ActionResponse<IAccountDoc>;
        if (!account || !account.password) return null;

        const isValidPassword = await bcrypt.compare(
          password,
          account.password
        );

        if (!isValidPassword) return null;
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (!session.user) return session;
      session.user.id = token.sub! as string;
      return session;
    },
    jwt: async ({ token, account }) => {
      if (account) {
        const { data, success } = (await api.accounts.getByProvider(
          account.type === "credentials"
            ? token.email!
            : account.providerAccountId
        )) as ActionResponse<IAccountDoc>;
        if (!success || !data) return token;

        const userId = data.userId;
        if (userId) token.sub = userId.toString();
      }
      return token;
    },
    signIn: async ({ user, account }) => {
      if (account?.type === "credentials") return true;
      if (!user && !account) return false;

      const userInfo = {
        name: user.name!,
        email: user.email!,
        image: user.image!,
      };
      const { success } = (await api.auth.oAuthSignIn({
        user: userInfo,
        provider: account!.provider as "google" | "github",
        providerAccountId: account!.providerAccountId,
      })) as ActionResponse;

      return success;
    },
  },
});
