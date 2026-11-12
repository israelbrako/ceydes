const https = require("https");

module.exports = async function handler(req, res) {
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
    console.error("Missing env vars");
    return res.status(500).json({ success: false, error: "Missing environment variables" });
  }

  const message = `Hey Israel! Ceydes said YES! She's free on ${day} at ${time}. It's a date!`;

  const params = new URLSearchParams({
    key:       MNOTIFY_API_KEY,
    to:        ISRAEL_PHONE,
    msg:       message,
    sender_id: MNOTIFY_SENDER,
  });

  const url = `https://apps.mnotify.net/smsapi?${params.toString()}`;
  console.log("Calling mNotify for:", day, time);

  // Use Node's built-in https instead of fetch for compatibility
  const body = await new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = "";
      response.on("data", chunk => { data += chunk; });
      response.on("end", () => resolve(data));
    }).on("error", reject);
  });

  console.log("mNotify raw response:", body);

  let parsed = null;
  try { parsed = JSON.parse(body); } catch (_) {}

  const code    = parsed?.status ?? body.trim();
  const success = code === "1000" || code === 1000;

  return res.status(200).json({ success, code, raw: body });
};
