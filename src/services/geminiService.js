export async function generateQuestionsFromText(text, questionCount) {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error('No Gemini API key found in .env.local');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a quiz generator. Return ONLY a valid JSON array 
        with no markdown, no explanation, no backticks, no code fences.
        Each object must have exactly these fields:
        {
          "question": string,
          "correct_answer": string,
          "incorrect_answers": [string, string, string],
          "difficulty": "easy" | "medium" | "hard",
          "category": "Document Quiz",
          "type": "multiple"
        }
        Generate ${questionCount} questions from this text.
        Test genuine understanding, not word-for-word recall.
        Vary difficulty across questions.
        TEXT: ${text}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: "application/json"
        },
      }),
    }
  );

  if (response.status === 400 || response.status === 401 || response.status === 403) {
    throw new Error('Invalid Gemini API key');
  }

  if (!response.ok) {
    throw new Error('Failed to generate questions. Please try again.');
  }

  const data = await response.json();
  let resultText = data.candidates[0].content.parts[0].text;

  // Strip markdown backticks if present
  resultText = resultText.replace(/```json/gi, '').replace(/```/g, '').trim();

  // Try to extract just the JSON array part in case there's extra text
  const startIndex = resultText.indexOf('[');
  const endIndex = resultText.lastIndexOf(']');
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    resultText = resultText.substring(startIndex, endIndex + 1);
  }

  try {
    const questions = JSON.parse(resultText);
    return questions;
  } catch (error) {
    throw new Error('Failed to parse questions from AI. The document might be too complex or too long.');
  }
}
