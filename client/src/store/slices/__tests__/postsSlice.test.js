// src/store/slices/__tests__/postsSlice.test.js
import { configureStore } from '@reduxjs/toolkit';
import postsReducer, { 
  fetchPosts, 
  createPost, 
  updatePost, 
  deletePost, 
  clearError, 
  setFilters, 
  clearCurrentPost 
} from '../postsSlice';
import apiClient from '../../../utils/apiClient';

// Mock the API client
jest.mock('../../../utils/apiClient', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

describe('Posts Slice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        posts: postsReducer
      }
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().posts;
      expect(state).toEqual({
        posts: [],
        currentPost: null,
        isLoading: false,
        error: null,
        totalCount: 0,
        filters: {
          page: 1,
          limit: 10,
          search: ''
        }
      });
    });
  });

  describe('reducers', () => {
    it('should clear error', () => {
      // Set error state
      store.dispatch({
        type: 'posts/fetchPosts/rejected',
        payload: { message: 'Test error' }
      });

      expect(store.getState().posts.error).toBeDefined();
      
      store.dispatch(clearError());
      
      expect(store.getState().posts.error).toBeNull();
    });

    it('should set filters', () => {
      const newFilters = { page: 2, search: 'test' };
      
      store.dispatch(setFilters(newFilters));
      
      const state = store.getState().posts;
      expect(state.filters.page).toBe(2);
      expect(state.filters.search).toBe('test');
      expect(state.filters.limit).toBe(10); // Should preserve existing
    });

    it('should clear current post', () => {
      // Set a current post first
      store.dispatch({
        type: 'posts/createPost/fulfilled',
        payload: { post: { _id: '1', title: 'Test Post' } }
      });
      
      store.dispatch(clearCurrentPost());
      
      expect(store.getState().posts.currentPost).toBeNull();
    });
  });

  describe('fetchPosts async thunk', () => {
    it('should handle successful posts fetch', async () => {
      const mockResponse = {
        data: {
          posts: [
            { _id: '1', title: 'Post 1', content: 'Content 1' },
            { _id: '2', title: 'Post 2', content: 'Content 2' }
          ],
          totalCount: 2
        }
      };
      apiClient.get.mockResolvedValue(mockResponse);

      await store.dispatch(fetchPosts({ page: 1, limit: 10 }));

      const state = store.getState().posts;
      expect(state.isLoading).toBe(false);
      expect(state.posts).toEqual(mockResponse.data.posts);
      expect(state.totalCount).toBe(2);
      expect(state.error).toBeNull();
      expect(apiClient.get).toHaveBeenCalledWith('/posts', { params: { page: 1, limit: 10 } });
    });

    it('should handle fetch failure', async () => {
      const mockError = {
        response: {
          data: { message: 'Failed to fetch posts' }
        }
      };
      apiClient.get.mockRejectedValue(mockError);

      await store.dispatch(fetchPosts());

      const state = store.getState().posts;
      expect(state.isLoading).toBe(false);
      expect(state.error).toEqual({ message: 'Failed to fetch posts' });
    });

    it('should set loading state during fetch', () => {
      // Test pending state
      store.dispatch({ type: 'posts/fetchPosts/pending' });

      const state = store.getState().posts;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('createPost async thunk', () => {
    it('should handle successful post creation', async () => {
      const newPost = { title: 'New Post', content: 'New Content' };
      const mockResponse = {
        data: {
          post: { _id: '3', ...newPost }
        }
      };
      apiClient.post.mockResolvedValue(mockResponse);

      await store.dispatch(createPost(newPost));

      const state = store.getState().posts;
      expect(state.isLoading).toBe(false);
      expect(state.posts).toContainEqual(mockResponse.data.post);
      expect(state.error).toBeNull();
    });

    it('should handle post creation failure', async () => {
      const mockError = {
        response: {
          data: { message: 'Title is required' }
        }
      };
      apiClient.post.mockRejectedValue(mockError);

      await store.dispatch(createPost({ content: 'No title' }));

      const state = store.getState().posts;
      expect(state.isLoading).toBe(false);
      expect(state.error).toEqual({ message: 'Title is required' });
    });
  });

  describe('updatePost async thunk', () => {
    it('should handle successful post update', async () => {
      // First create some posts
      const initialPosts = [
        { _id: '1', title: 'Post 1', content: 'Content 1' },
        { _id: '2', title: 'Post 2', content: 'Content 2' }
      ];
      store.dispatch({
        type: 'posts/fetchPosts/fulfilled',
        payload: { posts: initialPosts, totalCount: 2 }
      });

      const updatedPost = { _id: '1', title: 'Updated Post', content: 'Updated Content' };
      const mockResponse = {
        data: {
          post: updatedPost
        }
      };
      apiClient.put.mockResolvedValue(mockResponse);

      await store.dispatch(updatePost({ id: '1', title: 'Updated Post', content: 'Updated Content' }));

      const state = store.getState().posts;
      expect(state.isLoading).toBe(false);
      expect(state.posts.find(p => p._id === '1')).toEqual(updatedPost);
      expect(state.error).toBeNull();
    });

    it('should handle update failure', async () => {
      const mockError = {
        response: {
          data: { message: 'Post not found' }
        }
      };
      apiClient.put.mockRejectedValue(mockError);

      await store.dispatch(updatePost({ id: '999', title: 'Updated' }));

      const state = store.getState().posts;
      expect(state.isLoading).toBe(false);
      expect(state.error).toEqual({ message: 'Post not found' });
    });
  });

  describe('deletePost async thunk', () => {
    it('should handle successful post deletion', async () => {
      // First create some posts
      const initialPosts = [
        { _id: '1', title: 'Post 1' },
        { _id: '2', title: 'Post 2' }
      ];
      store.dispatch({
        type: 'posts/fetchPosts/fulfilled',
        payload: { posts: initialPosts, totalCount: 2 }
      });

      apiClient.delete.mockResolvedValue({});

      await store.dispatch(deletePost('1'));

      const state = store.getState().posts;
      expect(state.isLoading).toBe(false);
      expect(state.posts).toHaveLength(1);
      expect(state.posts.find(p => p._id === '1')).toBeUndefined();
      expect(state.error).toBeNull();
    });

    it('should handle deletion failure', async () => {
      const mockError = {
        response: {
          data: { message: 'Post not found' }
        }
      };
      apiClient.delete.mockRejectedValue(mockError);

      await store.dispatch(deletePost('999'));

      const state = store.getState().posts;
      expect(state.isLoading).toBe(false);
      expect(state.error).toEqual({ message: 'Post not found' });
    });
  });
});