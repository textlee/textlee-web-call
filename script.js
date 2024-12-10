// Firebase config (replace with your actual Firebase config)
const firebaseConfig = {
    apiKey: "AIzaSyDD8CyNS-EqTsAcA8iRY8_Go27bpMeNeOg",
    authDomain: "textleee-web-calls.firebaseapp.com",
    databaseURL: "https://textleee-web-calls-default-rtdb.firebaseio.com",
    projectId: "textleee-web-calls",
    storageBucket: "textleee-web-calls.firebasestorage.app",
    messagingSenderId: "334854747152",
    appId: "1:334854747152:web:206ef1b24d25d0775a8695"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
  const auth = firebase.auth();
  
  // Get references to local and remote video elements
  const localVideo = document.getElementById('local-video');
  const remoteVideo = document.getElementById('remote-video');
  
  // Create a peer connection
  let localStream;
  let remoteStream;
  let peerConnection;
  let roomId = "test-room"; // Define a test room
  let iceServers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }; // Google public STUN server
  
  // Access the webcam and microphone
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localStream = stream;
      localVideo.srcObject = localStream;
    })
    .catch((error) => {
      console.error("Error accessing media devices.", error);
    });
  
  // Firebase authentication (using anonymous sign-in)
  auth.signInAnonymously().catch((error) => console.error("Firebase auth error:", error));
  
  // Function to create a peer connection
  function createPeerConnection() {
    peerConnection = new RTCPeerConnection(iceServers);
  
    // Add the local stream to the peer connection
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
  
    // On receiving remote stream, display it on the remote video element
    peerConnection.ontrack = (event) => {
      remoteStream = event.streams[0];
      remoteVideo.srcObject = remoteStream;
    };
  
    // Handle ICE candidate events
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to Firebase
        sendMessage({ type: 'ice-candidate', candidate: event.candidate });
      }
    };
  }
  
  // Function to create and send offer
  function createOffer() {
    createPeerConnection();
    peerConnection.createOffer()
      .then((offer) => {
        return peerConnection.setLocalDescription(offer);
      })
      .then(() => {
        sendMessage({ type: 'offer', offer: peerConnection.localDescription });
      })
      .catch((error) => console.error('Error creating offer:', error));
  }
  
  // Function to handle receiving an offer
  function handleOffer(offer) {
    createPeerConnection();
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
      .then(() => peerConnection.createAnswer())
      .then((answer) => {
        return peerConnection.setLocalDescription(answer);
      })
      .then(() => {
        sendMessage({ type: 'answer', answer: peerConnection.localDescription });
      })
      .catch((error) => console.error('Error handling offer:', error));
  }
  
  // Function to handle receiving an answer
  function handleAnswer(answer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
      .catch((error) => console.error('Error handling answer:', error));
  }
  
  // Function to handle receiving an ICE candidate
  function handleIceCandidate(candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      .catch((error) => console.error('Error adding ICE candidate:', error));
  }
  
  // Function to send messages to Firebase (signaling)
  function sendMessage(message) {
    const messagesRef = database.ref('messages/' + roomId);
    messagesRef.push().set(message);
  }
  
  // Listening for messages from Firebase (signaling)
  database.ref('messages/' + roomId).on('child_added', (snapshot) => {
    const message = snapshot.val();
    
    switch (message.type) {
      case 'offer':
        handleOffer(message.offer);
        break;
      case 'answer':
        handleAnswer(message.answer);
        break;
      case 'ice-candidate':
        handleIceCandidate(message.candidate);
        break;
    }
  });
  
  // Call createOffer to start the connection
  createOffer();
  
  