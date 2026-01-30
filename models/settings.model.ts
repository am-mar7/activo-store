import mongoose, { models, Document } from "mongoose";

export interface IShippingSettings {
  cost: number;
}

export interface IHeroSection {
  enabled: boolean;
  title?: string;
  subtitle?: string;
  image?: string;
  cta?: {
    text: string;
    href: string;
  };
}

export interface ITopBanner {
  enabled: boolean;
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  link?: string;
  startsAt?: Date;
  endsAt?: Date;
}

export interface ICheckoutSettings {
  allowCOD: boolean;
  allowOnlinePayment: boolean;
}

export interface IMaintenanceSettings {
  enabled: boolean;
  message?: string;
}

export interface IAppSettings {
  shipping: IShippingSettings;
  heroSection: IHeroSection;
  topBanner: ITopBanner;
  checkout: ICheckoutSettings;
  maintenance: IMaintenanceSettings;
}

export interface IAppSettingsDoc extends IAppSettings, Document {}

const AppSettingsSchema = new mongoose.Schema<IAppSettings>(
  {
    shipping: {
      cost: { type: Number, required: true, default: 0 },
    },
    heroSection: {
      enabled: { type: Boolean, default: true },
      title: { type: String },
      subtitle: { type: String },
      image: {
        type: String,
        required: true,
        default: "https://ik.imagekit.io/AmmarAlaa470/uploads/hero.png",
      },
      cta: {
        text: { type: String },
        href: { type: String },
      },
    },
    topBanner: {
      enabled: { type: Boolean, default: false },
      text: { type: String },
      backgroundColor: { type: String, default: "#dc2626" },
      textColor: { type: String, default: "#ffffff" },
      link: { type: String },
      startsAt: { type: Date },
      endsAt: { type: Date },
    },
    checkout: {
      allowCOD: { type: Boolean, default: true },
      allowOnlinePayment: { type: Boolean, default: false },
    },
    maintenance: {
      enabled: { type: Boolean, default: false },
      message: { type: String },
    },
  },
  { timestamps: true }
);

AppSettingsSchema.index({}, { unique: true });

const AppSettings =
  models?.AppSettings ||
  mongoose.model<IAppSettings>("AppSettings", AppSettingsSchema);

export default AppSettings;
