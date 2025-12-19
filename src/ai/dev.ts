'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-article.ts';
import '@/ai/flows/daily-news-quiz.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/fact-or-fiction.ts';
import '@/ai/flows/movie-quiz.ts';
import '@/ai/flows/soundstrike-quiz.ts';
import '@/ai/flows/compare-summaries.ts';
import '@/ai/flows/frame-lock-quiz.ts';
