import { createLogger } from '~/utils/logger'

export default defineNuxtPlugin(async () => {
  const logger = createLogger('EventsPlugin')
  logger.info('Events plugin loading...')
  
  // useEventsが利用可能になるまで待つ
  const { fetchEvents, currentEvent } = useEvents()
  
  try {
    // イベントデータを読み込む
    if (!currentEvent.value) {
      logger.info('Loading events...')
      await fetchEvents()
      logger.info('Events loaded successfully', { currentEventId: currentEvent.value?.id })
    } else {
      logger.info('Events already loaded')
    }
  } catch (error) {
    logger.error('Failed to load events', error)
  }
})