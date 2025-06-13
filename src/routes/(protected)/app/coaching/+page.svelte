<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Progress } from '$lib/components/ui/progress';
  import Mic from "@lucide/svelte/icons/mic";
  import Square from "@lucide/svelte/icons/square";
  import Play from "@lucide/svelte/icons/play";
  import Pause from "@lucide/svelte/icons/pause";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Target from "@lucide/svelte/icons/target";
  import TrendingUp from "@lucide/svelte/icons/trending-up";
  import Clock from "@lucide/svelte/icons/clock";
  import MessageSquare from "@lucide/svelte/icons/message-square";
  import Lightbulb from "@lucide/svelte/icons/lightbulb";

  let isRecording = $state(false);
  let isPlaying = $state(false);
  let callDuration = $state(0);
  let performanceScore = $state(85);
  let talkRatio = $state(35);
  let questionsAsked = $state(8);

  const scenarios = [
    { id: 'discovery', name: 'Discovery Call', difficulty: 'Beginner' },
    { id: 'demo', name: 'Product Demo', difficulty: 'Intermediate' },
    { id: 'negotiation', name: 'Price Negotiation', difficulty: 'Advanced' },
    { id: 'objection', name: 'Handling Objections', difficulty: 'Advanced' }
  ];

  const coachingTips = [
    "Great opening! You acknowledged their time and showed understanding.",
    "Your discovery question was open-ended and focused on their pain points.",
    "Consider asking follow-up questions to dig deeper into specific challenges."
  ];

  const suggestedResponses = [
    "What specific part of your sales process takes the most time?",
    "How are you currently tracking your leads and opportunities?",
    "What would an ideal solution look like for your team?"
  ];

  function toggleRecording() {
    isRecording = !isRecording;
    if (isRecording) {
      // Start recording simulation
      const interval = setInterval(() => {
        callDuration += 1;
      }, 1000);
    }
  }

  function togglePlayback() {
    isPlaying = !isPlaying;
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

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">AI Sales Coaching</h1>
      <p class="text-muted-foreground">Practice and improve your sales calls with real-time AI feedback</p>
    </div>
  </div>

  <!-- Performance Metrics -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <Card class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Overall Score</p>
          <p class={`text-2xl font-bold ${getScoreColor(performanceScore)}`}>
            {performanceScore}%
          </p>
        </div>
        <Target class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>

    <Card class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Talk Ratio</p>
          <p class="text-2xl font-bold">{talkRatio}%</p>
        </div>
        <MessageSquare class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>

    <Card class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Questions Asked</p>
          <p class="text-2xl font-bold">{questionsAsked}</p>
        </div>
        <Lightbulb class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>

    <Card class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">Call Duration</p>
          <p class="text-2xl font-bold">{Math.floor(callDuration / 60)}m</p>
        </div>
        <Clock class="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Main Content -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Recording Interface -->
      <Card class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold">Live Call Assistant</h2>
          <Button
            variant={isRecording ? 'destructive' : 'default'}
            size="lg"
            onclick={toggleRecording}
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

        <!-- Audio Visualization Placeholder -->
        <div class="mb-6">
          <div class="h-16 bg-muted rounded-lg flex items-center justify-center">
            <div class="flex items-center gap-1">
              {#each Array(20) as _, i}
                <div 
                  class={`w-1 bg-primary rounded-full transition-all duration-300 ${isRecording ? 'animate-pulse' : ''}`}
                  style={`height: ${Math.random() * 40 + 10}px`}
                ></div>
              {/each}
            </div>
          </div>
          <div class="flex items-center justify-between mt-2 text-sm text-muted-foreground">
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
        <div class="bg-muted/50 rounded-lg p-4 h-48 overflow-y-auto mb-6">
          <h3 class="font-semibold mb-2">Live Transcription</h3>
          <p class="text-sm">
            Thank you for taking the time to speak with me today. I understand you're looking for a solution to help streamline your sales process. Can you tell me more about your current challenges?
          </p>
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
          </div>
          <div class="flex items-center gap-4">
            <Button variant="outline">Save Recording</Button>
            <Button variant="outline">Share</Button>
          </div>
        </div>
      </Card>

      <!-- Performance Analysis -->
      <Card class="p-6">
        <h2 class="text-xl font-bold mb-6">Performance Analysis</h2>
        
        <div class="space-y-6">
          <!-- Overall Score -->
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-primary mb-4">
              <span class={`text-3xl font-bold ${getScoreColor(performanceScore)}`}>{performanceScore}</span>
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
          {/each}
        </div>
      </Card>

      <!-- Practice Scenarios -->
      <Card class="p-6">
        <h3 class="font-semibold mb-4">Practice Scenarios</h3>
        <div class="space-y-3">
          {#each scenarios as scenario}
            <div class="p-3 border rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium">{scenario.name}</h4>
                <Badge variant="outline" class={getScenarioDifficultyColor(scenario.difficulty)}>
                  {scenario.difficulty}
                </Badge>
              </div>
              <Button variant="outline" size="sm" class="w-full">
                Start Practice
              </Button>
            </div>
          {/each}
        </div>
      </Card>
    </div>
  </div>
</div>