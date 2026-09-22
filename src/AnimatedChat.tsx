import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Phone, Trash2, ExternalLink } from 'lucide-react';

const suggestions = [
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
      const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#FF453A'];
      particles = Array.from({ length: 55 }, () => ({
        x: width * 0.15 + Math.random() * (width * 0.7),
        y: height + Math.random() * 20,
        radius: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 2,
        vy: -2.5 - Math.random() * 3.5,
        life: 1,
        decay: 0.007 + Math.random() * 0.012
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
          p.x += p.vx + Math.sin(p.y * 0.05) * 0.5;
          p.y += p.vy;
          p.life -= p.decay;

          if (p.life > 0) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.life * fadeAlpha);
            ctx.shadowBlur = 12;
            ctx.shadowColor = p.color;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.5, p.radius * p.life), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
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
  triggerHaptic
}: ElasticMessageBubbleProps) {
  const hasDraggedRef = useRef(false);
  const bubbleColor = isUser ? '#007AFF' : isDark ? '#2C2C2E' : '#E5E5EA';

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
              className={`absolute bottom-0 w-[26px] h-[20px] pointer-events-none ${
                isUser
                  ? '-right-[26px] rounded-bl-[10px]'
                  : '-left-[26px] rounded-br-[10px]'
              }`}
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
  const [isMobile, setIsMobile] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [timestamp, setTimestamp] = useState('');
  const [activeTapbackId, setActiveTapbackId] = useState<string | null>(null);
  const [activeEffect, setActiveEffect] = useState<'confetti' | 'fire' | 'hearts' | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerEffectOnce = (effect: 'confetti' | 'fire' | 'hearts') => {
    const fired = getFiredEffects();
    if (fired.has(effect)) return;
    markEffectAsFired(effect);
    setActiveEffect(effect);
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

  const handlePan = (_: any, info: PanInfo) => {
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
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
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

      {/* Scoped style for dark mode typing indicator */}
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
      `}</style>

      {/* Main Chat Card */}
      <div
        className={`w-full max-w-[576px] rounded-[24px] box-border flex flex-col h-[520px] md:h-[560px] overflow-hidden relative justify-between transition-colors duration-500 ${
          isDark
            ? 'border border-[rgba(255,255,255,0.1)] shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
            : 'border border-[#E5E5EA] shadow-[0_4px_20px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]'
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
          onPan={handlePan}
          onPanEnd={handlePanEnd}
          className="flex-1 overflow-y-auto px-5 pt-[78px] pb-4 scrollbar-hide min-h-0 flex flex-col transition-colors duration-500 relative touch-pan-y select-none"
          style={{ backgroundColor: isDark ? '#121214' : '#F9F9FB' }}
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
                animate={{ x: swipeOffset }}
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
                />



                {/* Swipe-revealed iOS Timestamp */}
                <div
                  className="absolute right-[-62px] top-1/2 -translate-y-1/2 text-[10px] font-medium tracking-tight text-[#8E8E93] select-none pointer-events-none whitespace-nowrap transition-opacity duration-150"
                  style={{
                    opacity: Math.min(1, Math.max(0, (Math.abs(swipeOffset) - 10) / 30))
                  }}
                >
                  {m.timeStr || ''}
                </div>
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

        {/* Input Area */}
        <form
          onSubmit={e => {
            e.preventDefault();
            if (isTyping) return;
            handleSend(input);
          }}
          className={`p-3 border-t flex gap-2 items-center shrink-0 transition-colors duration-500 ${
            isDark ? 'bg-[#1C1C1E] border-[rgba(255,255,255,0.08)]' : 'bg-white border-[#F2F2F7]'
          }`}
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            maxLength={500}
            placeholder="Ask anything..."
            className={`flex-1 text-[16px] md:text-sm rounded-full px-4 py-2 border transition-all duration-200 focus:outline-none ${
              isDark
                ? 'bg-[#2C2C2E] text-white placeholder-[#8E8E93] border-transparent focus:bg-[#3A3A3C] focus:border-[#007AFF]'
                : 'bg-[#F2F2F7] text-[#1C1C1E] placeholder-[#8E8E93] border-transparent focus:bg-white focus:border-[#007AFF]'
            }`}
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="bg-[#007AFF] hover:bg-[#0069D9] disabled:opacity-30 disabled:hover:bg-[#007AFF] text-white rounded-full h-9 w-9 flex items-center justify-center transition-all duration-200 active:scale-[0.96] shrink-0 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-[0.5px]"
            >
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
