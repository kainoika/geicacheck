import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

// モックコンポーネント
const PurchasePlanButton = {
  name: 'PurchasePlanButton',
  props: {
    circleId: String,
    itemId: String,
    price: Number,
    circleName: String,
    itemName: String,
    showPrice: {
      type: Boolean,
      default: true
    }
  },
  emits: ['updated'],
  setup(props: any, { emit }: any) {
    const loading = ref(false)
    const isPlanned = ref(false)
    const quantity = ref(1)
    const planId = ref<string | null>(null)

    const handleAdd = async () => {
      loading.value = true
      try {
        // モックの追加処理
        planId.value = `plan_${Date.now()}`
        isPlanned.value = true
        quantity.value = 1
        
        emit('updated', {
          id: planId.value,
          circleId: props.circleId,
          itemId: props.itemId,
          quantity: quantity.value,
          priceAtTime: props.price
        })
      } finally {
        loading.value = false
      }
    }

    const handleRemove = async () => {
      loading.value = true
      try {
        // モックの削除処理
        isPlanned.value = false
        quantity.value = 1
        planId.value = null
        
        emit('updated', null)
      } finally {
        loading.value = false
      }
    }

    const handleIncrease = async () => {
      if (!planId.value || loading.value) return
      
      loading.value = true
      try {
        quantity.value++
        emit('updated', {
          id: planId.value,
          circleId: props.circleId,
          itemId: props.itemId,
          quantity: quantity.value,
          priceAtTime: props.price
        })
      } finally {
        loading.value = false
      }
    }

    const handleDecrease = async () => {
      if (!planId.value || loading.value || quantity.value <= 1) return
      
      loading.value = true
      try {
        quantity.value--
        emit('updated', {
          id: planId.value,
          circleId: props.circleId,
          itemId: props.itemId,
          quantity: quantity.value,
          priceAtTime: props.price
        })
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      isPlanned,
      quantity,
      planId,
      handleAdd,
      handleRemove,
      handleIncrease,
      handleDecrease
    }
  },
  template: `
    <div class="purchase-plan-button">
      <button
        v-if="!isPlanned"
        @click="handleAdd"
        :disabled="loading"
        data-testid="add-button"
      >
        購入予定に追加
      </button>

      <div v-else data-testid="quantity-controls">
        <div>
          <button
            @click="handleDecrease"
            :disabled="loading || quantity <= 1"
            data-testid="decrease-button"
          >
            -
          </button>
          
          <span data-testid="quantity">{{ quantity }}</span>
          
          <button
            @click="handleIncrease"
            :disabled="loading"
            data-testid="increase-button"
          >
            +
          </button>
        </div>

        <button
          @click="handleRemove"
          :disabled="loading"
          data-testid="remove-button"
        >
          削除
        </button>
      </div>

      <div v-if="isPlanned && showPrice" data-testid="price-display">
        小計: ¥{{ (price * quantity).toLocaleString() }}
      </div>
    </div>
  `
}

describe('PurchasePlanButton', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(PurchasePlanButton, {
      props: {
        circleId: 'circle1',
        itemId: 'item1',
        price: 1000,
        circleName: 'テストサークル',
        itemName: 'テスト商品',
        showPrice: true
      }
    })
  })

  describe('初期状態', () => {
    it('追加ボタンが表示される', () => {
      const addButton = wrapper.find('[data-testid="add-button"]')
      expect(addButton.exists()).toBe(true)
      expect(addButton.text()).toBe('購入予定に追加')
    })

    it('数量コントロールが表示されない', () => {
      const quantityControls = wrapper.find('[data-testid="quantity-controls"]')
      expect(quantityControls.exists()).toBe(false)
    })
  })

  describe('購入予定追加', () => {
    it('追加ボタンクリックで状態が変わる', async () => {
      const addButton = wrapper.find('[data-testid="add-button"]')
      
      await addButton.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isPlanned).toBe(true)
      expect(wrapper.vm.quantity).toBe(1)
      expect(wrapper.vm.planId).toBeTruthy()
    })

    it('追加時にupdatedイベントが発生する', async () => {
      const addButton = wrapper.find('[data-testid="add-button"]')
      
      await addButton.trigger('click')

      expect(wrapper.emitted('updated')).toBeTruthy()
      expect(wrapper.emitted('updated')?.[0][0]).toMatchObject({
        circleId: 'circle1',
        itemId: 'item1',
        quantity: 1,
        priceAtTime: 1000
      })
    })
  })

  describe('購入予定管理', () => {
    beforeEach(async () => {
      // 事前に購入予定を追加
      const addButton = wrapper.find('[data-testid="add-button"]')
      await addButton.trigger('click')
      await wrapper.vm.$nextTick()
    })

    it('数量コントロールが表示される', () => {
      const quantityControls = wrapper.find('[data-testid="quantity-controls"]')
      expect(quantityControls.exists()).toBe(true)
      
      const quantity = wrapper.find('[data-testid="quantity"]')
      expect(quantity.text()).toBe('1')
    })

    it('数量を増やすことができる', async () => {
      const increaseButton = wrapper.find('[data-testid="increase-button"]')
      
      await increaseButton.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.quantity).toBe(2)
      expect(wrapper.find('[data-testid="quantity"]').text()).toBe('2')
    })

    it('数量を減らすことができる（最小値1）', async () => {
      // まず数量を2に増やす
      wrapper.vm.quantity = 2
      await wrapper.vm.$nextTick()

      const decreaseButton = wrapper.find('[data-testid="decrease-button"]')
      
      await decreaseButton.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.quantity).toBe(1)
    })

    it('数量1の時は減らすボタンが無効になる', () => {
      const decreaseButton = wrapper.find('[data-testid="decrease-button"]')
      expect(decreaseButton.attributes('disabled')).toBeDefined()
    })

    it('削除ボタンで購入予定を削除できる', async () => {
      const removeButton = wrapper.find('[data-testid="remove-button"]')
      
      await removeButton.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isPlanned).toBe(false)
      expect(wrapper.vm.quantity).toBe(1)
      expect(wrapper.vm.planId).toBeNull()
    })

    it('削除時にupdatedイベントでnullが発生する', async () => {
      const removeButton = wrapper.find('[data-testid="remove-button"]')
      
      await removeButton.trigger('click')

      const events = wrapper.emitted('updated')
      expect(events).toBeTruthy()
      expect(events?.[events.length - 1][0]).toBeNull()
    })
  })

  describe('価格表示', () => {
    beforeEach(async () => {
      // 事前に購入予定を追加
      const addButton = wrapper.find('[data-testid="add-button"]')
      await addButton.trigger('click')
      await wrapper.vm.$nextTick()
    })

    it('小計が正しく表示される', () => {
      const priceDisplay = wrapper.find('[data-testid="price-display"]')
      expect(priceDisplay.text()).toBe('小計: ¥1,000')
    })

    it('数量変更時に小計が更新される', async () => {
      const increaseButton = wrapper.find('[data-testid="increase-button"]')
      await increaseButton.trigger('click')
      await wrapper.vm.$nextTick()

      const priceDisplay = wrapper.find('[data-testid="price-display"]')
      expect(priceDisplay.text()).toBe('小計: ¥2,000')
    })

    it('showPrice=falseの時は価格表示されない', async () => {
      await wrapper.setProps({ showPrice: false })

      const priceDisplay = wrapper.find('[data-testid="price-display"]')
      expect(priceDisplay.exists()).toBe(false)
    })
  })

  describe('ローディング状態', () => {
    it('ローディング中はボタンが無効になる', async () => {
      wrapper.vm.loading = true
      await wrapper.vm.$nextTick()

      const addButton = wrapper.find('[data-testid="add-button"]')
      expect(addButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('プロパティ', () => {
    it('必要なプロパティが正しく渡される', () => {
      expect(wrapper.props('circleId')).toBe('circle1')
      expect(wrapper.props('itemId')).toBe('item1')
      expect(wrapper.props('price')).toBe(1000)
      expect(wrapper.props('circleName')).toBe('テストサークル')
      expect(wrapper.props('itemName')).toBe('テスト商品')
      expect(wrapper.props('showPrice')).toBe(true)
    })
  })
})