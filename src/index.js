import * as THREE from 'three'
import {GLTFLoader} from './third-party/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; 
import {createBulbGeometry} from './Bulb'

var camera;
var controls;
var currentPosition;

function loadGLTF(filename) {
  return new Promise((resolve,reject)=>{

    var loader = new THREE.GLTFLoader();
    loader.load( 
     filename, 
    function ( gltf ) {
      
  
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
  light.target.position.z = +5;

  const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
  hemiLight.color.setHSL( 0.6, 1, 0.6 );
  hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
  hemiLight.position.set( 0, 50, 0 );
  scene.add( hemiLight );
   
  var loader = new THREE.GLTFLoader();

  const collisGltf = await loadGLTF('assets/map_139586444_densified_gltf/map_139586444_densified_mesh_textured_lod2.gltf');
  var collisMesh = collisGltf.scene.children[ 0 ];
  const gltf = await loadGLTF('assets/map_139586444_densified_gltf/map_139586444_densified_mesh_textured_lod0z.gltf');

  var mesh = gltf.scene.children[ 0 ];
  scene.add(mesh);

  var intersects = raycaster.intersectObject( collisMesh );
  const render = () =>{
    renderer.render(scene, camera);
  }

  var geometry = createBulbGeometry();


  //const geometry = new THREE.BoxBufferGeometry(0.4,0.4,0.4);
  //geometry.translate( 0, 50, 0 );
  //geometry.rotateX( Math.PI / 2 );
  const bulbMaterial = new THREE.MeshStandardMaterial();
  bulbMaterial.color = new THREE.Color(0.1,1.0,0.2);
  const helper = new THREE.Mesh( geometry,  bulbMaterial);
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
    var intersects = raycaster.intersectObject( collisMesh );

    if(intersects[0])
    {
      currentPosition = new THREE.Vector3(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z) 
    }
  }
  
  function onMouseClick() {
    console.log('mesh')
    const newMesh = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() )
    newMesh.position.set(currentPosition.x, currentPosition.y, currentPosition.z)
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
