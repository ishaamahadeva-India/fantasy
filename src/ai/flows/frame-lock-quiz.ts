
'use server';

/**
 * @fileOverview Generates a "Frame Lock" quiz question.
 *
 * - generateFrameLockQuiz - A function that generates the image-based quiz.
 * - FrameLockQuizOutput - The return type for the generateFrameLockQuiz function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { popularMovies } from '@/lib/placeholder-data';

const FrameLockQuizOutputSchema = z.object({
  question: z.string().describe('The instructional text for the user, which should be "Identify the movie from the frame below."'),
  imageDataUri: z.string().describe("The generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
  options: z.array(z.string()).describe('An array of 4 movie titles, one being the correct answer.'),
  correctAnswerIndex: z.number().describe('The index of the correct answer in the options array.'),
  explanation: z.string().describe('An explanation of the scene depicted and the movie it belongs to.'),
});
export type FrameLockQuizOutput = z.infer<typeof FrameLockQuizOutputSchema>;

// Helper to select a random movie and some distractors
const selectMoviesForQuiz = () => {
    const movies = [...popularMovies];
    const correctMovieIndex = Math.floor(Math.random() * movies.length);
    const correctMovie = movies.splice(correctMovieIndex, 1)[0];

    // Get 3 random distractors
    const distractors = movies.sort(() => 0.5 - Math.random()).slice(0, 3).map(m => m.title);

    return {
        correctMovie,
        distractors
    };
};


const generateImageForMoviePrompt = ai.definePrompt({
    name: 'generateImageForMoviePrompt',
    input: { schema: z.object({ movieTitle: z.string(), movieDescription: z.string() }) },
    output: { format: 'media' },
    prompt: `Generate a single, visually striking and recognizable image that represents an iconic scene or character from the movie "{{movieTitle}}".
    
    Movie Description: {{movieDescription}}
    
    The image should be cinematic, well-composed, and evocative of the film's mood and style, but it should NOT contain any text, logos, or titles. Focus on a key moment, character pose, or setting that a fan of the movie would recognize.
    `,
    model: 'googleai/gemini-2.5-flash-image-preview',
    config: {
        responseModalities: ['IMAGE']
    }
});


export async function generateFrameLockQuiz(): Promise<FrameLockQuizOutput> {
    const { correctMovie, distractors } = selectMoviesForQuiz();

    // Generate the image
    const imageResponse = await generateImageForMoviePrompt({
        movieTitle: correctMovie.title,
        movieDescription: correctMovie.description,
    });
    const imageDataUri = imageResponse.output?.media?.url;
    
    if (!imageDataUri) {
        throw new Error('Failed to generate image for the quiz frame.');
    }

    // Shuffle options
    const options = [correctMovie.title, ...distractors].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctMovie.title);

    return {
        question: "Identify the movie from the frame below.",
        imageDataUri: imageDataUri,
        options: options,
        correctAnswerIndex: correctIndex,
        explanation: `This scene is from "${correctMovie.title}". ${correctMovie.description}`,
    };
}

