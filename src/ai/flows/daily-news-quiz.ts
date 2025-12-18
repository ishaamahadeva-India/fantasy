'use server';

/**
 * @fileOverview Generates a daily news quiz using Genkit.
 *
 * - generateDailyNewsQuiz - A function that generates the daily news quiz.
 * - DailyNewsQuizInput - The input type for the generateDailyNewsQuiz function.
 * - DailyNewsQuizOutput - The return type for the generateDailyNewsQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyNewsQuizInputSchema = z.object({
  topic: z
    .string()
    .optional()
    .describe('Optional topic to focus the quiz on, e.g., "Technology", "Politics", or "Business". If not provided, the quiz will cover general news.'),
  numQuestions: z
    .number()
    .optional()
    .default(3)
    .describe('The number of questions to generate for the quiz. Defaults to 3.'),
});
export type DailyNewsQuizInput = z.infer<typeof DailyNewsQuizInputSchema>;

const DailyNewsQuizOutputSchema = z.object({
  quiz: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('The possible answers to the question.'),
      correctAnswerIndex: z
        .number()
        .describe('The index of the correct answer in the options array.'),
      explanation: z.string().optional().describe('Explanation of the correct answer.'),
    })
  ).describe('An array of quiz questions, options and correct answers.'),
});
export type DailyNewsQuizOutput = z.infer<typeof DailyNewsQuizOutputSchema>;

export async function generateDailyNewsQuiz(input: DailyNewsQuizInput): Promise<DailyNewsQuizOutput> {
  return generateDailyNewsQuizFlow(input);
}

const generateQuizPrompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: DailyNewsQuizInputSchema},
  output: {schema: DailyNewsQuizOutputSchema},
  prompt: `You are an expert quiz generator, tasked with creating engaging and informative daily news quizzes.

  Generate a quiz with {{numQuestions}} questions based on recent news headlines.
  {{#if topic}}
  Focus the quiz on the topic of {{topic}}.
  {{/if}}
  Each question should have 4 options, one of which is the correct answer.
  Provide a short explanation for each correct answer.
  The response should be formatted as a JSON object conforming to the schema:
  ${JSON.stringify(DailyNewsQuizOutputSchema.shape, null, 2)}

  Make sure to include the "explanation" field.
  Here's an example quiz:
  {
    "quiz": [
      {
        "question": "What country recently launched a new lunar mission?",
        "options": ["United States", "China", "India", "Russia"],
        "correctAnswerIndex": 2,
        "explanation": "India launched its third lunar exploration mission, Chandrayaan-3, on July 14, 2023."
      },
      {
        "question": "Which city is hosting the next Olympic Games in 2028?",
        "options": ["Paris", "Los Angeles", "Tokyo", "Beijing"],
        "correctAnswerIndex": 1,
        "explanation": "Los Angeles will host the 2028 Summer Olympics, marking the city's third time hosting the Games."
      }
    ]
  }`,
});

const generateDailyNewsQuizFlow = ai.defineFlow(
  {
    name: 'generateDailyNewsQuizFlow',
    inputSchema: DailyNewsQuizInputSchema,
    outputSchema: DailyNewsQuizOutputSchema,
  },
  async input => {
    const {output} = await generateQuizPrompt(input);
    return output!;
  }
);
