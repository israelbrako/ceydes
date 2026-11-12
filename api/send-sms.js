export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { day, time } = req.body;
  if (!day || !time) {
    return res.status(400).json({ error: "Missing day or time" });
  }

  const MNOTIFY_API_KEY = process.env.MNOTIFY_API_KEY;
  const MNOTIFY_SENDER  = process.env.MNOTIFY_SENDER;
  const ISRAEL_PHONE    = process.env.ISRAEL_PHONE;

  if (!MNOTIFY_API_KEY || !MNOTIFY_SENDER || !ISRAEL_PHONE) {
    console.error("Missing env vars:", {
      hasKey: !!MNOTIFY_API_KEY,
      hasSender: !!MNOTIFY_SENDER,
      hasPhone: !!ISRAEL_PHONE
    });
    return res.status(500).json({ success: false, error: "Missing environment variables" });
  }

  const message = `Hey Israel! Ceydes said YES! She's free on ${day} at ${time}. It's a date!`;

  // mNotify SMS API endpoint
  const params = new URLSearchParams({
    key: MNOTIFY_API_KEY,
    to: ISRAEL_PHONE,
    msg: message,
    sender_id: MNOTIFY_SENDER,
  });

  const url = `https://apps.mnotify.net/smsapi?${params.toString()}`;

  console.log("Calling mNotify URL (key redacted):", url.replace(MNOTIFY_API_KEY, "***"));

  try {
    const response = await fetch(url);
    const text = await response.text();
    console.log("mNotify raw response:", text, "| HTTP status:", response.status);

    // mNotify returns a JSON object like {"status":"1000","message":"..."}
    // or a plain code like "1000"
    let parsed = null;
    try { parsed = JSON.parse(text); } catch (_) {}

    const code = parsed?.status ?? text.trim();
    // 1000 = success per mNotify docs
    const success = code === "1000" || code === 1000;

    return res.status(200).json({ success, code, raw: text });
  } catch (err) {
    console.error("Fetch error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
