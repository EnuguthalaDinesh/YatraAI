import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { city, days, budget } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("API key not configured");

    const prompt = `Create a ${days}-day travel itinerary for ${city}${budget ? ` with a budget of ${budget}` : ""}.
Return JSON only (no markdown): {"title":"Trip Title","budgetEstimate":"₹X,XXX","days":[{"day":1,"title":"Day Title","activities":["activity 1","activity 2"]}],"tips":["tip 1"]}`;

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
    const content = data.choices?.[0]?.message?.content || "{}";
    
    let itinerary = {};
    try {
      const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
      itinerary = JSON.parse(cleaned);
    } catch {}

    return new Response(JSON.stringify({ itinerary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate itinerary" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
