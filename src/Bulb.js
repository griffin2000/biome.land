import * as THREE from 'three'
import { Vector4 } from 'three';

export function setBulbGeometry(geometry, options) {
  options = options || {};


  var size = 1;
  var segments = options.segments || 30;

  var uIncr = 1.0/(segments-1);
  var vIncr = 1.0/(segments);

  const height =  options.height || 2.0;

  // generate vertices, normals and color data for a simple grid geometry

  const offsets = [];
  //new THREE.Vector3();

  const offsetNoiseMag = options.noiseMag || 0.01;
  for ( var j = 0; j <= segments; j ++ ) {
    const v = j*vIncr;
    
    offsets.push(new THREE.Vector3(
      offsetNoiseMag*(Math.random()-0.5),
      0.0,
      offsetNoiseMag*(Math.random()-0.5),
    ));


  }

  const nv = (segments+1)*(segments+1);
  const ni = 6*segments*segments;


  const vertices =geometry.attributes.position.array;//new Float32Array(nv*3);
  const normals = geometry.attributes.normal.array;//new Float32Array(nv*3);
  const indices =  geometry.index.array;
  
  
  for ( var i = 0; i <= segments; i ++ ) {

    const ro = Math.random();
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

      } else {
        ox=offsets[j].x;
        oz=offsets[j].z;
      }
      
      const randOffset = (Math.random() -0.5) * noiseMag;
      d+=randOffset;

      const x = -d*Math.cos(phi) + ox;
      const z = d*Math.sin(phi) + oz;
      const y = v * height;

      const vidx = i*(segments+1) + j;

      vertices[vidx*3+0] = x;
      vertices[vidx*3+1] = y;
      vertices[vidx*3+2] = z;


    }

  }

  geometry.computeVertexNormals ();

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
