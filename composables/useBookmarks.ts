import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import type {
  Bookmark,
  BookmarkCategory,
  BookmarkWithCircle,
  Circle,
} from "~/types";
import { createLogger } from "~/utils/logger";

export const useBookmarks = () => {
  const logger = createLogger('useBookmarks');
  const { user, isAuthenticated } = useAuth();
  const { $firestore } = useNuxtApp() as any;
  const { currentEvent } = useEvents();

  // State
  const bookmarks = useState<Bookmark[]>("bookmarks.list", () => []);
  const bookmarksWithCircles = useState<BookmarkWithCircle[]>(
    "bookmarks.withCircles",
    () => []
  );
  const loading = useState<boolean>("bookmarks.loading", () => false);
  const error = useState<string | null>("bookmarks.error", () => null);

  // Computed
  const bookmarkCount = computed(() => bookmarks.value.length);
  const bookmarksByCategory = computed(() => {
    const grouped: Record<BookmarkCategory, Bookmark[]> = {
      check: [],
      interested: [],
      priority: [],
    };

    bookmarks.value.forEach((bookmark) => {
      grouped[bookmark.category].push(bookmark);
    });

    return grouped;
  });

  // リアルタイムリスナー
  let unsubscribe: Unsubscribe | null = null;

  // ブックマーク一覧を取得
  const fetchBookmarks = async (eventId?: string) => {
    logger.debug('fetchBookmarks called', { eventId });
    logger.debug('Authentication status', { isAuthenticated: isAuthenticated.value, hasUser: !!user.value });
    
    if (!isAuthenticated.value || !user.value) {
      logger.debug('Not authenticated, clearing bookmarks');
      bookmarks.value = [];
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const targetEventId = eventId || currentEvent.value?.id;
      logger.debug('Target event ID', { targetEventId, currentEvent: currentEvent.value });
      
      if (!targetEventId) {
        logger.debug('No target event ID, clearing bookmarks');
        bookmarks.value = [];
        return;
      }

      // users/{userId}/bookmarks サブコレクションから取得
      const bookmarksPath = `users/${user.value.uid}/bookmarks`;
      logger.debug('Fetching from path', { bookmarksPath });
      const bookmarksRef = collection($firestore, "users", user.value.uid, "bookmarks");
      let q = query(
        bookmarksRef,
        where("eventId", "==", targetEventId),
        orderBy("createdAt", "desc")
      );

      logger.debug('Executing query with eventId filter', { targetEventId });
      const snapshot = await getDocs(q);
      logger.debug('Query result', { documentCount: snapshot.size });
      
      const bookmarkList: Bookmark[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        logger.debug('Processing bookmark document', { docId: doc.id, data });
        bookmarkList.push({
          id: doc.id,
          userId: user.value.uid,
          circleId: doc.id, // ドキュメントIDがcircleId
          eventId: data.eventId || targetEventId,
          category: data.category,
          visited: data.visited || false, // 🆕 visited情報を読み込み（デフォルトfalse）
          visitedAt: data.visitedAt?.toDate() || undefined, // 🆕 visitedAt情報を読み込み
          memo: data.memo,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      logger.info('Bookmarks fetched successfully', { count: bookmarkList.length });
      bookmarks.value = bookmarkList;
    } catch (err) {
      logger.error("Fetch bookmarks error", err);
      error.value = "ブックマークの取得に失敗しました";
    } finally {
      loading.value = false;
    }
  };

  // リアルタイムでブックマークを監視
  const subscribeToBookmarks = (eventId?: string) => {
    if (!isAuthenticated.value || !user.value) {
      return;
    }

    const targetEventId = eventId || currentEvent.value?.id;
    if (!targetEventId) {
      return;
    }

    // users/{userId}/bookmarks サブコレクションを監視
    const bookmarksRef = collection($firestore, "users", user.value.uid, "bookmarks");
    let q = query(
      bookmarksRef,
      where("eventId", "==", targetEventId),
      orderBy("createdAt", "desc")
    );

    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookmarkList: Bookmark[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          bookmarkList.push({
            id: doc.id,
            userId: user.value.uid,
            circleId: doc.id, // ドキュメントIDがcircleId
            eventId: data.eventId || targetEventId,
            category: data.category,
            visited: data.visited || false, // 🆕 visited情報を読み込み（デフォルトfalse）
            visitedAt: data.visitedAt?.toDate() || undefined, // 🆕 visitedAt情報を読み込み
            memo: data.memo,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        });

        bookmarks.value = bookmarkList;
      },
      (err) => {
        logger.error("Bookmarks subscription error", err);
        error.value = "ブックマークの監視に失敗しました";
      }
    );
  };

  // サークル情報付きブックマークを取得
  const fetchBookmarksWithCircles = async () => {
    logger.debug('fetchBookmarksWithCircles called');
    logger.debug('Authentication status', { isAuthenticated: isAuthenticated.value, hasUser: !!user.value });
    
    if (!isAuthenticated.value || !user.value) {
      logger.debug('Not authenticated, clearing bookmarksWithCircles');
      bookmarksWithCircles.value = [];
      return;
    }

    logger.debug('Current event', currentEvent.value);
    loading.value = true;
    error.value = null;

    try {
      logger.debug('Fetching bookmarks...');
      await fetchBookmarks();

      logger.debug('Bookmarks fetched', { count: bookmarks.value.length, data: bookmarks.value });

      const circleIds = bookmarks.value.map((b) => b.circleId);
      logger.debug('Circle IDs extracted', { circleIds });
      
      if (circleIds.length === 0) {
        logger.debug('No circle IDs found, clearing bookmarksWithCircles');
        bookmarksWithCircles.value = [];
        return;
      }

      // サークル情報を取得
      logger.debug('Fetching circles by IDs...');
      const { fetchCirclesByIds } = useCircles();
      const circles = await fetchCirclesByIds(circleIds, currentEvent.value?.id);
      logger.debug('Circles fetched', { count: circles.length, data: circles });

      // ブックマークとサークル情報を結合
      logger.debug('Joining bookmarks with circles...');
      const bookmarksWithCircleData: BookmarkWithCircle[] = bookmarks.value
        .map((bookmark) => {
          const circle = circles.find((c) => c.id === bookmark.circleId);
          logger.debug(`Looking for circle ${bookmark.circleId}`, { found: !!circle });
          if (circle) {
            return {
              ...bookmark,
              circle,
            };
          }
          return null;
        })
        .filter((item): item is BookmarkWithCircle => item !== null);

      logger.info('Bookmarks with circles fetched successfully', { count: bookmarksWithCircleData.length });
      bookmarksWithCircles.value = bookmarksWithCircleData;
    } catch (err) {
      logger.error("Fetch bookmarks with circles error", err);
      error.value = "ブックマーク情報の取得に失敗しました";
    } finally {
      loading.value = false;
    }
  };

  // ブックマークを追加
  const addBookmark = async (
    circleId: string,
    category: BookmarkCategory,
    memo?: string,
    eventId?: string
  ) => {
    if (!isAuthenticated.value || !user.value) {
      throw new Error("ログインが必要です");
    }

    try {
      const targetEventId = eventId || currentEvent.value?.id;
      if (!targetEventId) {
        throw new Error("イベントが選択されていません");
      }

      // users/{userId}/bookmarks/{circleId} の構造で保存
      const bookmarkRef = doc($firestore, "users", user.value.uid, "bookmarks", circleId);
      const bookmarkData = {
        eventId: targetEventId,
        category,
        visited: false, // 🆕 デフォルトでfalse
        memo: memo || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(bookmarkRef, bookmarkData);

      // ローカル状態を更新
      const newBookmark: Bookmark = {
        id: circleId,
        userId: user.value.uid,
        circleId,
        eventId: targetEventId,
        category,
        visited: false, // 🆕 デフォルトでfalse
        memo: memo || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // ローカル状態を更新 - bookmarks配列
      const existingIndex = bookmarks.value.findIndex(b => b.circleId === circleId);
      if (existingIndex !== -1) {
        bookmarks.value[existingIndex] = newBookmark;
      } else {
        bookmarks.value.unshift(newBookmark);
      }

      // bookmarksWithCirclesには追加しない（fetchBookmarksWithCirclesで再構築されるため）
      // 代わりに、既に存在する場合はブックマーク情報のみ更新
      const bookmarksWithCirclesIndex = bookmarksWithCircles.value.findIndex(b => b.circleId === circleId);
      if (bookmarksWithCirclesIndex !== -1) {
        bookmarksWithCircles.value[bookmarksWithCirclesIndex] = {
          ...bookmarksWithCircles.value[bookmarksWithCirclesIndex],
          category,
          visited: false,
          memo: memo || "",
          updatedAt: new Date(),
        };
      }

      return newBookmark;
    } catch (err) {
      logger.error("Add bookmark error", err);
      throw new Error("ブックマークの追加に失敗しました");
    }
  };

  // ブックマークを更新
  const updateBookmark = async (
    circleId: string,
    updates: { category?: BookmarkCategory; memo?: string }
  ) => {
    if (!isAuthenticated.value || !user.value) {
      throw new Error("ログインが必要です");
    }

    try {
      const bookmarkRef = doc($firestore, "users", user.value.uid, "bookmarks", circleId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(bookmarkRef, updateData);

      // ローカル状態を更新 - bookmarks配列
      const bookmarkIndex = bookmarks.value.findIndex((b) => b.circleId === circleId);
      if (bookmarkIndex !== -1) {
        bookmarks.value[bookmarkIndex] = {
          ...bookmarks.value[bookmarkIndex],
          ...updates,
          updatedAt: new Date(),
        };
      }

      // ローカル状態を更新 - bookmarksWithCircles配列も同時に更新
      const bookmarksWithCirclesIndex = bookmarksWithCircles.value.findIndex((b) => b.circleId === circleId);
      if (bookmarksWithCirclesIndex !== -1) {
        bookmarksWithCircles.value[bookmarksWithCirclesIndex] = {
          ...bookmarksWithCircles.value[bookmarksWithCirclesIndex],
          ...updates,
          updatedAt: new Date(),
        };
      }
    } catch (err) {
      logger.error("Update bookmark error", err);
      throw new Error("ブックマークの更新に失敗しました");
    }
  };

  // ブックマークを削除
  const removeBookmark = async (circleId: string) => {
    if (!isAuthenticated.value || !user.value) {
      throw new Error("ログインが必要です");
    }

    try {
      const bookmarkRef = doc($firestore, "users", user.value.uid, "bookmarks", circleId);
      await deleteDoc(bookmarkRef);

      // ローカル状態を更新 - 両方の配列から削除
      bookmarks.value = bookmarks.value.filter((b) => b.circleId !== circleId);
      bookmarksWithCircles.value = bookmarksWithCircles.value.filter((b) => b.circleId !== circleId);
    } catch (err) {
      logger.error("Remove bookmark error", err);
      throw new Error("ブックマークの削除に失敗しました");
    }
  };

  // サークルIDでブックマークを削除（エイリアス）
  const removeBookmarkByCircleId = async (circleId: string) => {
    await removeBookmark(circleId);
  };

  // サークルがブックマークされているかチェック
  const isBookmarked = (circleId: string) => {
    return bookmarks.value.some((b) => b.circleId === circleId);
  };

  // サークルのブックマーク情報を取得
  const getBookmarkByCircleId = (circleId: string) => {
    return bookmarks.value.find((b) => b.circleId === circleId);
  };

  // イベント別ブックマークを取得
  const getBookmarksByEventId = (eventId: string): BookmarkWithCircle[] => {
    return bookmarksWithCircles.value.filter((bookmark) => bookmark.eventId === eventId);
  };

  // ブックマークをトグル
  const toggleBookmark = async (
    circleId: string,
    category: BookmarkCategory = "check"
  ) => {
    const existingBookmark = getBookmarkByCircleId(circleId);

    if (existingBookmark) {
      if (existingBookmark.category === category) {
        // 同じカテゴリの場合は削除
        await removeBookmark(circleId);
      } else {
        // 異なるカテゴリの場合は更新
        await updateBookmark(circleId, { category });
      }
    } else {
      // 新規追加
      await addBookmark(circleId, category);
    }
  };

  // CSVエクスポート用データを生成
  const generateExportData = (categories?: BookmarkCategory[]) => {
    let targetBookmarks = bookmarksWithCircles.value;

    if (categories && categories.length > 0) {
      targetBookmarks = targetBookmarks.filter((b) =>
        categories.includes(b.category)
      );
    }

    const { formatPlacement } = useCircles();
    
    return targetBookmarks.map((bookmark) => ({
      "サークル名(フリガナ)": bookmark.circle.circleKana || "",
      サークル名: bookmark.circle.circleName,
      "ペンネーム(フリガナ)": bookmark.circle.penNameKana || "",
      ペンネーム: bookmark.circle.penName,
      配置: formatPlacement(bookmark.circle.placement),
      ジャンル: bookmark.circle.genre.join(", "),
      Twitter: bookmark.circle.contact?.twitter || "",
      Pixiv: bookmark.circle.contact?.pixiv || "",
      カテゴリ: getCategoryLabel(bookmark.category),
    }));
  };

  // カテゴリラベルを取得
  const getCategoryLabel = (category: BookmarkCategory): string => {
    switch (category) {
      case "check":
        return "チェック予定";
      case "interested":
        return "気になる";
      case "priority":
        return "優先";
      default:
        return category;
    }
  };

  // 🆕 巡回済み状態をトグル
  const toggleVisited = async (circleId: string) => {
    if (!isAuthenticated.value || !user.value) {
      throw new Error("ログインが必要です");
    }

    const bookmark = getBookmarkByCircleId(circleId);
    if (!bookmark) {
      throw new Error("ブックマークが見つかりません");
    }

    const newVisited = !bookmark.visited;
    const updateData: any = {
      visited: newVisited,
      updatedAt: serverTimestamp(),
    };

    if (newVisited) {
      updateData.visitedAt = serverTimestamp();
    } else {
      // 訪問解除時はvisitedAtを削除
      updateData.visitedAt = deleteField();
    }

    try {
      const bookmarkRef = doc($firestore, "users", user.value.uid, "bookmarks", circleId);
      await updateDoc(bookmarkRef, updateData);

      // ローカル状態を更新 - bookmarks配列
      const bookmarkIndex = bookmarks.value.findIndex((b) => b.circleId === circleId);
      if (bookmarkIndex !== -1) {
        bookmarks.value[bookmarkIndex] = {
          ...bookmarks.value[bookmarkIndex],
          visited: newVisited,
          visitedAt: newVisited ? new Date() : undefined,
          updatedAt: new Date(),
        };
      }

      // ローカル状態を更新 - bookmarksWithCircles配列も同時に更新
      const bookmarksWithCirclesIndex = bookmarksWithCircles.value.findIndex((b) => b.circleId === circleId);
      if (bookmarksWithCirclesIndex !== -1) {
        bookmarksWithCircles.value[bookmarksWithCirclesIndex] = {
          ...bookmarksWithCircles.value[bookmarksWithCirclesIndex],
          visited: newVisited,
          visitedAt: newVisited ? new Date() : undefined,
          updatedAt: new Date(),
        };
      }
    } catch (err) {
      logger.error("Toggle visited error", err);
      throw new Error("巡回状態の更新に失敗しました");
    }
  };

  // 🆕 巡回済みに設定
  const markAsVisited = async (circleId: string) => {
    const bookmark = getBookmarkByCircleId(circleId);
    if (bookmark && !bookmark.visited) {
      await toggleVisited(circleId);
    }
  };

  // 🆕 巡回済み解除
  const markAsNotVisited = async (circleId: string) => {
    const bookmark = getBookmarkByCircleId(circleId);
    if (bookmark && bookmark.visited) {
      await toggleVisited(circleId);
    }
  };

  // 🆕 巡回済みブックマーク一覧取得
  const getVisitedBookmarks = () => {
    return bookmarks.value.filter(bookmark => bookmark.visited);
  };

  // 🆕 巡回統計情報を計算
  const bookmarksByStatus = computed(() => {
    const stats = {
      total: bookmarks.value.length,
      visited: bookmarks.value.filter(b => b.visited).length,
      notVisited: bookmarks.value.filter(b => !b.visited).length,
      byCategory: {
        check: {
          total: bookmarks.value.filter(b => b.category === 'check').length,
          visited: bookmarks.value.filter(b => b.category === 'check' && b.visited).length
        },
        interested: {
          total: bookmarks.value.filter(b => b.category === 'interested').length,
          visited: bookmarks.value.filter(b => b.category === 'interested' && b.visited).length
        },
        priority: {
          total: bookmarks.value.filter(b => b.category === 'priority').length,
          visited: bookmarks.value.filter(b => b.category === 'priority' && b.visited).length
        }
      }
    };
    return stats;
  });

  // クリーンアップ
  const cleanup = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };

  // 認証状態の変化を監視
  watch(
    isAuthenticated,
    (newValue) => {
      if (newValue) {
        subscribeToBookmarks();
      } else {
        cleanup();
        bookmarks.value = [];
        bookmarksWithCircles.value = [];
      }
    },
    { immediate: true }
  );

  // currentEventの変更を監視
  watch(
    () => currentEvent.value?.id,
    (newEventId, oldEventId) => {
      logger.debug('currentEvent changed', { oldEventId, newEventId });
      if (newEventId !== oldEventId && isAuthenticated.value) {
        logger.debug('Re-subscribing to bookmarks for new event', { newEventId });
        cleanup();
        if (newEventId) {
          subscribeToBookmarks(newEventId);
        } else {
          bookmarks.value = [];
          bookmarksWithCircles.value = [];
        }
      }
    },
    { immediate: true }
  );

  // コンポーネントのアンマウント時にクリーンアップ
  onUnmounted(() => {
    cleanup();
  });

  return {
    bookmarks: readonly(bookmarks),
    bookmarksWithCircles: readonly(bookmarksWithCircles),
    loading: readonly(loading),
    error: readonly(error),
    bookmarkCount,
    bookmarksByCategory,
    bookmarksByStatus, // 🆕 巡回統計情報
    fetchBookmarks,
    fetchBookmarksWithCircles,
    addBookmark,
    updateBookmark,
    removeBookmark,
    removeBookmarkByCircleId,
    isBookmarked,
    getBookmarkByCircleId,
    getBookmarksByEventId,
    toggleBookmark,
    toggleVisited, // 🆕 巡回状態トグル
    markAsVisited, // 🆕 巡回済みに設定
    markAsNotVisited, // 🆕 巡回済み解除
    getVisitedBookmarks, // 🆕 巡回済み一覧取得
    generateExportData,
    getCategoryLabel,
  };
};
