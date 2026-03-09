const doc = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeText = document.querySelector('.theme-text');
const loadingScreen = document.getElementById('loadingScreen');

function applyTheme(next) {
  doc.dataset.theme = next;
  if (themeText) themeText.textContent = next === 'dark' ? 'Dark' : 'Light';
  localStorage.setItem('theme', next);
}

(function initTheme() {
  const persisted = localStorage.getItem('theme');
  if (persisted === 'light' || persisted === 'dark') applyTheme(persisted);
})();

themeToggle?.addEventListener('click', () => {
  const next = doc.dataset.theme === 'dark' ? 'light' : 'dark';
  document.body.animate(
    [{ clipPath: 'circle(0% at 94% 6%)' }, { clipPath: 'circle(150% at 94% 6%)' }],
    { duration: 560, easing: 'ease-in-out' }
  );
  applyTheme(next);
});

window.addEventListener('load', () => {
  loadingScreen?.classList.add('is-hidden');
});

const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
menuToggle?.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  mainNav?.classList.toggle('open');
});

// reveal animations
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  revealEls.forEach((el) => el.classList.add('reveal-pending'));
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      entry.target.classList.remove('reveal-pending');
      observer.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => {
    el.classList.remove('reveal-pending');
    el.classList.add('in');
  });
}

// magnetic buttons
for (const el of document.querySelectorAll('.magnetic')) {
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${dx * 0.08}px, ${dy * 0.08}px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'translate(0, 0)';
  });
}

// tilt cards
for (const card of document.querySelectorAll('.tilt-card')) {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - .5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - .5) * -8;
    card.style.transform = `rotateX(${y}deg) rotateY(${x}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
}

// project filter
const chips = [...document.querySelectorAll('.chip')];
const projects = [...document.querySelectorAll('.project')];
chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    const filter = chip.dataset.filter;
    projects.forEach((project) => {
      const shown = filter === 'all' || project.dataset.tag.includes(filter);
      project.style.display = shown ? '' : 'none';
    });
  });
});

// testimonials
const quotes = [...document.querySelectorAll('.quote')];
const dotsWrap = document.getElementById('testimonialDots');
let activeIdx = 0;
if (dotsWrap && quotes.length > 0) {
  quotes.forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Show testimonial ${i + 1}`);
    b.addEventListener('click', () => showQuote(i));
    dotsWrap.appendChild(b);
  });
}
const dots = [...(dotsWrap?.querySelectorAll('button') ?? [])];
function showQuote(idx) {
  activeIdx = idx;
  quotes.forEach((q, i) => q.classList.toggle('is-active', i === idx));
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
}
showQuote(0);
setInterval(() => showQuote((activeIdx + 1) % quotes.length), 4200);

// playground drag drop
const orb = document.getElementById('dragOrb');
const dropZone = document.getElementById('dropZone');
const easter = document.getElementById('easterEgg');
orb?.addEventListener('dragstart', (e) => {
  e.dataTransfer?.setData('text/plain', 'orb');
});
dropZone?.addEventListener('dragover', (e) => e.preventDefault());
dropZone?.addEventListener('drop', (e) => {
  e.preventDefault();
  easter?.classList.add('show');
});

// GSAP motion
if (window.gsap) {
  gsap.from('.hero-inner > *', { y: 18, opacity: 0, duration: .7, stagger: .08, ease: 'power2.out', delay: .2 });
}

// Three.js hero
const canvas = document.getElementById('heroCanvas');
if (canvas && window.THREE) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const geo = new THREE.TorusKnotGeometry(1.35, 0.38, 160, 24);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x6783ff,
    metalness: .5,
    roughness: .2,
    transmission: .2,
    thickness: .6,
    clearcoat: .7,
    clearcoatRoughness: .2
  });
  const knot = new THREE.Mesh(geo, mat);
  scene.add(knot);

  const wire = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0x8ef6ea }));
  knot.add(wire);

  const ambient = new THREE.AmbientLight(0xffffff, .65);
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  const rim = new THREE.PointLight(0x5eead4, 1.4, 20);
  key.position.set(3, 2, 4);
  rim.position.set(-2, -1, 3);
  scene.add(ambient, key, rim);

  camera.position.z = 4.8;

  const mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  function render() {
    knot.rotation.y += 0.006 + mouse.x * 0.003;
    knot.rotation.x += 0.003 + mouse.y * 0.002;
    knot.position.x = mouse.x * 0.18;
    knot.position.y = mouse.y * 0.12;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
