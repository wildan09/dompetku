import { ref } from 'vue'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'

export function useExport() {
  const exporting = ref(false)

  function exportToPDF(transactions, summary, period = 'Bulanan') {
    exporting.value = true
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()

      // Header
      doc.setFontSize(20)
      doc.setTextColor(16, 185, 129)
      doc.text('DompetKu', 14, 20)
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Laporan Keuangan ${period}`, 14, 28)
      doc.text(`Diekspor: ${formatDate(new Date(), 'DD MMMM YYYY HH:mm')}`, 14, 34)

      // Summary
      doc.setFontSize(12)
      doc.setTextColor(0)
      doc.text('Ringkasan', 14, 48)

      doc.autoTable({
        startY: 52,
        head: [['Keterangan', 'Jumlah']],
        body: [
          ['Total Pemasukan', formatCurrency(summary.income)],
          ['Total Pengeluaran', formatCurrency(summary.expense)],
          ['Saldo Bersih', formatCurrency(summary.income - summary.expense)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 10 },
      })

      // Transactions table
      doc.setFontSize(12)
      doc.text('Daftar Transaksi', 14, doc.lastAutoTable.finalY + 14)

      const tableData = transactions.map(t => [
        formatDate(t.date, 'DD/MM/YY'),
        t.type === 'income' ? 'Masuk' : t.type === 'expense' ? 'Keluar' : 'Transfer',
        t.categories?.name || '-',
        t.wallets?.name || '-',
        formatCurrency(t.amount),
        t.note || '-',
      ])

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 18,
        head: [['Tanggal', 'Tipe', 'Kategori', 'Wallet', 'Nominal', 'Catatan']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59] },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          4: { halign: 'right' },
        },
      })

      // Footer
      const finalY = doc.lastAutoTable.finalY + 10
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text('Dibuat dengan DompetKu - Aplikasi Keuangan Pribadi', pageWidth / 2, finalY, { align: 'center' })

      doc.save(`laporan-keuangan-${formatDate(new Date(), 'YYYY-MM-DD')}.pdf`)
    } finally {
      exporting.value = false
    }
  }

  function exportToExcel(transactions, summary, categoryBreakdown = []) {
    exporting.value = true
    try {
      const wb = XLSX.utils.book_new()

      // Sheet 1: Summary
      const summaryData = [
        ['Laporan Keuangan - DompetKu'],
        [],
        ['Keterangan', 'Jumlah'],
        ['Total Pemasukan', summary.income],
        ['Total Pengeluaran', summary.expense],
        ['Saldo Bersih', summary.income - summary.expense],
      ]
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan')

      // Sheet 2: Transactions
      const txHeaders = ['Tanggal', 'Tipe', 'Kategori', 'Wallet', 'Nominal', 'Catatan']
      const txData = transactions.map(t => [
        formatDate(t.date, 'DD/MM/YYYY'),
        t.type === 'income' ? 'Masuk' : t.type === 'expense' ? 'Keluar' : 'Transfer',
        t.categories?.name || '-',
        t.wallets?.name || '-',
        Number(t.amount),
        t.note || '-',
      ])
      const ws2 = XLSX.utils.aoa_to_sheet([txHeaders, ...txData])
      XLSX.utils.book_append_sheet(wb, ws2, 'Transaksi')

      // Sheet 3: Category breakdown
      if (categoryBreakdown.length) {
        const catHeaders = ['Kategori', 'Total', 'Persentase']
        const catData = categoryBreakdown.map(c => [c.name, c.total, c.percentage + '%'])
        const ws3 = XLSX.utils.aoa_to_sheet([catHeaders, ...catData])
        XLSX.utils.book_append_sheet(wb, ws3, 'Per Kategori')
      }

      XLSX.writeFile(wb, `laporan-keuangan-${formatDate(new Date(), 'YYYY-MM-DD')}.xlsx`)
    } finally {
      exporting.value = false
    }
  }

  return { exporting, exportToPDF, exportToExcel }
}
