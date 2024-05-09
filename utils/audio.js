import { useState, useEffect } from 'react';

let globalRecorder = null; // Mock global recorder object
let chunks = [];

export async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Initialize the MediaRecorder
        globalRecorder = new MediaRecorder(stream);
        chunks = []; // Ensure chunks are clear at the start

        globalRecorder.ondataavailable = e => {
            chunks.push(e.data);
        };

        globalRecorder.onstart = () => {
            console.log('Recording started');
        };

        globalRecorder.onerror = (event) => {
            console.error('Recording error:', event.error);
        };

        globalRecorder.start();

        return globalRecorder;
    } catch (error) {
        console.error('Failed to start recording:', error);
        throw error; // Rethrow or handle as needed
    }
}

export function stopRecording(recorder) {
    return new Promise((resolve, reject) => {
        if (!recorder) {
            console.error('Recorder not initialized');
            reject('Recorder not initialized');
            return;
        }

        recorder.onstop = () => {
            const blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
            console.log('Recording stopped');
            chunks = []; // Clear the recording chunks
            resolve(blob);
        };

        recorder.onerror = (event) => {
            console.error('Recording stop error:', event.error);
            reject(event.error);
        };

        recorder.stop();
    });
}
