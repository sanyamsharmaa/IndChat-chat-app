import { FiMic, FiMicOff, FiCamera, FiVideoOff, FiVideo } from 'react-icons/fi';
import { RiCloseFill } from 'react-icons/ri';
import { VideoCallTile } from './vedioCallTile';
import { useEffect, useRef, useState } from 'react';


export function CurrentCall({ localStream, remoteStream, callStatus, onToggleMute, muted, onToggleVideo, videoEnabled, onSwitchCamera, endCall, callerName }) {
    const [showControls, setShowControls] = useState(true);
    const timeoutRef = useRef(null);
    const [talkTime, setTalkTime] = useState(0);
    const intervalRef = useRef(0);

    // if (callStatus === 'Connected') {
    //     setInterval(() => {
    //         console.log("setinterval")
    //         // setTalkTime((prev) => prev + 1);
    //         intervalRef.current +=1;

    //     }, 1000);
    // }

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        console.log("time-",[
                minutes.toString().padStart(2, '0'),
                secs.toString().padStart(2, '0')
            ].join(':'))

        if (hours === 0) {
            return [
                minutes.toString().padStart(2, '0'),
                secs.toString().padStart(2, '0')
            ].join(':');
        }
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0')
        ].join(':');
    }

    // console.log("Current call streams-", localStream, remoteStream);
    // useEffect(() => {
    //     // hide controls after inactivity
    //     const reset = () => {
    //         setShowControls(true);
    //         clearTimeout(timeoutRef.current);
    //         timeoutRef.current = setTimeout(() => setShowControls(false), 4000);
    //     };
    //     window.addEventListener('mousemove', reset);
    //     window.addEventListener('touchstart', reset);
    //     reset();
    //     return () => {
    //         window.removeEventListener('mousemove', reset);
    //         window.removeEventListener('touchstart', reset);
    //         clearTimeout(timeoutRef.current);
    //     };
    // }, []);


    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="w-auto h-4/5 p-2 bg-black flex flex-col rounded-lg">
                {/* fixed inset-0 flex items-center justify-center z-50 */}
                <div className="flex-1 relative">
                    <div className="h-2 flex justify-center z-20 text-white">
                        <div>
                            <div className="text-sm font-semibold">{callerName}</div>
                            {callStatus === 'Connected' ? <div className="text-xs font-mono">{formatTime(intervalRef.current)}</div> : <div className="text-sm font-semibold">{callStatus}</div>}
                        </div>
                    </div>


                    {/* Self video tile */}
                    <div className="absolute bottom-4 right-3 z-20 flex gap-2">
                        <div className="w-33 h-28 rounded-lg overflow-hidden border border-white/20">
                            <VideoCallTile stream={localStream} isLocal={true} name="You" muted={true} />
                        </div>
                    </div>

                    {/* Remote video tile */}
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-72 h-64 rounded-lg top-4 overflow-hidden border border-white/20 bg-black">
                            <VideoCallTile stream={remoteStream} isLocal={false} name={callerName} />
                        </div>
                    </div>

                </div>


                {/* Controls */}
                {showControls && (
                    <div className="p-4 bg-black/50 flex items-center justify-center gap-4">
                        <button onClick={onToggleMute} className="bg-white/10 p-3 rounded-full">
                            {muted ? <FiMicOff color="white" /> : <FiMic color="white" />}
                        </button>


                        <button onClick={onToggleVideo} className="bg-white/10 p-3 rounded-full">
                            {videoEnabled ? <FiVideo color="white" /> : <FiVideoOff color="white" />}
                        </button>


                        <button onClick={onSwitchCamera} className="bg-white/10 p-3 rounded-full">
                            <FiCamera color="white" />
                        </button>


                        <button onClick={endCall} className="bg-red-600 p-3 rounded-full text-white shadow-lg">
                            <RiCloseFill size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}