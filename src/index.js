import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'; 
import {GLTFLoader} from './third-party/GLTFLoader'
import {createBulbGeometry} from './Bulb'
import { LoadingManager } from 'three';
import {createTendrilGeometry, createTendrilFromRaycasts} from './Tendril'
import {startCreator} from './PlantCreator'

var camera;
var controls;
var currentPosition;
var crosshair;
let currentObject = null;
let rayVisTime = 0.0
var renderer
var scene;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var prevTime = 0;
var velocity = new THREE.Vector3(0,0,0);


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
function CatmullRom( t, p0, p1, p2, p3 ) {

	var v0 = ( p2 - p0 ) * 0.5;
	var v1 = ( p3 - p1 ) * 0.5;
	var t2 = t * t;
	var t3 = t * t2;
	return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

}
async function init() {

  var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
  if ( havePointerLock ) {
    var element = document.body;
    var pointerlockchange = function ( event ) {
      if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
        controlsEnabled = true;
        controls.enabled = true;
        blocker.style.display = 'none';
      } else {
        controls.enabled = false;
        blocker.style.display = '-webkit-box';
        blocker.style.display = '-moz-box';
        blocker.style.display = 'box';
      }
    };
    var pointerlockerror = function ( event ) {
      instructions.style.display = '';
    };
    // Hook pointer lock state change events
    document.addEventListener( 'pointerlockchange', pointerlockchange, false );
    document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'pointerlockerror', pointerlockerror, false );
    document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
    document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
  }

  var onKeyDown = function ( event ) {
    switch ( event.keyCode ) {
      case 38: // up
      case 87: // w
        moveForward = true;
        break;
      case 37: // left
      case 65: // a
        moveLeft = true; 
        break;
      case 40: // down
      case 83: // s
        moveBackward = true;
        break;
      case 39: // right
      case 68: // d
        moveRight = true;
        break;
      case 32: // space
        if ( canJump === true ) velocity.y += 350;
        canJump = false;
        break;
    }
  };
  var onKeyUp = function ( event ) {
    switch( event.keyCode ) {
      case 38: // up
      case 87: // w
        console.log('hi')
        moveForward = false;
        break;
      case 37: // left
      case 65: // a
        moveLeft = false;
        break;
      case 40: // down
      case 83: // s
        moveBackward = false;
        break;
      case 39: // right
      case 68: // d
        moveRight = false;
        break;
    }
  };
  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );


  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('game').appendChild(renderer.domElement)

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );

  camera.position.set(-7, 0, -21);
  var canvas = document.getElementById('ui-canvas');
  var context = canvas.getContext( '2d' );  

  controls = new PointerLockControls(camera, document.getElementById('game'));
  scene = new THREE.Scene()
  
  scene.add(controls.getObject());

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

  const ray0 = new THREE.Mesh(
    new THREE.CylinderBufferGeometry(0.1,0.1,100),
    new THREE.MeshBasicMaterial({
      color:0xFF0000,
    })
  );
  const rayRot0 = new THREE.Group();
  ray0.rotation.x=Math.PI*0.5,
  rayRot0.add(ray0);

  scene.add(rayRot0);



  const ray1 = new THREE.Mesh(
    new THREE.CylinderBufferGeometry(0.1,0.1,100),
    new THREE.MeshBasicMaterial({
      color:0xFF0000,
    })
  );
  const rayRot1 = new THREE.Group();
  ray1.rotation.x=Math.PI*0.5,
  rayRot1.add(ray1);

  scene.add(rayRot1);

  

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
    const currTime = new Date().getTime();

    let t = currTime*0.00002;
  
    t = t-Math.floor(t);
  
    if(t<0.5) {
      t*=2.0;

    }
    else {
      t = t-0.5;
      t *=2.0;
      t = 1.0 -t;
    }


    if(currTime>rayVisTime)
      {
        ray0.visible = false;
        ray1.visible = false;
      }
    
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
    var intersects = raycaster.intersectObject( isectRoot , true);
    currentObject = null;
    for(let i=0;i<intersects.length;i++) {
      if(intersects[i] && intersects[i].object.userData.tag) {
        currentObject = intersects[i].object;
        break;
      }
    }
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
    const rayDirec = new THREE.Vector3();

    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
    rayDirec.set( mouse.x, mouse.y, 0.5 ).unproject( camera ).sub( camera.position ).normalize();
    rayDirec.multiplyScalar(200.0);
    rayDirec.add(camera.position);
    
    rayRot0.position.copy(camera.position);
    rayRot0.position.x+=2.0;
    rayRot0.lookAt(rayDirec);

    rayRot1.position.copy(camera.position);
    rayRot1.position.x-=2.0;
    rayRot1.lookAt(rayDirec);


    rayVisTime = new Date().getTime()+30;
    ray0.visible = true;
    ray1.visible = true;

    if(currentObject) {
      const root = currentObject.userData.root;

      isectRoot.remove(root);
      scene.remove(root.userData.visMesh);
      for(let i=0;i<root.userData.children.length;i++) {
        const child = root.userData.children[i];
        
      isectRoot.remove(child);
      scene.remove(child.userData.visMesh);
      }
    }
  }
  document.addEventListener( 'pointerlockchange', pointerlockchange, false );
  //window.addEventListener('mousemove', onMouseMove, false );
  //window.addEventListener("click", onMouseClick);
  // var canvas = document.getElementById('ui-canvas');
  // var context = canvas.getContext( '2d' );
  // context.clearRect(0, 0, window.width, window.height);
  // context.fillRect(0, 0, 1000,1000);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  renderer.setAnimationLoop( render );

  console.log("init");

  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

const cameraPos = new THREE.Vector3();
const cameraTarget = new THREE.Vector3();

function animate() {


  requestAnimationFrame( animate );

  var time = performance.now();
  var delta = ( time - prevTime ) / 1000;
  console.log(delta)

  velocity.x -= velocity.x * 1.0 * delta;
  velocity.z -= velocity.z * 1.0 * delta;
  console.log(velocity)

  if ( moveForward ) velocity.z -= 5.0 * delta;
  if ( moveBackward ) velocity.z += 5.0 * delta;
  if ( moveLeft ) velocity.x -= 5.0 * delta;
  if ( moveRight ) velocity.x += 5.0 * delta;

  controls.getObject().translateX( velocity.x * delta );
  controls.getObject().translateZ( velocity.z * delta );

  //controls.update();
  renderer.render( scene, camera );
	prevTime = time;
}

init().then(()=>{
  console.log("App inited");
  loadCrosshair();
  animate()
});;
