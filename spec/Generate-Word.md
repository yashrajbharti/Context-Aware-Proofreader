# Generate Word API

This specification defines the **core AI innovation** behind intelligent context-aware systems: automatic topic detection and domain-specific vocabulary generation.

## Purpose

This API provides fundamental AI capabilities for text analysis and vocabulary generation. It demonstrates how AI can:

1. **Analyze any text** and detect its topic/domain
2. **Generate relevant vocabulary** for that specific context
3. **Build specialized dictionaries** automatically

## Core Innovation

The key insight is that AI can understand context and generate appropriate vocabulary for any domain:

- **Input**: "I love Pikachu and think Charizard is awesome in Pokemon battles."
- **AI Detects**: Topic = "pokemon" (95% confidence)
- **AI Generates**: All Pokemon names + Pokemon-related terms
- **Result**: 1000+ contextually relevant words

## How It Works

1. **Topic Detection**: AI analyzes input text using advanced language understanding
2. **Context Generation**: AI generates domain-specific vocabulary using prompt engineering
3. **Special Handling**: Pokemon topic loads complete database (1025+ names)
4. **Smart Combination**: Merges AI-generated words with detected keywords

## Supported Topics

- **Pokemon**: Complete database + AI-generated Pokemon terms
- **Technology**: APIs, frameworks, tools, programming languages
- **Medicine**: Medical terminology, drug names, procedures
- **Sports**: Teams, players, leagues, sporting terms
- **Entertainment**: Shows, characters, platforms, gaming
- **Science**: Scientific terms, elements, research vocabulary
- **Business**: Corporate terms, financial abbreviations
- **Fiction**: Character names, fantasy terms, book titles
- **Acronym**: Abbreviations, organizational terms

## Applications

This core technology enables:

- **Smart Spell Checkers**: Never flag legitimate domain terms
- **Context-Aware Autocomplete**: Suggest relevant vocabulary
- **Dynamic Dictionaries**: Auto-build for any specialty field
- **Content Analysis Tools**: Understand document contexts
- **Writing Assistants**: Domain-intelligent suggestions

## API Features

- **Real-time Analysis**: Instant topic detection and word generation
- **Confidence Scoring**: See how certain the AI is about topics
- **Keyword Extraction**: View the words that led to topic classification
- **Complete Vocabulary**: See all generated words in organized display
- **Console Logging**: Inspect AI-generated words for debugging

## Technical Details

- **Pure Prompt API**: Uses Chrome's built-in Language Model
- **JSON Schema Constraints**: Structured AI responses
- **Pokemon Database Integration**: Loads comprehensive Pokemon data
- **Error Handling**: Graceful fallbacks for unsupported environments
- **Performance Optimized**: Efficient API calls and data processing

## Web IDL

```idl
dictionary TopicAnalysisResult {
  sequence<DOMString> topics;
  double confidence;
  sequence<DOMString> keywords;
};

dictionary WordGenerationResult {
  sequence<DOMString> contextWords;
  DOMString explanation;
};

enum SupportedTopic {
  "pokemon",
  "technology", 
  "medicine",
  "sports",
  "entertainment",
  "science",
  "business",
  "fiction",
  "acronym",
  "general"
};

[Exposed=(Window,Worker), SecureContext]
interface WordGenerator {
  static Promise<TopicAnalysisResult> analyzeTopic(DOMString text);
  static Promise<WordGenerationResult> generateWords(
    SupportedTopic topic,
    optional sequence<DOMString> keywords = []
  );
  static Promise<sequence<DOMString>> loadPokemonDatabase();
};
```

## Why This Matters

This API proves that AI can automatically understand and generate contextually appropriate vocabulary for any domain. This is the foundation for:

- **Intelligent Writing Tools**
- **Context-Aware Applications**
- **Domain-Specific AI Assistants**
- **Adaptive User Interfaces**

The same technology that generates Pokemon names can generate medical terms, programming APIs, or any specialized vocabulary - making AI truly adaptive to human expertise and interests.

## Browser Requirements

- Chrome Canary with experimental AI features enabled
- Enable: `chrome://flags/#optimization-guide-on-device-model`
