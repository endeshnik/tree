const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');

// UI Controls
const speedInput = document.getElementById('speed');
const sizeInput = document.getElementById('size');
const countInput = document.getElementById('count');
const colorInput = document.getElementById('color');
const toggleBtn = document.getElementById('toggleControls');
const controlsPanel = document.getElementById('controls');

toggleBtn.addEventListener('click', () => {
    controlsPanel.classList.toggle('hidden');
});

let width, height;
let particles = [];
let particleCount = parseInt(countInput.value);

// Config
const config = {
    speed: parseFloat(speedInput.value),
    size: parseFloat(sizeInput.value),
    baseHue: parseFloat(colorInput.value)
};

// Event Listeners for Controls
speedInput.addEventListener('input', (e) => config.speed = parseFloat(e.target.value));
sizeInput.addEventListener('input', (e) => config.size = parseFloat(e.target.value));
colorInput.addEventListener('input', (e) => config.baseHue = parseFloat(e.target.value));
countInput.addEventListener('input', (e) => {
    particleCount = parseInt(e.target.value);
    initParticles();
});

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resize);
resize();

// Mouse Interaction
let isDragging = false;
let lastX = 0;
let rotation = 0;

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

window.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - lastX;
        rotation += deltaX * 0.005;
        lastX = e.clientX;
    }
});

// Touch support
canvas.addEventListener('touchstart', (e) => {
    isDragging = true;
    lastX = e.touches[0].clientX;
});

window.addEventListener('touchend', () => {
    isDragging = false;
});

window.addEventListener('touchmove', (e) => {
    if (isDragging) {
        const deltaX = e.touches[0].clientX - lastX;
        rotation += deltaX * 0.005;
        lastX = e.touches[0].clientX;
    }
});


function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        const h = Math.random();
        const maxR = h * 250;

        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * maxR;

        particles.push({
            h: h,
            y: h * 500 - 250,
            x: Math.cos(angle) * r,
            z: Math.sin(angle) * r,
            colorOffset: Math.random() * 360
        });
    }
}

initParticles();

let globalHue = 0;

function animate() {
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    // Auto rotation if not dragging
    if (!isDragging) {
        rotation += config.speed;
    }

    globalHue += 0.5;

    const projected = particles.map(p => {
        const x = p.x * Math.cos(rotation) - p.z * Math.sin(rotation);
        const z = p.x * Math.sin(rotation) + p.z * Math.cos(rotation);

        const fov = 800;
        const scale = fov / (fov + z + 400);

        return {
            x: x * scale * config.size + cx,
            y: p.y * scale * config.size + cy,
            scale: scale * config.size,
            z: z,
            h: p.h,
            colorOffset: p.colorOffset
        };
    });

    projected.sort((a, b) => b.z - a.z);

    projected.forEach(p => {
        const size = 3 * p.scale;

        // Dynamic color mixing base hue + particle offset
        const hue = (config.baseHue + globalHue + p.colorOffset) % 360;

        ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Star
    const topY = -260;
    const topZ = 0;
    const topX = 0;
    const fov = 800;
    const scale = fov / (fov + topZ + 400);
    const starX = topX * scale * config.size + cx;
    const starY = topY * scale * config.size + cy;

    ctx.fillStyle = `hsl(${(globalHue * 2) % 360}, 100%, 80%)`;
    ctx.beginPath();
    ctx.arc(starX, starY, 8 * scale * config.size, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(animate);
}

animate();
