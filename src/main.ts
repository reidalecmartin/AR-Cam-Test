import {
  bootstrapCameraKit,
  CameraKitSession,
  createMediaStreamSource,
  Transform2D,
  Lens,
} from '@snap/camera-kit';

let mediaStream: MediaStream;

const liveRenderTarget = document.getElementById('canvas') as HTMLCanvasElement;
const takeImageButton = document.getElementById('picture') as HTMLButtonElement;

async function init() {
  const liveRenderTarget = document.getElementById(
    'canvas'
  ) as HTMLCanvasElement;
  const cameraKit = await bootstrapCameraKit({ apiToken: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzEyMDg1NjYyLCJzdWIiOiIyOTU4YTFjZi0xY2Q3LTQzNGYtYmRiNC03N2YzMzRmNjlhM2N-U1RBR0lOR34zMTZjYmNlOC04MTQ0LTRhNWQtOGIzNy0xZTU2YjI2MGFhOWQifQ.3Kn9xhjcNO0qrlsuRdadOsRz_LF_QJSlOP6eTc5D8d8' });
  const session = await cameraKit.createSession({ liveRenderTarget });
  const { lenses } = await cameraKit.lensRepository.loadLensGroups([
    '3af90634-0f51-4623-af3a-d7b8fef324bf',
  ]);

  session.applyLens(lenses[0]);

  await setCameraKitSource(session);

  attachCamerasToSelect(session);
  attachLensesToSelect(lenses, session);

  takePicture(); 
}

function takePicture() {

  takeImageButton.addEventListener('click', () => {
    let image = liveRenderTarget.toDataURL();

    const createE1 = document.createElement('a');
    createE1.href = image;

    createE1.download = "Tunnels_Img";

    createE1.click();
    createE1.remove();


  });

}

async function setCameraKitSource(
  session: CameraKitSession,
  deviceId?: string
) {
  if (mediaStream) {
    session.pause();
    mediaStream.getVideoTracks()[0].stop();
  }

  mediaStream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId },
  });

  const source = createMediaStreamSource(mediaStream);

  await session.setSource(source);

  source.setTransform(Transform2D.MirrorX);

  session.play();
}

async function attachCamerasToSelect(session: CameraKitSession) {
  const cameraSelect = document.getElementById('cameras') as HTMLSelectElement;
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices.filter(({ kind }) => kind === 'videoinput');

  cameras.forEach((camera) => {
    const option = document.createElement('option');

    option.value = camera.deviceId;
    option.text = camera.label;

    cameraSelect.appendChild(option);
  });

  cameraSelect.addEventListener('change', (event) => {
    const deviceId = (event.target as HTMLSelectElement).selectedOptions[0]
      .value;

    setCameraKitSource(session, deviceId);
  });
}

async function attachLensesToSelect(lenses: Lens[], session: CameraKitSession) {
  const lensSelect = document.getElementById('lenses') as HTMLSelectElement;

  lenses.forEach((lens) => {
    const option = document.createElement('option');

    option.value = lens.id;
    option.text = lens.name;

    lensSelect.appendChild(option);
  });

  lensSelect.addEventListener('change', (event) => {
    const lensId = (event.target as HTMLSelectElement).selectedOptions[0].value;
    const lens = lenses.find((lens) => lens.id === lensId);

    if (lens) session.applyLens(lens);
  });
}

init();