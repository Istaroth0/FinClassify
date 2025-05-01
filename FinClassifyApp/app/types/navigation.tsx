// c:\Users\scubo\OneDrive\Documents\FC_proj\FinClassify\FinClassifyApp\types\navigation.ts

/**
 * Type definition for the navigation stack parameters.
 * Maps route names to the parameters they expect.
 * `undefined` means the screen expects no parameters.
 */
export type RootStackParamList = {
  index: undefined;
  record: undefined;
  transactions: undefined; // Assuming no params needed for modal presentation
  Accounts: undefined;
  CreateAccounts: { accountId?: string }; // Can receive an optional accountId for editing
  Budgets: undefined;
  analysis: undefined;
  signup: undefined; // Added based on usage in index.tsx
  profile: undefined; // Added based on usage in headertopnav.tsx
  // Add other screens here if they are part of the main stack
};

// Augment the React Navigation namespace to use our defined param list globally
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
