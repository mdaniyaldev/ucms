import { useState } from "react";
import { getSignedAttachmentUrl } from "../../lib/attachments";
import { Paperclip, Loader2, FileText, Image as ImageIcon, Video, ExternalLink } from "lucide-react";

export function AttachmentsList({ attachments }) {
  const [loadingId, setLoadingId] = useState(null);

  if (!attachments || attachments.length === 0) return null;

  const handleOpen = async (attachment) => {
    try {
      setLoadingId(attachment.id);
      const url = await getSignedAttachmentUrl(attachment);
      window.open(url, "_blank");
    } catch (err) {
      console.error("Failed to open attachment:", err);
      alert("Failed to open attachment.");
    } finally {
      setLoadingId(null);
    }
  };

  const getIcon = (type) => {
    if (type === "image") return <ImageIcon className="w-4 h-4 text-blue-500" />;
    if (type === "video") return <Video className="w-4 h-4 text-purple-500" />;
    return <FileText className="w-4 h-4 text-rose-500" />;
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
        <Paperclip className="w-4 h-4" /> Attachments ({attachments.length})
      </h4>
      <div className="flex flex-wrap gap-2">
        {attachments.map((att) => (
          <button
            key={att.id}
            onClick={() => handleOpen(att)}
            disabled={loadingId === att.id}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-md text-sm transition-colors border border-slate-200 dark:border-slate-700 disabled:opacity-50"
            title={att.original_name}
          >
            {getIcon(att.file_type)}
            <span className="truncate max-w-[150px] text-slate-700 dark:text-slate-300 text-xs">
              {att.original_name}
            </span>
            {loadingId === att.id ? (
              <Loader2 className="w-3 h-3 animate-spin text-slate-400 ml-1" />
            ) : (
              <ExternalLink className="w-3 h-3 text-slate-400 ml-1" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
