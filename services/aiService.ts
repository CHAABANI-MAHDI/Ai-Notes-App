/**
 * AI Service for enhancing note content
 * Currently uses a mock implementation
 * Can be easily extended to use OpenAI, Anthropic, or other AI APIs
 */

export interface AIEnhanceOptions {
  content: string;
  tone?: 'professional' | 'casual' | 'creative' | 'concise';
  action?: 'improve' | 'expand' | 'summarize' | 'rephrase';
}

export interface AIEnhanceResult {
  enhancedContent: string;
  suggestions?: string[];
}

/**
 * Enhance content using AI
 * @param options - Enhancement options including content and preferences
 * @returns Promise with enhanced content
 */
export async function enhanceContent(
  options: AIEnhanceOptions
): Promise<AIEnhanceResult> {
  const { content, tone = 'professional', action = 'improve' } = options;

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock AI enhancement
  // In production, this would call an AI API like OpenAI GPT-4
  const enhancedContent = mockEnhance(content, tone, action);

  return {
    enhancedContent,
    suggestions: [
      'Consider adding more specific examples',
      'Break down complex sentences for clarity',
      'Add section headers for better organization',
    ],
  };
}

/**
 * Mock AI enhancement function
 * Replace this with actual AI API integration
 */
function mockEnhance(
  content: string,
  tone: string,
  action: string
): string {
  // Strip HTML tags for processing
  const textContent = content.replace(/<[^>]*>/g, ' ').trim();

  if (!textContent) {
    return content;
  }

  // Simple mock enhancement based on action type
  switch (action) {
    case 'expand':
      return wrapInParagraph(
        `${textContent} Additionally, this concept can be further explored by considering multiple perspectives and examining various use cases. By breaking down the core ideas into smaller components, we can gain deeper insights and develop a more comprehensive understanding of the subject matter.`
      );

    case 'summarize':
      const sentences = textContent.split(/[.!?]+/).filter(s => s.trim());
      const summary = sentences.slice(0, 2).join('. ') + '.';
      return wrapInParagraph(
        `<strong>Summary:</strong> ${summary} In essence, the key takeaway is to focus on the fundamental principles.`
      );

    case 'rephrase':
      return wrapInParagraph(
        `<em>Enhanced version:</em> ${textContent} (Note: This content has been refined for improved clarity and readability.)`
      );

    case 'improve':
    default:
      // Add professional formatting and structure
      const improved = textContent
        .split(/\n\n+/)
        .map(para => para.trim())
        .filter(para => para)
        .map(para => {
          // Capitalize first letter
          const capitalized =
            para.charAt(0).toUpperCase() + para.slice(1);
          // Ensure proper ending punctuation
          const punctuated = /[.!?]$/.test(capitalized)
            ? capitalized
            : capitalized + '.';
          return punctuated;
        })
        .join(' ');

      return wrapInParagraph(
        `${improved} Furthermore, this demonstrates excellence in communication and attention to detail, which are essential for effective knowledge management.`
      );
  }
}

/**
 * Wrap text content in proper HTML paragraph tags
 */
function wrapInParagraph(text: string): string {
  return `<p>${text}</p>`;
}

/**
 * Example function for future OpenAI integration
 * Uncomment and implement when ready to use a real AI API
 */
/*
async function enhanceWithOpenAI(
  content: string,
  options: AIEnhanceOptions
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a writing assistant. Enhance the following content with a ${options.tone} tone. Action: ${options.action}.`,
        },
        {
          role: 'user',
          content: content,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
*/

export const aiService = {
  enhanceContent,
};
