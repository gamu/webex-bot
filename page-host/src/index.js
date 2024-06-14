const myAccessToken = '';

async function uploadFile(fileArrayBuffer) {

    const byteArray = new Uint8Array(fileArrayBuffer);

    const backendUrl = 'http://host.docker.internal:5263/post'
    //const backendUrl = 'http://localhost:5263/post'

    try {
        const response = await fetch(backendUrl, {
            mode: 'no-cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream'
            },
            body: byteArray
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const result = await response.json();
        console.log('File uploaded successfully:', result);
        alert('File uploaded successfully: ' + result.filePath);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        alert('File upload failed: ' + error.message);
    }
}

const webex = window.Webex.init({
    credentials: {
        access_token: myAccessToken
    }
});

webex.meetings.register()
    .catch((err) => {
        console.error(err);
        alert(err);
        throw err;
    });

function bindMeetingEvents(meeting) {
    meeting.on('error', (err) => {
        console.error(err);
    });

    // Handle media streams changes to ready state
    meeting.on('media:ready', async (media) => {
        if (!media) {
            return;
        }
        if (media.type === 'local') {
            document.getElementById('self-view').srcObject = media.stream;
        }
        if (media.type === 'remoteVideo') {
            document.getElementById('remote-view-video').srcObject = media.stream;
        }
        if (media.type === 'remoteAudio') {
            document.getElementById('remote-view-audio').srcObject = media.stream;
            const recorder = new MediaRecorder(media.stream);
            const data = [];
            recorder.ondataavailable = (event) => {
                console.log(data);
                event.data.arrayBuffer().then((buffer) => {uploadFile(buffer)});
                data.push(event.data);
            };
            recorder.start();
            setInterval(() => recorder.requestData(), 10000);
        }
    });

    // Handle media streams stopping
    meeting.on('media:stopped', (media) => {
        // Remove media streams
        if (media.type === 'local') {
            document.getElementById('self-view').srcObject = null;
        }
        if (media.type === 'remoteVideo') {
            document.getElementById('remote-view-video').srcObject = null;
        }
        if (media.type === 'remoteAudio') {
            document.getElementById('remote-view-audio').srcObject = null;
        }
    });

    // Of course, we'd also like to be able to leave the meeting:
    document.getElementById('hangup').addEventListener('click', () => {
        meeting.leave();
    });
}

// Join the meeting and add media
function joinMeeting(meeting) {

    return meeting.join().then(() => {
        const mediaSettings = {
            receiveVideo: true,
            receiveAudio: true,
            receiveShare: false,
            sendVideo: false,
            sendAudio: true,
            sendShare: false
        };

        // Get our local media stream and add it to the meeting
        return meeting.getMediaStreams(mediaSettings).then((mediaStreams) => {
            const [localStream, localShare] = mediaStreams;

            meeting.addMedia({
                localShare,
                localStream,
                mediaSettings
            });
        }).catch((error) => console.error(error));
    });
}

setTimeout(() => {
    return webex.meetings.create("https://gamucoolrocks-1xhe.webex.com/meet/admin18").then((meeting) => {
        // Call our helper function for binding events to meetings
        bindMeetingEvents(meeting);

        return joinMeeting(meeting);
    })
        .catch((error) => {
            // Report the error
            console.error(error);
        });
}, 10000);

document.getElementById('destination').addEventListener('submit', (event) => {
    // again, we don't want to reload when we try to join
    event.preventDefault();

    const destination = document.getElementById('invitee').value;

    return webex.meetings.create("https://gamucoolrocks-1xhe.webex.com/meet/admin18").then((meeting) => {
        // Call our helper function for binding events to meetings
        bindMeetingEvents(meeting);

        return joinMeeting(meeting);
    })
        .catch((error) => {
            // Report the error
            console.error(error);
        });
});