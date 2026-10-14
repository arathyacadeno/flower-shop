import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "").trim(),
  authDomain: (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "").trim(),
  projectId: (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "").trim(),
  storageBucket: (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "").trim(),
  messagingSenderId: (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "").trim(),
  appId: (process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "").trim(),
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") {
    return null;
  }
  if (!_app) {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      _app = existingApps[0];
    } else if (firebaseConfig.apiKey) {
      _app = initializeApp(firebaseConfig);
    }
  }
  return _app;
}

export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") {
    return null;
  }
  if (!_auth) {
    const appInstance = getFirebaseApp();
    if (appInstance) {
      _auth = getAuth(appInstance);
    }
  }
  return _auth;
}

// Safe proxy for 'auth' that defers initialization to client-side runtime
// and prevents build/SSR crashes when API key is missing or during static generation
export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop, receiver) {
    const authInstance = getFirebaseAuth();
    if (!authInstance) {
      if (typeof window === "undefined") {
        return undefined;
      }
      throw new Error(
        "Firebase Auth is not configured. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is set in your environment variables."
      );
    }
    const value = Reflect.get(authInstance, prop, receiver);
    if (typeof value === "function") {
      return value.bind(authInstance);
    }
    return value;
  },
  has(_target, prop) {
    const authInstance = getFirebaseAuth();
    return authInstance ? Reflect.has(authInstance, prop) : false;
  },
});

// Safe proxy for 'app'
export const app: FirebaseApp = new Proxy({} as FirebaseApp, {
  get(_target, prop, receiver) {
    const appInstance = getFirebaseApp();
    if (!appInstance) {
      if (typeof window === "undefined") {
        return undefined;
      }
      throw new Error(
        "Firebase App is not configured. Please ensure Firebase environment variables are set."
      );
    }
    const value = Reflect.get(appInstance, prop, receiver);
    if (typeof value === "function") {
      return value.bind(appInstance);
    }
    return value;
  },
});

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

  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    throw new Error(
      "Firebase Auth is not configured. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is configured."
    );
  }

  const verifier = new RecaptchaVerifier(authInstance, containerId, {
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
  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    throw new Error(
      "Firebase Auth is not configured. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is configured."
    );
  }
  return await signInWithPhoneNumber(authInstance, phoneNumber, verifier);
}
