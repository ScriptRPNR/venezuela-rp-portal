const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 3000);
const CLIENT_ID = "1547402928971710494";
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || `http://localhost:${PORT}/auth/discord/callback`;
const HTML_FILE = path.join(__dirname, "index.html");

if (!CLIENT_SECRET) {
  console.error("Falta DISCORD_CLIENT_SECRET. Configúralo antes de iniciar el servidor.");
  process.exit(1);
}

function send(res, status, contentType, body) {
  res.writeHead(status, { "Content-Type": contentType, "Cache-Control": "no-store" });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://localhost:${PORT}`);

  if (requestUrl.pathname === "/auth/discord/start") {
    const authorizationUrl = new URL("https://discord.com/oauth2/authorize");
    authorizationUrl.search = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      scope: "identify email"
    }).toString();
    res.writeHead(302, { Location: authorizationUrl.toString() });
    return res.end();
  }

  if (requestUrl.pathname === "/auth/discord/callback") {
    const code = requestUrl.searchParams.get("code");
    if (!code) return send(res, 400, "text/plain; charset=utf-8", "Falta el codigo de Discord.");

    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI
    });

    try {
      const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
      });
      if (!tokenResponse.ok) {
        return send(res, 502, "text/plain; charset=utf-8", "Discord rechazo el codigo de autenticacion.");
      }

      const tokenData = await tokenResponse.json();
      const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `${tokenData.token_type} ${tokenData.access_token}` }
      });
      if (!userResponse.ok) {
        return send(res, 502, "text/plain; charset=utf-8", "No se pudo obtener el usuario de Discord.");
      }

      res.writeHead(302, { Location: "/?authenticated=1" });
      return res.end();
    } catch (error) {
      return send(res, 502, "text/plain; charset=utf-8", `Error conectando con Discord: ${error.message}`);
    }
  }

  if (requestUrl.pathname === "/" || requestUrl.pathname === "/VenezuelaRP-portal.html") {
    try {
      const html = fs.readFileSync(HTML_FILE);
      return send(res, 200, "text/html; charset=utf-8", html);
    } catch (error) {
      return send(res, 500, "text/plain; charset=utf-8", `No se pudo abrir el HTML: ${error.message}`);
    }
  }

  send(res, 404, "text/plain; charset=utf-8", "No encontrado.");
});

server.listen(PORT, () => {
  console.log(`Venezuela RP disponible en http://localhost:${PORT}`);
  console.log(`Redirect URI configurada: ${REDIRECT_URI}`);
});
