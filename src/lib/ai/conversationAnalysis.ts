import { HfInference } from '@huggingface/inference';

const hf = new HfInference(import.meta.env.VITE_HF_API_KEY);

interface ConversationAnalysis {
  sentiment: number;
  intent: string;
  suggestions: string[];
  keyTopics: string[];
  nextActions: string[];
}

interface ConversationSegment {
  speaker: 'sales' | 'customer';
  text: string;
  timestamp: Date;
}

export async function analyzeConversation(
  segments: ConversationSegment[]
): Promise<ConversationAnalysis> {
  const combinedText = segments.map(s => s.text).join(' ');
  
  // Parallel analysis for better performance
  const [sentiment, intent, topics] = await Promise.all([
    analyzeSentiment(combinedText),
    classifyIntent(combinedText),
    extractKeyTopics(combinedText)
  ]);
  
  const suggestions = await generateSuggestions(segments, sentiment, intent);
  const nextActions = await recommendNextActions(segments, intent, topics);
  
  return {
    sentiment,
    intent,
    suggestions,
    keyTopics: topics,
    nextActions
  };
}

async function analyzeSentiment(text: string): Promise<number> {
  const response = await hf.textClassification({
    model: 'SamLowe/roberta-base-go_emotions',
    inputs: text
  });
  
  // Map emotions to sentiment score (-1 to 1)
  const emotionScores = {
    joy: 1,
    optimism: 0.7,
    neutral: 0,
    pessimism: -0.7,
    anger: -1,
    frustration: -0.8
  };
  
  return response.reduce((acc, emotion) => 
    acc + (emotionScores[emotion.label] || 0) * emotion.score, 0);
}

async function classifyIntent(text: string): Promise<string> {
  const response = await hf.textClassification({
    model: 'facebook/bart-large-mnli',
    inputs: text,
    parameters: {
      candidate_labels: [
        'information_gathering',
        'price_discussion',
        'feature_inquiry',
        'objection',
        'ready_to_buy',
        'need_more_time'
      ]
    }
  });
  
  return response[0].label;
}

async function extractKeyTopics(text: string): Promise<string[]> {
  const response = await hf.tokenClassification({
    model: 'yanekyuk/bert-uncased-keyword-extractor',
    inputs: text
  });
  
  return response
    .filter(token => token.score > 0.5)
    .map(token => token.word)
    .slice(0, 5);
}

async function generateSuggestions(
  segments: ConversationSegment[],
  sentiment: number,
  intent: string
): Promise<string[]> {
  const lastCustomerSegment = segments
    .filter(s => s.speaker === 'customer')
    .pop();
    
  if (!lastCustomerSegment) return [];
  
  const prompt = `Based on customer message: "${lastCustomerSegment.text}"
    With sentiment: ${sentiment > 0 ? 'positive' : sentiment < 0 ? 'negative' : 'neutral'}
    And intent: ${intent}
    Suggest 3 ways to respond:`;
    
  const response = await hf.textGeneration({
    model: 'google/flan-t5-large',
    inputs: prompt,
    parameters: {
      max_length: 150,
      num_return_sequences: 3
    }
  });
  
  return response.map(r => r.generated_text.trim());
}

async function recommendNextActions(
  segments: ConversationSegment[],
  intent: string,
  topics: string[]
): Promise<string[]> {
  const context = `
    Intent: ${intent}
    Topics discussed: ${topics.join(', ')}
    Conversation length: ${segments.length} exchanges
  `;
  
  const response = await hf.textGeneration({
    model: 'google/flan-t5-large',
    inputs: `Based on: ${context}\nRecommend 3 next actions:`,
    parameters: {
      max_length: 100,
      num_return_sequences: 3
    }
  });
  
  return response.map(r => r.generated_text.trim());
}