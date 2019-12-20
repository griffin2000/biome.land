import * as THREE from 'three'
import { Vector4 } from 'three';

import {createBulbGeometry, setBulbGeometry} from './Bulb'

import {createTendrilGeometry, createTendrilFromRaycasts} from './Tendril'

function createCollisMesh (visMesh, tag) {
    const mesh = new THREE.Mesh(visMesh.geometry,visMesh.material);
    mesh.position.copy(visMesh.position);
    mesh.scale.copy(visMesh.scale);
    mesh.quaternion.copy(visMesh.quaternion);
    
    tag = tag || "";
    mesh.userData = {
      tag,
      visMesh,
      children:[],
    };
    return mesh;
  }

  let nextCreation = 0;
  let currGeom = null;
  let currSize = 0;
  let plantCollis;
let bulbMaterial=null;

let currPos = new THREE.Vector3();

  export function creatorUpdate(worldRayCastCB, sceneRayCastCB, scene, isectRoot) {


    const currTime = new Date().getTime();



    if(currTime>=nextCreation) {

       const creationTime = (currTime - nextCreation)*0.001;
      
       if(!currGeom) {
        for(let j=0;j<20;j++) {
     
            const isectRes = worldRayCastCB(new THREE.Vector3(-12+Math.random()*20,5,-30+Math.random()*30),new THREE.Vector3(0,-1,0), );
      
            if(isectRes)
            {

                currSize = Math.random();
                currPos.copy(isectRes.point);
              var geometry = createBulbGeometry({
                    stemRadius:0.0001,
                    bulbRadius: 0.0001,

                    height:0.0001,
                    position:currPos,
                });
                currGeom = geometry;

                bulbMaterial = new THREE.MeshStandardMaterial();
                bulbMaterial.color = new THREE.Color(0.1,1.0,0.2);
                const plant = new THREE.Mesh( geometry,  bulbMaterial);


                scene.add( plant );
            
                plantCollis = createCollisMesh(plant,"Plant");

                plantCollis.userData.root = plantCollis;
                isectRoot.add(plantCollis);

                break;
            }
        }
                
  
        
       } else {

            const animTime = 1.0;
            if(creationTime<animTime) {
                const s = creationTime/animTime;
                console.log(s);

                
                setBulbGeometry(currGeom,{

                    stemRadius:s*(0.03+currSize*0.02),
                    bulbRadius:s*(0.1+currSize*0.02),

                    height:s*(1.0+currSize*1.0),
                    position:currPos,
                })



            } else {
    
                setBulbGeometry(currGeom,{

                    stemRadius:(0.03+currSize*0.02),
                    bulbRadius:(0.1+currSize*0.02),

                    height:(1.0+currSize*1.0),
                    position:currPos,
                })
                for(let i=0;i<5;i++) {
          
          
                    const direc = new THREE.Vector3(Math.random()*2.0-1.0, 0.0, Math.random()*2.0-1.0);
                    direc.normalize();
              
                    
                    const tendrilGeom = createTendrilFromRaycasts(worldRayCastCB, currPos,   direc, {
                      maxPoints: 50,
                      radius: 0.1+currSize*0.1,
                      height: 0.1+currSize*0.1,
                      maxStepDist: 0.1,
                    });
                
                    const tendril =  new THREE.Mesh( tendrilGeom,  bulbMaterial);
                
                    const tendrilCollis = createCollisMesh(tendril,"Plant");
    
                    plantCollis.userData.children.push(tendrilCollis);
                    tendrilCollis.userData.root = plantCollis;
    
                    isectRoot.add(tendrilCollis);
                    scene.add(tendril);
                
                  }
                nextCreation=currTime+Math.random()*5000;
                currGeom = null;
            }
       }

      
 
        


    }
}

export function startCreator(worldRayCastCB, sceneRayCastCB, scene, isectRoot) {
   const runFunc = ()=> {
    creatorUpdate(worldRayCastCB, sceneRayCastCB, scene, isectRoot);

    window.requestAnimationFrame(runFunc);
   };

   runFunc();

}
