import express from "express";
import path from "path";
import axios from "axios";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse incoming request JSON body
  app.use(express.json());

  // Proxy Endpoint to forward questions to the Walmart Sales RAG service safely
  app.post("/api/ask", async (req, res) => {
    try {
      const { pergunta } = req.body;
      
      console.log(`[Proxy] Forwarding question to Walmart RAG API: "${pergunta}"`);
      
      if (!pergunta) {
        return res.status(400).json({ error: "The body must contain a 'pergunta' field." });
      }

      const response = await axios.post(
        'https://walmartsalesrag.onrender.com/perguntar',
        { pergunta },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 50000 // 50s backend timeout to accommodate Render's free tier cold starts
        }
      );
      
      console.log(`[Proxy] Successfully fetched response from Walmart Sales RAG. Status: ${response.status}`);
      return res.json(response.data);
    } catch (error: any) {
      console.error("[Proxy Error]:", error.message || error);
      
      const status = error.response?.status || 500;
      let errMsg = "Erro de conexão com o servidor RAG do Walmart.";
      
      if (error.code === 'ECONNABORTED') {
        errMsg = "O servidor RAG do Walmart excedeu o tempo limite (timeout de 50 segundos). Pode estar inicializando ou sobrecarregado.";
      } else if (error.response?.data) {
        errMsg = typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.resposta || error.response.data.error || JSON.stringify(error.response.data));
      } else if (error.message) {
        errMsg = `Erro na requisição backend: ${error.message}`;
      }
      
      return res.status(status).json({
        resposta: errMsg,
        error: error.message || true
      });
    }
  });

  // Serve Vite or Static files depending on environment
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully running on http://localhost:${PORT} under environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
