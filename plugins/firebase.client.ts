import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { createLogger } from "~/utils/logger";

export default defineNuxtPlugin(() => {
  const logger = createLogger('FirebasePlugin')
  const config = useRuntimeConfig();

  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey as string,
    authDomain: config.public.firebaseAuthDomain as string,
    projectId: config.public.firebaseProjectId as string,
    storageBucket: config.public.firebaseStorageBucket as string,
    messagingSenderId: config.public.firebaseMessagingSenderId as string,
    appId: config.public.firebaseAppId as string,
  };

  // 必須設定値の確認
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Firebase configuration is incomplete');
  }

  // Firebase アプリを初期化
  const app = initializeApp(firebaseConfig);

  // Firebase サービスを初期化
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);

  // 開発環境でEmulatorを使用
  if (process.dev && config.public.useFirebaseEmulator) {
    // Auth Emulator
    if (!auth.emulatorConfig) {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    }

    // Firestore Emulator
    if (!firestore._settings?.host?.includes("localhost:8080")) {
      connectFirestoreEmulator(firestore, "localhost", 8080);
    }

    // Storage Emulator
    if (!storage._customUrlOrRegion?.includes("localhost:9199")) {
      connectStorageEmulator(storage, "localhost", 9199);
    }

    logger.info("Firebase Emulator Suite connected");
  }

  return {
    provide: {
      firebase: app,
      auth,
      firestore,
      storage,
    },
  };
});
