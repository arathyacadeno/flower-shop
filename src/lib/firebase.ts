import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

let app: FirebaseApp;

if (typeof window !== "undefined") {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} else {
  // Provide safe fallback on server during SSR / build time
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig, "server-app");
}

export const auth: Auth = getAuth(app);
export { app };

/**
 * Validates and formats mobile numbers to E.164 (+91XXXXXXXXXX)
 */
export function formatPhoneNumber(phone: string, countryCode: string = "+91"): string {
  const digits = phone.replace(/\D/g, "");
  const cleanCountry = countryCode.startsWith("+") ? countryCode : `+${countryCode}`;

  // If already starts with country code without '+' (e.g. 919876543210)
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  // 10 digit Indian number
  if (digits.length === 10) {
    return `${cleanCountry}${digits}`;
  }

  // Fallback: prepend country code
  return `${cleanCountry}${digits}`;
}

/**
 * Initializes or reuses a RecaptchaVerifier safely
 */
export function initRecaptchaVerifier(
  containerId: string | HTMLElement,
  options: {
    size?: "invisible" | "normal";
    callback?: () => void;
    "expired-callback"?: () => void;
  } = { size: "invisible" }
): RecaptchaVerifier {
  if (typeof window === "undefined") {
    throw new Error("RecaptchaVerifier can only be initialized on the client");
  }

  // Clear existing verifier on window if present
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch {
      // ignore cleanup errors
    }
    (window as any).recaptchaVerifier = null;
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: options.size || "invisible",
    callback: options.callback,
    "expired-callback": options["expired-callback"],
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Clean up RecaptchaVerifier
 */
export function cleanupRecaptchaVerifier(verifier?: RecaptchaVerifier | null) {
  try {
    if (verifier) {
      verifier.clear();
    }
  } catch {
    // ignore
  }

  if (typeof window !== "undefined" && (window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch {
      // ignore
    }
    (window as any).recaptchaVerifier = null;
  }
}

/**
 * Sends OTP to the formatted phone number using Firebase Phone Authentication
 */
export async function sendOtpToPhoneNumber(
  phoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  return await signInWithPhoneNumber(auth, phoneNumber, verifier);
}
