import {
  collection,
  doc,
  getDocs,
  getDoc,
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

      // サブコレクション構造: events/{eventId}/circles
      const circlesRef = collection($firestore, "events", targetEventId, "circles");
      let q = query(circlesRef, where("isPublic", "==", true));
      
      console.log('🔍 Query path:', `events/${targetEventId}/circles`);

      // フィルター条件を追加
      if (params.genres && params.genres.length > 0) {
        q = query(q, where("genre", "array-contains-any", params.genres));
      }

      if (params.days && params.days.length > 0) {
        q = query(q, where("placement.day", "in", params.days));
      }

      if (params.areas && params.areas.length > 0) {
        q = query(q, where("placement.area", "in", params.areas));
      }

      if (params.isAdult !== undefined) {
        q = query(q, where("isAdult", "==", params.isAdult));
      }

      // ソート条件を追加
      const sortBy = params.sortBy || "placement";
      const sortOrder = params.sortOrder || "asc";

      switch (sortBy) {
        case "circleName":
          q = query(q, orderBy("circleName", sortOrder));
          break;
        case "updatedAt":
          q = query(q, orderBy("updatedAt", sortOrder));
          break;
        case "placement":
        default:
          q = query(
            q,
            orderBy("placement.area", sortOrder),
            orderBy("placement.block", sortOrder),
            orderBy("placement.number", sortOrder)
          );
          break;
      }

      // ページネーション
      const pageLimit = params.limit || 20;
      q = query(q, limit(pageLimit));

      const snapshot = await getDocs(q);
      console.log('📄 Snapshot size:', snapshot.size);
      console.log('📄 Snapshot empty:', snapshot.empty);
      
      const circleList: Circle[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 Document:', doc.id, data);
        circleList.push({
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

      const result: SearchResult = {
        circles: circleList,
        total: circleList.length, // 実際の実装では別途カウントクエリが必要
        page: params.page || 1,
        limit: pageLimit,
        hasMore: circleList.length === pageLimit,
      };

      console.log('📊 Final result:', result);
      console.log('📊 Circle list length:', circleList.length);

      // 最初のページの場合はstateを更新
      if (!params.page || params.page === 1) {
        circles.value = circleList;
        console.log('✅ State updated, circles.value.length:', circles.value.length);
      }

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

      // 基本的なフィルターを適用
      if (filters.genres && filters.genres.length > 0) {
        q = query(q, where("genre", "array-contains-any", filters.genres));
      }

      if (filters.isAdult !== undefined) {
        q = query(q, where("isAdult", "==", filters.isAdult));
      }

      const snapshot = await getDocs(q);
      const allCircles: Circle[] = [];

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

      // クライアントサイドでテキスト検索
      const searchTerms = searchQuery.toLowerCase().split(/\s+/);
      const filteredCircles = allCircles.filter((circle) => {
        const searchText = [
          circle.circleName,
          circle.circleKana,
          circle.description,
          ...circle.tags,
          ...circle.genre,
        ]
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
  const formatPlacement = (placement: PlacementInfo): string => {
    if (!placement) return "";
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

  return {
    circles: readonly(circles),
    loading: readonly(loading),
    error: readonly(error),
    fetchCircles,
    fetchCircleById,
    fetchCirclesByIds,
    searchCircles,
    formatPlacement,
    getAvailableGenres,
    getAvailableAreas,
  };
};
