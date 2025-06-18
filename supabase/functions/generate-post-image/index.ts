
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

    // Prompt ottimizzato e più semplice
    const imagePrompt = `${topic}, modern blog image, professional, high quality`;

    console.log('Generating image with prompt:', imagePrompt);

    const hf = new HfInference(huggingFaceToken);

    // Proviamo con modelli più recenti e affidabili
    const models = [
      'stabilityai/stable-diffusion-xl-base-1.0',
      'runwayml/stable-diffusion-v1-5',
      'CompVis/stable-diffusion-v1-4'
    ];

    let image;
    let lastError;

    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);
        
        const response = await hf.textToImage({
          inputs: imagePrompt,
          model: model,
          parameters: {
            num_inference_steps: 20,
            guidance_scale: 7.5,
            width: 512,
            height: 512
          }
        });
        
        console.log(`Success with model: ${model}`);
        image = response;
        break;
      } catch (error) {
        console.log(`Model ${model} failed:`, error.message);
        lastError = error;
        continue;
      }
    }

    if (!image) {
      console.error('All models failed, last error:', lastError);
      return new Response(
        JSON.stringify({ 
          error: 'Impossibile generare immagine al momento',
          details: 'Tutti i modelli di generazione immagini sono temporaneamente non disponibili. Riprova più tardi.',
          lastError: lastError?.message 
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
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
