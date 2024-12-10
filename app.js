let localStream = null;
let screenStream = null;
let userName = "";
let remoteStreams = {};
let enlargedBox = null;

function showMessage(message) {
    const messageBox = document.createElement('div');
    messageBox.classList.add('message-box');
    messageBox.innerText = message;
    document.body.appendChild(messageBox);
    setTimeout(() => {
        messageBox.remove();
    }, 3000);
}

function createParticipantBox(name, stream) {
    const participantsDiv = document.getElementById('participants');
    
    const participantBox = document.createElement('div');
    participantBox.classList.add('participant-box');
    participantBox.addEventListener('click', () => toggleEnlargeBox(participantBox));
    
    const nameLabel = document.createElement('div');
    nameLabel.classList.add('name');
    nameLabel.innerText = name;
    participantBox.appendChild(nameLabel);
    
    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    participantBox.appendChild(videoElement);
    
    const controlButton = document.createElement('button');
    controlButton.classList.add('control-button');
    controlButton.innerText = 'Minimize';
    controlButton.onclick = () => minimizeBox(participantBox);
    participantBox.appendChild(controlButton);
    
    participantsDiv.appendChild(participantBox);
}

function toggleEnlargeBox(participantBox) {
    if (enlargedBox && enlargedBox !== participantBox) {
        minimizeBox(enlargedBox);
    }
    
    participantBox.classList.toggle('enlarged');
    enlargedBox = participantBox.classList.contains('enlarged') ? participantBox : null;
}

function minimizeBox(participantBox) {
    participantBox.classList.remove('enlarged');
    enlargedBox = null;
}

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoElement = document.querySelector('video#localVideo');
        videoElement.srcObject = stream;
        localStream = stream;
        
        createParticipantBox(userName, localStream);
        showMessage("Camera started.");
    } catch (err) {
        console.error("Error accessing camera: ", err);
        showMessage("Error accessing camera. Please try again.");
    }
}

async function startScreenShare() {
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const videoElement = document.querySelector('video#screenShare');
        videoElement.srcObject = stream;
        screenStream = stream;
        
        createParticipantBox(userName, screenStream);
        showMessage("Screen sharing started.");
    } catch (err) {
        console.error("Error starting screen share: ", err);
        showMessage("Error starting screen share. Please try again.");
    }
}

function goToHomeScreen() {
    document.getElementById('videoCallScreen').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'block';
    document.getElementById('participants').innerHTML = ''; // Clear participants
}

function goToVideoCallScreen() {
    userName = document.getElementById('userNameInput').value;
    if (!userName) {
        alert("Please enter a name.");
        return;
    }
    
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('videoCallScreen').style.display = 'block';
    document.getElementById('userNameDisplay').innerText = `You are: ${userName}`;
    startCamera();  // Automatically start camera when joining the room
}

function createPrivateRoom() {
    userName = document.getElementById('userNameInput').value;
    if (!userName) {
        alert("Please enter a name.");
        return;
    }
    // You can add logic to create private rooms here.
    showMessage(`Private room created. Welcome, ${userName}!`);
    goToVideoCallScreen();
}
