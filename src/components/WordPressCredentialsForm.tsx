
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

type Props = {
  post: { title: string; content: string; tags?: string[]; category?: string } | null;
  onCredentialsChange?: (credentials: {url: string, username: string, appPassword: string}) => void;
  loadingCategories?: boolean;
};

export default function WordPressCredentialsForm({ post, onCredentialsChange, loadingCategories }: Props) {
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const lastCredentialsRef = useRef<string>("");
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Effetto per notificare i cambiamenti delle credenziali con controlli anti-loop
  useEffect(() => {
    // Pulisce il timeout precedente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Verifica che tutti i campi siano compilati
    if (!url.trim() || !username.trim() || !appPassword.trim()) {
      return;
    }

    // Verifica che l'URL sia valido
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      if (!urlObj.protocol.startsWith('http')) {
        return;
      }
    } catch {
      return;
    }

    // Crea una stringa unica per le credenziali correnti
    const currentCredentials = `${url.trim()}|${username.trim()}|${appPassword.trim()}`;
    
    // Se le credenziali non sono cambiate, non fare nulla
    if (currentCredentials === lastCredentialsRef.current) {
      return;
    }

    // Se è già in caricamento, non fare nulla
    if (loadingCategories) {
      return;
    }

    // Salva le credenziali correnti e imposta un debounce più lungo
    timeoutRef.current = setTimeout(() => {
      lastCredentialsRef.current = currentCredentials;
      
      if (onCredentialsChange) {
        const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
        onCredentialsChange({ 
          url: normalizedUrl.trim(), 
          username: username.trim(), 
          appPassword: appPassword.trim() 
        });
      }
    }, 2000); // Debounce di 2 secondi

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [url, username, appPassword, onCredentialsChange, loadingCategories]);

  const handlePublish = async () => {
    console.log("Attempting to publish with credentials:", {
      url: `"${url}"`,
      username: `"${username}"`,
      appPassword: appPassword ? "***provided***" : "***empty***",
      urlTrimmed: `"${url.trim()}"`,
      usernameTrimmed: `"${username.trim()}"`,
      appPasswordTrimmed: appPassword.trim() ? "***provided***" : "***empty***"
    });

    if (!post) {
      toast({ title: "Genera prima un post!", variant: "destructive" });
      return;
    }

    const trimmedUrl = url.trim();
    const trimmedUsername = username.trim();
    const trimmedAppPassword = appPassword.trim();

    if (!trimmedUrl || !trimmedUsername || !trimmedAppPassword) {
      console.log("Missing fields:", {
        url: !trimmedUrl ? "MISSING" : "OK",
        username: !trimmedUsername ? "MISSING" : "OK", 
        appPassword: !trimmedAppPassword ? "MISSING" : "OK"
      });
      
      toast({ 
        title: "Completa tutti i campi delle credenziali.", 
        description: `Campi mancanti: ${[
          !trimmedUrl && "URL",
          !trimmedUsername && "Username", 
          !trimmedAppPassword && "App Password"
        ].filter(Boolean).join(", ")}`,
        variant: "destructive" 
      });
      return;
    }

    setSubmitting(true);
    // MOCK ONLY — L'invio reale necessita di backend/supabase!
    setTimeout(() => {
      toast({
        title: "Post inviato (mock)!",
        description:
          `Post "${post.title}" pubblicato nella categoria "${post.category || 'Generale'}" su WordPress (demo).`,
      });
      setSubmitting(false);
    }, 900);
  };

  return (
    <form
      className="flex flex-col gap-4 bg-muted/40 border rounded-xl p-6 shadow"
      onSubmit={e => { e.preventDefault(); handlePublish(); }}
      autoComplete="off"
    >
      <div className="font-semibold text-lg mb-1 text-primary">Credenziali WordPress</div>
      <Label htmlFor="wp-url">URL sito WordPress</Label>
      <Input
        id="wp-url"
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="https://iltuosito.it"
        autoComplete="off"
        type="url"
        required
      />
      <Label htmlFor="wp-username">Username amministratore</Label>
      <Input
        id="wp-username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="admin"
        autoComplete="current-username"
        required
      />
      <Label htmlFor="wp-app-password">Application Password</Label>
      <Input
        id="wp-app-password"
        value={appPassword}
        onChange={e => setAppPassword(e.target.value)}
        type="password"
        placeholder="App Password (WP)"
        autoComplete="new-password"
        required
      />
      
      {loadingCategories && (
        <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded p-2">
          🔄 Caricamento categorie da WordPress...
        </div>
      )}
      
      <Button
        type="submit"
        className="mt-4 font-semibold"
        disabled={submitting || !post}
      >
        {submitting ? "Sto pubblicando..." : "Pubblica su WordPress"}
      </Button>
      <div className="text-xs text-muted-foreground mt-3">
        🛈 Le credenziali NON vengono salvate o trasmesse, questa funzione è solo una demo UI. <br />
        Collega <b>Supabase</b> per un'integrazione sicura e reale.
      </div>
    </form>
  );
}
