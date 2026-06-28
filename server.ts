import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';

// Para ES modules (por causa do "type": "module" no package.json)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Variáveis de ambiente (opcional)
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

export function createServer() {
  const app = express();

  // Middlewares de segurança
  if (NODE_ENV === 'production') {
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://*.supabase.co", "https://*.stripe.com"],
        },
      },
    }));
  }

  // CORS (apenas em desenvolvimento)
  if (NODE_ENV === 'development') {
    app.use(cors({
      origin: 'http://localhost:8080',
      credentials: true,
    }));
  }

  // Parsing de JSON
  app.use(express.json());

  // Servir arquivos estáticos do Vite (para produção)
  const staticPath = path.resolve(__dirname, 'dist/spa');
  app.use(express.static(staticPath));

  // API Routes (adicione suas rotas aqui)
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: NODE_ENV 
    });
  });

  // SPA Fallback - TODAS as outras rotas vão para o index.html
  app.get('*', (req, res) => {
    // Se for uma requisição de API, retorna 404
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ error: 'API route not found' });
      return;
    }
    
    // Caso contrário, serve o SPA
    res.sendFile(path.join(staticPath, 'index.html'));
  });

  // Error handling
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: NODE_ENV === 'development' ? err.message : undefined
    });
  });

  // Iniciar servidor (apenas se executado diretamente)
  if (import.meta.url === `file://${process.argv[1]}`) {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📁 Serving static files from: ${staticPath}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
    });
  }

  return app;
}

// Export default para compatibilidade
export default createServer;

// Se executado diretamente: node server.ts
if (import.meta.url === `file://${process.argv[1]}`) {
  createServer();
}