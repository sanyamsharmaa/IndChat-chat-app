import {FiMic, FiMicOff, FiCamera, FiVideoOff, FiVideo } from 'react-icons/fi';
import { RiCloseFill } from 'react-icons/ri';
import { VideoCallTile } from './vedioCallTile';

export function CurrentCall({ localStream, remoteStream, onEnd, onToggleMute, muted, onToggleVideo, videoEnabled, onSwitchCamera, callerName }) {
    const [showControls, setShowControls] = useState(true);
    const timeoutRef = useRef(null);


    useEffect(() => {
        // hide controls after inactivity
        const reset = () => {
            setShowControls(true);
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => setShowControls(false), 4000);
        };
        window.addEventListener('mousemove', reset);
        window.addEventListener('touchstart', reset);
        reset();
        return () => {
            window.removeEventListener('mousemove', reset);
            window.removeEventListener('touchstart', reset);
            clearTimeout(timeoutRef.current);
        };
    }, []);


    return (
        <div className="w-full h-full bg-black flex flex-col">
            <div className="flex-1 relative">
                <div className="absolute top-4 left-4 z-20 text-white">
                    <div className="text-sm font-semibold">{callerName}</div>
                </div>


                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <div className="w-36 h-24 rounded-lg overflow-hidden border border-white/20">
                        <VideoCallTile stream={localStream} isLocal name="You" muted={true} />
                    </div>
                </div>


                <div className="w-full h-full flex items-center justify-center">
                    <VideoCallTile stream={remoteStream} isLocal={false} name={callerName} />
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


                    <button onClick={onEnd} className="bg-red-600 p-3 rounded-full text-white shadow-lg">
                        <RiCloseFill size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}