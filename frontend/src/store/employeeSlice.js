// frontend/src/store/employeeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeAPI } from '../services/api';

// Async thunks for employee operations
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getEmployees();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch employees'
      );
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.createEmployee(employeeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to create employee'
      );
    }
  }
);

export const fetchEmployeeById = createAsyncThunk(
  'employees/fetchEmployeeById',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getEmployee(employeeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch employee details'
      );
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ employeeId, data }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.updateEmployee(employeeId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to update employee'
      );
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (employeeId, { rejectWithValue }) => {
    try {
      await employeeAPI.deleteEmployee(employeeId);
      return employeeId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to delete employee'
      );
    }
  }
);

const initialState = {
  employees: [],
  selectedEmployee: null,
  loading: {
    list: false,
    create: false,
    update: false,
    delete: false,
    details: false,
  },
  errors: {
    list: null,
    create: null,
    update: null,
    delete: null,
    details: null,
  },
  filters: {
    search: '',
    department: '',
    status: 'all',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
  }
};

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.errors = {
        list: null,
        create: null,
        update: null,
        delete: null,
        details: null,
      };
    },
    clearEmployeeError: (state, action) => {
      const errorType = action.payload;
      if (state.errors[errorType]) {
        state.errors[errorType] = null;
      }
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
    },
    resetEmployeeState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading.list = true;
        state.errors.list = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading.list = false;
        state.employees = action.payload;
        state.errors.list = null;
        // Update pagination if response includes pagination data
        if (action.payload.pagination) {
          state.pagination = { ...state.pagination, ...action.payload.pagination };
        }
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading.list = false;
        state.errors.list = action.payload;
      })
      
      // Create Employee
      .addCase(createEmployee.pending, (state) => {
        state.loading.create = true;
        state.errors.create = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading.create = false;
        state.employees.push(action.payload);
        state.errors.create = null;
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading.create = false;
        state.errors.create = action.payload;
      })
      
      // Fetch Employee Details
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loading.details = true;
        state.errors.details = null;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.loading.details = false;
        state.selectedEmployee = action.payload;
        state.errors.details = null;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading.details = false;
        state.errors.details = action.payload;
      })
      
      // Update Employee
      .addCase(updateEmployee.pending, (state) => {
        state.loading.update = true;
        state.errors.update = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading.update = false;
        // Update in employees list
        const index = state.employees.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        // Update selected employee if it's the same one
        if (state.selectedEmployee && state.selectedEmployee.id === action.payload.id) {
          state.selectedEmployee = action.payload;
        }
        state.errors.update = null;
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading.update = false;
        state.errors.update = action.payload;
      })
      
      // Delete Employee
      .addCase(deleteEmployee.pending, (state) => {
        state.loading.delete = true;
        state.errors.delete = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading.delete = false;
        state.employees = state.employees.filter(emp => emp.id !== action.payload);
        // Clear selected employee if it was deleted
        if (state.selectedEmployee && state.selectedEmployee.id === action.payload) {
          state.selectedEmployee = null;
        }
        state.errors.delete = null;
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading.delete = false;
        state.errors.delete = action.payload;
      });
  },
});

export const { 
  clearErrors, 
  clearEmployeeError, 
  setFilters, 
  setPagination,
  clearSelectedEmployee,
  resetEmployeeState 
} = employeeSlice.actions;

// Selectors
export const selectFilteredEmployees = (state) => {
  const { employees, filters } = state.employees;
  
  return employees.filter(employee => {
    const matchesSearch = !filters.search || 
      employee.user?.first_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.user?.last_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.user?.email?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesDepartment = !filters.department || 
      employee.department?.name === filters.department;
    
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'active' && employee.is_active) ||
      (filters.status === 'inactive' && !employee.is_active);
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });
};

export default employeeSlice.reducer;