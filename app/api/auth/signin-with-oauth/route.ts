import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import { dbConnect } from "@/lib/mongoose";
import { SignInWithOAuthSchema } from "@/lib/validation";
import Account from "@/models/account.model";
import User from "@/models/user.model";
import { APIErrorResponse } from "@/types/global";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("🔵 OAuth sign-in endpoint hit");
  
  let session: mongoose.ClientSession | null = null;
  
  try {
    const body = await request.json();
    console.log("📥 Received data:", body);
    
    const { user, providerAccountId, provider } = body;
    
    console.log("🔌 Connecting to database...");
    await dbConnect();
    console.log("✅ Database connected");
    
    console.log("🔄 Starting transaction...");
    session = await mongoose.startSession();
    session.startTransaction();
    console.log("✅ Transaction started");

    console.log("✔️ Validating data...");
    const validatedData = SignInWithOAuthSchema.safeParse({
      user,
      providerAccountId,
      provider,
    });
    
    if (!validatedData.success) {
      console.log("❌ Validation failed:", validatedData.error.flatten().fieldErrors);
      throw new ValidationError(validatedData.error.flatten().fieldErrors);
    }
    console.log("✅ Data validated");

    const { name, email, image } = user;
    console.log("👤 Processing user:", { name, email });

    console.log("🔍 Looking for existing user by email...");
    let existingUser = await User.findOne({ email }).session(session);
    
    if (!existingUser) {
      console.log("➕ Creating new user...");
      [existingUser] = await User.create([{ name, email, image }], { session });
      console.log("✅ User created:", existingUser._id);
    } else {
      console.log("✅ User found:", existingUser._id);
      
      const updatedData: { name?: string; email?: string; image?: string } = {};
      if (existingUser.name !== name) updatedData.name = name;
      if (existingUser.email !== email) updatedData.email = email;
      if (existingUser.image !== image) updatedData.image = image;

      if (Object.keys(updatedData).length > 0) {
        console.log("🔄 Updating user with:", updatedData);
        await User.updateOne(
          { _id: existingUser._id },
          { $set: updatedData }
        ).session(session);
        console.log("✅ User updated");
      }
    }

    console.log("🔍 Looking for existing account...");
    let existingAccount = await Account.findOne({
      provider,
      providerAccountId,
      userId: existingUser._id,
    }).session(session);
    
    if (!existingAccount) {
      console.log("➕ Creating new account...");
      [existingAccount] = await Account.create(
        [
          {
            userId: existingUser._id,
            name,
            image,
            provider,
            providerAccountId,
          },
        ],
        { session }
      );
      console.log("✅ Account created:", existingAccount._id);
    } else {
      console.log("✅ Account already exists:", existingAccount._id);
    }
    
    console.log("💾 Committing transaction...");
    await session.commitTransaction();
    console.log("✅ Transaction committed successfully");
    
    return NextResponse.json({ success: true, data: { userId: existingUser._id } });
  } catch (error) {
    console.error("❌ Error occurred:", error);
    
    if (session) {
      console.log("🔙 Aborting transaction...");
      await session.abortTransaction();
      console.log("✅ Transaction aborted");
    }
    
    return handleError(error, "api") as APIErrorResponse;
  } finally {
    if (session) {
      console.log("🔚 Ending session...");
      await session.endSession();
      console.log("✅ Session ended");
    }
  }
}