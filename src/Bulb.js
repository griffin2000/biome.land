import * as THREE from 'three'

export function createBulbGeometry(options) {

  options = options || {};

  var geometry = new THREE.BufferGeometry();

  var indices = [];

  var vertices = [];
  var normals = [];
  var colors = [];

  var size = 1;
  var segments = options.segments || 30;

  var uIncr = 1.0/(segments-1);
  var vIncr = 1.0/(segments);

  const height =  options.height || 2.0;

  // generate vertices, normals and color data for a simple grid geometry

  for ( var i = 0; i <= segments; i ++ ) {


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
        d = Math.max(b,stemRadius);

      }
      const randOffset = (Math.random() -0.5) * noiseMag;
      d+=randOffset;

      const x = -d*Math.cos(phi);
      const z = d*Math.sin(phi);
      const y = v * height;

      vertices.push( x, y, z );
      normals.push( 0, 0, 1 );

      var r = ( x / size ) + 0.5;
      var g = ( y / size ) + 0.5;

      colors.push( r, g, 1 );

    }

  }

  // generate indices (data for element array buffer)

  for ( var i = 0; i < segments; i ++ ) {

    for ( var j = 0; j < segments; j ++ ) {

      var a = i * ( segments + 1 ) + ( j + 1 );
      var b = i * ( segments + 1 ) + j;
      var c = ( i + 1 ) * ( segments + 1 ) + j;
      var d = ( i + 1 ) * ( segments + 1 ) + ( j + 1 );

      // generate two faces (triangles) per iteration

      indices.push( a, b, d ); // face one
      indices.push( b, c, d ); // face two

    }

  }

  //

  geometry.setIndex( indices );
  geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
  geometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
  geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
  geometry.computeVertexNormals ();

  return geometry;

}
