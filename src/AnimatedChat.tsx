import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Phone, Trash2, ExternalLink, RotateCcw, ArrowUp } from 'lucide-react';

const suggestions = [
  "Play 8-Ball Pool! 🎱",
  "This UI looks so cool! 🔥",
  "Make this UI celebrate! 🎉",
  "Send some love! ❤️",
  "Show me some magic! ✨"
];

interface Message {
  id: string;
  role: 'alex' | 'user';
  content: string;
  created_at?: string;
  reaction?: string;
  timeStr?: string;
  isGame?: boolean;
}

interface AnimatedChatProps {
  isDark?: boolean;
}

const formatMessageTime = (date = new Date()) => {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
};

const SESSION_EFFECTS_KEY = 'standout_chat_screen_effects';

const getFiredEffects = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = sessionStorage.getItem(SESSION_EFFECTS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

const markEffectAsFired = (effect: 'confetti' | 'fire' | 'hearts') => {
  if (typeof window === 'undefined') return;
  try {
    const fired = getFiredEffects();
    fired.add(effect);
    sessionStorage.setItem(SESSION_EFFECTS_KEY, JSON.stringify(Array.from(fired)));
  } catch {}
};

function ScreenEffectsCanvas({
  effect,
  onComplete,
  isDark
}: {
  effect: 'confetti' | 'fire' | 'hearts' | null;
  onComplete: () => void;
  isDark: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!effect) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 560);

    let animationFrameId: number;
    const startTime = Date.now();
    const duration = 2800;

    let particles: any[] = [];

    if (effect === 'confetti') {
      const colors = ['#FF2D55', '#5856D6', '#007AFF', '#34C759', '#FF9500', '#FFCC00', '#AF52DE'];
      particles = Array.from({ length: 70 }, () => ({
        x: Math.random() * width,
        y: -10 - Math.random() * 80,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: 3 + Math.random() * 4,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.05 + Math.random() * 0.05
      }));
    } else if (effect === 'fire') {
      particles = Array.from({ length: 32 }, () => ({
        x: width * 0.08 + Math.random() * (width * 0.84),
        y: height + 10 + Math.random() * 90,
        size: 20 + Math.random() * 24,
        vy: -3.2 - Math.random() * 3.4,
        vx: (Math.random() - 0.5) * 1.6,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.05 + Math.random() * 0.05,
        rotation: (Math.random() - 0.5) * 0.25
      }));
    } else if (effect === 'hearts') {
      particles = Array.from({ length: 22 }, () => ({
        x: width * 0.1 + Math.random() * (width * 0.8),
        y: height + 10 + Math.random() * 100,
        size: 16 + Math.random() * 18,
        vy: -2 - Math.random() * 2.5,
        vx: (Math.random() - 0.5) * 1,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.03 + Math.random() * 0.04
      }));
    }

    const draw = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        ctx.clearRect(0, 0, width, height);
        onCompleteRef.current();
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const fadeAlpha = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;

      if (effect === 'confetti') {
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.vRot;
          p.wobble += p.wobbleSpeed;
          p.vx += Math.sin(p.wobble) * 0.1;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = fadeAlpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.cos(p.wobble));
          ctx.restore();
        });
      } else if (effect === 'fire') {
        particles.forEach(p => {
          p.y += p.vy;
          p.wobble += p.wobbleSpeed;
          p.x += p.vx + Math.sin(p.wobble) * 1.5;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation + Math.sin(p.wobble) * 0.12);
          ctx.font = `${p.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.globalAlpha = fadeAlpha;
          ctx.fillText('🔥', 0, 0);
          ctx.restore();
        });
      } else if (effect === 'hearts') {
        particles.forEach(p => {
          p.y += p.vy;
          p.wobble += p.wobbleSpeed;
          p.x += Math.sin(p.wobble) * 1.2;

          ctx.save();
          ctx.font = `${p.size}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.globalAlpha = fadeAlpha;
          ctx.fillText('❤️', p.x, p.y);
          ctx.restore();
        });
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [effect]);

  if (!effect) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-30 overflow-hidden"
    />
  );
}

interface PoolBall {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  number: number;
  isCue?: boolean;
  sunk: boolean;
  scale: number;
}

const TABLE_W = 284;
const TABLE_H = 142;
const BALL_R = 5.2;

const MIN_X = 22.5;
const MAX_X = 261.5;
const MIN_Y = 22.5;
const MAX_Y = 119.5;

const POCKETS = [
  { x: 20, y: 20, r: 10.5 },
  { x: 264, y: 20, r: 10.5 },
  { x: 20, y: 122, r: 10.5 },
  { x: 264, y: 122, r: 10.5 },
  { x: 142, y: 16.5, r: 8.5 },
  { x: 142, y: 125.5, r: 8.5 },
];

const createInitialBalls = (): PoolBall[] => [
  // White cue ball on baulk line
  { id: 0, x: 72, y: 71, vx: 0, vy: 0, radius: BALL_R, color: '#FFFFFF', number: 0, isCue: true, sunk: false, scale: 1 },
  // Rack Row 1 (apex)
  { id: 1, x: 184, y: 71, vx: 0, vy: 0, radius: BALL_R, color: '#F59E0B', number: 1, sunk: false, scale: 1 },
  // Rack Row 2
  { id: 2, x: 193.5, y: 65.5, vx: 0, vy: 0, radius: BALL_R, color: '#2563EB', number: 2, sunk: false, scale: 1 },
  { id: 3, x: 193.5, y: 76.5, vx: 0, vy: 0, radius: BALL_R, color: '#DC2626', number: 3, sunk: false, scale: 1 },
  // Rack Row 3
  { id: 4, x: 203, y: 60, vx: 0, vy: 0, radius: BALL_R, color: '#9333EA', number: 4, sunk: false, scale: 1 },
  { id: 8, x: 203, y: 71, vx: 0, vy: 0, radius: BALL_R, color: '#18181B', number: 8, sunk: false, scale: 1 }, // 8-Ball in center
  { id: 6, x: 203, y: 82, vx: 0, vy: 0, radius: BALL_R, color: '#EA580C', number: 6, sunk: false, scale: 1 },
];

interface GamePigeon8BallProps {
  isDark: boolean;
  triggerHaptic: (ms: number) => void;
  onAlexReaction?: (reaction: string) => void;
}

