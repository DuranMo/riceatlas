// A new sky per visit; the same seed keeps resizing from making it flicker.
const seed = Math.floor(Math.random() * 2 ** 32);

// Broad, uneven paths with occasional branches, rather than compact zigzags.
const SHAPES = [
  {
    points: [[-175,-100],[-115,-35],[-15,-65],[75,-145],[100,-220],[160,-250],[-5,45],[75,100],[50,205],[135,245],[95,10],[165,90]],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[2,6],[6,7],[7,8],[8,9],[2,10],[10,11]],
  },
  {
    points: [[-150,-175],[-120,-75],[-30,-25],[75,-65],[150,-155],[180,-125],[65,55],[105,150],[175,185]],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[3,6],[6,7],[7,8]],
  },
  {
    points: [[-85,-120],[-125,-55],[-35,-10],[5,75],[105,100]],
    edges: [[0,1],[1,2],[2,0],[2,3],[3,4]],
  },
  {
    points: [[-65,-135],[-90,-25],[25,30],[85,130]],
    edges: [[0,1],[1,2],[2,3]],
  },
  {
    points: [[-115,-35],[-35,-65],[30,35],[105,65],[125,125]],
    edges: [[0,1],[1,2],[2,3],[3,4]],
  },
  {
    points: [[-55,20],[55,-20]],
    edges: [[0,1]],
  },
];

const segmentDistance = (point, a, b) => {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(point.x - a.x - t * dx, point.y - a.y - t * dy);
};

export function drawConstellation() {
  const sky = document.querySelector('#constellation');
  if (!sky) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (width < 80 || height < 80) {
    sky.replaceChildren();
    return;
  }
  sky.setAttribute('viewBox', `0 0 ${width} ${height}`);
  let state = seed;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
  const fragment = document.createDocumentFragment();
  const add = (tag, attributes) => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    fragment.append(node);
  };
  const dots = [];
  const lines = [];
  const start = 20;
  const span = Math.max(1, width - start - 24);
  const occupied = [];
  const densityTarget = Math.round(span * height / 190000 * (.85 + random() * .3));
  const target = Math.min(16, Math.max(2, densityTarget) + 1 + Math.floor(random() * 2));
  for (let attempt = 0; occupied.length < target && attempt < 400; attempt++) {
    const shape = SHAPES[Math.floor(random() * SHAPES.length)];
    const scale = .65 + random() * .45;
    const angle = random() * Math.PI * 2;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const x = start + random() * span;
    const y = 30 + random() * Math.max(1, height - 60);
    const points = shape.points.map(([px, py]) => ({
      x: x + (px * cos - py * sin) * scale,
      y: y + (px * sin + py * cos) * scale,
    }));
    const bounds = {
      left: Math.min(...points.map(point => point.x)) - 32,
      right: Math.max(...points.map(point => point.x)) + 32,
      top: Math.min(...points.map(point => point.y)) - 32,
      bottom: Math.max(...points.map(point => point.y)) + 32,
    };
    if (points.some(point => point.x < start || point.x > width - 20 || point.y < 20 || point.y > height - 20)) continue;
    if (occupied.some(other => bounds.left < other.right && bounds.right > other.left && bounds.top < other.bottom && bounds.bottom > other.top)) continue;
    occupied.push(bounds);
    dots.push(...points.map(point => ({ ...point, radius: 1.5 + random() * .6 })));
    for (const [a, b] of shape.edges) lines.push([points[a], points[b]]);
  }
  // Bound work on very large displays; failed placements are always capped too.
  const scatteredDots = Math.min(180, Math.round(span * height / 18000));
  for (let attempt = 0, added = 0; attempt < scatteredDots * 30 && added < scatteredDots; attempt++) {
    const point = { x: start + random() * span, y: 20 + random() * Math.max(1, height - 40) };
    if (dots.some(dot => Math.hypot(dot.x - point.x, dot.y - point.y) < 30)) continue;
    if (lines.some(([a, b]) => segmentDistance(point, a, b) < 25)) continue;
    dots.push({ ...point, radius: 1.1 + random() * .7 });
    added++;
  }
  for (const [a, b] of lines) add('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  for (const dot of dots) add('circle', { cx: dot.x, cy: dot.y, r: dot.radius });
  sky.replaceChildren(fragment);
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(drawConstellation, 120);
});
