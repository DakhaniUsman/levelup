import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User, { IUser } from "@/models/User";
import UserProfile from "@/models/UserProfile";
import { RegisterUserInput, LoginInput } from "../schemas/auth.schema";
import { createSession, deleteSession, getSession } from "@/lib/session";

export interface SafeUser {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  timezone: string;
}

export class AuthService {
  static async register(input: RegisterUserInput): Promise<SafeUser> {
    await dbConnect();

    const normalizedEmail = input.email.toLowerCase().trim();
    const normalizedUsername = input.username.toLowerCase().trim();

    // Check existing email
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      throw new Error("An account with this email address already exists.");
    }

    // Check existing username
    const existingUsername = await User.findOne({ username: normalizedUsername });
    if (existingUsername) {
      throw new Error("This username is already claimed by another hunter.");
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(input.password, salt);

    // Create User
    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      role: "USER",
      status: "ACTIVE",
    });

    // Create UserProfile
    const displayName = input.displayName || normalizedUsername;
    const profile = await UserProfile.create({
      userId: user._id,
      displayName,
      timezone: input.timezone || "UTC",
    });

    // Issue session cookie
    await createSession(user._id.toString(), user.role, user.username);

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      timezone: profile.timezone,
    };
  }

  static async login(input: LoginInput): Promise<SafeUser> {
    await dbConnect();

    const identifier = input.identifier.toLowerCase().trim();

    // Find by email or username, explicitly selecting passwordHash
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+passwordHash");

    if (!user) {
      throw new Error("Invalid hunter credentials.");
    }

    if (user.status !== "ACTIVE") {
      throw new Error("This account is currently suspended. Access denied.");
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new Error("Invalid hunter credentials.");
    }

    // Fetch profile
    let profile = await UserProfile.findOne({ userId: user._id });
    if (!profile) {
      // Fallback if profile wasn't created
      profile = await UserProfile.create({
        userId: user._id,
        displayName: user.username,
        timezone: "UTC",
      });
    }

    // Issue session
    await createSession(user._id.toString(), user.role, user.username);

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      timezone: profile.timezone,
    };
  }

  static async logout(): Promise<void> {
    await deleteSession();
  }

  static async getCurrentUser(): Promise<SafeUser | null> {
    const session = await getSession();
    if (!session?.userId) return null;

    await dbConnect();

    const user = await User.findById(session.userId);
    if (!user || user.status !== "ACTIVE") {
      await deleteSession();
      return null;
    }

    const profile = await UserProfile.findOne({ userId: user._id });

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      displayName: profile?.displayName || user.username,
      avatarUrl: profile?.avatarUrl,
      bio: profile?.bio,
      timezone: profile?.timezone || "UTC",
    };
  }
}

