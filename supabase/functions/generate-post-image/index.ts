
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateImageRequest {
  topic: string;
  category: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const huggingFaceToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    if (!huggingFaceToken) {
      return new Response(
        JSON.stringify({ error: 'Hugging Face token non configurato' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const { topic, category }: GenerateImageRequest = await req.json();

    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'Topic è richiesto' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Prompt semplice e ottimizzato
    const imagePrompt = `${topic}, ${category}, professional blog image, high quality`;

    console.log('Generating image with prompt:', imagePrompt);

    const hf = new HfInference(huggingFaceToken);

    // Lista di modelli da provare in ordine di preferenza
    const models = [
      'runwayml/stable-diffusion-v1-5',
      'CompVis/stable-diffusion-v1-4',
      'stabilityai/stable-diffusion-2-base'
    ];

    let image;
    let lastError;

    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);
        image = await hf.textToImage({
          inputs: imagePrompt,
          model: model,
        });
        console.log(`Success with model: ${model}`);
        break;
      } catch (error) {
        console.log(`Model ${model} failed:`, error.message);
        lastError = error;
        continue;
      }
    }

    if (!image) {
      throw new Error(`Tutti i modelli hanno fallito. Ultimo errore: ${lastError?.message}`);
    }

    // Convert the blob to a base64 string
    const arrayBuffer = await image.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const imageUrl = `data:image/png;base64,${base64}`;

    console.log('Image generated successfully');

    return new Response(JSON.stringify({ 
      imageUrl,
      prompt: imagePrompt 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in generate-post-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: `Errore generazione immagine: ${error.message}`,
        details: error.toString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
