import { cropAndMerge } from "../core/index.ts";

export function uploadHandler(req: any, res: any) {
  cropAndMerge(req.file.buffer).then((outputPdfPath) => {
    if (!outputPdfPath) {
      return res.status(500).send("Error: Could not merge pdfs");
    }
    res.download(outputPdfPath, "merged_output.pdf");
  });
}
