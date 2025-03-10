import React, { useState, useRef, useEffect } from 'react';
import useFormulaStore from '../store/useFormulaStore';
import useAutocomplete from '../hooks/useAutocomplete';
import evaluateFormula from '../utils/formulaEvaluator';
import '../styles/FormulaInput.css';

const OPERATORS = ['+', '-', '*', '/', '^', '(', ')'];

const FormulaInput = () => {
  const { formula, addToken, removeLastToken, removeTokenByIndex } = useFormulaStore();
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(null);
  const { suggestions, isLoading } = useAutocomplete(inputValue);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isNumber = (value) => /^\d+$/.test(value);
  const isOperator = (value) => OPERATORS.includes(value);

  const handleInputChange = (e) => {
    const value = e.target.value;
    const lastChar = value[value.length - 1];

    if (isOperator(lastChar)) {
      const numberPart = value.slice(0, -1).trim();
      if (numberPart) {
        if (isNumber(numberPart)) {
          addToken({ type: 'number', value: numberPart });
        } else if (suggestions.length) {
          addToken({ type: 'function', name: suggestions[0].name });
        }
      }
      addToken({ type: 'operator', value: lastChar });
      setInputValue('');
      return;
    }

    if (value.endsWith(' ')) {
      const trimmedValue = value.trim();
      if (isNumber(trimmedValue)) {
        addToken({ type: 'number', value: trimmedValue });
        setInputValue('');
      } else if (suggestions.length) {
        addToken({ type: 'function', name: suggestions[0].name });
        setInputValue('');
      }
      return;
    }

    setInputValue(value);
  };

  const handleKeyDown = (e) => {
    const trimmedValue = inputValue.trim();
    
    if (e.key === 'Enter' && trimmedValue) {
      if (isNumber(trimmedValue)) {
        addToken({ type: 'number', value: trimmedValue });
      } else if (suggestions.length) {
        addToken({ type: 'function', name: suggestions[0].name });
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue) {
      removeLastToken();
    } else if (e.key === 'Escape') {
      setShowDropdown(null);
    } else if (e.key === ' ' && trimmedValue) {
      if (isNumber(trimmedValue) || suggestions.length) {
        if (isNumber(trimmedValue)) {
          addToken({ type: 'number', value: trimmedValue });
        } else {
          addToken({ type: 'function', name: suggestions[0].name });
        }
        setInputValue('');
        e.preventDefault();
      }
    }
  };

  const renderToken = (token, index) => {
    if (token.type === 'operator') {
      return <span className="formula-token operator">{token.value}</span>;
    }

    if (token.type === 'number') {
      return <span className="formula-token number">{token.value}</span>;
    }

    return (
      <div 
        className="formula-token function"
        onClick={(e) => {
          e.stopPropagation();
          setShowDropdown(showDropdown === index ? null : index);
        }}
      >
        <span className="function-icon">ƒ</span>
        {token.name}
        {showDropdown === index && (
          <div className="dropdown-menu">
            <div className="dropdown-arrow" />
            <ul>
              <li onClick={(e) => {
                e.stopPropagation();
                removeTokenByIndex(index);
                setShowDropdown(null);
              }}>Delete</li>
              <li onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(null);
              }}>Edit</li>
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderSuggestions = () => {
    if (!inputValue || isOperator(inputValue) || isNumber(inputValue)) {
      return null;
    }

    if (isLoading) {
      return (
        <ul className="autocomplete">
          <li className="loading">Loading functions...</li>
        </ul>
      );
    }

    if (!suggestions.length) {
      return null;
    }

    return (
      <ul className="autocomplete">
        {suggestions.map((suggestion, index) => (
          <li 
            key={index}
            onClick={() => {
              addToken({ type: 'function', name: suggestion.name });
              setInputValue('');
              inputRef.current?.focus();
            }}
          >
            <span className="function-icon">ƒ</span>
            <div className="function-content">
              <div className="function-name">{suggestion.name}</div>
              <div className="function-description">{suggestion.description}</div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div ref={containerRef}>
      <div className="formula-container">
        {formula.map((token, index) => (
          <React.Fragment key={index}>
            {renderToken(token, index)}
          </React.Fragment>
        ))}
        <div className="input-wrapper">
          <input
            ref={inputRef}
            placeholder="Type a function name, number, or operator..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          {renderSuggestions()}
        </div>
      </div>

      <button onClick={() => {
        try {
          const result = evaluateFormula(formula);
          alert(`Result: ${result}`);
        } catch (error) {
          alert('Invalid formula: ' + error.message);
        }
      }}>
        Calculate
      </button>
    </div>
  );
};

export default FormulaInput;
