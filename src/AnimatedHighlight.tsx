import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Copy, Check, Github } from "lucide-react";
import AnimatedTypingInput from "./AnimatedTypingInput";
import TypingInputCode from "./AnimatedTypingInput?raw";

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  isDark?: boolean;
  radius?: number;
}

function MagneticButton({ children, onClick, ariaLabel, isDark, radius = 60 }: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;

    // Physics & Magnetic Parameters from the demo
    const magneticRadius = radius;  
    const pullForce = 0.35;      
    const hoverScale = 1.15;     
    const pressScale = 0.95;     
    const stretchMax = 0.04;     
    const stiffness = 0.12;      
    const damping = 0.25;        

    const state  = { sx: 1, sy: 1, tx: 0, ty: 0, vsx: 0, vsy: 0, vtx: 0, vty: 0 };
    const target = { sx: 1, sy: 1, tx: 0, ty: 0 };

    let rect: DOMRect, center: { x: number; y: number }, down = false, isHovered = false;
    let animationFrameId: number;

    const measure = () => {
      rect = el.getBoundingClientRect();
      center = {
        x: rect.left + rect.width / 2,
        y: rect.top  + rect.height / 2
      };
    };
    measure();

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    } else {
      window.addEventListener('resize', measure);
    }

    const reset = () => {
      isHovered = false;
      el.classList.remove('show-light');
      target.tx = 0;
      target.ty = 0;
      target.sx = 1;
      target.sy = 1;
    };

    const handlePointerMove = (e: PointerEvent) => {
      // Don't pull magnetic button when user is actively selecting text
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        reset();
        return;
      }

      const dx = e.clientX - center.x;
      const dy = e.clientY - center.y;
      const distance = Math.hypot(dx, dy);

      if (distance < magneticRadius) {
        isHovered = true;
        el.classList.add('show-light');
        
        const nx = dx / (rect.width / 2);
        const ny = dy / (rect.height / 2);

        target.tx = dx * pullForce;
        target.ty = dy * pullForce;

        const currentBaseScale = down ? pressScale : hoverScale;
        target.sx = currentBaseScale + Math.abs(nx) * stretchMax;
        target.sy = currentBaseScale + Math.abs(ny) * stretchMax;

        const lightX = 50 + nx * 20;
        const lightY = 50 + ny * 20;
        el.style.setProperty('--lightX', `${lightX}%`);
        el.style.setProperty('--lightY', `${lightY}%`);
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
      if (ro) ro.disconnect();
      window.removeEventListener('resize', measure);
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
  }, []);

  return (
    <div style={{ touchAction: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button
        ref={buttonRef}
        onClick={onClick}
        aria-label={ariaLabel}
        className="magnetic-bubble-btn"
        style={{
          position: 'relative',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          overflow: 'hidden',
          backgroundColor: isDark ? 'rgba(40, 40, 40, 0.6)' : 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          boxShadow: isDark 
            ? '2px 2px 1px 0 rgba(255,255,255,0.08) inset, -1px -1px 1px 1px rgba(255,255,255,0.05) inset, 0 4px 12px rgba(0,0,0,0.5)'
            : '2px 2px 1px 0 rgba(255,255,255,0.7) inset, -1px -1px 1px 1px rgba(255,255,255,0.3) inset, 0 4px 12px rgba(0,0,0,0.05)',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          willChange: 'transform, background',
          color: isDark ? '#ffffff' : '#111111',
          transition: 'background-color 0.5s ease, box-shadow 0.5s ease, color 0.5s ease',
        }}
      >
        <div 
          className="bubble-light-reflection"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `radial-gradient(
              circle at var(--lightX, 50%) var(--lightY, 50%),
              ${isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.9)'} 0%,
              ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)'} 50%,
              rgba(255, 255, 255, 0) 100%
            )`,
            opacity: 0,
            transition: 'opacity 0.2s ease-out',
            pointerEvents: 'none',
          }}
        />
        <div style={{ pointerEvents: 'none', position: 'relative', zIndex: 2, display: 'flex' }}>
          {children}
        </div>
      </button>
    </div>
  );
}

