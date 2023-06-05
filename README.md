# Three.js Starter
Courtesy of Bruno Simon of https://threejs-journey.xyz/

## Setup
Download [Node.js](https://nodejs.org/en/download/).
Download the repo files
Run the following commands or just use the [deployed version](https://physicsisp.onrender.com/):

``` bash
# Download repo 
git clone https://github.com/James-k1/PhysicsISP.git

# Change directory to root folder
cd PhysicsISP

# Install dependencies (only the first time)
npm install

# Run the local server at localhost:8080
npm run dev

# Build for production in the dist/ directory
npm run build
```
## Use

Simulation:
The simulation simulates 3 forces. Gravity, electrostatic force, and a rough repersentation of the strong force in the form of collision detection. 

Navigating:
In the center of the screen there will be a white dot. This is a light source and can help with navigating the scene. When left clicking and dragging the mouse, the camera will orbit the center point. To change the radius or how close to the dot the camera is, use the scroll wheel or use two fingers to zoom in on a touch screen. To change the center point, right click with the mouse and drag or use two fingers and drag accross the screen. Changing the center point may make it more difficult to navigate the scene as there is no fixed point to use as a reference when navigating.

Control panel:
The control panel, located in the top right, has 9 inputs the user can modify. Firsly addObjects, when this is enabled a user can click on the screen and whatever spesification below are set will be used to add object(s). Secondly, Object Count is a setting variable for the amount of objects to add to the scene on next click. Third, Radius controls the max distance objects can spawn from eachother. Fourth, Distance is how far away from the camera the objects should spawn. Fifth and Sixth, Proton Intensity and Electron Intensity are logorithmic scales. They control how many protons and electrons are contained in one sphear. Electrons do not have any effect on the mass however the do affects charge. Seventh, Distance Scale is another logorithmic scale that controls how close each object is without affecting their radius. It's like stretching the three dimensional fabric in all directions so the objects are closer together. Eighth, Theta is the simulations accuracy, gennerally 0.5 is a typical value that yeild acceptable accuracy. Setting this value lower increases accuracy and decreses speed while setting it higher decreases accuracy while inscreasing speed. Finally, the Show Quad Tree allows the user to visualize the data structure used, called an Octree. Note: the visualization isn't perfect.

Graph:
The graph is pretty simple. It plots time in seconds on the x-axis and the current maximum mass an object has reached on the y-axis.  
