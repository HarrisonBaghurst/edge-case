'use client'

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const Page = () => {

    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // screen size variables 
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        // setup scene and camera for three
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
        camera.position.z = 7;
        
        // renderer setup 
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);
        mountRef.current.appendChild(renderer.domElement);

        // create individual cube geometry
        const geometry = new RoundedBoxGeometry(1, 1, 1, 4, 0.075);

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
                roughness: 0.25,
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
                }
            }
        }

        // create light and add to scene
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);


        // animate function - runs once per frame 
        function animate() {
            scene.rotation.x += 0.005;
            scene.rotation.y += 0.01;
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