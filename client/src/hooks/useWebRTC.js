import { use, useEffect, useRef, useState } from "react";
import { getSocket } from "../utils/socketClient";
// import { set } from "mongoose";

export default function useWebRTC() {
    const pcRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const socket = getSocket();

    const [incoming, setIncoming] = useState(null); // For callee
    const [accepted, setAccepted] = useState(null);
    const [inCall, setInCall] = useState(false);// For both
    const [callStatus, setCallStatus] = useState("Calling...");// For both
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [muted, setMuted] = useState(false);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [callerName, setCallerName] = useState("Unknown");
    const callerDetailsRef = useRef({}); // to store caller details on incoming call
    const calleeDetailsRef = useRef({}); // to store callee details on outgoing call

    // console.log("incall state in webrtc-", inCall);

    useEffect(() => {
        const handleRinging = () => {
            console.log("Ringing...");
            setCallStatus("Ringing...");
            // play ringing sound or show UI 
        }

        const handleAnswer = async ({ sdp }) => {
            console.log("Call Answered with sdp:", sdp);
            setCallStatus("Connected");
            await pcRef.current?.setRemoteDescription(new RTCSessionDescription(sdp));
        }

        const handleRejected = () => {
            setCallStatus("Call Rejected");
            setInCall(false);
            console.log("Call Rejected");

            // close the peer connection and other things and show - call rejected UI
        }

        const handleEndCall = () => {
            setInCall(false);
            pcRef.current?.close();
            pcRef.current = null;
            localStreamRef.current?.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
            remoteStreamRef.current = null;
            setLocalStream(null);
            setRemoteStream(null);
            console.log("call ended by other user");
        }

        const handleOffer = async ({ name, fromzUserId, sdp }) => {
            // play incoming call sound or show incoming call UI
            console.log("Caller details in callee HandleOffer-", name, fromzUserId, sdp);
            callerDetailsRef.current = { name, fromzUserId, sdp };
            setIncoming(true);
        }


        // callee logic
        const handleIceCandidate = async ({ candidate }) => {
            try {
                const candidate2 = new RTCIceCandidate(candidate);
                await pcRef.current?.addIceCandidate(candidate2);
                // console.log('added ice candidate from ', candidate, candidate2);
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
            localStreamRef.current = localStream;
            setLocalStream(localStream);
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
                socket?.emit("ice-candidate", {
                    to: toUserId,
                    candidate: event.candidate
                });
            }
        };
        pc.ontrack = (event) => {
            remoteStreamRef.current = event.streams[0];
            setRemoteStream(event.streams[0]);
        }

        localStreamRef.current?.getTracks().forEach((track) => {
            pc.addTrack(track, localStreamRef.current);
        });

        pcRef.current = pc;

    }
    // caller logic
    const callUser = async (toUserId, toUsername, CallerName) => {
        setInCall(true);
        console.log("Calling user(callee)-", toUserId, toUsername, CallerName);
        calleeDetailsRef.current = { toUserId, toUsername };
        await startLoacalStream();
        createPeerConnection(toUserId);
        const offer = await pcRef.current.createOffer();
        console.log("created offer-", offer)
        await pcRef.current.setLocalDescription(offer);
        console.log("local sdp-", pcRef.current.localDescription)
        socket?.emit('offer', {
            CallerName: CallerName, toUserId, sdp: {
                type: offer.type,
                sdp: offer.sdp,
            },
        });
        // play beep sound or show UI indicating calling state
    }

    const endCall = () => {
        // will be called from current call UI by either user
        setInCall(false);
        pcRef.current?.close();
        pcRef.current = null;
        localStreamRef.current?.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
        remoteStreamRef.current = null;
        setLocalStream(null);
        setRemoteStream(null);
        setCallStatus("Call Ended");
        const { toUserId } = calleeDetailsRef.current;
        const { fromzUserId } = callerDetailsRef.current;
        const toUserIdFinal = toUserId ? toUserId : fromzUserId;
        console.log("call ended", toUserId);
        socket?.emit('end-call', ({ toUserId:toUserIdFinal }));

    }

    const onToggleMute = async () => {
        try {
            if (!localStream.current.current) return;
        }

        catch (err) {

        }
    }

    const calleeResponse = async (accepted) => {

        try {
            const { name, fromzUserId, sdp } = callerDetailsRef.current;
            console.log("Caller details in callee response-", name, fromzUserId, sdp);
            setCallerName(name);
            if (accepted) {
                setInCall(true);
                setIncoming(false);
                setCallStatus("Connected");
                console.log("You accepted the call");
                await startLoacalStream();
                createPeerConnection(fromzUserId);
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
                const answer = await pcRef.current.createAnswer();
                await pcRef.current.setLocalDescription(answer);
                console.log("Calle local sdp-", pcRef.current.localDescription)
                socket?.emit('answer', {
                    toUserId: fromzUserId, sdp: {
                        type: answer.type,
                        sdp: answer.sdp,
                    },
                });
            }
            else {
                console.log("You rejected the call");
                setIncoming(false);
                socket?.emit('rejected', { toUserId: fromzUserId });
            }
        }
        catch (err) {
            console.log("error in callee response-", err)
        }

    }

    return {
        localStreamRef,
        remoteStreamRef,
        callUser,
        endCall,
        calleeResponse,
        incoming,
        inCall,
        localStream,
        remoteStream,
        muted,
        videoEnabled,
        setMuted,
        setAccepted,
        callStatus,
        setVideoEnabled,
        callerName,
        setCallerName

    };


}