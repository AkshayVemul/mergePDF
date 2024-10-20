import { PageSizes, PDFDocument } from "npm:pdf-lib";

export async function cropAndMerge(
  inputPdfBuffer: Uint8Array,
  outputPdfPath: string
) {
  const pageHeight = PageSizes.A4[1];
  const pageWidth = PageSizes.A4[0];

  try {
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
    for (let index = 0; index < totalPages; index += 2) {
      const [page1] = await mergedPdfDoc.embedPdf(croppedPdfDoc, [index]);

      let page2 = null;

      if (index + 1 < totalPages) {
        [page2] = await mergedPdfDoc.embedPdf(croppedPdfDoc, [index + 1]);
      }

      // Create a new page in the merged document
      const mergedPage = mergedPdfDoc.addPage(PageSizes.A4);

      mergedPage.drawPage(page1, {
        x: 0,
        y: pageHeight / 2,
        width: pageWidth,
        height: pageHeight / 2,
      });

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
  } catch (error) {
    console.error("Error:", error);
  }
}
