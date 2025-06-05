import { Voice } from '@ai-sdk/elevenlabs';

interface VoiceConfig {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

const defaultConfig: VoiceConfig = {
  stability: 0.75,
  similarity_boost: 0.75,
  style: 0.5,
  use_speaker_boost: true
};

export class VoiceProcessor {
  private voice: Voice;
  private config: VoiceConfig;

  constructor(apiKey: string, config: Partial<VoiceConfig> = {}) {
    this.voice = new Voice(apiKey);
    this.config = { ...defaultConfig, ...config };
  }

  async synthesizeSpeech(text: string): Promise<ArrayBuffer> {
    try {
      return await this.voice.textToSpeech(text, this.config);
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      throw new Error('Failed to synthesize speech');
    }
  }

  async cloneVoice(
    name: string,
    description: string,
    audioSamples: ArrayBuffer[]
  ): Promise<string> {
    try {
      const voiceId = await this.voice.clone({
        name,
        description,
        files: audioSamples
      });
      
      return voiceId;
    } catch (error) {
      console.error('Voice cloning failed:', error);
      throw new Error('Failed to clone voice');
    }
  }

  async generateCoachingMessage(
    feedback: string,
    tone: 'encouraging' | 'direct' | 'instructive' = 'encouraging'
  ): Promise<ArrayBuffer> {
    const voiceSettings = this.getVoiceSettingsForTone(tone);
    
    try {
      return await this.voice.textToSpeech(feedback, {
        ...this.config,
        ...voiceSettings
      });
    } catch (error) {
      console.error('Coaching message generation failed:', error);
      throw new Error('Failed to generate coaching message');
    }
  }

  private getVoiceSettingsForTone(
    tone: 'encouraging' | 'direct' | 'instructive'
  ): Partial<VoiceConfig> {
    const toneSettings = {
      encouraging: {
        stability: 0.8,
        style: 0.7
      },
      direct: {
        stability: 0.9,
        style: 0.3
      },
      instructive: {
        stability: 0.85,
        style: 0.5
      }
    };
    
    return toneSettings[tone];
  }
}

// Audio processing utilities
export const audioUtils = {
  async normalizeVolume(buffer: ArrayBuffer): Promise<ArrayBuffer> {
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(buffer);
    
    const normalizedBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    
    // Process each channel
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const inputData = audioBuffer.getChannelData(channel);
      const outputData = normalizedBuffer.getChannelData(channel);
      
      // Find peak amplitude
      const peak = Math.max(...inputData.map(Math.abs));
      const gain = peak > 0 ? 1 / peak : 1;
      
      // Apply normalization
      for (let i = 0; i < inputData.length; i++) {
        outputData[i] = inputData[i] * gain;
      }
    }
    
    return normalizedBuffer.buffer;
  },
  
  async convertToMono(buffer: ArrayBuffer): Promise<ArrayBuffer> {
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(buffer);
    
    const monoBuffer = audioContext.createBuffer(
      1,
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    
    const outputData = monoBuffer.getChannelData(0);
    
    // Mix down to mono
    for (let i = 0; i < audioBuffer.length; i++) {
      let sum = 0;
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        sum += audioBuffer.getChannelData(channel)[i];
      }
      outputData[i] = sum / audioBuffer.numberOfChannels;
    }
    
    return monoBuffer.buffer;
  },
  
  async trimSilence(
    buffer: ArrayBuffer,
    threshold = 0.01,
    minSilenceDuration = 0.25
  ): Promise<ArrayBuffer> {
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(buffer);
    
    const samples = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    let startIndex = 0;
    let endIndex = samples.length - 1;
    
    // Find start (trim leading silence)
    while (startIndex < samples.length && Math.abs(samples[startIndex]) < threshold) {
      startIndex++;
    }
    
    // Find end (trim trailing silence)
    while (endIndex > startIndex && Math.abs(samples[endIndex]) < threshold) {
      endIndex--;
    }
    
    // Ensure minimum duration
    const minSilenceSamples = minSilenceDuration * sampleRate;
    startIndex = Math.max(0, startIndex - minSilenceSamples);
    endIndex = Math.min(samples.length - 1, endIndex + minSilenceSamples);
    
    const trimmedBuffer = audioContext.createBuffer(
      1,
      endIndex - startIndex,
      sampleRate
    );
    
    trimmedBuffer.copyToChannel(
      samples.slice(startIndex, endIndex),
      0
    );
    
    return trimmedBuffer.buffer;
  }
};