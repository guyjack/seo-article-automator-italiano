import { useState, useEffect } from "react";
import PostPreview from "./PostPreview";
import WordPressCredentialsForm from "./WordPressCredentialsForm";
import ImagePreview from "./ImagePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type GeneratedPost = {
  title: string;
  content: string;
  tags?: string[];
  category: string;
  imageUrl?: string;
};

type WordPressCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

const sampleSEOPost = (topic: string, category: string): GeneratedPost => ({
  title: `Come ottimizzare "${topic}" per la SEO`,
  content:
    `Scopri le migliori strategie per migliorare il posizionamento del tuo sito su "${topic}". ` +
    "Analisi parole chiave, contenuti originali e tecniche avanzate per battere la concorrenza su Google.",
  tags: ["SEO", topic],
  category: category,
});

const defaultCategories = [
  "Generale",
  "Marketing",
  "Tecnologia", 
  "Business",
  "Lifestyle",
  "Salute",
  "Viaggi",
  "Cucina",
  "Sport",
  "Moda"
];

export default function PostGeneratorForm() {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("");
  const [generating, setGenerating] = useState(false);
  const [post, setPost] = useState<GeneratedPost | null>(null);
  const [wpCategories, setWpCategories] = useState<WordPressCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [wpCredentials, setWpCredentials] = useState<{url: string, username: string, appPassword: string} | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [lastSuccessfulCredentials, setLastSuccessfulCredentials] = useState<string>("");

  const handleLoadWpCategories = async (credentials: {url: string, username: string, appPassword: string}) => {
    if (!credentials.url || !credentials.username || !credentials.appPassword) {
      return;
    }

    // Crea una stringa unica per le credenziali
    const credentialsKey = `${credentials.url}|${credentials.username}|${credentials.appPassword}`;
    
    // Se le credenziali sono le stesse dell'ultima richiesta riuscita, non fare nulla
    if (credentialsKey === lastSuccessfulCredentials) {
      console.log("Categorie già caricate per queste credenziali, saltando richiesta");
      return;
    }

    // Se è già in caricamento, non fare nulla
    if (loadingCategories) {
      console.log("Caricamento già in corso, saltando richiesta");
      return;
    }

    console.log("Inizio caricamento categorie WordPress");
    setLoadingCategories(true);
    setWpCredentials(credentials);

    try {
      const { data, error } = await supabase.functions.invoke('get-wordpress-categories', {
        body: credentials
      });

      if (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: "Errore nel recupero categorie",
          description: "Impossibile recuperare le categorie da WordPress. Verifica le credenziali.",
          variant: "destructive"
        });
        setWpCategories([]);
        return;
      }

      if (data?.categories) {
        setWpCategories(data.categories);
        setLastSuccessfulCredentials(credentialsKey); // Salva le credenziali di successo
        toast({
          title: "Categorie caricate!",
          description: `${data.categories.length} categorie trovate dal tuo sito WordPress.`
        });
        // Reset della categoria selezionata quando si caricano nuove categorie
        setCategory("");
        console.log("Categorie caricate con successo:", data.categories.length);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore di connessione",
        description: "Errore nella connessione a WordPress.",
        variant: "destructive"
      });
      setWpCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const generateImage = async (topicValue: string, categoryValue: string) => {
    // Generazione immagini temporaneamente disabilitata
    toast({
      title: "Generazione immagini disabilitata",
      description: "La generazione di immagini è temporaneamente non disponibile. Il post sarà creato senza immagine.",
      variant: "default"
    });
    return null;
  };

  async function handleGenerate() {
    if (!topic.trim()) {
      toast({ title: "Inserisci un argomento valido.", variant: "destructive" });
      return;
    }
    if (!category) {
      toast({ title: "Seleziona una categoria.", variant: "destructive" });
      return;
    }
    setGenerating(true);
    
    setTimeout(async () => {
      const generatedPost = sampleSEOPost(topic.trim(), category);
      setPost(generatedPost);
      setGenerating(false);
      toast({ 
        title: "Post generato!", 
        description: "Post generato con successo (immagine temporaneamente non disponibile)."
      });
    }, 700);
  }

  const handleRegenerateImage = async () => {
    toast({
      title: "Generazione immagini disabilitata",
      description: "La generazione di immagini è temporaneamente non disponibile.",
      variant: "default"
    });
  };

  const availableCategories = wpCategories.length > 0 ? wpCategories : defaultCategories;
  const categoryDisplayName = (cat: any) => typeof cat === 'string' ? cat : cat.name;
  const categoryValue = (cat: any) => typeof cat === 'string' ? cat : cat.name;

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
        
        <div>
          <Label htmlFor="category" className="text-lg font-semibold">
            Categoria <span className="text-destructive">*</span>
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={
                loadingCategories 
                  ? "Caricamento categorie..." 
                  : wpCategories.length > 0 
                    ? "Seleziona una categoria WordPress" 
                    : "Seleziona una categoria"
              } />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map((cat, index) => (
                <SelectItem key={typeof cat === 'string' ? cat : cat.id} value={categoryValue(cat)}>
                  {categoryDisplayName(cat)}
                  {typeof cat !== 'string' && cat.count > 0 && (
                    <span className="text-muted-foreground ml-2">({cat.count})</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {wpCategories.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              ✅ Categorie caricate dal tuo sito WordPress
            </div>
          )}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating || !topic.trim() || !category}
          className="w-fit px-8 py-2 mt-2"
        >
          {generating ? "Sto generando..." : "Genera post ottimizzato SEO"}
        </Button>
        
        <div className="border-t border-muted pt-4 text-muted-foreground text-xs">
          L'ottimizzazione SEO sarà effettuata automaticamente (titolo, contenuto, tag).
          <br />
          ⚠️ Generazione immagini temporaneamente disabilitata per problemi tecnici.
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
        <WordPressCredentialsForm 
          post={post} 
          onCredentialsChange={handleLoadWpCategories}
          loadingCategories={loadingCategories}
        />
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
