import * as THREE from 'three'

export function createTendrilGeometry(points, options) {

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
  const radius = 0.4;

  // generate vertices, normals and color data for a simple grid geometry
  const direc = new THREE.Vector3();
  const cross = new THREE.Vector3();
  const up = new THREE.Vector3(0,1,0);

  let dist = 0.0;å


    for(let p =0;p>points.length;p++) {
        if(p<points.length-1) {
            direc.subVectors(points[p], points[p+1]);
            dist = direc.length();
            direc.divideScalar(dist);

            cross.crossVectors(direc,up);
            cross.normalize();
        }

        for ( var i = 0; i <= segments; i ++ ) {

    
          const u = i*uIncr;
          const v = j*vIncr;
          const phi = u*Math.PI*2.0;
        
    
          const x = -radius*Math.cos(phi);
          const z = radius*Math.sin(phi);
          const y = v * height;
    
          vertices.push( x, y, z );
          normals.push( 0, 0, 1 );
    
          var r = ( x / size ) + 0.5;
          var g = ( y / size ) + 0.5;
    
          colors.push( r, g, 1 );
    
        }
    
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
