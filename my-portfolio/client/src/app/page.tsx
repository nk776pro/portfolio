"use client";

import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface SignalPacket {
  id: string;
  node: string;
  data: string;
  time: string;
}

const engineeringProfile = {
  header: "LAB_BENCH_01 // ACTIVE_RUN",
  bio: "I build full-stack web architectures and write RTL for digital logic. Most of my time is spent debugging timing violations in Verilog or optimizing database query pipelines in Node.js. I don't use templates; I write clean code that interacts directly with bare infrastructure.",
  projects: [
    {
      id: "01",
      title: "Custom FSM Traffic Controller",
      stack: "Verilog / Next.js / WebSockets",
      desc: "Designed a finite state machine to manage dynamic intersection timing. Built a web dashboard that maps the live state transitions and signal changes via low-latency sockets. No boilerplate."
    },
    {
      id: "02",
      title: "Distributed Telemetry Pipe",
      stack: "Node.js / PostgreSQL / Docker",
      desc: "A high-concurrency event logger that ingests raw network hooks and drops them into a localized Postgres instance. Engineered to handle rapid connection streams without dropping packets."
    }
  ]
};

export default function TelemetryConsole() {
  const [stream, setStream] = useState<SignalPacket[]>([]);
  const [textInput, setTextInput] = useState("");
  const [busActive, setBusActive] = useState(false);
  const [pulseLine, setPulseLine] = useState("░░░░░░░░░░░░░░░░░░░░");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
      transports: ["websocket"]
    });

    socketRef.current.on("connect", () => setBusActive(true));
    socketRef.current.on("disconnect", () => setBusActive(false));

    socketRef.current.on("signalDownstream", (packet: SignalPacket) => {
      setStream((prev) => [...prev, packet]);
      setPulseLine("_┌┐_┌┐__██_┌┐_██_");
      setTimeout(() => setPulseLine("░░░░░░░░░░░░░░░░░░░░"), 800);
    });

    return () => { socketRef.current?.disconnect(); };
  }, []);

  const transmitDataPacket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !socketRef.current) return;
    socketRef.current.emit("signalUpstream", { text: textInput });
    setTextInput("");
  };

  return (
    <main className="min-h-screen bg-[#070809] p-4 lg:p-8 flex flex-col gap-6 text-xs uppercase tracking-wider">
      <div className="w-full bg-[#111315] border border-[#22262a] p-4 rounded flex flex-wrap justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <div className={`h-2.5 w-2.5 rounded-full ${busActive ? 'bg-[#00ff66] animate-pulse' : 'bg-red-600'}`}></div>
          <span className="font-bold text-neutral-200">{engineeringProfile.header}</span>
        </div>
        <div className="text-neutral-400">BUS_LINE_STATUS: <span className="text-[#00e1ff]">{busActive ? "SYNCED_OK" : "DISCONNECTED"}</span></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <section className="lg:col-span-1 bg-[#0c0e10] border border-[#1e2226] rounded p-5 flex flex-col gap-6">
          <div className="border-b border-[#22262a] pb-2 font-bold text-neutral-300">⚡ LIVE_LOGIC_SIGNAL_ANALYZER</div>
          <div className="bg-black p-4 rounded border border-[#16191c] font-bold text-lg tracking-widest text-[#00ff66] overflow-hidden whitespace-nowrap select-none">
            {pulseLine}
          </div>
          <div className="text-neutral-400 normal-case leading-relaxed border-l-2 border-[#1e2226] pl-3 mb-2">
            {engineeringProfile.bio}
          </div>
          
          <div className="flex-1 flex flex-col gap-3">
            <div className="text-neutral-400 font-bold">CORE_ARCHITECTURES:</div>
            <div className="space-y-2">
              {engineeringProfile.projects.map((proj) => (
                <div key={proj.id} className="bg-[#111315] p-3 border border-[#1c1f22]">
                  <div className="text-neutral-200 font-bold mb-1">[{proj.id}] {proj.title}</div>
                  <div className="text-neutral-500 font-mono text-[10px] mb-2">{proj.stack}</div>
                  <div className="text-neutral-400 normal-case tracking-normal">{proj.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lg:col-span-2 bg-[#0c0e10] border border-[#1e2226] rounded flex flex-col overflow-hidden">
          <header className="bg-[#111315] border-b border-[#1e2226] px-5 py-3 font-bold text-neutral-200 flex justify-between items-center">
            <span>📡 INBOUND_TRANSCEIVER_BUFFER</span>
          </header>

          <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-black/30 font-mono text-[11px]">
            {stream.length === 0 ? (
              <div className="text-neutral-600 italic h-full flex items-center justify-center">
                --- ANTENNA ARRAY ALIGNED // NO UPSTREAM DATA INJECTED YET ---
              </div>
            ) : (
              stream.map((sig) => (
                <div key={sig.id} className="p-3 bg-[#111315] border border-[#1d2124] rounded flex flex-col gap-1">
                  <div className="flex justify-between text-neutral-500">
                    <span>TX_NODE: <span className="text-[#00e1ff]">{sig.node.substring(0, 6)}</span></span>
                    <span>TIMESTAMP: {new Date(sig.time).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-neutral-200 border-l border-[#00ff66] pl-3 py-1 mt-1 break-all">
                    HEX_PAYLOAD: <span className="text-[#00ff66]">{sig.data}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={transmitDataPacket} className="p-4 bg-[#111315] border-t border-[#1e2226] flex gap-3">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Inject message string directly into PostgreSQL database pipeline..."
              className="flex-1 bg-black border border-[#22262a] rounded px-4 py-2 text-[#00ff66] placeholder-neutral-600 focus:outline-none focus:border-[#00ff66]"
            />
            <button type="submit" className="bg-[#1c2e21] hover:bg-[#00ff66] text-[#00ff66] hover:text-black border border-[#00ff66] px-6 py-2 rounded font-bold transition-all duration-200">
              UPLINK_DATA
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
