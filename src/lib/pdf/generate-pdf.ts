import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { DailyEntry, PatientProfile } from "@/lib/db/types";

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + "\u2026";
}

function formatMeal(meal: {
  readonly description: string;
  readonly isNil: boolean;
}): string {
  if (meal.isNil) return "NIL";
  const desc = meal.description.trim();
  return desc.length > 0 ? truncate(desc, 30) : "";
}

function formatNum(val: number | null): string {
  return val !== null ? String(val) : "";
}

interface GeneratePdfOptions {
  readonly profile: PatientProfile | null;
  readonly entries: readonly DailyEntry[];
  readonly fromDate: string;
  readonly toDate: string;
}

export function generateDietPdf({
  profile,
  entries,
  fromDate,
  toDate,
}: GeneratePdfOptions): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("ALL DERMA MEDICAL CLINIC", pageWidth / 2, 12, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("DIET TRACKING SHEET", pageWidth / 2, 18, { align: "center" });

  // Patient info block
  if (profile) {
    doc.setFontSize(8);
    const leftX = 14;
    const rightX = pageWidth / 2 + 10;
    let y = 25;

    const leftFields: readonly [string, string][] = [
      ["Name", profile.name],
      ["IC", profile.ic],
      ["DOB", profile.dob],
      ["C/No", profile.cno],
      ["Address", profile.address],
    ];

    const rightFields: readonly [string, string][] = [
      ["Sex", profile.sex],
      ["Allergy", profile.allergy],
      ["C/O", profile.co],
      ["TEL", profile.tel],
    ];

    const maxRows = Math.max(leftFields.length, rightFields.length);

    for (let i = 0; i < maxRows; i++) {
      if (i < leftFields.length) {
        const [label, value] = leftFields[i];
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, leftX, y);
        doc.setFont("helvetica", "normal");
        doc.text(truncate(value, 50), leftX + 20, y);
      }
      if (i < rightFields.length) {
        const [label, value] = rightFields[i];
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, rightX, y);
        doc.setFont("helvetica", "normal");
        doc.text(truncate(value, 50), rightX + 20, y);
      }
      y += 4;
    }
  }

  // Date range subtitle
  const tableStartY = profile ? 48 : 25;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(`Period: ${fromDate} to ${toDate}`, 14, tableStartY - 2);

  // Sort entries chronologically for the PDF
  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  // Table data
  const tableHead = [
    [
      "DATE",
      "BKFST",
      "LUNCH",
      "DINNER",
      "DIST",
      "KCAL",
      "STEPS",
      "AERO",
      "WT",
      "BP",
      "BOWEL",
      "ALC/NUT",
      "REMARKS",
    ],
  ];

  const tableBody = sortedEntries.map((entry) => [
    entry.date,
    formatMeal(entry.breakfast),
    formatMeal(entry.lunch),
    formatMeal(entry.dinner),
    formatNum(entry.distanceKm),
    formatNum(entry.kCalories),
    formatNum(entry.totalSteps),
    formatNum(entry.aerobicSteps),
    formatNum(entry.weightKg),
    entry.bpPulse,
    entry.bowel,
    entry.alcoholNuts,
    truncate(entry.remarks, 25),
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: tableHead,
    body: tableBody,
    theme: "grid",
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      overflow: "linebreak",
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [0, 128, 128],
      textColor: 255,
      fontSize: 7,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 28 },
      2: { cellWidth: 28 },
      3: { cellWidth: 28 },
      4: { cellWidth: 14, halign: "center" },
      5: { cellWidth: 14, halign: "center" },
      6: { cellWidth: 16, halign: "center" },
      7: { cellWidth: 16, halign: "center" },
      8: { cellWidth: 12, halign: "center" },
      9: { cellWidth: 20, halign: "center" },
      10: { cellWidth: 18 },
      11: { cellWidth: 20 },
      12: { cellWidth: 28 },
    },
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      const currentPage = data.pageNumber;
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Page ${currentPage} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: "center" }
      );
    },
  });

  // Download
  const patientName = profile?.name.replace(/\s+/g, "_") ?? "patient";
  doc.save(`DietSheet_${patientName}_${fromDate}_${toDate}.pdf`);
}
