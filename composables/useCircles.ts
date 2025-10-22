import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import type { Circle, SearchParams, SearchResult, PlacementInfo } from "~/types";
import { normalizePlacement, formatPlacementDisplay } from "~/utils/placementUtils";
import { createLogger } from "~/utils/logger";

export const useCircles = () => {
  const logger = createLogger('useCircles');
  const { $firestore } = useNuxtApp() as any;
  const { currentEvent } = useEvents();

  // State
  const circles = useState<Circle[]>("circles.list", () => []);
  const loading = useState<boolean>("circles.loading", () => false);
  const error = useState<string | null>("circles.error", () => null);
  
  // 強化されたキャッシュシステム
  const circlesCache = useState<Record<string, {
    data: Circle[],
    timestamp: number,
    lastSync: number,
    unsubscribe?: Unsubscribe
  }>>("circles.cache", () => ({}));
  
  const CACHE_DURATION = 10 * 60 * 1000; // 10分間キャッシュ
  const SYNC_INTERVAL = 30 * 1000; // 30秒間隔でリアルタイム同期

  // メモリ内検索用インデックス
  const searchIndex = useState<Record<string, {
    genres: Set<string>,
    areas: Set<string>,
    searchableText: Map<string, string>
  }>>("circles.searchIndex", () => ({}));

  // キャッシュの有効性チェック
  const isCacheValid = (eventId: string): boolean => {
    const cached = circlesCache.value[eventId];
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < CACHE_DURATION;
  };

  // リアルタイム同期の設定
  const setupRealtimeSync = (eventId: string) => {
    const cached = circlesCache.value[eventId];
    if (cached?.unsubscribe) {
      return; // 既に設定済み
    }

    const circlesRef = collection($firestore, "events", eventId, "circles");
    const q = query(circlesRef, where("isPublic", "==", true));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      logger.debug('Realtime update received', { eventId, size: snapshot.size });
      
      const updatedCircles: Circle[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        updatedCircles.push(mapDocumentToCircle(doc.id, data, eventId));
      });

      // キャッシュとインデックスを更新
      setCachedCircles(eventId, updatedCircles);
      buildSearchIndex(eventId, updatedCircles);
      
      // 現在表示中のイベントの場合、stateも更新
      if (currentEvent.value?.id === eventId) {
        circles.value = updatedCircles;
      }
    }, (error) => {
      logger.error('Realtime sync error', error);
    });

    // unsubscribe関数を保存
    if (!circlesCache.value[eventId]) {
      circlesCache.value[eventId] = {
        data: [],
        timestamp: 0,
        lastSync: 0
      };
    }
    circlesCache.value[eventId].unsubscribe = unsubscribe;
  };

  // ドキュメントをCircleオブジェクトにマッピング
  const mapDocumentToCircle = (id: string, data: any, eventId: string): Circle => {
    return {
      id,
      circleName: data.circleName,
      circleKana: data.circleKana,
      penName: data.penName,
      penNameKana: data.penNameKana,
      circleCutImageUrl: data.circleCutImageUrl,
      menuImageUrl: data.menuImageUrl,
      genre: data.genre || [],
      items: data.items || [],
      placement: data.placement,
      description: data.description,
      contact: data.contact || {},
      isAdult: data.isAdult || false,
      ownerId: data.ownerId,
      isPublic: data.isPublic,
      eventId,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  };

  // 検索インデックスの構築
  const buildSearchIndex = (eventId: string, circleList: Circle[]) => {
    const genres = new Set<string>();
    const areas = new Set<string>();
    const searchableText = new Map<string, string>();

    circleList.forEach((circle) => {
      // ジャンルインデックス
      if (circle.genre) {
        circle.genre.forEach(g => genres.add(g));
      }

      // エリアインデックス
      if (circle.placement?.block) {
        areas.add(circle.placement.block);
      }

      // 検索用テキストインデックス
      const searchText = [
        circle.circleName,
        circle.circleKana,
        circle.penName,
        circle.penNameKana,
        ...(circle.genre || []),
        circle.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      
      searchableText.set(circle.id, searchText);
    });

    searchIndex.value[eventId] = {
      genres,
      areas,
      searchableText
    };
  };

  // キャッシュへのデータ保存
  const setCachedCircles = (eventId: string, data: Circle[]) => {
    circlesCache.value[eventId] = {
      ...circlesCache.value[eventId],
      data,
      timestamp: Date.now(),
      lastSync: Date.now()
    };
  };

  // メイン取得関数（最適化版）
  const fetchCircles = async (
    params: SearchParams = {},
    eventId?: string,
    forceRefresh: boolean = false
  ): Promise<SearchResult> => {
    logger.debug('useCircles.fetchCircles called (optimized version)');
    
    const targetEventId = eventId || currentEvent.value?.id;
    if (!targetEventId) {
      throw new Error("イベントIDが指定されていません");
    }

    // キャッシュから取得可能かチェック
    if (!forceRefresh && isCacheValid(targetEventId)) {
      logger.debug('Using cached data for event', { eventId: targetEventId });
      const cachedData = circlesCache.value[targetEventId].data;
      const filteredList = applyClientSideFilters(cachedData, params);
      
      circles.value = filteredList;
      return {
        circles: filteredList,
        total: filteredList.length,
        page: params.page || 1,
        limit: params.limit || 12,
        hasMore: false,
      };
    }

    // 初回読み込みまたは強制更新
    loading.value = true;
    error.value = null;

    try {
      const circlesRef = collection($firestore, "events", targetEventId, "circles");
      const q = query(circlesRef, where("isPublic", "==", true));
      
      logger.debug('Fetching from Firestore', { path: `events/${targetEventId}/circles` });
      const snapshot = await getDocs(q);
      
      let circleList: Circle[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        circleList.push(mapDocumentToCircle(doc.id, data, targetEventId));
      });

      // キャッシュと検索インデックスを更新
      setCachedCircles(targetEventId, circleList);
      buildSearchIndex(targetEventId, circleList);

      // リアルタイム同期を設定
      setupRealtimeSync(targetEventId);

      // フィルタリング
      const filteredList = applyClientSideFilters(circleList, params);
      circles.value = filteredList;

      logger.info('Fetched and cached circles', { count: circleList.length });

      return {
        circles: filteredList,
        total: filteredList.length,
        page: params.page || 1,
        limit: params.limit || 12,
        hasMore: false,
      };
    } catch (err) {
      logger.error('Fetch circles error', err);
      error.value = "サークル情報の取得に失敗しました";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 個別サークル取得（キャッシュ優先）
  const fetchCircleById = async (circleId: string, eventId?: string): Promise<Circle | null> => {
    const targetEventId = eventId || currentEvent.value?.id;
    if (!targetEventId) {
      throw new Error("イベントIDが指定されていません");
    }

    // まずキャッシュから探す
    const cached = circlesCache.value[targetEventId];
    if (cached && isCacheValid(targetEventId)) {
      const cachedCircle = cached.data.find(c => c.id === circleId);
      if (cachedCircle) {
        logger.debug('Using cached circle data', { circleId });
        return cachedCircle;
      }
    }

    // キャッシュにない場合のみFirestoreから取得
    logger.debug('Fetching circle from Firestore', { circleId });
    try {
      const circleRef = doc($firestore, "events", targetEventId, "circles", circleId);
      const circleDoc = await getDoc(circleRef);

      if (circleDoc.exists()) {
        const data = circleDoc.data();
        return mapDocumentToCircle(circleDoc.id, data, targetEventId);
      }

      return null;
    } catch (err) {
      logger.error('Fetch circle by ID error', err);
      throw new Error("サークル詳細の取得に失敗しました");
    }
  };

  // 複数のサークルIDでサークル情報を取得（キャッシュ優先）
  const fetchCirclesByIds = async (circleIds: string[], eventId?: string): Promise<Circle[]> => {
    if (circleIds.length === 0) return [];

    const targetEventId = eventId || currentEvent.value?.id;
    if (!targetEventId) {
      throw new Error("イベントIDが指定されていません");
    }

    // まずキャッシュから探す
    const cached = circlesCache.value[targetEventId];
    if (cached && isCacheValid(targetEventId)) {
      const cachedCircles = cached.data.filter(c => circleIds.includes(c.id));
      if (cachedCircles.length === circleIds.length) {
        logger.debug('Using cached circles data for all', { count: circleIds.length });
        return cachedCircles;
      }
    }

    // 部分的にキャッシュされている場合の処理
    const results: Circle[] = [];
    const missingIds: string[] = [];

    if (cached && isCacheValid(targetEventId)) {
      for (const circleId of circleIds) {
        const cachedCircle = cached.data.find(c => c.id === circleId);
        if (cachedCircle) {
          results.push(cachedCircle);
        } else {
          missingIds.push(circleId);
        }
      }
    } else {
      missingIds.push(...circleIds);
    }

    // キャッシュにないものだけFirestoreから取得
    if (missingIds.length > 0) {
      logger.debug('Fetching missing circles from Firestore', { count: missingIds.length });
      
      for (const circleId of missingIds) {
        try {
          const circleRef = doc($firestore, "events", targetEventId, "circles", circleId);
          const circleDoc = await getDoc(circleRef);
          
          if (circleDoc.exists()) {
            const data = circleDoc.data();
            results.push(mapDocumentToCircle(circleDoc.id, data, targetEventId));
          }
        } catch (err) {
          logger.error('Fetch circle by ID error', { circleId, error: err });
        }
      }
    }

    return results;
  };

  // 高速検索（インデックス使用）
  const searchCircles = async (
    searchQuery: string,
    filters: SearchParams = {},
    eventId?: string
  ): Promise<SearchResult> => {
    const targetEventId = eventId || currentEvent.value?.id;
    if (!targetEventId) {
      throw new Error("イベントIDが指定されていません");
    }

    // データがキャッシュされていない場合は先に取得
    if (!isCacheValid(targetEventId)) {
      await fetchCircles({}, targetEventId);
    }

    const cached = circlesCache.value[targetEventId];
    const index = searchIndex.value[targetEventId];
    
    if (!cached || !index) {
      throw new Error("検索インデックスが構築されていません");
    }

    // 高速検索実行
    const searchTerms = searchQuery.toLowerCase().split(/\s+/);
    const filteredCircles = cached.data.filter((circle) => {
      const searchText = index.searchableText.get(circle.id) || '';
      return searchTerms.every((term) => searchText.includes(term));
    });

    // フィルター適用
    const finalResults = applyClientSideFilters(filteredCircles, filters);

    const pageLimit = filters.limit || 20;
    const page = filters.page || 1;
    const startIndex = (page - 1) * pageLimit;
    const endIndex = startIndex + pageLimit;
    const paginatedCircles = finalResults.slice(startIndex, endIndex);

    // 検索結果をstateに反映
    circles.value = finalResults;

    return {
      circles: paginatedCircles,
      total: finalResults.length,
      page,
      limit: pageLimit,
      hasMore: endIndex < finalResults.length,
    };
  };

  // 高速ジャンル取得（インデックス使用）
  const getAvailableGenres = async (eventId?: string): Promise<string[]> => {
    const targetEventId = eventId || currentEvent.value?.id;
    if (!targetEventId) return [];

    // インデックスから取得
    const index = searchIndex.value[targetEventId];
    if (index) {
      return Array.from(index.genres).sort();
    }

    // インデックスがない場合は構築
    if (!isCacheValid(targetEventId)) {
      await fetchCircles({}, targetEventId);
    }
    
    const newIndex = searchIndex.value[targetEventId];
    return newIndex ? Array.from(newIndex.genres).sort() : [];
  };

  // 人気ジャンル取得（キャッシュ使用）
  const getPopularGenres = async (eventId?: string, limit: number = 10): Promise<string[]> => {
    const targetEventId = eventId || currentEvent.value?.id;
    if (!targetEventId) return [];

    // キャッシュされたデータを使用
    if (!isCacheValid(targetEventId)) {
      await fetchCircles({}, targetEventId);
    }

    const cached = circlesCache.value[targetEventId];
    if (!cached) return [];

    const genreCount = new Map<string, number>();
    cached.data.forEach((circle) => {
      if (circle.genre) {
        circle.genre.forEach((genre: string) => {
          genreCount.set(genre, (genreCount.get(genre) || 0) + 1);
        });
      }
    });

    return Array.from(genreCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([genre]) => genre);
  };

  // クリーンアップ関数
  const cleanup = () => {
    Object.values(circlesCache.value).forEach(cache => {
      if (cache.unsubscribe) {
        cache.unsubscribe();
      }
    });
  };

  // その他の関数は元の実装を維持
  const formatPlacement = (placement: PlacementInfo): string => {
    if (!placement) return "";
    
    try {
      const normalized = normalizePlacement(placement);
      return formatPlacementDisplay(normalized);
    } catch (error) {
      logger.warn('配置番号のフォーマットに失敗', error);
      // フォールバック処理
      const number2 = placement.number2 ? placement.number2 : "";
      if (number2 === "") {
        return `${placement.block}-${placement.number1}`;
      }
      return `${placement.block}-${placement.number1}-${placement.number2}`;
    }
  };

  const applyClientSideFilters = (circleList: Circle[], filters: SearchParams): Circle[] => {
    return [...circleList];
  };

  const updateCircle = async (circleId: string, eventId: string, updates: Partial<Circle>) => {
    if (!$firestore) {
      throw new Error("Firestore is not initialized");
    }

    try {
      const circleRef = doc($firestore, "events", eventId, "circles", circleId);
      
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await updateDoc(circleRef, updateData);
      logger.info('Circle updated', { circleId });
      
      // リアルタイム同期により自動的にキャッシュが更新される
    } catch (err) {
      logger.error('Update circle error', err);
      throw new Error("サークル情報の更新に失敗しました");
    }
  };

  // 統合検索・フィルター関数
  const performSearch = async (searchQuery?: string, filters: SearchParams = {}, eventId?: string): Promise<SearchResult> => {
    if (searchQuery && searchQuery.trim()) {
      return await searchCircles(searchQuery.trim(), filters, eventId);
    } else {
      return await fetchCircles(filters, eventId);
    }
  };

  // アンマウント時のクリーンアップ
  onUnmounted(() => {
    cleanup();
  });

  return {
    circles: readonly(circles),
    loading: readonly(loading),
    error: readonly(error),
    fetchCircles,
    fetchCircleById,
    fetchCirclesByIds,
    searchCircles,
    performSearch,
    updateCircle,
    formatPlacement,
    getAvailableGenres,
    getPopularGenres,
    cleanup,
  };
};
/**
 * 検索状態を永続化するためのヘルパータイプ
 */
interface SearchState {
  query: string;
  currentPage: number;
  itemsPerPage: number;
}

/**
 * 検索状態管理用のcomposable
 * サークル一覧画面の検索状態をページ遷移をまたいで保持する
 */
export const useCircleSearch = () => {
  // 検索状態の永続化
  const searchState = useState<SearchState>("circles.searchState", () => ({
    query: '',
    currentPage: 1,
    itemsPerPage: 12
  }));

  /**
   * 検索状態を更新
   */
  const updateSearchState = (updates: Partial<SearchState>) => {
    searchState.value = { ...searchState.value, ...updates };
  };

  /**
   * 検索状態をリセット
   */
  const resetSearchState = () => {
    searchState.value = {
      query: '',
      currentPage: 1,
      itemsPerPage: 12
    };
  };

  return {
    searchState: readonly(searchState),
    updateSearchState,
    resetSearchState,
  };
};
