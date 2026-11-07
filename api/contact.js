/* Vercel serverless function: POST /api/contact
 *
 * Required environment variables (set in Vercel → Project → Settings → Environment Variables):
 *   RESEND_API_KEY       API key from https://resend.com
 *   CONTACT_TO_EMAIL     Inbox that should receive messages
 *   CONTACT_FROM_EMAIL   Verified sender, e.g. "Portfolio <hello@yourdomain.com>"
 *
 * Optional:
 *   CONTACT_WEBHOOK_URL  Any HTTPS endpoint (Zapier, Make, Google Apps Script,
 *                        Airtable, etc.) that should also receive the message as JSON.
 *
 * If neither Resend nor a webhook is configured the endpoint returns a clear
 * 503 so the frontend can offer the direct-email fallback.
 */

"use strict";

var RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
var RATE_LIMIT_MAX = 6;
var rateLimit = new Map();

var ALLOWED_SUBJECTS = [
  "Job opportunity",
  "Project enquiry",
  "General question",
  "Something else"
];

function send(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise(function (resolve, reject) {
    if (req.body && typeof req.body === "object") {
      resolve(req.body);
      return;
    }

    if (typeof req.body === "string" && req.body.length) {
      try {
        resolve(JSON.parse(req.body));
      } catch (error) {
        resolve(parseFormBody(req.body));
      }
      return;
    }

    var chunks = [];
    var size = 0;

    req.on("data", function (chunk) {
      size += chunk.length;
      if (size > 100 * 1024) {
        reject(new Error("Payload too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", function () {
      var raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve({});
        return;
      }

      var contentType = String(req.headers["content-type"] || "");
      if (contentType.indexOf("application/json") !== -1) {
        try {
          resolve(JSON.parse(raw));
        } catch (error) {
          reject(new Error("Invalid JSON"));
        }
        return;
      }

      resolve(parseFormBody(raw));
    });

    req.on("error", reject);
  });
}

function parseFormBody(raw) {
  var result = {};
  new URLSearchParams(raw).forEach(function (value, key) {
    result[key] = value;
  });
  return result;
}

function clean(value, maxLength) {
  return String(value == null ? "" : value)
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getClientIp(req) {
  var forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return String(forwarded).split(",")[0].trim();
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

function isRateLimited(ip) {
  var now = Date.now();
  var entry = rateLimit.get(ip);

  if (!entry || now - entry.start > RATE_LIMIT_WINDOW_MS) {
    rateLimit.set(ip, { start: now, count: 1 });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function validate(payload) {
  var name = clean(payload.name, 100);
  var email = clean(payload.email, 180);
  var subject = clean(payload.subject, 120);
  var message = clean(payload.message, 5000);
  var company = clean(payload.company, 200);
  var page = clean(payload.page, 500);

  if (company) {
    return { spam: true };
  }

  if (name.length < 2) {
    return { error: "Please add your name." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { error: "Please use a valid email address." };
  }

  if (ALLOWED_SUBJECTS.indexOf(subject) === -1) {
    return { error: "Please choose a valid subject." };
  }

  if (message.length < 10) {
    return { error: "Please add a little more detail to your message." };
  }

  var linkCount = (message.match(/https?:\/\//gi) || []).length;
  if (linkCount > 4) {
    return { error: "That message looks like spam. Please email me directly." };
  }

  return {
    data: {
      name: name,
      email: email,
      subject: subject,
      message: message,
      page: page,
      submittedAt: new Date().toISOString()
    }
  };
}

function buildEmail(data) {
  var lines = [
    "New message from the portfolio contact form",
    "",
    "Name: " + data.name,
    "Email: " + data.email,
    "Subject: " + data.subject,
    "Sent: " + data.submittedAt,
    data.page ? "Page: " + data.page : null,
    "",
    "Message:",
    data.message
  ].filter(function (line) {
    return line !== null;
  });

  var text = lines.join("\n");
  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111">' +
    '<h2 style="margin:0 0 16px">New portfolio message</h2>' +
    "<p><strong>Name:</strong> " +
    escapeHtml(data.name) +
    "<br><strong>Email:</strong> " +
    escapeHtml(data.email) +
    "<br><strong>Subject:</strong> " +
    escapeHtml(data.subject) +
    "<br><strong>Sent:</strong> " +
    escapeHtml(data.submittedAt) +
    "</p>" +
    '<div style="margin-top:20px;padding:16px;border-left:3px solid #fbba42;background:#fafafa;white-space:pre-wrap">' +
    escapeHtml(data.message) +
    "</div></div>";

  return { text: text, html: html };
}

async function sendWithResend(data) {
  var apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: true };

  var to = process.env.CONTACT_TO_EMAIL || "sourabhkumbhar7047@gmail.com";
  var from =
    process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>";
  var email = buildEmail(data);

  var response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: from,
      to: [to],
      reply_to: data.email,
      subject: "[Portfolio] " + data.subject + " — " + data.name,
      text: email.text,
      html: email.html
    })
  });

  if (!response.ok) {
    var detail = await response.text().catch(function () {
      return "";
    });
    throw new Error("Resend rejected the message: " + response.status + " " + detail);
  }

  return { skipped: false };
}

async function sendWithWebhook(data) {
  var url = process.env.CONTACT_WEBHOOK_URL;
  if (!url) return { skipped: true };

  var response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "portfolio-contact",
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      page: data.page,
      submittedAt: data.submittedAt
    })
  });

  if (!response.ok) {
    throw new Error("Webhook rejected the message: " + response.status);
  }

  return { skipped: false };
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Allow", "POST, OPTIONS");
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    send(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  var ip = getClientIp(req);
  if (isRateLimited(ip)) {
    send(res, 429, {
      ok: false,
      message: "Too many messages. Please try again in a few minutes."
    });
    return;
  }

  var payload;
  try {
    payload = await readBody(req);
  } catch (error) {
    send(res, 400, { ok: false, message: "The form could not be read." });
    return;
  }

  var checked = validate(payload || {});

  if (checked.spam) {
    /* Pretend everything is fine so bots do not learn the honeypot. */
    send(res, 200, { ok: true });
    return;
  }

  if (checked.error) {
    send(res, 422, { ok: false, message: checked.error });
    return;
  }

  var data = checked.data;
  var hasEmail = Boolean(process.env.RESEND_API_KEY);
  var hasWebhook = Boolean(process.env.CONTACT_WEBHOOK_URL);

  if (!hasEmail && !hasWebhook) {
    send(res, 503, {
      ok: false,
      message:
        "The contact form is not configured yet. Please email me directly at sourabhkumbhar7047@gmail.com."
    });
    return;
  }

  var emailResult = { skipped: true };
  var webhookResult = { skipped: true };
  var failures = [];

  if (hasEmail) {
    try {
      emailResult = await sendWithResend(data);
    } catch (error) {
      failures.push("email");
      console.error("[contact] Resend error:", error.message);
    }
  }

  if (hasWebhook) {
    try {
      webhookResult = await sendWithWebhook(data);
    } catch (error) {
      failures.push("webhook");
      console.error("[contact] Webhook error:", error.message);
    }
  }

  var delivered =
    (hasEmail && !emailResult.skipped) || (hasWebhook && !webhookResult.skipped);

  if (!delivered) {
    send(res, 502, {
      ok: false,
      message:
        "The message could not be delivered right now. Please email me directly at sourabhkumbhar7047@gmail.com."
    });
    return;
  }

  send(res, 200, {
    ok: true,
    message: "Thanks — your message has been sent.",
    stored: Boolean(hasWebhook && !webhookResult.skipped),
    failures: failures
  });
};
