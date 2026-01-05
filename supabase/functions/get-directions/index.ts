import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { origin, destination, mode = "driving" } = await req.json();
    
    // Use OSRM for free routing
    const profile = mode === "cycling" ? "bike" : mode === "walking" ? "foot" : "car";
    const osrmUrl = `https://router.project-osrm.org/route/v1/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;
    
    const response = await fetch(osrmUrl);
    if (!response.ok) throw new Error("Routing request failed");
    
    const data = await response.json();
    const route = data.routes?.[0];
    
    if (!route) throw new Error("No route found");

    const geometry = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
    const steps = route.legs?.[0]?.steps?.map((step: any) => ({
      instruction: step.maneuver?.instruction || step.name || "Continue",
      distance: `${(step.distance / 1000).toFixed(1)} km`,
      duration: `${Math.round(step.duration / 60)} min`,
    })) || [];

    return new Response(JSON.stringify({
      route: {
        distance: `${(route.distance / 1000).toFixed(1)} km`,
        duration: `${Math.round(route.duration / 60)} min`,
        geometry,
        steps,
      },
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Failed to get directions" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
