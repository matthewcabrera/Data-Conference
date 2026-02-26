import type { SceneModule } from './types';
import { createScene01Mechanism } from './scenes/Scene01Curve';
import { createScene02Rwanda } from './scenes/Scene02Rwanda';
import { createScene03Vietnam } from './scenes/Scene03Vietnam';
import { createScene04US } from './scenes/Scene04US';
import { createScene05Mirror } from './scenes/Scene05Mirror';
import { createScene06Compression } from './scenes/Scene06Compression';
import { createScene07Close } from './scenes/Scene07Close';

export function createSceneGraph(): SceneModule[] {
  return [
    createScene01Mechanism(),
    createScene02Rwanda(),
    createScene03Vietnam(),
    createScene04US(),
    createScene05Mirror(),
    createScene06Compression(),
    createScene07Close()
  ];
}
