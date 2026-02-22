import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const users = new Map();

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account) {
                token.accessToken = account.access_token;
                token.id = profile?.sub;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;

                const existingUser = users.get(session.user.email);
                if (!existingUser) {
                    users.set(session.user.email, {
                        email: session.user.email,
                        name: session.user.name,
                        image: session.user.image,
                        createdAt: new Date(),
                    });
                    session.user.isNewUser = true;
                } else {
                    session.user.isNewUser = false;
                }
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            return url;
        },
    },
});

export { handler as GET, handler as POST };