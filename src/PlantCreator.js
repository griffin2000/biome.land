import * as THREE from 'three'
import { Vector4 } from 'three';

import {createBulbGeometry} from './Bulb'

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
  export function creatorUpdate(worldRayCastCB, sceneRayCastCB, scene, isectRoot) {


    const currTime = new Date().getTime();



    if(currTime>=nextCreation) {

      
      
      
        for(let j=0;j<20;j++) {
     
            const isectRes = worldRayCastCB(new THREE.Vector3(-12+Math.random()*20,5,-30+Math.random()*30),new THREE.Vector3(0,-1,0), );
      
            if(isectRes)
            {

             const s = Math.random();
          
              var geometry = createBulbGeometry({
                    stemRadius:0.03+s*0.02,
                    bulbRadius: 0.1+s*0.02,
                    
                    height:1.0+s*1.0,
                    position:isectRes.point,
                });
            
                const bulbMaterial = new THREE.MeshStandardMaterial();
                bulbMaterial.color = new THREE.Color(0.1,1.0,0.2);
                const plant = new THREE.Mesh( geometry,  bulbMaterial);
/*
                plant.position.x = isectRes.point.x;
                plant.position.y = isectRes.point.y;
                plant.position.z = isectRes.point.z;
*/

                scene.add( plant );
            
                const plantCollis = createCollisMesh(plant,"Plant");

                plantCollis.userData.root = plantCollis;
             const collisObj = [];
             collisObj.push(plantCollis);
          
              for(let i=0;i<5;i++) {
          
          
                const direc = new THREE.Vector3(Math.random()*2.0-1.0, 0.0, Math.random()*2.0-1.0);
                direc.normalize();
          
                
                const tendrilGeom = createTendrilFromRaycasts(sceneRayCastCB, isectRes.point,   direc, {
                  maxPoints: 50,
                  radius: 0.1+s*0.1,
                  height: 0.1+s*0.1,
                  maxStepDist: 0.1,
                });
            
                const tendril =  new THREE.Mesh( tendrilGeom,  bulbMaterial);
            
                const tendrilCollis = createCollisMesh(tendril,"Plant");

                plantCollis.userData.children.push(tendrilCollis);
                tendrilCollis.userData.root = plantCollis;

                collisObj.push(tendrilCollis);
                scene.add(tendril);
            
              }

                      
              for(let i=0;i<collisObj.length;i++) {
                isectRoot.add(collisObj[i]);
            }


              break;
            }     
        }
 
        
        nextCreation=currTime+Math.random()*5000;


    }
}

export function startCreator(worldRayCastCB, sceneRayCastCB, scene, isectRoot) {
   const runFunc = ()=> {
    creatorUpdate(worldRayCastCB, sceneRayCastCB, scene, isectRoot);

    window.requestAnimationFrame(runFunc);
   };

   runFunc();

}
