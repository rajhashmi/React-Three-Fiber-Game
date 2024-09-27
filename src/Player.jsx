import { RigidBody, useRapier } from "@react-three/rapier"
import { useFrame } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import { useRef, useEffect } from "react"

export default function Player(){
    const  body = useRef();
    const [subscribeKeys, getKeys] = useKeyboardControls()
    const { rapier, world } = useRapier()

    const jump = () =>
        {
            const origin = body.current.translation()
            origin.y -= 0.31
            const direction = { x: 0, y: - 1, z: 0 }
            const ray = new rapier.Ray(origin, direction)
            const hit = world.castRay(ray, 10, true)
            console.log(hit.timeOfImpact)
            if(hit.timeOfImpact < 0.15){
                body.current.applyImpulse({ x: 0, y: 0.5, z: 0 })
            }
        }
    
        useEffect(() =>
        {
           const unsubsricbeJump =  subscribeKeys(
                (state) => state.jump,
                (value) =>
                {
                    if(value)
                        jump()
                }
            )
            return () => {
                unsubsricbeJump()
            }
        }, [])



    useFrame((state, delta)=>{
        const { forward, backward, leftward, rightward } = getKeys()
        const impulse = { x: 0, y: 0, z: 0 }
        const torque = { x: 0, y: 0, z: 0 }

        const impulseStrength = 0.6 * delta
        const torqueStrength = 0.2 * delta

        if(forward)
            {
                impulse.z -= impulseStrength
                torque.x -= torqueStrength
            }
        
            if(rightward)
            {
                impulse.x += impulseStrength
                torque.z -= torqueStrength
            }
        
            if(backward)
            {
                impulse.z += impulseStrength
                torque.x += torqueStrength
            }
            
            if(leftward)
            {
                impulse.x -= impulseStrength
                torque.z += torqueStrength
            }

        body.current.applyImpulse(impulse)
        body.current.applyTorqueImpulse(torque)
    })

    return <RigidBody 
    ref={ body }
    canSleep={ false }
    colliders="ball"
    restitution={ 0.2 }
    friction={ 1 } 
    linearDamping={ 0.5 } // the pronlem wih our ball is it's moving even after we left controll so using dumping at some point it will stop but dont ue in space
    angularDamping={ 0.5 }
    position={ [ 0, 1, 0 ] }
    >
    <mesh>
        <icosahedronGeometry args={[0.3,1]}/>
        <meshStandardMaterial flatShading color="mediumpurple"/>
    </mesh>
    </RigidBody>
}