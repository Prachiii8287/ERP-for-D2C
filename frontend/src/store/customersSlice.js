// frontend/src/store/customersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customerAPI } from '../services/api';

export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async () => {
    const response = await customerAPI.getCustomers();
    return response.data;
  }
);

export const syncShopifyCustomers = createAsyncThunk(
  'customers/syncShopifyCustomers',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Making sync request to backend...');
      const response = await customerAPI.syncShopifyCustomers();
      console.log('Sync response:', response);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to sync customers');
      }
      
      return response.data;
    } catch (err) {
      console.error('Sync error:', err.response?.data || err);
      return rejectWithValue(
        err.response?.data?.error || 
        err.response?.data?.message || 
        err.message ||
        'Failed to sync customers from Shopify'
      );
    }
  }
);

export const pushCustomerToShopify = createAsyncThunk(
  'customers/pushCustomerToShopify',
  async (customerId, { rejectWithValue }) => {
    try {
      console.log('Pushing customer to Shopify:', customerId);
      const response = await customerAPI.pushCustomerToShopify(customerId);
      console.log('Push response:', response);
      return response.data;
    } catch (err) {
      console.error('Push error:', err.response?.data || err);
      return rejectWithValue(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Failed to push customer to Shopify'
      );
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, ...customerData }, { rejectWithValue }) => {
    try {
      console.log('Sending update request with:', { id, customerData }); // Debug log
      const response = await customerAPI.updateCustomer(id, customerData);
      console.log('Update response:', response); // Debug log
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      return response.data;
    } catch (err) {
      console.error('Update error:', err.response?.data || err); // Debug log
      let errorMessage = 'Failed to update customer';
      
      if (err.response?.data?.error) {
        errorMessage = typeof err.response.data.error === 'object' 
          ? err.response.data.error.message || errorMessage
          : err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

const customersSlice = createSlice({
  name: 'customers',
  initialState: {
    items: [],
    loading: false,
    error: null,
    syncStatus: null,
    metadata: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSyncStatus: (state) => {
      state.syncStatus = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSyncStatus: (state, action) => {
      state.syncStatus = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
        state.metadata = action.payload.metadata || null;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch customers';
      })

      // Sync Shopify Customers
      .addCase(syncShopifyCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.syncStatus = 'Syncing customers...';
      })
      .addCase(syncShopifyCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.syncStatus = action.payload.message || 'Successfully synced customers';
        if (action.payload.data) {
          state.items = action.payload.data;
        }
      })
      .addCase(syncShopifyCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to sync customers';
        state.syncStatus = null;
      })

      // Push Customer to Shopify
      .addCase(pushCustomerToShopify.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(pushCustomerToShopify.fulfilled, (state, action) => {
        state.loading = false;
        state.syncStatus = 'Successfully pushed customer to Shopify';
      })
      .addCase(pushCustomerToShopify.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to push customer to Shopify';
      })

      // Update Customer
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.syncStatus = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.syncStatus = 'Customer updated successfully';
        // Update the customer in the list
        const index = state.items.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update customer';
        state.syncStatus = null;
      });
  }
});

export const { clearError, clearSyncStatus, setError, setSyncStatus } = customersSlice.actions;
export default customersSlice.reducer;
