interface ErrorContext {
  user?: {
    id: string;
    email: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

export class ErrorTracker {
  private context: ErrorContext = {};

  constructor() {
    this.setupGlobalHandlers();
  }

  private setupGlobalHandlers() {
    window.onerror = (message, source, lineno, colno, error) => {
      this.captureError(error || new Error(message as string));
    };

    window.onunhandledrejection = (event) => {
      this.captureError(event.reason);
    };
  }

  public setUser(user: ErrorContext['user']) {
    this.context.user = user;
  }

  public setTags(tags: ErrorContext['tags']) {
    this.context.tags = { ...this.context.tags, ...tags };
  }

  public setExtra(extra: ErrorContext['extra']) {
    this.context.extra = { ...this.context.extra, ...extra };
  }

  public async captureError(error: Error, context?: ErrorContext) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      type: error.name,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      context: {
        ...this.context,
        ...context,
      },
    };

    // Log to Supabase
    await supabase.from('error_logs').insert(errorData);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Captured error:', errorData);
    }
  }

  public async captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    await supabase.from('error_logs').insert({
      message,
      level,
      timestamp: new Date().toISOString(),
      context: this.context,
    });
  }
}

export const errorTracker = new ErrorTracker(); 