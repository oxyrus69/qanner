export function beep() {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const context = new AudioContext();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, context.currentTime); // A5

        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.1);

        oscillator.start();
        oscillator.stop(context.currentTime + 0.1);
    } catch (e) {
        console.warn('Audio feedback failed', e);
    }
}

export function vibrate() {
    if ('vibrate' in navigator) {
        navigator.vibrate(80);
    }
}

export function notify() {
    beep();
    vibrate();
}
