// ========================================
// CINEMATIC 3D PORTFOLIO - MAIN SCRIPT
// Author: Ayush Agnihotri
// ========================================

// ===== GLOBAL VARIABLES =====
let scene, camera, renderer, controls;
let particleSystem, cloudParticles = [];
let loadingProgress = 0;
let currentSection = 0;
let isLoading = true;

// Scene objects
let cityObjects = [];
let skyObjects = [];
let roomObjects = [];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initLoading();
    initThreeJS();
    initParticles();
    initLights();
    createSceneObjects();
    initScrollAnimations();
    initNavigation();
    initContactForm();
    initSkillBars();
    
    // Start animation loop
    animate();
    
    // Simulate loading
    simulateLoading();
});

// ===== LOADING SCREEN =====
function initLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.getElementById('loading-progress');
    const percentage = document.getElementById('loading-percentage');
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            isLoading = false;
        }, 2000);
    });
}

function simulateLoading() {
    const progressBar = document.getElementById('loading-progress');
    const percentage = document.getElementById('loading-percentage');
    
    const interval = setInterval(() => {
        loadingProgress += Math.random() * 15;
        if (loadingProgress >= 100) {
            loadingProgress = 100;
            clearInterval(interval);
        }
        
        progressBar.style.width = loadingProgress + '%';
        percentage.textContent = Math.floor(loadingProgress) + '%';
    }, 200);
}

// ===== THREE.JS INITIALIZATION =====
function initThreeJS() {
    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f0f1e, 0.002);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 5, 30);
    camera.lookAt(0, 0, 0);
    
    // Renderer setup
    const canvas = document.getElementById('webgl-canvas');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0f0f1e, 1);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ===== LIGHTING =====
function initLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffa801, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);
    
    // Point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0xff6b9d, 1, 50);
    pointLight1.position.set(-10, 10, 0);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x8b5cf6, 1, 50);
    pointLight2.position.set(10, 10, 0);
    scene.add(pointLight2);
    
    // Hemisphere light for sky
    const hemiLight = new THREE.HemisphereLight(0x4facfe, 0x764ba2, 0.5);
    scene.add(hemiLight);
}

// ===== PARTICLE SYSTEM =====
function initParticles() {
    // Create particle geometry
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const color = new THREE.Color();
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        // Position
        positions[i] = (Math.random() - 0.5) * 100;
        positions[i + 1] = (Math.random() - 0.5) * 100;
        positions[i + 2] = (Math.random() - 0.5) * 100;
        
        // Color (sunset palette)
        const colorChoice = Math.random();
        if (colorChoice < 0.33) {
            color.setHex(0xff6b9d);
        } else if (colorChoice < 0.66) {
            color.setHex(0xffa801);
        } else {
            color.setHex(0x8b5cf6);
        }
        
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Create particle material
    const material = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
}

// ===== SCENE OBJECTS =====
function createSceneObjects() {
    createCityScene();
    createSkyScene();
    createRoomScene();
}

function createCityScene() {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);
    cityObjects.push(ground);
    
    // Create low-poly buildings
    const buildingColors = [0xff6b9d, 0x8b5cf6, 0x4facfe, 0xffa801];
    
    for (let i = 0; i < 20; i++) {
        const height = Math.random() * 15 + 5;
        const width = Math.random() * 3 + 2;
        const depth = Math.random() * 3 + 2;
        
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({
            color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
            roughness: 0.7,
            metalness: 0.3
        });
        
        const building = new THREE.Mesh(geometry, material);
        
        const angle = (i / 20) * Math.PI * 2;
        const radius = Math.random() * 20 + 15;
        
        building.position.x = Math.cos(angle) * radius;
        building.position.z = Math.sin(angle) * radius;
        building.position.y = height / 2;
        
        scene.add(building);
        cityObjects.push(building);
    }
    
    // Create iconic tower (Eiffel Tower inspired)
    const towerGeometry = new THREE.ConeGeometry(2, 20, 4);
    const towerMaterial = new THREE.MeshStandardMaterial({
        color: 0xffa801,
        roughness: 0.5,
        metalness: 0.5,
        emissive: 0xffa801,
        emissiveIntensity: 0.2
    });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.set(0, 10, -10);
    scene.add(tower);
    cityObjects.push(tower);
}

