import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { device_uuid } = await req.json();

    if (!device_uuid) {
      return new Response(
        JSON.stringify({ error: "device_uuid is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: device, error: deviceError } = await supabase
      .from("devices")
      .select("id")
      .eq("uuid", device_uuid)
      .single();

    if (deviceError || !device) {
      return new Response(
        JSON.stringify({ error: "Device not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: commands, error: commandsError } = await supabase
      .from("commands")
      .select("*")
      .eq("device_id", device.id)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1);

    if (commandsError) {
      throw commandsError;
    }

    return new Response(
      JSON.stringify({ success: true, commands: commands }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});