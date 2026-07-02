@AGENTS.md
# xDoit Mobile - AI Development Guide

## Project Overview

xDoit is a React Native mobile application built using:

* Expo Bare Workflow (No Prebuild)
* React Native
* React Navigation
* Zustand
* TanStack Query
* Axios
* AsyncStorage
* Reanimated
* Bottom Sheet
* Expo Modules where useful

The project follows a feature-first architecture.

The primary goal is maintainability, simplicity, and predictable code organization.

---

# Core Architecture Principles

## 1. Feature First

Business logic belongs inside features.

Example:

```text
features/
├── auth/
├── home/
├── upload/
├── pending/
├── progress/
├── completed/
```

Everything related to a feature should live inside that feature whenever possible.

Bad:

```text
screens/
hooks/
api/
```

Good:

```text
features/
└── upload/
    ├── screen/
    ├── components/
    ├── hooks/
    ├── data/
```

---

## 2. Shared Code Lives Outside Features

Reusable code belongs in shared folders.

```text
src/
├── ui/
├── hooks/
├── services/
├── constants/
├── utils/
```

Feature-specific code should NOT be moved to shared folders unless reused by multiple features.

---

## 3. Keep Screens Thin

Screens should primarily:

* render UI
* handle navigation
* connect hooks

Screens should NOT:

* perform API requests directly
* contain large business logic
* manipulate AsyncStorage
* contain reusable UI

Bad:

```js
const response = await axios.get(...)
```

inside a screen.

Good:

```js
const { data } = useAssignments()
```

---

# Folder Structure

Recommended structure:

```text
src/
├── assets/
├── ui/
├── constants/
├── features/
├── hooks/
├── navigation/
├── services/
├── store/
├── utils/
```

---

# UI Folder Rules

Shared visual components belong in:

```text
ui/
```

Examples:

```text
ui/
├── Button/
├── Input/
├── Header/
├── Wrapper/
├── EmptyState/
├── Loader/
├── Sheet/
```

Requirements:

* reusable
* no business logic
* no feature-specific knowledge

Bad:

```text
ui/
└── PendingAssignmentCard
```

Good:

```text
features/pending/components/PendingAssignmentCard
```

---

# Feature Folder Rules

A feature may contain:

```text
feature/
├── api/
├── components/
├── data/
├── hooks/
├── screen/
├── store/
├── helpers/
```

Only create folders when needed.

Do not create empty folders.

---

# API Rules

API functions should never live inside screens.

All API calls go through:

```text
services/client.js
```

using the shared Axios instance.

Example:

```js
export const apiGetUser = async () => {
  const response = await API_CLIENT.get(...)
  return response.data
}
```

API functions should:

* be small
* return transformed data when useful
* not contain UI logic

Never show Toasts inside API functions.

Never navigate inside API functions.

---

# Shared API Organization

As the application grows, move toward:

```text
src/api/
├── auth.js
├── assignments.js
├── notifications.js
├── users.js
```

Feature-level API folders are acceptable for smaller features.

Use whichever keeps code easier to discover.

---

# State Management

## Zustand

Use Zustand for:

* authentication
* theme
* user session
* application state

Examples:

```text
auth user
selected workspace
theme mode
```

Do NOT use Zustand for server data.

---

## TanStack Query

Use React Query for:

* API data
* pagination
* caching
* mutations
* optimistic updates

Examples:

```text
assignments
notifications
profile data
banner data
```

React Query owns server state.

---

# AsyncStorage Rules

AsyncStorage access should be centralized.

Preferred locations:

```text
features/auth/storage/
```

or

```text
services/
```

Screens should not directly read or write storage.

---

# Navigation Rules

Navigation belongs inside:

```text
navigation/
```

Structure:

```text
navigation/
├── AuthNavigator.js
├── UserNavigator.js
├── RootNavigator.js
```

Root navigator decides:

```js
authenticated ?
  UserNavigator :
  AuthNavigator
```

Avoid navigation logic scattered throughout the app.

---

# Component Rules

Components should:

* receive data via props
* be reusable when possible
* avoid unnecessary state

Prefer:

```js
const UserCard = ({ user })
```

instead of accessing global stores directly.

---

# Styling Rules

Use React Native StyleSheet.

```js
const styles = StyleSheet.create({})
```

Do not use inline styles except:

* small dynamic values
* animation values

Example:

```js
style={{ opacity }}
```

acceptable.

Large inline style objects are discouraged.

---

# Design Principles

The UI style favors:

* clean layouts
* generous spacing
* rounded corners
* subtle gradients
* minimal visual noise

Avoid:

* excessive shadows
* excessive colors
* deeply nested layouts

Keep interfaces simple.

---

# Naming Conventions

Components:

```text
CoolButton.js
ScreenHeader.js
```

PascalCase.

Hooks:

```text
useAuth.js
useBanner.js
```

Must start with:

```text
use
```

Stores:

```text
useAuthStore.js
themeStore.js
```

APIs:

```text
apiLogin
apiCreate
apiRefreshToken
```

Queries:

```text
useAssignmentProgress
useUserNotification
```

---

# Custom Hook Rules

Custom hooks belong in:

```text
hooks/
```

or

```text
feature/hooks/
```

Hooks should encapsulate:

* business logic
* query composition
* reusable behaviors

Hooks should not render UI.

---

# Query Rules

Query keys should be centralized when practical.

Prefer:

```js
['assignment', id]
```

over:

```js
['data']
```

Keys should be descriptive.

---

# Error Handling

Use:

```js
getApiErrorMessage()
```

for API errors.

UI feedback belongs in screens, hooks, or mutation callbacks.

Avoid showing raw server messages.

---

# Performance Rules

Prefer:

* memoized callbacks when needed
* FlatList over ScrollView for long lists
* React Query caching
* reusable shared components

Avoid premature optimization.

Optimize only when measurable.

---

# Reanimated Rules

Use Reanimated for:

* screen transitions
* entry animations
* gesture interactions

Keep animations subtle.

Avoid distracting motion.

---

# Code Philosophy

Priorities:

1. Readability
2. Simplicity
3. Predictability
4. Performance

A slightly longer but clearer solution is preferred over a shorter clever solution.

Future maintainers and AI agents should be able to understand code immediately.

When adding new code:

* follow existing patterns
* keep files focused
* avoid unnecessary abstractions
* prefer consistency over innovation

If uncertain, match the style already used within the nearest feature.
