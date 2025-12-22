# React Error #310 Fix Guide

## What is React Error #310?

React Error #310 means "Rendered more hooks than during the previous render". This happens when the number of hooks called changes between renders, violating React's Rules of Hooks.

## Common Causes

1. **Conditional Hook Calls**: Hooks called inside `if` statements
2. **Early Returns Before Hooks**: Returning early before all hooks are called
3. **Hooks in Loops**: Hooks called inside loops
4. **Server/Client Hydration Mismatches**: Different hook counts between SSR and client render

## Fixes Applied

### 1. FirebaseErrorListener Component
- **Problem**: Component was conditionally rendered based on `NODE_ENV`
- **Fix**: Always render the component, but only activate error listener in development

### 2. CookieConsent Component
- **Problem**: Used `localStorage` which isn't available during SSR, causing hydration mismatch
- **Fix**: Added `mounted` state to prevent rendering until client-side hydration

### 3. useDoc Hook Dependency
- **Problem**: Used `ref?.path` in dependency array which could be undefined
- **Fix**: Use `ref` directly in dependency array

### 4. useCollection Hook Dependency
- **Problem**: Used `JSON.stringify(query)` which creates new strings on every render
- **Fix**: Use `query` directly in dependency array

## How to Debug

If you still see React Error #310:

1. **Check Browser Console**: Look for the full error message with component stack
2. **Enable Development Mode**: The error message will be more detailed
3. **Check for Conditional Hooks**: Search for patterns like:
   ```javascript
   if (condition) {
     const [state, setState] = useState();
   }
   ```
4. **Check for Early Returns**: Look for `return null` or `return <Component>` before all hooks are called
5. **Check Server/Client Differences**: Ensure components render the same on server and client

## Prevention

- Always call hooks at the top level of components
- Never call hooks conditionally
- Never call hooks in loops
- Use `useEffect` for conditional logic, not conditional hook calls
- Ensure client-only code (like `localStorage`) is wrapped in `useEffect` or `useState` with mounted check

## Testing

After applying fixes:
1. Clear browser cache
2. Restart development server
3. Hard reload the page (Ctrl+Shift+R or Cmd+Shift+R)
4. Check browser console for errors

