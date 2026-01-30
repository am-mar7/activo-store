"use server";

import {
  ActionResponse,
  ErrorResponse,
  SettingsParams,
  SettingsType,
} from "@/types/global";
import actionHandler from "../handlers/action";
import { appSettingsSchema } from "../validation";
import handleError from "../handlers/error";
import AppSettings, { IAppSettings } from "@/models/settings.model";
import { UnauthorizedError } from "../http-errors";
import { handleUpload } from "../utils";
import { dbConnect } from "../mongoose";
import { auth } from "@/auth";
import { cache } from "react";

export async function updateSettings(
  params: SettingsParams
): Promise<ActionResponse<SettingsType>> {
  const validated = await actionHandler({
    params,
    schema: appSettingsSchema.partial(),
    authorizetionProccess: true,
  });

  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const isAdmin = validated.session?.user.role === "admin";

  try {
    if (!isAdmin) throw new UnauthorizedError("Admin access required.");

    let settings = await AppSettings.findOne();
    if (!settings) settings = new AppSettings({});

    const { heroSection, ...rest } = validated.params!;

    const updatedSettings: Partial<IAppSettings> = {
      ...settings.toObject(),
      ...rest,
    };

    if (heroSection) {
      if (heroSection.image instanceof File) {
        const uploadResult = await handleUpload(heroSection.image);
        if (!uploadResult.success) throw new Error(uploadResult.error?.message);

        updatedSettings.heroSection = {
          ...settings.heroSection,
          ...heroSection,
          image: uploadResult.data!.url,
        };
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { image, ...heroWithoutImage } = heroSection;
        updatedSettings.heroSection = {
          ...settings.heroSection,
          ...heroWithoutImage,
        };
      }
    }

    settings.set(updatedSettings);
    await settings.save();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(settings.toObject())),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export const getSettings = cache(
  async (): Promise<ActionResponse<SettingsType>> => {
    try {
      await dbConnect();
      const session = await auth();

      const isAdmin = session?.user.role === "admin";
      if (!isAdmin) throw new UnauthorizedError("Admin access required.");

      let settings = await AppSettings.findOne();

      if (!settings) {
        settings = new AppSettings({});
        await settings.save();
      }

      return {
        success: true,
        data: JSON.parse(JSON.stringify(settings.toObject())),
      };
    } catch (error) {
      return handleError(error) as ErrorResponse;
    }
  }
);
