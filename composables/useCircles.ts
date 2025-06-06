import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type DocumentSnapshot,
} from "firebase/firestore";
import type { Circle, SearchParams, SearchResult, PlacementInfo } from "~/types";

export const useCircles = () => {
  const { $firestore } = useNuxtApp() as any;
  const { currentEvent } = useEvents();

  // State
  const circles = useState<Circle[]>("circles.list", () => []);
  const loading = useState<boolean>("circles.loading", () => false);
  const error = useState<string | null>("circles.error", () => null);
  
  // キャッシュ用ステート
  const circlesCache = useState<Record<string, { data: Circle[], timestamp: number }>>("circles.cache", () => ({}));
  const CACHE_DURATION = 5 * 60 * 1000; // 5分間キャッシュ

  // キャッシュチェック関数
  const isCacheValid = (eventId: string): boolean => {
    const cached = circlesCache.value[eventId];
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < CACHE_DURATION;
  };

  // キャッシュからデータ取得
  const getCachedCircles = (eventId: string): Circle[] | null => {
    if (isCacheValid(eventId)) {
      console.log('📋 Using cached data for event:', eventId);
      return circlesCache.value[eventId].data;
    }
    return null;
  };

  // キャッシュにデータ保存
  const setCachedCircles = (eventId: string, data: Circle[]) => {
    circlesCache.value[eventId] = {
      data,
      timestamp: Date.now()
    };
  };

  // サークル一覧を取得
  const fetchCircles = async (
    params: SearchParams = {},
    eventId?: string
  ): Promise<SearchResult> => {
    console.log('🔄 useCircles.fetchCircles called with:', { params, eventId });
    console.log('🔄 currentEvent.value:', currentEvent.value);
    
    loading.value = true;
    error.value = null;

    try {
      // イベントIDを取得
      const targetEventId = eventId || currentEvent.value?.id;
      if (!targetEventId) {
        throw new Error("イベントIDが指定されていません");
      }

      console.log('📍 Target event ID:', targetEventId);
      
      // キャッシュチェック
      const cachedData = getCachedCircles(targetEventId);
      if (cachedData) {
        const filteredList = applyClientSideFilters(cachedData, params);
        
        const result: SearchResult = {
          circles: filteredList,
          total: filteredList.length,
          page: params.page || 1,
          limit: params.limit || 12,
          hasMore: false,
        };
        
        circles.value = filteredList;
        loading.value = false;
        return result;
      }

      // サブコレクション構造: events/{eventId}/circles
      const circlesRef = collection($firestore, "events", targetEventId, "circles");
      let q = query(circlesRef, where("isPublic", "==", true));
      
      console.log('🔍 Query path:', `events/${targetEventId}/circles`);


      // 全データを取得してクライアントサイドでフィルタリング
      // Firestoreの制限を回避

      // 全データを取得（ページネーションはクライアントサイドで処理）
      const snapshot = await getDocs(q);
      console.log('📄 Snapshot size:', snapshot.size);
      console.log('📄 Snapshot empty:', snapshot.empty);
      
      let circleList: Circle[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 Document:', doc.id, data);
        circleList.push({
          id: doc.id,
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
          eventId: targetEventId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      // クライアントサイドでフィルタリング
      circleList = applyClientSideFilters(circleList, params);

      const result: SearchResult = {
        circles: circleList,
        total: circleList.length,
        page: params.page || 1,
        limit: params.limit || 12,
        hasMore: false,
      };

      console.log('📊 Final result:', result);
      console.log('📊 Circle list length:', circleList.length);

      // キャッシュに保存（フィルター適用前の全データ）
      const unfilteredList: Circle[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        unfilteredList.push({
          id: doc.id,
          circleName: data.circleName,
          circleKana: data.circleKana,
          penName: data.penName,
          penNameKana: data.penNameKana,
          circleImageUrl: data.circleImageUrl,
          genre: data.genre || [],
          placement: data.placement,
          description: data.description,
          contact: data.contact || {},
          isAdult: data.isAdult || false,
          ownerId: data.ownerId,
          isPublic: data.isPublic,
          eventId: targetEventId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      setCachedCircles(targetEventId, unfilteredList);

      // 全データをstateに設定
      circles.value = circleList;
      console.log('✅ State updated, circles.value.length:', circles.value.length);

      return result;
    } catch (err) {
      console.error("Fetch circles error:", err);
      error.value = "サークル情報の取得に失敗しました";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // サークル詳細を取得
  const fetchCircleById = async (circleId: string, eventId?: string): Promise<Circle | null> => {
    try {
      // イベントIDを取得
      const targetEventId = eventId || currentEvent.value?.id;
      if (!targetEventId) {
        throw new Error("イベントIDが指定されていません");
      }

      // サブコレクション構造: events/{eventId}/circles/{circleId}
      const circleRef = doc($firestore, "events", targetEventId, "circles", circleId);
      const circleDoc = await getDoc(circleRef);

      if (circleDoc.exists()) {
        const data = circleDoc.data();
        return {
          id: circleDoc.id,
          circleName: data.circleName,
          circleKana: data.circleKana,
          penName: data.penName,
          penNameKana: data.penNameKana,
          circleImageUrl: data.circleImageUrl,
          genre: data.genre || [],
          placement: data.placement,
          description: data.description,
          contact: data.contact || {},
          isAdult: data.isAdult || false,
          ownerId: data.ownerId,
          isPublic: data.isPublic,
          eventId: targetEventId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }

      return null;
    } catch (err) {
      console.error("Fetch circle by ID error:", err);
      throw new Error("サークル詳細の取得に失敗しました");
    }
  };

  // 複数のサークルIDでサークル情報を取得
  const fetchCirclesByIds = async (circleIds: string[], eventId?: string): Promise<Circle[]> => {
    if (circleIds.length === 0) return [];

    try {
      // イベントIDを取得
      const targetEventId = eventId || currentEvent.value?.id;
      if (!targetEventId) {
        throw new Error("イベントIDが指定されていません");
      }

      const allCircles: Circle[] = [];

      // サブコレクション構造ではdocumentReferenceを直接使用
      for (const circleId of circleIds) {
        const circleRef = doc($firestore, "events", targetEventId, "circles", circleId);
        const circleDoc = await getDoc(circleRef);
        
        if (circleDoc.exists()) {
          const data = circleDoc.data();
          allCircles.push({
            id: circleDoc.id,
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
            eventId: targetEventId,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        }
      }

      return allCircles;
    } catch (err) {
      console.error("Fetch circles by IDs error:", err);
      throw new Error("サークル情報の取得に失敗しました");
    }
  };

  // テキスト検索
  const searchCircles = async (
    searchQuery: string,
    filters: SearchParams = {},
    eventId?: string
  ): Promise<SearchResult> => {
    if (!searchQuery.trim()) {
      return await fetchCircles(filters, eventId);
    }

    loading.value = true;
    error.value = null;

    try {
      // イベントIDを取得
      const targetEventId = eventId || currentEvent.value?.id;
      if (!targetEventId) {
        throw new Error("イベントIDが指定されていません");
      }

      // 簡易的な検索実装（実際の実装では全文検索サービスを使用することを推奨）
      const circlesRef = collection($firestore, "events", targetEventId, "circles");
      let q = query(circlesRef, where("isPublic", "==", true));


      // 全データを取得してクライアントサイドでフィルタリング
      // Firestoreの制限を回避

      const snapshot = await getDocs(q);
      let allCircles: Circle[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        allCircles.push({
          id: doc.id,
          circleName: data.circleName,
          circleKana: data.circleKana,
          penName: data.penName,
          penNameKana: data.penNameKana,
          circleImageUrl: data.circleImageUrl,
          genre: data.genre || [],
          placement: data.placement,
          description: data.description,
          contact: data.contact || {},
          isAdult: data.isAdult || false,
          ownerId: data.ownerId,
          isPublic: data.isPublic,
          eventId: targetEventId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      // クライアントサイドでフィルタリング適用
      allCircles = applyClientSideFilters(allCircles, filters);

      // クライアントサイドでテキスト検索（サークル名、ペンネーム、ジャンル、説明文）
      const searchTerms = searchQuery.toLowerCase().split(/\s+/);
      const filteredCircles = allCircles.filter((circle) => {
        const searchText = [
          circle.circleName,
          circle.circleKana,
          circle.penName,
          circle.penNameKana,
          ...(circle.genre || []), // ジャンル配列を展開
          circle.description, // サークル説明文
        ]
          .filter(Boolean) // undefined/nullを除外
          .join(" ")
          .toLowerCase();

        return searchTerms.every((term) => searchText.includes(term));
      });

      const pageLimit = filters.limit || 20;
      const page = filters.page || 1;
      const startIndex = (page - 1) * pageLimit;
      const endIndex = startIndex + pageLimit;

      const paginatedCircles = filteredCircles.slice(startIndex, endIndex);

      const result: SearchResult = {
        circles: paginatedCircles,
        total: filteredCircles.length,
        page,
        limit: pageLimit,
        hasMore: endIndex < filteredCircles.length,
      };

      if (page === 1) {
        circles.value = paginatedCircles;
      }

      return result;
    } catch (err) {
      console.error("Search circles error:", err);
      error.value = "サークル検索に失敗しました";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 配置情報をフォーマット
  // 例: { block: "A", number1: "01", number2: "02" } -> "A-01-02"
  //     { block: "A", number1: "01", number2: null } -> "A-01"
  const formatPlacement = (placement: PlacementInfo): string => {
    if (!placement) return "";
    const number2 = placement.number2 ? placement.number2 : "";

    if (number2 === "") {
      return `${placement.block}-${placement.number1}`;
    }

    return `${placement.block}-${placement.number1}-${placement.number2}`;
  };

  // ジャンル一覧を取得
  const getAvailableGenres = async (eventId?: string): Promise<string[]> => {
    try {
      // イベントIDを取得
      const targetEventId = eventId || currentEvent.value?.id;
      if (!targetEventId) {
        return [];
      }
      
      const circlesRef = collection($firestore, "events", targetEventId, "circles");
      let q = query(circlesRef, where("isPublic", "==", true));
      
      const snapshot = await getDocs(q);

      const genreSet = new Set<string>();
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.genre && Array.isArray(data.genre)) {
          data.genre.forEach((g: string) => genreSet.add(g));
        }
      });

      return Array.from(genreSet).sort();
    } catch (err) {
      console.error("Get available genres error:", err);
      return [];
    }
  };

  // 人気ジャンルを使用頻度順で取得
  const getPopularGenres = async (eventId?: string, limit: number = 10): Promise<string[]> => {
    try {
      // イベントIDを取得
      const targetEventId = eventId || currentEvent.value?.id;
      if (!targetEventId) {
        return [];
      }
      
      const circlesRef = collection($firestore, "events", targetEventId, "circles");
      let q = query(circlesRef, where("isPublic", "==", true));
      
      const snapshot = await getDocs(q);

      // ジャンル使用頻度をカウント
      const genreCount = new Map<string, number>();
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.genre && Array.isArray(data.genre)) {
          data.genre.forEach((genre: string) => {
            genreCount.set(genre, (genreCount.get(genre) || 0) + 1);
          });
        }
      });

      // 使用頻度順でソートして上位を返す
      return Array.from(genreCount.entries())
        .sort((a, b) => b[1] - a[1]) // 使用頻度の降順
        .slice(0, limit) // 上位N件
        .map(([genre]) => genre); // ジャンル名のみ取得
    } catch (err) {
      console.error("Get popular genres error:", err);
      return [];
    }
  };

  // エリア一覧を取得
  const getAvailableAreas = async (eventId?: string): Promise<string[]> => {
    try {
      // イベントIDを取得
      const targetEventId = eventId || currentEvent.value?.id;
      if (!targetEventId) {
        return [];
      }
      
      const circlesRef = collection($firestore, "events", targetEventId, "circles");
      let q = query(circlesRef, where("isPublic", "==", true));
      
      const snapshot = await getDocs(q);

      const areaSet = new Set<string>();
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.placement && data.placement.area) {
          areaSet.add(data.placement.area);
        }
      });

      return Array.from(areaSet).sort();
    } catch (err) {
      console.error("Get available areas error:", err);
      return [];
    }
  };

  // クライアントサイドフィルタリング共通関数（現在は不要だが将来の拡張のため残す）
  const applyClientSideFilters = (circleList: Circle[], filters: SearchParams): Circle[] => {
    // 現在はフィルターなしで全データを返す
    return [...circleList];
  };

  // 統合検索・フィルター関数
  const performSearch = async (searchQuery?: string, filters: SearchParams = {}, eventId?: string): Promise<SearchResult> => {
    if (searchQuery && searchQuery.trim()) {
      return await searchCircles(searchQuery.trim(), filters, eventId);
    } else {
      return await fetchCircles(filters, eventId);
    }
  };

  // サークル情報を更新
  const updateCircle = async (circleId: string, eventId: string, updates: Partial<Circle>) => {
    if (!$firestore) {
      throw new Error("Firestore is not initialized");
    }

    try {
      const circleRef = doc($firestore, "events", eventId, "circles", circleId);
      
      // updatedAtを追加
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await updateDoc(circleRef, updateData);
      console.log('✅ Circle updated:', circleId);
    } catch (err) {
      console.error("Update circle error:", err);
      throw new Error("サークル情報の更新に失敗しました");
    }
  };

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
    getAvailableAreas,
  };
};
