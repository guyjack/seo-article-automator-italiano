
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GetCategoriesRequest {
  url: string;
  username: string;
  appPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, username, appPassword }: GetCategoriesRequest = await req.json();

    if (!url || !username || !appPassword) {
      return new Response(
        JSON.stringify({ error: 'URL, username e app password sono richiesti' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Costruisce l'URL per le API REST di WordPress
    const apiUrl = `${url.replace(/\/$/, '')}/wp-json/wp/v2/categories`;
    
    // Crea le credenziali per l'autenticazione Basic
    const credentials = btoa(`${username}:${appPassword}`);

    console.log('Fetching categories from:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('WordPress API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ 
          error: `Errore API WordPress: ${response.status} ${response.statusText}` 
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const categories = await response.json();
    
    // Filtra e mappa le categorie per restituire solo i dati necessari
    const filteredCategories = categories
      .filter((cat: any) => cat.name !== 'Uncategorized') // Esclude "Senza categoria"
      .map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        count: cat.count
      }));

    console.log('Categories fetched successfully:', filteredCategories.length);

    return new Response(JSON.stringify({ categories: filteredCategories }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in get-wordpress-categories function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
