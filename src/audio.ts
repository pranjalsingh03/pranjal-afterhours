// Entirely synthesized, opt-in room tone. No network audio or autoplay.
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
export async function setAmbient(enabled: boolean) {
  if (!enabled) { if (ctx && master) master.gain.setTargetAtTime(0, ctx.currentTime, .12); return; }
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const hum = ctx.createOscillator(); hum.type = 'sine'; hum.frequency.value = 60;
    const humGain = ctx.createGain(); humGain.gain.value = .12; hum.connect(humGain); humGain.connect(master); hum.start();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const data = buffer.getChannelData(0); let last = 0;
    for (let i = 0; i < data.length; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; data[i] = last * 3.5; }
    const noise = ctx.createBufferSource(); noise.buffer = buffer; noise.loop = true;
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 340;
    noise.connect(filter); filter.connect(master); noise.start();
  }
  await ctx.resume(); master!.gain.setTargetAtTime(.15, ctx.currentTime, .2);
}
