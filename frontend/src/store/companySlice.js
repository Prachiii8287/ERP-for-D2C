// frontend/src/store/companySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { companyAPI } from '../services/api';

// Async thunks for company operations
export const fetchCompanyProfile = createAsyncThunk(
  'company/fetchProfile',
  async (companyId, { rejectWithValue }) => {
    try {
      const response = await companyAPI.getCompanyProfile(companyId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch company profile'
      );
    }
  }
);

export const updateCompanyProfile = createAsyncThunk(
  'company/updateProfile',
  async ({ companyId, data }, { rejectWithValue }) => {
    try {
      const response = await companyAPI.updateCompany(companyId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to update company profile'
      );
    }
  }
);

// Department operations
export const fetchDepartments = createAsyncThunk(
  'company/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await companyAPI.getDepartments();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch departments'
      );
    }
  }
);

export const createDepartment = createAsyncThunk(
  'company/createDepartment',
  async (departmentData, { rejectWithValue }) => {
    try {
      const response = await companyAPI.createDepartment(departmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to create department'
      );
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'company/updateDepartment',
  async ({ deptId, data }, { rejectWithValue }) => {
    try {
      const response = await companyAPI.updateDepartment(deptId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to update department'
      );
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  'company/deleteDepartment',
  async (deptId, { rejectWithValue }) => {
    try {
      await companyAPI.deleteDepartment(deptId);
      return deptId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to delete department'
      );
    }
  }
);

// Admin users operations
export const fetchAdminUsers = createAsyncThunk(
  'company/fetchAdminUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await companyAPI.getAdminUsers();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch admin users'
      );
    }
  }
);

export const createAdminUser = createAsyncThunk(
  'company/createAdminUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await companyAPI.createAdminUser(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to create admin user'
      );
    }
  }
);

export const deleteAdminUser = createAsyncThunk(
  'company/deleteAdminUser',
  async (userId, { rejectWithValue }) => {
    try {
      await companyAPI.deleteAdminUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to delete admin user'
      );
    }
  }
);

// Add this new thunk action
export const connectShopify = createAsyncThunk(
  'company/connectShopify',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await companyAPI.connectShopify(credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to connect to Shopify');
    }
  }
);

const initialState = {
  profile: null,
  departments: [],
  adminUsers: [],
  loading: {
    profile: false,
    departments: false,
    adminUsers: false,
  },
  errors: {
    profile: null,
    departments: null,
    adminUsers: null,
  },
  shopifyConnected: false,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.errors = {
        profile: null,
        departments: null,
        adminUsers: null,
      };
    },
    clearDepartmentError: (state) => {
      state.errors.departments = null;
    },
    clearAdminUserError: (state) => {
      state.errors.adminUsers = null;
    },
    resetCompanyState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Company Profile
      .addCase(fetchCompanyProfile.pending, (state) => {
        state.loading.profile = true;
        state.errors.profile = null;
      })
      .addCase(fetchCompanyProfile.fulfilled, (state, action) => {
        state.loading.profile = false;
        state.profile = action.payload;
        state.errors.profile = null;
      })
      .addCase(fetchCompanyProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.errors.profile = action.payload;
      })
      
      // Update Company Profile
      .addCase(updateCompanyProfile.pending, (state) => {
        state.loading.profile = true;
        state.errors.profile = null;
      })
      .addCase(updateCompanyProfile.fulfilled, (state, action) => {
        state.loading.profile = false;
        state.profile = { ...state.profile, ...action.payload };
        state.errors.profile = null;
      })
      .addCase(updateCompanyProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.errors.profile = action.payload;
      })
      
      // Departments
      .addCase(fetchDepartments.pending, (state) => {
        state.loading.departments = true;
        state.errors.departments = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading.departments = false;
        state.departments = action.payload;
        state.errors.departments = null;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading.departments = false;
        state.errors.departments = action.payload;
      })
      
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload);
      })
      
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex(dept => dept.id === action.payload.id);
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      })
      
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter(dept => dept.id !== action.payload);
      })
      
      // Admin Users
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading.adminUsers = true;
        state.errors.adminUsers = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading.adminUsers = false;
        state.adminUsers = action.payload;
        state.errors.adminUsers = null;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading.adminUsers = false;
        state.errors.adminUsers = action.payload;
      })
      
      .addCase(createAdminUser.fulfilled, (state, action) => {
        state.adminUsers.push(action.payload);
      })
      
      .addCase(deleteAdminUser.fulfilled, (state, action) => {
        state.adminUsers = state.adminUsers.filter(user => user.id !== action.payload);
      })
      
      // Add these cases for Shopify connection
      .addCase(connectShopify.pending, (state) => {
        state.loading = true;
        state.errors = null;
      })
      .addCase(connectShopify.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = {
          ...state.profile,
          shopify_domain: action.payload.shopify_domain,
          shopify_access_token: action.payload.shopify_access_token
        };
        state.shopifyConnected = true;
      })
      .addCase(connectShopify.rejected, (state, action) => {
        state.loading = false;
        state.errors = action.payload;
      });
  },
});

export const { 
  clearErrors, 
  clearDepartmentError, 
  clearAdminUserError, 
  resetCompanyState 
} = companySlice.actions;

export default companySlice.reducer;