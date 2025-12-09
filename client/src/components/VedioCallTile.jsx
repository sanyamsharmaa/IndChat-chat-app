import { FiUser } from 'react-icons/fi';
import { useEffect, useRef, useState } from 'react';


export function VideoCallTile({ stream, isLocal = false, name = '', muted = false }) {
    const videoRef = useRef(stream || null);

    // isLocal ? console.log("localstream-", stream) : console.log("remotestream-", stream);

    const [hasVideo, setHasVideo] = useState(false);

    useEffect(() => {
        if (!videoRef.current) return;

        console.log('VideoCallTile useEffect:', {
            isLocal,
            hasStream: !!stream,
            videoTracks: stream?.getVideoTracks().length,
            audioTracks: stream?.getAudioTracks().length,
            streamId: stream?.id,
        });

        // Clear previous stream if exists
        if (videoRef.current.srcObject) {
            videoRef.current.srcObject = null;
        }

        if (stream) {
            console.log('stream updated')
            videoRef.current.srcObject = stream;
            setHasVideo(true);

            const playVideo = async () => {
                try {
                    console.log(`Trying to play video for: ${isLocal ? 'local' : 'remote'}`);
                    await videoRef.current.play(); // Issue - freezes here for remote video permanently
                    console.log(`Video playing successfully: ${isLocal ? 'local' : 'remote'}`);
                } catch (err) {
                    console.warn(`Video play failed (${isLocal ? 'local' : 'remote'}):`, err);

                    // Try again with muted if autoplay fails
                    if (err.name === 'NotAllowedError') {
                        videoRef.current.muted = true;
                        try {
                            await videoRef.current.play();
                            console.log(`Video playing muted after autoplay restriction`);
                        } catch (err2) {
                            console.error(`Even muted play failed:`, err2);
                        }
                    }
                }
            };

            // Small delay to ensure element is ready
            // playVideo();
            setTimeout(() => {
                playVideo();
            }, 100);
        } else {
            setHasVideo(false);
        }

        // Cleanup function
        return () => {
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };
    }, [stream, isLocal]);


// useEffect(() => {
//     if (videoRef.current) {
//         console.log('Attaching stream to video', {
//             hasStream: !!stream,
//             videoTracks: stream?.getVideoTracks().length,
//         });
//         videoRef.current.srcObject = stream || null;

//         const play = async () => {
//             try {
//                 console.log(`Video playing: ${isLocal ? 'local' : 'remote'}`);
//                 await videoRef.current.play();
//             } catch (err) {
//                 console.log(`Video play error (${isLocal ? 'local' : 'remote'})`, err);
//             }
//         };

//         // isLocal?null:play();
//         play();
//     }
// }, [stream]);


//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     if (!stream) {
//       // clear stream if no stream
//       if (video.srcObject) video.srcObject = null;
//       return;
//     }

//     // Only set srcObject if it actually changed
//     if (video.srcObject !== stream) {
//       console.log("Setting srcObject for", isLocal ? "local" : "remote");
//       video.srcObject = stream;

//       const handleLoaded = () => {
//         // Try to play once metadata is loaded
//         console.log("playing video for", isLocal ? "local" : "remote");
//         video
//           .play()
//           .then(() => {
//             console.log("Video playing:", isLocal ? "local" : "remote");
//           })
//           .catch((err) => {
//             console.log("Video play error:", isLocal ? "local" : "remote", err);
//           });
//       };

//       video.addEventListener("loadedmetadata", handleLoaded);

//       return () => {
//         video.removeEventListener("loadedmetadata", handleLoaded);
//       };
//     }
//   }, [stream, isLocal]);





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
                    muted={muted}
                    // muted={isLocal || muted}
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



// import { FiUser } from 'react-icons/fi';
// import { useEffect, useRef, useState } from 'react';

// export function VideoCallTile({ stream, isLocal = false, name = '', muted = false }) {
//     const videoRef = useRef(null);
//     const [hasVideo, setHasVideo] = useState(false);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const playPromiseRef = useRef(null);

//     useEffect(() => {
//         if (!videoRef.current) return;

//         console.log('VideoCallTile useEffect:', {
//             isLocal,
//             hasStream: !!stream,
//             videoTracks: stream?.getVideoTracks().length,
//             streamId: stream?.id,
//         });

//         // Clean up previous stream and play promise
//         if (videoRef.current.srcObject) {
//             videoRef.current.srcObject = null;
//         }

//         if (playPromiseRef.current) {
//             playPromiseRef.current.catch(() => { });
//             playPromiseRef.current = null;
//         }

//         if (stream) {
//             videoRef.current.srcObject = stream;
//             setHasVideo(true);

//         //     const playVideo = async () => {
//         //         if (!videoRef.current || !videoRef.current.srcObject) return;

//         //         try {
//         //             // Create a new play promise and store it
//         //             console.log(`${isLocal ? 'local' : 'remote'} video play attemping`);
//         //             // playPromiseRef.current = videoRef.current.play();
//         //             // await playPromiseRef.current;
//         //             // playPromiseRef.current = null;
//         //             await videoRef.current.play();    
//         //             setIsPlaying(true);
//         //             console.log(`Video playing successfully: ${isLocal ? 'local' : 'remote'}`);
//         //         } catch (err) {
//         //             // Check if error is due to abort (component unmounting)
//         //             if (err.name === 'AbortError' || err.name === 'NotAllowedError') {
//         //                 console.warn(`Video play interrupted (${isLocal ? 'local' : 'remote'}):`, err.message);

//         //                 // Only retry if it's a permissions issue, not an abort
//         //                 if (err.name === 'NotAllowedError') {
//         //                     videoRef.current.muted = true;
//         //                     try {
//         //                         const retryPromise = videoRef.current.play();
//         //                         if (retryPromise) {
//         //                             await retryPromise;
//         //                             console.log(`Video playing muted after autoplay restriction`);
//         //                         }
//         //                     } catch (err2) {
//         //                         // Ignore secondary errors
//         //                     }
//         //                 }
//         //             } else {
//         //                 console.error(`Video play error (${isLocal ? 'local' : 'remote'}):`, err);
//         //             }
//         //         }
//         //     };

//         //     // Use requestAnimationFrame for better timing
//         //     const playTimeout = setTimeout(() => {
//         //         if (videoRef.current && videoRef.current.srcObject) {
//         //             playVideo();
//         //         }
//         //     }, 50);

//         //     return () => {
//         //         clearTimeout(playTimeout);
//         //         if (playPromiseRef.current) {
//         //             playPromiseRef.current.catch(() => { });
//         //             playPromiseRef.current = null;
//         //         }
//         //     };
//         // } else {
//         //     setHasVideo(false);
//         //     setIsPlaying(false);
//         // }

//         // // Cleanup function
//         // return () => {
//         //     if (videoRef.current) {
//         //         videoRef.current.srcObject = null;
//         //     }
//         //     if (playPromiseRef.current) {
//         //         playPromiseRef.current.catch(() => { });
//         //         playPromiseRef.current = null;
//         //     }
//          };
//     }, [stream, isLocal]);

//     // Handle component unmount
//     // useEffect(() => {
//     //     return () => {
//     //         if (playPromiseRef.current) {
//     //             playPromiseRef.current.catch(() => { });
//     //             playPromiseRef.current = null;
//     //         }
//     //     };
//     // }, []);

//     return (
//         <div className={`relative rounded-xl overflow-hidden shadow-md ${isLocal ? 'w-40 h-28' : 'w-full h-full'}`}>

//             <video
//                 ref={videoRef}
//                 autoPlay
//                 playsInline
//                 muted={isLocal || muted}
//                 className="object-cover w-full h-full bg-black"
//                 // onLoadedMetadata={(e) => {
//                 //     console.log(`Video metadata loaded (${isLocal ? 'local' : 'remote'}):`, {
//                 //         videoWidth: e.target.videoWidth,
//                 //         videoHeight: e.target.videoHeight,
//                 //         readyState: e.target.readyState,
//                 //     });
//                 // }}
//                 // onCanPlay={() => {
//                 //     console.log(`${isLocal ? 'local' : 'remote'} video can play`);
//                 // }}
//                 // onPlay={() => {
//                 //     setIsPlaying(true);
//                 // }}
//                 // onPause={() => {
//                 //     setIsPlaying(false);
//                 // }}
//             />


//             {/* {!isPlaying && stream && hasVideo && (
//                 <div className="absolute inset-0 flex items-center justify-center bg-black/70">
//                     <div className="text-white text-sm">Connecting...</div>
//                 </div>
//             )} */}

//             {isLocal && (
//                 <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
//                     You
//                 </div>
//             )}
//             {!isLocal && name && (
//                 <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
//                     {name}
//                 </div>
//             )}
//         </div>
//     );
// }