import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  AlertTriangle,
  Ambulance,
  Camera,
  CheckCircle2,
  Compass,
  Flame,
  Info,
  Maximize2,
  Moon,
  Radio,
  Shield,
  Siren,
  Sun,
  X,
  Zap,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { EmergencyUnit, Incident, JunctionNode, PhaseId } from '../types';

interface AnimatedCar {
  id: string;
  mesh: THREE.Group;
  phase: PhaseId;
  direction: 'north' | 'south' | 'east' | 'west';
  currentPos: number;
  targetPos: number;
  isExiting: boolean;
  speed: number;
}

export const LiveCityPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    metrics,
    viewMode,
    setViewMode,
    dayNightRatio,
    setDayNightRatio,
    theme,
    setTheme,
    greenCorridor,
    activeIncidents,
    emergencyUnits,
    junctions,
    resolveIncident,
  } = useSimulation();

  const [cameraPreset, setCameraPreset] = useState<'iso' | 'top' | 'street'>('iso');
  const [selectedEntity, setSelectedEntity] = useState<
    | { type: 'incident'; data: Incident }
    | { type: 'unit'; data: EmergencyUnit }
    | { type: 'junction'; data: JunctionNode }
    | null
  >(null);

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const lightsRef = useRef<{
    ambient: THREE.AmbientLight;
    dirLight: THREE.DirectionalLight;
    streetLamps: THREE.PointLight[];
  } | null>(null);

  const signalLampsRef = useRef<{
    signalNorth: { red: THREE.Mesh; yellow: THREE.Mesh; green: THREE.Mesh };
    signalSouth: { red: THREE.Mesh; yellow: THREE.Mesh; green: THREE.Mesh };
    signalEast: { red: THREE.Mesh; yellow: THREE.Mesh; green: THREE.Mesh };
    signalWest: { red: THREE.Mesh; yellow: THREE.Mesh; green: THREE.Mesh };
  } | null>(null);

  const materialsRef = useRef<{
    groundMat: THREE.MeshStandardMaterial;
    roadMat: THREE.MeshStandardMaterial;
    centerMat: THREE.MeshStandardMaterial;
    bldgMat: THREE.MeshStandardMaterial;
  } | null>(null);

  const carsGroupRef = useRef<THREE.Group | null>(null);
  const animatedCarsRef = useRef<Map<string, AnimatedCar>>(new Map());

  // Incident markers & green corridor route groups
  const incidentMarkersGroupRef = useRef<THREE.Group | null>(null);
  const greenCorridorLineRef = useRef<THREE.Mesh | null>(null);
  const emergencyVehiclesGroupRef = useRef<THREE.Group | null>(null);

  const sharedGeoRef = useRef<{
    body: THREE.BoxGeometry;
    cabin: THREE.BoxGeometry;
    headlight: THREE.BoxGeometry;
    taillight: THREE.BoxGeometry;
    headlightMat: THREE.MeshBasicMaterial;
    taillightMat: THREE.MeshBasicMaterial;
    cabinMat: THREE.MeshStandardMaterial;
  } | null>(null);

  const activeController = viewMode === 'adaptive' ? metrics.adaptive : metrics.fixed;

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x07090f);
    scene.fog = new THREE.FogExp2(0x07090f, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    camera.position.set(38, 32, 42);
    cameraRef.current = camera;

    const isMobile = window.innerWidth < 768;
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.touchAction = 'none';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 12;
    controls.maxDistance = 90;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Lighting
    const ambient = new THREE.AmbientLight(0x1a2640, 1.2);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x8faee8, 1.8);
    dirLight.position.set(40, 60, 30);
    if (!isMobile) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 150;
      dirLight.shadow.camera.left = -40;
      dirLight.shadow.camera.right = 40;
      dirLight.shadow.camera.top = 40;
      dirLight.shadow.camera.bottom = -40;
    }
    scene.add(dirLight);

    // Streetlamps
    const streetLamps: THREE.PointLight[] = [];
    const lampPositions = [
      [-5.8, 6.5, -5.8],
      [5.8, 6.5, -5.8],
      [-5.8, 6.5, 5.8],
      [5.8, 6.5, 5.8],
    ];
    lampPositions.forEach(([lx, ly, lz]) => {
      const pl = new THREE.PointLight(0xffecd0, 2.2, 22);
      pl.position.set(lx, ly, lz);
      scene.add(pl);
      streetLamps.push(pl);

      const postGeo = new THREE.CylinderGeometry(0.1, 0.14, 6.5, 8);
      const postMat = new THREE.MeshStandardMaterial({ color: 0x333b4d, roughness: 0.8 });
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(lx, ly / 2, lz);
      scene.add(post);

      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xfff0d0 })
      );
      bulb.position.set(lx, ly, lz);
      scene.add(bulb);
    });

    lightsRef.current = { ambient, dirLight, streetLamps };

    // Ground and Roads
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 160),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.95, metalness: 0.1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const roadMat = new THREE.MeshStandardMaterial({ color: 0x111622, roughness: 0.8, metalness: 0.2 });
    const roadNS = new THREE.Mesh(new THREE.PlaneGeometry(8, 140), roadMat);
    roadNS.rotation.x = -Math.PI / 2;
    roadNS.position.y = 0.02;
    roadNS.receiveShadow = true;
    scene.add(roadNS);

    const roadEW = new THREE.Mesh(new THREE.PlaneGeometry(140, 8), roadMat);
    roadEW.rotation.x = -Math.PI / 2;
    roadEW.position.y = 0.02;
    roadEW.receiveShadow = true;
    scene.add(roadEW);

    // Center intersection
    const centerIntersection = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshStandardMaterial({ color: 0x141a29, roughness: 0.75 })
    );
    centerIntersection.rotation.x = -Math.PI / 2;
    centerIntersection.position.y = 0.03;
    centerIntersection.receiveShadow = true;
    scene.add(centerIntersection);

    // Dashed road lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffb547 });
    for (let z = -60; z <= 60; z += 4) {
      if (Math.abs(z) > 4.5) {
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 2), lineMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(0, 0.04, z);
        scene.add(dash);
      }
    }
    for (let x = -60; x <= 60; x += 4) {
      if (Math.abs(x) > 4.5) {
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.18), lineMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(x, 0.04, 0);
        scene.add(dash);
      }
    }

    // Zebra Crosswalks
    const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    [-4.8, 4.8].forEach((crossZ) => {
      for (let x = -3.5; x <= 3.5; x += 0.8) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 1.2), whiteLineMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(x, 0.04, crossZ);
        scene.add(stripe);
      }
    });
    [-4.8, 4.8].forEach((crossX) => {
      for (let z = -3.5; z <= 3.5; z += 0.8) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.4), whiteLineMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(crossX, 0.04, z);
        scene.add(stripe);
      }
    });

    // Procedural Buildings
    const bldgMat = new THREE.MeshStandardMaterial({ color: 0x111726, roughness: 0.85, metalness: 0.15 });
    materialsRef.current = { groundMat: ground.material as THREE.MeshStandardMaterial, roadMat, centerMat: centerIntersection.material as THREE.MeshStandardMaterial, bldgMat };
    const winColors = [0x4f8cff, 0x2ee6a6, 0xffb547, 0xffffff];

    const createBuilding = (bx: number, bz: number, bw: number, bd: number, bh: number) => {
      const bldg = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), bldgMat);
      bldg.position.set(bx, bh / 2, bz);
      if (!isMobile) bldg.castShadow = true;
      bldg.receiveShadow = true;
      scene.add(bldg);

      const numWindowsX = Math.floor(bw / 2.5);
      const numWindowsY = Math.floor(bh / 3.0);
      for (let wy = 1; wy < numWindowsY; wy++) {
        for (let wx = 0; wx < numWindowsX; wx++) {
          if (Math.random() > 0.4) {
            const winColor = winColors[Math.floor(Math.random() * winColors.length)];
            const winMesh = new THREE.Mesh(
              new THREE.PlaneGeometry(0.8, 1.0),
              new THREE.MeshBasicMaterial({ color: winColor })
            );
            winMesh.position.set(bx - bw / 2 + 1.2 + wx * 2.2, wy * 3.0, bz + bd / 2 + 0.05);
            scene.add(winMesh);
          }
        }
      }
    };

    createBuilding(16, -16, 16, 16, 24);
    createBuilding(36, -16, 18, 16, 32);
    createBuilding(16, -36, 16, 18, 20);
    createBuilding(-16, -16, 16, 16, 28);
    createBuilding(-36, -16, 18, 16, 22);
    createBuilding(16, 16, 16, 16, 26);
    createBuilding(-16, 16, 16, 16, 30);

    // Traffic Signal Gantries
    const createSignalHead = (x: number, y: number, z: number, rotationY: number) => {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.12, 6, 8),
        new THREE.MeshStandardMaterial({ color: 0x222a3a })
      );
      pole.position.set(x, 3, z);
      scene.add(pole);

      const housing = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 1.8, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x151b26 })
      );
      housing.position.set(x, 5.2, z);
      housing.rotation.y = rotationY;
      scene.add(housing);

      const lensGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.15, 16);
      lensGeo.rotateX(Math.PI / 2);

      const red = new THREE.Mesh(
        lensGeo,
        new THREE.MeshStandardMaterial({ color: 0x331010, emissive: 0x000000, roughness: 0.3 })
      );
      red.position.set(0, 0.55, 0.26);
      housing.add(red);

      const yellow = new THREE.Mesh(
        lensGeo,
        new THREE.MeshStandardMaterial({ color: 0x332810, emissive: 0x000000, roughness: 0.3 })
      );
      yellow.position.set(0, 0, 0.26);
      housing.add(yellow);

      const green = new THREE.Mesh(
        lensGeo,
        new THREE.MeshStandardMaterial({ color: 0x103320, emissive: 0x000000, roughness: 0.3 })
      );
      green.position.set(0, -0.55, 0.26);
      housing.add(green);

      return { red, yellow, green };
    };

    const signalSouth = createSignalHead(4.8, 0, 5.5, 0);
    const signalNorth = createSignalHead(-4.8, 0, -5.5, Math.PI);
    const signalWest = createSignalHead(-5.5, 0, 4.8, -Math.PI / 2);
    const signalEast = createSignalHead(5.5, 0, -4.8, Math.PI / 2);

    signalLampsRef.current = { signalNorth, signalSouth, signalEast, signalWest };

    // Incident Markers Group
    const incidentMarkersGroup = new THREE.Group();
    scene.add(incidentMarkersGroup);
    incidentMarkersGroupRef.current = incidentMarkersGroup;

    // Glowing Green Corridor Line Mesh
    const corridorGeo = new THREE.PlaneGeometry(3.6, 120);
    const corridorMat = new THREE.MeshBasicMaterial({
      color: 0x2ee6a6,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const corridorLine = new THREE.Mesh(corridorGeo, corridorMat);
    corridorLine.rotation.x = -Math.PI / 2;
    corridorLine.position.set(0, 0.05, 0);
    scene.add(corridorLine);
    greenCorridorLineRef.current = corridorLine;

    // Emergency Vehicles Group
    const emergencyVehiclesGroup = new THREE.Group();
    scene.add(emergencyVehiclesGroup);
    emergencyVehiclesGroupRef.current = emergencyVehiclesGroup;

    // Civilian Cars Group
    const carsGroup = new THREE.Group();
    scene.add(carsGroup);
    carsGroupRef.current = carsGroup;

    sharedGeoRef.current = {
      body: new THREE.BoxGeometry(1.6, 0.7, 3.2),
      cabin: new THREE.BoxGeometry(1.3, 0.55, 1.8),
      headlight: new THREE.BoxGeometry(0.25, 0.15, 0.05),
      taillight: new THREE.BoxGeometry(0.25, 0.15, 0.05),
      headlightMat: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      taillightMat: new THREE.MeshBasicMaterial({ color: 0xff3b4e }),
      cabinMat: new THREE.MeshStandardMaterial({ color: 0x151b28, roughness: 0.2 }),
    };

    // Animation Loop
    let animId: number;
    let clock = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      clock += 0.03;

      // Pulse incident markers
      if (incidentMarkersGroupRef.current) {
        incidentMarkersGroupRef.current.children.forEach((marker) => {
          marker.rotation.y += 0.04;
          const s = 1.0 + Math.sin(clock * 3) * 0.25;
          marker.scale.set(s, s, s);
        });
      }

      // Flash emergency vehicle lights
      if (emergencyVehiclesGroupRef.current) {
        emergencyVehiclesGroupRef.current.children.forEach((ev) => {
          const beacon = ev.getObjectByName('beacon') as THREE.PointLight;
          if (beacon) {
            beacon.intensity = Math.sin(clock * 10) > 0 ? 3.5 : 0.5;
          }
        });
      }

      // Smooth vehicle progress along roads
      animatedCarsRef.current.forEach((car, id) => {
        car.currentPos += (car.targetPos - car.currentPos) * 0.12;

        if (car.isExiting) {
          car.targetPos += 0.45;
          if (car.currentPos > 65) {
            carsGroup.remove(car.mesh);
            animatedCarsRef.current.delete(id);
          }
        }

        if (car.direction === 'south') {
          car.mesh.position.set(-2, 0, car.currentPos);
        } else if (car.direction === 'north') {
          car.mesh.position.set(2, 0, -car.currentPos);
        } else if (car.direction === 'east') {
          car.mesh.position.set(car.currentPos, 0, 2);
        } else if (car.direction === 'west') {
          car.mesh.position.set(-car.currentPos, 0, -2);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      container.innerHTML = '';
      animatedCarsRef.current.clear();
    };
  }, []);

  // Update Day/Night illumination and surface materials
  useEffect(() => {
    if (!lightsRef.current || !sceneRef.current) return;
    const { ambient, dirLight, streetLamps } = lightsRef.current;
    const isNight = dayNightRatio > 0.5;

    // Illumination intensity
    ambient.intensity = 0.5 + (1 - dayNightRatio) * 1.8;
    dirLight.intensity = (1 - dayNightRatio) * 2.6 + 0.3;

    // Day directional light warm sunlight, night cool moonlight
    dirLight.color.setHex(isNight ? 0x8faee8 : 0xfffaed);
    ambient.color.setHex(isNight ? 0x1a2640 : 0xd0e2ff);

    streetLamps.forEach((lamp) => {
      lamp.intensity = isNight ? 2.8 * dayNightRatio : 0.2;
    });

    // Sky & Fog: Day is bright sky, Night is deep dark midnight
    const skyHex = isNight ? 0x07090f : 0xbfdbfe;
    sceneRef.current.background = new THREE.Color(skyHex);
    if (sceneRef.current.fog) {
      sceneRef.current.fog.color = new THREE.Color(skyHex);
      if ('density' in sceneRef.current.fog) {
        (sceneRef.current.fog as THREE.FogExp2).density = isNight ? 0.015 : 0.008;
      }
    }

    // Adapt surface materials
    if (materialsRef.current) {
      const { groundMat, roadMat, centerMat, bldgMat } = materialsRef.current;
      if (isNight) {
        groundMat.color.setHex(0x090d16);
        roadMat.color.setHex(0x111622);
        centerMat.color.setHex(0x141a29);
        bldgMat.color.setHex(0x111726);
      } else {
        groundMat.color.setHex(0xdbe3ed);
        roadMat.color.setHex(0x334155);
        centerMat.color.setHex(0x475569);
        bldgMat.color.setHex(0x94a3b8);
      }
    }
  }, [dayNightRatio]);

  // Update Signal Head Emissive Lighting in real-time
  useEffect(() => {
    if (!signalLampsRef.current) return;
    const { signalNorth, signalSouth, signalEast, signalWest } = signalLampsRef.current;

    const sigA = activeController.signalA;
    const sigB = activeController.signalB;

    const updateSignalLamp = (
      lamps: { red: THREE.Mesh; yellow: THREE.Mesh; green: THREE.Mesh },
      state: 'red' | 'yellow' | 'green'
    ) => {
      const redMat = lamps.red.material as THREE.MeshStandardMaterial;
      const yellowMat = lamps.yellow.material as THREE.MeshStandardMaterial;
      const greenMat = lamps.green.material as THREE.MeshStandardMaterial;

      if (state === 'red') {
        redMat.emissive.setHex(0xff3b4e);
        redMat.emissiveIntensity = 3.5;
        yellowMat.emissive.setHex(0x000000);
        greenMat.emissive.setHex(0x000000);
      } else if (state === 'yellow') {
        redMat.emissive.setHex(0x000000);
        yellowMat.emissive.setHex(0xffb547);
        yellowMat.emissiveIntensity = 3.5;
        greenMat.emissive.setHex(0x000000);
      } else {
        redMat.emissive.setHex(0x000000);
        yellowMat.emissive.setHex(0x000000);
        greenMat.emissive.setHex(0x2ee6a6);
        greenMat.emissiveIntensity = 3.5;
      }
    };

    updateSignalLamp(signalNorth, sigA);
    updateSignalLamp(signalSouth, sigA);
    updateSignalLamp(signalEast, sigB);
    updateSignalLamp(signalWest, sigB);
  }, [activeController.signalA, activeController.signalB]);

  // 3D Incident Markers Update
  useEffect(() => {
    if (!incidentMarkersGroupRef.current) return;
    const group = incidentMarkersGroupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    activeIncidents.forEach((inc) => {
      const marker = new THREE.Group();
      // Floating glowing diamond
      const coneGeo = new THREE.OctahedronGeometry(1.2, 0);
      const isCritical = inc.severity === 'CRITICAL';
      const colorHex = isCritical ? 0xff5c6c : 0xffb547;
      const coneMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        wireframe: true,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.y = 5.5;
      marker.add(cone);

      const light = new THREE.PointLight(colorHex, 2.5, 12);
      light.position.y = 5.5;
      marker.add(light);

      // Position by approach direction
      if (inc.direction === 'Northbound') {
        marker.position.set(2, 0, 10);
      } else if (inc.direction === 'Southbound') {
        marker.position.set(-2, 0, -10);
      } else if (inc.direction === 'Eastbound') {
        marker.position.set(-10, 0, 2);
      } else {
        marker.position.set(10, 0, -2);
      }

      group.add(marker);
    });
  }, [activeIncidents]);

  // Green Corridor 3D Glow Line
  useEffect(() => {
    if (!greenCorridorLineRef.current) return;
    const mesh = greenCorridorLineRef.current;
    const mat = mesh.material as THREE.MeshBasicMaterial;

    if (greenCorridor) {
      mat.opacity = 0.45;
      mat.color.setHex(0x2ee6a6);
      mesh.position.set(0, 0.06, 0);
      mesh.rotation.z = greenCorridor.phaseGranted === 'phaseA' ? 0 : Math.PI / 2;
    } else {
      mat.opacity = 0;
    }
  }, [greenCorridor]);

  // Emergency Vehicles in 3D
  useEffect(() => {
    if (!emergencyVehiclesGroupRef.current) return;
    const group = emergencyVehiclesGroupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const activeUnits = emergencyUnits.filter(
      (u) => u.state === 'Dispatched' || u.state === 'En route' || u.state === 'On scene'
    );

    activeUnits.forEach((unit, idx) => {
      const ev = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(unit.type === 'FIRE' ? 0xff5c6c : unit.type === 'POLICE' ? 0x4f8cff : 0xffffff),
        roughness: 0.3,
        metalness: 0.4,
      });
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 3.8), bodyMat);
      body.position.y = 0.7;
      ev.add(body);

      // Flashing Siren Beacon
      const beaconLight = new THREE.PointLight(unit.type === 'POLICE' ? 0x4f8cff : 0xff5c6c, 3.0, 15);
      beaconLight.name = 'beacon';
      beaconLight.position.set(0, 1.8, 0);
      ev.add(beaconLight);

      // Position along approach
      const pos = unit.state === 'On scene' ? 8.0 : -18.0 - idx * 6;
      ev.position.set(2, 0, pos);
      group.add(ev);
    });
  }, [emergencyUnits]);

  // Synchronize 3D Cars with Queues
  useEffect(() => {
    if (!carsGroupRef.current || !sharedGeoRef.current) return;
    const group = carsGroupRef.current;
    const shared = sharedGeoRef.current;
    const carMap = animatedCarsRef.current;

    const createCarMesh = (color: string) => {
      const carGroup = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.4, metalness: 0.6 });
      const body = new THREE.Mesh(shared.body, bodyMat);
      body.position.y = 0.45;
      carGroup.add(body);

      const cabin = new THREE.Mesh(shared.cabin, shared.cabinMat);
      cabin.position.set(0, 0.9, -0.2);
      carGroup.add(cabin);

      const hlLeft = new THREE.Mesh(shared.headlight, shared.headlightMat);
      hlLeft.position.set(-0.5, 0.5, -1.62);
      carGroup.add(hlLeft);

      const hlRight = new THREE.Mesh(shared.headlight, shared.headlightMat);
      hlRight.position.set(0.5, 0.5, -1.62);
      carGroup.add(hlRight);

      const tlLeft = new THREE.Mesh(shared.taillight, shared.taillightMat);
      tlLeft.position.set(-0.5, 0.5, 1.62);
      carGroup.add(tlLeft);

      const tlRight = new THREE.Mesh(shared.taillight, shared.taillightMat);
      tlRight.position.set(0.5, 0.5, 1.62);
      carGroup.add(tlRight);

      return carGroup;
    };

    const syncQueue = (vehicles: typeof activeController.queueA, phase: PhaseId, isGreen: boolean) => {
      vehicles.slice(0, 20).forEach((v, index) => {
        const queueTarget = isGreen && index === 0 ? 0.0 : -(6.0 + index * 4.2);

        let existing = carMap.get(v.id);
        if (!existing) {
          const mesh = createCarMesh(v.color);
          if (v.direction === 'south') mesh.rotation.y = 0;
          else if (v.direction === 'north') mesh.rotation.y = Math.PI;
          else if (v.direction === 'east') mesh.rotation.y = -Math.PI / 2;
          else if (v.direction === 'west') mesh.rotation.y = Math.PI / 2;

          group.add(mesh);
          existing = {
            id: v.id,
            mesh,
            phase,
            direction: v.direction,
            currentPos: queueTarget - 8,
            targetPos: queueTarget,
            isExiting: false,
            speed: 1.0,
          };
          carMap.set(v.id, existing);
        } else {
          existing.targetPos = queueTarget;
        }
      });
    };

    const isGreenA = activeController.signalA === 'green';
    const isGreenB = activeController.signalB === 'green';

    syncQueue(activeController.queueA, 'phaseA', isGreenA);
    syncQueue(activeController.queueB, 'phaseB', isGreenB);

    const currentQueueIds = new Set([
      ...activeController.queueA.map((v) => v.id),
      ...activeController.queueB.map((v) => v.id),
    ]);

    carMap.forEach((car, id) => {
      if (!currentQueueIds.has(id) && !car.isExiting) {
        car.isExiting = true;
        car.targetPos = 55;
      }
    });
  }, [activeController.queueA, activeController.queueB, activeController.signalA, activeController.signalB]);

  const handleCameraPreset = (preset: 'iso' | 'top' | 'street') => {
    setCameraPreset(preset);
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    if (preset === 'iso') {
      cam.position.set(38, 32, 42);
      ctrl.target.set(0, 0, 0);
    } else if (preset === 'top') {
      cam.position.set(0, 68, 0.1);
      ctrl.target.set(0, 0, 0);
    } else if (preset === 'street') {
      cam.position.set(-8, 3.5, 12);
      ctrl.target.set(0, 2, 0);
    }
    ctrl.update();
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-[#07090F] overflow-hidden">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Green Corridor Banner if active */}
      {greenCorridor && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <div className="bg-[#2EE6A6] text-[#07090F] px-5 py-2.5 rounded-full font-heading font-bold text-xs shadow-2xl flex items-center space-x-2.5 animate-bounce">
            <Zap className="w-4 h-4" />
            <span>🚨 GREEN CORRIDOR ACTIVE — SAFE PREEMPTION GRANTED</span>
            <span className="font-mono-data text-[10px] bg-black/15 px-2 py-0.5 rounded">
              {25 - greenCorridor.secondsElapsed}s left
            </span>
          </div>
        </div>
      )}

      {/* Floating Glass HUD (Top-Left): Junction Status */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-sm pointer-events-auto">
        <div className="glass-panel-elevated p-4 rounded-2xl shadow-2xl border border-[var(--border-light)]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2EE6A6] animate-pulse" />
              <span className="font-heading font-bold text-sm text-white">3D Urban Digital Twin</span>
            </div>
            <span className="font-mono-data text-xs text-[#2EE6A6] font-semibold bg-[#2EE6A6]/10 px-2 py-0.5 rounded border border-[#2EE6A6]/20">
              {metrics.timeOfDayString}
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-[#07090F] p-1 rounded-xl border border-[var(--border)] mb-3">
            <button
              onClick={() => setViewMode('adaptive')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer ${
                viewMode === 'adaptive' ? 'bg-[#2EE6A6] text-[#07090F]' : 'text-[#8A94A9]'
              }`}
            >
              Adaptive Controller
            </button>
            <button
              onClick={() => setViewMode('fixed')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer ${
                viewMode === 'fixed' ? 'bg-[#FFB547] text-[#07090F]' : 'text-[#8A94A9]'
              }`}
            >
              Fixed 25s
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#07090F]/70 p-2.5 rounded-xl border border-[var(--border)]">
              <span className="text-[11px] text-[#8A94A9]">Phase</span>
              <div className="font-mono-data font-bold text-white text-sm mt-0.5">
                {activeController.currentPhase === 'phaseA' ? 'Phase A (N-S)' : 'Phase B (E-W)'}
              </div>
            </div>
            <div className="bg-[#07090F]/70 p-2.5 rounded-xl border border-[var(--border)]">
              <span className="text-[11px] text-[#8A94A9]">Avg Wait Time</span>
              <div className="font-mono-data font-bold text-[#2EE6A6] text-sm mt-0.5">
                {activeController.avgWait.toFixed(1)}s
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating HUD Controls (Top-Right): Day/Night & Cameras */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-auto">
        <div className="glass-panel p-3 rounded-2xl border border-[var(--border)] flex items-center space-x-4 shadow-xl">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setDayNightRatio(0.15);
                setTheme('light');
              }}
              title="Set Daylight Simulation (0.15)"
              className={`p-1 rounded-md transition-colors ${dayNightRatio <= 0.5 ? 'bg-[#FFB547]/20 text-[#FFB547]' : 'text-[var(--muted)] hover:text-[#FFB547]'}`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={dayNightRatio}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setDayNightRatio(val);
                if (val <= 0.5 && theme !== 'light') setTheme('light');
                if (val > 0.5 && theme !== 'dark') setTheme('dark');
              }}
              className="w-20 accent-[#2EE6A6] cursor-pointer h-1.5 bg-[#151C2E] rounded-lg"
              aria-label="Day/Night slider"
            />
            <button
              onClick={() => {
                setDayNightRatio(0.85);
                setTheme('dark');
              }}
              title="Set Night Simulation (0.85)"
              className={`p-1 rounded-md transition-colors ${dayNightRatio > 0.5 ? 'bg-[#4F8CFF]/20 text-[#4F8CFF]' : 'text-[var(--muted)] hover:text-[#4F8CFF]'}`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-[var(--border)]" />

          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleCameraPreset('iso')}
              className={`p-1.5 rounded-lg text-xs ${cameraPreset === 'iso' ? 'bg-[#151C2E] text-white' : 'text-[#8A94A9]'}`}
            >
              <Compass className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleCameraPreset('top')}
              className={`p-1.5 rounded-lg text-xs ${cameraPreset === 'top' ? 'bg-[#151C2E] text-white' : 'text-[#8A94A9]'}`}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleCameraPreset('street')}
              className={`p-1.5 rounded-lg text-xs ${cameraPreset === 'street' ? 'bg-[#151C2E] text-white' : 'text-[#8A94A9]'}`}
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Clickable Junctions & Incidents Overlay Pill */}
        <div className="glass-panel p-3 rounded-2xl border border-[var(--border)] space-y-2 text-xs min-w-[200px]">
          <span className="text-[10px] font-mono-data text-[#8A94A9] uppercase block font-semibold">
            In-Scene Selection
          </span>
          {activeIncidents.length > 0 ? (
            activeIncidents.slice(0, 2).map((inc) => (
              <button
                key={inc.id}
                onClick={() => setSelectedEntity({ type: 'incident', data: inc })}
                className="w-full text-left p-1.5 rounded-lg bg-[#FF5C6C]/10 border border-[#FF5C6C]/30 text-white flex items-center justify-between cursor-pointer"
              >
                <span className="truncate max-w-[130px] font-semibold">{inc.title}</span>
                <span className="text-[9px] font-mono-data text-[#FF5C6C]">PULSING</span>
              </button>
            ))
          ) : (
            <span className="text-[11px] text-[#8A94A9]">No active incidents in junction</span>
          )}
        </div>
      </div>

      {/* Selected Entity Drawer (Bottom or Float) */}
      {selectedEntity && (
        <div className="absolute bottom-6 right-6 z-30 max-w-sm w-full pointer-events-auto">
          <div className="glass-panel-elevated p-5 rounded-2xl border border-[var(--border-light)] shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <span className="text-xs font-mono-data text-[#4F8CFF] font-bold uppercase">
                {selectedEntity.type === 'incident' ? 'Incident On Scene' : 'Unit Telemetry'}
              </span>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-[#8A94A9] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedEntity.type === 'incident' && (
              <div className="text-xs space-y-2">
                <h4 className="font-heading font-bold text-white text-sm">
                  {selectedEntity.data.title}
                </h4>
                <p className="text-[#8A94A9] text-[11px]">{selectedEntity.data.locationDesc}</p>
                <div className="flex justify-between font-mono-data text-[11px] text-[#8A94A9]">
                  <span>Severity: <strong className="text-[#FF5C6C]">{selectedEntity.data.severity}</strong></span>
                  <span>AI Conf: <strong className="text-white">{selectedEntity.data.aiConfidence}%</strong></span>
                </div>
                <button
                  onClick={() => {
                    resolveIncident(selectedEntity.data.id);
                    setSelectedEntity(null);
                  }}
                  className="w-full py-1.5 rounded-lg bg-[#2EE6A6] text-[#07090F] font-bold text-xs cursor-pointer"
                >
                  Clear Incident
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
