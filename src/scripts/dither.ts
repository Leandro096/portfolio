import { reducedMotion } from "./dom";

const canvas = document.getElementById(
  "heroDither",
) as HTMLCanvasElement | null;
const hero = canvas?.parentElement ?? null;

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;   // 0..1, origin bottom-left
uniform float u_energy; // 0..1: how much the cursor is "in play"
uniform float u_pulse;  // 0..1 progress of the deploy ring, <0 when idle
uniform vec2 u_pc;      // ring origin (the pipeline card), 0..1
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform float u_alpha;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x),
             mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0., a = .5;
  for (int i = 0; i < 4; i++) { v += a * vnoise(p); p *= 2.03; a *= .5; }
  return v;
}
// Bayer matrix thresholds without bit ops (GLSL ES 1.00).
float b2(vec2 a){ a = floor(a); return fract(a.x / 2. + a.y * a.y * .75); }
float b4(vec2 a){ return b2(.5 * a) * .25 + b2(a); }
float b8(vec2 a){ return b4(.5 * a) * .25 + b2(a); }

void main(){
  vec2 frag = floor(gl_FragCoord.xy);
  vec2 uv = (frag + .5) / u_res;
  float asp = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * asp, uv.y);
  vec2 m = vec2(u_mouse.x * asp, u_mouse.y);
  vec2 dv = p - m;
  float d = length(dv);

  // ripples radiating from the cursor
  p += normalize(dv + 1e-4) * .05 * u_energy * exp(-d * 4.) * sin(d * 26. - u_time * 2.5);

  // deploy ring expanding from the pipeline card
  float ring = 0.;
  if (u_pulse >= 0.) {
    float r = u_pulse * 1.5;
    float dr = length(vec2(uv.x * asp, uv.y) - vec2(u_pc.x * asp, u_pc.y)) - r;
    ring = exp(-dr * dr * 90.) * (1. - u_pulse);
  }

  float n = fbm(p * 2.4 + vec2(u_time * .04, -u_time * .025));
  float density = mix(.25, 1., pow(uv.x, 1.2));         // sparse on the left, dense on the right
  float base = smoothstep(.25, .85, n) * .7 * density;
  float glow = exp(-d * d * 10.) * u_energy;
  float v = (base + glow * .5 + ring * .6) * smoothstep(0., .3, uv.y); // fade into the next section

  float on = step(b8(frag), v);
  float a = u_alpha * clamp(.35 + v * 1.1, 0., 1.);     // depth: brighter areas are more opaque
  vec3 col = mix(u_c1, u_c2, smoothstep(.45, .95, v + .25 * glow + ring));
  gl_FragColor = vec4(col * a * on, a * on);
}`;

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.trim().replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255) as [
    number,
    number,
    number,
  ];
};

function init(canvas: HTMLCanvasElement, hero: HTMLElement) {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    powerPreference: "low-power",
  });
  if (!gl) return;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = (n: string) => gl.getUniformLocation(prog, n);
  const U = {
    res: u("u_res"),
    time: u("u_time"),
    mouse: u("u_mouse"),
    energy: u("u_energy"),
    pulse: u("u_pulse"),
    pc: u("u_pc"),
    c1: u("u_c1"),
    c2: u("u_c2"),
    alpha: u("u_alpha"),
  };

  const root = document.documentElement;
  const applyTheme = () => {
    const css = getComputedStyle(root);
    gl.uniform3f(U.c1, ...hexToRgb(css.getPropertyValue("--accent")));
    gl.uniform3f(U.c2, ...hexToRgb(css.getPropertyValue("--ok")));
    gl.uniform1f(U.alpha, root.dataset.theme === "light" ? 0.55 : 0.72);
  };

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const cell = r.width < 700 ? 3 : 5;
    canvas.width = Math.max(1, Math.ceil(r.width / cell));
    canvas.height = Math.max(1, Math.ceil(r.height / cell));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.res, canvas.width, canvas.height);
  };

  let tx = 0.7,
    ty = 0.5;
  let mx = tx,
    my = ty;
  let energy = 0;
  let lastMove = -1e9;

  hero.addEventListener(
    "pointermove",
    (e) => {
      const r = canvas.getBoundingClientRect();
      tx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      ty = Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height));
      lastMove = performance.now();
    },
    { passive: true },
  );

  const badge = document.getElementById("pipeBadge");
  const pipe = document.getElementById("pipe");
  let speed = 1;
  let speedTarget = 1;
  let pulseStart = -1;
  const PULSE_MS = 1700;
  const originOfPipe = () => {
    if (!pipe) return [0.75, 0.5] as const;
    const c = canvas.getBoundingClientRect();
    const p = pipe.getBoundingClientRect();
    return [
      (p.left + p.width / 2 - c.left) / c.width,
      1 - (p.top + p.height / 2 - c.top) / c.height,
    ] as const;
  };
  const onPipeState = () => {
    const running = badge?.dataset.state === "running";
    speedTarget = running ? 2 : 0.8;
    if (!running && !reducedMotion) {
      pulseStart = performance.now();
      gl.uniform2f(U.pc, ...originOfPipe());
    }
  };
  if (badge) {
    speedTarget = badge.dataset.state === "running" ? 2 : 0.8;
    new MutationObserver(onPipeState).observe(badge, {
      attributes: true,
      attributeFilter: ["data-state"],
    });
  }

  const draw = (timeSec: number, pulse: number) => {
    gl.uniform1f(U.time, timeSec);
    gl.uniform2f(U.mouse, mx, my);
    gl.uniform1f(U.energy, energy);
    gl.uniform1f(U.pulse, pulse);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  resize();
  applyTheme();

  if (reducedMotion) {
    draw(3, -1);
    new ResizeObserver(() => {
      resize();
      draw(3, -1);
    }).observe(canvas);
    new MutationObserver(() => {
      applyTheme();
      draw(3, -1);
    }).observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return;
  }

  new ResizeObserver(resize).observe(canvas);
  new MutationObserver(applyTheme).observe(root, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  let visible = true;
  let raf = 0;
  let last = 0;
  let simT = 0;

  const frame = (now: number) => {
    raf = 0;
    if (!visible || document.hidden) return;
    raf = requestAnimationFrame(frame);
    if (now - last < 33) return; // ~30 fps
    const dt = last ? (now - last) / 1000 : 0.033;
    last = now;

    speed += (speedTarget - speed) * 0.05;
    simT += dt * speed;

    const idle = now - lastMove > 2500;
    if (idle) {
      tx = 0.5 + 0.36 * Math.sin(simT * 0.23);
      ty = 0.5 + 0.26 * Math.sin(simT * 0.31 + 1);
    }
    const targetEnergy = now - lastMove < 1500 ? 1 : 0.55;
    energy += (targetEnergy - energy) * 0.06;
    mx += (tx - mx) * 0.12;
    my += (ty - my) * 0.12;

    let pulse = -1;
    if (pulseStart >= 0) {
      const k = (now - pulseStart) / PULSE_MS;
      if (k < 1) pulse = k;
      else pulseStart = -1;
    }
    draw(simT, pulse);
  };
  const run = () => {
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
  };

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    run();
  }).observe(hero);
  document.addEventListener("visibilitychange", run);
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    visible = false;
  });
  run();
}

if (canvas && hero) {
  const go = () => {
    const idle = (window as any).requestIdleCallback as
      | ((cb: () => void) => void)
      | undefined;
    (idle ?? ((cb) => setTimeout(cb, 200)))(() => init(canvas, hero));
  };
  if (document.readyState === "complete") go();
  else window.addEventListener("load", go, { once: true });
}

export {};
