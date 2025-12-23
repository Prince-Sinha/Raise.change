const API_BASE_URL = 'http://localhost:8087/api/v1';

export const aiService = {
    async analyzePost(title, description) {
        try {
            const response = await fetch(`${API_BASE_URL}/ai/analyze-post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, description })
            });
            
            if (!response.ok) {
                throw new Error('Failed to analyze post');
            }
            
            return await response.json();
        } catch (error) {
            console.error('AI Analysis Error:', error);
            throw error;
        }
    },
    
    async suggestResponse(postTitle, postDescription, department) {
        try {
            const response = await fetch(`${API_BASE_URL}/ai/suggest-response`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ postTitle, postDescription, department })
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate response suggestion');
            }
            
            return await response.json();
        } catch (error) {
            console.error('AI Response Suggestion Error:', error);
            throw error;
        }
    }
};