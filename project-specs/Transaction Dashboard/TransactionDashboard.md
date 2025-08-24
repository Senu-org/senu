# Transaction Dashboard Specification

## Task Description

The goal is to create a new dashboard within the application that displays all internal app transactions for the user. This dashboard should present comprehensive information about each transaction. We will leverage Envio (https://envio.dev/) as the indexer to fetch blockchain data. The dashboard will feature multiple tabs for organization and a robust table to display transaction details. Additionally, it will connect to the Monad explorer for external transaction verification. The application must maintain its mobile-first design principle.

## To-Do List

- [ ] **Define Data Requirements:** Identify all necessary transaction data fields from Envio and Monad explorer.
  - [x] Review Envio documentation for available transaction data.
  - [ ] Research Monad explorer API for additional transaction details (e.g., block confirmations, gas fees).
  - [x] Document required fields in a structured format (e.g., JSON schema, table).
- [x] **Design API Endpoints:** Create new API endpoints (or modify existing ones) to fetch transaction data from the Envio indexer and potentially the Monad explorer.
  - [x] Design a new `GET /api/transactions/list` endpoint to fetch a list of transactions.
  - [ ] Define query parameters for filtering (e.g., `status`, `type`, `dateRange`).
  - [ ] Consider pagination for large datasets.
  - [x] API endpoint specifications with example requests and responses.
- [x] **Implement Data Fetching Logic:** Develop services to interact with the defined API endpoints and retrieve transaction data.
  - [x] Create a `TransactionService` to handle calls to the Envio indexer.
  - [ ] Implement data mapping and transformation from Envio's format to our internal `Transaction` interface.
  - [ ] Add caching mechanisms for frequently accessed data to improve performance.
  - [x] Implemented `TransactionService` and related utility functions.
- [ ] **Design Dashboard UI (Mobile-First):**
  - [ ] **Layout:** Sketch out the overall mobile-first layout of the dashboard, including header, navigation (tabs), and transaction display area.
    - [ ] Create wireframes and mockups focusing on mobile responsiveness.
  - [ ] **Tabs:** Define the different tabs (e.g., "All Transactions", "Sent", "Received", "Pending", "Completed").
    - [ ] Determine the data source and filtering logic for each tab.
  - [x] **Transaction Table:** Design a responsive and informative table component to display transaction details, considering mobile screen limitations.
    - [x] Design table columns (e.g., Transaction ID, Date, Type, Amount, Status).
    - [ ] Implement truncation or horizontal scrolling for wider tables on smaller screens.
  - [x] UI/UX designs (wireframes, mockups) for the dashboard (basic table).
- [x] **Develop Frontend Components:**
  - [x] Create React components for the dashboard, including tab navigation and the transaction table.
    - [x] Develop `TransactionDashboard` component as the main container (`web/app/transactions/page.tsx`).
    - [ ] Create `TransactionTabs` component for navigation.
    - [x] Implement `TransactionTable` component to display data (inline in `page.tsx`).
  - [x] Implement state management for transaction data and UI interactions.
    - [x] Use React hooks (`useState`, `useEffect`) for local state management.
    - [ ] Integrate a global state management solution (e.g., Zustand, React Query) for fetching and caching transaction data.
  - [x] Implemented React components for the dashboard.
- [x] **Integrate Envio Data:** Connect the frontend to the backend services to display data fetched from Envio.
  - [x] Call the `GET /api/transactions/list` endpoint from the frontend components.
  - [x] Render the fetched transaction data in the `TransactionTable`.
  - [x] Dashboard displaying real transaction data.
- [x] **Integrate Monad Explorer (Optional/Stretch Goal):** If feasible, provide links or integrate relevant transaction details from the Monad explorer.
  - [x] Research Monad explorer deep linking capabilities.
  - [x] Add a "View on Explorer" button/link for each transaction.
  - [x] Links to Monad explorer for individual transactions.
- [ ] **Implement Filtering and Sorting:** Add functionality to filter and sort transactions based on various criteria (e.g., date, amount, type).
  - [ ] Add filter controls (e.g., date pickers, type dropdowns) to the UI.
  - [ ] Implement sorting logic in the frontend or leverage backend sorting if available.
  - [ ] Update API calls with filter and sort parameters.
  - [ ] Functional filtering and sorting for transactions.
- [x] **Error Handling and Loading States:** Implement robust error handling and display appropriate loading states during data fetching.
  - [x] Display loading spinners or skeleton loaders during data fetch.
  - [ ] Implement error boundaries for UI components.
  - [x] Show user-friendly error messages for API failures.
  - [x] Graceful handling of loading and error states.
- [ ] **Testing:** Conduct thorough testing of the dashboard across different devices and scenarios.
  - [ ] Write unit tests for React components and services.
  - [ ] Implement integration tests for API endpoints.
  - [ ] Perform manual testing on various mobile devices and browsers.
  - [ ] Comprehensive test suite and successful test execution.
- [ ] **Documentation:** Document the new components, services, and API endpoints.
  - [ ] Update `README.md` with instructions on how to set up and run the dashboard.
  - [ ] Add inline comments to complex code sections.
  - [ ] Up-to-date documentation for the transaction dashboard.

## Implementation Details

### Backend (Next.js API Routes)

*   **`web/app/api/transactions/list/route.ts`**: This API route will be responsible for fetching transaction data.
    *   [x] It will accept query parameters for filtering and pagination (though filtering/pagination is not fully implemented yet).
    *   [x] It will call an internal service (e.g., `web/lib/services/transaction.ts`) to retrieve data from Envio.
    *   [x] **Dependencies:** Envio SDK/Client.
*   **`web/lib/services/transaction.ts`**: This service will encapsulate the logic for interacting with the Envio indexer.
    *   [x] It will contain functions to fetch raw transaction data and transform it into a format suitable for the frontend (specifically `getTransactionsByPhoneNumber`).
    *   [x] **Dependencies:** Envio SDK/Client.
*   **`indexer`**: The Envio indexer is set up in this directory at the project root.
    *   [x] The indexer was initialized using `pnpx envio init`.
    *   [x] Dependencies were installed manually with `yarn install` due to a pnpm/yarn conflict.

### Frontend (React Components)

*   **`web/app/transactions/page.tsx`**: This will be the main page component for the transaction dashboard.
    *   [x] It will orchestrate data fetching, state management, and rendering of child components.
*   **`web/components/transactions/TransactionDashboard.tsx` (New)**: A new component to serve as the container for the dashboard.
    *   [ ] Will include the tab navigation and the transaction table.
*   **`web/components/transactions/TransactionTabs.tsx` (New)**: A new component for tab-based navigation (e.g., All, Sent, Received).
*   **`web/components/transactions/TransactionTable.tsx` (New)**: A new component to display the list of transactions in a responsive table format.
    *   [x] A basic table implementation is present within `web/app/transactions/page.tsx`.
*   **`web/lib/interfaces/ITransactionRepository.ts` (New)**: An interface to define the contract for transaction data access.
*   **`web/lib/repository/EnvioTransactionRepository.ts` (New)**: A concrete implementation of `ITransactionRepository` that interacts with the Envio indexer.

### Data Models

*   **`web/lib/types/index.ts`**: Define `Transaction` interface with fields like `id`, `date`, `type`, `amount`, `status`, `sender`, `recipient`, `explorerUrl`.
    *   [x] `ITransaction` is defined and used, including `id`, `type`, `amount`, `currency`, `status`, `timestamp`, `blockchainTxId`, `monadExplorerUrl`.

### Technology Stack

*   **Frontend:** Next.js, React, Tailwind CSS
*   **Backend:** Next.js API Routes
*   **Data Indexer:** Envio (https://envio.dev/)
*   **Blockchain Explorer:** Monad Explorer
*   **State Management (Frontend):** React Query (for data fetching and caching), Zustand (for global UI state)

### Mock Data (for initial development)

*   [ ] Consider creating a mock API endpoint or a mock `EnvioTransactionRepository` to enable parallel frontend and backend development.