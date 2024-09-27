import Lights from './Lights.jsx'
import {Level, BlockSpiner} from './Level.jsx'
import { Physics } from '@react-three/rapier'
import Player from './Player.jsx'

export default function Experience()
{
    return (
      <>

        <Physics debug={false}>
          <Lights />
          <Level  />
          <Player/>
        </Physics>
      </>
    );
}