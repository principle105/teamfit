import { SvelteKitAuth } from "@auth/sveltekit";
import GitHub from "@auth/core/providers/github";
import { AUTH_SECRET, GITHUB_ID, GITHUB_SECRET } from "$env/static/private";
import type { User } from "$lib/types";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "$lib/mongodb";

export const handle = SvelteKitAuth({
    providers: [
        GitHub({
            clientId: GITHUB_ID,
            clientSecret: GITHUB_SECRET,
            profile: (profile) => {
                return {
                    id: profile.id.toString(),
                    firstName: profile.name,
                    lastName: null,
                    email: profile.email,
                    description: null,
                    image: profile.avatar_url,
                    goals: {},
                    friend: null,
                    surveyCompleted: false,
                    posts: [],
                    points: 0,
                    badges: [],
                } satisfies User;
            },
        }),
    ],
    adapter: MongoDBAdapter(clientPromise),
    callbacks: {
        async session({ session, user }) {
            session.user = user;
            return session;
        },
    },
    theme: {
        colorScheme: "light",
    },
    trustHost: true,
    secret: AUTH_SECRET,
});
