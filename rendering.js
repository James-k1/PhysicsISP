// create a new Three.js scene
var scene = new THREE.Scene();

// create a new sphere geometry
var sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

// create a new material for the sphere
var sphereMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});

// create a new mesh using the sphere geometry and material
var sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

sphereMesh.position.set(0, 0, -10);
// add the sphere mesh to the scene
scene.add(sphereMesh);

// create a new Three.js renderer
var renderer = new THREE.WebGLRenderer();

// set the size of the renderer to match the window
renderer.setSize(window.innerWidth, window.innerHeight);

// add the renderer's canvas to the DOM
document.body.appendChild(renderer.domElement);
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// render the scene
renderer.render(scene, camera);