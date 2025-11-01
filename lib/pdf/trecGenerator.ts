import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

interface InspectionData {
  property?: {
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
    client_name?: string;
  };
  inspector?: {
    name?: string;
    license?: string;
  };
  inspection?: {
    date?: string;
  };
}

export async function generateTrecReport(data: InspectionData) {
  const templatePath = path.join(process.cwd(), "public/templates/TREC_Template_Blank.pdf");
  const outputPath = path.join(process.cwd(), "output_pdf.pdf");

  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Helper to draw text
  function drawText(text: string, x: number, y: number, size = 9) {
    firstPage.drawText(text || "Data not found in test data", {
      x,
      y,
      size,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
  }

  // ---- Example mapping (adjust based on your inspection.json structure)
  const property = data.property || {};
  const address = property.address || {};
  const inspector = data.inspector || {};
  const inspection = data.inspection || {};

  drawText(`${property.client_name || ""}`, 120, 740); // Buyer Name
  drawText(`${address.street || ""}`, 120, 720);
  drawText(`${address.city || ""}, ${address.state || ""} ${address.zip || ""}`, 120, 705);
  drawText(`${inspector.name || ""}`, 400, 740);
  drawText(`${inspector.license || ""}`, 400, 725);
  drawText(`${inspection.date || ""}`, 400, 705);

  // Save the filled PDF
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);

  return outputPath;
}
