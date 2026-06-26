// ============================================================
//  1. NAVBAR TOGGLE
// ============================================================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
    });
});

// ============================================================
//  2. SCROLL ANIMATIONS (Intersection Observer)
// ============================================================
const animEls = document.querySelectorAll('.animate-on-scroll');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
animEls.forEach(el => observer.observe(el));

// ============================================================
//  3. THREE.JS – 3D MEDICAL CROSS
// ============================================================
const container = document.getElementById('three-container');
if (container) {
    const width = container.clientWidth;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeef2ff);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4, 3, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x2563eb, 0.4);
    fillLight.position.set(-3, 1, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(0, -2, -5);
    scene.add(rimLight);

    // Medical Cross
    const crossGroup = new THREE.Group();

    const matMain = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        roughness: 0.25,
        metalness: 0.1,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.08,
    });
    const matGlow = new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        emissive: 0x3b82f6,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.5,
    });

    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.8, 0.9), matMain);
    vBar.position.y = 0;
    vBar.castShadow = true;
    crossGroup.add(vBar);

    const hBar = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.9, 0.9), matMain);
    hBar.position.y = 0;
    hBar.castShadow = true;
    crossGroup.add(hBar);

    const ringGeo = new THREE.TorusGeometry(1.5, 0.08, 16, 48);
    const ringMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.15,
        metalness: 0.3,
        roughness: 0.4,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0;
    crossGroup.add(ring);

    const glowSphere = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), matGlow);
    glowSphere.position.y = 0;
    crossGroup.add(glowSphere);

    scene.add(crossGroup);

    // Floating Particles
    const particleCount = 80;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 8;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMat = new THREE.PointsMaterial({
        color: 0x3b82f6,
        size: 0.06,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Shadow
    const shadowGeo = new THREE.RingGeometry(1.2, 2.0, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
        color: 0xbfdbfe,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
        depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.6;
    scene.add(shadow);

    // Animation
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.008;

        crossGroup.rotation.y += 0.008;
        crossGroup.rotation.x = Math.sin(time * 0.3) * 0.06;
        crossGroup.rotation.z = Math.cos(time * 0.4) * 0.04;

        const pulse = 0.6 + 0.4 * Math.sin(time * 2);
        glowSphere.material.emissiveIntensity = 0.2 + 0.3 * pulse;
        glowSphere.scale.setScalar(0.9 + 0.1 * pulse);

        ring.rotation.z += 0.01;

        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            const idx = i * 3;
            positions[idx + 1] += Math.sin(time + i) * 0.0006;
            if (positions[idx + 1] > 2.5) positions[idx + 1] = -2.5;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.rotation.y += 0.001;

        renderer.render(scene, camera);
    }
    animate();

    // Resize
    function handleResize() {
        const w = container.clientWidth;
        const h = container.clientHeight || 400;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 100);
}

// ============================================================
//  4. FETCH & RENDER PORTFOLIO DATA FROM BACKEND
// ============================================================
const API_URL = window.location.origin + '/api/portfolio';

async function loadPortfolioData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();

        // Update profile
        document.getElementById('clientNameDisplay').textContent = data.name;
        document.getElementById('clientBioDisplay').textContent = data.bio;
        document.getElementById('instituteDisplay').textContent = data.institute;
        document.getElementById('yearDisplay').textContent = data.degreeYear || '2025';

        // Update hero title
        const heroTitle = document.querySelector('.hero-content h1');
        const lastName = data.name.split(' ').pop();
        heroTitle.innerHTML = `Muhammad <span class="highlight">${lastName}</span>`;

        // Update logo
        const logo = document.querySelector('.logo');
        const first = data.name.split(' ')[0][0];
        logo.innerHTML = `${first}.<span>${lastName}</span>`;

        // Update certificates
        const certGrid = document.getElementById('certGrid');
        const certNames = data.certificates || [
            'Community Action For Disaster Response',
            'Basic Community Safety Online Training',
            'Certificate of Achievement',
            'Dispenser & Pharmacy Technician'
        ];
        const issuers = [
            'Punjab Emergency Service',
            'Punjab Emergency Service',
            'Aleena College',
            'Aleena Institute of Medical Sciences'
        ];
        const icons = ['fa-shield-alt', 'fa-users', 'fa-trophy', 'fa-prescription-bottle-alt'];
        const placeholders = [
            'Disaster+Response',
            'Community+Safety',
            'Achievement',
            'Pharmacy+Tech'
        ];

        certGrid.innerHTML = '';
        certNames.forEach((name, index) => {
            const card = document.createElement('div');
            card.className = 'cert-card';
            card.innerHTML = `
                <div class="cert-icon"><i class="fas ${icons[index % icons.length]}"></i></div>
                <h4>${name}</h4>
                <p class="issuer">${issuers[index % issuers.length]}</p>
                <div class="cert-img-placeholder">
                    <img src="https://placehold.co/400x300/e2e8f0/475569?text=${placeholders[index % placeholders.length]}" alt="${name}" />
                </div>
            `;
            certGrid.appendChild(card);
        });

        // Fill admin form with current data
        document.getElementById('clientName').value = data.name;
        document.getElementById('clientInstitute').value = data.institute;
        document.getElementById('clientBio').value = data.bio;
        if (data.certificates && data.certificates.length >= 4) {
            document.getElementById('cert1').value = data.certificates[0] || '';
            document.getElementById('cert2').value = data.certificates[1] || '';
            document.getElementById('cert3').value = data.certificates[2] || '';
            document.getElementById('cert4').value = data.certificates[3] || '';
        }

    } catch (error) {
        console.error('Error loading portfolio:', error);
        // Fallback to default values (already present in HTML)
    }
}

