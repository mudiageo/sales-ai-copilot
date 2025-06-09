interface VoiceConfig {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  samples: any[];
  category: string;
  fine_tuning: {
    is_allowed_to_fine_tune: boolean;
    state: any;
    verification_failures: any[];
    verification_attempts_count: number;
    manual_verification_requested: boolean;
  };
  labels: Record<string, string>;
  description: string;
  preview_url: string;
  available_for_tiers: string[];
  settings: any;
  sharing: any;
  high_quality_base_model_ids: string[];
}

interface ElevenLabsModel {
  model_id: string;
  name: string;
  can_be_finetuned: boolean;
  can_do_text_to_speech: boolean;
  can_do_voice_conversion: boolean;
  can_use_style: boolean;
  can_use_speaker_boost: boolean;
  serves_pro_voices: boolean;
  language: {
    language_id: string;
    name: string;
  };
  description: string;
  requires_alpha_access: boolean;
  max_characters_request_free_tier: number;
  max_characters_request_subscribed_tier: number;
}

const defaultConfig: VoiceConfig = {
  stability: 0.75,
  similarity_boost: 0.75,
  style: 0.5,
  use_speaker_boost: true
};

export class VoiceProcessor {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private config: VoiceConfig;

  constructor(apiKey: string, config: Partial<VoiceConfig> = {}) {
    this.apiKey = apiKey;
    this.config = { ...defaultConfig, ...config };
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Accept': 'application/json',
      'xi-api-key': this.apiKey,
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    return response;
  }

  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const response = await this.makeRequest('/voices');
      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      throw new Error('Failed to fetch available voices');
    }
  }

  async getModels(): Promise<ElevenLabsModel[]> {
    try {
      const response = await this.makeRequest('/models');
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Failed to fetch models:', error);
      throw new Error('Failed to fetch available models');
    }
  }

  async synthesizeSpeech(
    text: string, 
    voiceId: string = 'pNInz6obpgDQGcFmaJgB', // Default voice (Adam)
    modelId: string = 'eleven_monolingual_v1'
  ): Promise<ArrayBuffer> {
    try {
      const response = await this.makeRequest(`/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: this.config.stability,
            similarity_boost: this.config.similarity_boost,
            style: this.config.style,
            use_speaker_boost: this.config.use_speaker_boost
          }
        })
      });

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      throw new Error('Failed to synthesize speech');
    }
  }

  async synthesizeSpeechStream(
    text: string,
    voiceId: string = 'pNInz6obpgDQGcFmaJgB',
    modelId: string = 'eleven_monolingual_v1'
  ): Promise<ReadableStream> {
    try {
      const response = await this.makeRequest(`/text-to-speech/${voiceId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: this.config.stability,
            similarity_boost: this.config.similarity_boost,
            style: this.config.style,
            use_speaker_boost: this.config.use_speaker_boost
          }
        })
      });

      if (!response.body) {
        throw new Error('No response body received');
      }

      return response.body;
    } catch (error) {
      console.error('Speech synthesis streaming failed:', error);
      throw new Error('Failed to synthesize speech stream');
    }
  }

  async cloneVoice(
    name: string,
    description: string,
    audioFiles: File[]
  ): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      
      audioFiles.forEach((file, index) => {
        formData.append('files', file, `sample_${index}.${file.name.split('.').pop()}`);
      });

      const response = await this.makeRequest('/voices/add', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      return data.voice_id;
    } catch (error) {
      console.error('Voice cloning failed:', error);
      throw new Error('Failed to clone voice');
    }
  }

  async deleteVoice(voiceId: string): Promise<void> {
    try {
      await this.makeRequest(`/voices/${voiceId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Voice deletion failed:', error);
      throw new Error('Failed to delete voice');
    }
  }

  async getVoiceSettings(voiceId: string): Promise<VoiceConfig> {
    try {
      const response = await this.makeRequest(`/voices/${voiceId}/settings`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get voice settings:', error);
      throw new Error('Failed to get voice settings');
    }
  }

  async updateVoiceSettings(voiceId: string, settings: Partial<VoiceConfig>): Promise<void> {
    try {
      await this.makeRequest(`/voices/${voiceId}/settings/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
    } catch (error) {
      console.error('Failed to update voice settings:', error);
      throw new Error('Failed to update voice settings');
    }
  }

  async generateCoachingMessage(
    feedback: string,
    tone: 'encouraging' | 'direct' | 'instructive' = 'encouraging',
    voiceId?: string
  ): Promise<ArrayBuffer> {
    const voiceSettings = this.getVoiceSettingsForTone(tone);
    const originalConfig = { ...this.config };
    
    // Temporarily update config for this generation
    this.config = { ...this.config, ...voiceSettings };
    
    try {
      const result = await this.synthesizeSpeech(
        feedback, 
        voiceId || this.getVoiceIdForTone(tone)
      );
      
      // Restore original config
      this.config = originalConfig;
      
      return result;
    } catch (error) {
      // Restore original config on error
      this.config = originalConfig;
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
        style: 0.7,
        similarity_boost: 0.8
      },
      direct: {
        stability: 0.9,
        style: 0.3,
        similarity_boost: 0.7
      },
      instructive: {
        stability: 0.85,
        style: 0.5,
        similarity_boost: 0.75
      }
    };
    
    return toneSettings[tone];
  }

  private getVoiceIdForTone(tone: 'encouraging' | 'direct' | 'instructive'): string {
    // Map tones to specific voice IDs (these are example ElevenLabs voice IDs)
    const voiceMap = {
      encouraging: 'pNInz6obpgDQGcFmaJgB', // Adam - warm and encouraging
      direct: 'EXAVITQu4vr4xnSDxMaL', // Bella - clear and direct
      instructive: 'VR6AewLTigWG4xSOukaG' // Antoni - professional and instructive
    };
    
    return voiceMap[tone];
  }

  async getUserSubscription(): Promise<any> {
    try {
      const response = await this.makeRequest('/user/subscription');
      return await response.json();
    } catch (error) {
      console.error('Failed to get user subscription:', error);
      throw new Error('Failed to get user subscription');
    }
  }

  async getUserInfo(): Promise<any> {
    try {
      const response = await this.makeRequest('/user');
      return await response.json();
    } catch (error) {
      console.error('Failed to get user info:', error);
      throw new Error('Failed to get user info');
    }
  }

  // Update config
  updateConfig(newConfig: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current config
  getConfig(): VoiceConfig {
    return { ...this.config };
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
    
    // Convert back to ArrayBuffer
    const length = normalizedBuffer.length * normalizedBuffer.numberOfChannels * 2;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new Int16Array(arrayBuffer);
    let offset = 0;
    
    for (let i = 0; i < normalizedBuffer.length; i++) {
      for (let channel = 0; channel < normalizedBuffer.numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, normalizedBuffer.getChannelData(channel)[i]));
        view[offset++] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      }
    }
    
    return arrayBuffer;
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
    
    // Convert back to ArrayBuffer
    const length = monoBuffer.length * 2;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new Int16Array(arrayBuffer);
    
    for (let i = 0; i < monoBuffer.length; i++) {
      const sample = Math.max(-1, Math.min(1, outputData[i]));
      view[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    
    return arrayBuffer;
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
    
    // Convert back to ArrayBuffer
    const length = trimmedBuffer.length * 2;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new Int16Array(arrayBuffer);
    const outputData = trimmedBuffer.getChannelData(0);
    
    for (let i = 0; i < trimmedBuffer.length; i++) {
      const sample = Math.max(-1, Math.min(1, outputData[i]));
      view[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    
    return arrayBuffer;
  },

  async playAudio(buffer: ArrayBuffer): Promise<void> {
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(buffer);
    const source = audioContext.createBufferSource();
    
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
    
    return new Promise((resolve) => {
      source.onended = () => resolve();
    });
  },

  async downloadAudio(buffer: ArrayBuffer, filename: string = 'audio.mp3'): Promise<void> {
    const blob = new Blob([buffer], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
  }
};

// Helper function to create VoiceProcessor instance
export function createVoiceProcessor(apiKey?: string, config?: Partial<VoiceConfig>): VoiceProcessor {
  const key = apiKey || import.meta.env.VITE_ELEVENLABS_API_KEY;
  
  if (!key) {
    throw new Error('ElevenLabs API key is required. Set VITE_ELEVENLABS_API_KEY environment variable.');
  }
  
  return new VoiceProcessor(key, config);
}

// Export types for use in other modules
export type { VoiceConfig, ElevenLabsVoice, ElevenLabsModel };