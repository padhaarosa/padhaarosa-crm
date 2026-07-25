import { FileDown } from "lucide-react";

/**
 * Plain link to the PDF endpoint — the browser downloads the generated file
 * directly (no fetch/blob JS, so it can never silently fail).
 * Default size fits the page exactly to the document; append &size=a4 for A4.
 */
export function DownloadPdfButton({ path, name }: { path: string; name: string }) {
  const href = `/api/pdf?path=${encodeURIComponent(path)}&name=${encodeURIComponent(name)}`;
  return (
    <a href={href} download={`${name}.pdf`} className="btn-primary btn-sm sm:text-sm sm:px-4 sm:py-2.5">
      <FileDown className="h-4 w-4" /> Download PDF
    </a>
  );
}
