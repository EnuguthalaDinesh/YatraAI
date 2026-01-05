import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { city, interests } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("API key not configured");

    const prompt = `Generate 6 tourist places in ${city} for someone interested in: ${interests.join(", ")}.
Return a JSON array with this exact structure (no markdown):
[{"name":"Place Name","description":"2-3 sentence description","category":"${interests[0]}","latitude":number,"longitude":number}]
Only return valid JSON array, nothing else.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error("AI request failed");
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    let places = [];
    try {
      const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
      places = JSON.parse(cleaned);
    } catch { places = []; }

    // Fetch Wikipedia images for each place
    const placesWithImages = await Promise.all(
      places.map(async (place: any, index: number) => {
        let imageUrl = "/placeholder.svg";
        try {
          const wikiRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(place.name)}`
          );
          if (wikiRes.ok) {
            const wikiData = await wikiRes.json();
            imageUrl = wikiData.thumbnail?.source || wikiData.originalimage?.source || imageUrl;
          }
        } catch {}
        return { ...place, id: `place-${index}`, imageUrl, city };
      })
    );

    return new Response(JSON.stringify({ places: placesWithImages }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate places" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
