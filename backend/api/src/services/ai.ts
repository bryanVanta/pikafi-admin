
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Configure OpenAI client for OpenRouter
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

export interface CardDetails {
    name: string;
    description: string;
}

export const identifyCard = async (imageUrl: string): Promise<CardDetails> => {
    try {
        console.log(`Identifying card from URL: ${imageUrl}`);

        const completion = await openai.chat.completions.create({
            model: "google/gemma-3-12b-it:free",
            messages: [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Identify this specific Pokemon card. Focus on the exact visual variant (e.g., 'Bubble Mew', 'Illustrator Pikachu', 'Shining Charizard'). Return ONLY a valid JSON object with: 'name' (Full card name including variant/set) and 'description' (Visual description, set name, rarity). Do not include any price estimate or markdown."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": imageUrl
                            }
                        }
                    ]
                }
            ]
        });

        const content = completion.choices[0]?.message?.content;
        console.log('AI Response:', content);

        if (!content) {
            throw new Error('No content received from AI');
        }

        // Clean up response if it contains markdown code blocks (common with LLMs)
        const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanedContent);

    } catch (error: any) {
        console.error('AI Identification Failed. Input URL:', imageUrl);

        // Log full error object including non-enumerable properties
        if (error.response) {
            console.error('OpenAI API Status:', error.response.status);
            console.error('OpenAI API Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }

        throw new Error('Failed to identify card. Check server logs for details.');
    }
};
