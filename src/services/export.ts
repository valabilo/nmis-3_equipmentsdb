import type { Employee, Equipment } from '../types';
import { getEquipmentValue } from '../utils/equipment';
import { formatDate } from '../utils/format';

export function exportCsv(filename: string, rows: Record<string, unknown>[]) {
  const headers = Object.keys(rows[0] ?? {});
  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? '')).join(',')),
  ].join('\n');
  downloadBlob(filename, `\uFEFF${csv}`, 'text/csv;charset=utf-8;');
}

export async function exportExcel(filename: string, rows: Record<string, unknown>[], sheetName = 'Report') {
  const XLSX = await import('xlsx');
  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.min(Math.max(key.length + 4, 14), key === 'Description' || key === 'Remarks' ? 52 : 28),
  }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

export async function exportEquipmentPdf(filename: string, equipment: Equipment[], title = 'Equipment Inventory') {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const document = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const generatedAt = new Date().toLocaleString('en-PH');
  const totalValue = equipment.reduce((sum, item) => sum + getEquipmentValue(item), 0);

  autoTable(document, {
    startY: 38,
    margin: { top: 38, left: 14, right: 14, bottom: 14 },
    head: [['Property No.', 'Article', 'Description', 'Issued To', 'Reference', 'Date Issued', 'Status', 'Amount']],
    body: equipment.map((item) => [
      cleanCell(item.propertyNo),
      cleanCell(item.article),
      cleanCell(item.itemDescription),
      cleanCell(item.issuedTo || 'Unassigned'),
      cleanCell(item.accountabilityNo || 'No reference'),
      formatDate(item.dateIssued),
      cleanCell(item.status || 'No status'),
      formatMoney(getEquipmentValue(item)),
    ]),
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7,
      cellPadding: 2,
      lineColor: [210, 210, 210],
      lineWidth: 0.1,
      overflow: 'linebreak',
      valign: 'top',
      textColor: [55, 55, 55],
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [20, 20, 20],
      fontStyle: 'bold',
      lineColor: [160, 160, 160],
    },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 18 },
      2: { cellWidth: 95 },
      3: { cellWidth: 42 },
      4: { cellWidth: 28 },
      5: { cellWidth: 22 },
      6: { cellWidth: 14 },
      7: { cellWidth: 20, halign: 'right' },
    },
    didDrawPage: () => {
      drawPdfHeader(document, title, generatedAt, equipment.length, totalValue);
    },
  });

  addPageNumbers(document);
  document.save(filename);
}

export function mapEquipmentRows(equipment: Equipment[]) {
  return equipment.map((item) => ({
    Category: item.category,
    Article: item.article,
    'Property No.': item.propertyNo,
    Description: item.itemDescription,
    Amount: getEquipmentValue(item),
    'Accountability No.': item.accountabilityNo,
    'Issued To': item.issuedTo,
    'Date Issued': formatDate(item.dateIssued),
    Status: item.status,
    Location: item.location,
    Remarks: item.remarks,
  }));
}

export function mapEmployeeRows(employees: Employee[]) {
  return employees.map((employee) => ({
    'Employee ID': employee.employeeId,
    Name: employee.name,
    Status: employee.status,
    Position: employee.position,
  }));
}

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function formatMoney(value: number) {
  return `PHP ${new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0)}`;
}

function cleanCell(value: unknown) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function drawPdfHeader(document: import('jspdf').default, title: string, generatedAt: string, recordCount: number, totalValue: number) {
  document.setFont('helvetica', 'normal');
  document.setTextColor(20, 20, 20);
  document.setFontSize(9);
  document.text('Republic of the Philippines', 14, 14);

  document.setFont('helvetica', 'bold');
  document.setFontSize(13);
  document.text(title, 14, 21);

  document.setFont('helvetica', 'normal');
  document.setFontSize(8);
  document.text(`Generated ${generatedAt}`, 14, 27);
  document.text(`Records: ${recordCount.toLocaleString()}    Total Value: ${formatMoney(totalValue)}`, 14, 32);
}

function addPageNumbers(document: import('jspdf').default) {
  const totalPages = document.getNumberOfPages();
  const pageWidth = document.internal.pageSize.getWidth();
  const pageHeight = document.internal.pageSize.getHeight();

  for (let page = 1; page <= totalPages; page += 1) {
    document.setPage(page);
    document.setFont('helvetica', 'normal');
    document.setFontSize(7);
    document.setTextColor(100, 100, 100);
    document.text(`Page ${page} of ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
  }
}
