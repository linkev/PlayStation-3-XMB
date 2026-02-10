// Mesh Generation Module
// Handles vertex and mesh generation for flow and particle systems

const NUM_PARTICLES = 300;

export function makeFlowVertices(resolution) {
  const verticesPerStrip = resolution * 2;
  const numStrips = resolution - 1;
  const vertices = new Float32Array(verticesPerStrip * numStrips * 2);
  
  let vIdx = 0;
  for (let y = 0; y < resolution - 1; y++) {
    for (let x = 0; x < resolution; x++) {
      vertices[vIdx++] = (x / (resolution - 1)) * 2 - 1;
      vertices[vIdx++] = ((y + 1) / (resolution - 1)) * 2 - 1;
      vertices[vIdx++] = (x / (resolution - 1)) * 2 - 1;
      vertices[vIdx++] = (y / (resolution - 1)) * 2 - 1;
    }
  }
  
  const indices = new Uint16Array(numStrips * (resolution * 2 + 2) - 2);
  let iIdx = 0;
  let baseVertex = 0;
  
  for (let strip = 0; strip < numStrips; strip++) {
    if (strip > 0) {
      indices[iIdx++] = baseVertex - 1;
      indices[iIdx++] = baseVertex;
    }
    for (let i = 0; i < resolution * 2; i++) {
      indices[iIdx++] = baseVertex + i;
    }
    baseVertex += resolution * 2;
  }
  
  return {
    vertices: vertices,
    indices: indices,
    vertexCount: vertices.length / 2,
    stripCount: numStrips,
  };
}

export function makeParticleSeeds() {
  const seeds = new Float32Array(NUM_PARTICLES * 3);
  let numSeeds = 0;
  
  for (let i = 0; i < NUM_PARTICLES; i++) {
    seeds[numSeeds++] = Math.random();
    seeds[numSeeds++] = Math.random();
    seeds[numSeeds++] = Math.pow(Math.random(), 8) + 0.1;
  }
  
  return seeds;
}

export { NUM_PARTICLES }; 