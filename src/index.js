import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; 
import {GLTFLoader} from './third-party/GLTFLoader'

var camera;
var controls;

function loadGLTF(filename) {
  return new Promise((resolve,reject)=>{

    var loader = new THREE.GLTFLoader();
    loader.load( 
     filename, 
    function ( gltf ) {
      console.log("GLTF loaded");
  
      resolve(gltf)
    }, 
    null,
    function ( error ) {

      reject(error);
    }
  
  )
  });
}
async function init() {
  const canvas = document.getElementById('canvas');
  const renderer = new THREE.WebGLRenderer( { 
    antialias: true,
    canvas 
  } );
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 80000 );

  camera.position.set(-7, 0, -21);
  controls = new OrbitControls( camera, renderer.domElement );

  const scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xAAAAAA );

  const raycaster = new THREE.Raycaster();
  raycaster.set(new THREE.Vector3(-5,5,-16),new THREE.Vector3(0,-1,0), );
  // See if the ray from the camera into the world hits one of our meshes


  const light = new THREE.DirectionalLight( 0xFFFFFF, 3.0 );
  scene.add(light);
  light.target.position.y = -10;

   
  var loader = new THREE.GLTFLoader();

  const gltf = await loadGLTF('assets/map_139586444_densified_gltf/map_139586444_densified_mesh_textured_lod0z.gltf');

  var mesh = gltf.scene.children[ 0 ];
  scene.add(mesh);

  var intersects = raycaster.intersectObject( mesh );
  console.log(intersects);
  const render = () =>{
    renderer.render(scene, camera);
  }

  var geometry = new THREE.BufferGeometry();

  var indices = [];

  var vertices = [];
  var normals = [];
  var colors = [];

  var size = 1;
  var segments = 10;

  var halfSize = size / 2;
  var segmentSize = size / segments;
  var uIncr = 1.0/(segments-1);
  var vIncr = 1.0/(segments-1);

  const height = 1.0;
  const radius = 0.5;

  // generate vertices, normals and color data for a simple grid geometry

  for ( var i = 0; i <= segments; i ++ ) {


    for ( var j = 0; j <= segments; j ++ ) {


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



  //const geometry = new THREE.BoxBufferGeometry(0.4,0.4,0.4);
  //geometry.translate( 0, 50, 0 );
  //geometry.rotateX( Math.PI / 2 );
  const helper = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );
  scene.add( helper );

  if(intersects[0])
  {
    helper.position.x = intersects[0].point.x;
    helper.position.y = intersects[0].point.y;
    helper.position.z = intersects[0].point.z;
  }

  const mouse = new THREE.Vector2();

  function onMouseMove( event ) {
    
    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );

    // See if the ray from the camera into the world hits one of our meshes
    var intersects = raycaster.intersectObject( mesh );
    console.log(intersects);
    if(intersects[0])
    {
      helper.position.x = intersects[0].point.x;
      helper.position.y = intersects[0].point.y;
      helper.position.z = intersects[0].point.z;
    }
  }
  
  function onMouseClick() {
    console.log('mesh')
    const newMesh = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() )
    newMesh.position.x = helper.position.x;
    newMesh.position.y = helper.position.y;
    newMesh.position.z = helper.position.z;
    scene.add(newMesh);
  }
  
  canvas.addEventListener( 'mousemove', onMouseMove, false );
  canvas.addEventListener("click", onMouseClick);
  renderer.setAnimationLoop( render );

  console.log("init");
}


function animate() {
  requestAnimationFrame( animate );
  controls.update();
}

init().then(()=>{
  console.log("App inited");
  animate()
});
