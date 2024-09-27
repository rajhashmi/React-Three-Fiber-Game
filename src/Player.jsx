import { RigidBody, useRapier } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import useGame from './stores/useGame.jsx'
import * as THREE from 'three'

export default function Player() {
  const body = useRef();
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const { rapier, world } = useRapier();

    //  ritriving game state
  const start = useGame((state) => state.start)
  const end = useGame((state) => state.end)
  const blocksCount = useGame((state) => state.blockCount)
  const restart = useGame((state) => state.restart)

  const [smoothCameraPosition] = useState(()=> new THREE.Vector3(10, 10, 10));
  const [smoothCameraTarget] = useState(()=> new THREE.Vector3());

  const jump = () => {
    const origin = body.current.translation();

    origin.y -= 0.31;

    const direction = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(origin, direction);
    const hit = world.castRay(ray, 10, true);


    if (hit.timeOfImpact < 0.15) {
      body.current.applyImpulse({ x: 0, y: 0.5, z: 0 });
    }
  };

  const reset = () =>
    {
        body.current.setTranslation({ x: 0, y: 1, z: 0 })
        body.current.setLinvel({ x: 0, y: 0, z: 0 })
        body.current.setAngvel({ x: 0, y: 0, z: 0 })
    }

  useEffect(() => {
    const unsubsricbeJump = subscribeKeys(
      (state) => state.jump,
      (value) => {
        if (value) jump();
      }
    );
    const unsubscribeReset = useGame.subscribe(
        (state) => state.phase,
        (value) =>
        {
            if(value === 'ready')
                reset()
        }
    )
    const unsubscribeAny = subscribeKeys(
        () =>
        {
            start()
        }
    )
    return () => {
      unsubsricbeJump();
      unsubscribeAny();
      unsubscribeReset()
    };
  }, []);



  useFrame((state, delta) => {
    const { forward, backward, leftward, rightward } = getKeys();
    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };

    const impulseStrength = 0.6 * delta;
    const torqueStrength = 0.2 * delta;

    if (forward) {
      impulse.z -= impulseStrength;
      torque.x -= torqueStrength;
    }

    if (rightward) {
      impulse.x += impulseStrength;
      torque.z -= torqueStrength;
    }

    if (backward) {
      impulse.z += impulseStrength;
      torque.x += torqueStrength;
    }

    if (leftward) {
      impulse.x -= impulseStrength;
      torque.z += torqueStrength;
    }

    body.current.applyImpulse(impulse);
    body.current.applyTorqueImpulse(torque);


    /**
     * Camera
     * **/ 
    const bodyPosition = body.current.translation();

    const cameraPosition = new THREE.Vector3();
    cameraPosition.copy(bodyPosition);
    cameraPosition.z += 2.25
    cameraPosition.y += 0.65

    const cameraTarget = new THREE.Vector3();
    
    cameraTarget.copy(bodyPosition);
    cameraTarget.y += 0.25;
        
    smoothCameraPosition.lerp(cameraPosition,5 * delta);
    smoothCameraTarget.lerp(cameraTarget, 5 * delta);

    state.camera.position.copy(smoothCameraPosition);
    state.camera.lookAt(smoothCameraTarget);

    if(bodyPosition.z < - (blocksCount * 4 + 2)){
        end()
    }
    if(bodyPosition.y < - 4){
        restart()
    }
  });



  return (
    <RigidBody
    
      ref={body}
      canSleep={false}
      colliders="ball"
      restitution={0.2}
      friction={1}
      linearDamping={0.5} // the pronlem wih our ball is it's moving even after we left controll so using dumping at some point it will stop but dont ue in space
      angularDamping={0.5}
      position={[0, 1, 0]}
    >
      <mesh castShadow>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial flatShading color="mediumpurple" />
      </mesh>
    </RigidBody>
  );
}
