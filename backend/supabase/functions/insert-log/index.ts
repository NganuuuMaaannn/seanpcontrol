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

    const { device_uuid, command, success, message } = await req.json();

    if (!device_uuid || !command) {
      return new Response(
        JSON.stringify({ error: "device_uuid and command are required" }),
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

    const { data, error } = await supabase
      .from("logs")
      .insert({
        device_id: device.id,
        command: command,
        success: success || false,
        message: message || null,
      })
      .select();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, log: data }),
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