import {
  CubeTextureLoader,
  Group,
  Mesh,
  MeshNormalMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { CAMERA_FAR, CAMERA_FOV, CAMERA_NEAR, LIGHT_INTENSITY, UNIT_VELOCITY } from './constants.js';
import { factoryGeometries } from './helpers.js';

import './style.css';

class Text3D {
  constructor(canvas, message) {
    // Declare infrastructures
    this.renderer = this.createRender(canvas);
    this.scene = this.createScene();
    this.camera = this.createCamera();
    this.pointLights = this.createPointLights();
    this.material = this.createMaterial();
    this.control = this.createControl();
    this.groupSatellies = this.createGroupSatellies();

    // load the font and texture
    this.loadEnvironmentTexture();
    this.loadFont(message, this.scene, this.material);

    this.handleDoubleClick(canvas);
    this.handleResize();

    this.render();
  }

  createRender(canvas) {
    const renderer = new WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    return renderer;
  }

  createCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    const camera = new PerspectiveCamera(CAMERA_FOV, aspect, CAMERA_NEAR, CAMERA_FAR);
    camera.position.set(0, 0, 15);
    camera.lookAt(this.scene.position);
    return camera;
  }

  createScene() {
    const scene = new Scene();
    return scene;
  }

  createMaterial() {
    const material = new MeshNormalMaterial({});
    return material;
  }

  createPointLights() {
    const lights = [];
    lights[0] = new PointLight(0xffffff, LIGHT_INTENSITY, 0);
    lights[1] = new PointLight(0xffffff, LIGHT_INTENSITY, 0);
    lights[2] = new PointLight(0xffffff, LIGHT_INTENSITY, 0);

    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 10);
    lights[2].position.set(-100, -200, -100);

    // * if you have 1 point light and want to create shadow for your object
    // lights[0].castShadow = true;
    return lights;
  }

  createGroupSatellies() {
    const group = new Group();

    const donuts = factoryGeometries('donut', 150, 50, this.material);
    const rings = factoryGeometries('ring', 150, 50, this.material);
    const balls = factoryGeometries('ball', 150, 50, this.material);
    for (const mesh of [...donuts, ...rings, ...balls]) {
      group.add(mesh);
    }
    return group;
  }

  createControl() {
    const control = new OrbitControls(this.camera, this.renderer.domElement);
    control.enableZoom = true;
    control.enableDamping = true;
    control.autoRotate = true;
    return control;
  }

  loadFont(message, scene, material) {
    const loader = new FontLoader();
    loader.load(
      '/fonts/helvetiker_regular.typeface.json',
      function (font) {
        const textGeometry = new TextGeometry(message, {
          font: font,
          size: 1,
          height: 1,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 64
        });
        textGeometry.scale(0.8, 0.8, 0.8);
        textGeometry.computeBoundingBox();
        textGeometry.center();

        if (scene) {
          const testMesh = new Mesh(textGeometry, material);
          testMesh.position.set(0, 0, 0);
          testMesh.tick = function () {
            this.rotation.x -= 4 * UNIT_VELOCITY;
            this.rotation.y -= 4 * UNIT_VELOCITY;
            this.rotation.z -= 4 * UNIT_VELOCITY;
          };

          scene.add(testMesh);
        }
      },
      () => {},
      (event) => {
        console.log(event);
      }
    );
  }

  loadEnvironmentTexture() {
    const texture = new CubeTextureLoader()
      .setPath('textures/environmentMaps/')
      .load(['px.png', 'px.png', 'px.png', 'px.png', 'px.png', 'px.png']);

    if (this.scene) {
      this.scene.background = texture;
    }
  }

  handleResize() {
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // * update camera
      this.camera.aspect = width / height;
      camera.updateProjectionMatrix();

      // * update renderer
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  handleDoubleClick(canvas) {
    window.addEventListener('dblclick', () => {
      const isFullScreen = document.fullscreenElement || document.webkitFullscreenElement;
      if (isFullScreen && document.exitFullscreen) {
        document.exitFullscreen();
        return;
      }

      if (isFullScreen && document.webkitExitFullscreen) {
        document.exitFullscreen();
        return;
      }

      if (!isFullScreen && canvas.requestFullscreen) {
        canvas.requestFullscreen();
        return;
      }

      if (!isFullScreen && canvas.webkitRequestFullscreen) {
        canvas.webkitRequestFullscreen();
      }
    });
  }

  render() {
    for (const light of this.pointLights) {
      this.scene.add(light);
    }
    this.scene.add(this.groupSatellies);
    this.renderer.render(this.scene, this.camera);
    this.tick();
  }

  tick = () => {
    requestAnimationFrame(this.tick);
    this.groupSatellies.rotation.x += 5.5 * UNIT_VELOCITY;
    this.groupSatellies.rotation.y += 5.5 * UNIT_VELOCITY;
    this.groupSatellies.rotation.z += 5.5 * UNIT_VELOCITY;

    for (const child of this.scene.children) {
      if (child.tick) {
        child.tick();
      }
    }

    this.renderer.render(this.scene, this.camera);
  };
}

export default Text3D;

window.addEventListener('load', () => {
  new Text3D(document.getElementById('root'), 'Hello world!\nNicholas Bien\nA creative FE developer');
});
