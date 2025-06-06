import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

interface OriginalCircleData {
  id: string
  circleName: string
  circleKana?: string
  penName?: string
  penNameKana?: string
  circleImageUrl?: string
  genre: string
  block: string
  number1: string
  number2?: string
  description?: string
  twitter?: string
  pixiv?: string
  oshinaUrl?: string
  isAdult: string
  ownerId?: string
  isPublic: string
  eventId: string
  createdAt?: string
  updatedAt?: string
}

interface ConvertedCircleData {
  id: string
  circleName: string
  circleKana: string
  penName: string
  penNameKana: string
  circleImageUrl: string | null
  genre: string[]
  placement: {
    block: string
    number1: string
    number2: string | null
  }
  description: string
  contact: {
    twitter: string | null
    pixiv: string | null
    oshinaUrl: string | null
  }
  isAdult: boolean
  ownerId: string | null
  isPublic: boolean
  eventId: string
}

// ジャンル文字列を配列に変換
function parseGenre(genreString: string): string[] {
  if (!genreString) return []
  
  // 一般的な区切り文字で分割
  const separators = [',', '、', '，', '・', ' ', '　']
  let genres = [genreString]
  
  for (const sep of separators) {
    const newGenres: string[] = []
    for (const genre of genres) {
      newGenres.push(...genre.split(sep))
    }
    genres = newGenres
  }
  
  // 空文字列を除去し、トリム
  return genres
    .map(g => g.trim())
    .filter(g => g.length > 0)
    .filter(g => g !== '同人誌') // 重複しがちな「同人誌」は除去
}

// URLの正規化
function normalizeUrl(url: string): string | null {
  if (!url || url.trim() === '') return null
  const trimmed = url.trim()
  if (trimmed === 'http://' || trimmed === 'https://') return null
  return trimmed
}

// データ変換関数
function convertCircleData(original: OriginalCircleData): ConvertedCircleData {
  return {
    id: original.id && original.id.trim() !== '' 
      ? original.id.trim() 
      : `circle-${Date.now()}`, // IDが空の場合はタイムスタンプを使用
    circleName: original.circleName || '',
    circleKana: original.circleKana || '',
    penName: original.penName || '',
    penNameKana: original.penNameKana || '',
    circleImageUrl: original.circleImageUrl && original.circleImageUrl.trim() !== '' 
      ? original.circleImageUrl.trim() 
      : null,
    genre: parseGenre(original.genre),
    placement: {
      block: original.block,
      number1: original.number1,
      number2: original.number2 && original.number2.trim() !== '' 
        ? original.number2.trim() 
        : null
    },
    description: original.description || '',
    contact: {
      twitter: normalizeUrl(original.twitter || ''),
      pixiv: normalizeUrl(original.pixiv || ''),
      oshinaUrl: normalizeUrl(original.oshinaUrl || '')
    },
    isAdult: original.isAdult === 'true',
    ownerId: original.ownerId && original.ownerId.trim() !== '' 
      ? original.ownerId.trim() 
      : null,
    isPublic: original.isPublic === 'true',
    eventId: original.eventId
  }
}

async function convertData() {
  try {
    console.log('🔄 JSONデータの変換を開始します...')
    
    // 元のJSONファイルを読み込み
    const inputPath = join(process.cwd(), 'data', 'geika31-circle.json')
    const outputPath = join(process.cwd(), 'data', 'geika31-circle-converted.json')
    
    console.log(`📖 読み込み: ${inputPath}`)
    const jsonData = readFileSync(inputPath, 'utf-8')
    const originalData: OriginalCircleData[] = JSON.parse(jsonData)
    
    console.log(`📊 ${originalData.length}件のデータを変換します`)
    
    // データ変換
    const convertedData: ConvertedCircleData[] = originalData.map(convertCircleData)
    
    // 変換結果の統計
    const stats = {
      total: convertedData.length,
      withGenres: convertedData.filter(d => d.genre.length > 0).length,
      withTwitter: convertedData.filter(d => d.contact.twitter).length,
      withPixiv: convertedData.filter(d => d.contact.pixiv).length,
      withOshina: convertedData.filter(d => d.contact.oshinaUrl).length,
      adultContent: convertedData.filter(d => d.isAdult).length,
      withNumber2: convertedData.filter(d => d.placement.number2).length
    }
    
    console.log('\n📈 変換統計:')
    console.log(`  総数: ${stats.total}件`)
    console.log(`  ジャンル有り: ${stats.withGenres}件`)
    console.log(`  Twitter有り: ${stats.withTwitter}件`)
    console.log(`  Pixiv有り: ${stats.withPixiv}件`)
    console.log(`  お品書き有り: ${stats.withOshina}件`)
    console.log(`  成人向け: ${stats.adultContent}件`)
    console.log(`  複数配置: ${stats.withNumber2}件`)
    
    // 変換後のデータを保存
    const outputJson = JSON.stringify(convertedData, null, 2)
    writeFileSync(outputPath, outputJson, 'utf-8')
    
    console.log(`\n💾 変換完了: ${outputPath}`)
    console.log('🎉 データ変換が正常に完了しました！')
    
    // サンプルデータを表示
    console.log('\n📋 変換例（最初の1件）:')
    console.log(JSON.stringify(convertedData[0], null, 2))
    
  } catch (error) {
    console.error('💥 変換処理でエラーが発生しました:', error)
    process.exit(1)
  }
}

// スクリプト実行
convertData()
  .then(() => {
    console.log('🏁 処理完了')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 予期しないエラー:', error)
    process.exit(1)
  })

export { convertData }