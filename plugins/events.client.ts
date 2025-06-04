export default defineNuxtPlugin(async () => {
  console.log('🔌 Events plugin loading...')
  
  // useEventsが利用可能になるまで待つ
  const { fetchEvents, currentEvent } = useEvents()
  
  try {
    // イベントデータを読み込む
    if (!currentEvent.value) {
      console.log('🔄 Plugin: Loading events...')
      await fetchEvents()
      console.log('✅ Plugin: Events loaded, currentEvent:', currentEvent.value?.id)
    } else {
      console.log('✅ Plugin: Events already loaded')
    }
  } catch (error) {
    console.error('❌ Plugin: Failed to load events:', error)
  }
})