import { use, useEffect, useRef, useState } from "react";
import { getSocket } from "../utils/socketClient";
// import { set } from "mongoose";

export default function useWebRTC() {
    const pcRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const socket = getSocket();

    const [incoming, setIncoming] = useState(null); // For callee
    const [accepted, setAccepted] = useState(false);
    const [inCall, setInCall] = useState(false);// For callee
    const [callStatus, setCallStatus] = useState("Calling...");// For both
    const [localStream, setLocalStream] = useState(null); 
    const [remoteStream, setRemoteStream] = useState(null);
    const [muted, setMuted] = useState(false);
    const [videoEnabled, setVideoEnabled] = useState(true);

    useEffect(() => {
        const handleRinging = () => {
            console.log("Ringing...");
            setCallStatus("Ringing...");
            // play ringing sound or show UI 
        }

        const handleAnswer = ({ sdp }) => {
            console.log("Call Answered");
            setCallStatus("Connected");
            pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        }

        const handleRejected = () => {
            setInCall(false);
            console.log("Call Rejected");
            // close the peer connection and other things and show - call rejected UI
        }

        const handleEndCall = () => {
            setInCall(false);
            pcRef.current.close();
            pcRef.current = null;
            localStreamRef.current .getTracks().forEach((track) => track.stop());
            localStreamRef.current  = null;
            remoteStreamRef.current  = null;
            console.log("call ended by other user");
        }

        const handleOffer = async ({ fromzUserId, sdp }) => {
            // play incoming call sound or show incoming call UI
            console.log("Incoming call from-", fromzUserId);
            setIncoming(true);
            // logic of accepting the call to be written here, first -> if user accept the call them emit answer otherwise emit reject
            if (accepted) {
                await startLoacalStream();
                createPeerConnection(fromzUserId);
                pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
                const answer = await pcRef.current.createAnswer();
                pcRef.current.setLocalDescription(answer);
                socket.emit('answer', { toUserId: fromzUserId, sdp: pcRef.current.localDescription });
            }
            else {
                socket.emit('rejected', { toUserId: fromzUserId });
            }

        }
        // callee logic
        const handleIceCandidate = async ({ to, candidate }) => {
            try {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
            catch (err) {
                console.log("error in setting ice candidate-", err)
            }
        }

        // caller
        socket?.on('ringing', handleRinging);
        socket?.on('rejected', handleRejected);
        socket?.on('answer', handleAnswer);
        //callee
        socket?.on('offer', handleOffer);
        socket?.on('ice-candidate', handleIceCandidate);
        //both
        socket?.on('end-call', handleEndCall);


        return () => {
            {
                socket?.off('ringing', handleRinging);
                socket?.off('answer', handleAnswer);
                socket?.off('rejected', handleRejected);
                socket?.off('end-call', handleEndCall);
                socket?.off('offer', handleOffer);
                socket?.off('ice-candidate', handleIceCandidate);
            }
        }

    }, [socket]);


    const startLoacalStream = async () => {
        try {
            const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current  = localStream;
            return localStream;
        }
        catch (err) {
            console.log("error in start local stream-", err)
        }
    }

    const createPeerConnection = (toUserId) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.l.google.com:19302"
                }
            ]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", {
                    to: toUserId,
                    candidate: event.candidate
                });
            }
        };
        pc.ontrack = (event) => {
            remoteStreamRef.current  = event.streams[0];
        }

        localStreamRef.current?.getTracks().forEach((track) => {
            pc.addTrack(track, localStreamRef.current );
        });

        pcRef.current = pc;

    }
    // caller logic
    const callUser = async (toUserId) => {
        setInCall(true);
        await startLoacalStream();
        createPeerConnection(toUserId);
        const offer = await pcRef.current.createOffer();
        pcRef.current.setLocalDescription(offer);
        socket.emit('offer', { toUserId, sdp: pcRef.current.localDescription });
        // play beep sound or show UI indicating calling state
    }

    const endCall = (toUserId) => {
        // will be called from current call UI by either user
        setInCall(false);
        pcRef.current.close();
        pcRef.current = null;

        localStreamRef.current .getTracks().forEach((track) => track.stop());
        localStreamRef.current  = null;
        remoteStreamRef.current  = null;
        socket.emit('end-call', ({ toUserId }));

    }

    return { 
        localStreamRef,
        remoteStreamRef,
        callUser,
        endCall, 
        incoming,
        inCall,
        // localStream,
        // remoteStream,
        muted,
        videoEnabled,
        setMuted,
        setAccepted,
        // callStatus,
        setVideoEnabled
     };


}