
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";

type Props = {
  imageUrl: string | null;
  topic: string;
  category: string;
  onRegenerate: () => void;
  generating: boolean;
};

export default function ImagePreview({ imageUrl, topic, category, onRegenerate, generating }: Props) {
  const [imageLoading, setImageLoading] = useState(true);

  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${topic.toLowerCase().replace(/\s+/g, '-')}-image.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!imageUrl && !generating) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">Immagine ottimizzata SEO</h3>
        <div className="flex gap-2">
          {imageUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Scarica
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={generating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
            Rigenera
          </Button>
        </div>
      </div>
      
      <div className="rounded-lg border bg-background overflow-hidden shadow">
        {generating ? (
          <div className="aspect-square bg-muted flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-8 w-8 animate-spin" />
              <p className="text-sm">Generando immagine per "{topic}"...</p>
            </div>
          </div>
        ) : imageUrl ? (
          <div className="relative">
            {imageLoading && (
              <div className="absolute inset-0 bg-muted animate-pulse rounded" />
            )}
            <img
              src={imageUrl}
              alt={`Immagine ottimizzata SEO per: ${topic}`}
              className="w-full aspect-square object-cover"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          </div>
        ) : null}
        
        <div className="p-3 bg-muted/30">
          <p className="text-xs text-muted-foreground">
            🎨 Immagine generata AI per <strong>"{topic}"</strong> - Categoria: <strong>{category}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
