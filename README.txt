VENEZUELA RP - PUBLICACION

La carpeta contiene:
- index.html: pagina publica.
- server.js: backend OAuth2 de Discord.
- package.json: comando de inicio para el backend.
- .env.example: variables privadas.

OPCION RECOMENDADA: FRONTEND EN NETLIFY + BACKEND EN RENDER

1. Frontend:
   - Entra en https://app.netlify.com/drop
   - Arrastra esta carpeta completa (o solo index.html).
   - Copia la URL que te entregue Netlify.

2. Backend:
   - Crea una cuenta en https://render.com
   - Crea un Web Service desde un repositorio GitHub con esta carpeta.
   - Build Command: npm install
   - Start Command: npm start
   - Variables:
     DISCORD_CLIENT_SECRET = tu Client Secret real
     DISCORD_REDIRECT_URI = https://TU-BACKEND.onrender.com/auth/discord/callback

3. En Discord Developer Portal > OAuth2 > General:
   - Elimina la redireccion de localhost.
   - Agrega:
     https://TU-BACKEND.onrender.com/auth/discord/callback

4. En index.html, cambia la constante redirectUri para que use esa URL publica.
   Tambien cambia la URL del backend para que el boton de login vuelva al backend.

IMPORTANTE:
- No subas .env ni el Client Secret a GitHub.
- No compartas el Client Secret por chat.
- Netlify solo publica archivos estaticos; el OAuth2 necesita el backend.
