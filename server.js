const express = require('express');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const cors = require('cors'); // Adicionar o módulo cors

dotenv.config();

const app = express();
app.use(express.json());

// Configurar CORS para aceitar requisições da origem específica
const corsOptions = {
  origin: 'https://projeto-final-venda-livros-4965b9298fbe.herokuapp.com', // Permitir apenas a origem do seu front-end
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
  optionsSuccessStatus: 204 // Responder com status 204 às requisições de preflight
};
app.use(cors(corsOptions));

// Middleware para log de requisições
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Responder a preflight requests
app.options('*', cors(corsOptions));

const PORT = process.env.PORT || 3000;

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Venda de Livros',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware de autenticação
const jwt = require('jsonwebtoken');
const autenticarJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).send('Token não fornecido.');

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    req.user = dados;
    next();
  } catch {
    res.status(403).send('Token inválido.');
  }
};

// Rota de login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Simulação de validação (substituir pelo banco em casos reais)
  if (email === 'admin@livraria.com' && password === '123456') {
    const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }

  res.status(401).send('Credenciais inválidas.');
});

// Servir arquivos estáticos da pasta raiz
app.use(express.static(path.join(__dirname)));

// Rota básica para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rotas
const livrosRouter = require('./src/routes/livros');
app.use('/livros', livrosRouter);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
