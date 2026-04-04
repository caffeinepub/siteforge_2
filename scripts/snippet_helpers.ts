// IMAGE HELPERS - INSERT BEFORE CANVAS BLOCK PREVIEWS COMMENT

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ImageUploadButton({
  onUpload,
  label = "Upload Image",
  currentSrc,
}: {
  onUpload: (src: string) => void;
  label?: string;
  currentSrc?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
        Upload {label}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              const src = await readFileAsBase64(file);
              onUpload(src);
            }
          }}
        />
      </label>
      {currentSrc && (
        <div className="relative w-full h-20 rounded overflow-hidden border border-border">
          <img src={currentSrc} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onUpload('')}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
          >
            x
          </button>
        </div>
      )}
    </div>
  );
}

function getVideoEmbedUrl(url: string): string {
  if (!url) return '';
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([-\w]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
}

const SOCIAL_ICONS: Record<string, string> = {
  twitter: "X",
  instagram: "In",
  linkedin: "Li",
  youtube: "YT",
  facebook: "f",
  tiktok: "Tk",
  github: "Gh",
};
