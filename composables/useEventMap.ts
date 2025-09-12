import { ref, computed, readonly } from "vue";
import type { EventMapConfig } from "~/types";
import { getMapConfig as getConfigFromData } from "~/data/mapConfigs";
import {
  normalizePlacement,
  parsePlacementString,
} from "~/utils/placementUtils";
import { useLogger } from "~/composables/useLogger";

export const useEventMap = () => {
  const logger = useLogger("useEventMap");
  const mapCache = new Map<string, string>();
  const currentMapContent = ref<string>("");
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const loadEventMap = async (eventId: string): Promise<string> => {
    logger.debug("loadEventMap called", { eventId });

    // キャッシュから取得を試行
    if (mapCache.has(eventId)) {
      const cachedContent = mapCache.get(eventId)!;
      logger.debug("Using cached map content", {
        length: cachedContent.length,
      });
      currentMapContent.value = cachedContent;
      return cachedContent;
    }

    try {
      isLoading.value = true;
      error.value = null;
      logger.debug("Loading map from server");

      const mapFileName = getMapFileName(eventId);
      logger.debug("Map filename", { mapFileName });

      const response = await fetch(`/${mapFileName}`);
      logger.debug("Fetch response", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch map: ${response.status} ${response.statusText}`
        );
      }

      const svgContent = await response.text();
      logger.debug("SVG content loaded", {
        length: svgContent.length,
        starts: svgContent.substring(0, 100),
        containsSvg: svgContent.includes("<svg"),
      });

      // キャッシュに保存
      mapCache.set(eventId, svgContent);
      currentMapContent.value = svgContent;
      logger.info("Map loaded and cached successfully");

      return svgContent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      error.value = `マップの読み込みに失敗しました: ${errorMessage}`;
      logger.error("Map loading error", err);
      throw err;
    } finally {
      isLoading.value = false;
      logger.debug("loadEventMap finished");
    }
  };

  const getMapFileName = (eventId: string): string => {
    // イベントIDからマップファイル名を生成
    switch (eventId) {
      case "geica-31":
        return "map-geica31.svg";
      case "geica-32":
        return "map-geica32.svg";
      case "geica-33":
        return "map-geica33.svg";
      default:
        // デフォルトは最新のイベント
        return "map-geica32.svg";
    }
  };

  const clearCache = () => {
    mapCache.clear();
    currentMapContent.value = "";
  };

  const preloadMaps = async (eventIds: string[]) => {
    const loadPromises = eventIds.map(async (eventId) => {
      try {
        await loadEventMap(eventId);
        logger.debug("Preloaded map for event", { eventId });
      } catch (err) {
        logger.warn("Failed to preload map for event", { eventId, error: err });
      }
    });

    await Promise.allSettled(loadPromises);
  };

  const getCacheInfo = () => {
    return {
      size: mapCache.size,
      keys: Array.from(mapCache.keys()),
      totalSize: Array.from(mapCache.values()).reduce(
        (total, content) => total + content.length,
        0
      ),
    };
  };

  return {
    currentMapContent: readonly(currentMapContent),
    isLoading: readonly(isLoading),
    error: readonly(error),
    loadEventMap,
    getMapFileName,
    clearCache,
    preloadMaps,
    getCacheInfo,
  };
};

export const useCircleMapping = () => {
  const getCirclePosition = (
    circle: any,
    eventId: string
  ): { x: number; y: number } => {
    const config = getConfigFromData(eventId);

    if (!circle.placement) {
      return getDefaultPosition();
    }

    const placement = circle.placement;

    // 配置番号を正規化（2スペース対応）
    const normalized = normalizePlacement(placement);

    // 2スペースの場合は中央位置を計算
    if (normalized.isDoubleSpace) {
      return calculateDoubleSpacePosition(normalized, config, eventId);
    }

    // 1スペースの場合は通常の処理
    return getSingleSpacePosition(normalized.primaryPosition, config, eventId);
  };

  const getSingleSpacePosition = (
    position: string,
    config: any,
    eventId: string
  ): { x: number; y: number } => {
    // 座標マッピングから取得を試行
    const mappedPosition = config.coordinateMapping[position];
    if (mappedPosition) {
      return { x: mappedPosition.x, y: mappedPosition.y };
    }

    // マッピングにない場合は動的計算
    const placementInfo = parsePlacementString(position);
    return calculatePositionFromPlacement(placementInfo, eventId);
  };

  const calculateDoubleSpacePosition = (
    normalized: any,
    config: any,
    eventId: string
  ): { x: number; y: number } => {
    // 2つの位置を取得
    const pos1 = getSingleSpacePosition(
      normalized.primaryPosition,
      config,
      eventId
    );
    const pos2 = getSingleSpacePosition(
      normalized.secondaryPosition!,
      config,
      eventId
    );

    // 中央位置を計算
    return {
      x: (pos1.x + pos2.x) / 2,
      y: (pos1.y + pos2.y) / 2,
    };
  };

  const calculatePositionFromPlacement = (
    placement: any,
    eventId: string
  ): { x: number; y: number } => {
    // geica-32での配置計算（既存のロジック）
    if (eventId === "geica-32") {
      return calculateGeica32Position(placement);
    }

    // geica-31での配置計算
    if (eventId === "geica-31") {
      return calculateGeica31Position(placement);
    }

    return getDefaultPosition();
  };

  const calculateGeica32Position = (
    placement: any
  ): { x: number; y: number } => {
    // みきエリアの処理
    if (placement.block === "み" || placement.block === "カ") {
      const num = parseInt(placement.number1);
      if (placement.block === "カ" && num >= 1 && num <= 6) {
        return { x: 85, y: 40 + (num - 1) * 30 };
      } else if (placement.block === "み" && num >= 1 && num <= 20) {
        return { x: 85, y: 270 + (num - 1) * 30 };
      }
    }

    // アやド行の処理
    const blockNum = parseInt(placement.number1);
    if (blockNum >= 1 && blockNum <= 72) {
      let baseX = 0;
      let baseY = 0;

      // ブロック別のオフセット
      if (placement.block === "ア") {
        baseX = 250;
        baseY = 140;
      } else if (placement.block === "ド") {
        baseX = 250;
        baseY = 540;
      }

      // 列の計算
      let colGroup = Math.floor((blockNum - 1) / 24);
      let posInGroup = ((blockNum - 1) % 24) + 1;

      // 列内での位置
      let row = Math.floor((posInGroup - 1) / 2);
      let isRightSide = (posInGroup - 1) % 2 === 1;

      let x = baseX + colGroup * 200 + (isRightSide ? 35 : 0);
      let y = baseY + row * 30;

      return { x, y };
    }

    return getDefaultPosition();
  };

  const calculateGeica31Position = (
    placement: any
  ): { x: number; y: number } => {
    // geica-31用の配置計算（必要に応じて実装）
    // 現在はgeica-32と同じロジックを使用
    return calculateGeica32Position(placement);
  };

  const getDefaultPosition = (): { x: number; y: number } => {
    return { x: 400, y: 300 };
  };

  return {
    getCirclePosition,
    calculatePositionFromPlacement,
    getDefaultPosition,
  };
};
