<template>
  <div>
    <apexchart
      type="bar"
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
  categories: { type: Array, default: () => [] },
  series: { type: Array, default: () => [] },
  height: { type: Number, default: 300 },
})

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    background: 'transparent',
    toolbar: { show: false },
    fontFamily: 'Plus Jakarta Sans, sans-serif',
  },
  xaxis: {
    categories: props.categories,
    labels: { style: { colors: '#94A3B8', fontSize: '11px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: '#94A3B8' },
      formatter: (val) => {
        if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'jt'
        if (val >= 1_000) return (val / 1_000).toFixed(0) + 'rb'
        return val
      },
    },
  },
  colors: ['#10B981', '#F43F5E'],
  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: '45%',
    },
  },
  dataLabels: { enabled: false },
  grid: {
    borderColor: '#1E293B',
    strokeDashArray: 4,
  },
  legend: {
    labels: { colors: '#94A3B8' },
    fontSize: '12px',
  },
  tooltip: {
    theme: 'dark',
    y: {
      formatter: (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val),
    },
  },
  theme: { mode: 'dark' },
}))
</script>