function createSkyScene() {
    // Create cloud particles
    const cloudGeometry = new THREE.SphereGeometry(3, 8, 8);
    const cloudMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
        roughness: 1
    });
    
    for (let i = 0; i < 15; i++) {
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.set(
            (Math.random() - 0.5) * 50,
            Math.random() * 20 + 30,
            (Math.random() - 0.5) * 50
        );
        cloud.scale.set(
            Math.random() * 2 + 1,
            Math.random() + 0.5,
            Math.random() * 2 + 1
        );
        cloud.visible = false;
        scene.add(cloud);
        cloudParticles.push(cloud);
        skyObjects.push(cloud);
    }
}

function createRoomScene() {
    // Room walls
    const wallGeometry = new THREE.BoxGeometry(30, 15, 0.5);
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a3e,
        roughness: 0.9
    });
    
    // Back wall
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.set(0, 7.5, -15);
    backWall.visible = false;
    scene.add(backWall);
    roomObjects.push(backWall);
    
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.visible = false;
    scene.add(floor);
    roomObjects.push(floor);
    
    // Decorative objects
    const sphereGeometry = new THREE.SphereGeometry(2, 16, 16);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6b9d,
        roughness: 0.3,
        metalness: 0.7,
        emissive: 0xff6b9d,
        emissiveIntensity: 0.3
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(-8, 3, -10);
    sphere.visible = false;
    scene.add(sphere);
    roomObjects.push(sphere);
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    // Update scroll progress bar
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = (scrollTop / scrollHeight) * 100;
        
        document.getElementById('scroll-progress-bar').style.width = scrollProgress + '%';
        
        // Determine current section
        const sections = document.querySelectorAll('.content-section');
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                currentSection = index;
                updateActiveNav(index);
            }
        });
        
        // Update scene based on scroll
        updateSceneOnScroll(scrollProgress);
    });
    
    // Animate sections on scroll
    gsap.utils.toArray('.content-section').forEach((section, index) => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power2.out'
        });
    });
    
    // Animate cards
    gsap.utils.toArray('.about-card, .experience-card, .project-card, .achievement-card, .cert-card').forEach((card) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power2.out'
        });
    });
    
    // Animate timeline items
    gsap.utils.toArray('.timeline-item').forEach((item, index) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            x: -30,
            duration: 0.8,
            delay: index * 0.2,
            ease: 'power2.out'
        });
    });
}

function updateSceneOnScroll(progress) {
    // Section 0-1: City scene (0-12.5%)
    if (progress < 12.5) {
        camera.position.y = 5 + (progress / 12.5) * 5;
        camera.position.z = 30 - (progress / 12.5) * 5;
        camera.lookAt(0, 0, 0);
        
        cityObjects.forEach(obj => obj.visible = true);
        cloudParticles.forEach(obj => obj.visible = false);
        roomObjects.forEach(obj => obj.visible = false);
    }
    // Section 2: Education (12.5-25%)
    else if (progress < 25) {
        const localProgress = (progress - 12.5) / 12.5;
        camera.position.y = 10 + localProgress * 5;
        camera.position.z = 25 - localProgress * 5;
        camera.lookAt(0, 5, 0);
    }
    // Section 3-4: Experience & Skills (25-50%)
    else if (progress < 50) {
        const localProgress = (progress - 25) / 25;
        camera.position.y = 15 + localProgress * 10;
        camera.position.z = 20 - localProgress * 10;
        
        // Start showing clouds
        if (localProgress > 0.5) {
            cloudParticles.forEach(obj => obj.visible = true);
            cityObjects.forEach(obj => {
                obj.visible = true;
                const opacity = 1 - (localProgress - 0.5) * 2;
                if (obj.material) obj.material.opacity = Math.max(0, opacity);
            });
        }
    }
    // Section 5: Projects (50-62.5%) - Sky scene
    else if (progress < 62.5) {
        const localProgress = (progress - 50) / 12.5;
        camera.position.y = 25 + localProgress * 10;
        camera.position.z = 10 - localProgress * 5;
        camera.lookAt(0, 30, 0);
        
        cityObjects.forEach(obj => obj.visible = false);
        cloudParticles.forEach(obj => obj.visible = true);
    }
    // Section 6: Achievements (62.5-75%)
    else if (progress < 75) {
        const localProgress = (progress - 62.5) / 12.5;
        camera.position.y = 35 - localProgress * 10;
        camera.position.z = 5 + localProgress * 5;
        camera.lookAt(0, 20, -5);
    }
    // Section 7: Contact (75-100%) - Room scene
    else {
        const localProgress = (progress - 75) / 25;
        camera.position.y = 25 - localProgress * 18;
        camera.position.z = 10 + localProgress * 5;
        camera.lookAt(0, 7, -10);
        
        cloudParticles.forEach(obj => {
            obj.visible = true;
            const opacity = 1 - localProgress;
            if (obj.material) obj.material.opacity = Math.max(0, opacity);
        });
        
        if (localProgress > 0.3) {
            roomObjects.forEach(obj => obj.visible = true);
        }
    }
    
    // Rotate particle system
    if (particleSystem) {
        particleSystem.rotation.y += 0.0002;
    }
}

