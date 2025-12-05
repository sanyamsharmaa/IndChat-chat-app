import {FiUser} from 'react-icons/fi';


export function VideoCallTile({ stream, isLocal = false, name = '', muted = false }) {
    const videoRef = useRef(null);


    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream || null;
        }
    }, [stream]);

    return (
        <div className={`relative rounded-xl overflow-hidden shadow-md ${isLocal ? 'w-40 h-28' : 'w-full h-full'}`}>
            {!stream ? (
                <div className="flex items-center justify-center bg-gray-100 w-full h-full">
                    <div className="flex flex-col items-center text-gray-500">
                        <FiUser size={32} />
                        <div className="mt-2 text-sm">{name || (isLocal ? 'You' : 'No video')}</div>
                    </div>
                </div>
            ) : (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal || muted}
                    className="object-cover w-full h-full bg-black"
                />
            )}
            {isLocal && (
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs">You</div>
            )}
            {!isLocal && name && (
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs">{name}</div>
            )}
        </div>
    );
}