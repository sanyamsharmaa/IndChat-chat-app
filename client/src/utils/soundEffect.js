import { useEffect, useRef, useState } from "react";
import React from 'react'


export default function useSoundEffect() {

    const [enabled, setEnabled] = useState(false);
    const recieveRef = useRef(null);
    const sendRef = useRef(null);

    useEffect(() => {
        recieveRef.current = new Audio('/sounds/receive.mp3');
        sendRef.current = new Audio('/sounds/send.mp3');

        // console.log("Audio refs-", recieveRef.current, sendRef.current)

        recieveRef.current.load();
        sendRef.current.load();

        recieveRef.current.volume = 0.8;
        sendRef.current.volume = 0.5;

        const unlock = () => {

            if (!enabled) return;

            [recieveRef.current, sendRef.current].forEach(audio => {
                console.log('Unlocking audio', audio);
                audio.play().then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                }).catch((e) => {
                    console.error('Error unlocking audio:', e);
                });
            });
            window.removeEventListener('click', unlock);
        }
        // window.addEventListener('click', unlock);


        return () => { window.removeEventListener('click', unlock); }
    }, [])

    function play(type) {
        console.log("is sound enabled-", enabled)
        if (!enabled) return;
        if (type === 'send') {
            console.log('play send sound', sendRef.current);
            sendRef.current.currentTime = 0;
            sendRef.current.play().then(() => {
                console.log("SOUND PLAYED SUCCESSFULLY 🎉");
            })
                .catch(err => {
                    console.log("SOUND FAILED TO PLAY ❌", err);
                });;
        }
        else if (type === 'receive') {
            console.log('play receive sound');
            recieveRef.current.currentTime = 0;
            recieveRef.current.play();
        }

    }


    return { enabled, setEnabled, playrecieve: () => play('receive'), playsend: () => play('send') };

}
// export { useSoundEffect };
