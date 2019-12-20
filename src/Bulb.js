import * as THREE from 'three'

import { Vector4 } from 'three';

import { Random, MersenneTwister19937 } from "random-js";

export function setBulbGeometry(geometry, options) {
  options = options || {};


  var size = 1;
  var segments = options.segments || 30;

  var uIncr = 1.0/(segments-1);
  var vIncr = 1.0/(segments);


  const height =  options.height || 2.0;

  const pos  = options.position || new THREE.Vector3();

  const seed = options.seed || 13;
  const bend = options.bend || 0.1;

  const random = new Random(MersenneTwister19937.seed(seed));

  // generate vertices, normals and color data for a simple grid geometry

  const offsets = [];
  //new THREE.Vector3();
  const offsetDirec = new THREE.Vector3();
  offsetDirec.x =random.real(-1,+1)
  offsetDirec.z = random.real(-1,+1)
  offsetDirec.normalize();

  const offsetNoiseMag = options.noiseMag || 0.01;
  for ( var j = 0; j <= segments; j ++ ) {
    const v = j*vIncr;
    const ov = v*v;

    const bulbHeight = options.bulbHeight ||0.5;
    const bulbStart = 1.0-bulbHeight;
    const baseHeight = options.baseHeight || 0.1;
    const offset= new THREE.Vector3();
    if( v>baseHeight)
    {
      if(v<bulbStart) {
        offset.x = bend*ov*offsetDirec.x;
        offset.z = bend*ov*offsetDirec.z;
      } else {
        offset.x = offsets[j-1].x;
        offset.z = offsets[j-1].z;
      }
    }
    offsets.push(offset);


  }

  const nv = (segments+1)*(segments+1);
  const ni = 6*segments*segments;


  const vertices =geometry.attributes.position.array;//new Float32Array(nv*3);
  const normals = geometry.attributes.normal.array;//new Float32Array(nv*3);
  const indices =  geometry.index.array;
  
  
  for ( var i = 0; i <= segments; i ++ ) {

    const ro = random.real(0,1);
    for ( var j = 0; j <= segments; j ++ ) {


      const u = i*uIncr;
      const v = j*vIncr;
      const phi = u*Math.PI*2.0;

      const bulbRadius = options.bulbRadius || 0.2;
      const stemRadius = options.stemRadius || 0.1;
      let d = stemRadius;

      const bulbHeight = options.bulbHeight ||0.5;
      const bulbStart = 1.0-bulbHeight;
      const baseHeight = options.baseHeight || 0.1;
      const baseRadius= options.baseRadius || 0.4;

      const noiseMag = options.noiseMag || 0.02;
      let ox = 0.0;
      let oz = 0.0;

      if(v>bulbStart) {
        let dp = (v -bulbStart)/bulbHeight;
        dp = dp - 0.5;
        const dpa = dp*Math.PI;
        d = bulbRadius* Math.cos(dpa);
        if(dp<0.0)
          d = Math.max(d,stemRadius);


      }


      else if(v<=baseHeight) {
        const bp = 1.0-v/baseHeight;
        let b = bp*bp*baseRadius;
        b+= b*0.25*ro;
        d = Math.max(b,stemRadius);

      } 
      ox=offsets[j].x;
      oz=offsets[j].z;

      const randOffset = (random.real(0,1) -0.5) * noiseMag;
      d+=randOffset;

      let x = -d*Math.cos(phi) + ox;
      let z = d*Math.sin(phi) + oz;
      let y = v * height;

      x+=ox+pos.x;
      y+=pos.y;
      z+=oz+pos.z;
      const vidx = i*(segments+1) + j;

      vertices[vidx*3+0] = x;
      vertices[vidx*3+1] = y;
      vertices[vidx*3+2] = z;


    }

  }

  geometry.computeVertexNormals ();
  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.normal.needsUpdate = true;
  geometry.computeBoundingSphere () ;
  geometry.computeBoundingBox () ;

}

export function createBulbGeometry(options) {

  options = options || {};

  var geometry = new THREE.BufferGeometry();

  var segments = options.segments || 30;

  const nv = (segments+1)*(segments+1);
  const ni = 6*segments*segments;

  
  geometry.index = new THREE.Uint16BufferAttribute( ni, 1 );
  geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( nv*3, 3 ) );
  geometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( nv*3, 3 ) );

  const indices =  geometry.index.array;
  

  // generate indices (data for element array buffer)

  for ( var i = 0; i < segments; i ++ ) {

    for ( var j = 0; j < segments; j ++ ) {

      var a = i * ( segments + 1 ) + ( j + 1 );
      var b = i * ( segments + 1 ) + j;
      var c = ( i + 1 ) * ( segments + 1 ) + j;
      var d = ( i + 1 ) * ( segments + 1 ) + ( j + 1 );
 
      const idx = i*segments + j;
      indices[idx*6 +0] =a;
      indices[idx*6 +1] =b;
      indices[idx*6 +2] =d;
      indices[idx*6 +3] =b;
      indices[idx*6 +4] =c;
      indices[idx*6 +5] =d;

    }

  }

  setBulbGeometry(geometry, options);

  return geometry;

}
