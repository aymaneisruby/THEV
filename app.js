import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 20, 100);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById("container3D").appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(50, 50, 50);
directionalLight.castShadow = true;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffddaa, 1, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

const particles = createParticles();
scene.add(particles);

function createParticles() {
  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 500;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 100;
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.5,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
  });

  return new THREE.Points(particleGeometry, particleMaterial);
}

let model;
let rotationSpeed = 0.01;
let isHovered = false;

const loader = new GLTFLoader();
loader.load(
  "./thev.glb",
  (gltf) => {
    model = gltf.scene;
    model.rotation.x = Math.PI / 2;
    model.scale.set(1, 1, 1);

    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xff4444,
      emissive: 0x442222,
      metalness: 0.8,
      roughness: 0.4,
    });

    model.traverse((child) => {
      if (child.isMesh) {
        child.material = baseMaterial;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(model);

    const canvas = renderer.domElement;
    canvas.addEventListener("mousemove", (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      const hoverCheck = x > 0.3 && x < 0.7 && y > 0.3 && y < 0.7;
      if (hoverCheck && !isHovered) {
        isHovered = true;
        baseMaterial.color.set(0x44ff44);
        baseMaterial.emissive.set(0x228822);
      } else if (!hoverCheck && isHovered) {
        isHovered = false;
        baseMaterial.color.set(0xff4444);
        baseMaterial.emissive.set(0x442222);
      }
    });

    canvas.addEventListener("click", () => {
      if (isHovered) {
        rotationSpeed = 0.3;
        setTimeout(() => {
          rotationSpeed = isHovered ? 0.1 : 0.01;
        }, 300);
      }
    });
  },
  undefined,
  (error) => {
    console.error("Error loading model:", error);
  }
);

function animate() {
  requestAnimationFrame(animate);

  if (model) {
    model.rotation.z += rotationSpeed;
    if (isHovered && rotationSpeed < 0.1) {
      rotationSpeed = 0.1;
    } else if (!isHovered && rotationSpeed > 0.01) {
      rotationSpeed = 0.01;
    }
  }

  pointLight.intensity = 1 + 0.5 * Math.sin(Date.now() * 0.005);

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
