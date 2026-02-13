import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export interface CardDetails {
    card_name: string;
    card_set: string; // Now includes year, e.g. "Paldean Fates 2024"
}

export const identifyCard = async (imageUrl: string): Promise<CardDetails> => {
    try {
        console.log(`Identifying card via direct OpenRouter API from URL: ${imageUrl}`);

        const requestBody = {
            model: "google/gemma-3-12b-it:free",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Identify this specific Pokemon card. Focus on the exact visual variant (e.g., 'Bubble Mew', 'Illustrator Pikachu', 'Shining Charizard'). Return ONLY a valid JSON object with: 'card_name' (Full card name including variant/set) and 'card_set' (Set name and year, e.g. 'Paldean Fates 2024'). Do not include any price estimate or markdown."
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageUrl
                            }
                        }
                    ]
                }
            ]
        };

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            requestBody,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://pikafi.grading',
                    'X-Title': 'Pikafi Admin'
                }
            }
        );

        const choices = response.data?.choices;
        if (!choices || choices.length === 0) {
            throw new Error('No choices returned from OpenRouter');
        }

        const content = choices[0]?.message?.content;
        if (!content) {
            throw new Error('No content received from AI');
        }

        // Clean up response if it contains markdown code blocks
        const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(cleanedContent);
        } catch (parseError) {
            console.error('JSON Parse Error. Content:', cleanedContent);
            throw new Error('Failed to parse AI response as JSON');
        }

    } catch (error: any) {
        console.error('AI Identification Failed. Input URL:', imageUrl);

        if (error.response) {
            console.error('API Error Response:', JSON.stringify(error.response.data, null, 2));
            if (error.response.status === 429) {
                throw new Error('Daily AI limit reached. Please try again later or add credits.');
            }
            throw new Error(`OpenRouter API Error: ${error.response.data?.error?.message || error.message}`);
        }

        const errorMessage = error.message || 'Unknown error';
        console.error('Actual Error:', errorMessage);
        throw new Error(`Failed to identify card: ${errorMessage}`);
    }
};
