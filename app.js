require('dotenv').config();
const express = require("express");
const fetch = require("node-fetch");
const { xss } = require('express-xss-sanitizer');
const promMid = require('express-prometheus-middleware');
const { Server } = require("socket.io");
const http = require('http');


const newsService = require('./services/newsService');
const sentimentAnalysisService = require('./services/sentimentAnalysisService');

const app = express();
const port = process.env.PORT || 3001;

app.use(promMid({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5],
  requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
}))
app.use(xss());

app.get('/', (req, res) => {
  res.send('Howdy')
})

app.get("/api/news", async (req, res) => {
  // this endpoint just fetches data, the one that writes to db is below
  try {
    const category = req.query.category || 'general';
    const response = await newsService.getNews(category);
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.json(response);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
})

// const server = app.listen(port, () => console.log(`app up n running`));
const server = http.createServer(app);
server.listen(port,  () => console.log(`app up n running`))

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Access-Control-Allow-Origin"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  socket.on('headline', async headline => {
    const analysis = await sentimentAnalysisService.getSentiment(headline);
    const result = {
      headline,
      score: analysis
    }
    socket.emit('analysis', result, ack => {
      console.log('yolo')
    })
  })
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;


