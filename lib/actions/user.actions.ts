"use server";
import { ID, Query } from "node-appwrite";
import { appwriteConfig } from "../appwrite/config";

import { createAdminClient } from "lib/appwrite";
import { parseStringify } from "lib/utils";

const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();
  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])],
  );
  return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
  console.error(error, message);
  throw error;
};

const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();
  try {
    const session = await account.createEmailToken(ID.unique(), email);
    return session;
  } catch (error) {
    handleError(error, "Failed to send email OTP");
  }
};

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
        avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUqDBA8jnL_ezUoa8s_GgnboMkEeE4M7-LyA&s",
        accountId,
      },
    );
  }

  return parseStringify({ accountId });
};
