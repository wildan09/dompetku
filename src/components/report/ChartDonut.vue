<template>
  <div>
    <apexchart
      type="donut"
      :height="height"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const props = defineProps({
  labels: { type: Array, default: () => [] },
  series: { type: Array, default: () => [] },
  colors: { type: Array, default: () => ['#10B981', '#3B82F6', '#F43F5E', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'] },
  height: { type: Number, default: 280 },
})

const chartOptions = computed(() => ({
  chart: {
    type: 'donut',
    background: 'transparent',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
  },
  labels: props.labels,
  colors: props.colors,
  stroke: { show: false },
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: {
        size: '72%',
        labels: {
          show: true,
          name: { color: '#94A3B8', fontSize: '12px' },
          value: { color: '#fff', fontSize: '20px', fontWeight: 700 },
          total: {
            show: true,
            label: 'Total',
            color: '#94A3B8',
            fontSize: '12px',
            formatter: (w) => {
              const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0)
              return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total)
            },
          },
        },
      },
    },
  },
  legend: {
    position: 'bottom',
    labels: { colors: '#94A3B8' },
    fontSize: '12px',
    markers: { width: 10, height: 10, radius: 4 },
  },
  tooltip: {
    y: {
      formatter: (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val),
    },
  },
  theme: { mode: 'dark' },
}))
</script>
