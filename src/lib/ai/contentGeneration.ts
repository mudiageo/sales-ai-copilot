interface ContentRequest {
  type: 'email' | 'message' | 'proposal';
  context: {
    leadName: string;
    companyName: string;
    industry: string;
    previousInteractions: string[];
    keyPoints: string[];
  };
  tone?: 'formal' | 'casual' | 'professional';
  maxLength?: number;
}

interface GeneratedContent {
  content: string;
  variations: string[];
  suggestedSubject?: string;
  followUpDelay?: number;
}

export async function generateContent(request: ContentRequest): Promise<GeneratedContent> {
  const prompt = buildPrompt(request);
  
  const response = await hf.textGeneration({
    model: 'google/flan-t5-large',
    inputs: prompt,
    parameters: {
      max_length: request.maxLength || 300,
      num_return_sequences: 3,
      temperature: 0.7
    }
  });
  
  const [mainContent, ...variations] = response.map(r => r.generated_text.trim());
  
  const suggestedSubject = request.type === 'email' 
    ? await generateSubject(mainContent)
    : undefined;
    
  const followUpDelay = calculateFollowUpDelay(request.context);
  
  return {
    content: mainContent,
    variations,
    suggestedSubject,
    followUpDelay
  };
}

function buildPrompt(request: ContentRequest): string {
  const { type, context, tone = 'professional' } = request;
  
  const previousContext = context.previousInteractions
    .map(interaction => `- ${interaction}`)
    .join('\n');
    
  const keyPoints = context.keyPoints
    .map(point => `- ${point}`)
    .join('\n');
    
  return `
    Generate a ${tone} ${type} for:
    Recipient: ${context.leadName}
    Company: ${context.companyName}
    Industry: ${context.industry}
    
    Previous interactions:
    ${previousContext}
    
    Key points to address:
    ${keyPoints}
    
    Generate content that is:
    - Personalized to the recipient and their industry
    - Addresses key points naturally
    - Maintains ${tone} tone
    - Includes clear next steps
  `;
}

async function generateSubject(content: string): Promise<string> {
  const response = await hf.summarization({
    model: 'facebook/bart-large-cnn',
    inputs: content,
    parameters: {
      max_length: 10,
      min_length: 5
    }
  });
  
  return response[0].summary_text;
}

function calculateFollowUpDelay(context: ContentRequest['context']): number {
  const baseDelay = 3; // days
  
  // Adjust based on previous interactions
  const interactionCount = context.previousInteractions.length;
  const interactionFactor = Math.min(interactionCount * 0.5, 2);
  
  // Industry-specific adjustments
  const industryDelays = {
    'technology': 0.8,
    'healthcare': 1.2,
    'finance': 1.5,
    'retail': 0.7
  };
  
  const industryFactor = industryDelays[context.industry.toLowerCase()] || 1;
  
  return Math.round(baseDelay * interactionFactor * industryFactor);
}

export async function generateFollowUpSequence(
  initialContent: string,
  context: ContentRequest['context']
): Promise<GeneratedContent[]> {
  const followUps = [3, 7, 14]; // Days after initial content
  
  const sequence = await Promise.all(followUps.map(async (delay) => {
    const followUpRequest: ContentRequest = {
      type: 'email',
      context: {
        ...context,
        previousInteractions: [
          ...context.previousInteractions,
          `Initial email sent ${delay} days ago`
        ]
      },
      tone: 'professional'
    };
    
    return generateContent(followUpRequest);
  }));
  
  return sequence;
}

export async function generateObjectionResponse(
  objection: string,
  context: ContentRequest['context']
): Promise<string> {
  const prompt = `
    Generate a response to this sales objection:
    "${objection}"
    
    Context:
    - Lead: ${context.leadName}
    - Company: ${context.companyName}
    - Industry: ${context.industry}
    
    Previous interactions:
    ${context.previousInteractions.join('\n')}
  `;
  
  const response = await hf.textGeneration({
    model: 'google/flan-t5-large',
    inputs: prompt,
    parameters: {
      max_length: 200,
      temperature: 0.7
    }
  });
  
  return response[0].generated_text.trim();
}