// ===== NAVIGATION =====
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionIndex = parseInt(link.dataset.section);
            const section = document.getElementById(`section-${sectionIndex}`);
            
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function updateActiveNav(index) {
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => link.classList.remove('active'));
    
    const activeLink = document.querySelector(`.nav-menu a[data-section="${index}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// ===== SKILL BARS ANIMATION =====
function initSkillBars() {
    const skillsSection = document.querySelector('.skills-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateSkillBars();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    if (skillsSection) {
        observer.observe(skillsSection);
    }
}

function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    skillBars.forEach(bar => {
        const progress = bar.dataset.progress;
        setTimeout(() => {
            bar.style.width = progress + '%';
        }, 100);
    });
}

// ===== CONTACT FORM =====
function initContactForm() {
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            
            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    formStatus.className = 'success';
                    formStatus.textContent = '✓ Message sent successfully! I\'ll get back to you soon.';
                    formStatus.style.display = 'block';
                    form.reset();
                    
                    setTimeout(() => {
                        formStatus.style.display = 'none';
                    }, 5000);
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                formStatus.className = 'error';
                formStatus.textContent = '✗ Oops! Something went wrong. Please try again.';
                formStatus.style.display = 'block';
            }
        });
    }
}

// ===== ANIMATION LOOP =====
function animate() {
    requestAnimationFrame(animate);
    
    if (!isLoading) {
        // Rotate particle system
        if (particleSystem) {
            particleSystem.rotation.y += 0.0005;
            particleSystem.rotation.x += 0.0002;
        }
        
        // Animate clouds
        cloudParticles.forEach((cloud, index) => {
            if (cloud.visible) {
                cloud.position.x += Math.sin(Date.now() * 0.0001 + index) * 0.01;
                cloud.position.z += Math.cos(Date.now() * 0.0001 + index) * 0.01;
            }
        });
        
        // Animate city buildings
        cityObjects.forEach((obj, index) => {
            if (obj.visible && obj.geometry && obj.geometry.type === 'BoxGeometry') {
                obj.rotation.y += 0.001;
            }
        });
        
        // Animate room objects
        roomObjects.forEach((obj, index) => {
            if (obj.visible && obj.geometry && obj.geometry.type === 'SphereGeometry') {
                obj.position.y = 3 + Math.sin(Date.now() * 0.001 + index) * 0.5;
                obj.rotation.y += 0.01;
            }
        });
    }
    
    renderer.render(scene, camera);
}

// ===== PERFORMANCE OPTIMIZATION =====
// Throttle scroll events
function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = new Date().getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return func(...args);
    };
}

// ===== EASTER EGGS & INTERACTIONS =====
document.addEventListener('keydown', (e) => {
    // Press 'P' for party mode
    if (e.key === 'p' || e.key === 'P') {
        activatePartyMode();
    }
});

function activatePartyMode() {
    const colors = [0xff6b9d, 0xffa801, 0x8b5cf6, 0x4facfe];
    let colorIndex = 0;
    
    const interval = setInterval(() => {
        scene.background = new THREE.Color(colors[colorIndex]);
        colorIndex = (colorIndex + 1) % colors.length;
    }, 200);
    
    setTimeout(() => {
        clearInterval(interval);
        scene.background = null;
    }, 3000);
}

// ===== UTILITY FUNCTIONS =====
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// ===== CONSOLE MESSAGE =====
console.log('%c🚀 Cinematic Portfolio by Ayush Agnihotri', 'color: #ff6b9d; font-size: 20px; font-weight: bold;');
console.log('%cBuilt with Three.js, GSAP, and ❤️', 'color: #8b5cf6; font-size: 14px;');
console.log('%cPress "P" for a surprise! 🎉', 'color: #ffa801; font-size: 12px;');
