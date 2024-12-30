// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Add these constants
const CLIENT_ID = "VWJxTEg1Q1J5ZWRTRzVCRm43SWg6MTpjaQ";
const CODE_VERIFIER = "bWXJAKwcLcdm-Km9UoLF4uKquOOkV67cuAp06TbcMIGKYTG7kY5WuvUmqc50LXFebOajVIt7qtPLjv3VWcqvximsnzMPxkYaZX9EyWEcGWOs9RzxuUkhhKBGiA0QjBy8";
const REDIRECT_URI_CALLBACK = "https://www.google.com";
const TWITTER_ACCESS_TOKEN_EXCHANGE_URL = "https://api.twitter.com/2/oauth2/token";

async function exchangeCodeForToken(code: string) {
  try {
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    params.append('client_id', CLIENT_ID);
    params.append('redirect_uri', REDIRECT_URI_CALLBACK);
    params.append('code_verifier', CODE_VERIFIER);

    const response = await fetch(TWITTER_ACCESS_TOKEN_EXCHANGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Token exchange response:', data);
    return data;
  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
}

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const state = url.searchParams.get('state');
    const code = url.searchParams.get('code');

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'No code provided' }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const tokenData = await exchangeCodeForToken(code);

    return new Response(
      JSON.stringify({
        state,
        accessToken: tokenData.access_token,
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
        scope: tokenData.scope,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/supabase-twit' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
