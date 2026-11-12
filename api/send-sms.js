export default async function handler(req, res) {
  // Only allow POST
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

  const message = `Hey Israel! 🍦 Ceydes said YES! She's free on ${day} at ${time}. It's a date! ♡`;

  const url = `https://apps.mnotify.net/smsapi?key=${MNOTIFY_API_KEY}` +
              `&to=${ISRAEL_PHONE}` +
              `&msg=${encodeURIComponent(message)}` +
              `&sender_id=${encodeURIComponent(MNOTIFY_SENDER)}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    return res.status(200).json({ success: true, raw: text });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
