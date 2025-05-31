import {
  signInWithPopup,
  TwitterAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { User } from "~/types";

export const useAuth = () => {
  const user = useState<User | null>("auth.user", () => null);
  const loading = useState<boolean>("auth.loading", () => true);
  const error = useState<string | null>("auth.error", () => null);

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.userType === "admin");
  const isCircleUser = computed(() => user.value?.userType === "circle");

  // Firebase Auth インスタンス取得
  const { $auth, $firestore } = useNuxtApp() as any;

  // 認証状態の監視
  const initAuth = () => {
    if (process.client && $auth) {
      onAuthStateChanged($auth, async (firebaseUser: FirebaseUser | null) => {
        loading.value = true;
        try {
          if (firebaseUser) {
            // Firebaseユーザーからアプリユーザーに変換
            const appUser = await convertFirebaseUserToAppUser(firebaseUser);
            user.value = appUser;
          } else {
            user.value = null;
          }
        } catch (err) {
          console.error("Auth state change error:", err);
          error.value = "認証状態の取得に失敗しました";
          user.value = null;
        } finally {
          loading.value = false;
        }
      });
    }
  };

  // Twitterでサインイン
  const signInWithTwitter = async () => {
    if (!$auth) {
      throw new Error("Firebase Auth is not initialized");
    }

    loading.value = true;
    error.value = null;

    try {
      const provider = new TwitterAuthProvider();
      provider.addScope("tweet.read");
      provider.addScope("users.read");

      const result = await signInWithPopup($auth, provider);
      const credential = TwitterAuthProvider.credentialFromResult(result);

      if (result.user && credential) {
        // ユーザー情報をFirestoreに保存
        await saveUserToFirestore(result.user, credential);

        // アプリユーザーに変換
        const appUser = await convertFirebaseUserToAppUser(result.user);
        user.value = appUser;

        return appUser;
      }
    } catch (err: any) {
      console.error("Twitter sign in error:", err);
      error.value = getAuthErrorMessage(err.code);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // サインアウト
  const signOut = async () => {
    if (!$auth) return;

    loading.value = true;
    error.value = null;

    try {
      await firebaseSignOut($auth);
      user.value = null;

      // ローカルストレージをクリア
      if (process.client) {
        localStorage.removeItem("bookmarks");
        localStorage.removeItem("searchHistory");
      }
    } catch (err: any) {
      console.error("Sign out error:", err);
      error.value = "ログアウトに失敗しました";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ユーザー情報の更新
  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user.value) {
      throw new Error("ユーザーがログインしていません");
    }

    try {
      const { $firestore } = useNuxtApp();
      const userRef = doc($firestore, "users", user.value.uid);

      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      await updateDoc(userRef, updateData);

      // ローカル状態を更新
      user.value = {
        ...user.value,
        ...updates,
        updatedAt: new Date(),
      };

      return user.value;
    } catch (err) {
      console.error("Update user profile error:", err);
      throw new Error("プロフィールの更新に失敗しました");
    }
  };

  // Firebase ユーザーをアプリユーザーに変換
  const convertFirebaseUserToAppUser = async (
    firebaseUser: FirebaseUser
  ): Promise<User> => {
    const { $firestore } = useNuxtApp();
    const userRef = doc($firestore, "users", firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || "",
        photoURL: firebaseUser.photoURL || undefined,
        userType: userData.userType || "general",
        twitterId: userData.twitterId,
        twitterUsername: userData.twitterUsername,
        settings: userData.settings || {
          emailNotifications: true,
          adultContent: false,
          theme: "auto",
        },
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
      };
    } else {
      // 新規ユーザーの場合、デフォルト値で作成
      const newUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || "",
        photoURL: firebaseUser.photoURL || undefined,
        userType: "general",
        settings: {
          emailNotifications: true,
          adultContent: false,
          theme: "auto",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Firestoreに保存
      await setDoc(userRef, {
        ...newUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return newUser;
    }
  };

  // ユーザー情報をFirestoreに保存
  const saveUserToFirestore = async (
    firebaseUser: FirebaseUser,
    credential: any
  ) => {
    const { $firestore } = useNuxtApp();
    const userRef = doc($firestore, "users", firebaseUser.uid);

    // Twitter情報を取得
    const twitterId = credential.accessToken
      ? await getTwitterId(credential.accessToken)
      : undefined;

    const userData = {
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      twitterId,
      twitterUsername: firebaseUser.displayName,
      updatedAt: serverTimestamp(),
    };

    // 既存ユーザーの場合は更新、新規の場合は作成
    await setDoc(userRef, userData, { merge: true });
  };

  // Twitter IDを取得（簡易版）
  const getTwitterId = async (
    accessToken: string
  ): Promise<string | undefined> => {
    try {
      // 実際の実装では Twitter API v2 を使用
      // ここでは簡易的な実装
      return undefined;
    } catch (err) {
      console.error("Failed to get Twitter ID:", err);
      return undefined;
    }
  };

  // エラーメッセージの取得
  const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case "auth/popup-closed-by-user":
        return "ログインがキャンセルされました";
      case "auth/popup-blocked":
        return "ポップアップがブロックされました。ポップアップを許可してください";
      case "auth/cancelled-popup-request":
        return "ログイン処理がキャンセルされました";
      case "auth/network-request-failed":
        return "ネットワークエラーが発生しました";
      case "auth/too-many-requests":
        return "リクエストが多すぎます。しばらく待ってから再試行してください";
      default:
        return "ログインに失敗しました";
    }
  };

  // 初期化
  if (process.client) {
    initAuth();
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    isAuthenticated,
    isAdmin,
    isCircleUser,
    signInWithTwitter,
    signOut,
    updateUserProfile,
  };
};
