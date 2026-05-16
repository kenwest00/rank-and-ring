// Supabase Edge Function: sms-dispatch
// Deploy with: supabase functions deploy sms-dispatch
// Set secrets: supabase secrets set TWILIO_ACCOUNT_SID=xxx TWILIO_AUTH_TOKEN=xxx TWILIO_FROM_NUMBER=xxx

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_FROM_NUMBER = Deno.env.get("TWILIO_FROM_NUMBER");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400, headers: CORS_HEADERS });
  }

  const { name, phone, trade, trade_label } = body;

  if (!name || !phone) {
    return new Response("Missing name or phone", { status: 400, headers: CORS_HEADERS });
  }

  // Normalize phone — strip everything except digits and leading +
  const cleanPhone = phone.replace(/[^\d+]/g, "");
  const toNumber = cleanPhone.startsWith("+") ? cleanPhone : `+1${cleanPhone}`;

  // Build trade-specific SMS
  const messages = {
    HVAC: `Hey ${name} — here's what just landed in your contractor's pocket:\n\n🌡 HVAC EMERGENCY\nAC failure · Newborn in home · 94° outside\nCustomer expects callback in 30 min.\n\nThis is what YOUR customers experience when they call and you can't answer.\n\nReady to set this up? rankandring.io/book\n— Ken, Rank & Ring`,
    Plumbing: `Hey ${name} — here's what just landed in your contractor's pocket:\n\n🚨 PLUMBING EMERGENCY\nBurst pipe · Active flooding · Kitchen sink\nCustomer expects callback in 20 min.\n\nThis is what YOUR customers experience when they call and you can't answer.\n\nReady to set this up? rankandring.io/book\n— Ken, Rank & Ring`,
    Electrical: `Hey ${name} — here's what just landed in your contractor's pocket:\n\n⚡ ELECTRICAL SAFETY FLAG\nBreaker tripping · Burning smell reported\nCustomer advised not to reset breaker.\n\nThis is what YOUR customers experience when they call and you can't answer.\n\nReady to set this up? rankandring.io/book\n— Ken, Rank & Ring`,
  };

  const smsBody = messages[trade] || messages.HVAC;

  // Send via Twilio
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

  const params = new URLSearchParams();
  params.append("To", toNumber);
  params.append("From", TWILIO_FROM_NUMBER);
  params.append("Body", smsBody);

  const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

  let twilioRes;
  try {
    twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
  } catch (err) {
    console.error("Twilio fetch error:", err);
    return new Response(JSON.stringify({ error: "Failed to reach Twilio" }), {
      status: 502,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const twilioData = await twilioRes.json();

  if (!twilioRes.ok) {
    console.error("Twilio error:", twilioData);
    return new Response(JSON.stringify({ error: twilioData.message || "Twilio error" }), {
      status: twilioRes.status,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  console.log(`SMS sent to ${toNumber} for ${name} (${trade})`);

  return new Response(
    JSON.stringify({ success: true, sid: twilioData.sid }),
    { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
  );
});
