import express from "npm:express";
import multer from "npm:multer";
import { uploadHandler } from "./handlers/upload.ts";

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static("src/website"));

app.post("/upload", upload.single("file-to-merge"), uploadHandler);

app.listen(8080, () => {
  console.log("Server is running on port 8080 ---> ", "http://localhost:8080/");
});
