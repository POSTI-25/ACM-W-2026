import * as THREE from 'three';

/** A small reusable SVG pool for quick, hand-inked stunt and speed accents. */
export function createAwardFlightAccents(host: HTMLElement, textHost: HTMLElement = host) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'award-flight-accents');
  svg.setAttribute('aria-hidden', 'true');
  const effects = Array.from({ length: 5 }, () => {
    const group = document.createElementNS(ns, 'g');
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#33221b');
    path.setAttribute('stroke-width', '2.6');
    path.setAttribute('stroke-linecap', 'round');
    group.appendChild(path);
    group.style.opacity = '0';
    svg.appendChild(group);
    return { group, path, born: -Infinity, x: 0, y: 0, angle: 0, kind: 'turn' };
  });
  host.appendChild(svg);
  const projected = new THREE.Vector3();
  let width = 1, height = 1, lastX = 0, lastY = 0, lastTime = -Infinity;
  let lastCue = -Infinity, lastStunt = -Infinity, cursor = 0;
  let turnArmed = true, zoomArmed = true;
  let previousPhase = 0;
  let protectedText: Array<{ left: number; right: number; top: number; bottom: number }> = [];
  const stunts = [.10, .19, .27, .58, .67, .80, .89, .97];
  const spawn = (time: number, x: number, y: number, angle: number, kind: string) => {
    const isOverText = (px: number, py: number) => protectedText.some(r => px > r.left - 32 && px < r.right + 32 && py > r.top - 32 && py < r.bottom + 32);
    if (isOverText(x, y)) {
      const candidates = protectedText.flatMap(r => [
        { x, y: r.top - 44 }, { x, y: r.bottom + 44 },
        { x: r.left - 48, y }, { x: r.right + 48, y },
      ]).filter(p => p.x > 35 && p.x < width - 35 && p.y > 35 && p.y < height - 35 && !isOverText(p.x, p.y));
      candidates.sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
      if (candidates[0]) { x = candidates[0].x; y = candidates[0].y; }
      else return;
    }
    const effect = effects[cursor++ % effects.length];
    Object.assign(effect, { born: time, x, y, angle, kind });
    effect.path.setAttribute('d', kind === 'zoom'
      ? 'M-42-12h-25M-47 0h-34M-42 12h-20'
      : 'M-13-12l-8-13M1-17l1-17M15-12l11-11M0-8l-1 10M-1 9h.1');
  };
  return {
    resize(w: number, h: number) {
      width = w; height = h;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      const frame = host.getBoundingClientRect();
      protectedText = [...textHost.querySelectorAll('h2, p')].map(element => {
        const r = element.getBoundingClientRect();
        return { left: r.left - frame.left, right: r.right - frame.left, top: r.top - frame.top, bottom: r.bottom - frame.top };
      });
      effects.forEach(effect => { effect.born = -Infinity; effect.group.style.opacity = '0'; });
      lastTime = -Infinity;
    },
    update(position: THREE.Vector3, camera: THREE.Camera, time: number, phase: number, bank: number, heart: number) {
      projected.copy(position).project(camera);
      const x = (projected.x + 1) * width / 2, y = (1 - projected.y) * height / 2;
      const dt = time - lastTime;
      const dx = x - lastX, dy = y - lastY;
      const speed = dt > 0 && dt < .2 ? Math.hypot(dx, dy) / dt : 0;
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const visible = x > 20 && x < width - 20 && y > 20 && y < height - 20;
      const fast = width < 640 ? 250 : 420;
      if (Math.abs(bank) < .7) turnArmed = true;
      if (speed < fast * .65 || !visible) zoomArmed = true;
      const stunt = stunts.some(cue => previousPhase < cue && phase >= cue);
      if (visible && heart < .15) {
        if ((stunt || (turnArmed && Math.abs(bank) > 1.15)) && time - lastStunt > .7) {
          spawn(time, x + 38, y - 22, angle * .12, 'turn');
          lastStunt = lastCue = time;
          turnArmed = false;
        } else if (zoomArmed && speed > fast && time - lastCue > .8) {
          spawn(time, x, y, angle, 'zoom');
          lastCue = time;
          zoomArmed = false;
        }
      }
      for (const effect of effects) {
        const age = time - effect.born;
        if (age < 0 || age > .68) { effect.group.style.opacity = '0'; continue; }
        const p = age / .68;
        const scale = (width < 640 ? .78 : 1) * (.72 + .38 * Math.sin(p * Math.PI * .7));
        effect.group.style.opacity = String(.85 * Math.pow(Math.sin(p * Math.PI), .6));
        effect.group.style.transform = `translate(${effect.x}px, ${effect.y - p * 10}px) rotate(${effect.angle}deg) scale(${scale})`;
      }
      lastX = x; lastY = y; lastTime = time; previousPhase = phase;
    },
    dispose() { svg.remove(); },
  };
}
