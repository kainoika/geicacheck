<template>
  <div style="padding: 2rem;">
    <h1>Firestore Debug</h1>
    
    <div style="margin: 1rem 0;">
      <button @click="testConnection" style="background: #ff69b4; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.25rem;">
        Test Firestore Connection
      </button>
    </div>
    
    <div style="margin: 1rem 0;">
      <button @click="listEvents" style="background: #007bff; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.25rem;">
        List Events
      </button>
    </div>
    
    <div style="margin: 1rem 0;">
      <input 
        v-model="testEventId" 
        placeholder="Event ID (e.g., geika-32)"
        style="padding: 0.5rem; border: 1px solid #ccc; border-radius: 0.25rem; margin-right: 0.5rem;"
      >
      <button @click="listCircles" style="background: #28a745; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.25rem;">
        List Circles
      </button>
    </div>
    
    <pre style="background: #f8f9fa; padding: 1rem; border-radius: 0.25rem; font-size: 0.875rem;">{{ output }}</pre>
  </div>
</template>

<script setup lang="ts">
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'

const { $firestore } = useNuxtApp() as any
const output = ref('')
const testEventId = ref('geika-32')

const log = (message: any) => {
  console.log(message)
  output.value += JSON.stringify(message, null, 2) + '\n\n'
}

const testConnection = async () => {
  output.value = ''
  try {
    log('🔄 Testing Firestore connection...')
    log('Firestore instance:', !!$firestore)
    
    // Try to read from a collection
    const testRef = collection($firestore, 'test')
    log('✅ Firestore connection successful')
  } catch (error) {
    log('❌ Firestore connection failed:')
    log(error)
  }
}

const listEvents = async () => {
  output.value = ''
  try {
    log('🔄 Fetching events...')
    
    const eventsRef = collection($firestore, 'events')
    const snapshot = await getDocs(eventsRef)
    
    log(`📄 Found ${snapshot.size} events`)
    
    snapshot.forEach((doc) => {
      log(`Event: ${doc.id}`)
      log(doc.data())
    })
    
    if (snapshot.empty) {
      log('⚠️ No events found in collection')
    }
  } catch (error) {
    log('❌ Error fetching events:')
    log(error)
  }
}

const listCircles = async () => {
  output.value = ''
  try {
    log(`🔄 Fetching circles for event: ${testEventId.value}`)
    
    const circlesRef = collection($firestore, 'events', testEventId.value, 'circles')
    const snapshot = await getDocs(circlesRef)
    
    log(`📄 Found ${snapshot.size} circles`)
    
    snapshot.forEach((doc) => {
      log(`Circle: ${doc.id}`)
      log(doc.data())
    })
    
    if (snapshot.empty) {
      log(`⚠️ No circles found for event: ${testEventId.value}`)
      log('Check if the event ID is correct and if data exists at this path')
    }
  } catch (error) {
    log('❌ Error fetching circles:')
    log(error)
  }
}
</script>