import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "@models/user.model";
import { env } from "./env";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (_req, _accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(new Error("No email found in Google profile"), undefined);
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            email,
            googleId: profile.id,
            name: profile.displayName,
            profileImage: profile.photos?.[0].value || "",
            isVerified: true, // Google already verified this email
          });
        } else if (!user.googleId) {
          // Existing email/password user signing in with Google for the first time — link accounts
          user.googleId = profile.id;
          if (!user.profileImage)
            user.profileImage = profile.photos?.[0].value || "";
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    },
  ),
);



export default passport;
 