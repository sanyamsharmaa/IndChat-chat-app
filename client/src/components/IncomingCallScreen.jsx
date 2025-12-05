import {FiPhoneOff} from 'react-icons/fi';

export function IncomingCallScreen({ callerName = 'Unknown', onAccept, onReject, ringtoneEnabled = true }) {
    // play a looping ringtone until accept/reject
    const audioRef = useRef(null);


    useEffect(() => {
        let a;
        if (ringtoneEnabled) {
            a = new Audio('/sounds/ringtone.mp3');
            a.loop = true;
            a.volume = 0.6;
            a.play().catch(() => { /* ignore autoplay block */ });
            audioRef.current = a;
        }
        return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } };
    }, [ringtoneEnabled]);


    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white shadow-2xl rounded-2xl p-6 w-[420px]">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">{callerName?.charAt(0) ?? 'U'}</div>
                    <div>
                        <div className="text-lg font-semibold">Incoming Call</div>
                        <div className="text-sm text-gray-500">{callerName} is calling you</div>
                    </div>
                </div>


                <div className="mt-6 flex items-center justify-between">
                    <button onClick={() => { audioRef.current?.pause(); onReject && onReject(); }} className="bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2">
                        <FiPhoneOff /> Decline
                    </button>


                    <button onClick={() => { audioRef.current?.pause(); onAccept && onAccept(); }} className="bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2">
                        <FiPhoneOff style={{ transform: 'rotate(180deg)' }} /> Accept
                    </button>
                </div>


                <div className="mt-4 text-xs text-gray-400">Tip: accept to start video & audio. You can mute later.</div>
            </div>
        </div>
    );
}
