
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

    // Crea un prompt ottimizzato SEO per l'immagine
    const imagePrompt = `Professional blog post header image for "${topic}" in ${category} category. Clean, modern design with vibrant colors, high quality, web-optimized, suitable for WordPress blog post. No text overlay, photorealistic style, engaging and clickable.`;

    console.log('Generating image with Hugging Face prompt:', imagePrompt);

    const hf = new HfInference(huggingFaceToken);

    const image = await hf.textToImage({
      inputs: imagePrompt,
      model: 'black-forest-labs/FLUX.1-schnell',
    });

    // Convert the blob to a base64 string
    const arrayBuffer = await image.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const imageUrl = `data:image/png;base64,${base64}`;

    console.log('Image generated successfully with Hugging Face');

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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
