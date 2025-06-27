---
title: "React Tips và Tricks"
date: "2025-06-26"
author: "Nguyễn Phúc Nhân"
description: "Những mẹo hữu ích khi làm việc với React.js mà mọi developer nên biết."
tags: ["react", "javascript", "tips", "performance"]
cover: "/images/react-tips.jpg"
---

# React Tips và Tricks cho Developer 🚀

Sau nhiều năm làm việc với React, tôi muốn chia sẻ một số tips và tricks hữu ích mà tôi đã học được.

## 1. Sử dụng React.memo() để tối ưu performance

```jsx
import React, { memo } from 'react';

const ExpensiveComponent = memo(({ data, onUpdate }) => {
  console.log('Component re-rendered');
  
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
});

export default ExpensiveComponent;
```

## 2. Custom Hooks cho logic tái sử dụng

```jsx
import { useState, useEffect } from 'react';

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

// Sử dụng
const MyComponent = () => {
  const [name, setName] = useLocalStorage('name', '');
  
  return (
    <input 
      value={name} 
      onChange={(e) => setName(e.target.value)} 
    />
  );
};
```

## 3. Conditional Rendering thông minh

```jsx
// ❌ Không tốt
{user && user.name && <div>{user.name}</div>}

// ✅ Tốt hơn
{user?.name && <div>{user.name}</div>}

// ✅ Hoặc
{user?.name ? <div>{user.name}</div> : <div>Guest</div>}
```

## 4. Error Boundaries

```jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Oops! Something went wrong.</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 5. Lazy Loading Components

```jsx
import React, { Suspense, lazy } from 'react';

const LazyComponent = lazy(() => import('./HeavyComponent'));

const App = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    </div>
  );
};
```

## Kết luận

Những tips này sẽ giúp code React của bạn sạch hơn, nhanh hơn và dễ maintain hơn. Hãy thực hành và áp dụng vào dự án thực tế!

---

*Happy coding! 💻*
