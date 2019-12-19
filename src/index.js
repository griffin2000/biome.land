import * as THREE from 'three'
import {GLTFLoader} from './third-party/GLTFLoader'


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
  const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 80000 );

  camera.position.y = 4;
  camera.lookAt(new THREE.Vector3(0,0,-10));

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


  const geometry = new THREE.BoxBufferGeometry(0.4,0.4,0.4);
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
  
  canvas.addEventListener( 'mousemove', onMouseMove, false );

  renderer.setAnimationLoop( render );

  console.log("init");
}

init().then(()=>{
  console.log("App inited");
});
