"use client";
import { useEffect, useRef } from "react";

export default function ThreeDHome() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cleanup = () => {};
    (async () => {
      // Dynamically import Three.js and OrbitControls
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      const canvas = canvasRef.current;
      if (!canvas) return;
      // --- Setup Scene, Camera, Renderer ---
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050b17);
      scene.fog = new THREE.FogExp2(0x050b17, 0.008);
      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 1.5, 8);
      camera.lookAt(0, 0, 0);
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      // --- Controls ---
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.8;
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.target.set(0, 0.2, 0);
      // --- Lights ---
      const ambient = new THREE.AmbientLight(0x1a2a4a, 0.6);
      scene.add(ambient);
      const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
      mainLight.position.set(2, 3, 2.5);
      mainLight.castShadow = true;
      scene.add(mainLight);
      const backLight = new THREE.PointLight(0x3a7ec5, 0.8);
      backLight.position.set(-1.5, 1, -3);
      scene.add(backLight);
      const colorLight1 = new THREE.PointLight(0x4cd964, 0.5);
      colorLight1.position.set(1.8, 0.5, 1.5);
      scene.add(colorLight1);
      const colorLight2 = new THREE.PointLight(0xffb347, 0.5);
      colorLight2.position.set(-1.5, 1.2, 1.8);
      scene.add(colorLight2);
      const colorLight3 = new THREE.PointLight(0x3e8eff, 0.6);
      colorLight3.position.set(0.5, -1, 2);
      scene.add(colorLight3);
      // --- Core Objects ---
      const coreGeo = new THREE.IcosahedronGeometry(0.65, 0);
      const coreMat = new THREE.MeshStandardMaterial({ color: 0xffaa55, emissive: 0xcc7722, emissiveIntensity: 0.8, metalness: 0.9, roughness: 0.2 });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.castShadow = true;
      scene.add(core);
      // --- Floating rings ---
      const ringGeo1 = new THREE.TorusGeometry(1.1, 0.07, 64, 200);
      const ringMat1 = new THREE.MeshStandardMaterial({ color: 0x4cd964, emissive: 0x1f8a4c, emissiveIntensity: 0.5 });
      const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
      ring1.rotation.x = Math.PI / 2;
      ring1.rotation.z = 0.3;
      scene.add(ring1);
      const ringGeo2 = new THREE.TorusGeometry(1.35, 0.08, 64, 200);
      const ringMat2 = new THREE.MeshStandardMaterial({ color: 0xffb347, emissive: 0xaa6f20, emissiveIntensity: 0.55 });
      const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
      ring2.rotation.x = Math.PI / 2 + 0.2;
      ring2.rotation.z = -0.2;
      scene.add(ring2);
      const ringGeo3 = new THREE.TorusGeometry(1.6, 0.09, 64, 200);
      const ringMat3 = new THREE.MeshStandardMaterial({ color: 0x3e8eff, emissive: 0x1a4cbc, emissiveIntensity: 0.6 });
      const ring3 = new THREE.Mesh(ringGeo3, ringMat3);
      ring3.rotation.x = Math.PI / 2 - 0.15;
      ring3.rotation.z = 0.4;
      scene.add(ring3);
      // Decorative helix ring
      const helixRing = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.05, 48, 160), new THREE.MeshStandardMaterial({ color: 0x88aaff, emissive: 0x2266aa, emissiveIntensity: 0.4, transparent: true }));
      helixRing.rotation.x = 1.2;
      helixRing.rotation.y = 0.5;
      scene.add(helixRing);
      // --- Floating particles ---
      const particleCount = 3000;
      const particlesGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const radius = 2 + Math.random() * 3.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        particlePositions[i*3] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i*3+1] = radius * Math.sin(phi) * Math.sin(theta) * 0.8;
        particlePositions[i*3+2] = radius * Math.cos(phi);
      }
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const particleMaterial = new THREE.PointsMaterial({ color: 0x9fcbff, size: 0.05, transparent: true, blending: THREE.AdditiveBlending });
      const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
      scene.add(particleSystem);
      // Small orbiting cubes
      const orbCount = 40;
      const orbs = [];
      for (let i = 0; i < orbCount; i++) {
        const size = 0.06 + Math.random() * 0.05;
        const cubeMat = new THREE.MeshStandardMaterial({ color: [0x4cd964, 0xffb347, 0x3e8eff][Math.floor(Math.random()*3)], emissiveIntensity: 0.3 });
        const cube = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), cubeMat);
        scene.add(cube);
        orbs.push(cube);
      }
      // Background stars field
      const starCountBG = 1500;
      const starGeo = new THREE.BufferGeometry();
      const starPositions = new Float32Array(starCountBG * 3);
      for (let i = 0; i < starCountBG; i++) {
        starPositions[i*3] = (Math.random() - 0.5) * 200;
        starPositions[i*3+1] = (Math.random() - 0.5) * 100;
        starPositions[i*3+2] = (Math.random() - 0.5) * 80 - 40;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMatBG = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.6 });
      const starsField = new THREE.Points(starGeo, starMatBG);
      scene.add(starsField);
      // --- Animation variables ---
      let time = 0;
      // --- Mouse interaction for lights ---
      let mouseX = 0, mouseY = 0;
      window.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = (event.clientY / window.innerHeight) * 2 - 1;
        colorLight1.intensity = 0.5 + mouseX * 0.3;
        colorLight2.intensity = 0.5 + mouseY * 0.3;
        colorLight3.intensity = 0.6 + Math.abs(mouseX) * 0.2;
      });
      // --- Animate ---
      let animationId = 0;
      function animate() {
        animationId = requestAnimationFrame(animate);
        time += 0.012;
        ring1.rotation.z += 0.008;
        ring1.rotation.y += 0.003;
        ring2.rotation.z -= 0.006;
        ring2.rotation.x = Math.PI / 2 + 0.2 + Math.sin(time * 0.5) * 0.1;
        ring3.rotation.y += 0.005;
        ring3.rotation.x = Math.PI / 2 - 0.15 + Math.cos(time * 0.6) * 0.08;
        helixRing.rotation.x += 0.01;
        helixRing.rotation.z += 0.007;
        const scale = 1 + Math.sin(time * 5) * 0.04;
        core.scale.set(scale, scale, scale);
        particleSystem.rotation.y += 0.0008;
        particleSystem.rotation.x = Math.sin(time * 0.2) * 0.1;
        starsField.rotation.y -= 0.0002;
        orbs.forEach((orb, idx) => {
          const angle = time * 0.9 + idx * 0.5;
          const radius = 2.1 + Math.sin(idx) * 0.4;
          const height = Math.sin(time * 0.7 + idx) * 1.2;
          orb.position.x = Math.cos(angle) * radius;
          orb.position.z = Math.sin(angle) * radius;
          orb.position.y = height * 0.6;
        });
        controls.update();
        renderer.render(scene, camera);
      }
      animate();
      // --- Resize handler ---
      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      window.addEventListener('resize', onWindowResize, false);
      cleanup = () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', onWindowResize);
        renderer.dispose();
      };
    })();
    return () => cleanup();
  }, []);

  return (
    <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0 }} />
  );
}
