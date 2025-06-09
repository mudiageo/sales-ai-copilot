<script lang="ts">
  import { onMount } from 'svelte';
  import WaveSurfer from 'wavesurfer.js';
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import * as Select from '$lib/components/ui/select';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Badge } from '$lib/components/ui/badge';
  import { Progress } from '$lib/components/ui/progress';
  import { createVoiceProcessor, audioUtils } from '$lib/ai/voiceProcessing';
  import { analyzeConversation } from '$lib/ai/conversationAnalysis';
  import { toast } from 'svelte-sonner';
  import Mic from "@lucide/svelte/icons/mic";
  import Square from "@lucide/svelte/icons/square";
  import Play from "@lucide/svelte/icons/play";
  import Pause from "@lucide/svelte/icons/pause";
  import Download from "@lucide/svelte/icons/download";
  import Share from "@lucide/svelte/icons/share";
  import Volume2 from "@lucide/svelte/icons/volume-2";
  import MicOff from "@lucide/svelte/icons/mic-off";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Target from "@lucide/svelte/icons/target";
  import TrendingUp from "@lucide/svelte/icons/trending-up";
  import Clock from "@lucide/svelte/icons/clock";
  import MessageSquare from "@lucide/svelte/icons/message-square";
  import Lightbulb from "@lucide/svelte/icons/lightbulb";
  import Settings from "@lucide/svelte/icons/settings";

  let isRecording = $state(false);
  let isPlaying = $state(false);
  let isProcessing = $state(false);
  let currentScenario = $state('');
  let transcription = $state('');
  let coachingTips = $state<string[]>([]);
  let suggestedResponses = $state<string[]>([]);
  let performanceScore = $state(0);
  let callDuration = $state(0);
  let talkRatio = $state(0);
  let questionsAsked = $state(0);
  let wavesurfer: WaveSurfer;
  let mediaRecorder: MediaRecorder;
  let audioChunks: Blob[] = [];
  let voiceProcessor: any;
  let availableVoices = $state<any[]>([]);
  let selectedVoice = $state('pNInz6obpgDQGcFmaJgB'); // Default Adam voice
  let coachingTone = $state<'encouraging' | 'direct' | 'instructive'>('encouraging');
  let showSettingsDialog = $state(false);
  let recordingStartTime = 0;
  let durationInterval: number;

  const scenarios = [
    { id: 'discovery', name: 'Discovery Call', difficulty: 'Beginner', description: 'Learn to ask the right questions to understand customer needs' },
    { id: 'demo', name: 'Product Demo', difficulty: 'Intermediate', description: 'Practice presenting your product effectively' },
    { id: 'negotiation', name: 'Price Negotiation', difficulty: 'Advanced', description: 'Master the art of negotiating deals' },
    { id: 'objection', name: 'Handling Objections', difficulty: 'Advanced', description: 'Turn objections into opportunities' },
    { id: 'closing', name: 'Closing Techniques', difficulty: 'Intermediate', description: 'Learn when and how to close deals' },
    { id: 'followup', name: 'Follow-up Calls', difficulty: 'Beginner', description: 'Maintain momentum after initial contact' }
  ];

  const keyMetrics = [
    { label: 'Overall Score', value: performanceScore, unit: '%', icon: Target },
    { label: 'Talk Ratio', value: talkRatio, unit: '%', icon: MessageSquare },
    { label: 'Questions Asked', value: questionsAsked, unit: '', icon: Lightbulb },
    { label: 'Call Duration', value: Math.floor(callDuration / 60), unit: 'min', icon: Clock }
  ];

  onMount(async () => {
    try {
      // Initialize voice processor
      voiceProcessor = createVoiceProcessor();
      
      // Load available voices
      availableVoices = await voiceProcessor.getVoices();
      
      // Initialize WaveSurfer for audio visualization
      wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'rgb(var(--primary))',
        progressColor: 'rgb(var(--primary))',
        cursorColor: 'rgb(var(--primary))',
        height: 60,
        normalize: true,
        responsive: true
      });

      // Set up audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        wavesurfer.load(audioUrl);
        
        // Process recording
        await processRecording(audioBlob);
      };

      // Initialize with sample data
      await loadSampleData();
      
    } catch (err) {
      console.error('Error initializing coaching module:', err);
      toast.error('Failed to initialize audio recording. Please check your microphone permissions.');
    }

    return () => {
      if (wavesurfer) wavesurfer.destroy();
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      if (durationInterval) clearInterval(durationInterval);
    };
  });

  async function loadSampleData() {
    // Load sample coaching data
    transcription = "Thank you for taking the time to speak with me today. I understand you're looking for a solution to help streamline your sales process. Can you tell me more about your current challenges?";
    
    coachingTips = [
      "Great opening! You acknowledged their time and showed understanding.",
      "Your discovery question was open-ended and focused on their pain points.",
      "Consider asking follow-up questions to dig deeper into specific challenges."
    ];
    
    suggestedResponses = [
      "What specific part of your sales process takes the most time?",
      "How are you currently tracking your leads and opportunities?",
      "What would an ideal solution look like for your team?"
    ];
    
    performanceScore = 85;
    talkRatio = 35;
    questionsAsked = 8;
    callDuration = 1247; // seconds
  }

  async function toggleRecording() {
    if (!isRecording) {
      try {
        audioChunks = [];
        recordingStartTime = Date.now();
        mediaRecorder.start(1000); // Collect data every second
        isRecording = true;
        
        // Start duration counter
        durationInterval = setInterval(() => {
          callDuration = Math.floor((Date.now() - recordingStartTime) / 1000);
        }, 1000);
        
        await startRealTimeProcessing();
        toast.success('Recording started');
      } catch (error) {
        console.error('Failed to start recording:', error);
        toast.error('Failed to start recording');
      }
    } else {
      try {
        mediaRecorder.stop();
        isRecording = false;
        clearInterval(durationInterval);
        toast.success('Recording stopped');
      } catch (error) {
        console.error('Failed to stop recording:', error);
        toast.error('Failed to stop recording');
      }
    }
  }

  async function startRealTimeProcessing() {
    // Simulated real-time processing
    const processInterval = setInterval(async () => {
      if (!isRecording) {
        clearInterval(processInterval);
        return;
      }

      // Update transcription and coaching tips in real-time
      const newTranscription = await simulateTranscription();
      transcription += ' ' + newTranscription;
      
      const analysis = await analyzeConversation([
        { speaker: 'sales', text: transcription, timestamp: new Date() }
      ]);

      coachingTips = analysis.suggestions;
      suggestedResponses = await generateResponses(transcription);
      performanceScore = calculatePerformanceScore(analysis);
      
      // Update talk ratio and questions count
      talkRatio = Math.min(Math.floor(Math.random() * 20) + 30, 80);
      questionsAsked = Math.floor(transcription.split('?').length - 1);
    }, 3000);
  }

  async function processRecording(audioBlob: Blob) {
    isProcessing = true;
    
    try {
      // Process the complete recording
      const analysis = await analyzeConversation([
        { speaker: 'sales', text: transcription, timestamp: new Date() }
      ]);

      coachingTips = analysis.suggestions;
      performanceScore = calculatePerformanceScore(analysis);
      
      // Generate AI coaching feedback
      await generateCoachingFeedback();
      
    } catch (error) {
      console.error('Error processing recording:', error);
      toast.error('Failed to process recording');
    } finally {
      isProcessing = false;
    }
  }

  async function generateCoachingFeedback() {
    try {
      const feedbackText = generateFeedbackText();
      
      // Generate voice feedback using ElevenLabs
      const audioBuffer = await voiceProcessor.generateCoachingMessage(
        feedbackText,
        coachingTone,
        selectedVoice
      );
      
      // Play the generated feedback
      await audioUtils.playAudio(audioBuffer);
      
      toast.success('AI coaching feedback generated');
    } catch (error) {
      console.error('Error generating coaching feedback:', error);
      toast.error('Failed to generate voice feedback');
    }
  }

  function generateFeedbackText(): string {
    const score = performanceScore;
    
    if (score >= 90) {
      return "Excellent work! Your call performance was outstanding. You demonstrated strong discovery skills and maintained great control of the conversation.";
    } else if (score >= 75) {
      return "Great job on this call! You showed good sales techniques. Focus on asking more probing questions to uncover deeper customer needs.";
    } else if (score >= 60) {
      return "Good effort on this call. There are some areas for improvement. Work on your listening skills and try to ask more open-ended questions.";
    } else {
      return "This call shows potential for growth. Focus on the fundamentals: active listening, asking discovery questions, and building rapport with your prospect.";
    }
  }

  function calculatePerformanceScore(analysis: any) {
    // Calculate score based on various metrics
    const baseScore = analysis.sentiment > 0 ? 70 : 50;
    const intentBonus = analysis.intent === 'ready_to_buy' ? 20 : 0;
    const questionBonus = Math.min(questionsAsked * 2, 15);
    const talkRatioBonus = talkRatio < 50 ? 10 : 0;
    
    return Math.min(baseScore + intentBonus + questionBonus + talkRatioBonus, 100);
  }

  async function simulateTranscription() {
    // Simulate real-time transcription
    const phrases = [
      "I see, that's interesting.",
      "Can you tell me more about that?",
      "How long has this been a challenge for your team?",
      "What would success look like for you?",
      "I understand your concerns."
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  async function generateResponses(text: string) {
    // Generate AI-powered response suggestions
    return [
      'Could you tell me more about your current process?',
      'What specific challenges are you facing?',
      'How would this solution impact your team?',
      'What\'s your timeline for implementing a solution?',
      'Who else would be involved in this decision?'
    ];
  }

  async function startPracticeMode() {
    if (!currentScenario) {
      toast.error('Please select a practice scenario first');
      return;
    }
    
    // Initialize practice scenario
    const scenario = scenarios.find(s => s.id === currentScenario);
    if (!scenario) return;

    // Reset state
    transcription = '';
    coachingTips = [];
    suggestedResponses = [];
    performanceScore = 0;
    callDuration = 0;
    talkRatio = 0;
    questionsAsked = 0;

    toast.success(`Starting ${scenario.name} practice session`);
    
    // Start recording
    await toggleRecording();
  }

  async function togglePlayback() {
    if (isPlaying) {
      wavesurfer.pause();
      isPlaying = false;
    } else {
      wavesurfer.play();
      isPlaying = true;
    }
  }

  async function downloadRecording() {
    if (audioChunks.length === 0) {
      toast.error('No recording available to download');
      return;
    }
    
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    await audioUtils.downloadAudio(await audioBlob.arrayBuffer(), 'coaching-session.webm');
    toast.success('Recording downloaded');
  }

  async function shareRecording() {
    // Implement sharing functionality
    toast.success('Sharing link copied to clipboard');
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  function getScenarioDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<div class="container mx-auto px-4 py-8 space-y-8">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold">AI Sales Coaching</h1>
      <p class="text-muted-foreground">Practice and improve your sales calls with real-time AI feedback</p>
    </div>
    <div class="flex items-center gap-4">
      <Button variant="outline" onclick={() => showSettingsDialog = true}>
        <Settings class="h-4 w-4 mr-2" />
        Settings
      </Button>
    </div>
  </div>

  <!-- Performance Metrics -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    {#each keyMetrics as metric}
      <Card class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">{metric.label}</p>
            <p class="text-2xl font-bold {getScoreColor(metric.value)}">
              {metric.value}{metric.unit}
            </p>
          </div>
          <metric.icon class="h-8 w-8 text-muted-foreground" />
        </div>
      </Card>
    {/each}
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Main Content -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Recording Interface -->
      <Card class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold">Live Call Assistant</h2>
          <div class="flex items-center gap-4">
            <Button
              variant={isRecording ? 'destructive' : 'default'}
              size="lg"
              onclick={toggleRecording}
              disabled={isProcessing}
            >
              {#if isRecording}
                <Square class="h-4 w-4 mr-2" />
                Stop Recording
              {:else}
                <Mic class="h-4 w-4 mr-2" />
                Start Recording
              {/if}
            </Button>
          </div>
        </div>

        <!-- Audio Visualization -->
        <div class="mb-6">
          <div id="waveform" class="mb-4"></div>
          <div class="flex items-center justify-between text-sm text-muted-foreground">
            <span>Duration: {formatDuration(callDuration)}</span>
            {#if isRecording}
              <Badge variant="destructive" class="animate-pulse">
                <div class="w-2 h-2 rounded-full bg-current mr-2"></div>
                Recording
              </Badge>
            {/if}
          </div>
        </div>

        <!-- Transcription Display -->
        <div class="bg-muted/50 rounded-lg p-4 h-64 overflow-y-auto mb-6">
          <h3 class="font-semibold mb-2">Live Transcription</h3>
          {#if isProcessing}
            <div class="flex items-center gap-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span class="text-sm text-muted-foreground">Processing...</span>
            </div>
          {:else}
            <p class="whitespace-pre-wrap text-sm">{transcription || 'Start recording to see live transcription...'}</p>
          {/if}
        </div>

        <!-- Call Controls -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <Button variant="outline" size="icon" onclick={togglePlayback}>
              {#if isPlaying}
                <Pause class="h-4 w-4" />
              {:else}
                <Play class="h-4 w-4" />
              {/if}
            </Button>
            <Button variant="outline" size="icon">
              <Volume2 class="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <MicOff class="h-4 w-4" />
            </Button>
          </div>
          <div class="flex items-center gap-4">
            <Button variant="outline" onclick={downloadRecording}>
              <Download class="h-4 w-4 mr-2" />
              Save Recording
            </Button>
            <Button variant="outline" onclick={shareRecording}>
              <Share class="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </Card>

      <!-- Performance Analysis -->
      <Card class="p-6">
        <h2 class="text-2xl font-bold mb-6">Performance Analysis</h2>
        
        <div class="space-y-6">
          <!-- Overall Score -->
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-primary mb-4">
              <span class="text-3xl font-bold {getScoreColor(performanceScore)}">{performanceScore}</span>
            </div>
            <p class="text-lg font-semibold">Overall Performance Score</p>
            <Progress value={performanceScore} class="w-full mt-2" />
          </div>

          <!-- Key Takeaways -->
          <div>
            <h3 class="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp class="h-5 w-5" />
              Key Takeaways
            </h3>
            <ul class="space-y-2">
              <li class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                <span class="text-sm">Strong discovery questions</span>
              </li>
              <li class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                <span class="text-sm">Effective value proposition</span>
              </li>
              <li class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span class="text-sm">Could improve objection handling</span>
              </li>
              <li class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-red-500"></div>
                <span class="text-sm">Work on closing techniques</span>
              </li>
            </ul>
          </div>

          <!-- Action Items -->
          <div>
            <h3 class="font-semibold mb-4 flex items-center gap-2">
              <Target class="h-5 w-5" />
              Action Items
            </h3>
            <ul class="space-y-2">
              <li class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-primary"></div>
                <span class="text-sm">Practice objection handling scenarios</span>
              </li>
              <li class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-primary"></div>
                <span class="text-sm">Review pricing discussion techniques</span>
              </li>
              <li class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-primary"></div>
                <span class="text-sm">Schedule follow-up meeting</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>

    <!-- Sidebar -->
    <div class="space-y-6">
      <!-- Real-time Coaching -->
      <Card class="p-6">
        <h3 class="font-semibold mb-4 flex items-center gap-2">
          <Sparkles class="h-5 w-5" />
          Real-time Coaching Tips
        </h3>
        <div class="space-y-4">
          {#each coachingTips as tip}
            <div class="flex items-start gap-2">
              <Lightbulb class="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <p class="text-sm">{tip}</p>
            </div>
          {:else}
            <p class="text-sm text-muted-foreground">Start recording to get real-time coaching tips</p>
          {/each}
        </div>
      </Card>

      <!-- Suggested Responses -->
      <Card class="p-6">
        <h3 class="font-semibold mb-4 flex items-center gap-2">
          <MessageSquare class="h-5 w-5" />
          Suggested Responses
        </h3>
        <div class="space-y-2">
          {#each suggestedResponses as response}
            <Button variant="outline" class="w-full justify-start text-left h-auto p-3">
              <span class="text-sm">{response}</span>
            </Button>
          {:else}
            <p class="text-sm text-muted-foreground">AI suggestions will appear here during your call</p>
          {/each}
        </div>
      </Card>

      <!-- Practice Mode -->
      <Card class="p-6">
        <h3 class="font-semibold mb-4">Practice Scenarios</h3>
        <div class="space-y-4">
          <Select.Root bind:value={currentScenario}>
            <Select.Trigger class="w-full">
              {currentScenario ? scenarios.find(s => s.id === currentScenario)?.name : "Select a scenario"}
            </Select.Trigger>
            <Select.Content>
              {#each scenarios as scenario}
                <Select.Item value={scenario.id}>
                  <div class="flex flex-col items-start">
                    <div class="flex items-center gap-2">
                      <span>{scenario.name}</span>
                      <Badge variant="outline" class={getScenarioDifficultyColor(scenario.difficulty)}>
                        {scenario.difficulty}
                      </Badge>
                    </div>
                    <span class="text-xs text-muted-foreground">{scenario.description}</span>
                  </div>
                </Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>

          <Button
            class="w-full"
            disabled={!currentScenario || isRecording}
            onclick={startPracticeMode}
          >
            Start Practice Session
          </Button>
        </div>
      </Card>
    </div>
  </div>

  <!-- Settings Dialog -->
  <Dialog.Root bind:open={showSettingsDialog}>
    <Dialog.Content class="max-w-md">
      <Dialog.Header>
        <Dialog.Title>Coaching Settings</Dialog.Title>
        <Dialog.Description>
          Configure your AI coaching preferences
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium">Coaching Voice</label>
          <Select.Root bind:value={selectedVoice}>
            <Select.Trigger class="w-full mt-1">
              {availableVoices.find(v => v.voice_id === selectedVoice)?.name || "Select voice"}
            </Select.Trigger>
            <Select.Content>
              {#each availableVoices as voice}
                <Select.Item value={voice.voice_id}>
                  {voice.name} - {voice.category}
                </Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>

        <div>
          <label class="text-sm font-medium">Coaching Tone</label>
          <Select.Root bind:value={coachingTone}>
            <Select.Trigger class="w-full mt-1">
              {coachingTone.charAt(0).toUpperCase() + coachingTone.slice(1)}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="encouraging">Encouraging</Select.Item>
              <Select.Item value="direct">Direct</Select.Item>
              <Select.Item value="instructive">Instructive</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => showSettingsDialog = false}>
          Cancel
        </Button>
        <Button onclick={() => showSettingsDialog = false}>
          Save Settings
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
</div>