function GamePigeon8Ball({ isDark, triggerHaptic, onAlexReaction }: GamePigeon8BallProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ballsRef = useRef<PoolBall[]>(createInitialBalls());
  const [turn, setTurn] = useState<'player' | 'rolling' | 'alex' | 'game_over'>('player');
  const [statusMsg, setStatusMsg] = useState<string>("Pull back from cue ball to shoot");
  const [winner, setWinner] = useState<'player' | 'alex' | null>(null);
  const [pocketed, setPocketed] = useState<number[]>([]);

  const lastShooterRef = useRef<'player' | 'alex' | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragCurrentRef = useRef<{ x: number; y: number } | null>(null);
  const alexAimRef = useRef<{ active: boolean; aimAngle: number; pullDist: number } | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const turnRef = useRef(turn);
  turnRef.current = turn;

  const resetGame = () => {
    ballsRef.current = createInitialBalls();
    setTurn('player');
    setWinner(null);
    setPocketed([]);
    setStatusMsg("Fresh rack • Pull back cue ball to break!");
    lastShooterRef.current = null;
    isDraggingRef.current = false;
    dragCurrentRef.current = null;
    alexAimRef.current = null;
    triggerHaptic(30);
  };

  // Main 60fps game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina DPR setup
    const dpr = window.devicePixelRatio || 2;
    canvas.width = TABLE_W * dpr;
    canvas.height = TABLE_H * dpr;

    let isRunning = true;

    const loop = () => {
      if (!isRunning) return;

      const balls = ballsRef.current;
      const currentTurn = turnRef.current;

      // 1. Physics update when balls are rolling
      if (currentTurn === 'rolling') {
        let anyMoving = false;

        for (const b of balls) {
          if (b.sunk) {
            if (b.scale > 0) {
              b.scale = Math.max(0, b.scale - 0.08);
            }
            continue;
          }

          b.x += b.vx;
          b.y += b.vy;

          // Felt friction
          b.vx *= 0.984;
          b.vy *= 0.984;

          if (Math.hypot(b.vx, b.vy) < 0.04) {
            b.vx = 0;
            b.vy = 0;
          } else {
            anyMoving = true;
          }

          // Rail cushion bounces
          if (b.x - b.radius < MIN_X) {
            b.x = MIN_X + b.radius;
            b.vx = -b.vx * 0.84;
          } else if (b.x + b.radius > MAX_X) {
            b.x = MAX_X - b.radius;
            b.vx = -b.vx * 0.84;
          }

          if (b.y - b.radius < MIN_Y) {
            b.y = MIN_Y + b.radius;
            b.vy = -b.vy * 0.84;
          } else if (b.y + b.radius > MAX_Y) {
            b.y = MAX_Y - b.radius;
            b.vy = -b.vy * 0.84;
          }

          // Pocket capture
          for (const p of POCKETS) {
            const dist = Math.hypot(b.x - p.x, b.y - p.y);
            if (dist < p.r + 1.8) {
              b.sunk = true;
              triggerHaptic(22);
              break;
            }
          }
        }

        // Ball-to-ball elastic collisions
        for (let i = 0; i < balls.length; i++) {
          for (let j = i + 1; j < balls.length; j++) {
            const b1 = balls[i];
            const b2 = balls[j];
            if (b1.sunk || b2.sunk) continue;

            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const dist = Math.hypot(dx, dy);
            const minDist = b1.radius + b2.radius;

            if (dist < minDist && dist > 0.001) {
              const nx = dx / dist;
              const ny = dy / dist;
              const overlap = (minDist - dist) / 2;

              b1.x -= nx * overlap;
              b1.y -= ny * overlap;
              b2.x += nx * overlap;
              b2.y += ny * overlap;

              const kx = b1.vx - b2.vx;
              const ky = b1.vy - b2.vy;
              const p = nx * kx + ny * ky;

              if (p > 0) {
                const impulse = p * 0.95;
                b1.vx -= impulse * nx;
                b1.vy -= impulse * ny;
                b2.vx += impulse * nx;
                b2.vy += impulse * ny;
                if (impulse > 0.35) triggerHaptic(8);
              }
            }
          }
        }

        // Check if all balls stopped rolling
        if (!anyMoving) {
          const sunkBalls = balls.filter(b => !b.isCue && b.sunk).map(b => b.number);
          setPocketed(sunkBalls);

          const cue = balls.find(b => b.isCue)!;
          const eightBall = balls.find(b => b.number === 8)!;

          // Check scratch
          let scratched = false;
          if (cue.sunk) {
            scratched = true;
            cue.sunk = false;
            cue.scale = 1;
            cue.x = 72;
            cue.y = 71;
            cue.vx = 0;
            cue.vy = 0;
            triggerHaptic(30);
          }

          // Check 8-ball sink
          if (eightBall.sunk) {
            const whoWon = lastShooterRef.current === 'player' ? 'player' : 'alex';
            setWinner(whoWon);
            setTurn('game_over');
            setStatusMsg(whoWon === 'player' ? '🏆 8-Ball Pocketed! YOU WON!' : '🎱 Alex sunk the 8-Ball and Won!');
            onAlexReaction?.(whoWon === 'player' ? '👏' : '🔥');
          } else {
            // Turn transition
            if (lastShooterRef.current === 'player') {
              setTurn('alex');
              setStatusMsg(scratched ? "Scratch! Alex's turn to shoot" : "Alex's turn • Lining up shot...");
            } else {
              setTurn('player');
              setStatusMsg(scratched ? "Alex scratched! Your turn" : "Your turn • Drag cue ball backward");
            }
          }
        }
      }

      // 2. Render Canvas
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, TABLE_W, TABLE_H);

      // Outer wood rail frame
      ctx.fillStyle = isDark ? '#141210' : '#2A1F18';
      ctx.beginPath();
      ctx.roundRect(0, 0, TABLE_W, TABLE_H, 14);
      ctx.fill();

      // Inner cushion bevel
      ctx.fillStyle = isDark ? '#1F1B16' : '#3D2D24';
      ctx.beginPath();
      ctx.roundRect(5, 5, TABLE_W - 10, TABLE_H - 10, 10);
      ctx.fill();

      // Diamond sights (rail markers)
      ctx.fillStyle = '#F8FAFC';
      const sightsTopBottom = [72, 142, 212];
      sightsTopBottom.forEach(sx => {
        ctx.beginPath(); ctx.arc(sx, 3, 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx, TABLE_H - 3, 1.2, 0, Math.PI * 2); ctx.fill();
      });
      const sightsSides = [48, 94];
      sightsSides.forEach(sy => {
        ctx.beginPath(); ctx.arc(3, sy, 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(TABLE_W - 3, sy, 1.2, 0, Math.PI * 2); ctx.fill();
      });

      // Table felt area (clipped)
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(16, 16, TABLE_W - 32, TABLE_H - 32, 6);
      ctx.clip();

      const feltGrad = ctx.createRadialGradient(142, 71, 10, 142, 71, 130);
      if (isDark) {
        feltGrad.addColorStop(0, '#0E543D');
        feltGrad.addColorStop(1, '#072E20');
      } else {
        feltGrad.addColorStop(0, '#138A51');
        feltGrad.addColorStop(1, '#095733');
      }
      ctx.fillStyle = feltGrad;
      ctx.fillRect(16, 16, TABLE_W - 32, TABLE_H - 32);

      // Baulk line (head string) & spot
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(72, 16);
      ctx.lineTo(72, TABLE_H - 16);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.beginPath();
      ctx.arc(72, 71, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Pockets: Brass rim + deep shadow cavity
      POCKETS.forEach(p => {
        ctx.fillStyle = '#C2932E';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#050706';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      const cue = balls.find(b => b.isCue)!;

      // 3. Aiming guides & Cue stick
      let activeAimAngle: number | null = null;
      let activePullDist = 0;

      if (currentTurn === 'player' && isDraggingRef.current && dragCurrentRef.current && !cue.sunk) {
        const pullDx = cue.x - dragCurrentRef.current.x;
        const pullDy = cue.y - dragCurrentRef.current.y;
        activePullDist = Math.min(Math.hypot(pullDx, pullDy), 55);
        activeAimAngle = Math.atan2(pullDy, pullDx);
      } else if (currentTurn === 'alex' && alexAimRef.current && !cue.sunk) {
        activeAimAngle = alexAimRef.current.aimAngle;
        activePullDist = alexAimRef.current.pullDist;
      }

      if (activeAimAngle !== null && !cue.sunk) {
        // Laser trajectory line
        const guideLen = Math.min(100, 32 + activePullDist * 2.2);
        const endX = cue.x + Math.cos(activeAimAngle) * guideLen;
        const endY = cue.y + Math.sin(activeAimAngle) * guideLen;

        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cue.x, cue.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ghost target circle
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(endX, endY, BALL_R, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Realistic Cue Stick
        const stickAngle = activeAimAngle + Math.PI;
        const tipGap = BALL_R + 3 + activePullDist;
        const tipX = cue.x + Math.cos(stickAngle) * tipGap;
        const tipY = cue.y + Math.sin(stickAngle) * tipGap;
        const ferruleX = cue.x + Math.cos(stickAngle) * (tipGap + 3);
        const ferruleY = cue.y + Math.sin(stickAngle) * (tipGap + 3);
        const shaftEndX = cue.x + Math.cos(stickAngle) * (tipGap + 48);
        const shaftEndY = cue.y + Math.sin(stickAngle) * (tipGap + 48);
        const buttX = cue.x + Math.cos(stickAngle) * (tipGap + 86);
        const buttY = cue.y + Math.sin(stickAngle) * (tipGap + 86);

        // Chalk blue tip
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2.8;
        ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(ferruleX, ferruleY); ctx.stroke();

        // White ferrule
        const ferruleEndX = cue.x + Math.cos(stickAngle) * (tipGap + 7);
        const ferruleEndY = cue.y + Math.sin(stickAngle) * (tipGap + 7);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3.0;
        ctx.beginPath(); ctx.moveTo(ferruleX, ferruleY); ctx.lineTo(ferruleEndX, ferruleEndY); ctx.stroke();

        // Maple shaft
        ctx.strokeStyle = '#E0A96D';
        ctx.lineWidth = 3.6;
        ctx.beginPath(); ctx.moveTo(ferruleEndX, ferruleEndY); ctx.lineTo(shaftEndX, shaftEndY); ctx.stroke();

        // Irish linen wrap & handle
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 4.8;
        ctx.beginPath(); ctx.moveTo(shaftEndX, shaftEndY); ctx.lineTo(buttX, buttY); ctx.stroke();
      }

      // 4. Balls Rendering
      balls.forEach(b => {
        if (b.sunk && b.scale <= 0) return;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(b.x + 0.6, b.y + 1.2, BALL_R * b.scale, (BALL_R * 0.6) * b.scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ball 3D Sphere shading
        const ballGrad = ctx.createRadialGradient(
          b.x - 1.4 * b.scale,
          b.y - 1.4 * b.scale,
          0.3,
          b.x,
          b.y,
          BALL_R * b.scale
        );

        if (b.isCue) {
          ballGrad.addColorStop(0, '#FFFFFF');
          ballGrad.addColorStop(0.7, '#F1F5F9');
          ballGrad.addColorStop(1, '#94A3B8');
        } else {
          ballGrad.addColorStop(0, '#FFFFFF');
          ballGrad.addColorStop(0.2, b.color);
          ballGrad.addColorStop(1, '#050505');
        }

        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, BALL_R * b.scale, 0, Math.PI * 2);
        ctx.fill();

        // Number Badge
        if (b.number > 0 && b.scale > 0.6) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 2.2 * b.scale, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#000000';
          ctx.font = `bold ${Math.round(3.4 * b.scale)}px -apple-system, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(b.number), b.x, b.y + 0.3);
        } else if (b.isCue && b.scale > 0.6) {
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(b.x + 0.8, b.y - 0.6, 0.7 * b.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.restore(); // end clip
      ctx.restore(); // end dpr scale

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isDark]);

  // Handle Alex's AI counter-turn
  useEffect(() => {
    if (turn !== 'alex') return;

    let timeoutId: NodeJS.Timeout;

    timeoutId = setTimeout(() => {
      const balls = ballsRef.current;
      const cue = balls.find(b => b.isCue);
      if (!cue || cue.sunk) return;

      const unsunk = balls.filter(b => !b.isCue && !b.sunk);
      if (unsunk.length === 0) return;

      const nonEight = unsunk.filter(b => b.number !== 8);
      const target = (nonEight.length > 0
        ? nonEight[Math.floor(Math.random() * nonEight.length)]
        : unsunk[0])!;

      let bestPocket = POCKETS[0];
      let minDist = Infinity;
      for (const p of POCKETS) {
        const d = Math.hypot(p.x - target.x, p.y - target.y);
        if (d < minDist) {
          minDist = d;
          bestPocket = p;
        }
      }

      const angleToPocket = Math.atan2(bestPocket.y - target.y, bestPocket.x - target.x);
      const ghostX = target.x - Math.cos(angleToPocket) * (BALL_R * 2);
      const ghostY = target.y - Math.sin(angleToPocket) * (BALL_R * 2);

      const shotAngle = Math.atan2(ghostY - cue.y, ghostX - cue.x) + (Math.random() - 0.5) * 0.08;

      const startTime = performance.now();
      const aimDuration = 700;

      const animateAim = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(1, elapsed / aimDuration);
        const pull = Math.sin(progress * Math.PI) * 25;

        alexAimRef.current = {
          active: true,
          aimAngle: shotAngle,
          pullDist: pull
        };

        if (progress < 1) {
          requestAnimationFrame(animateAim);
        } else {
          alexAimRef.current = null;
          const speed = 4.8 + Math.random() * 2.5;
          cue.vx = Math.cos(shotAngle) * speed;
          cue.vy = Math.sin(shotAngle) * speed;
          lastShooterRef.current = 'alex';
          setTurn('rolling');
          setStatusMsg("Alex shoots! Balls rolling...");
          triggerHaptic(20);
        }
      };

      requestAnimationFrame(animateAim);
    }, 700);

    return () => clearTimeout(timeoutId);
  }, [turn]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    if (turn !== 'player') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (TABLE_W / rect.width);
    const py = (e.clientY - rect.top) * (TABLE_H / rect.height);

    isDraggingRef.current = true;
    dragCurrentRef.current = { x: px, y: py };
    triggerHaptic(10);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    if (!isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (TABLE_W / rect.width);
    const py = (e.clientY - rect.top) * (TABLE_H / rect.height);
    dragCurrentRef.current = { x: px, y: py };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const cue = ballsRef.current.find(b => b.isCue);
    if (!cue || cue.sunk || !dragCurrentRef.current) {
      dragCurrentRef.current = null;
      return;
    }

    const pullDx = cue.x - dragCurrentRef.current.x;
    const pullDy = cue.y - dragCurrentRef.current.y;
    const pullDist = Math.hypot(pullDx, pullDy);
    dragCurrentRef.current = null;

    if (pullDist > 6) {
      const aimAngle = Math.atan2(pullDy, pullDx);
      const speed = Math.min(pullDist * 0.16, 8.5);
      cue.vx = Math.cos(aimAngle) * speed;
      cue.vy = Math.sin(aimAngle) * speed;
      lastShooterRef.current = 'player';
      setTurn('rolling');
      setStatusMsg("Shot released! Balls rolling...");
      triggerHaptic(25);
    }
  };

  return (
    <div
      className="game-card-container flex flex-col w-full select-none"
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Game Header Bar */}
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-black border border-white/20 flex items-center justify-center shadow-xs">
            <span className="text-[7px] font-black text-white leading-none">8</span>
          </div>
          <span className="text-[11px] font-bold tracking-tight uppercase opacity-90">
            8-Ball Pool
          </span>
        </div>

        <button
          type="button"
          onClick={resetGame}
          title="Rack new game"
          className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            isDark
              ? 'bg-white/10 hover:bg-white/20 text-white/80'
              : 'bg-black/5 hover:bg-black/10 text-black/70'
          }`}
        >
          <RotateCcw className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Pool Table Canvas */}
      <div className="relative rounded-[12px] overflow-hidden shadow-inner cursor-crosshair">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-auto block select-none"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Footer Info & Sunk Tray */}
      <div className="flex items-center justify-between px-1 pt-2 text-[10px] leading-tight">
        <span className="opacity-75 font-medium truncate max-w-[190px]">
          {statusMsg}
        </span>
        <div className="flex items-center gap-0.5 shrink-0">
          {pocketed.length > 0 ? (
            pocketed.map(num => (
              <div
                key={num}
                className="w-3 h-3 rounded-full bg-black/60 border border-white/20 flex items-center justify-center shadow-2xs"
                title={`Ball ${num} pocketed`}
              >
                <span className="text-[6px] font-bold text-white leading-none">{num}</span>
              </div>
            ))
          ) : (
            <span className="text-[9px] opacity-40 font-semibold">6 balls racked</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface ElasticMessageBubbleProps {
  message: Message;
  isUser: boolean;
  isDark: boolean;
  isLastInGroup: boolean;
  isTapbackOpen: boolean;
  onOpenTapback: (id: string) => void;
  onCloseTapback: () => void;
  onLongPressStart: (id: string) => void;
  onLongPressCancel: () => void;
  triggerHaptic: (ms: number) => void;
  onAlexReaction?: (reaction: string) => void;
}

function ElasticMessageBubble({
  message,
  isUser,
  isDark,
  isLastInGroup,
  isTapbackOpen,
  onOpenTapback,
  onCloseTapback,
  onLongPressStart,
  onLongPressCancel,
  triggerHaptic,
  onAlexReaction
}: ElasticMessageBubbleProps) {
  const hasDraggedRef = useRef(false);
  const bubbleColor = isUser ? '#007AFF' : isDark ? '#2C2C2E' : '#E5E5EA';

  if (message.isGame) {
    return (
      <div
        className="game-card-container relative select-none my-1"
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <motion.div
          drag={false}
          onContextMenu={(e) => {
            e.preventDefault();
            onOpenTapback(message.id);
            triggerHaptic(25);
          }}
          onDoubleClick={() => {
            onOpenTapback(message.id);
            triggerHaptic(25);
          }}
          onTouchStart={() => onLongPressStart(message.id)}
          onTouchEnd={onLongPressCancel}
          onMouseDown={() => onLongPressStart(message.id)}
          onMouseUp={onLongPressCancel}
          onMouseLeave={onLongPressCancel}
          className={`group relative z-10 p-2.5 rounded-[22px] shadow-md transition-colors duration-200 ${
            isUser
              ? 'bg-[#007AFF] text-white'
              : isDark
              ? 'bg-[#1C1C1E] text-[#F2F2F7] border border-[rgba(255,255,255,0.08)]'
              : 'bg-[#E5E5EA] text-[#1C1C1E] border border-[#D1D1D6]'
          }`}
          style={{ width: '304px', maxWidth: '100%', touchAction: 'none' }}
        >
          <GamePigeon8Ball
            isDark={isDark}
            triggerHaptic={triggerHaptic}
            onAlexReaction={onAlexReaction}
          />

          {/* Authentic iOS iMessage Bubble Tail */}
          {isLastInGroup && (
            <>
              <div
                className={`absolute bottom-0 w-[20px] h-[20px] pointer-events-none ${
                  isUser
                    ? '-right-[7px] rounded-bl-[16px_14px]'
                    : '-left-[7px] rounded-br-[16px_14px]'
                }`}
                style={{
                  backgroundColor: isUser
                    ? '#007AFF'
                    : isDark
                    ? '#1C1C1E'
                    : '#E5E5EA'
                }}
              />
              <div
                className={`absolute bottom-0 w-[26px] h-[20px] pointer-events-none transition-colors duration-500 ${
                  isUser
                    ? '-right-[26px] rounded-bl-[10px]'
                    : '-left-[26px] rounded-br-[10px]'
                } ${isDark ? 'bg-[#121214]' : 'bg-[#F9F9FB]'}`}
                style={{
                  backgroundColor: isDark ? '#121214' : '#F9F9FB'
                }}
              />
            </>
          )}

          {/* Pinned Corner Reaction Badge */}
          <AnimatePresence>
            {message.reaction && (
              <motion.button
                type="button"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 22,
                  mass: 0.5
                }}
                style={{
                  transformOrigin: isUser ? 'bottom right' : 'bottom left'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isTapbackOpen) {
                    onCloseTapback();
                  } else {
                    onOpenTapback(message.id);
                  }
                }}
                className={`absolute -top-2.5 ${
                  isUser ? '-left-2' : '-right-2'
                } z-20 flex items-center justify-center px-1.5 py-0.5 rounded-full text-[13px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border cursor-pointer select-none transition-transform active:scale-90 ${
                  isDark
                    ? 'bg-[#2C2C2E] border-[#3A3A3C] text-white'
                    : 'bg-white border-[#E5E5EA] text-[#1C1C1E]'
                }`}
              >
                <span className="leading-none">{message.reaction}</span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative max-w-[80%] select-none">
      <motion.div
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.06}
        dragTransition={{
          bounceStiffness: 750,
          bounceDamping: 32
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          hasDraggedRef.current = false;
        }}
        onDragStart={() => {
          hasDraggedRef.current = true;
          onLongPressCancel();
          if (isTapbackOpen) {
            onCloseTapback();
          }
        }}
        onDragEnd={() => {
          triggerHaptic(12);
          setTimeout(() => {
            hasDraggedRef.current = false;
          }, 80);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          onOpenTapback(message.id);
          triggerHaptic(25);
        }}
        onDoubleClick={() => {
          if (!hasDraggedRef.current) {
            onOpenTapback(message.id);
            triggerHaptic(25);
          }
        }}
        onTouchStart={() => onLongPressStart(message.id)}
        onTouchEnd={onLongPressCancel}
        onMouseDown={() => onLongPressStart(message.id)}
        onMouseUp={onLongPressCancel}
        onMouseLeave={onLongPressCancel}
        whileDrag={{
          zIndex: 35,
          cursor: 'grabbing'
        }}
        className={`group relative z-10 px-4 py-2.5 text-[14px] leading-snug tracking-normal shadow-sm cursor-default active:cursor-grabbing select-none transition-colors duration-200 ${
          isUser
            ? 'bg-[#007AFF] text-white rounded-[18px] font-medium'
            : `${
                isDark ? 'bg-[#2C2C2E] text-[#F2F2F7]' : 'bg-[#E5E5EA] text-[#1C1C1E]'
              } rounded-[18px] font-normal`
        }`}
        style={{ wordBreak: 'break-word', touchAction: 'none' }}
      >
        {/* Authentic iOS iMessage Bubble Tail (Samuel Kraft Technique) */}
        {isLastInGroup && (
          <>
            {/* Tail Base: Fills corner and extends 7px outwards */}
            <div
              className={`absolute bottom-0 w-[20px] h-[20px] pointer-events-none ${
                isUser
                  ? '-right-[7px] rounded-bl-[16px_14px]'
                  : '-left-[7px] rounded-br-[16px_14px]'
              }`}
              style={{
                backgroundColor: isUser
                  ? '#007AFF'
                  : isDark
                  ? '#2C2C2E'
                  : '#E5E5EA'
              }}
            />
            {/* Tail Cutout: Shapes the natural iOS scoop using the chat background color */}
            <div
              className={`absolute bottom-0 w-[26px] h-[20px] pointer-events-none transition-colors duration-500 ${
                isUser
                  ? '-right-[26px] rounded-bl-[10px]'
                  : '-left-[26px] rounded-br-[10px]'
              } ${isDark ? 'bg-[#121214]' : 'bg-[#F9F9FB]'}`}
              style={{
                backgroundColor: isDark ? '#121214' : '#F9F9FB'
              }}
            />
          </>
        )}

        <span className="relative z-10">{message.content}</span>

        {/* Pinned Corner Reaction Badge */}
        <AnimatePresence>
          {message.reaction && (
            <motion.button
              type="button"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 22,
                mass: 0.5
              }}
              style={{
                transformOrigin: isUser ? 'bottom right' : 'bottom left'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (isTapbackOpen) {
                  onCloseTapback();
                } else {
                  onOpenTapback(message.id);
                }
              }}
              className={`absolute -top-2.5 ${
                isUser ? '-left-2' : '-right-2'
              } z-20 flex items-center justify-center px-1.5 py-0.5 rounded-full text-[13px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border cursor-pointer select-none transition-transform active:scale-90 ${
                isDark
                  ? 'bg-[#2C2C2E] border-[#3A3A3C] text-white'
                  : 'bg-white border-[#E5E5EA] text-[#1C1C1E]'
              }`}
            >
              <span className="leading-none">{message.reaction}</span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}


function MagneticWrapper({
  children,
  radius = 40,
  pullForce = 0.25,
  hoverScale = 1.08,
  pressScale = 0.94,
  stretchMax = 0.03
}: {
  children: React.ReactElement<any>;
  radius?: number;
  pullForce?: number;
  hoverScale?: number;
  pressScale?: number;
  stretchMax?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const stiffness = 0.12;
    const damping = 0.25;

    const state = { sx: 1, sy: 1, tx: 0, ty: 0, vsx: 0, vsy: 0, vtx: 0, vty: 0 };
    const target = { sx: 1, sy: 1, tx: 0, ty: 0 };

    let rect: DOMRect, center: { x: number; y: number }, down = false, isHovered = false;
    let animationFrameId: number;

    const measure = () => {
      rect = el.getBoundingClientRect();
      center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    };
    measure();

    const reset = () => {
      isHovered = false;
      target.tx = 0;
      target.ty = 0;
      target.sx = 1;
      target.sy = 1;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        reset();
        return;
      }

      const dx = e.clientX - center.x;
      const dy = e.clientY - center.y;
      const distance = Math.hypot(dx, dy);

      if (distance < radius) {
        isHovered = true;
        const nx = dx / (rect.width / 2);
        const ny = dy / (rect.height / 2);

        target.tx = dx * pullForce;
        target.ty = dy * pullForce;

        const currentBaseScale = down ? pressScale : hoverScale;
        target.sx = currentBaseScale + Math.abs(nx) * stretchMax;
        target.sy = currentBaseScale + Math.abs(ny) * stretchMax;
      } else {
        reset();
      }
    };

    const handlePointerDown = () => {
      down = true;
      if (isHovered) {
        target.sx = pressScale;
        target.sy = pressScale;
      }
    };

    const handlePointerUp = () => {
      down = false;
      if (isHovered) {
        target.sx = hoverScale;
        target.sy = hoverScale;
      } else {
        reset();
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', reset);
    document.addEventListener('mouseleave', reset);
    window.addEventListener('scroll', measure, { passive: true });
    el.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('blur', handlePointerUp);

    const loop = () => {
      let fsx = (target.sx - state.sx) * stiffness;
      state.vsx = (state.vsx + fsx) * (1 - damping);
      state.sx += state.vsx;

      let fsy = (target.sy - state.sy) * stiffness;
      state.vsy = (state.vsy + fsy) * (1 - damping);
      state.sy += state.vsy;

      let ftx = (target.tx - state.tx) * stiffness;
      state.vtx = (state.vtx + ftx) * (1 - damping);
      state.tx += state.vtx;

      let fty = (target.ty - state.ty) * stiffness;
      state.vty = (state.vty + fty) * (1 - damping);
      state.ty += state.vty;

      el.style.transform = `translate(${state.tx.toFixed(3)}px, ${state.ty.toFixed(3)}px) scale(${state.sx.toFixed(4)}, ${state.sy.toFixed(4)})`;

      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', reset);
      document.removeEventListener('mouseleave', reset);
      window.removeEventListener('scroll', measure);
      el.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('blur', handlePointerUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [radius, pullForce, hoverScale, pressScale, stretchMax]);

  return React.cloneElement(children, {
    ref,
    style: { ...children.props.style, willChange: 'transform' }
  });
}

interface ChatAnimatedTypingInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string) => void;
  isDark: boolean;
  disabled?: boolean;
  triggerHaptic: (ms: number) => void;
}

function ChatAnimatedTypingInput({
  value,
  onChange,
  onSend,
  isDark,
  disabled = false,
  triggerHaptic
}: ChatAnimatedTypingInputProps) {
  const [pulses, setPulses] = useState<{ id: number; x: number; y: number }[]>([]);
  const [cursorIndex, setCursorIndex] = useState(0);
  const [triggerState, setTriggerState] = useState<number | null>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const [caretPos, setCaretPos] = useState({ x: 0, y: 0, h: 20 });
  const [isTypingState, setIsTypingState] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const caretRef = useRef<HTMLSpanElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Sync cursor and clean pulses when value resets
  useEffect(() => {
    if (!value) {
      setCursorIndex(0);
      setPulses([]);
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
      }
    }
  }, [value]);

  const updateCaret = useCallback(() => {
    if (caretRef.current) {
      setCaretPos({
        x: caretRef.current.offsetLeft,
        y: caretRef.current.offsetTop,
        h: caretRef.current.offsetHeight || 20,
      });
    }
  }, []);

  useEffect(() => {
    requestAnimationFrame(updateCaret);
  }, [cursorIndex, value, updateCaret]);

  // Pulse effect spawn exactly like AnimatedTypingInput.tsx
  useEffect(() => {
    if (triggerState && caretRef.current) {
      const x = caretRef.current.offsetLeft;
      const y = caretRef.current.offsetTop;
      const newPulse = { id: triggerState + Math.random(), x, y };

      setPulses((prev) => [...prev, newPulse]);

      setTimeout(() => {
        setPulses((prev) => prev.filter((p) => p.id !== newPulse.id));
      }, 750);
    }
  }, [triggerState]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);
    setCursorIndex(e.target.selectionStart || 0);
    setTriggerState(Date.now());

    // Auto-adjust height dynamically up to 88px
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(88, Math.max(22, el.scrollHeight))}px`;

    // Tactile spring bounce
    setIsBouncing(true);
    if (bounceTimeoutRef.current) clearTimeout(bounceTimeoutRef.current);
    bounceTimeoutRef.current = setTimeout(() => setIsBouncing(false), 50);

    // Glowing border state
    setIsTypingState(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTypingState(false), 500);
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    setCursorIndex(e.currentTarget.selectionStart || 0);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend(value);
        setPulses([]);
        triggerHaptic(30);
      }
    }
  };

  const handleSendClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSend(value);
      setPulses([]);
      triggerHaptic(30);
    }
  };

  const textStyles: React.CSSProperties = {
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: '14px',
    lineHeight: '20px',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    margin: 0,
  };

  const paddingClass = "px-4 py-[10px]";

  return (
    <div className="flex-1 flex items-end gap-2 w-full">
      {/* Interactive Chat Pill */}
      <motion.div
        animate={{ scale: isBouncing ? 0.985 : 1 }}
        transition={{ scale: { type: "spring", stiffness: 450, damping: 25 } }}
        className="group relative flex-1 min-h-[42px] max-h-[92px] flex items-center rounded-[22px] transition-all duration-300"
      >
        {/* Layer 0: Clean Background & Border (No Glow) */}
        <div
          className={`absolute inset-0 rounded-[22px] overflow-hidden pointer-events-none z-0 transition-colors duration-300 border ${
            isDark ? 'bg-[#2C2C2E] border-[#3A3A3C]' : 'bg-[#F2F2F7] border-[#E5E5EA]'
          }`}
        >
          {/* Visual text layers mirroring Textarea scroll */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ transform: `translateY(-${scrollTop}px)` }}
          >
            {/* Layer 1: Base Readable Text */}
            <div
              className={`absolute top-0 left-0 w-full min-h-full ${paddingClass} transition-colors duration-300 select-none`}
              style={{
                ...textStyles,
                color: isDark ? '#F2F2F7' : '#1C1C1E',
              }}
            >
              {value || <span className="text-[#8E8E93] opacity-60">Ask anything...</span>}
            </div>

            {/* Layer 2: Expanding Pulses Masked to Text */}
            <AnimatePresence>
              {pulses.map((pulse) => (
                <motion.div
                  key={pulse.id}
                  initial={{ "--pulse-radius": "5px", opacity: 1 } as any}
                  animate={{ "--pulse-radius": "80px", opacity: 0 } as any}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className={`absolute top-0 left-0 w-full min-h-full ${paddingClass} pointer-events-none select-none`}
                  style={{
                    ...textStyles,
                    backgroundImage: `radial-gradient(
                      circle var(--pulse-radius) at ${pulse.x}px ${pulse.y + 12}px,
                      ${isDark ? 'rgba(73, 255, 255, 1)' : 'rgba(3, 145, 255, 1)'} 0%,
                      ${isDark ? 'rgba(73, 255, 255, 0.8)' : 'rgba(3, 145, 255, 0.8)'} 30%,
                      ${isDark ? 'rgba(73, 255, 255, 0)' : 'rgba(3, 145, 255, 0)'} 80%
                    )`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                    zIndex: 2,
                  }}
                >
                  {value}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Layer 3: Invisible Measurement Tracker for Caret */}
            <div
              className={`absolute top-0 left-0 w-full min-h-full ${paddingClass} invisible select-none pointer-events-none`}
              style={textStyles}
            >
              {value.substring(0, cursorIndex)}
              <span ref={caretRef}>&#8203;</span>
              {value.substring(cursorIndex)}
            </div>

            {/* Layer 3.5: Custom Fluid Glowing Caret */}
            {isFocused && (
              <motion.div
                className="absolute top-0 left-0 w-[2px] rounded-full pointer-events-none z-20"
                style={{
                  backgroundColor: isDark ? "#49FFFF" : "#007AFF",
                  boxShadow: `0 0 10px 1px ${isDark ? "rgba(73, 255, 255, 0.45)" : "rgba(0, 122, 255, 0.45)"}`
                }}
                initial={false}
                animate={{
                  x: caretPos.x,
                  y: caretPos.y + (caretPos.h * 0.1),
                  height: caretPos.h * 0.8,
                  opacity: isTypingState ? 1 : [0, 1, 0]
                }}
                transition={{
                  x: { type: "spring", stiffness: 800, damping: 35, mass: 0.5 },
                  y: { type: "spring", stiffness: 800, damping: 35, mass: 0.5 },
                  opacity: isTypingState
                    ? { duration: 0.1 }
                    : { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
                }}
              />
            )}
          </div>
        </div>

        {/* Honeypot to absorb iCloud Passwords extension heuristics */}
        <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
          <input type="text" tabIndex={-1} autoComplete="username" />
          <input type="password" tabIndex={-1} autoComplete="current-password" />
          <input type="password" tabIndex={-1} autoComplete="new-password" />
        </div>

        {/* Layer 4: Transparent Textarea capturing User Interactions */}
        <textarea
          ref={textAreaRef}
          rows={1}
          value={value}
          onChange={handleChange}
          onSelect={handleSelect}
          onScroll={handleScroll}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          maxLength={500}
          className="chat-pulse-textarea relative w-full px-4 py-[10px] bg-transparent resize-none outline-none focus:outline-none focus-visible:outline-none ring-0 border-none scrollbar-hide z-10"
          style={{
            ...textStyles,
            color: "transparent",
            caretColor: "transparent",
            WebkitTapHighlightColor: "transparent",
            minHeight: "42px",
            maxHeight: "88px"
          }}
          spellCheck={false}
          autoComplete="nope"
          autoCorrect="off"
          autoCapitalize="off"
          data-1p-ignore="true"
          data-lpignore="true"
          data-form-type="other"
        />
      </motion.div>

      {/* Magnetic iOS Blue Send Button */}
      <MagneticWrapper radius={36} pullForce={0.16} hoverScale={1.06} pressScale={0.94}>
        <button
          type="button"
          disabled={disabled || !value.trim()}
          onClick={handleSendClick}
          className="bg-[#007AFF] hover:bg-[#0069D9] disabled:opacity-30 disabled:hover:bg-[#007AFF] text-white rounded-full h-[40px] w-[40px] flex items-center justify-center transition-all duration-200 active:scale-[0.96] shrink-0 cursor-pointer shadow-sm mb-[1px]"
          aria-label="Send message"
        >
          <ArrowUp size={16} strokeWidth={2.75} />
        </button>
      </MagneticWrapper>
    </div>
  );
}

export default function AnimatedChat({ isDark = false }: AnimatedChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'alex',
      content: "hey! i'm dávid's ai alter ego. tap any prompt below to trigger screen effects, or ask me anything about UI design!",
      timeStr: formatMessageTime(),
      reaction: '🔥'
    }
  ]);
  const [input, setInput] = useState('');
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [timestamp, setTimestamp] = useState('');
  const [activeTapbackId, setActiveTapbackId] = useState<string | null>(null);
  const [activeEffect, setActiveEffect] = useState<'confetti' | 'fire' | 'hearts' | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const hasGame = messages.some(m => m.isGame);
  const isSwipeDisabled = isMobile || hasGame;

  // Immediately reset swipe offset if swipe is disabled
  useEffect(() => {
    if (isSwipeDisabled && swipeOffset !== 0) {
      setSwipeOffset(0);
    }
  }, [isSwipeDisabled, swipeOffset]);

  // Global safety release: ensure swipeOffset immediately resets on mouseup/touchend
  useEffect(() => {
    const handleGlobalRelease = () => {
      setSwipeOffset(0);
    };
    window.addEventListener('pointerup', handleGlobalRelease);
    window.addEventListener('mouseup', handleGlobalRelease);
    window.addEventListener('touchend', handleGlobalRelease);
    return () => {
      window.removeEventListener('pointerup', handleGlobalRelease);
      window.removeEventListener('mouseup', handleGlobalRelease);
      window.removeEventListener('touchend', handleGlobalRelease);
    };
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerEffectOnce = (effect: 'confetti' | 'fire' | 'hearts') => {
    setActiveEffect(null);
    setTimeout(() => {
      setActiveEffect(effect);
    }, 20);
  };

  // Suggestion chips scroll position tracking
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const triggerHaptic = (duration = 15) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch {}
    }
  };

  const startLongPress = (id: string) => {
    cancelLongPress();
    longPressTimerRef.current = setTimeout(() => {
      setActiveTapbackId(id);
      triggerHaptic(30);
    }, 350);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    triggerHaptic(20);
    setMessages(prev =>
      prev.map(m => {
        if (m.id === messageId) {
          return {
            ...m,
            reaction: m.reaction === emoji ? undefined : emoji
          };
        }
        return m;
      })
    );
    setActiveTapbackId(null);
  };

  const handlePan = (e: any, info: PanInfo) => {
    if (isSwipeDisabled) return;

    const target = e?.target as HTMLElement | null;
    if (
      target?.tagName === 'CANVAS' ||
      target?.closest?.('.game-card-container') ||
      target?.closest?.('canvas')
    ) {
      return;
    }

    if (info.offset.x < 0 && Math.abs(info.offset.x) > Math.abs(info.offset.y) * 0.4) {
      const clamped = Math.max(-65, info.offset.x * 0.65);
      setSwipeOffset(clamped);
    }
  };

  const handlePanEnd = () => {
    setSwipeOffset(0);
  };

  const checkScreenEffect = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.match(/\b(congrats|congratulations|deal|celebrate|cheers|awesome|happy|party)\b/i) || text.includes('🎉')) {
      triggerEffectOnce('confetti');
    } else if (lower.match(/\b(fire|lit|hot|cool|flame|sparks)\b/i) || text.includes('🔥')) {
      triggerEffectOnce('fire');
    } else if (lower.match(/\b(love|heart|amazing)\b/i) || text.includes('❤️') || text.includes('💖') || text.includes('💕')) {
      triggerEffectOnce('hearts');
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0
      );
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const now = new Date();
    setTimestamp(`Today ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle suggestion horizontal scroll checking
  const checkSuggestionsScroll = () => {
    if (suggestionsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = suggestionsRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    const el = suggestionsRef.current;
    if (el) {
      el.addEventListener('scroll', checkSuggestionsScroll);
      checkSuggestionsScroll();
      window.addEventListener('resize', checkSuggestionsScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkSuggestionsScroll);
      window.removeEventListener('resize', checkSuggestionsScroll);
    };
  }, []);

  // Smooth scroll to bottom when messages list updates
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const scrollSuggestions = (direction: 'left' | 'right') => {
    if (suggestionsRef.current) {
      const amount = direction === 'left' ? -180 : 180;
      suggestionsRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!suggestionsRef.current) return;
    setIsMouseDown(true);
    setIsDragging(false);
    setStartX(e.pageX - suggestionsRef.current.offsetLeft);
    setScrollLeft(suggestionsRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown || !suggestionsRef.current) return;
    const x = e.pageX - suggestionsRef.current.offsetLeft;
    const walk = (x - startX) * 2;

    if (Math.abs(walk) > 5) {
      setIsDragging(true);
      e.preventDefault();
      suggestionsRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  async function handleSend(textToSend: string) {
    const text = textToSend.trim();
    if (!text) return;

    triggerHaptic(15);
    checkScreenEffect(text);

    const userMsgId = crypto.randomUUID();
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
      timeStr: formatMessageTime()
    };

    // 1. Add user message and clear inputs
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // AI reactive tapback easter egg
    const lower = text.toLowerCase();
    const isCompliment =
      lower.includes('cool') ||
      lower.includes('love') ||
      lower.includes('amazing') ||
      lower.includes('awesome') ||
      lower.includes('beautiful') ||
      lower.includes('clean') ||
      lower.includes('fire') ||
      text.includes('🔥') ||
      text.includes('❤️') ||
      text.includes('😍');

    if (isCompliment) {
      setTimeout(() => {
        setMessages(prev =>
          prev.map(m => (m.id === userMsgId ? { ...m, reaction: '❤️' } : m))
        );
        triggerHaptic(25);
      }, 650);
    } else if (lower.includes('deal') || lower.includes('celebrat') || lower.includes('party') || text.includes('🎉')) {
      setTimeout(() => {
        setMessages(prev =>
          prev.map(m => (m.id === userMsgId ? { ...m, reaction: '🔥' } : m))
        );
        triggerHaptic(25);
      }, 650);
    } else if (lower.includes('magic') || lower.includes('mind') || text.includes('✨') || text.includes('💡') || text.includes('🪄')) {
      setTimeout(() => {
        setMessages(prev =>
          prev.map(m => (m.id === userMsgId ? { ...m, reaction: '💡' } : m))
        );
        triggerHaptic(25);
      }, 650);
    }

    // 8-Ball Pool Mini-Game Trigger (like iMessage GamePigeon)
    const isPoolTrigger =
      lower.includes('pool') ||
      lower.includes('8-ball') ||
      lower.includes('8 ball') ||
      lower.includes('billiard') ||
      lower.includes('gamepigeon') ||
      lower.includes('play a game') ||
      lower.includes('mini-game') ||
      lower.includes('minigame') ||
      text.includes('🎱');

    if (isPoolTrigger) {
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 600));
      setIsTyping(false);

      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'alex',
          content: "Challenge accepted! 🎱 Here's a fresh rack—drag back from the cue ball to break!",
          created_at: new Date().toISOString(),
          timeStr: formatMessageTime()
        },
        {
          id: crypto.randomUUID(),
          role: 'alex',
          content: "8-Ball Pool Challenge",
          isGame: true,
          created_at: new Date().toISOString(),
          timeStr: formatMessageTime(),
          reaction: '🎱'
        }
      ]);
      return;
    }

    // Typing indicator state
    const showTyping = () => setIsTyping(true);
    const removeTyping = () => setIsTyping(false);

    showTyping();

    let responseText = '';

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          messages: [...messages, userMsg].slice(-8)
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          responseText += decoder.decode(value, { stream: true });
        }
      }
    } catch {
      // Simulating API loading latency
      await new Promise(r => setTimeout(r, 600));

      responseText = "hey! i'm a simulated ai alter ego. ask me about spring physics, dark mode, framer motion, or what makes ui feel native!";
      const lowercaseText = text.toLowerCase();

      if (lowercaseText.includes('celebrat') || lowercaseText.includes('party') || lowercaseText.includes('cheers') || lowercaseText.includes('deal') || lowercaseText.includes('🎉')) {
        responseText = "boom! 🎉 confetti on screen, spring physics in the bubbles. who said web apps have to be boring?";
      } else if (lowercaseText.includes('magic') || lowercaseText.includes('✨') || lowercaseText.includes('🪄')) {
        responseText = "abracadabra! 🪄 swipe any bubble left to reveal exact timestamps, double-tap to tapback, or pull the list for spring tension. the web is pure magic when crafted right.";
      } else if (lowercaseText.includes('love') || lowercaseText.includes('heart') || lowercaseText.includes('❤️')) {
        responseText = "much love! ❤️ crafted with passion for detail, buttery 60fps spring physics, and organic tactile feedback.";
      } else if (lowercaseText.includes('cool') || lowercaseText.includes('🔥') || lowercaseText.includes('clean') || lowercaseText.includes('awesome')) {
        responseText = "thank you so much! micro-interactions and tactile feedback are my absolute obsession. try double-clicking or long-pressing any bubble to leave an ios tapback reaction!";
      } else if (lowercaseText.includes('spring') || lowercaseText.includes('physics') || lowercaseText.includes('damping') || lowercaseText.includes('stiffness') || lowercaseText.includes('mass')) {
        responseText = "unlike rigid bezier curves, springs have actual mass, stiffness, and damping! by cranking stiffness to ~450 and dialing damping to ~28, elements snap with organic, tactile momentum just like real physical objects.";
      } else if (lowercaseText.includes('framer') || lowercaseText.includes('css') || lowercaseText.includes('transition')) {
        responseText = "interruptibility! if a user taps or drags mid-flight, css animations jerk or reset. framer motion inherits real velocity, handles layoutId morphs, and calculates continuous physics without missing a beat.";
      } else if (lowercaseText.includes('dark') || lowercaseText.includes('color') || lowercaseText.includes('palette') || lowercaseText.includes('theme') || lowercaseText.includes('black')) {
        responseText = "rule #1: never use pure #000000! rule #2: layer deep tinted charcoals (like #121214) with translucent 1px borders and soft ambient glows. that's how you get that buttery, high-end oled depth.";
      } else if (lowercaseText.includes('native') || lowercaseText.includes('haptic') || lowercaseText.includes('ios') || lowercaseText.includes('tactile') || lowercaseText.includes('gesture')) {
        responseText = "it's all in the details! we pair gesture-tracked dragging with spring deceleration, 60fps canvas particle effects, and subtle tactile haptics. the web doesn't have to feel clunky—it can feel like native ios.";
      } else if (lowercaseText.includes('ai') || lowercaseText.includes('artificial') || lowercaseText.includes('why not') || lowercaseText.includes('replace')) {
        responseText = "ai builders are great for cookie-cutter landing pages, but they can't craft soul. bespoke design engineering blends subtle haptics, tailored spring curves, and intentional micro-delight that turns visitors into fans.";
      } else if (lowercaseText.includes('stack') || lowercaseText.includes('tech') || lowercaseText.includes('tools') || lowercaseText.includes('react') || lowercaseText.includes('nextjs') || lowercaseText.includes('tailwind')) {
        responseText = "the dream combo: react + next.js for speed, tailwind css for rapid styling, and framer motion + html5 canvas for buttery micro-interactions. zero templates, 100% handcrafted craftsmanship.";
      } else if (lowercaseText.includes('animation') || lowercaseText.includes('motion') || lowercaseText.includes('animate') || lowercaseText.includes('build')) {
        responseText = "great motion design is invisible yet felt. i build micro-interactions with framer motion and html5 canvas, focusing on gesture responsiveness and micro-delight rather than distracting flashiness.";
      } else if (lowercaseText.includes('hi') || lowercaseText.includes('hello') || lowercaseText.includes('hey') || lowercaseText.includes('sup')) {
        responseText = "hey! how can i help you with ui design today? ask me about spring physics, dark mode, framer motion, or what makes ui feel native.";
      }
    }

    // 2. Drip feed the bubbles to feel like "texting a person"
    const lines = responseText.split(/\n+/).map(l => l.trim()).filter(Boolean);
    const beats: string[] = [];
    for (const line of lines) {
      const sentences = line.split(/(?<!\d\.)(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
      beats.push(...sentences);
    }

    for (let i = 0; i < beats.length; i++) {
      const beat = beats[i];

      showTyping();

      const typingDuration = Math.min(1400, Math.max(500, beat.length * 8 + 300));
      await new Promise(r => setTimeout(r, typingDuration));

      removeTyping();
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'alex',
          content: beat,
          created_at: new Date().toISOString(),
          timeStr: formatMessageTime()
        }
      ]);

      if (i < beats.length - 1) {
        await new Promise(r => setTimeout(r, 200));
      }
    }

    removeTyping();
  }

  return (
    <div className="w-full flex flex-col items-center mt-24">
      {/* Decorative Line Separator */}
      <div className="flex flex-col items-center mb-8">
        <div
          className={`text-[12px] leading-[125%] uppercase text-center font-semibold opacity-40 mb-4 transition-colors duration-500 ${
            isDark ? 'text-white' : 'text-[#121212]'
          }`}
          style={{ fontFamily: '"Inter", system-ui, sans-serif', maxWidth: '200px' }}
        >
          Chat with AI alter ego
        </div>
        <div
          className="w-[1px] h-[32px] transition-all duration-500"
          style={{
            backgroundImage: isDark
              ? 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.25) 100%)'
              : 'linear-gradient(180deg, transparent 0%, rgba(18, 18, 18, 0.3) 100%)'
          }}
        />
      </div>

      {/* Scoped style for dark mode typing indicator & pulse textarea selection */}
      <style>{`
        ${isDark ? `
          .typing-indicator {
            background-color: #2C2C2E !important;
          }
          .typing-indicator::before,
          .typing-indicator::after {
            background-color: #2C2C2E !important;
          }
          .typing-indicator span {
            background-color: #8E8E93 !important;
          }
        ` : ''}
        .chat-pulse-textarea::selection {
          background-color: ${isDark ? 'rgba(73, 255, 255, 0.35)' : 'rgba(0, 122, 255, 0.25)'} !important;
          color: transparent !important;
        }
      `}</style>

      {/* Main Chat Card */}
      <div
        className={`w-full max-w-[576px] rounded-[24px] box-border flex flex-col h-[520px] md:h-[560px] overflow-hidden relative justify-between transition-colors duration-500 ${
          isDark
            ? 'bg-[#121214] border border-[rgba(255,255,255,0.1)] shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
            : 'bg-[#F9F9FB] border border-[#E5E5EA] shadow-[0_4px_20px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]'
        }`}
        style={{ backgroundColor: isDark ? '#121214' : '#F9F9FB' }}
      >
        {/* iOS Screen Effects Overlay */}
        <ScreenEffectsCanvas
          effect={activeEffect}
          onComplete={() => setActiveEffect(null)}
          isDark={isDark}
        />

        {/* iOS 27 Progressive Long Blur Fade Header Background */}
        <div
          className="absolute top-0 left-0 right-0 h-[108px] pointer-events-none z-20"
          style={{
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            maskImage:
              'linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 32%, rgba(0, 0, 0, 0.75) 55%, rgba(0, 0, 0, 0.3) 78%, rgba(0, 0, 0, 0) 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 32%, rgba(0, 0, 0, 0.75) 55%, rgba(0, 0, 0, 0.3) 78%, rgba(0, 0, 0, 0) 100%)',
            background: isDark
              ? 'linear-gradient(to bottom, rgba(18, 18, 20, 0.94) 0%, rgba(18, 18, 20, 0.86) 32%, rgba(18, 18, 20, 0.5) 58%, rgba(18, 18, 20, 0.18) 80%, transparent 100%)'
              : 'linear-gradient(to bottom, rgba(249, 249, 251, 0.95) 0%, rgba(249, 249, 251, 0.88) 32%, rgba(249, 249, 251, 0.52) 58%, rgba(249, 249, 251, 0.18) 80%, transparent 100%)'
          }}
        />

        {/* Floating Header Controls */}
        <div className="absolute top-0 left-0 right-0 px-4 pt-3.5 pb-2 flex items-center justify-between z-30 pointer-events-none">
          {/* Left Shake Back Button */}
          <motion.button
            onClick={() => {
              if (isShaking) return;
              setIsShaking(true);
              if (!isMobile) triggerHaptic(50);
              setTimeout(() => setIsShaking(false), 400);
            }}
            animate={isShaking ? { x: [-4, 4, -4, 4, 0] } : {}}
            transition={{ duration: 0.3 }}
            aria-label="Go back"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer border border-transparent pointer-events-auto ${
              isDark
                ? 'bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white'
                : 'bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E]'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-[2px]"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </motion.button>

          {/* Center Avatar & Name */}
          <motion.div
            className="flex flex-col items-center absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 mt-1 cursor-pointer z-40 pointer-events-auto"
            whileHover="hover"
            whileTap="tap"
            onClick={() => {
              setIsDropdownOpen(prev => !prev);
              if (!isMobile) triggerHaptic(30);
            }}
          >
            <motion.div
              variants={{
                hover: { rotateZ: 8, scale: 1.1 },
                tap: { scale: 0.9, rotateY: 180 }
              }}
              transition={{
                rotateY: { type: 'spring', stiffness: 200, damping: 15 },
                rotateZ: { type: 'spring', stiffness: 300, damping: 15 }
              }}
              className="rounded-full relative"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <img
                src="https://app.paper.design/file-assets/01KRSFVYJB11HDV7WR2XHZF5TD/0NBGVSXMAREFNCTD2FJR4V1AY2.jpg"
                alt="Dávid"
                className={`w-[36px] h-[36px] rounded-full object-cover border mb-0.5 ${
                  isDark ? 'border-[#3A3A3C]' : 'border-[#E5E5EA]'
                }`}
              />
            </motion.div>
            <motion.div
              variants={{
                hover: { y: -2, scale: 1.05 }
              }}
              className={`flex items-center gap-0.5 px-1.5 py-[2px] rounded-full mt-[-8px] border relative z-10 shadow-sm backdrop-blur-sm ${
                isDark
                  ? 'bg-[#2C2C2E]/90 border-[rgba(255,255,255,0.1)] text-white'
                  : 'bg-white/80 border-[#F2F2F7] text-[#1C1C1E]'
              }`}
            >
              <span className="text-[9px] font-semibold tracking-tight ml-0.5">Dávid</span>
              <motion.svg
                variants={{ hover: { rotate: 90 } }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isDark ? '#a1a1aa' : '#8E8E93'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </motion.svg>
            </motion.div>
          </motion.div>

          {/* Right Email Button */}
          <a
            href="mailto:hello@standout.hu"
            aria-label="Send email"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer border border-transparent relative z-40 pointer-events-auto ${
              isDark
                ? 'bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white'
                : 'bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E]'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </a>
        </div>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isDropdownOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDropdownOpen(false)}
                className="absolute inset-0 z-30 bg-black/10 backdrop-blur-[1px]"
              />
              <motion.div
                initial={{ opacity: 0, x: '-50%', y: -10, scale: 0.95 }}
                animate={{ opacity: 1, x: '-50%', y: 0, scale: 1 }}
                exit={{ opacity: 0, x: '-50%', y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`absolute top-[64px] left-1/2 w-[220px] shadow-xl rounded-2xl p-1.5 z-40 flex flex-col gap-0.5 select-none backdrop-blur-xl border ${
                  isDark
                    ? 'bg-[#2C2C2E]/95 border-[#3A3A3C] text-white'
                    : 'bg-white/95 border-[#E5E5EA] text-[#1C1C1E]'
                }`}
              >
                <a
                  href="mailto:hello@standout.hu?subject=Consultation"
                  onClick={() => setIsDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                    isDark ? 'hover:bg-[#3A3A3C] text-[#F2F2F7]' : 'hover:bg-[#F2F2F7] text-[#1C1C1E]'
                  }`}
                >
                  <Phone className="w-4 h-4 text-[#8E8E93]" />
                  Call / Meeting
                </a>
                <div
                  className={`h-[1px] my-0.5 ${
                    isDark ? 'bg-[rgba(255,255,255,0.06)]' : 'bg-[#E5E5EA]'
                  }`}
                />
                <a
                  href="https://standout.hu"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsDropdownOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-colors group ${
                    isDark ? 'hover:bg-[#3A3A3C] text-[#F2F2F7]' : 'hover:bg-[#F2F2F7] text-[#1C1C1E]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ExternalLink className="w-4 h-4 text-[#8E8E93]" />
                    Portfolio
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                </a>
                <a
                  href="https://x.com/saintdsgn"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsDropdownOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-colors group ${
                    isDark ? 'hover:bg-[#3A3A3C] text-[#F2F2F7]' : 'hover:bg-[#F2F2F7] text-[#1C1C1E]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#8E8E93]">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.95H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    X Profile
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                </a>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Dismiss Tapback Backdrop */}
        {activeTapbackId && (
          <div
            className="absolute inset-0 z-35"
            onClick={() => setActiveTapbackId(null)}
          />
        )}

        {/* Scrollable Chat Message Area with Swipe-to-Reveal Timestamps */}
        <motion.div
          ref={containerRef}
          onPan={isSwipeDisabled ? undefined : handlePan}
          onPanEnd={isSwipeDisabled ? undefined : handlePanEnd}
          className={`flex-1 overflow-y-auto px-5 pt-[78px] pb-4 scrollbar-hide min-h-0 flex flex-col transition-colors duration-500 relative touch-pan-y select-none ${
            isDark ? 'bg-[#121214]' : 'bg-[#F9F9FB]'
          }`}
          onClick={() => {
            if (activeTapbackId) setActiveTapbackId(null);
          }}
        >
          <div className="text-center text-[10px] text-[#8E8E93] font-medium tracking-wide mb-4 mt-2 shrink-0 select-none">
            {timestamp}
          </div>
          {messages.map((m, index) => {
            const isLastInGroup = index === messages.length - 1 || messages[index + 1].role !== m.role;
            const isUser = m.role === 'user';
            const isTapbackOpen = activeTapbackId === m.id;

            return (
              <motion.div
                key={m.id}
                animate={{ x: isSwipeDisabled || m.isGame ? 0 : swipeOffset }}
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 32,
                  mass: 0.6
                }}
                className={`relative flex w-full shrink-0 items-center ${
                  isUser ? 'justify-end' : 'justify-start'
                } ${!isLastInGroup ? 'mb-[2px]' : 'mb-3'}`}
              >
                {/* iMessage Tapback Reaction Pill */}
                <AnimatePresence>
                  {isTapbackOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.6, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.7, y: 8 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                      className={`absolute ${
                        isUser ? 'right-0' : 'left-0'
                      } -top-[52px] z-50 flex items-center gap-1 px-3 h-[46px] rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.18)] backdrop-blur-2xl border ${
                        isDark
                          ? 'bg-[#2C2C2E]/95 border-[#3A3A3C]'
                          : 'bg-white/95 border-[#E5E5EA]'
                      }`}
                    >
                      {['❤️', '🔥', '👍', '💡', '😂'].map((emoji, i) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReaction(m.id, emoji);
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer select-none relative ${
                            m.reaction === emoji
                              ? (isDark ? 'bg-white/20' : 'bg-black/[0.08]')
                              : (isDark ? 'hover:bg-white/10' : 'hover:bg-black/[0.05]')
                          }`}
                        >
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 24,
                              delay: i * 0.03
                            }}
                            whileHover={{ scale: 1.3, y: -2 }}
                            whileTap={{ scale: 0.85 }}
                            className="inline-block text-[18px] leading-none"
                          >
                            {emoji}
                          </motion.span>
                        </button>
                      ))}

                      {/* Dual tail bubbles (authentic iOS Tapback tail) */}
                      <div
                        className={`absolute -bottom-1.5 ${
                          isUser ? 'right-6' : 'left-6'
                        } w-3.5 h-3.5 rounded-full border shadow-sm ${
                          isDark
                            ? 'bg-[#2C2C2E] border-[#3A3A3C]'
                            : 'bg-white border-[#E5E5EA]'
                        }`}
                      />
                      <div
                        className={`absolute -bottom-3.5 ${
                          isUser ? 'right-7' : 'left-7'
                        } w-1.5 h-1.5 rounded-full border shadow-sm ${
                          isDark
                            ? 'bg-[#2C2C2E] border-[#3A3A3C]'
                            : 'bg-white border-[#E5E5EA]'
                        }`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>



                {/* Elastic Draggable Message Bubble */}
                <ElasticMessageBubble
                  message={m}
                  isUser={isUser}
                  isDark={isDark}
                  isLastInGroup={isLastInGroup}
                  isTapbackOpen={isTapbackOpen}
                  onOpenTapback={(id) => setActiveTapbackId(id)}
                  onCloseTapback={() => setActiveTapbackId(null)}
                  onLongPressStart={(id) => startLongPress(id)}
                  onLongPressCancel={cancelLongPress}
                  triggerHaptic={triggerHaptic}
                  onAlexReaction={(reaction) => handleReaction(m.id, reaction)}
                />



                {/* Swipe-revealed iOS Timestamp (Desktop only, disabled during game) */}
                {!isSwipeDisabled && (
                  <div
                    className="absolute right-[-62px] top-1/2 -translate-y-1/2 text-[10px] font-medium tracking-tight text-[#8E8E93] select-none pointer-events-none whitespace-nowrap transition-opacity duration-150"
                    style={{
                      opacity: Math.min(1, Math.max(0, (Math.abs(swipeOffset) - 10) / 30))
                    }}
                  >
                    {m.timeStr || ''}
                  </div>
                )}
              </motion.div>
            );
          })}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                key="typing-indicator"
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                className="flex w-full justify-start mt-1"
              >
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Suggestion Chips */}
        <div
          className={`relative border-t shrink-0 h-[44px] flex items-center overflow-hidden transition-colors duration-500 ${
            isDark ? 'bg-[#1C1C1E] border-[rgba(255,255,255,0.08)]' : 'bg-white border-[#F2F2F7]'
          }`}
        >
          {/* Left Fade Overlay */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-10 z-10 transition-opacity duration-200 pointer-events-none ${
              showLeftArrow ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              background: isDark
                ? 'linear-gradient(to right, #1C1C1E, rgba(28,28,30,0.85), transparent)'
                : 'linear-gradient(to right, #ffffff, rgba(255,255,255,0.85), transparent)'
            }}
          />

          {/* Left Scroll Arrow */}
          <button
            type="button"
            onClick={() => scrollSuggestions('left')}
            className={`absolute left-1.5 top-1/2 -translate-y-1/2 shadow-sm rounded-full w-6 h-6 flex items-center justify-center transition-all duration-200 z-20 cursor-pointer hidden md:flex ${
              isDark
                ? 'bg-[#2C2C2E] border border-[#3A3A3C] text-gray-300 hover:text-white'
                : 'bg-white border border-[#E5E5EA] text-zinc-500 hover:text-[#1C1C1E]'
            } ${showLeftArrow ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-75 pointer-events-none'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-[0.5px]"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          {/* Scrollable Suggestions list */}
          <div
            ref={suggestionsRef}
            className={`flex gap-2 px-6 w-full overflow-x-auto scrollbar-hide items-center py-1 select-none ${
              isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
            } ${!isDragging ? 'scroll-smooth' : ''}`}
            onScroll={checkSuggestionsScroll}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                type="button"
                disabled={isTyping}
                onClick={e => {
                  if (isDragging) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  handleSend(suggestion);
                }}
                className={`rounded-full text-[12px] font-medium px-3.5 py-1.5 whitespace-nowrap transition-all duration-200 active:scale-[0.96] shrink-0 disabled:opacity-40 disabled:pointer-events-none cursor-pointer border ${
                  isDark
                    ? 'bg-[#2C2C2E] hover:bg-[#3A3A3C] text-[#F2F2F7] border-[#3A3A3C]'
                    : 'bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] border-[#E5E5EA]'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Right Fade Overlay */}
          <div
            className={`absolute right-0 top-0 bottom-0 w-10 z-10 transition-opacity duration-200 pointer-events-none ${
              showRightArrow ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              background: isDark
                ? 'linear-gradient(to left, #1C1C1E, rgba(28,28,30,0.85), transparent)'
                : 'linear-gradient(to left, #ffffff, rgba(255,255,255,0.85), transparent)'
            }}
          />

          {/* Right Scroll Arrow */}
          <button
            type="button"
            onClick={() => scrollSuggestions('right')}
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 shadow-sm rounded-full w-6 h-6 flex items-center justify-center transition-all duration-200 z-20 cursor-pointer hidden md:flex ${
              isDark
                ? 'bg-[#2C2C2E] border border-[#3A3A3C] text-gray-300 hover:text-white'
                : 'bg-white border border-[#E5E5EA] text-zinc-500 hover:text-[#1C1C1E]'
            } ${showRightArrow ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-75 pointer-events-none'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-[0.5px]"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Input Area with Animated Typing Pill */}
        <div
          className={`p-3 border-t flex gap-2 items-end shrink-0 transition-colors duration-500 relative z-30 ${
            isDark ? 'bg-[#1C1C1E] border-[rgba(255,255,255,0.08)]' : 'bg-white border-[#F2F2F7]'
          }`}
        >
          <ChatAnimatedTypingInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            isDark={isDark}
            disabled={isTyping}
            triggerHaptic={triggerHaptic}
          />
        </div>
      </div>
    </div>
  );
}
