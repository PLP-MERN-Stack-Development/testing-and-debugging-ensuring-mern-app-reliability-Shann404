// src/store/slices/postsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/posts', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch posts');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/posts', postData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create post');
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ id, ...postData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/posts/${id}`, postData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/posts/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete post');
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
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
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.posts;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create post
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts.unshift(action.payload.post);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update post
      .addCase(updatePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.posts.findIndex(post => post._id === action.payload.post._id);
        if (index !== -1) {
          state.posts[index] = action.payload.post;
        }
        if (state.currentPost && state.currentPost._id === action.payload.post._id) {
          state.currentPost = action.payload.post;
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete post
      .addCase(deletePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = state.posts.filter(post => post._id !== action.payload);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setFilters, clearCurrentPost } = postsSlice.actions;
export default postsSlice.reducer;