function AnimatedSelectionHighlight({ children, isDark }) {
  const containerRef = useRef(null);
  const [rects, setRects] = useState([]);
  const [pulses, setPulses] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [cursorPos, setCursorPos] = useState(null);

  const getRelativeRects = useCallback((selection) => {
    if (
      !selection ||
      selection.isCollapsed ||
      selection.rangeCount === 0 ||
      !containerRef.current.contains(selection.anchorNode)
    ) {
      return [];
    }
    const range = selection.getRangeAt(0);
    const clientRects = Array.from(range.getClientRects());
    const containerBox = containerRef.current.getBoundingClientRect();
    
    return clientRects.map((r: DOMRect, i) => ({
      id: `${Date.now()}-${i}`,
      top: r.top - containerBox.top,
      left: r.left - containerBox.left,
      width: r.width,
      height: r.height,
    }));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const selection = window.getSelection();
      setRects(getRelativeRects(selection));
    };

    window.addEventListener('resize', handleResize);
    
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
       ro = new ResizeObserver(handleResize);
       ro.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
    };
  }, [getRelativeRects]);

  const triggerPulse = useCallback((x, y, selection) => {
    const activeRects = getRelativeRects(selection);
    if (activeRects.length === 0) return;

    const newPulse = {
      id: Date.now() + Math.random(),
      x, 
      y,
      rects: activeRects,
    };

    setPulses((prev) => [...prev, newPulse]);

    setTimeout(() => {
      setPulses((prev) => prev.filter((p) => p.id !== newPulse.id));
    }, 750);
  }, [getRelativeRects]);

  useEffect(() => {
    const handleSelectionChange = () => {
      setRects(getRelativeRects(window.getSelection()));
    };

    const handlePointerDown = (e) => {
      setIsDragging(true);
      const containerBox = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - containerBox.left;
      const relativeY = e.clientY - containerBox.top;
      
      setCursorPos({ x: relativeX, y: relativeY });
      triggerPulse(relativeX, relativeY, window.getSelection());
    };

    const handlePointerMove = (e) => {
      if (isDragging) {
         const containerBox = containerRef.current.getBoundingClientRect();
         setCursorPos({
           x: e.clientX - containerBox.left,
           y: e.clientY - containerBox.top
         });
      }
    };

    const handlePointerUp = (e) => {
       setIsDragging(false);
       setCursorPos(null);
       
       const containerBox = containerRef.current.getBoundingClientRect();
       const relativeX = e.clientX - containerBox.left;
       const relativeY = e.clientY - containerBox.top;
       triggerPulse(relativeX, relativeY, window.getSelection());
    };

    const handleKeyUp = (e) => {
       if (e.key === 'a' || e.key.includes('Arrow')) {
          const selection = window.getSelection();
          if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
             const range = selection.getRangeAt(0);
             const endRect = range.getBoundingClientRect();
             const containerBox = containerRef.current.getBoundingClientRect();
             
             const pX = endRect.right - containerBox.left;
             const pY = endRect.bottom - containerBox.top;
             
             triggerPulse(pX, pY, selection);
          }
       }
    }

    document.addEventListener("selectionchange", handleSelectionChange);
    
    if (containerRef.current) {
       containerRef.current.addEventListener("pointerdown", handlePointerDown);
       window.addEventListener("pointermove", handlePointerMove);
       window.addEventListener("pointerup", handlePointerUp);
       window.addEventListener("keyup", handleKeyUp);
    }

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      if (containerRef.current) {
         containerRef.current.removeEventListener("pointerdown", handlePointerDown);
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [getRelativeRects, triggerPulse, isDragging]);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <style>{`
        .no-native-select, 
        .no-native-select * {
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Fully suppress native selection overlay */
        .no-native-select::selection,
        .no-native-select *::selection { 
          background: rgba(255, 255, 255, 0.001) !important;
          background-color: rgba(255, 255, 255, 0.001) !important; 
        }
        
        .no-native-select::-moz-selection,
        .no-native-select *::-moz-selection { 
          background: rgba(255, 255, 255, 0.001) !important;
          background-color: rgba(255, 255, 255, 0.001) !important; 
        }

        /* Bubble Button Light Animation */
        .magnetic-bubble-btn.show-light .bubble-light-reflection {
           opacity: 1 !important;
        }
      `}</style>

      {/* Base Selection Highlight */}
      <AnimatePresence>
        {rects.map((r) => (
          <motion.div
            key={`base-${r.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: r.top,
              left: r.left,
              width: r.width,
              height: r.height,
              // Dynamically adjust blend mode based on theme!
              background: isDark ? "rgba(3, 145, 255, 0.6)" : "rgba(3, 145, 255, 0.35)", 
              pointerEvents: "none",
              zIndex: 2, 
              mixBlendMode: isDark ? "screen" : "multiply", 
              borderRadius: 3,
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* Live Dragging Gradient Layer */}
      {isDragging && cursorPos && rects.map((r) => (
          <div
             key={`drag-${r.id}`}
             style={{
               position: "absolute",
               top: r.top,
               left: r.left,
               width: r.width,
               height: r.height,
               pointerEvents: "none",
               zIndex: 3,
               borderRadius: 3,
               background: `radial-gradient(
                  circle 60px at ${cursorPos.x - r.left}px ${cursorPos.y - r.top}px,
                  rgba(73, 255, 255, 0.8) 0%,
                  rgba(73, 255, 255, 0.3) 40%,
                  rgba(73, 255, 255, 0) 100%
                )`,
             }}
          />
      ))}

      {/* Stacking Cyan Pulses */}
      <AnimatePresence>
        {pulses.map((pulse) =>
          pulse.rects.map((r) => (
            <motion.div
              key={`pulse-${pulse.id}-${r.id}`}
              initial={{ 
                 "--pulse-radius": "10px", 
                 opacity: 0.9 
              }}
              animate={{ 
                 "--pulse-radius": "1500px", 
                 opacity: 0 
              }}
              transition={{ 
                 duration: 0.75, 
                 ease: "easeOut" 
              }}
              style={{
                position: "absolute",
                top: r.top,
                left: r.left,
                width: r.width,
                height: r.height,
                pointerEvents: "none",
                zIndex: 4, 
                borderRadius: 3,
                background: `radial-gradient(
                  circle var(--pulse-radius) at ${pulse.x - r.left}px ${pulse.y - r.top}px,
                  rgba(73, 255, 255, 0.6) 0%,
                  rgba(73, 255, 255, 0.3) 50%,
                  rgba(73, 255, 255, 0) 100%
                )`,
              }}
            />
          ))
        )}
      </AnimatePresence>

      <div className="no-native-select" style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

// Icons for context menu
const CopyIcon = () => <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2.5" style={{marginRight: '7px'}} fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const CutIcon = () => <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2.5" style={{marginRight: '7px'}} fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>;
const PasteIcon = () => <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2.5" style={{marginRight: '7px', position: 'relative', top: '-1px'}} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>;

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  divider?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Copy', icon: <CopyIcon />, action: () => console.log('Copy Button Click') },
  { label: 'Paste', icon: <PasteIcon />, action: () => console.log('Paste Button Click') },
  { label: 'Cut', icon: <CutIcon />, action: () => console.log('Cut Button Click') }
];

function CustomContextMenu({ x, y, isDark, isOpen, onClose }: { x: number; y: number; isDark: boolean; isOpen: boolean; onClose: () => void }) {
  const menuRef = useRef<HTMLUListElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (isOpen && menuRef.current) {
      menuRef.current.style.animation = 'none';
      menuRef.current.style.height = 'auto';
      setDimensions({
        width: menuRef.current.scrollWidth,
        height: menuRef.current.scrollHeight
      });
      menuRef.current.style.height = '0';
      menuRef.current.style.animation = '';
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
      window.addEventListener('contextmenu', handleOutsideClick);
      window.addEventListener('blur', onClose);
    }, 10);

    return () => {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('contextmenu', handleOutsideClick);
      window.removeEventListener('blur', onClose);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  let adjustedX = x;
  let adjustedY = y;
  
  if (dimensions.width > 0 && dimensions.height > 0) {
    if (x + dimensions.width > window.innerWidth) adjustedX = window.innerWidth - dimensions.width - 20;
    if (y + dimensions.height > window.innerHeight) adjustedY = window.innerHeight - dimensions.height - 20;
  } else {
    if (x + 200 > window.innerWidth) adjustedX = window.innerWidth - 220;
    if (y + 200 > window.innerHeight) adjustedY = window.innerHeight - 220;
  }

  return (
    <>
      <style>{`
        .contextMenu {
          --menu-border: rgba(255, 255, 255, 0.08);
          --menu-bg: linear-gradient(
            45deg,
            rgba(10, 20, 28, 0.2) 0%,
            rgba(10, 20, 28, 0.7) 100%
          );
          --item-border: rgba(255, 255, 255, 0.1);
          --item-color: #fff;
          --item-bg-hover: rgba(255, 255, 255, 0.1);

          height: 0;
          overflow: hidden;
          background: var(--menu-bg);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          position: fixed;
          top: var(--top);
          left: var(--left);
          animation: menuAnimation 0.4s 0s both;
          transform-origin: left top;
          list-style: none;
          margin: 4px;
          padding: 0;
          display: flex;
          flex-direction: column;
          z-index: 999999999;
          box-shadow: 0 0 0 1px var(--menu-border), 0 2px 2px rgb(0 0 0 / 3%),
            0 4px 4px rgb(0 0 0 / 4%), 0 10px 8px rgb(0 0 0 / 5%),
            0 15px 15px rgb(0 0 0 / 6%), 0 30px 30px rgb(0 0 0 / 7%),
            0 70px 65px rgb(0 0 0 / 9%);
        }

        .contextMenu-item {
          padding: 4px;
        }

        .contextMenu-item[data-divider="top"] {
          border-top: 1px solid var(--item-border);
        }

        .contextMenu-button {
          color: var(--item-color);
          background: transparent;
          border: 0;
          white-space: nowrap;
          border-radius: 4px;
          padding: 6px 24px 6px 7px;
          text-align: left;
          display: flex;
          align-items: center;
          font-size: 14px;
          width: 100%;
          animation: menuItemAnimation 0.2s 0s both;
          font-family: "Inter", system-ui, sans-serif;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .contextMenu-button:hover {
          background-color: var(--item-bg-hover);
        }

        .contextMenu[data-theme="light"] {
          --menu-bg: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.6) 0%,
            rgba(255, 255, 255, 0.95) 100%
          );
          --menu-border: rgba(0, 0, 0, 0.08);
          --item-border: rgba(0, 0, 0, 0.1);
          --item-color: rgb(10, 20, 28);
          --item-bg-hover: rgba(10, 20, 28, 0.09);
        }

        @keyframes menuAnimation {
          0% {
            opacity: 0;
            transform: scale(0.5);
            height: 0;
          }
          100% {
            height: var(--height);
            opacity: 1;
            border-radius: 8px;
            transform: scale(1);
          }
        }

        @keyframes menuItemAnimation {
          0% {
            opacity: 0;
            transform: translateX(-10px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      <ul
        ref={menuRef}
        className="contextMenu"
        data-theme={isDark ? "dark" : "light"}
        style={{
          '--top': `${adjustedY}px`,
          '--left': `${adjustedX}px`,
          '--height': dimensions.height > 0 ? `${dimensions.height}px` : '220px'
        } as React.CSSProperties}
      >
        {MENU_ITEMS.map((item, index) => (
          <li
            key={item.label}
            className="contextMenu-item"
            data-divider={item.divider}
          >
            <button
              className="contextMenu-button"
              style={{ animationDelay: `${index * 0.08}s` }}
              onClick={(e) => {
                e.stopPropagation();
                item.action();
                onClose();
              }}
            >
              {item.icon}
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

const COMPONENT_CODE = `import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

function AnimatedSelectionHighlight({ children, isDark }) {
  const containerRef = useRef(null);
  const [rects, setRects] = useState([]);
  const [pulses, setPulses] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [cursorPos, setCursorPos] = useState(null);

  const getRelativeRects = useCallback((selection) => {
    if (
      !selection ||
      selection.isCollapsed ||
      selection.rangeCount === 0 ||
      !containerRef.current.contains(selection.anchorNode)
    ) {
      return [];
    }
    const range = selection.getRangeAt(0);
    const clientRects = Array.from(range.getClientRects());
    const containerBox = containerRef.current.getBoundingClientRect();
    return clientRects.map((r, i) => ({
      id: \`\${Date.now()}-\${i}\`,
      top: r.top - containerBox.top,
      left: r.left - containerBox.left,
      width: r.width,
      height: r.height,
    }));
  }, []);

  useEffect(() => {
    const handleResize = () => setRects(getRelativeRects(window.getSelection()));
    window.addEventListener('resize', handleResize);
    let ro;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(handleResize);
      ro.observe(containerRef.current);
    }
    return () => { window.removeEventListener('resize', handleResize); if (ro) ro.disconnect(); };
  }, [getRelativeRects]);

  const triggerPulse = useCallback((x, y, selection) => {
    const activeRects = getRelativeRects(selection);
    if (activeRects.length === 0) return;
    const newPulse = { id: Date.now() + Math.random(), x, y, rects: activeRects };
    setPulses((prev) => [...prev, newPulse]);
    setTimeout(() => setPulses((prev) => prev.filter((p) => p.id !== newPulse.id)), 750);
  }, [getRelativeRects]);

  useEffect(() => {
    const handleSelectionChange = () => setRects(getRelativeRects(window.getSelection()));
    const handlePointerDown = (e) => {
      setIsDragging(true);
      const b = containerRef.current.getBoundingClientRect();
      const rx = e.clientX - b.left, ry = e.clientY - b.top;
      setCursorPos({ x: rx, y: ry });
      triggerPulse(rx, ry, window.getSelection());
    };
    const handlePointerMove = (e) => {
      if (isDragging) {
        const b = containerRef.current.getBoundingClientRect();
        setCursorPos({ x: e.clientX - b.left, y: e.clientY - b.top });
      }
    };
    const handlePointerUp = (e) => {
      setIsDragging(false); setCursorPos(null);
      const b = containerRef.current.getBoundingClientRect();
      triggerPulse(e.clientX - b.left, e.clientY - b.top, window.getSelection());
    };
    const handleKeyUp = (e) => {
      if (e.key === 'a' || e.key.includes('Arrow')) {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
          const r = sel.getRangeAt(0).getBoundingClientRect();
          const b = containerRef.current.getBoundingClientRect();
          triggerPulse(r.right - b.left, r.bottom - b.top, sel);
        }
      }
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    if (containerRef.current) containerRef.current.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      if (containerRef.current) containerRef.current.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [getRelativeRects, triggerPulse, isDragging]);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <style>{\`
        .no-native-select::selection, .no-native-select *::selection { background: rgba(255,255,255,0.001) !important; }
        .no-native-select::-moz-selection, .no-native-select *::-moz-selection { background: rgba(255,255,255,0.001) !important; }
      \`}</style>
      <AnimatePresence>
        {rects.map((r) => (
          <motion.div key={\`base-\${r.id}\`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ position: "absolute", top: r.top, left: r.left, width: r.width, height: r.height,
              background: isDark ? "rgba(3, 145, 255, 0.6)" : "rgba(3, 145, 255, 0.35)",
              pointerEvents: "none", zIndex: 2, mixBlendMode: isDark ? "screen" : "multiply", borderRadius: 3 }}
          />
        ))}
      </AnimatePresence>
      {isDragging && cursorPos && rects.map((r) => (
        <div key={\`drag-\${r.id}\`} style={{ position: "absolute", top: r.top, left: r.left, width: r.width, height: r.height,
          pointerEvents: "none", zIndex: 3, borderRadius: 3,
          background: \`radial-gradient(circle 60px at \${cursorPos.x - r.left}px \${cursorPos.y - r.top}px, rgba(73,255,255,0.8) 0%, rgba(73,255,255,0.3) 40%, rgba(73,255,255,0) 100%)\` }}
        />
      ))}
      <AnimatePresence>
        {pulses.map((pulse) => pulse.rects.map((r) => (
          <motion.div key={\`pulse-\${pulse.id}-\${r.id}\`}
            initial={{ "--pulse-radius": "10px", opacity: 0.9 }}
            animate={{ "--pulse-radius": "1500px", opacity: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            style={{ position: "absolute", top: r.top, left: r.left, width: r.width, height: r.height,
              pointerEvents: "none", zIndex: 4, borderRadius: 3,
              background: \`radial-gradient(circle var(--pulse-radius) at \${pulse.x - r.left}px \${pulse.y - r.top}px, rgba(73,255,255,0.6) 0%, rgba(73,255,255,0.3) 50%, rgba(73,255,255,0) 100%)\` }}
          />
        ))}
      </AnimatePresence>
      <div className="no-native-select" style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
`;

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [isCopiedHighlight, setIsCopiedHighlight] = useState(false);
  const [isCopiedInput, setIsCopiedInput] = useState(false);
  const [menuState, setMenuState] = useState({ isOpen: false, x: 0, y: 0 });

  const handleCopyHighlight = useCallback(() => {
    navigator.clipboard.writeText(COMPONENT_CODE).then(() => {
      setIsCopiedHighlight(true);
      setTimeout(() => setIsCopiedHighlight(false), 2500);
    });
  }, []);

  const handleCopyInput = useCallback(() => {
    navigator.clipboard.writeText(TypingInputCode).then(() => {
      setIsCopiedInput(true);
      setTimeout(() => setIsCopiedInput(false), 2500);
    });
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const selection = window.getSelection();
      const hasSelection = selection && !selection.isCollapsed && selection.toString().trim().length > 0;
      
      if (hasSelection) {
        e.preventDefault();
        setMenuState({
          isOpen: true,
          x: e.clientX,
          y: e.clientY
        });
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <div 
      className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500 ease-in-out ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#F5F4F3]'}`}
      style={{
        boxSizing: 'border-box',
        fontSynthesis: 'none',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      {/* GitHub Button */}
      <div className="absolute top-6 left-6 z-50">
        <MagneticButton 
          onClick={() => window.open("https://github.com/davidgalgo/IOS-26-Highlight-Component", "_blank", "noopener,noreferrer")}
          ariaLabel="View source code on GitHub" 
          isDark={isDark}
        >
          <Github size={22} />
        </MagneticButton>
      </div>

      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-50">
        <MagneticButton 
          onClick={() => setIsDark(!isDark)} 
          ariaLabel="Toggle dark mode" 
          isDark={isDark}
        >
          {isDark ? <Moon size={22} /> : <Sun size={22} />}
        </MagneticButton>
      </div>

      <div className="w-full max-w-[576px] px-6 py-32 my-auto box-border flex flex-col justify-center">
        
        {/* Top Decorative Line */}
        <div className="flex flex-col items-center mb-10 md:mb-12">
          <div 
            className={`text-[12px] leading-[125%] uppercase text-center font-semibold opacity-40 mb-3 transition-colors duration-500 ${isDark ? 'text-white' : 'text-[#121212]'}`}
            style={{ fontFamily: '"Inter", system-ui, sans-serif', maxWidth: '140px' }}
          >
            Highlight text to see the effect
          </div>
          <div 
            className="w-[1px] h-[52px] transition-all duration-500"
            style={{
               backgroundImage: isDark 
                  ? 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.25) 100%)'
                  : 'linear-gradient(180deg, transparent 0%, rgba(18, 18, 18, 0.3) 100%)'
            }}
          />
        </div>

        {/* Text Wrapped in our Custom Highlight Component */}
        <AnimatedSelectionHighlight isDark={isDark}>
          <div 
            className={`mb-8 md:mb-10 text-left md:text-justify transition-colors duration-500 ${isDark ? 'text-[#e5e5e5]' : 'text-[#121212]'}`}
            style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize: '16px',
              lineHeight: '150%',
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi alias similique eveniet corrupti cupiditate, saepe magni, distinctio at dolor dignissimos consequatur rerum quasi expedita soluta amet, fugiat quaerat commodi accusamus enim necessitatibus facere cumque dolores quisquam? Vero harum repellendus labore.
          </div>
          
          <div 
            className={`mb-8 md:mb-10 text-left md:text-justify transition-colors duration-500 ${isDark ? 'text-[#e5e5e5]' : 'text-[#121212]'}`}
            style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize: '16px',
              lineHeight: '150%',
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi alias similique eveniet corrupti cupiditate, saepe magni, distinctio at dolor dignissimos consequatur rerum quasi expedita soluta amet, fugiat quaerat commodi accusamus enim necessitatibus facere cumque dolores quisquam? Vero harum repellendus labore.
          </div>
        </AnimatedSelectionHighlight>

        {/* Copy Code Button for Highlight Component */}
        <div className="mt-8 mb-16 flex flex-col items-center">
          <MagneticButton 
            onClick={handleCopyHighlight}
            ariaLabel="Copy highlight component code"
            isDark={isDark}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isCopiedHighlight ? (
                <motion.div key="check"
                  initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex' }}
                >
                  <Check size={22} />
                </motion.div>
              ) : (
                <motion.div key="copy"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex' }}
                >
                  <Copy size={22} />
                </motion.div>
              )}
            </AnimatePresence>
          </MagneticButton>
          <div style={{ height: '22px', overflow: 'hidden', marginTop: '12px', position: 'relative' }}>
            <AnimatePresence mode="wait" initial={false}>
              {isCopiedHighlight ? (
                <motion.span
                  key="copied"
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 12, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className={`text-[11px] leading-[125%] uppercase font-semibold transition-colors duration-500 ${isDark ? 'text-white' : 'text-[#121212]'}`}
                  style={{ fontFamily: '"Inter", system-ui, sans-serif', display: 'block', opacity: 0.7 }}
                >
                  Copied!
                </motion.span>
              ) : (
                <motion.span
                  key="code"
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 12, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className={`text-[11px] leading-[125%] uppercase font-semibold opacity-40 transition-colors duration-500 ${isDark ? 'text-white' : 'text-[#121212]'}`}
                  style={{ fontFamily: '"Inter", system-ui, sans-serif', display: 'block' }}
                >
                  Code
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* New Component Inserted Below Existing */}
        <div className="w-full">
          <AnimatedTypingInput isDark={isDark} />
        </div>

        {/* Copy Code Button for Typing Input Component */}
        <div className="mt-8 flex flex-col items-center">
          <MagneticButton 
            onClick={handleCopyInput}
            ariaLabel="Copy input component code"
            isDark={isDark}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isCopiedInput ? (
                <motion.div key="check"
                  initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex' }}
                >
                  <Check size={22} />
                </motion.div>
              ) : (
                <motion.div key="copy"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex' }}
                >
                  <Copy size={22} />
                </motion.div>
              )}
            </AnimatePresence>
          </MagneticButton>
          <div style={{ height: '22px', overflow: 'hidden', marginTop: '12px', position: 'relative' }}>
            <AnimatePresence mode="wait" initial={false}>
              {isCopiedInput ? (
                <motion.span
                  key="copied"
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 12, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className={`text-[11px] leading-[125%] uppercase font-semibold transition-colors duration-500 ${isDark ? 'text-white' : 'text-[#121212]'}`}
                  style={{ fontFamily: '"Inter", system-ui, sans-serif', display: 'block', opacity: 0.7 }}
                >
                  Copied!
                </motion.span>
              ) : (
                <motion.span
                  key="code"
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 12, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className={`text-[11px] leading-[125%] uppercase font-semibold opacity-40 transition-colors duration-500 ${isDark ? 'text-white' : 'text-[#121212]'}`}
                  style={{ fontFamily: '"Inter", system-ui, sans-serif', display: 'block' }}
                >
                  Code
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      <CustomContextMenu 
        x={menuState.x}
        y={menuState.y}
        isDark={isDark}
        isOpen={menuState.isOpen}
        onClose={() => setMenuState({ ...menuState, isOpen: false })}
      />
    </div>
  );
}