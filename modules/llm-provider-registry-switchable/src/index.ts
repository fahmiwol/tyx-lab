/**
 * LLM Provider Registry — Switchable
 * Declarative registry for multiple LLM providers with fallback support
 * Version: 1.0.0
 */

export interface LLMProvider {
  id: string;
  name: string;
  category: 'free-curated' | 'paid-custom' | 'custom';
  baseUrl: string;
  tokenField: string;
  models: string[];
  tasks: string[];
  note: string;
}

// Registry of all supported providers
const providers: LLMProvider[] = [
  {
    id: 'openrouter-free',
    name: 'OpenRouter Free/Curated',
    category: 'free-curated',
    baseUrl: 'https://openrouter.ai/api/v1',
    tokenField: 'OPENROUTER_API_KEY',
    models: ['meta-llama/llama-3.1-8b-instruct:free', 'google/gemma-2-9b-it:free'],
    tasks: ['prompt', 'metadata', 'keywords', 'qa'],
    note: 'Use user API token; free model availability can change.',
  },
  {
    id: 'github-models',
    name: 'GitHub Models',
    category: 'free-curated',
    baseUrl: 'https://models.github.ai/inference',
    tokenField: 'GITHUB_TOKEN',
    models: ['openai/gpt-4.1-mini', 'meta/Llama-3.1-8B-Instruct'],
    tasks: ['prompt', 'metadata', 'keywords'],
    note: 'Requires GitHub token and available model access.',
  },
  {
    id: 'huggingface',
    name: 'Hugging Face Inference Providers',
    category: 'free-curated',
    baseUrl: 'https://router.huggingface.co',
    tokenField: 'HF_TOKEN',
    models: ['auto', 'meta-llama/Llama-3.1-8B-Instruct'],
    tasks: ['prompt', 'metadata', 'keywords', 'qa'],
    note: 'Uses HF token; provider auto-routing can be enabled.',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'paid-custom',
    baseUrl: 'https://api.openai.com/v1',
    tokenField: 'OPENAI_API_KEY',
    models: ['gpt-4.1-mini', 'gpt-4o-mini'],
    tasks: ['prompt', 'metadata', 'keywords', 'qa'],
    note: 'Paid/custom provider option.',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    category: 'paid-custom',
    baseUrl: 'https://api.anthropic.com',
    tokenField: 'ANTHROPIC_API_KEY',
    models: ['claude-3-5-haiku-latest'],
    tasks: ['metadata', 'keywords', 'qa'],
    note: 'Paid/custom provider option.',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    category: 'paid-custom',
    baseUrl: 'https://generativelanguage.googleapis.com',
    tokenField: 'GEMINI_API_KEY',
    models: ['gemini-1.5-flash', 'gemini-2.0-flash'],
    tasks: ['prompt', 'metadata', 'keywords'],
    note: 'Paid/custom provider option.',
  },
  {
    id: 'custom-openai-compatible',
    name: 'Custom OpenAI-Compatible',
    category: 'custom',
    baseUrl: '',
    tokenField: 'CUSTOM_API_KEY',
    models: [],
    tasks: ['prompt', 'metadata', 'keywords', 'qa'],
    note: 'User provides base URL, token, and model ID.',
  },
];

/**
 * Get all providers in the registry
 */
export function getProviders(): LLMProvider[] {
  return providers.slice();
}

/**
 * Get a single provider by ID
 */
export function getProvider(id: string): LLMProvider | undefined {
  return providers.find((p) => p.id === id);
}

export interface ProviderLookup {
  byId: Map<string, LLMProvider>;
  byTask: Map<string, LLMProvider[]>;
  byCategory: Map<string, LLMProvider[]>;
}

/**
 * Build a lookup index for fast provider querying
 */
export function buildLookup(): ProviderLookup {
  const byId = new Map<string, LLMProvider>();
  const byTask = new Map<string, LLMProvider[]>();
  const byCategory = new Map<string, LLMProvider[]>();

  for (const provider of providers) {
    byId.set(provider.id, provider);

    for (const task of provider.tasks) {
      if (!byTask.has(task)) {
        byTask.set(task, []);
      }
      byTask.get(task)!.push(provider);
    }

    if (!byCategory.has(provider.category)) {
      byCategory.set(provider.category, []);
    }
    byCategory.get(provider.category)!.push(provider);
  }

  return { byId, byTask, byCategory };
}

/**
 * Get available providers for a specific task
 */
export function getProvidersForTask(task: string): LLMProvider[] {
  const lookup = buildLookup();
  return lookup.byTask.get(task) || [];
}

/**
 * Get providers by category
 */
export function getProvidersByCategory(
  category: 'free-curated' | 'paid-custom' | 'custom'
): LLMProvider[] {
  const lookup = buildLookup();
  return lookup.byCategory.get(category) || [];
}

/**
 * Add a custom provider to the registry (runtime)
 */
export function registerCustomProvider(provider: LLMProvider): void {
  if (!providers.find((p) => p.id === provider.id)) {
    providers.push(provider);
  }
}
