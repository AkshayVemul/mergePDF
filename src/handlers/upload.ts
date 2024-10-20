import * as path from "jsr:@std/path";
import { nanoid } from "npm:nanoid";
import { cropAndMerge } from "../core/index.ts";

export function uploadHandler(req: any, res: any) {
  const outputPdfPath = path.join(
    Deno.cwd(),
    `/output/merged_output_${nanoid(10)}.pdf`
  );

  cropAndMerge(req.file.buffer, outputPdfPath).then(() => {
    res.download(outputPdfPath, "merged_output.pdf", function () {
      Deno.remove(outputPdfPath)
        .then(() => {
          console.log(`File deleted successfully ${outputPdfPath}`);
        })
        .catch((err) => {
          console.error("FIlE NOT DELETED", err);
        });
    });
  });
}
