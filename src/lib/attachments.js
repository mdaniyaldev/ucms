import { supabase, getCurrentUser } from "./supabase";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateEvidenceFiles(files) {
  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(`${file.name} is not a supported file type`);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`${file.name} exceeds 5MB size limit`);
    }
  }
}

function sanitizeFileName(name) {
  return String(name).replace(/[^\w.-]/g, "_");
}

export async function uploadComplaintAttachments({ complaintId, files }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  if (!complaintId) throw new Error("complaintId is required");
  if (!files || files.length === 0) return [];

  validateEvidenceFiles(files);

  const attachmentRows = [];

  for (const file of files) {
    const safeName = sanitizeFileName(file.name);
    const filePath = `complaints/${complaintId}/${user.id}-${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("complaint-evidence")
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    attachmentRows.push({
      complaint_id: complaintId,
      uploaded_by: user.id,
      bucket_name: "complaint-evidence",
      file_path: filePath,
      original_name: file.name,
      file_type: file.type === "application/pdf" ? "pdf" : "image",
      mime_type: file.type,
      file_size: file.size,
    });
  }

  const { data, error } = await supabase
    .from("complaint_attachments")
    .insert(attachmentRows)
    .select();

  if (error) throw error;

  return data;
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

export async function getSignedAttachmentUrl(filePath, expiresIn = 60) {
  const { data, error } = await supabase.storage
    .from("complaint-evidence")
    .createSignedUrl(filePath, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}