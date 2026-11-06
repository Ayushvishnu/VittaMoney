
import React, { useEffect, useRef } from "react";
import "./DiwaliEffect.css";

const AUDIO_FILES = {
  lift: [
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/329180/lift1.mp3",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/329180/lift2.mp3",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/329180/lift3.mp3",
  ],
  burst: [
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/329180/burst1.mp3",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/329180/burst2.mp3",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/329180/burst-sm-1.mp3",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/329180/burst-sm-2.mp3",
  ],
  crackle: [
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/329180/crackle1.mp3",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/329180/crackle-sm-1.mp3",
  ],
};

const COLORS = [
  "#fff7dc",
  "#ffd166",
  "#ffbd59",
  "#ff8b45",
  "#ff5e5e",
  "#f8a5ff",
  "#a8e6ff",
  "#c5ffb0",
];

const random = (min, max) => Math.random() * (max - min) + min;
const pick = (array) => array[Math.floor(Math.random() * array.length)];

function DiwaliEffect() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });

    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let ratio = 1;
    let frameId;
    let previousTime = 0;
    let lastLaunch = 0;
    let launchDelay = 750;
    let audioUnlocked = false;
    let disposed = false;

    const rockets = [];
    const particles = [];
    const crackles = [];
    const delayedBursts = [];

    const MAX_PARTICLES = 900;
    const MAX_CRACKLES = 450;

    // Create multiple audio players so sounds can overlap.
    const audioPools = {};

    Object.entries(AUDIO_FILES).forEach(([type, urls]) => {
      audioPools[type] = urls.map((url) => {
        const players = [];

        for (let i = 0; i < 3; i++) {
          const audio = new Audio(url);
          audio.preload = "auto";
          audio.volume =
            type === "lift" ? 0.22 :
            type === "burst" ? 0.38 : 0.32;

          players.push(audio);
        }

        return {
          players,
          index: 0,
        };
      });
    });

    function unlockAudio() {
      if (audioUnlocked || disposed) return;

      audioUnlocked = true;

      // Prime the audio elements during the user's first interaction.
      Object.values(audioPools).flat().forEach(({ players }) => {
        players.forEach((audio) => {
          audio.muted = true;

          const promise = audio.play();

          if (promise) {
            promise.then(() => {
              audio.pause();
              audio.currentTime = 0;
              audio.muted = false;
            }).catch(() => {
              audio.muted = false;
            });
          } else {
            audio.muted = false;
          }
        });
      });
    }

    // A click anywhere on the page unlocks sound.
    // It does not launch fireworks or control the animation.
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);

    function playSound(type) {
      if (!audioUnlocked || disposed) return;

      const entries = audioPools[type];
      if (!entries?.length) return;

      const entry = pick(entries);
      const audio = entry.players[entry.index];

      entry.index = (entry.index + 1) % entry.players.length;

      try {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
        audio.play().catch(() => {});
      } catch {
        // Keep the animation running if audio is unavailable.
      }
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();

      width = rect.width;
      height = rect.height;

      ratio = Math.min(window.devicePixelRatio || 1, 1.5);

      if (width < 600) {
        ratio = Math.min(ratio, 1.1);
      }

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    function launchRocket() {
      const x = random(width * 0.08, width * 0.92);
      const targetY = random(height * 0.12, height * 0.55);

      rockets.push({
        x,
        y: height + 5,
        previousY: height + 5,
        targetY,
        speed: random(8.5, 12.5),
        color: pick(COLORS),
        trail: [],
      });

      playSound("lift");
    }

    function addParticle(x, y, color, angle, speed, options = {}) {
      particles.push({
        x,
        y,
        oldX: x,
        oldY: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: options.decay ?? random(0.012, 0.023),
        size: options.size ?? random(1.1, 2.2),
        color,
        gravity: options.gravity ?? 0.035,
        friction: options.friction ?? 0.985,
        streak: options.streak ?? false,
      });
    }

    function createMainExplosion(x, y, color) {
      const mobile = width < 600;
      const count = mobile ? 65 : 105;

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = random(1.8, mobile ? 4.5 : 5.8);

        addParticle(
          x,
          y,
          Math.random() > 0.25 ? color : pick(COLORS),
          angle,
          speed,
          {
            size: random(1.2, mobile ? 2.0 : 2.5),
            decay: random(0.012, 0.019),
            streak: true,
          }
        );
      }

      // Create multiple independent crackling spark clusters.
      const clusterCount = mobile ? 5 : 8;

      for (let i = 0; i < clusterCount; i++) {
        const angle = random(0, Math.PI * 2);
        const distance = random(12, 45);

        delayedBursts.push({
          x: x + Math.cos(angle) * distance,
          y: y + Math.sin(angle) * distance,
          color,
          delay: random(12, 28),
        });
      }

      // Tiny, bright sparks surrounding the main explosion.
      createCrackleSparks(x, y, color, mobile ? 38 : 65);

      if (particles.length > MAX_PARTICLES) {
        particles.splice(0, particles.length - MAX_PARTICLES);
      }

      if (crackles.length > MAX_CRACKLES) {
        crackles.splice(0, crackles.length - MAX_CRACKLES);
      }

      playSound("burst");
    }

    function createCrackleSparks(x, y, color, amount) {
      for (let i = 0; i < amount; i++) {
        const angle = random(0, Math.PI * 2);
        const speed = random(1.2, 4.8);

        crackles.push({
          x: x + random(-5, 5),
          y: y + random(-5, 5),
          oldX: x,
          oldY: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: random(0.035, 0.065),
          size: random(0.7, 1.6),
          color: Math.random() > 0.4 ? "#fff4cf" : color,
          gravity: 0.025,
          friction: 0.95,
          flash: Math.random() > 0.5,
        });
      }
    }

    function updateRockets(step) {
      for (let i = rockets.length - 1; i >= 0; i--) {
        const rocket = rockets[i];

        rocket.previousY = rocket.y;
        rocket.y -= rocket.speed * step;

        rocket.trail.push({
          x: rocket.x,
          y: rocket.y,
        });

        if (rocket.trail.length > 8) {
          rocket.trail.shift();
        }

        for (let j = 0; j < rocket.trail.length; j++) {
          const point = rocket.trail[j];

          ctx.globalAlpha = (j + 1) / rocket.trail.length;
          ctx.fillStyle = rocket.color;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = 1;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 2.2, 0, Math.PI * 2);
        ctx.fill();

        if (rocket.y <= rocket.targetY) {
          createMainExplosion(rocket.x, rocket.y, rocket.color);
          rockets.splice(i, 1);
        }
      }
    }

    function updateParticles(step) {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.oldX = p.x;
        p.oldY = p.y;

        p.x += p.vx * step;
        p.y += p.vy * step;
        p.vy += p.gravity * step;

        p.vx *= Math.pow(p.friction, step);
        p.vy *= Math.pow(p.friction, step);
        p.alpha -= p.decay * step;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.streak) {
          ctx.beginPath();
          ctx.moveTo(p.oldX, p.oldY);
          ctx.lineTo(p.x, p.y);
          ctx.lineWidth = Math.max(0.7, p.size * 0.8);
          ctx.strokeStyle = p.color;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function updateDelayedBursts(step) {
      for (let i = delayedBursts.length - 1; i >= 0; i--) {
        const burst = delayedBursts[i];

        burst.delay -= step;

        if (burst.delay <= 0) {
          createCrackleSparks(
            burst.x,
            burst.y,
            burst.color,
            width < 600 ? 9 : 15
          );

          delayedBursts.splice(i, 1);
        }
      }
    }

    function updateCrackles(step) {
      for (let i = crackles.length - 1; i >= 0; i--) {
        const p = crackles[i];

        p.oldX = p.x;
        p.oldY = p.y;

        p.x += p.vx * step;
        p.y += p.vy * step;
        p.vy += p.gravity * step;

        p.vx *= Math.pow(p.friction, step);
        p.vy *= Math.pow(p.friction, step);
        p.alpha -= p.decay * step;

        if (p.alpha <= 0) {
          crackles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.alpha;
        ctx.strokeStyle = p.color;
        ctx.fillStyle = p.color;
        ctx.lineWidth = Math.max(0.6, p.size);

        // Sharp, short spark trails.
        ctx.beginPath();
        ctx.moveTo(p.oldX, p.oldY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // Bright spark head.
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 1.15, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function animate(timestamp) {
      if (disposed) return;

      const step = previousTime
        ? Math.min((timestamp - previousTime) / 16.67, 2)
        : 1;

      previousTime = timestamp;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 1;

      if (timestamp - lastLaunch > launchDelay) {
        launchRocket();
        lastLaunch = timestamp;
        launchDelay = random(650, 1000);
      }

      updateRockets(step);
      updateParticles(step);
      updateDelayedBursts(step);
      updateCrackles(step);

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      frameId = requestAnimationFrame(animate);
    }

    frameId = requestAnimationFrame(animate);

    return () => {
      disposed = true;

      cancelAnimationFrame(frameId);
      observer.disconnect();

      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);

      Object.values(audioPools).flat().forEach(({ players }) => {
        players.forEach((audio) => {
          audio.pause();
          audio.removeAttribute("src");
          audio.load();
        });
      });

      rockets.length = 0;
      particles.length = 0;
      crackles.length = 0;
      delayedBursts.length = 0;
    };
  }, []);

  return (
    <div className="diwali-effect" aria-hidden="true">
      <canvas ref={canvasRef} className="diwali-canvas" />
    </div>
  );
}

export default DiwaliEffect;
