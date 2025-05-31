import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey as string,
    authDomain: config.public.firebaseAuthDomain as string,
    projectId: config.public.firebaseProjectId as string,
    storageBucket: config.public.firebaseStorageBucket as string,
    messagingSenderId: config.public.firebaseMessagingSenderId as string,
    appId: config.public.firebaseAppId as string,
  };

  // Firebase アプリを初期化
  const app = initializeApp(firebaseConfig);

  // Firebase サービスを初期化
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);

  return {
    provide: {
      firebase: app,
      auth,
      firestore,
      storage,
    },
  };
});
