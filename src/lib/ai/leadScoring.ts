import * as tf from '@tensorflow/tfjs';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(import.meta.env.VITE_HF_API_KEY);

interface LeadData {
  company: string;
  title: string;
  industry: string;
  employeeCount: number;
  revenue: number;
  websiteVisits: number;
  emailOpens: number;
  lastInteraction: Date;
}

interface LeadScore {
  score: number;
  confidence: number;
  factors: string[];
}

let model: tf.LayersModel | null = null;

async function initModel() {
  if (!model) {
    // Load pre-trained model or create a new one
    model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [8], units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
  }
  return model;
}

function preprocessLeadData(data: LeadData): tf.Tensor {
  // Normalize numerical features
  const numericFeatures = [
    data.employeeCount / 10000,
    data.revenue / 1000000,
    data.websiteVisits / 100,
    data.emailOpens / 50,
    (Date.now() - data.lastInteraction.getTime()) / (1000 * 60 * 60 * 24) // Days since last interaction
  ];

  // Convert categorical features using embeddings
  const industryEmbedding = await getIndustryEmbedding(data.industry);
  const titleEmbedding = await getTitleEmbedding(data.title);
  const companyEmbedding = await getCompanyEmbedding(data.company);

  return tf.tensor2d([
    ...numericFeatures,
    ...industryEmbedding,
    ...titleEmbedding,
    ...companyEmbedding
  ], [1, -1]);
}

async function getIndustryEmbedding(industry: string): Promise<number[]> {
  const response = await hf.featureExtraction({
    model: 'sentence-transformers/all-MiniLM-L6-v2',
    inputs: industry
  });
  return response;
}

async function getTitleEmbedding(title: string): Promise<number[]> {
  const response = await hf.featureExtraction({
    model: 'sentence-transformers/all-MiniLM-L6-v2',
    inputs: title
  });
  return response;
}

async function getCompanyEmbedding(company: string): Promise<number[]> {
  const response = await hf.featureExtraction({
    model: 'sentence-transformers/all-MiniLM-L6-v2',
    inputs: company
  });
  return response;
}

export async function scoreLead(data: LeadData): Promise<LeadScore> {
  const model = await initModel();
  const inputTensor = await preprocessLeadData(data);
  
  const prediction = model.predict(inputTensor) as tf.Tensor;
  const score = (await prediction.data())[0];
  
  // Analyze factors contributing to the score
  const factors = await analyzeScoreFactors(data, score);
  
  return {
    score: Math.round(score * 100),
    confidence: 0.85, // Confidence based on model metrics
    factors
  };
}

async function analyzeScoreFactors(data: LeadData, score: number): Promise<string[]> {
  const factors: string[] = [];
  
  if (data.websiteVisits > 50) factors.push('High website engagement');
  if (data.emailOpens > 20) factors.push('Strong email engagement');
  if (data.revenue > 1000000) factors.push('Revenue indicates enterprise potential');
  if (Date.now() - data.lastInteraction.getTime() < 7 * 24 * 60 * 60 * 1000) {
    factors.push('Recent interaction');
  }

  return factors;
}

export async function updateModel(newData: LeadData[], outcomes: boolean[]): Promise<void> {
  const model = await initModel();
  const batchSize = 32;
  
  // Prepare training data
  const xs = tf.concat(await Promise.all(newData.map(preprocessLeadData)));
  const ys = tf.tensor2d(outcomes, [outcomes.length, 1]);
  
  // Train model
  await model.fit(xs, ys, {
    epochs: 10,
    batchSize,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch}: loss = ${logs?.loss}`);
      }
    }
  });
  
  // Cleanup
  xs.dispose();
  ys.dispose();
}