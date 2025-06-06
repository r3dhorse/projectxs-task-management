# Test Suite Documentation

This directory contains comprehensive tests for the task management application.

## Test Structure

```
src/__tests__/
├── auth/                    # Authentication tests
├── tasks/                   # Task management tests
├── workspaces/             # Workspace management tests
├── utils/                  # Utility function tests
├── test-utils/             # Test utilities and helpers
├── example.test.tsx        # Basic example test
├── log-in-page.test.tsx    # Login page integration test
└── README.md               # This file
```

## Test Categories

### 1. Authentication Tests (`auth/`)
- **sign-in.test.tsx**: Tests for sign-in form functionality
  - Form rendering and validation
  - User input handling
  - Form submission
  - Error handling

### 2. Task Management Tests (`tasks/`)
- **task-form.test.tsx**: Tests for task creation and editing forms
  - Form validation
  - Field interactions
  - Data submission
  - Loading states
- **kanban.test.tsx**: Tests for Kanban board functionality
  - Column rendering
  - Task display
  - Drag and drop operations
  - Empty states

### 3. Workspace Tests (`workspaces/`)
- **create-workspace.test.tsx**: Tests for workspace creation
  - Form validation
  - Workspace creation flow
  - Error handling
  - Loading states

### 4. Utility Tests (`utils/`)
- **validation.test.tsx**: Tests for validation schemas
  - User data validation
  - Workspace data validation
  - Task data validation
  - Error message verification

### 5. Integration Tests
- **log-in-page.test.tsx**: End-to-end login flow testing
- **example.test.tsx**: Basic component testing examples

## Test Utilities

### Custom Render Function
```typescript
import { render, screen, userEvent } from '@/test-utils'

// Renders components with React Query provider
render(<YourComponent />)
```

### Mock Data Factories
```typescript
import { mockUser, mockWorkspace, mockTask } from '@/test-utils'

// Use predefined mock data in tests
const user = mockUser
const workspace = mockWorkspace
```

### Common Patterns
```typescript
// Testing form submission
const user = userEvent.setup()
await user.type(screen.getByLabelText(/email/i), 'test@example.com')
await user.click(screen.getByRole('button', { name: /submit/i }))

// Testing async operations
await waitFor(() => {
  expect(mockFunction).toHaveBeenCalled()
})
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run specific test categories
```bash
npm test -- auth        # Authentication tests
npm test -- tasks       # Task management tests
npm test -- workspaces  # Workspace tests
```

### Run tests in watch mode
```bash
npm test:watch
```

### Generate coverage report
```bash
npm test:coverage
```

## Test Configuration

### Jest Configuration
- **Environment**: jsdom (for DOM testing)
- **Setup**: `jest.setup.js` includes `@testing-library/jest-dom`
- **Module mapping**: `@/*` paths mapped to `src/*`
- **Transform ignore**: Configured for ES modules in dependencies

### TypeScript Support
- Tests use TypeScript with strict typing
- Custom types for mock data and components
- Type-safe testing utilities

## Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mock Management
```typescript
beforeEach(() => {
  jest.clearAllMocks()
})
```

### 3. User-Centric Testing
- Test user interactions, not implementation details
- Use accessible queries (getByRole, getByLabelText)
- Test error states and edge cases

### 4. Async Testing
```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Success!')).toBeInTheDocument()
})
```

## Coverage Goals

The test suite aims to cover:
- ✅ Core user workflows (authentication, task management)
- ✅ Form validation and error handling
- ✅ Component rendering and interactions
- ✅ Data validation schemas
- ✅ Loading and error states

## Adding New Tests

### For Components
1. Create test file in appropriate category folder
2. Import test utilities from `@/test-utils`
3. Mock external dependencies
4. Test user interactions and edge cases

### For API Functions
1. Mock the API client
2. Test success and error scenarios
3. Verify query invalidation
4. Test loading states

### Example Test Structure
```typescript
import { render, screen, userEvent } from '@/test-utils'
import { YourComponent } from '@/components/your-component'

describe('YourComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<YourComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const user = userEvent.setup()
    render(<YourComponent />)
    
    await user.click(screen.getByRole('button'))
    
    expect(/* expected result */).toBeTruthy()
  })
})
```

## Troubleshooting

### Common Issues
1. **Import errors**: Check module paths and Jest configuration
2. **Async timing**: Use `waitFor` for async operations
3. **Mock issues**: Ensure mocks are properly set up and cleared
4. **TypeScript errors**: Check type definitions and imports

### Debug Tips
- Use `screen.debug()` to see rendered HTML
- Add `console.log` statements for debugging
- Check Jest console output for detailed error messages
- Use VS Code Jest extension for better debugging experience