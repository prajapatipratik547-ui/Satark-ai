import type { UiStrings } from "../i18n.js";

/** Demo messages written by us; the phone number is the standard fictitious 98765 43210. */
export interface Example {
  labelKey: keyof Pick<UiStrings, "exampleDigitalArrest" | "exampleKyc" | "exampleGenuine">;
  text: string;
}

export const EXAMPLES: readonly Example[] = [
  {
    labelKey: "exampleDigitalArrest",
    text: "This is Inspector Rajesh Sharma from CBI Mumbai. A parcel in your name with illegal drugs was seized by customs. You are under digital arrest. Stay on the video call and do not tell your family. Transfer your savings to the RBI safe account for verification.",
  },
  {
    labelKey: "exampleKyc",
    text: "Dear SBI customer, your YONO account will be blocked today. Update your KYC immediately: http://sbi-kyc-update.example/login or call 98765 43210.",
  },
  {
    labelKey: "exampleGenuine",
    text: "482913 is your OTP for a transaction of Rs 2,499.00 at FLIPKART on HDFC Bank card ending 4321. Valid for 10 mins. Do not share this OTP with anyone. -HDFC Bank",
  },
];
