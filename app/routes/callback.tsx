import { authorizationCodeGrant, getMe, caches } from "~/data";
import { eq } from "drizzle-orm";
import * as schema from "~/database/schema";
import { redirect } from "react-router";

export async function loader({ request, context }: any) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/");
  }

  try {
    const clientId = process.env.VITE_CLIENT_ID || import.meta.env.VITE_CLIENT_ID || "";
    const clientSecret =
      process.env.CLIENT_SECRET || import.meta.env.CLIENT_SECRET || "";
    const redirectUri =
      process.env.VITE_REDIRECT_URL || import.meta.env.VITE_REDIRECT_URL || "";

    const data = (await authorizationCodeGrant(
      code,
      clientId,
      clientSecret,
      redirectUri
    )) as any;
    const { access_token, refresh_token } = data;

    const user_data = (await getMe(access_token)) as any;
    const email = user_data.email;
    const expectedEmail = process.env.VITE_EMAIL || import.meta.env.VITE_EMAIL || "";

    if (!email || email !== expectedEmail) {
      return redirect(`/?error=invalidEmail&email=${email}`);
    }

    // If match then post it to db.
    const existingUser = await context.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (existingUser) {
      await context.db
        .update(schema.users)
        .set({
          token: access_token,
          refreshToken: refresh_token,
        })
        .where(eq(schema.users.email, email));
    } else {
      await context.db.insert(schema.users).values({
        email,
        token: access_token,
        refreshToken: refresh_token,
      });
    }

    caches.set("token", access_token);
    caches.set("refresh_token", refresh_token);

    return redirect("/");
  } catch (error) {
    console.error("Error during callback:", error);
    return redirect("/?error=callbackError");
  }
}
