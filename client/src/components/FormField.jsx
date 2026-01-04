import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function FormField({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  tooltipText, 
  options = null, 
  rows,
  minWords,
  minChars,
  maxChars,
  error,
  required = false,
  guideText,
  accept,
  disabled = false,
  min,
  max
}) {
  
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {tooltipText}
    </Tooltip>
  );

  // Count words in text
  const countWords = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Count characters
  const charCount = value ? value.length : 0;
  const wordCount = rows ? countWords(value) : 0;

  // Validation status
  const isValid = () => {
    if (error) return false;
    if (required && !value) return false;
    if (minChars && charCount < minChars) return false;
    if (minWords && wordCount < minWords) return false;
    if (maxChars && charCount > maxChars) return false;
    return true;
  };

  const showValidation = value && (minWords || minChars || maxChars || required);
  const isValidField = showValidation ? isValid() : true;

  return (
    <div className="mb-3">
      <label className="form-label fw-bold" style={{ fontSize: '0.9rem' }}>
        {label}
        {required && <span className="text-danger ms-1">*</span>}
        {tooltipText && (
          <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={renderTooltip}>
            <i className="bi bi-info-circle-fill info-tooltip"></i>
          </OverlayTrigger>
        )}
      </label>

      {/* Guide Text */}
      {guideText && (
        <div className="alert alert-light border-start border-3 border-info py-2 px-3 mb-2" style={{fontSize: '0.85rem'}}>
          <i className="bi bi-lightbulb-fill text-info me-2"></i>
          {guideText}
        </div>
      )}
      
      {/* Render Select Box if options provided */}
      {options ? (
        <select 
          className={`form-select ${error ? 'is-invalid' : ''}`} 
          value={value} 
          onChange={onChange}
          required={required}
        >
          <option value="">Select an option...</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : rows ? (
        <div>
          <textarea 
            className={`form-control ${error ? 'is-invalid' : isValidField ? 'is-valid' : ''}`}
            rows={rows} 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder}
            required={required}
            maxLength={maxChars}
          />
          {/* Character/Word Counter */}
          {(minWords || minChars || maxChars) && (
            <div className="d-flex justify-content-between mt-1">
              <small className={isValidField ? 'text-success' : 'text-danger'}>
                {minWords && (
                  <span>
                    <i className={`bi ${wordCount >= minWords ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                    {' '}Words: {wordCount} / {minWords} minimum
                  </span>
                )}
                {!minWords && minChars && (
                  <span>
                    <i className={`bi ${charCount >= minChars ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                    {' '}Characters: {charCount} / {minChars} minimum
                  </span>
                )}
              </small>
              {maxChars && (
                <small className={charCount > maxChars ? 'text-danger' : 'text-muted'}>
                  {charCount} / {maxChars} max
                </small>
              )}
            </div>
          )}
        </div>
      ) : type === 'file' ? (
        <input 
          type="file" 
          className={`form-control ${error ? 'is-invalid' : ''}`}
          onChange={onChange} 
          required={required}
          accept={accept}
        />
      ) : (
        <input 
          type={type} 
          className={`form-control ${error ? 'is-invalid' : ''} ${disabled ? 'bg-light' : ''}`}
          value={value || ''} 
          onChange={onChange} 
          placeholder={placeholder}
          required={required}
          maxLength={maxChars}
          disabled={disabled}
          min={min}
          max={max}
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="invalid-feedback d-block">
          <i className="bi bi-exclamation-triangle-fill me-1"></i>
          {error}
        </div>
      )}

      {/* Validation Help Text */}
      {showValidation && !error && !isValidField && (
        <small className="text-warning">
          {minWords && wordCount < minWords && (
            <span>Please write at least {minWords} words</span>
          )}
          {minChars && !minWords && charCount < minChars && (
            <span>Please enter at least {minChars} characters</span>
          )}
        </small>
      )}
    </div>
  );
}
