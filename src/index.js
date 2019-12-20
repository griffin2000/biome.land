import * as THREE from 'three'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'; 
import {GLTFLoader} from './third-party/GLTFLoader'
import {createBulbGeometry} from './Bulb'
import { LoadingManager } from 'three';
import {createTendrilGeometry, createTendrilFromRaycasts} from './Tendril'
import {startCreator} from './PlantCreator'

var camera;
var controls;
var currentPosition;
var crosshair;

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
function loadCrosshair() {
  var loader = new THREE.ImageLoader();

  // load a image resource
  loader.load(
    // resource URL
    'assets/crosshair.png',

    // onLoad callback
    function ( image ) {
      // use the image, e.g. draw part of it on a canvas
      crosshair = image;
    },

    // onProgress callback currently not supported
    undefined,

    // onError callback
    function () {
      console.error( 'An error happened.' );
    }
  );
}

function createCollisMesh (visMesh, tag) {
  const mesh = new THREE.Mesh(visMesh.geometry,visMesh.material);
  mesh.position.copy(visMesh.position);
  mesh.scale.copy(visMesh.scale);
  mesh.quaternion.copy(visMesh.quaternion);
  
  tag = tag || "";
  mesh.userData = {
    tag,
  };
  return mesh;
}
async function init() {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('game').appendChild(renderer.domElement)

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 80000 );

  camera.position.set(-7, 0, -21);
  var canvas = document.getElementById('ui-canvas');
  var context = canvas.getContext( '2d' );  

  controls = new FirstPersonControls(camera);
  const scene = new THREE.Scene()
  
  //var player = controls.getObject();
  //scene.add(player);

  scene.background = new THREE.Color( 0xAAAAAA );

  const raycaster = new THREE.Raycaster();
  // See if the ray from the camera into the world hits one of our meshes

  const light = new THREE.DirectionalLight( 0xFFFFFF, 3.0 );
  scene.add(light);
  light.target.position.y = -10;
  light.target.position.z = +5;
  scene.add( light.target );

  const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
  hemiLight.color.setHSL( 0.6, 1, 0.6 );
  hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
  hemiLight.position.set( 0, 50, 0 );
  scene.add( hemiLight );

  const isectRoot = new THREE.Group();
   
  var loader = new THREE.GLTFLoader();

  const collisGltf = await loadGLTF('assets/map_139586444_densified_gltf/map_139586444_densified_mesh_textured_lod2.gltf');
  var collisMesh = collisGltf.scene.children[ 0 ];
  const gltf = await loadGLTF('assets/map_139586444_densified_gltf/map_139586444_densified_mesh_textured_lod0z.gltf');

  isectRoot.add(collisMesh);

  var mesh = gltf.scene.children[ 0 ];
  scene.add(mesh);


  

  const raycastFunc  = (origin,direction)=>{
    raycaster.set(origin, direction);
    var intersects = raycaster.intersectObject( isectRoot , true);
    if(intersects.length==0)
      return null;

    return intersects[0];
  }

  const raycastWorldFunc = (origin,direction)=>{
    raycaster.set(origin, direction);
    var intersects = raycaster.intersectObject( collisMesh);
    if(intersects.length==0)
      return null;

    return intersects[0];
  }


  const render = () =>{
    renderer.render(scene, camera);
  }
  //const geometry = new THREE.BoxBufferGeometry(0.4,0.4,0.4);
  //geometry.translate( 0, 50, 0 );
  //geometry.rotateX( Math.PI / 2 );
  startCreator(raycastWorldFunc, raycastFunc, scene, isectRoot);

      

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
    console.log("client", event.clientX, event.clientY)
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(crosshair, event.clientX - crosshair.width/2, event.clientY - crosshair.height/2)
  }
  
  function onMouseClick() {
    console.log('mesh')

    if(!currentPosition)
      return;

    const s = Math.random();

    var geometry = createBulbGeometry({
      stemRadius:0.05 + s*0.05,
      buldRadius: 0.2 + s*0.1,
      height:2.0+2.0*s,
    });

    const bulbMaterial = new THREE.MeshStandardMaterial();
    const newMesh = new THREE.Mesh( geometry, bulbMaterial )
    newMesh.position.set(currentPosition.x, currentPosition.y, currentPosition.z)
    newMesh.scale.x = 0.2;
    newMesh.scale.y = 0.2;
    newMesh.scale.z = 0.2;
    scene.add(newMesh);
    const collisMeshes = [];
    collisMeshes.push(createCollisMesh(newMesh,"Plant"))
    for(let i=0;i<5;i++) {


      const direc = new THREE.Vector3(Math.random()*2.0-1.0, 0.0, Math.random()*2.0-1.0);
      direc.normalize();

      
      const tendrilGeom = createTendrilFromRaycasts(raycastFunc, currentPosition,   direc, {
        maxPoints: 50,
        radius: 0.03 + s*0.06,
        height: 0.01 + s*0.1,
        maxStepDist: 0.5,
      });
  
      const tendril =  new THREE.Mesh( tendrilGeom,  bulbMaterial);
  
      collisMeshes.push(createCollisMesh(tendril,"Plant"));
      scene.add(tendril);
  
    }
    for(let i=0;i<collisMesh.length;i++)
      isectRoot.add(collisMeshes[i]);

  }
  
  window.addEventListener('mousemove', onMouseMove, false );
  window.addEventListener("click", onMouseClick);
  // var canvas = document.getElementById('ui-canvas');
  // var context = canvas.getContext( '2d' );
  // context.clearRect(0, 0, window.width, window.height);
  // context.fillRect(0, 0, 1000,1000);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  renderer.setAnimationLoop( render );

  console.log("init");
}


function animate() {
  requestAnimationFrame( animate );
  //controls.update();
}

init().then(()=>{
  console.log("App inited");
  loadCrosshair();
  animate()
});;
