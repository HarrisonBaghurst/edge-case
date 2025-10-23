'use client'

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

type CubeFaces = {
    px: THREE.Mesh[];
    nx: THREE.Mesh[];
    py: THREE.Mesh[];
    ny: THREE.Mesh[];
    pz: THREE.Mesh[];
    nz: THREE.Mesh[];
};

const Page = () => {

    const mountRef = useRef<HTMLDivElement | null>(null);

    const cubeFacesRef = useRef<CubeFaces | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // screen size variables 
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        // setup scene and camera for three
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
        camera.position.z = 7;
        
        // renderer setup 
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);
        mountRef.current.appendChild(renderer.domElement);

        // add orbit controls
        const controls = new TrackballControls(camera, renderer.domElement);
        controls.noZoom = true;       
        controls.noPan = true;        
        controls.rotateSpeed = 4.0;     
        controls.dynamicDampingFactor = 0.25;

        // create individual cube geometry
        const geometry = new RoundedBoxGeometry(1, 1, 1, 4, 0.1);

        // pick colours depending on external faces
        const faceColors = {
            px: 0xf03535, // +X
            nx: 0xeb812a, // -X
            py: 0xf0f0f0, // +Y
            ny: 0xe3be2b, // -Y
            pz: 0x1fab44, // +Z
            nz: 0x2b59e3  // -Z
        };

        // create material for internal black faces
        const blackMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.1,
            metalness: 0,
            emissive: 0x000000,
            flatShading: true
        });

        // create material for colour faces
        const createColoredMaterial = (color: number) =>
            new THREE.MeshStandardMaterial({
                color,
                roughness: 0.75,
                metalness: 0,
                emissive: color,
                flatShading: true
            });

        // cube grid variables 
        const gridSize = 3;
        const spacing = 1.05;
        const cubePositions = new Set<string>();

        // store grid positions 
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                for (let z = 0; z < gridSize; z++) {
                    cubePositions.add(`${x},${y},${z}`);
                }
            }
        }

        const cubes: THREE.Mesh[] = [];

        // create cubes
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                for (let z = 0; z < gridSize; z++) {

                    // Assign colors to faces based on adjacency
                    const faceMaterials = [
                        cubePositions.has(`${x+1},${y},${z}`) ? blackMaterial : createColoredMaterial(faceColors.px), // +X
                        cubePositions.has(`${x-1},${y},${z}`) ? blackMaterial : createColoredMaterial(faceColors.nx), // -X
                        cubePositions.has(`${x},${y+1},${z}`) ? blackMaterial : createColoredMaterial(faceColors.py), // +Y
                        cubePositions.has(`${x},${y-1},${z}`) ? blackMaterial : createColoredMaterial(faceColors.ny), // -Y
                        cubePositions.has(`${x},${y},${z+1}`) ? blackMaterial : createColoredMaterial(faceColors.pz), // +Z
                        cubePositions.has(`${x},${y},${z-1}`) ? blackMaterial : createColoredMaterial(faceColors.nz)  // -Z
                    ];

                    const cube = new THREE.Mesh(geometry, faceMaterials);
                    cube.position.set(
                        (x - 1) * spacing,
                        (y - 1) * spacing,
                        (z - 1) * spacing
                    );
                    scene.add(cube);
                    cubes.push(cube);
                }
            }
        }

        // create arrays of faces and corresponding cubes 
        const updateCubeArrays = () => {
            cubeFacesRef.current = {
                px: [],
                nx: [],
                py: [],
                ny: [],
                pz: [],
                nz: [],
            }

            const threshold = 0.5;
            const worldPos = new THREE.Vector3();

            for (const cube of cubes) {
                cube.getWorldPosition(worldPos);

                const {x, y, z} = worldPos;

                if (x > threshold) cubeFacesRef.current.px.push(cube);
                if (x < -threshold) cubeFacesRef.current.nx.push(cube);
                if (y > threshold) cubeFacesRef.current.py.push(cube);
                if (y < -threshold) cubeFacesRef.current.ny.push(cube);
                if (z > threshold) cubeFacesRef.current.pz.push(cube);
                if (z < -threshold) cubeFacesRef.current.nz.push(cube);
            }
        }
        updateCubeArrays();

        // Function to rotate all cubes on one face (for simplicity, rotate +X face)
        const rotateFace = (face: keyof CubeFaces, axis: 'x' | 'y' | 'z', direction: 1 | -1) => {
            if (!cubeFacesRef.current) return;

            // Pick the face group, e.g. +X face
            const cubesToRotate = cubeFacesRef.current[face];
            if (!cubesToRotate || cubesToRotate.length === 0) return;

            // Create a temporary group to rotate the cubes together
            const group = new THREE.Group();
            scene.add(group);

            // Move cubes into the group
            cubesToRotate.forEach(cube => group.add(cube));

            // Animate rotation (90 degrees over 0.5s)
            const duration = 250; // milliseconds
            const start = performance.now();

            const animateRotation = (time: number) => {
                const progress = Math.min((time - start) / duration, 1);
                group.rotation[axis] = direction * progress * (Math.PI / 2); // 90 degrees

                if (progress < 1) {
                    requestAnimationFrame(animateRotation);
                } else {
                    // Move cubes back out of the group when done
                    cubesToRotate.forEach(cube => {
                        scene.attach(cube);
                    });
                    scene.remove(group);
                    updateCubeArrays();
                }
            };

            requestAnimationFrame(animateRotation);
        };

        // Listen for keypress
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'f') {
                rotateFace('pz', 'z', -1);
            }
            else if (e.key === 'F') {
                rotateFace('pz', 'z', 1);
            }
            else if (e.key === 'l') {
                rotateFace('nx', 'x', 1);
            }
            else if (e.key === 'L') {
                rotateFace('nx', 'x', -1);
            }
            else if (e.key === 'u') {
                rotateFace('py', 'y', -1);
            }
            else if (e.key === 'U') {
                rotateFace('py', 'y', 1);
            }
            else if (e.key === 'r') {
                rotateFace('px', 'x', -1);
            }
            else if (e.key === 'R') {
                rotateFace('px', 'x', 1);
            }
            else if (e.key === 'd') {
                rotateFace('ny', 'y', 1);
            }
            else if (e.key === 'D') {
                rotateFace('ny', 'y', -1);
            }
            else if (e.key === 'b') {
                rotateFace('nz', 'z', 1);
            }
            else if (e.key === 'B') {
                rotateFace('nz', 'z', -1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // create light and add to scene
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        // animate function - runs once per frame 
        function animate() {
            controls.update();
            renderer.render( scene, camera );
        }
        renderer.setAnimationLoop( animate );

        // clean up on dismount
        return () => {
            if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
            renderer.dispose();
        };

    }, []);


    return (
        <div ref={mountRef} className='w-screen h-screen'/>
    )
}

export default Page