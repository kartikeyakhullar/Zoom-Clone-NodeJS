const socket = io('/');
const videoGrid = document.getElementById('video-grid');

const peer = new Peer(undefined, {
    path : '/peerjs',
    host : '/',
    port : '3000'
});

const myVideo = document.createElement('video');
myVideo.muted = true;


// Getting the video stream from the webcam and setting it to myVideoStream.
// getUserMedia function asks to access audio and video devices of the laptop.
// We need to save a copy of our video stream in myVideoStream so as to give it 
// to the people who are on a video call with us.

let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video : true,
    audio : true
}).then((stream)=>{
    console.log(typeof(stream));
    myVideoStream = stream;
    addVideoStream(myVideo,stream);

    // Here we are answering the peerjs call we made

    peer.on('call',(call)=>{
        console.log('HERE ANSWERING THE CALL');
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', (userVideoStream) => {
            addVideoStream(video,userVideoStream);
        })
    })

    // Here we are listening to the message of user-connected to our roomId

    socket.on('user-connected', (userId)=>{
        connectToNewUser(userId, stream);
    })    
})

// Whenever you open a connection peerjs provides you a unique id for that connection

peer.on('open',(id)=>{
    // Here we are emitting the message of joining the room which is handled in the server.js
    socket.emit('join-room', ROOM_ID, id);
})




const connectToNewUser = (userId, stream)=>{
    // Here I am calling the other person who has joined
    console.log(typeof(stream));
    const call = peer.call(userId,stream);
    // Here I am creating a video element for his stream
    const video = document.createElement('video');
    // When I receive his stream I am adding it to the screen
    call.on('stream',(userVideoStream)=>{
        addVideoStream(video,userVideoStream);
    })
}

const addVideoStream = (video,stream)=>{
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', ()=>{
        video.play();
    })
    videoGrid.append(video);
}


// Working on the chat window

// Selecting the input element
let text = $('input');

// Looking for keydown
$('html').keydown((e)=>{
    // Looking for enter key
    if(e.which == 13 && text.val().length !== 0){
        // Sending the message written in the textbox
        socket.emit('message', text.val());
        // Clearing the textbox
        text.val('');
    }
})

// Receiving the message to put it in the chat history as well

socket.on('create-message', (message)=>{
    $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
    scrollToBottom();
})

// Scroll bar will look good with this as it looks continuous
const scrollToBottom = ()=>{
    let d = $('.main__chat_window');
    d.scrollTop(d.prop('scrollHeight'));
}

// Muting or Unmuting our audio

const muteUnmute = ()=>{
    // Getting the enabled option from myVideoStream
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if(enabled){
        // Disabling it ie toggle
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }else{
        // Enabling it ie toggle
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}


// Playing or stopping our video

const playStop = ()=>{
    // Getting the enabled option from myVideoStream
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        // Disabling it ie toggle
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        // Enabling it ie toggle
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
} 



// Changing the icons appearance and text for mute unmute buttons

const setMuteButton = () => {
    console.log('Mute');
    const html = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    console.log('Unmute');
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

// Changing the icons appearance and text for video button

const setStopVideo = () => {
    const html = `
        <i class="fas fa-video"></i>
        <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
        <i class="stop fas fa-video-slash"></i>
        <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}