const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "*", methods: ["GET", "POST"] }
});

app.post("/api/telemetry/register", async (req, res) => {
  try {
    const { vector, ip } = req.body;
    const log = await prisma.telemetryLog.create({
      data: { eventVector: vector, ipFingerprint: ip }
    });
    res.status(201).json({ status: "SUCCESS", eventId: log.id });
  } catch (err) {
    res.status(500).json({ status: "FAIL", error: err.message });
  }
});

io.on("connection", (socket) => {
  console.log(`[NET_CONNECT] Node linked to bus line: ${socket.id}`);

  socket.on("signalUpstream", async (packet) => {
    try {
      const savedSignal = await prisma.signalTransmission.create({
        data: { originNode: socket.id, payload: packet.text }
      });
      
      io.emit("signalDownstream", {
        id: savedSignal.id,
        node: savedSignal.originNode,
        data: savedSignal.payload,
        time: savedSignal.receivedAt.toISOString()
      });
    } catch (dbErr) {
      console.error("[CRIT_ERROR] Telemetry insertion failed:", dbErr);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[NET_DISCONNECT] Node severed from bus line: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[INIT] Backend operating on port ${PORT}`);
});
