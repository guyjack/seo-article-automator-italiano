
import { useState } from "react";
import PostPreview from "./PostPreview";
import WordPressCredentialsForm from "./WordPressCredentialsForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

type GeneratedPost = {
  title: string;
  content: string;
  tags?: string[];
};

const sampleSEOPost = (topic: string): GeneratedPost => ({
  title: `Come ottimizzare "${topic}" per la SEO`,
  content:
    `Scopri le migliori strategie per migliorare il posizionamento del tuo sito su "${topic}". ` +
    "Analisi parole chiave, contenuti originali e tecniche avanzate per battere la concorrenza su Google.",
  tags: ["SEO", topic],
});

export default function PostGeneratorForm() {
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [post, setPost] = useState<GeneratedPost | null>(null);

  function handleGenerate() {
    if (!topic.trim()) {
      toast({ title: "Inserisci un argomento valido.", variant: "destructive" });
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      setPost(sampleSEOPost(topic.trim()));
      setGenerating(false);
      toast({ title: "Post generato!", description: "Ecco l'anteprima qui sotto." });
    }, 700);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <section className="flex flex-col gap-6">
        <div>
          <Label htmlFor="topic" className="text-lg font-semibold">
            Argomento <span className="text-destructive">*</span>
          </Label>
          <Input
            id="topic"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Es. Marketing digitale, Cucina vegana…"
            className="mt-1"
            autoFocus
          />
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generating || !topic.trim()}
          className="w-fit px-8 py-2 mt-2"
        >
          {generating ? "Sto generando..." : "Genera post ottimizzato SEO"}
        </Button>
        <div className="border-t border-muted pt-4 text-muted-foreground text-xs">
          L’ottimizzazione SEO sarà effettuata automaticamente (titolo, contenuto, tag).
        </div>
        <div className="hidden md:block">
          {post && (
            <>
              <div className="font-semibold mt-6 mb-2 text-primary">Anteprima post</div>
              <PostPreview post={post} />
            </>
          )}
        </div>
      </section>
      <section className="flex flex-col gap-6">
        <WordPressCredentialsForm post={post} />
        <div className="md:hidden mt-6">
          {post && (
            <>
              <div className="font-semibold mb-2 text-primary">Anteprima post</div>
              <PostPreview post={post} />
            </>
          )}
        </div>
      </section>
    </div>
  );
}
