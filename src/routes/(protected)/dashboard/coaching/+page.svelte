<script lang="ts">
  import { onMount } from 'svelte';
  import WaveSurfer from 'wavesurfer.js';
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Select } from '$lib/components/ui/select';
  import { VoiceProcessor } from '$lib/ai/voiceProcessing';
  import { analyzeConversation } from '$lib/ai/conversationAnalysis';

  let isRecording = $state(false);
  let isPlaying = $state(false);
  let currentScenario = $state('');
  let transcription = $state('');
  let coachingTips = $state<string[]>([]);
  let suggestedResponses = $state<string[]>([]);
  let performanceScore = $state(0);
  let wavesurfer: WaveSurfer;
  let mediaRecorder: MediaRecorder;
  let audioChunks: Blob[] = [];

  const scenarios = [
    { id: 'discovery', name: 'Discovery Call', difficulty: 'Beginner' },
    { id: 'demo', name: 'Product Demo', difficulty: 'Intermediate' },
    { id: 'negotiation', name: 'Price Negotiation', difficulty: 'Advanced' },
    { id: 'objection', name: 'Handling Objections', difficulty: 'Advanced' }
  ];

  onMount(() => {
    // Initialize WaveSurfer for audio visualization
    wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: 'rgb(var(--primary))',
      progressColor: 'rgb(var(--primary))',
      cursorColor: 'rgb(var(--primary))',
      height: 60,
      normalize: true
    });

    // Set up audio recording
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          wavesurfer.load(audioUrl);
          
          // Process recording
          await processRecording(audioBlob);
        };
      })
      .catch(err => console.error('Error accessing microphone:', err));

    return () => {
      wavesurfer.destroy();
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    };
  });

  async function toggleRecording() {
    if (!isRecording) {
      audioChunks = [];
      mediaRecorder.start();
      isRecording = true;
      startRealTimeProcessing();
    } else {
      mediaRecorder.stop();
      isRecording = false;
      await processRecording(new Blob(audioChunks));
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
      transcription = await simulateTranscription();
      const analysis = await analyzeConversation([
        { speaker: 'sales', text: transcription, timestamp: new Date() }
      ]);

      coachingTips = analysis.suggestions;
      suggestedResponses = await generateResponses(transcription);
      performanceScore = calculatePerformanceScore(analysis);
    }, 1000);
  }

  async function processRecording(audioBlob: Blob) {
    // Process the complete recording
    const analysis = await analyzeConversation([
      { speaker: 'sales', text: transcription, timestamp: new Date() }
    ]);

    coachingTips = analysis.suggestions;
    performanceScore = calculatePerformanceScore(analysis);
  }

  function calculatePerformanceScore(analysis: any) {
    // Calculate score based on various metrics
    const baseScore = analysis.sentiment > 0 ? 70 : 50;
    const intentBonus = analysis.intent === 'ready_to_buy' ? 20 : 0;
    return Math.min(baseScore + intentBonus, 100);
  }

  async function simulateTranscription() {
    // Simulate real-time transcription
    return 'This is a simulated transcription of the ongoing conversation...';
  }

  async function generateResponses(text: string) {
    // Generate AI-powered response suggestions
    return [
      'Could you tell me more about your current process?',
      'What specific challenges are you facing?',
      'How would this solution impact your team?'
    ];
  }

  async function startPracticeMode() {
    if (!currentScenario) return;
    
    // Initialize practice scenario
    const scenario = scenarios.find(s => s.id === currentScenario);
    if (!scenario) return;

    // Reset state
    transcription = '';
    coachingTips = [];
    suggestedResponses = [];
    performanceScore = 0;

    // Start recording
    await toggleRecording();
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex flex-col lg:flex-row gap-8">
    <!-- Main Content -->
    <div class="flex-1">
      <Card class="p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold">Live Call Assistant</h2>
          <div class="flex items-center gap-4">
            <Button
              variant={isRecording ? 'destructive' : 'default'}
              onclick={toggleRecording}
            >
              {#if isRecording}
                <span class="i-lucide-square h-4 w-4 mr-2"></span>
                Stop Recording
              {:else}
                <span class="i-lucide-mic h-4 w-4 mr-2"></span>
                Start Recording
              {/if}
            </Button>
          </div>
        </div>

        <!-- Audio Visualization -->
        <div id="waveform" class="mb-6"></div>

        <!-- Transcription Display -->
        <div class="bg-muted/50 rounded-lg p-4 h-64 overflow-y-auto mb-6">
          <p class="whitespace-pre-wrap">{transcription}</p>
        </div>

        <!-- Call Controls -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <span class="i-lucide-volume-2 h-4 w-4"></span>
            </Button>
            <Button variant="outline" size="icon">
              <span class="i-lucide-mic-off h-4 w-4"></span>
            </Button>
          </div>
          <div class="flex items-center gap-4">
            <Button variant="outline">
              <span class="i-lucide-download h-4 w-4 mr-2"></span>
              Save Recording
            </Button>
            <Button variant="outline">
              <span class="i-lucide-share h-4 w-4 mr-2"></span>
              Share
            </Button>
          </div>
        </div>
      </Card>

      <!-- Performance Analysis -->
      <Card class="p-6">
        <h2 class="text-2xl font-bold mb-6">Performance Analysis</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-muted/50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-primary mb-2">
              {performanceScore}%
            </div>
            <div class="text-sm text-muted-foreground">Overall Score</div>
          </div>
          <div class="bg-muted/50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-primary mb-2">85%</div>
            <div class="text-sm text-muted-foreground">Talk Ratio</div>
          </div>
          <div class="bg-muted/50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-primary mb-2">12</div>
            <div class="text-sm text-muted-foreground">Questions Asked</div>
          </div>
        </div>

        <div class="space-y-6">
          <div>
            <h3 class="font-semibold mb-2">Key Takeaways</h3>
            <ul class="space-y-2">
              <li class="flex items-center gap-2">
                <span class="i-lucide-check text-primary"></span>
                Strong discovery questions
              </li>
              <li class="flex items-center gap-2">
                <span class="i-lucide-check text-primary"></span>
                Effective value proposition
              </li>
              <li class="flex items-center gap-2">
                <span class="i-lucide-x text-destructive"></span>
                Could improve objection handling
              </li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold mb-2">Action Items</h3>
            <ul class="space-y-2">
              <li class="flex items-center gap-2">
                <span class="i-lucide-circle-dot"></span>
                Practice objection handling scenarios
              </li>
              <li class="flex items-center gap-2">
                <span class="i-lucide-circle-dot"></span>
                Review pricing discussion techniques
              </li>
              <li class="flex items-center gap-2">
                <span class="i-lucide-circle-dot"></span>
                Schedule follow-up meeting
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>

    <!-- Sidebar -->
    <div class="w-full lg:w-80">
      <!-- Real-time Coaching -->
      <Card class="p-6 mb-6">
        <h3 class="font-semibold mb-4">Coaching Tips</h3>
        <div class="space-y-4">
          {#each coachingTips as tip}
            <div class="flex items-start gap-2">
              <span class="i-lucide-lightbulb text-primary mt-1"></span>
              <p class="text-sm">{tip}</p>
            </div>
          {/each}
        </div>
      </Card>

      <!-- Suggested Responses -->
      <Card class="p-6 mb-6">
        <h3 class="font-semibold mb-4">Suggested Responses</h3>
        <div class="space-y-2">
          {#each suggestedResponses as response}
            <Button variant="outline" class="w-full justify-start text-left">
              {response}
            </Button>
          {/each}
        </div>
      </Card>

      <!-- Practice Mode -->
      <Card class="p-6">
        <h3 class="font-semibold mb-4">Practice Mode</h3>
        <div class="space-y-4">
          <Select
            bind:value={currentScenario}
            class="w-full"
          >
            <option value="">Select a scenario</option>
            {#each scenarios as scenario}
              <option value={scenario.id}>
                {scenario.name} ({scenario.difficulty})
              </option>
            {/each}
          </Select>

          <Button
            class="w-full"
            disabled={!currentScenario}
            onclick={startPracticeMode}
          >
            Start Practice Session
          </Button>
        </div>
      </Card>
    </div>
  </div>
</div>