import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowUp, Plus, Square, ImagePlus, Puzzle, FileText, ChevronDown, Check } from "lucide-react";

interface Spark {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

function ModelLogo({ url }: { url: string }) {
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${url}&sz=64`}
      alt=""
      width={16}
      height={16}
      className="w-4 h-4 rounded-sm object-contain"
    />
  );
}

function MagneticWrapper({ children, radius = 40, pullForce = 0.35, hoverScale = 1.1, pressScale = 0.95, stretchMax = 0.04 }: { children: React.ReactElement<any>, radius?: number, pullForce?: number, hoverScale?: number, pressScale?: number, stretchMax?: number }) {
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

const MODELS = [
  { value: "gpt-5.2", label: "GPT-5.2", icon: <ModelLogo url="openai.com" /> },
  { value: "claude-opus-5.1", label: "Opus 5.1", icon: <ModelLogo url="anthropic.com" /> },
  { value: "gemini-3.6-flash", label: "3.6 Flash", icon: <ModelLogo url="deepmind.google" /> },
  { value: "grok-4.5", label: "Grok 4.5", icon: <ModelLogo url="x.ai" /> },
];

const ACTIONS = [
  { value: "image", label: "Attach image", description: "Add a screenshot or visual reference.", icon: <ImagePlus size={16} /> },
  { value: "skill", label: "Use a skill", description: "Give the agent a specialized workflow.", icon: <Puzzle size={16} /> },
  { value: "context", label: "Add context", description: "Include a file with supporting details.", icon: <FileText size={16} /> },
];

export default function AnimatedTypingInput({ isDark }: { isDark: boolean }) {
  const [text, setText] = useState("");
  const [pulses, setPulses] = useState<{ id: number; x: number; y: number }[]>([]);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [cursorIndex, setCursorIndex] = useState(0);
  const [triggerState, setTriggerState] = useState<number | null>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Tracking physical caret geometry and typing state
  const [caretPos, setCaretPos] = useState({ x: 0, y: 0, h: 24 });
  const [isTyping, setIsTyping] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [sparksEnabled, setSparksEnabled] = useState(false);

  // UI Demo states
  const [actionsOpen, setActionsOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const caretRef = useRef<HTMLSpanElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setCursorIndex(e.target.selectionStart || 0);
    setTriggerState(Date.now()); // Triggers the pulse effect

    // Trigger tactile bounce
    setIsBouncing(true);
    if (bounceTimeoutRef.current) clearTimeout(bounceTimeoutRef.current);
    bounceTimeoutRef.current = setTimeout(() => setIsBouncing(false), 50);

    // Keep caret solid and container glowing while typing
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 500);

    // Keystroke Sparks
    if (sparksEnabled && caretRef.current) {
      const cx = caretRef.current.offsetLeft;
      const cy = caretRef.current.offsetTop;

      const newSparks = Array.from({ length: 3 + Math.floor(Math.random() * 3) }).map(() => ({
        id: Date.now() + Math.random(),
        x: cx,
        y: cy + 12, // roughly center of the line height
        vx: (Math.random() - 0.5) * 50,
        vy: (Math.random() - 0.5) * 50 - 20, // slight upward bias
        size: 2 + Math.random() * 3
      }));

      setSparks(prev => [...prev, ...newSparks]);

      setTimeout(() => {
        setSparks(prev => prev.filter(p => !newSparks.find(n => n.id === p.id)));
      }, 600);
    }
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    setCursorIndex(e.currentTarget.selectionStart || 0);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const updateCaret = useCallback(() => {
    if (caretRef.current) {
      setCaretPos({
        x: caretRef.current.offsetLeft,
        y: caretRef.current.offsetTop,
        h: caretRef.current.offsetHeight || 24,
      });
    }
  }, []);

  // Update physical caret coordinates whenever text or selection changes
  useEffect(() => {
    requestAnimationFrame(updateCaret);
  }, [cursorIndex, text, updateCaret]);

  useEffect(() => {
    // Whenever typing occurs, spawn a pulse exactly at the hidden caret tracker
    if (triggerState && caretRef.current) {
      const x = caretRef.current.offsetLeft;
      const y = caretRef.current.offsetTop;

      const newPulse = {
        id: triggerState + Math.random(),
        x,
        y,
      };

      setPulses((prev) => [...prev, newPulse]);

      setTimeout(() => {
        setPulses((prev) => prev.filter((p) => p.id !== newPulse.id));
      }, 750);
    }
  }, [triggerState]);

  const textStyles: React.CSSProperties = {
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: '16px',
    lineHeight: '150%',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    margin: 0,
  };

  const paddingClass = "px-5 pt-5 pb-3 md:px-6 md:pt-6 md:pb-4";

  return (
    <div className="w-full flex flex-col items-center mt-24">
      {/* Decorative Line Separator */}
      <div className="flex flex-col items-center mb-8">
        <div
          className={`text-[12px] leading-[125%] uppercase text-center font-semibold opacity-40 mb-4 transition-colors duration-500 ${isDark ? 'text-white' : 'text-[#121212]'}`}
          style={{ fontFamily: '"Inter", system-ui, sans-serif', maxWidth: '200px' }}
        >
          Type below to see the effect
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

      <style>{`
        /* Keep native highlight block visibly translucent so text layers underneath are readable */
        .typing-pulse-textarea::selection {
          background-color: ${isDark ? 'rgba(3, 145, 255, 0.4)' : 'rgba(3, 145, 255, 0.2)'} !important;
          color: transparent !important;
        }
      `}</style>

      {/* Main Interactive Box with Tactile Bounce and Energy Glow */}
      <motion.div
        animate={{ scale: isBouncing ? 0.99 : 1 }}
        transition={{ scale: { type: "spring", stiffness: 400, damping: 25 } }}
        className="group relative w-full min-h-[160px] flex flex-col"
      >
        {/* Layer 0: Background, border, glow, and clipped visual text layers */}
        <motion.div
          className="absolute inset-0 rounded-[1.25rem] overflow-hidden transition-colors duration-500 pointer-events-none z-0"
          animate={{
            boxShadow: isTyping
              ? (isDark
                ? 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.01), 0 8px 16px -4px rgba(0, 0, 0, 0.3), 0 0 30px 2px rgba(73, 255, 255, 0.15)'
                : 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02), 0 8px 16px -4px rgba(0, 0, 0, 0.05), 0 0 30px 2px rgba(3, 145, 255, 0.15)')
              : (isDark
                ? 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.01), 0 8px 16px -4px rgba(0, 0, 0, 0.3), 0 0 0px 0px rgba(73, 255, 255, 0)'
                : 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02), 0 8px 16px -4px rgba(0, 0, 0, 0.05), 0 0 0px 0px rgba(3, 145, 255, 0)')
          }}
          transition={{ boxShadow: { duration: 0.4, ease: "easeOut" } }}
          style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          }}
        >
          {/* Visual Layers wrapper mirroring Textarea scrolling */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ transform: `translateY(-${scrollTop}px)` }}
          >
            {/* Layer 1: Base Readable Text */}
            <div
              className={`absolute top-0 left-0 w-full min-h-full ${paddingClass} transition-colors duration-500`}
              style={{
                ...textStyles,
                color: isDark ? '#e5e5e5' : '#121212',
              }}
            >
              {text || <span className="opacity-30">Ask the agent to do something...</span>}
            </div>

            {/* Layer 2: Expanding Pulses Masked Strictly to Text */}
            <AnimatePresence>
              {pulses.map((pulse) => (
                <motion.div
                  key={pulse.id}
                  initial={{ "--pulse-radius": "5px", opacity: 1 } as any}
                  animate={{ "--pulse-radius": "80px", opacity: 0 } as any}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className={`absolute top-0 left-0 w-full min-h-full ${paddingClass}`}
                  style={{
                    ...textStyles,
                    backgroundImage: `radial-gradient(
                      circle var(--pulse-radius) at ${pulse.x}px ${pulse.y + 12}px,
                      rgba(73, 255, 255, 1) 0%,
                      rgba(73, 255, 255, 0.8) 30%,
                      rgba(73, 255, 255, 0) 80%
                    )`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                    zIndex: 2,
                  }}
                >
                  {text}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Layer 3: Invisible Measurement Tracker for Caret Layout */}
            <div
              className={`absolute top-0 left-0 w-full min-h-full ${paddingClass} invisible`}
              style={textStyles}
            >
              {text.substring(0, cursorIndex)}
              {/* Zero-width space guarantees proper inline layout alignment */}
              <span ref={caretRef}>&#8203;</span>
              {text.substring(cursorIndex)}
            </div>

            {/* Layer 3.5: Custom Fluid Glowing Caret */}
            <motion.div
              className="absolute top-0 left-0 w-[2px] rounded-full pointer-events-none z-20"
              style={{
                backgroundColor: isDark ? "#49FFFF" : "#0391FF",
                boxShadow: `0 0 10px 1px ${isDark ? "rgba(73, 255, 255, 0.4)" : "rgba(3, 145, 255, 0.4)"}`
              }}
              initial={false}
              animate={{
                x: caretPos.x,
                y: caretPos.y + (caretPos.h * 0.1), // Centered slightly vertically
                height: caretPos.h * 0.8, // Slightly shorter than line height for aesthetics
                opacity: isTyping ? 1 : [0, 1, 0] // Solid when typing, breathing when idle
              }}
              transition={{
                x: { type: "spring", stiffness: 800, damping: 35, mass: 0.5 },
                y: { type: "spring", stiffness: 800, damping: 35, mass: 0.5 },
                opacity: isTyping
                  ? { duration: 0.1 }
                  : { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
              }}
            />

            {/* Layer 3.8: Keystroke Sparks */}
            <AnimatePresence>
              {sparks.map(spark => (
                <motion.div
                  key={spark.id}
                  initial={{ x: spark.x, y: spark.y, opacity: 1, scale: 1 }}
                  animate={{
                    x: spark.x + spark.vx,
                    y: spark.y + spark.vy,
                    opacity: 0,
                    scale: 0.2
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute rounded-full pointer-events-none z-30"
                  style={{
                    width: spark.size,
                    height: spark.size,
                    backgroundColor: isDark ? "#49FFFF" : "#0391FF",
                    boxShadow: `0 0 8px 2px ${isDark ? "rgba(73, 255, 255, 0.6)" : "rgba(3, 145, 255, 0.6)"}`
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Text Area Section */}
        <div className="relative w-full flex-grow min-h-[100px] z-10">
          {/* Honeypot to absorb iCloud Passwords extension heuristics */}
          <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
            <input type="text" tabIndex={-1} autoComplete="username" />
            <input type="password" tabIndex={-1} autoComplete="current-password" />
            <input type="password" tabIndex={-1} autoComplete="new-password" />
          </div>

          {/* Layer 4: Transparent Textarea capturing User Interactions */}
          <textarea
            id="chat-prompt-input"
            name="chat-prompt-input"
            ref={textAreaRef}
            value={text}
            onChange={handleChange}
            onSelect={handleSelect}
            onScroll={handleScroll}
            className={`typing-pulse-textarea absolute inset-0 w-full h-full ${paddingClass} bg-transparent resize-none focus:outline-none`}
            style={{
              ...textStyles,
              color: "transparent",
              caretColor: "transparent",
            }}
            spellCheck={false}
            autoComplete="nope"
            autoCorrect="off"
            autoCapitalize="off"
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
          />
        </div>

        {/* Action Bar Section */}
        <div className="relative z-40 flex items-center justify-between px-3 pb-3 pt-1 pointer-events-auto">

          <div className="flex items-center gap-1.5 relative">

            {/* ACTIONS DROPDOWN */}
            <div className="relative">
              <MagneticWrapper radius={30} pullForce={0.05} stretchMax={0} hoverScale={1}>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setActionsOpen(!actionsOpen); setModelOpen(false); }}
                  className="select-none outline-none p-1.5 rounded-full transition-colors flex items-center justify-center opacity-80 hover:opacity-100"
                  style={{
                    backgroundColor: actionsOpen
                      ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)')
                      : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'),
                    color: isDark ? '#a3a3a3' : '#525252'
                  }}
                >
                  <motion.span animate={{ rotate: actionsOpen ? 45 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                    <Plus size={16} />
                  </motion.span>
                </button>
              </MagneticWrapper>

              <AnimatePresence>
                {actionsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActionsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="absolute bottom-[calc(100%+8px)] left-0 z-50 w-56 rounded-xl overflow-hidden p-1.5"
                      style={{
                        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        boxShadow: isDark ? '0 10px 40px -10px rgba(0,0,0,0.5)' : '0 10px 40px -10px rgba(0,0,0,0.1)'
                      }}
                    >
                      {ACTIONS.map(action => (
                        <button
                          key={action.value}
                          onClick={() => setActionsOpen(false)}
                          className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors"
                          style={{ color: isDark ? '#e5e5e5' : '#121212' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <span className="mt-0.5 opacity-60">
                            {action.icon}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-medium">{action.label}</span>
                            <span className="block text-xs opacity-60 mt-0.5">{action.description}</span>
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* MODEL DROPDOWN */}
            <div className="relative">
              <MagneticWrapper radius={35} pullForce={0.05} stretchMax={0} hoverScale={1}>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setModelOpen(!modelOpen); setActionsOpen(false); }}
                  className="select-none outline-none flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors opacity-80 hover:opacity-100"
                  style={{
                    color: isDark ? '#a3a3a3' : '#525252',
                    backgroundColor: modelOpen ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)') : 'transparent'
                  }}
                >
                  <span className="opacity-90">{selectedModel.icon}</span>
                  {selectedModel.label}
                  <ChevronDown size={14} className="opacity-50 ml-0.5" />
                </button>
              </MagneticWrapper>

              <AnimatePresence>
                {modelOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setModelOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="absolute bottom-[calc(100%+8px)] left-0 z-50 w-52 rounded-xl overflow-hidden p-1"
                      style={{
                        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        boxShadow: isDark ? '0 10px 40px -10px rgba(0,0,0,0.5)' : '0 10px 40px -10px rgba(0,0,0,0.1)'
                      }}
                    >
                      {MODELS.map(m => (
                        <button
                          key={m.value}
                          onClick={() => { setSelectedModel(m); setModelOpen(false); }}
                          className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors"
                          style={{ color: isDark ? '#e5e5e5' : '#121212' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <span className="flex items-center gap-2 text-sm font-medium">
                            <span className="opacity-90">{m.icon}</span>
                            {m.label}
                          </span>
                          {selectedModel.value === m.value && <Check size={14} className="opacity-60" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2 z-30">
            <MagneticWrapper radius={30} pullForce={0.05} stretchMax={0} hoverScale={1}>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setSparksEnabled(!sparksEnabled)}
                className="select-none outline-none p-1.5 rounded-lg transition-all duration-300 hover:opacity-100 focus:opacity-100"
                style={{
                  opacity: sparksEnabled ? 1 : 0.4,
                  color: sparksEnabled
                    ? (isDark ? "#49FFFF" : "#0391FF")
                    : (isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.6)"),
                  backgroundColor: sparksEnabled
                    ? (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)")
                    : "transparent",
                }}
                title={sparksEnabled ? "Disable sparks" : "Enable sparks"}
              >
                <Sparkles size={16} />
              </button>
            </MagneticWrapper>

            <MagneticWrapper radius={40} pullForce={0.15} stretchMax={0.01} hoverScale={1.05}>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (text.trim() || isLoading) {
                    if (isLoading) {
                      setIsLoading(false);
                      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
                    } else {
                      setIsLoading(true);
                      setText("");
                      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
                      loadingTimerRef.current = setTimeout(() => setIsLoading(false), 2000);
                    }
                  }
                }}
                className="select-none outline-none p-1.5 rounded-full transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!text.trim() && !isLoading}
                style={{
                  backgroundColor: (text.trim() || isLoading)
                    ? (isDark ? '#e5e5e5' : '#121212')
                    : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'),
                  color: (text.trim() || isLoading)
                    ? (isDark ? '#121212' : '#ffffff')
                    : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')
                }}
              >
                <AnimatePresence initial={false} mode="wait">
                  <motion.span
                    key={isLoading ? "stop" : "send"}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.15 }}
                    className="grid place-items-center"
                  >
                    {isLoading ? (
                      <Square size={14} fill="currentColor" />
                    ) : (
                      <ArrowUp size={16} strokeWidth={2.5} />
                    )}
                  </motion.span>
                </AnimatePresence>
              </button>
            </MagneticWrapper>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
