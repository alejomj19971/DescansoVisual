"use client";

import { useEffect, useRef, useState } from "react";

const WORK_SECONDS = 20 * 60;
const BREAK_SECONDS = 20;
const REST_SECONDS = 2 * 60;

type Status = "idle" | "running" | "paused" | "break" | "resting";

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function playChime() {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const notes = [660, 880];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const start = ctx.currentTime + i * 0.22;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.2, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);
      osc.start(start);
      osc.stop(start + 0.35);
    });
  } catch {
    // audio not available, ignore
  }
}

function notify(title: string, body: string) {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [secondsLeft, setSecondsLeft] = useState(WORK_SECONDS);
  const [breakSecondsLeft, setBreakSecondsLeft] = useState(BREAK_SECONDS);
  const [restSecondsLeft, setRestSecondsLeft] = useState(REST_SECONDS);
  const [breaksTaken, setBreaksTaken] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (status !== "running" && status !== "break" && status !== "resting") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      if (status === "running") {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            playChime();
            notify(
              "¡Hora de un descanso visual! 👀",
              "Mira algo a 6 metros de distancia durante 20 segundos."
            );
            setStatus("break");
            setBreakSecondsLeft(BREAK_SECONDS);
            return WORK_SECONDS;
          }
          return prev - 1;
        });
      } else if (status === "break") {
        setBreakSecondsLeft((prev) => {
          if (prev <= 1) {
            setStatus("resting");
            setRestSecondsLeft(REST_SECONDS);
            return BREAK_SECONDS;
          }
          return prev - 1;
        });
      } else if (status === "resting") {
        setRestSecondsLeft((prev) => {
          if (prev <= 1) {
            setBreaksTaken((b) => b + 1);
            setStatus("running");
            return REST_SECONDS;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  const handleStart = () => {
    setSecondsLeft(WORK_SECONDS);
    setStatus("running");
  };

  const handlePauseResume = () => {
    setStatus((prev) => (prev === "running" ? "paused" : "running"));
  };

  const handleReset = () => {
    setStatus("idle");
    setSecondsLeft(WORK_SECONDS);
    setBreakSecondsLeft(BREAK_SECONDS);
    setRestSecondsLeft(REST_SECONDS);
  };

  const handleSkipBreak = () => {
    setStatus("resting");
    setRestSecondsLeft(REST_SECONDS);
  };

  const handleSkipRest = () => {
    setBreaksTaken((b) => b + 1);
    setStatus("running");
    setRestSecondsLeft(REST_SECONDS);
  };

  const progress = 1 - secondsLeft / WORK_SECONDS;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white/80 backdrop-blur shadow-xl shadow-brand-500/10 border border-white/60 p-8 sm:p-10 flex flex-col items-center gap-6 animate-fade-in">
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center justify-center gap-2">
            <span>👁️</span> Descanso Visual
          </h1>
          <p className="text-slate-500 text-sm sm:text-base">
            Regla 20-20-20: cada 20 minutos, descansa la vista 20 segundos.
          </p>
        </div>

        <div className="relative w-56 h-56 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#4f6bff"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - (status === "idle" ? 0 : progress))}
              className="transition-all duration-700 ease-linear"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-bold text-slate-800 tabular-nums">
              {formatTime(status === "idle" ? WORK_SECONDS : secondsLeft)}
            </span>
            <span className="text-xs uppercase tracking-wide text-slate-400 mt-1">
              {status === "idle" && "Listo para empezar"}
              {status === "running" && "Hasta el próximo descanso"}
              {status === "paused" && "En pausa"}
              {status === "break" && "¡Descansando la vista!"}
              {status === "resting" && "Descanso largo"}
            </span>
          </div>
        </div>

        <div className="flex flex-col w-full gap-3">
          {status === "idle" && (
            <button
              onClick={handleStart}
              className="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-semibold text-lg shadow-lg shadow-brand-500/30 transition"
            >
              ▶ Iniciar jornada
            </button>
          )}

          {(status === "running" || status === "paused") && (
            <div className="flex gap-3">
              <button
                onClick={handlePauseResume}
                className="flex-1 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-semibold transition"
              >
                {status === "running" ? "⏸ Pausar" : "▶ Reanudar"}
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 active:scale-[0.98] text-slate-700 font-semibold transition"
              >
                ⟲ Reiniciar
              </button>
            </div>
          )}

          {status === "break" && (
            <button
              disabled
              className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white font-semibold text-lg shadow-lg shadow-emerald-500/30 animate-pulse"
            >
              👀 Descansa la vista...
            </button>
          )}

          {status === "resting" && (
            <button
              disabled
              className="w-full py-3.5 rounded-2xl bg-teal-500 text-white font-semibold text-lg shadow-lg shadow-teal-500/30 animate-pulse"
            >
              🧘 Descanso largo...
            </button>
          )}
        </div>

        {breaksTaken > 0 && (
          <p className="text-sm text-slate-500">
            Descansos completados hoy:{" "}
            <span className="font-semibold text-brand-600">{breaksTaken}</span>
          </p>
        )}
      </div>

      <footer className="mt-8 text-center text-xs text-slate-400 max-w-sm">
        Mantén esta pestaña abierta mientras trabajas. Cada 20 minutos te
        avisaremos para que mires algo a 6 metros (20 pies) de distancia
        durante 20 segundos, seguido de un descanso de 2 minutos antes de
        continuar.
      </footer>

      {status === "break" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-brand-600/95 backdrop-blur-sm text-white px-6 animate-fade-in">
          <div className="animate-pop-in flex flex-col items-center gap-6 text-center max-w-md">
            <span className="text-6xl">👀</span>
            <h2 className="text-3xl font-bold">¡Hora de un descanso visual!</h2>
            <p className="text-brand-50 text-lg">
              Mira algo a unos 6 metros (20 pies) de distancia durante 20 segundos.
            </p>
            <div className="text-6xl font-bold tabular-nums">{breakSecondsLeft}</div>
            <button
              onClick={handleSkipBreak}
              className="mt-2 px-6 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium transition"
            >
              Saltar descanso
            </button>
          </div>
        </div>
      )}

      {status === "resting" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-teal-600/95 backdrop-blur-sm text-white px-6 animate-fade-in">
          <div className="animate-pop-in flex flex-col items-center gap-6 text-center max-w-md">
            <span className="text-6xl">🧘</span>
            <h2 className="text-3xl font-bold">Tómate un descanso de 2 minutos</h2>
            <p className="text-teal-50 text-lg">
              Levántate, estira el cuerpo o camina un poco antes de volver a tu
              siguiente ciclo de 20 minutos.
            </p>
            <div className="text-6xl font-bold tabular-nums">
              {formatTime(restSecondsLeft)}
            </div>
            <button
              onClick={handleSkipRest}
              className="mt-2 px-6 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium transition"
            >
              Saltar descanso largo
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
