import { PageSizes, PDFDocument } from "npm:pdf-lib";
import * as path from "jsr:@std/path";

async function mergePagesInSinglePdf(
  inputPdfPath: string,
  outputPdfPath: string
) {
  const pageHeight = PageSizes.A4[1]; // A4 height in points
  const pageWidth = PageSizes.A4[0]; // A4 width in points

  try {
    // Load the input PDF
    const inputPdfBuffer = Deno.readFileSync(inputPdfPath);

    const inputPdfDoc = await PDFDocument.load(inputPdfBuffer);

    inputPdfDoc.getPages().forEach((page) => {
      page.setSize(pageWidth, pageHeight - 260);
      page.translateContent(0, -260);
    });

    const croppedPdfBuffer = await inputPdfDoc.save();

    const croppedPdfDoc = await PDFDocument.load(croppedPdfBuffer);

    const totalPages = croppedPdfDoc.getPageCount();

    // Create a new PDF document for the merged result
    const mergedPdfDoc = await PDFDocument.create();

    // Process the PDF in pairs of pages
    for (let i = 0; i < totalPages; i += 2) {
      const [page1] = await mergedPdfDoc.embedPdf(croppedPdfDoc, [i]);

      let page2 = null;

      if (i + 1 < totalPages) {
        [page2] = await mergedPdfDoc.embedPdf(croppedPdfDoc, [i + 1]);
      }

      // Create a new page in the merged document
      const mergedPage = mergedPdfDoc.addPage(PageSizes.A4);

      // Draw the first page on the top half of the A4 page
      mergedPage.drawPage(page1, {
        x: 0,
        y: pageHeight / 2,
        width: pageWidth,
        height: pageHeight / 2,
      });

      // Draw the second page on the bottom half of the A4 page, if it exists
      if (page2) {
        mergedPage.drawPage(page2, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight / 2,
        });
      }
    }

    // Serialize the final merged PDF document to bytes (Uint8Array)
    const mergedPdfBytes = await mergedPdfDoc.save();

    Deno.writeFileSync(outputPdfPath, mergedPdfBytes);

    console.log(`Merged PDF saved as ${outputPdfPath}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example usage
const inputPdfPath = path.join(Deno.cwd(), "/input/labels.pdf");
const outputPdfPath = path.join(Deno.cwd(), "/output/merged_output.pdf");
// Output PDF path
mergePagesInSinglePdf(inputPdfPath, outputPdfPath);
