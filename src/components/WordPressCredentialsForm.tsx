
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

type Props = {
  post: { title: string; content: string; tags?: string[]; category?: string } | null;
};

export default function WordPressCredentialsForm({ post }: Props) {
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePublish = async () => {
    if (!post) {
      toast({ title: "Genera prima un post!", variant: "destructive" });
      return;
    }
    if (!url || !username || !appPassword) {
      toast({ title: "Completa tutti i campi delle credenziali.", variant: "destructive" });
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
