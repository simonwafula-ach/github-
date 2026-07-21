"use client"

import React, { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Terminal,
  Globe,
  Image as ImageIcon,
  Video as VideoIcon,
  Film,
  Download,
  Loader2,
  Zap,
  Settings,
  Play,
  Square,
  Percent,
  AlertCircle,
} from "lucide-react";

type NavKey = "ai" | "bot" | "proxy" | "public";

const NAV_ITEMS: { key: NavKey; label: string; icon: React.ReactNode }[] = [
  { key: "ai", label: "AI Creative Studio", icon: <Sparkles className="inline-block mr-2" /> },
  { key: "bot", label: "Bot Trader", icon: <TrendingUp className="inline-block mr-2" /> },
  { key: "proxy", label: "Proxy Terminal", icon: <Terminal className="inline-block mr-2" /> },
  { key: "public", label: "Public Exchange", icon: <Globe className="inline-block mr-2" /> },
];

export default function Page(): JSX.Element {
  const [active, setActive] = useState<NavKey>("ai");

  // AI Studio state
  const [genType, setGenType] = useState<"image" | "video" | "animation">("image");
  const [prompt, setPrompt] = useState<string>("A high-quality neon terminal abstract landscape");
  const [aspect, setAspect] = useState<string>("16:9");
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  // Bot Trader state
  const [leverage, setLeverage] = useState<number>(10);
  const [stopLoss, setStopLoss] = useState<number>(1.5);
  const [takeProfit, setTakeProfit] = useState<number>(3);
  const [strategyA, setStrategyA] = useState<boolean>(true);
  const [strategyB, setStrategyB] = useState<boolean>(false);
  const [isTrading, setIsTrading] = useState<boolean>(false);

  // Simulation / canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pricesRef = useRef<number[]>([]);

  // Live execution terminal
  const [logs, setLogs] = useState<string[]>([]);
  const logsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // initialize prices with a base series
    pricesRef.current = Array.from({ length: 200 }, (_, i) => 100 + Math.sin(i / 10) * 3 + Math.random() * 2);
    startSimulation();

    const logInterval = setInterval(() => {
      const examples = [
        `[FORGE_BOT] Entering BTC Long... Stop-Loss set at ${stopLoss}%`,
        `[FORGE_BOT] Partial exit executed at +${(Math.random() * 4).toFixed(2)}%`,
        `[FORGE_BOT] Updating TP to ${takeProfit}% based on volatility`,
        `[FORGE_BOT] Hedging exposure with ${leverage}x leverage`,
        `[FORGE_BOT] Warning: market spike detected ${Math.random() > 0.85 ? "(high impact)" : ""}`,
      ];
      const entry = examples[Math.floor(Math.random() * examples.length)];
      setLogs((s) => [...s.slice(-200), `${new Date().toLocaleTimeString()} ${entry}`]);
    }, 2500);

    return () => {
      stopSimulation();
      clearInterval(logInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // auto-scroll logs
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  function startSimulation() {
    let lastTime = performance.now();

    function step(t: number) {
      const dt = t - lastTime;
      lastTime = t;

      // simple random-walk update
      const arr = pricesRef.current;
      const last = arr[arr.length - 1] ?? 100;
      const change = (Math.random() - 0.48) * 0.6;
      const next = Math.max(1, last + change);
      arr.push(next);
      if (arr.length > 400) arr.shift();

      drawChart();
      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
  }

  function stopSimulation() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }

  function drawChart() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // background
    ctx.fillStyle = "#071018"; // terminal-700
    ctx.fillRect(0, 0, width, height);

    const data = pricesRef.current;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(57,255,20,0.85)"; // neon green

    data.forEach((p, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((p - min) / range) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // glow
    ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(0,163,255,0.06)";
    data.forEach((p, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((p - min) / range) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // draw latest price
    const latest = data[data.length - 1];
    ctx.fillStyle = "#39FF14";
    ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Monaco, monospace";
    ctx.fillText(`$${latest.toFixed(2)}`, 8, 16);
  }

  async function handleGenerate() {
    setGenerating(true);
    setGeneratedUrl(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type: genType, aspect }),
      });
      const data = await res.json();
      setGeneratedUrl(data?.url ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen flex text-neon-green bg-terminal-900">
      <aside className="w-72 border-r border-terminal-700 p-4">
        <div className="mb-6 px-2">
          <h2 className="text-2xl font-bold">Terminal Studio</h2>
          <p className="text-sm text-muted-gray mt-1">AI & Trading Control Panel</p>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 hover:bg-terminal-800 transition-colors ${
                active === item.key ? "bg-terminal-800 ring-1 ring-neon-green" : ""
              }`}
            >
              <span className="w-5 h-5 text-neon-green">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-6 px-2">
          <h3 className="text-xs uppercase text-muted-gray">Status</h3>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="animate-spin" /> Live
            </span>
            <span className="ml-auto text-muted-gray text-xs">v0.1</span>
          </div>
        </div>

        <div className="mt-6 px-2">
          <h3 className="text-xs uppercase text-muted-gray">Settings</h3>
          <button className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-terminal-800">
            <Settings /> Preferences
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{NAV_ITEMS.find((n) => n.key === active)?.label}</h1>
            <p className="text-sm text-muted-gray mt-1">Interactive tools for creators and traders</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-3 py-2 rounded bg-terminal-800 hover:bg-terminal-700 flex items-center gap-2">
              <Download /> Export
            </button>
            <button className="px-3 py-2 rounded bg-neon-green/6 text-neon-green hover:bg-neon-green/10 flex items-center gap-2">
              <Zap /> Deploy
            </button>
          </div>
        </header>

        <section>
          {active === "ai" && (
            <div className="grid grid-cols-12 gap-6">
              <aside className="col-span-4 bg-terminal-800 p-4 rounded-md">
                <h3 className="flex items-center gap-2 mb-3">
                  <Sparkles /> Generation
                </h3>

                <div className="space-y-3">
                  <label className="block text-xs text-muted-gray">Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setGenType("image")}
                      className={`flex-1 px-3 py-2 rounded ${genType === "image" ? "bg-neon-green/6 ring-1 ring-neon-green" : "bg-terminal-700"}`}
                    >
                      <ImageIcon className="inline-block mr-2" /> Image
                    </button>
                    <button
                      onClick={() => setGenType("video")}
                      className={`flex-1 px-3 py-2 rounded ${genType === "video" ? "bg-neon-green/6 ring-1 ring-neon-green" : "bg-terminal-700"}`}
                    >
                      <VideoIcon className="inline-block mr-2" /> Video
                    </button>
                    <button
                      onClick={() => setGenType("animation")}
                      className={`flex-1 px-3 py-2 rounded ${genType === "animation" ? "bg-neon-green/6 ring-1 ring-neon-green" : "bg-terminal-700"}`}
                    >
                      <Film className="inline-block mr-2" /> Animation
                    </button>
                  </div>

                  <label className="block text-xs text-muted-gray">Prompt</label>
                  <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full bg-terminal-700 rounded p-2 text-sm h-28" />

                  <label className="block text-xs text-muted-gray">Aspect Ratio</label>
                  <select value={aspect} onChange={(e) => setAspect(e.target.value)} className="w-full bg-terminal-700 rounded p-2 text-sm">
                    <option>16:9</option>
                    <option>4:3</option>
                    <option>1:1</option>
                    <option>9:16</option>
                  </select>

                  <div className="flex gap-2 mt-2">
                    <button onClick={handleGenerate} className="px-4 py-2 rounded bg-neon-green text-black flex items-center gap-2">
                      {generating ? <Loader2 className="animate-spin" /> : <Play />}
                      Generate
                    </button>
                    <button className="px-4 py-2 rounded bg-terminal-700 flex items-center gap-2">
                      <Download /> Save
                    </button>
                  </div>
                </div>
              </aside>

              <div className="col-span-8">
                <div className="bg-terminal-800 rounded-md p-4 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="flex items-center gap-2 text-lg"><Sparkles /> MONITOR_PREVIEW</h4>
                    <div className="text-sm text-muted-gray">{genType.toUpperCase()}</div>
                  </div>

                  <div className="flex-1 grid grid-cols-12 gap-4">
                    <div className="col-span-8 bg-terminal-700 rounded p-3 flex items-center justify-center">
                      {generatedUrl ? (
                        <img src={generatedUrl} alt="generated" className="max-h-[480px] object-contain rounded shadow-neon-md" />
                      ) : (
                        <div className="text-center text-muted-gray">
                          <div className="mb-2">
                            <Square className="inline-block mr-2" /> No output yet
                          </div>
                          <div className="text-xs">Use the controls to create an image, video, or animation. Mock fallbacks are used if no API key is provided.</div>
                        </div>
                      )}
                    </div>

                    <aside className="col-span-4 bg-terminal-700 rounded p-3 space-y-3">
                      <h5 className="text-sm text-muted-gray">Details</h5>
                      <div className="text-xs text-muted-gray break-words">Prompt: {prompt}</div>
                      <div className="flex items-center gap-2">
                        <Percent /> Aspect: <span className="ml-1">{aspect}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle /> Quality: <strong className="ml-1">High</strong>
                      </div>
                      <div className="mt-3">
                        <button className="w-full px-3 py-2 rounded bg-terminal-600">Download <Download className="inline-block ml-2" /></button>
                      </div>
                    </aside>
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === "bot" && (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-4 bg-terminal-800 p-4 rounded-md">
                <h3 className="flex items-center gap-2 mb-3"><TrendingUp /> Trading Controls</h3>

                <div className="space-y-4">
                  <label className="text-xs text-muted-gray">Leverage: <strong>{leverage}x</strong></label>
                  <input type="range" min={1} max={100} value={leverage} onChange={(e) => setLeverage(Number(e.target.value))} className="w-full" />

                  <label className="text-xs text-muted-gray">Stop-Loss (%)</label>
                  <input type="number" value={stopLoss} step={0.1} onChange={(e) => setStopLoss(Number(e.target.value))} className="w-full bg-terminal-700 rounded p-2" />

                  <label className="text-xs text-muted-gray">Take-Profit (%)</label>
                  <input type="number" value={takeProfit} step={0.1} onChange={(e) => setTakeProfit(Number(e.target.value))} className="w-full bg-terminal-700 rounded p-2" />

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2"><input type="checkbox" checked={strategyA} onChange={(e) => setStrategyA(e.target.checked)} /> Strategy Alpha</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2"><input type="checkbox" checked={strategyB} onChange={(e) => setStrategyB(e.target.checked)} /> Strategy Beta</label>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setIsTrading(true)} className="flex-1 px-3 py-2 rounded bg-neon-green text-black flex items-center gap-2"><Play /> Start</button>
                    <button onClick={() => setIsTrading(false)} className="flex-1 px-3 py-2 rounded bg-terminal-700 flex items-center gap-2"><Settings /> Stop</button>
                  </div>
                </div>
              </div>

              <div className="col-span-8 space-y-4">
                <div className="bg-terminal-800 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h4 className="flex items-center gap-2"><TrendingUp /> Market Simulation</h4>
                      <div className="text-sm text-muted-gray">Live random-walk</div>
                    </div>
                    <div className="text-sm text-muted-gray">Leverage: {leverage}x</div>
                  </div>
                  <div className="h-64 bg-terminal-700 rounded overflow-hidden">
                    <canvas ref={canvasRef} className="w-full h-full" />
                  </div>
                </div>

                <div className="bg-terminal-800 rounded p-3 h-56 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="flex items-center gap-2"><Terminal /> Live Execution</h4>
                    <div className="text-sm text-muted-gray">Expert feed</div>
                  </div>

                  <div ref={logsRef} className="bg-terminal-700 rounded p-3 flex-1 overflow-auto text-xs font-mono">
                    {logs.map((l, i) => (
                      <div key={i} className="mb-1">{l}</div>
                    ))}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <input className="flex-1 bg-terminal-700 rounded p-2 text-sm" placeholder="Send command to bot..." />
                    <button className="px-3 py-2 rounded bg-neon-green text-black"><Play /></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === "proxy" && (
            <div className="bg-terminal-800 rounded p-4">
              <h3 className="flex items-center gap-2"><Terminal /> Proxy Terminal</h3>
              <p className="text-sm text-muted-gray mt-2">A secure shell-like interface for routing requests through proxies and teleporting packets across nodes. (Mock)</p>
              <div className="mt-4 bg-terminal-700 p-3 rounded text-sm font-mono">$ ssh user@proxy.node
                <div className="text-muted-gray"># connected to node-01</div>
              </div>
            </div>
          )}

          {active === "public" && (
            <div className="bg-terminal-800 rounded p-4">
              <h3 className="flex items-center gap-2"><Globe /> Public Exchange</h3>
              <p className="text-sm text-muted-gray mt-2">Market overview and public instruments (mock data)</p>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-terminal-700 p-3 rounded">
                  <div className="text-sm text-muted-gray">BTC/USD</div>
                  <div className="text-lg font-bold">${(10000 + Math.random() * 2000).toFixed(2)}</div>
                </div>
                <div className="bg-terminal-700 p-3 rounded">
                  <div className="text-sm text-muted-gray">ETH/USD</div>
                  <div className="text-lg font-bold">${(800 + Math.random() * 400).toFixed(2)}</div>
                </div>
                <div className="bg-terminal-700 p-3 rounded">
                  <div className="text-sm text-muted-gray">SOL/USD</div>
                  <div className="text-lg font-bold">$${(20 + Math.random() * 50).toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
