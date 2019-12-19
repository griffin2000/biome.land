import * as THREE from 'three'
import { Vector3 } from 'three';

export function createTendrilGeometry(points, options) {

  options = options || {};

  var geometry = new THREE.BufferGeometry();

  var indices = [];

  var vertices = [];
  var normals = [];
  var colors = [];

  var size = 1;
  var segments = options.segments || 5;

  var uIncr = 1.0/(segments-1);
  var vIncr = 1.0/(segments);

  const height =  options.height || 0.2;
  const radius = options.radius || 0.4;

  // generate vertices, normals and color data for a simple grid geometry
  const direc0 = new THREE.Vector3();
  const direc1 = new THREE.Vector3();
  const cross0 = new THREE.Vector3();
  const cross1 = new THREE.Vector3();
  const cross = new THREE.Vector3();
  const up = new THREE.Vector3(0,1,0);

  const pnt = new THREE.Vector3();

  const numPoints = points.length;

    for(let p =0;p<numPoints;p++) {
        let np =0;
        cross.set(0,0,0);
        let dist = 0.0;
        if(p<numPoints-1) {
            direc1.subVectors(points[p], points[p+1]);
            dist = direc1.length();
            direc1.divideScalar(dist);

            cross1.crossVectors(direc1,up);
            cross1.normalize();

            cross.add(cross1);
            np++;
        } 
        if(p>0) {
            direc0.subVectors(points[p-1], points[p]);
            direc0.normalize();

            cross0.crossVectors(direc0,up);
            cross0.normalize();
            cross.add(cross0);
            np++;
        } 

        cross.divideScalar(np);
        
        const u = p/(numPoints-1);

        for ( var i = 0; i <= segments; i ++ ) {
            let v = i*vIncr;
            v -= 0.5;
            let va = v*Math.PI;
            const ch = Math.cos(va);
            const h = ch*height;

            let scale = (1.0-u);
            scale = Math.sqrt(scale);

            pnt.copy(points[p]);
            pnt.addScaledVector(cross,scale*v*radius);
            pnt.y+=scale*h;
    
          vertices.push( pnt.x, pnt.y, pnt.z );
          normals.push( 0, 0, 1 );
    
          var r = v;
          var g = 1;
    
          colors.push( r, g, 1 );
    
        }
    
      
  }


  // generate indices (data for element array buffer)

  for ( var i = 0; i < numPoints-1; i ++ ) {

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


export function createTendrilFromRaycasts( raycastFunc, startPoint, direction, options) {

    const pnt = new THREE.Vector3();
    pnt.copy(startPoint);


    const points = [];
    const firstPoint = new THREE.Vector3();
    firstPoint.copy(startPoint);

    points.push(firstPoint);

    
    const maxPoints = 10||options.maxPoints;
    const maxStepDist = 0.25|| options.maxStepDist;
    const directionVariance = Math.PI*0.3 || options.maxStepDist;
    const distThresh = 0.25 || options.distThresh;

    const rotMtx = new THREE.Matrix4();
    const direc = new THREE.Vector3();
    const rayOrigin = new THREE.Vector3();
    const rayDirection = new THREE.Vector3(0,-1,0);
    for(let i=0;i<maxPoints;i++) {

        const direcRot = (Math.random()-0.5) * directionVariance;
        rotMtx.makeRotationFromEuler(new THREE.Euler(0,direcRot,0 ));

        direc.copy(direction);
        direc.applyMatrix4(rotMtx);
        direc.multiplyScalar ( maxStepDist*0.5 + maxStepDist*0.5*Math.random());
        
        pnt.add(direc);

        rayOrigin.copy(pnt);
        rayOrigin.y += 50.0;

        const rayCastRes = raycastFunc(
            rayOrigin,
            rayDirection,
        );

        
        if(!rayCastRes) 
            break;

        const rayDist = rayCastRes.distanceTo(pnt);
        if(rayDist>distThresh)
            break;

        const nextPoint =new THREE.Vector3();
        nextPoint.copy(rayCastRes);
        points.push(nextPoint);

    }

    return createTendrilGeometry(points, options);
}
