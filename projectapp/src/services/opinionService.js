import api from './api';

const OPINION_SERVICE_URL = 'https://opinion-service.onrender.com/api/v1/opinions';

export const opinionService = {
  /**
   * Create a new opinion/comment
   */
  async createOpinion(postId, content, parentId = null) {
    try {
      const response = await api.post(OPINION_SERVICE_URL, {
        postId,
        opinion: content,
        parentId
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create opinion');
    }
  },

  /**
   * Get all opinions for a post
   */
  async getOpinionsByPostId(postId) {
    try {
      const response = await api.get(`${OPINION_SERVICE_URL}/post/${postId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch opinions');
    }
  },

  /**
   * Get root comments (top-level, no parent) for a post
   */
  async getRootComments(postId) {
    try {
      const response = await api.get(`${OPINION_SERVICE_URL}/post/${postId}/root`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch root comments');
    }
  },

  /**
   * Get direct children/replies of a comment
   */
  async getChildComments(parentId) {
    try {
      const response = await api.get(`${OPINION_SERVICE_URL}/${parentId}/children`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch child comments');
    }
  },

  /**
   * Get all comments in hierarchical order (tree traversal)
   */
  async getHierarchicalComments(postId) {
    try {
      const response = await api.get(`${OPINION_SERVICE_URL}/post/${postId}/hierarchical`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch hierarchical comments');
    }
  },

  /**
   * Get all descendants (nested replies at all levels) of a comment
   */
  async getAllDescendants(commentId) {
    try {
      const response = await api.get(`${OPINION_SERVICE_URL}/${commentId}/descendants`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch descendants');
    }
  },

  /**
   * Delete an opinion and all its nested replies
   */
  async deleteOpinion(opinionId) {
    try {
      const response = await api.delete(`${OPINION_SERVICE_URL}/${opinionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete opinion');
    }
  },

  /**
   * Subscribe to real-time opinion updates via WebSocket
   */
  subscribeToOpinions(postId, callback) {
    const ws = new WebSocket(`ws://localhost:8083/ws/opinions`);
    
    ws.onopen = () => {
      console.log('WebSocket connected for opinions');
      // Subscribe to specific post
      ws.send(JSON.stringify({
        action: 'subscribe',
        postId
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return ws;
  }
};

export default opinionService;