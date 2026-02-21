export interface ClassifiedError {
  type: 'network' | 'timeout' | 'server' | 'validation' | 'config' | 'ocr';
  titleKey: string;
  messageKey: string;
  rawMessage: string;
  retryable: boolean;
}

export function classifyError(error: unknown): ClassifiedError {
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : String(error);

  // Network errors (TypeError from fetch failures)
  if (
    error instanceof TypeError &&
    (rawMessage.includes('Failed to fetch') ||
      rawMessage.includes('NetworkError'))
  ) {
    return {
      type: 'network',
      titleKey: 'errors.network.title',
      messageKey: 'errors.network.message',
      rawMessage,
      retryable: true,
    };
  }

  // Timeout errors
  if (
    rawMessage.includes('504') ||
    rawMessage.toLowerCase().includes('timed out') ||
    rawMessage.toLowerCase().includes('timeout')
  ) {
    return {
      type: 'timeout',
      titleKey: 'errors.timeout.title',
      messageKey: 'errors.timeout.message',
      rawMessage,
      retryable: true,
    };
  }

  // OCR-specific errors (503 for OCR service unavailable, OCR in message)
  if (rawMessage.includes('OCR') || rawMessage.includes('503') || rawMessage.includes('Scanned document')) {
    return {
      type: 'ocr',
      titleKey: 'errors.ocr.title',
      messageKey: 'errors.ocr.message',
      rawMessage,
      retryable: false,
    };
  }

  // Config errors (service not configured)
  if (
    rawMessage.includes('503') ||
    rawMessage.toLowerCase().includes('not configured') ||
    rawMessage.toLowerCase().includes('api key')
  ) {
    return {
      type: 'config',
      titleKey: 'errors.config.title',
      messageKey: 'errors.config.message',
      rawMessage,
      retryable: false,
    };
  }

  // Server errors
  if (
    rawMessage.includes('502') ||
    rawMessage.includes('Dify') ||
    rawMessage.includes('500')
  ) {
    return {
      type: 'server',
      titleKey: 'errors.server.title',
      messageKey: 'errors.server.message',
      rawMessage,
      retryable: true,
    };
  }

  // Validation errors
  if (
    rawMessage.includes('422') ||
    rawMessage.toLowerCase().includes('validation')
  ) {
    return {
      type: 'validation',
      titleKey: 'errors.validation.title',
      messageKey: 'errors.validation.message',
      rawMessage,
      retryable: false,
    };
  }

  // Default fallback
  return {
    type: 'server',
    titleKey: 'errors.unknown.title',
    messageKey: 'errors.unknown.message',
    rawMessage,
    retryable: true,
  };
}
