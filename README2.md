# Week 6: Testing and Debugging – Ensuring MERN App Reliability

## Objective

Implement comprehensive testing strategies for a MERN stack application, including unit testing, integration testing, and end-to-end testing, while also learning debugging techniques to identify and fix common issues.

---

## Test Scripts Example

```json
{
   "scripts": {
    "install-all": "npm install --prefix client && npm install --prefix server",
    "test:unit": "jest --testPathPattern=\"__tests__/.*\\.test\\.(js|jsx)$\"",
    "test:integration": "jest --testPathPatterns=integration",
    "test:unit:client": "cd client && npm test -- --testPathPattern=\"__tests__/.*\\.test\\.(js|jsx)$\"",
    "test:unit:server": "cd server && npm test -- --testPathPattern=\"__tests__/.*\\.test\\.js$\"",
    "test:unit:watch": "jest --watch --testPathPattern=\"__tests__/.*\\.test\\.(js|jsx)$\"",
    "test:coverage": "jest --coverage",
    "test:coverage:client": "jest --selectProjects client --coverage",
    "test:coverage:server": "jest --selectProjects server --coverage",
    "test:coverage:html": "jest --coverage --coverageReporters=html",
    "test:coverage:all": "npm run test:coverage && npm run coverage:screenshot",
    "coverage:screenshot": "node scripts/capture-coverage-screenshots.js",
    "coverage:open": "open coverage/lcov-report/index.html || start coverage/lcov-report/index.html",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:components": "jest src/components/__tests__",
    "test:utils": "jest src/utils/__tests__",
    "test:redux": "jest src/store/",
    "test:redux:watch": "jest src/store/ --watch",
    "test:redux:coverage": "jest src/store/ --coverage",
    "test:hooks": "jest src/hooks/",
    "test:hooks:watch": "jest src/hooks/ --watch",
    "test:hooks:coverage": "jest src/hooks/ --coverage",
    "test:middleware": "jest tests/middleware/ --verbose",
    "test:api": "jest server/tests/api/ --verbose --setupFilesAfterEnv=./server/tests/setup-api.js",
    "test:api:simple": "jest server/tests/api/ --verbose",
    "test:api:auth": "jest server/tests/api/auth.test.js --verbose",
    "test:api:users": "jest server/tests/api/users.test.js --verbose",
    "test:api:posts": "jest server/tests/api/posts.test.js --verbose",
    "test:api:general": "jest server/tests/api/general.test.js --verbose",
    "test:auth": "jest server/tests/integration/auth-flow.test.js --verbose --forceExit --testTimeout=30000",
    "test:auth-edge": "jest server/tests/integration/auth-edge-cases.test.js --verbose --forceExit --testTimeout=30000",
    "test:auth-perf": "jest server/tests/integration/auth-performance.test.js --verbose --forceExit --testTimeout=60000",
    "test:auth-all": "jest server/tests/integration/auth-*.test.js --verbose --forceExit --testTimeout=30000",
    "test:form-validation": "jest server/tests/integration/form-validation.test.js --verbose --forceExit --testTimeout=30000",
    "test:client-forms": "jest client/src/tests/components/FormValidation.test.jsx --verbose",
    "test:validation-utils": "jest client/src/tests/utils/validation.test.js --verbose",
    "test:form-hooks": "jest client/src/tests/hooks/useForm.test.js --verbose",
    "test:forms-all": "npm run test:form-validation && npm run test:client-forms && npm run test:validation-utils && npm run test:form-hooks"
  },
}
```

---

## Code Coverage Report (Screenshot Placeholder)

# Components unit test

<img width="849" height="480" alt="Screenshot 2025-11-13 214433" src="https://github.com/user-attachments/assets/2326ff57-2294-4528-8e2c-1743b107fef9" />

# Middleware unit tests

<img width="856" height="304" alt="Screenshot 2025-11-13 222832" src="https://github.com/user-attachments/assets/a0392326-dd1b-4b8c-99d1-4d7df11b6f8e" />

# Redux reducers tests


<img width="857" height="434" alt="Screenshot 2025-11-13 225756" src="https://github.com/user-attachments/assets/c42abf00-248e-4b0f-ae5c-251073ad6d95" />

# Hooks

<img width="829" height="428" alt="Screenshot 2025-11-13 210711" src="https://github.com/user-attachments/assets/6158c56a-4314-4ce5-9fd9-9ff1bc8cf67c" />

# Integration tests


<img width="867" height="550" alt="Screenshot 2025-11-14 010420" src="https://github.com/user-attachments/assets/14b0332b-d8c8-4e62-aa82-d9d274dcf18c" />


---

# Debugging Techniques Implemented

## Browser Developer Tools

Tools used:

- React DevTools → inspect component state/props

- Network Panel → check API response errors (401, 404, 500)

- Console → track warnings and logs

- Performance tab → detect slow renders

## Performance Monitoring & Optimization

React example: memoizing to prevent unnecessary re-renders

import React, { memo } from "react";

const UserCard = ({ user }) => {
  console.log("Rendered UserCard");
  return <div>{user.name}</div>;
};

export default memo(UserCard);


---

##  Testing Strategy Summary

### Introduction

The goal of this testing strategy is to ensure that all features in the MERN stack application work correctly, securely, and efficiently. By applying multiple testing levels (unit, integration, and E2E tests), we reduce bugs early, increase reliability, and improve user experience.

### Testing Levels & Tools

| Testing Level       | Purpose                         | Tools Used                        | What is Tested                |
| ------------------- | ------------------------------- | --------------------------------- | ----------------------------- |
| Unit Testing        | Validate smallest parts of code | Jest + React Testing Library      | Functions, components, Redux  |
| Integration Testing | Ensure modules work together    | Jest + Supertest                  | API endpoints, DB operations  |
| End-to-End Testing  | Simulate real user behavior     | Cypress                           | Login, routing, CRUD UI flows |
| Debugging           | Identify & fix issues           | DevTools, logging, error handlers | Client + server               |

### Test Coverage Goals

* Minimum **70%** overall code coverage
* Focus coverage on authentication, CRUD processes, and database logic
* Ensure React components render expected UI changes

### Scope of Testing

* JWT authentication flow (protected routes)
* Express API endpoints and database queries
* React components interacting with backend
* Redux reducers + actions
* Navigation and error handling
* Form validation
* Critical CRUD operations

### Out of Scope

* Load and performance testing
* Cross-browser compatibility testing
* CSS responsiveness and UI styling

### Testing Workflow

1. Unit tests run during development after each feature
2. Integration tests run before merging code
3. E2E tests run before deployment
4. Debugging applied after test failures or exceptions

### Tools Configuration Summary

* **Jest** → Backend + frontend unit tests
* **React Testing Library** → DOM behavior testing
* **Supertest** → Testing server APIs
* **Cypress** → Testing user flows
* **MongoDB Memory Server** → Isolated database environment
* **ESLint** → Code quality maintenance

### Expected Outcomes

* Early detection of bugs before reaching production
* Stable and secure authentication mechanisms
* Reliable CRUD functionality
* Improved confidence in UI and backend behavior

---

