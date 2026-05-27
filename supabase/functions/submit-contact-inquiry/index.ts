import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      name,
      email,
      phone,
      service,
      budget,
      type,
      timeline,
      message,
      verification_token,
    } = await req.json();

    if (!name || !email || !message || !verification_token) {
      return new Response(
        JSON.stringify({ error: "Missing required fields." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate the verification token
    const { data: otpRow, error: tokenError } = await supabase
      .from("contact_otps")
      .select("*")
      .eq("email", email)
      .eq("token", verification_token)
      .eq("verified", true)
      .eq("used", false)
      .single();

    if (tokenError || !otpRow) {
      return new Response(
        JSON.stringify({ error: "Verification token is invalid or already used." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert inquiry (phone is optional — null if not provided)
    const { error: insertError } = await supabase.from("inquiries").insert([{
      name,
      email,
      phone: phone || null,
      service: service || null,
      budget: budget || null,
      type: type || null,
      timeline: timeline || null,
      message,
      verified: true,
    }]);

    if (insertError) throw insertError;

    // Mark OTP row as used so token can't be reused
    await supabase
      .from("contact_otps")
      .update({ used: true })
      .eq("id", otpRow.id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Something went wrong." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});