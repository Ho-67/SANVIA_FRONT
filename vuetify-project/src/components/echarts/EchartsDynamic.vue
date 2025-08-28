<template>
  <div ref="chartRef" style="width: 100%; height: 100%" />
</template>

<script setup>
  import { onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
  import { useDisplay, useTheme } from 'vuetify'

  // 引入 ECharts 核心模組，以及需要的圖表和元件
  import * as echarts from 'echarts/core'
  import { ScatterChart } from 'echarts/charts'
  import {
    GridComponent,
    TooltipComponent,
  } from 'echarts/components'
import { UniversalTransition } from 'echarts/features'
  import { CanvasRenderer } from 'echarts/renderers'

  // 註冊你將要使用的元件
  echarts.use([
    ScatterChart,
    GridComponent,
    TooltipComponent,
    UniversalTransition,
    CanvasRenderer,
  ])

  const theme = useTheme()
  const display = useDisplay()

  const chartRef = ref(null)
  let myChart = null
  let intervalId = null

  // Echarts Data
  const xData = ref([])
  const yData = ref([])
  const data = ref([])

  // Define options array within setup
  const options = [
    {
      series: [
        {
          type: 'scatter',
          symbol: 'circle',
        },
      ],
    },
    {
      series: [
        {
          // 心形 (Heart)
          symbol:
            'path://M23.6 2c-3.363 0-6.258 2.736-7.599 5.594-1.342-2.858-4.237-5.594-7.601-5.594-4.637 0-8.4 3.764-8.4 8.401 0 9.433 9.516 11.906 16.001 21.232 6.13-9.268 15.999-12.1 15.999-21.232 0-4.637-3.763-8.401-8.4-8.401z',
        },
      ],
    },
    {
      series: [
        {
          // 開心 (Happy)
          symbol:
            'path://M16 0c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zM22 8c1.105 0 2 1.343 2 3s-0.895 3-2 3-2-1.343-2-3 0.895-3 2-3zM10 8c1.105 0 2 1.343 2 3s-0.895 3-2 3-2-1.343-2-3 0.895-3 2-3zM16 28c-5.215 0-9.544-4.371-10-9.947 2.93 1.691 6.377 2.658 10 2.658s7.070-0.963 10-2.654c-0.455 5.576-4.785 9.942-10 9.942z',
        },
      ],
    },
    {
      series: [
        {
          // 邪惡 (Evil)
          symbol:
            'path://M32 2c0-1.422-0.298-2.775-0.833-4-1.049 2.401-3.014 4.31-5.453 5.287-2.694-2.061-6.061-3.287-9.714-3.287s-7.021 1.226-9.714 3.287c-2.439-0.976-4.404-2.886-5.453-5.287-0.535 1.225-0.833 2.578-0.833 4 0 2.299 0.777 4.417 2.081 6.106-1.324 2.329-2.081 5.023-2.081 7.894 0 8.837 7.163 16 16 16s16-7.163 16-16c0-2.871-0.757-5.565-2.081-7.894 1.304-1.689 2.081-3.806 2.081-6.106zM18.003 11.891c0.064-1.483 1.413-2.467 2.55-3.036 1.086-0.543 2.16-0.814 2.205-0.826 0.536-0.134 1.079 0.192 1.213 0.728s-0.192 1.079-0.728 1.213c-0.551 0.139-1.204 0.379-1.779 0.667 0.333 0.357 0.537 0.836 0.537 1.363 0 1.105-0.895 2-2 2s-2-0.895-2-2c0-0.037 0.001-0.073 0.003-0.109zM8.030 8.758c0.134-0.536 0.677-0.862 1.213-0.728 0.045 0.011 1.119 0.283 2.205 0.826 1.137 0.569 2.486 1.553 2.55 3.036 0.002 0.036 0.003 0.072 0.003 0.109 0 1.105-0.895 2-2 2s-2-0.895-2-2c0-0.527 0.204-1.005 0.537-1.363-0.575-0.288-1.228-0.528-1.779-0.667-0.536-0.134-0.861-0.677-0.728-1.213zM16 26c-3.641 0-6.827-1.946-8.576-4.855l2.573-1.544c1.224 2.036 3.454 3.398 6.003 3.398s4.779-1.362 6.003-3.398l2.573 1.544c-1.749 2.908-4.935 4.855-8.576 4.855z',
        },
      ],
    },
    {
      series: [
        {
          // 潮人 (Hipster)
          symbol:
            'path://M16 0c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zM22 8c1.105 0 2 0.895 2 2s-0.895 2-2 2-2-0.895-2-2 0.895-2 2-2zM10 8c1.105 0 2 0.895 2 2s-0.895 2-2 2-2-0.895-2-2 0.895-2 2-2zM16.994 21.23c-0.039-0.035-0.078-0.072-0.115-0.109-0.586-0.586-0.878-1.353-0.879-2.121-0 0.768-0.293 1.535-0.879 2.121-0.038 0.038-0.076 0.074-0.115 0.109-2.704 2.453-9.006-0.058-9.006-3.23 1.938 1.25 3.452 0.306 4.879-1.121 1.172-1.172 3.071-1.172 4.243 0 0.586 0.586 0.879 1.353 0.879 2.121 0-0.768 0.293-1.535 0.879-2.121 1.172-1.172 3.071-1.172 4.243 0 1.427 1.427 2.941 2.371 4.879 1.121 0 3.173-6.302 5.684-9.006 3.23z',
        },
      ],
    },
    {
      series: [
        {
          // 震驚 (Shocked)
          symbol:
            'path://M16 0c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zM10 14c-1.105 0-2-1.343-2-3s0.895-3 2-3 2 1.343 2 3-0.895 3-2 3zM16 26c-2.209 0-4-1.791-4-4s1.791-4 4-4c2.209 0 4 1.791 4 4s-1.791 4-4 4zM22 14c-1.105 0-2-1.343-2-3s0.895-3 2-3 2 1.343 2 3-0.895 3-2 3z',
        },
      ],
    },
    {
      series: [
        {
          // 用戶 (Users)
          symbol:
            'path://M10.225 24.854c1.728-1.13 3.877-1.989 6.243-2.513-0.47-0.556-0.897-1.176-1.265-1.844-0.95-1.726-1.453-3.627-1.453-5.497 0-2.689 0-5.228 0.956-7.305 0.928-2.016 2.598-3.265 4.976-3.734-0.529-2.39-1.936-3.961-5.682-3.961-6 0-6 4.029-6 9 0 3.096 1.797 6.191 4 7.432v1.649c-6.784 0.555-12 3.888-12 7.918h8.719c0.454-0.403 0.956-0.787 1.506-1.146zM24 24.082v-1.649c2.203-1.241 4-4.337 4-7.432 0-4.971 0-9-6-9s-6 4.029-6 9c0 3.096 1.797 6.191 4 7.432v1.649c-6.784 0.555-12 3.888-12 7.918h28c0-4.030-5.216-7.364-12-7.918z',
        },
      ],
    },
  ]

  let optionIndex = ref(0)

  // 根據螢幕寬度動態調整 x 軸資料點數量
  const calculateChartData = () => {
    const currentWidth = display.width.value
    let maxX = 1 // 預設最大X軸資料點數量
    let symbolSize = 48 // 預設圖標大小

    xData.value = []
    data.value = []
    yData.value.length = 0

    for (let y = 0; y < 1; y++) {
      yData.value.push(y)
      for (let x = 0; x < maxX; x++) {
        data.value.push([x, y, 10])
      }
    }
    for (let x = 0; x < maxX; x++) {
      xData.value.push(x)
    }

    updateChartOptions(symbolSize)
  }

  const updateChartOptions = (symbolSize) => {
    const baseOption = {
      color: [theme.current.value.colors.primary],
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      xAxis: {
        show: false,
        type: 'category',
        data: xData.value,
      },
      yAxis: {
        show: false,
        type: 'category',
        data: yData.value,
      },
      series: [
        {
          type: 'scatter',
          data: data.value,
          symbol: options[optionIndex.value].series[0].symbol,
          symbolKeepAspect: true,
          universalTransition: true,
          symbolSize: symbolSize,
        },
      ],
    }
    myChart.setOption(baseOption, true)
  }

  onMounted(() => {
    nextTick(() => {
      if (chartRef.value) {
        myChart = echarts.init(chartRef.value)
        calculateChartData()
        intervalId = setInterval(() => {
          optionIndex.value = (optionIndex.value + 1) % options.length
          updateChartOptions(myChart.getOption().series[0].symbolSize)
        }, 700)
      }
    })
  })

  onBeforeUnmount(() => {
    if (intervalId) clearInterval(intervalId)
    if (myChart) myChart.dispose()
  })

  // 監聽 display.width 的變化，確保圖表在 Vuetify 斷點改變時也能正確 resize 並調整資料
  watch(
    () => display.width.value,
    () => {
      calculateChartData() // 寬度變化時重新計算資料
      if (myChart) {
        myChart.resize()
      }
    }
  )
</script>
