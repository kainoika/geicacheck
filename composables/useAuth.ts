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
import { createLogger } from "~/utils/logger";

export const useAuth = () => {
  const logger = createLogger('useAuth');
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
          logger.error("Auth state change error", err);
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
        // resultオブジェクト全体を渡してadditionalUserInfoにアクセス
        await saveUserToFirestore(result.user, credential, result);

        // アプリユーザーに変換
        const appUser = await convertFirebaseUserToAppUser(result.user);
        user.value = appUser;

        return appUser;
      }
    } catch (err: any) {
      logger.error("Twitter sign in error", err);
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
      logger.error("Sign out error", err);
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
      logger.error("Update user profile error", err);
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
        twitterScreenName: userData.twitterScreenName,
        settings: userData.settings || {
          emailNotifications: true,
          adultContent: false,
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
    credential: any,
    authResult?: any
  ) => {
    const { $firestore } = useNuxtApp();
    const userRef = doc($firestore, "users", firebaseUser.uid);

    // Twitter情報を取得
    const twitterProvider = firebaseUser.providerData.find(
      provider => provider.providerId === 'twitter.com'
    );

    let twitterId: string | undefined;
    let twitterUsername: string | undefined;
    let twitterScreenName: string | undefined;

    if (twitterProvider) {
      twitterId = twitterProvider.uid;
      twitterUsername = twitterProvider.displayName || firebaseUser.displayName;
    }

    // authResultからadditionalUserInfoを取得
    if (authResult && authResult._tokenResponse) {
      // _tokenResponseにscreen_nameが含まれている場合
      if (authResult._tokenResponse.screenName) {
        twitterScreenName = authResult._tokenResponse.screenName;
      }
    }
    
    // 別の方法: additionalUserInfoから取得
    if (!twitterScreenName && authResult && (authResult as any).additionalUserInfo?.profile) {
      const profile = (authResult as any).additionalUserInfo.profile;
      if (profile.screen_name) {
        twitterScreenName = profile.screen_name;
      }
    }

    const userData = {
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      twitterId,
      twitterUsername,
      twitterScreenName,
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
      // Firebase Auth Twitter providerからTwitter ID情報を取得
      const currentUser = $auth.currentUser;
      if (!currentUser) return undefined;

      // Twitter providerからのユーザー情報を確認
      const twitterProvider = currentUser.providerData.find(
        provider => provider.providerId === 'twitter.com'
      );

      if (twitterProvider) {
        // プロバイダーIDからTwitter IDを抽出
        const twitterUid = twitterProvider.uid;
        return twitterUid;
      }

      return undefined;
    } catch (err) {
      logger.error("Failed to get Twitter ID", err);
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
