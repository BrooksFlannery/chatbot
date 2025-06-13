import { betterAuth } from "better-auth";
import { db } from '@/lib/db/index'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    emailAndPassword: {
        enabled: true
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        }
    },
    plugins: [nextCookies()],
    logger: {
        level: "debug", // Add this
        disabled: false
    }
})

export const getSession = auth.api.getSession;
export const signInEmail = auth.api.signInEmail;
export const signupEmail = auth.api.signUpEmail;
export const signOut = auth.api.signOut;