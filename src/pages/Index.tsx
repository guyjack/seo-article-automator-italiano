
import PostGeneratorForm from "@/components/PostGeneratorForm";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background px-0 py-4">
      <div className="w-full max-w-5xl bg-card shadow-2xl rounded-2xl p-10 flex flex-col gap-10 border border-border">
        <header className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-primary">Generatore & Pubblicatore Post WordPress</h1>
          <p className="text-muted-foreground text-lg">
            Scegli un argomento: genera un post ottimizzato SEO e pubblicalo sul tuo sito WordPress.
          </p>
        </header>
        <PostGeneratorForm />
        <footer className="text-center text-xs text-muted-foreground pt-8 border-t border-border">
          Made with ❤️ in Lovable — Non salvare mai le tue credenziali in siti non sicuri
        </footer>
      </div>
    </div>
  );
};

export default Index;
