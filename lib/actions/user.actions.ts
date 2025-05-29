"use server";

import { cookies } from "next/headers";
import { ID, Query } from "node-appwrite";
import { appwriteConfig } from "../appwrite/config";

import { createAdminClient, createSessionClient } from "../appwrite";
import { parseStringify } from "lib/utils";

/**Get email */
const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();
  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])],
  );
  return result.total > 0 ? result.documents[0] : null;
};

/**Check Error */
const handleError = (error: unknown, message: string) => {
  console.error(error, message);
  throw error;
};

/**Send OTP */
export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();
  try {
    const session = await account.createEmailToken(ID.unique(), email);

    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send email OTP");
  }
};

/**Create acount */
interface ICreateAccount {
  fullName: string;
  email: string;
}

export const createAccount = async ({ fullName, email }: ICreateAccount) => {
  const existingUser = await getUserByEmail(email);

  const accountId = await sendEmailOTP({ email });
  if (!accountId) throw new Error("Failed to send an OTP");

  if (!existingUser) {
    const { databases } = await createAdminClient();

    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUqDBA8jnL_ezUoa8s_GgnboMkEeE4M7-LyA&s",
        accountId,
      },
    );
  }

  return parseStringify({ accountId });
};

interface IVerifySecreteProps {
  accountId: string;
  password: string;
}
export const verifySecret = async ({
  accountId,
  password,
}: IVerifySecreteProps) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createSession(accountId, password);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Failed to verify OTP");
  }
};

/**Get current user */
export const getCurrentUser = async () => {
  try {
    const { databases, account } = await createSessionClient();

    const result = await account.get();

    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", result.$id)],
    );

    if (user.total <= 0) return null;

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error);
  }
};
