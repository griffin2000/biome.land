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
  let currSeed;

let bulbMaterial=null;

let currPos = new THREE.Vector3();

  export function creatorUpdate(worldRayCastCB, sceneRayCastCB, scene, isectRoot) {


    const currTime = new Date().getTime();

    const bend = 0.2;

    if(currTime>=nextCreation) {

       const creationTime = (currTime - nextCreation)*0.001;
      
       if(!currGeom) {

        bulbMaterial = new THREE.MeshStandardMaterial();
        bulbMaterial.color = new THREE.Color(0.1,1.0,0.2);

        const direc = new THREE.Vector3(Math.random()*2.0-1.0, 0.0, Math.random()*2.0-1.0);
        direc.normalize();
              
        const tendrilGeom = createTendrilFromRaycasts(worldRayCastCB, currPos,   direc, {
            maxPoints: 80,
            radius: 0.1+currSize*0.1,
            height: 0.1+currSize*0.1,
            maxStepDist: 0.25,
        });

        const points = tendrilGeom.userData.points;

        if(plantCollis) {

  
          const tendril =  new THREE.Mesh( tendrilGeom,  bulbMaterial);
      
          const tendrilCollis = createCollisMesh(tendril,"Plant");
  
              plantCollis.userData.children.push(tendrilCollis);
          tendrilCollis.userData.root = plantCollis;
  
          isectRoot.add(tendrilCollis);
          scene.add(tendril);
        }
        

        const nextMove= Math.random()>0.8;

        if(!plantCollis||nextMove ) {

            if(Math.random()<0.2) {
                for(let j=0;j<2000;j++) {
     
                    const isectRes = worldRayCastCB(new THREE.Vector3(-12+Math.random()*20,5,-30+Math.random()*30),new THREE.Vector3(0,-1,0), );
                
                    if(isectRes)
                    {
                        currPos.copy(isectRes.point);
                        break;
                    }
                }
                   
            }
            else  {
                let idx = ~~(points.length*Math.random());
                idx = Math.min(idx+4, points.length-1);

                currPos.copy(points[idx]);
            }


            currSize = Math.random();
            currSeed = ~~(new Date().getTime());

            var geometry = createBulbGeometry({
                stemRadius:0.0001,
                bulbRadius: 0.0001,

                height:0.0001,
                position:currPos,
                seed:currSeed,
                bend,
            });
            currGeom = geometry;

            const plant = new THREE.Mesh( geometry,  bulbMaterial);


            scene.add( plant );
        
            plantCollis = createCollisMesh(plant,"Plant");

            plantCollis.userData.root = plantCollis;
            isectRoot.add(plantCollis);

        }
        else {
            nextCreation=currTime+Math.random()*500;
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
                    seed:currSeed,
                    bend,
                })



            } else {
    
                setBulbGeometry(currGeom,{

                    stemRadius:(0.03+currSize*0.02),
                    bulbRadius:(0.1+currSize*0.02),

                    height:(1.0+currSize*1.0),
                    position:currPos,
                    seed:currSeed,
                    bend,
                })

                nextCreation=currTime+Math.random()*1000;
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

   for(let j=0;j<2000;j++) {
     
    const isectRes = worldRayCastCB(new THREE.Vector3(-12+Math.random()*20,5,-30+Math.random()*30),new THREE.Vector3(0,-1,0), );

    if(isectRes)
    {
        currPos.copy(isectRes.point);
        break;
    }
   }

   runFunc();

}
