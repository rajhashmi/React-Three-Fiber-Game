import Lights from './Lights.jsx'
import {Level, BlockSpiner} from './Level.jsx'
import { Physics } from '@react-three/rapier'
import Player from './Player.jsx'
import useGame from './stores/useGame.jsx'

export default function Experience()
{
    const blocksCount = useGame((state) => state.blockCount)
    const blocksSeed = useGame(state => state.blocksSeed)
    return (
      <>
         <color args={ [ '#bdedfc' ] } attach="background" />
        <Physics debug={false}>
          <Lights />
          <Level count={blocksCount} seed={ blocksSeed } />
          <Player/>
        </Physics>
      </>
    );
}