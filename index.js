
// Navbar Toggler
const navToggler = document.getElementById('nav-toggler');
const navDualButtons = document.getElementById('nav-dual-buttons');
const togglerIcon = document.getElementById('toggler-icon');

navToggler.addEventListener('click', () => {
    navDualButtons.classList.toggle('hidden');
    togglerIcon.classList.toggle('rotate-180');
});

// GSAP ScrollTrigger Responsive Setup
gsap.registerPlugin(ScrollTrigger);

const track = document.getElementById("horizontal-track");

let getScrollAmount = () => -(track.scrollWidth - window.innerWidth);

let tween;
function setupScrollTrigger() {
    if (window.innerWidth > 768) {
    tween = gsap.to(track, {
        x: getScrollAmount,
        ease: "none",
        scrollTrigger: {
        trigger: ".horizontal-section-wrapper",
        start: "top top",
        end: () => `+=${track.scrollWidth - window.innerWidth}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1
        }
    });
    }
}
setupScrollTrigger();

// Three.js Interactive Background
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: titleAlpha = true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const particleCount = window.innerWidth < 768 ? 1000 : 2500;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

for(let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 60;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const material = new THREE.PointsMaterial({
    size: 0.08,
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.9
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);
camera.position.z = 8;

let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
});

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    particles.rotation.y = elapsedTime * 0.025 + targetX * 2.5;
    particles.rotation.x = elapsedTime * 0.015 + targetY * 2.5;

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});