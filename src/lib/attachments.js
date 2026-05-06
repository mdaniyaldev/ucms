import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { supabase, getCurrentUser } from "./supabase";

const FILE_BUCKET = "complaint-evidence";
const VIDEO_BUCKET = "complaint-video-evidence";

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PDF_MIME_TYPES = ["application/pdf"];
const VIDEO_INPUT_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const MAX_IMAGE_PDF_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_OUTPUT_SIZE = 3 * 1024 * 1024; // final uploaded video must be <= 3MB
const MAX_VIDEO_INPUT_SIZE = 25 * 1024 * 1024; // raw input allowed for local compression

let ffmpegPromise = null;

function sanitizeFileName(name) {
  return String(name).replace(/[^\w.-]/g, "_");
}

function getAttachmentKind(file) {
  if (IMAGE_MIME_TYPES.includes(file.type)) return "image";
  if (PDF_MIME_TYPES.includes(file.type)) return "pdf";
  if (VIDEO_INPUT_TYPES.includes(file.type)) return "video";
  throw new Error(`${file.name} is not a supported file type`);
}

function getBucketName(kind) {
  return kind === "video" ? VIDEO_BUCKET : FILE_BUCKET;
}

function replaceExtension(name, newExt) {
  const base = name.replace(/\.[^/.]+$/, "");
  return `${base}.${newExt}`;
}

function getInputExtension(file) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName) return fromName;
  if (file.type === "video/quicktime") return "mov";
  if (file.type === "video/webm") return "webm";
  return "mp4";
}

async function getFFmpeg() {
  if (ffmpegPromise) return ffmpegPromise;

  ffmpegPromise = (async () => {
    const ffmpeg = new FFmpeg();
    const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });

    return ffmpeg;
  })();

  return ffmpegPromise;
}

async function transcodeToMp4(ffmpeg, inputName, outputName, { width, fps, crf }) {
  await ffmpeg.exec([
    "-i",
    inputName,
    "-vf",
    `scale='min(${width},iw)':-2,fps=${fps}`,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    String(crf),
    "-an",
    "-movflags",
    "+faststart",
    "-y",
    outputName,
  ]);

  const data = await ffmpeg.readFile(outputName);
  return new Blob([data], { type: "video/mp4" });
}

async function compressVideo(file) {
  if (file.size <= MAX_VIDEO_OUTPUT_SIZE && file.type === "video/mp4") {
    return file;
  }

  if (file.size > MAX_VIDEO_INPUT_SIZE) {
    throw new Error(
      `${file.name} is too large for browser compression. Keep raw video under 25MB.`
    );
  }

  const ffmpeg = await getFFmpeg();
  const inputExt = getInputExtension(file);
  const inputName = `input.${inputExt}`;
  const outputName = "output.mp4";

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  let blob = await transcodeToMp4(ffmpeg, inputName, outputName, {
    width: 854,
    fps: 24,
    crf: 32,
  });

  if (blob.size > MAX_VIDEO_OUTPUT_SIZE) {
    blob = await transcodeToMp4(ffmpeg, inputName, outputName, {
      width: 640,
      fps: 20,
      crf: 36,
    });
  }

  if (blob.size > MAX_VIDEO_OUTPUT_SIZE) {
    throw new Error(
      `${file.name} is still too large after compression. Keep videos very short (preferably 10–15 seconds).`
    );
  }

  return new File([blob], replaceExtension(file.name, "mp4"), {
    type: "video/mp4",
    lastModified: Date.now(),
  });
}

export function validateEvidenceFiles(files) {
  const fileList = Array.from(files || []);
  const videoCount = fileList.filter((file) => getAttachmentKind(file) === "video").length;

  if (videoCount > 1) {
    throw new Error("Only one video is allowed per complaint");
  }

  for (const file of fileList) {
    const kind = getAttachmentKind(file);

    if (kind === "video") {
      if (file.size > MAX_VIDEO_INPUT_SIZE) {
        throw new Error(`${file.name} exceeds raw 25MB limit for browser compression`);
      }
    } else {
      if (file.size > MAX_IMAGE_PDF_SIZE) {
        throw new Error(`${file.name} exceeds 5MB size limit`);
      }
    }
  }
}

export async function uploadComplaintAttachments({ complaintId, files }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  if (!complaintId) throw new Error("complaintId is required");

  const fileList = Array.from(files || []);
  if (fileList.length === 0) return [];

  validateEvidenceFiles(fileList);

  const preparedFiles = [];

  for (const originalFile of fileList) {
    const kind = getAttachmentKind(originalFile);
    const processedFile =
      kind === "video" ? await compressVideo(originalFile) : originalFile;

    preparedFiles.push({
      originalFile,
      processedFile,
      kind,
      bucketName: getBucketName(kind),
    });
  }

  const uploadedObjects = [];

  try {
    for (const item of preparedFiles) {
      const safeName = sanitizeFileName(item.processedFile.name);
      const filePath = `${user.id}/${complaintId}/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(item.bucketName)
        .upload(filePath, item.processedFile, {
          upsert: false,
          contentType: item.processedFile.type,
        });

      if (uploadError) throw uploadError;

      uploadedObjects.push({
        complaint_id: complaintId,
        uploaded_by: user.id,
        bucket_name: item.bucketName,
        file_path: filePath,
        original_name: item.originalFile.name,
        file_type: item.kind,
        mime_type: item.processedFile.type,
        file_size: item.processedFile.size,
      });
    }

    const { data, error } = await supabase
      .from("complaint_attachments")
      .insert(uploadedObjects)
      .select();

    if (error) throw error;

    return data;
  } catch (error) {
    await Promise.allSettled(
      uploadedObjects.map((obj) =>
        supabase.storage.from(obj.bucket_name).remove([obj.file_path])
      )
    );
    throw error;
  }
}

export async function listComplaintAttachments(complaintId) {
  const { data, error } = await supabase
    .from("complaint_attachments")
    .select("*")
    .eq("complaint_id", complaintId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getSignedAttachmentUrl(attachment, expiresIn = 60) {
  const { data, error } = await supabase.storage
    .from(attachment.bucket_name)
    .createSignedUrl(attachment.file_path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}