// ============================================================
//  5. ADMIN PANEL – UPDATE DATA VIA API
// ============================================================
const adminToggle = document.getElementById('adminToggle');
const adminPanel = document.getElementById('adminPanel');
let adminVisible = false;

adminToggle.addEventListener('click', () => {
    adminVisible = !adminVisible;
    adminPanel.classList.toggle('active', adminVisible);
    adminToggle.innerHTML = adminVisible ?
        '<i class="fas fa-times"></i> Close' :
        '<i class="fas fa-user-cog"></i> Admin';
});

document.getElementById('adminForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageEl = document.getElementById('adminMessage');

    const updatedData = {
        name: document.getElementById('clientName').value.trim(),
        institute: document.getElementById('clientInstitute').value.trim(),
        bio: document.getElementById('clientBio').value.trim(),
        certificates: [
            document.getElementById('cert1').value.trim(),
            document.getElementById('cert2').value.trim(),
            document.getElementById('cert3').value.trim(),
            document.getElementById('cert4').value.trim()
        ],
        degreeYear: '2025'
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        const result = await response.json();
        if (response.ok) {
            messageEl.style.color = 'green';
            messageEl.textContent = '✅ Portfolio updated successfully!';
            // Reload data to refresh the UI
            loadPortfolioData();
            // Close admin panel
            adminPanel.classList.remove('active');
            adminVisible = false;
            adminToggle.innerHTML = '<i class="fas fa-user-cog"></i> Admin';
        } else {
            messageEl.style.color = 'red';
            messageEl.textContent = '❌ Error: ' + (result.error || 'Unknown error');
        }
    } catch (error) {
        messageEl.style.color = 'red';
        messageEl.textContent = '❌ Network error: ' + error.message;
    }
});

// ============================================================
//  6. NAVBAR SCROLL EFFECT
// ============================================================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 60) {
        navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,0.08)';
        navbar.style.borderBottom = '1px solid rgba(0,0,0,0.06)';
    } else {
        navbar.style.boxShadow = 'none';
        navbar.style.borderBottom = '1px solid rgba(0,0,0,0.05)';
    }
});

// ============================================================
//  7. INIT – LOAD DATA ON PAGE LOAD
// ============================================================
document.addEventListener('DOMContentLoaded', loadPortfolioData);
