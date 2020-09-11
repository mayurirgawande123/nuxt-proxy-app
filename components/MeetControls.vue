<template>
  <v-row>
    <v-col cols="12">
      <v-row>
        <v-col cols="4" md="1">
          <v-btn fab color="green">
            <v-icon>
              fa-microphone
              <!-- fa-microphone-slash -->
            </v-icon>
          </v-btn>
        </v-col>

        <v-col cols="4" md="1">
          <v-btn fab botto color="green" @click.native="startStopVideo">
            <v-icon>
              fa-video
              <!-- fa-video-slash -->
            </v-icon>
          </v-btn>
        </v-col>
        <v-col cols="4" md="1">
          <v-btn fab botto color="green" @click="shareScreen">
            <v-icon>
              mdi-monitor-share
              <!-- mdi-monitor-off -->
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  data: () => ({
    localStream: "",
    screen:'',
    remoteStream: "",
    isStarted: false,
    pc: "",    
    turnReady: "",
    pcConfig: {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    },
    // Set up audio and video regardless of what devices are present.
    sdpConstraints: {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    },
    displayMediaOptions: {
      video: {
        cursor: "always"
      },
      audio: false
    },
  }),
  mounted() {
    console.log("Getiing User Media");

    //Get Media Stream
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then(this.gotStream)
      .catch(function (e) {
        alert("getUserMedia() error: " + e.name);
      });
  },
  computed: {
    ...mapState([
      "user",
      "users",
      "mediaMessage",
      "isChannelReady",
      "isInitiator",
    ]),
  },
  watch: {
    users(users) {
      console.log("Users Count:" + users.length, users);
    },
    mediaMessage(msg) {
      console.log("Media Message", msg);

      if (msg.text.type === "offer") {
        console.log("Offer Recieved");

        this.pc.setRemoteDescription(new RTCSessionDescription(msg.text));

        this.doAnswer();
      } else if (msg.text.type === "answer" && this.isStarted) {
        this.pc.setRemoteDescription(new RTCSessionDescription(msg.text));
      } else if (msg.text.type === "candidate" && this.isStarted) {
        var candidate = new RTCIceCandidate({
          sdpMLineIndex: msg.text.label,
          candidate: msg.text.candidate,
        });

        this.pc.addIceCandidate(candidate);
      } else if (msg.text === "bye" && this.isStarted) {
        this.handleRemoteHangup();
      }
    },
  },
  methods: {
    ...mapActions(["createMediaMessage", "createMessage"]),

    startStopVideo() {
      this.localStream.getVideoTracks()[0].enabled = !this.localStream.getVideoTracks()[0]
        .enabled;
    },
    startStopAudio() {
      this.localStream.getAudioTracks()[0].enabled = !this.localStream.getAudioTracks()[0]
        .enabled;
    },
    gotStream(stream) {
      var $this = this;

      console.log("gotStream: Adding local stream.", stream);

      stream.getVideoTracks()[0].enabled = false;
      stream.getAudioTracks()[0].enabled = false;

      $this.localStream = stream;
      $this.$parent.$refs.localVideo.srcObject = stream;

      this.maybeStart();
    },
    maybeStart() {
      console.log(
        "maybeStart() ",
        this.isStarted,
        this.localStream,
        this.isChannelReady
      );

      if (!this.isStarted && this.isChannelReady) {
        console.log("Creating RTCPeerConnection");

        this.createPeerConnection();

        console.log("Local Stream", this.localStream);

       
        console.log("PC Local Stream Ok");
       
        this.pc.addStream(this.localStream);
       
        this.isStarted = true;

        console.log("Is Initiator", this.isInitiator);
       
        this.doCall();
      
      }
    },
    createPeerConnection() {
      try {
        this.pc = new RTCPeerConnection(null);
        this.pc.onicecandidate = this.handleIceCandidate;
        this.pc.onaddstream = this.handleRemoteStreamAdded;
        this.pc.onremovestream = this.handleRemoteStreamRemoved;

        console.log("Created RTCPeerConnnection");
      } catch (e) {
        console.log("Failed to create PeerConnection, exception: " + e.message);
        alert("Cannot create RTCPeerConnection object.");
        return;
      }
    },
    handleIceCandidate(event) {
      console.log("Ice Candidate Event:", event);

      if (event.candidate) {
        this.createMediaMessage({
          type: "candidate",
          label: event.candidate.sdpMLineIndex,
          id: event.candidate.sdpMid,
          candidate: event.candidate.candidate,
        });
      } else {
        console.log("End of candidates.");
      }
    },
    handleRemoteStreamAdded(event) {
      var $this = this;
      console.log("Remote Stream Added", event.stream);

      $this.remoteStream = event.stream;

      console.log("Remote Video : ", this.$parent);

      $this.$parent.$refs.remoteVideo.srcObject = $this.remoteStream;
    },
    handleRemoteStreamRemoved(event) {
      console.log("Remote Stream Removed. Event: ", event);
    },
    doCall() {
      console.log("Sending Offer To Peer");

      this.pc.createOffer(
        this.setLocalAndSendMessage,
        this.handleCreateOfferError
      );
    },
    doAnswer() {
      console.log("Sending Answer To Peer");
      this.pc
        .createAnswer()
        .then(
          this.setLocalAndSendMessage,
          this.onCreateSessionDescriptionError
        );
    },
    setLocalAndSendMessage(sessionDescription) {
      this.pc.setLocalDescription(sessionDescription);

      console.log("setLocalAndSendMessage sending message", sessionDescription);

      this.createMediaMessage(sessionDescription);
    },
    handleCreateOfferError(event) {
      console.log("createOffer() error: ", event);
    },
    async startCapture() {
      try {
        let mediaStream = await navigator.mediaDevices.getDisplayMedia({video:true});
        $this.$parent.$refs.localScreen.srcObject = mediaStream;
        console.log(mediaStream.getTracks()[0]);
        $this.localStream.addTrack(mediaStream.getTracks()[0]);
        console.log("gotStream: Adding Media Stream.", mediaStream)
      } catch (e) {
        console.log('Unable to acquire screen capture: ' + e);
      }
    },
    shareScreen() {
      var $this=this;
            $this.shareScreen1().then( ( stream ) => {

                //save my screen stream
                $this.screen = stream;

                //share the new stream with all partners
                $this.broadcastNewTracks( stream, 'video', false );

                //When the stop sharing button shown by the browser is clicked
                $this.screen.getVideoTracks()[0].addEventListener( 'ended', () => {
                    stopSharingScreen();
                } );
            } ).catch( ( e ) => {
                console.error( e );
            } );
        },
        shareScreen1() {
          if ( this.userMediaAvailable() ) {
              return navigator.mediaDevices.getDisplayMedia( {
                  video: {
                      cursor: "always"
                  },
                  audio: {
                      echoCancellation: true,
                      noiseSuppression: true,
                      sampleRate: 44100
                  }
              } );
          }

          else {
              throw new Error( 'User media not available' );
          }
    },
      userMediaAvailable() {
        return !!( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );
    },
      broadcastNewTracks( stream, type, mirrorMode = true ) {
        debugger;
            this.setLocalStream( stream, mirrorMode );

            let track = type == 'audio' ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];

            for ( let p in this.pc ) {
                let pName = this.pc[p];

                if ( typeof this.pc[pName] == 'object' ) {
                    this.replaceTrack( track, this.pc[pName] );
                }
            }
        },
      setLocalStream( stream, mirrorMode = true ) {

        this.localStream.srcObject = stream;
        
    },
      replaceTrack( stream, recipientPeer ) {
        let sender = recipientPeer.getSenders ? recipientPeer.getSenders().find( s => s.track && s.track.kind === stream.kind ) : false;

        sender ? sender.replaceTrack( stream ) : '';
    },
    stopSharingScreen() {
        var $this=this;
            return new Promise( ( res, rej ) => {
                $this.screen.getTracks().length ? $this.screen.getTracks().forEach( track => track.stop() ) : '';

                res();
            } ).then( () => {
                $this.broadcastNewTracks( myStream, 'video' );
            } ).catch( ( e ) => {
                console.error( e );
            } );
        }

  },
};
</script>

<style lang="scss" scoped></style>
