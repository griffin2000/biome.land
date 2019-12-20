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
    };
    return mesh;
  }

  let nextCreation = 0;
  export function creatorUpdate(worldRayCastCB, sceneRayCastCB, scene, isectRoot) {


    const currTime = new Date().getTime();



    if(currTime>=nextCreation) {
        var geometry = createBulbGeometry({
            stemRadius:0.05,
            buldRadius: 0.2,
            height:2.0,
        });
    
        const bulbMaterial = new THREE.MeshStandardMaterial();
        bulbMaterial.color = new THREE.Color(0.1,1.0,0.2);
        const firstPlant = new THREE.Mesh( geometry,  bulbMaterial);
        scene.add( firstPlant );
      
        isectRoot.add(createCollisMesh(firstPlant,"Plant"));
      
      
      
        for(let j=0;j<20;j++) {
     
            const isectRes = worldRayCastCB(new THREE.Vector3(-12+Math.random()*20,5,-30+Math.random()*30),new THREE.Vector3(0,-1,0), );
      
            if(isectRes)
            {
              firstPlant.position.x = isectRes.point.x;
              firstPlant.position.y = isectRes.point.y;
              firstPlant.position.z = isectRes.point.z;
          
              
          
              for(let i=0;i<5;i++) {
          
          
                const direc = new THREE.Vector3(Math.random()*2.0-1.0, 0.0, Math.random()*2.0-1.0);
                direc.normalize();
          
                
                const tendrilGeom = createTendrilFromRaycasts(sceneRayCastCB, isectRes.point,   direc, {
                  maxPoints: 50,
                  radius: 0.25,
                  maxStepDist: 0.1,
                });
            
                const tendril =  new THREE.Mesh( tendrilGeom,  bulbMaterial);
            
                isectRoot.add(createCollisMesh(tendril,"Plant"));
                scene.add(tendril);
            
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
