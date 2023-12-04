const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);

const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
const sphere = new THREE.Mesh(sphereGeometry, material);
scene.add(sphere);

camera.position.z = 10;

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

// Take a photo button
const takePhotoButton = document.createElement('button');
takePhotoButton.textContent = 'Take Photo';
document.body.appendChild(takePhotoButton);

// Function to take a photo and apply it to the sphere
takePhotoButton.addEventListener('click', () => {
  takePhoto().then(photoBlob => {
    const photoUrl = URL.createObjectURL(photoBlob);
    const texture = new THREE.TextureLoader().load(photoUrl);
    material.map = texture;
    material.needsUpdate = true;
  });
});

// Function to capture a photo from the user's camera
function takePhoto() {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
          stream.getTracks().forEach(track => track.stop());
          resolve(dataURItoBlob(canvas.toDataURL('image/png')));
        };
        video.play();
      })
      .catch(error => reject(error));
  });
}

// Helper function to convert data URI to Blob
function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}
