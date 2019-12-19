import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; 
import {GLTFLoader} from './third-party/GLTFLoader'

var controls; 
var camera;

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

  const light = new THREE.DirectionalLight( 0xFFFFFF, 3.0 );
  scene.add(light);
  light.target.position.y = -10;
  
  var loader = new THREE.GLTFLoader();
  loader.load( 'assets/map_139586444_densified_gltf/map_139586444_densified_mesh_textured_lod0z.gltf', function ( gltf ) {
    console.log("GLTF loaded");

    var mesh = gltf.scene.children[ 0 ];
    scene.add(mesh);
  });

  const render = () =>{
    renderer.render(scene, camera);
  }

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
