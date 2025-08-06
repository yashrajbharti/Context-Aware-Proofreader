# Topics and Context Generate APIs

This specification defines the **core AI innovation** behind intelligent context-aware systems: automatic topic detection and domain-specific vocabulary generation using two complementary APIs.

## Overview

The **Topics API** and **Context Generate API** work together to provide fundamental AI capabilities for text analysis and vocabulary generation. This two-API system demonstrates how AI can:

1. **Analyze any text** and detect its topic/domain (Topics API)
2. **Generate relevant vocabulary** for that specific context (Context Generate API)
3. **Build specialized dictionaries** automatically for context-aware applications

## Core Innovation

The key insight is that AI can understand context and generate appropriate vocabulary for any domain:

- **Input**: "I love Pikachu and think Charizard is awesome in Pokemon battles."
- **Topics API**: Topic = "pokemon" (95% confidence)
- **Context Generate API**: All Pokemon names + Pokemon-related terms
- **Result**: 1000+ contextually relevant words

## How It Works

1. **Topics API**: AI analyzes input text using advanced language understanding
2. **Context Generate API**: AI generates domain-specific vocabulary using prompt engineering
3. **Special Handling**: Pokemon topic loads complete database (1025+ names)
4. **Smart Combination**: Merges AI-generated words with detected keywords

## API Features

### Topics API Features
- **Real-time Analysis**: Instant topic detection from text input
- **Confidence Scoring**: See how certain the AI is about detected topics
- **Keyword Extraction**: View the words that led to topic classification
- **Multi-topic Support**: Can detect multiple topics in complex text

### Context Generate API Features
- **Domain-Specific Generation**: Creates vocabulary lists tailored to detected topics
- **Pokemon Database Integration**: Loads comprehensive Pokemon data for Pokemon topics
- **Complete Vocabulary**: Generates all relevant words in organized display
- **Extensible Topics**: Easy to add new topic categories

### Shared Features
- **Console Logging**: Inspect AI-generated data for debugging
- **Error Handling**: Graceful fallbacks for unsupported environments
- **Performance Optimized**: Efficient API calls and data processing

## Supported Topics

- **Pokemon**: All 1025+ Pokemon names from comprehensive database
- **Technology**: APIs, frameworks, tools, companies (API, JSON, React, GitHub, etc.)
- **Medicine**: Medical terminology, drug names, procedures
- **Sports**: Teams, players, leagues, sporting terms
- **Entertainment**: Shows, characters, platforms, gaming
- **Science**: Scientific terms, elements, research vocabulary
- **Business**: Corporate terms, financial abbreviations
- **Fiction**: Character names, fantasy terms, book titles
- **Acronym**: Abbreviations, organizational terms

## Context-Aware Proofreading Demo

This advanced demo showcases how the APIs work together for **AI-powered context generation** that automatically detects topics and builds intelligent dictionaries for context-aware proofreading.

### Two-Step Process

#### Step 1: Generate AI Context Dictionary

1. Enter your text in the input field
2. Click **"Generate AI Context Dictionary"**
3. Topics API analyzes the text and detects the topic
4. Context Generate API automatically populates dictionary with relevant words
5. View detailed analysis in results area

#### Step 2: Proofread with Context

1. Click **"Proofread with Context"**
2. AI proofreads while respecting the generated dictionary
3. See corrections and preserved context words
4. Get detailed explanations for each change

### Example Workflow

**Input Text:** `"I love Pikachu and my frend thinks Charizard is cooler but there both awesome Pokemon."`

**AI Process:**

1. **Topics API**: "pokemon" (95% confidence)
2. **Context Generate API**: Loads 1025+ Pokemon names + keywords
3. **Dictionary Update**: Auto-populates with Pokemon vocabulary
4. **Smart Proofreading**:
   - Preserves: "Pikachu", "Charizard", "Pokemon"
   - Corrects: "frend" → "friend", "there" → "they're"

## Applications

This core technology enables:

- **Smart Spell Checkers**: Never flag legitimate domain terms
- **Context-Aware Autocomplete**: Suggest relevant vocabulary
- **Dynamic Dictionaries**: Auto-build for any specialty field
- **Content Analysis Tools**: Understand document contexts
- **Writing Assistants**: Domain-intelligent suggestions
- **Intelligent Writing Tools**
- **Context-Aware Applications**
- **Domain-Specific AI Assistants**
- **Adaptive User Interfaces**

## Benefits

- **Zero Manual Setup**: No need to manually build dictionaries
- **Context Intelligence**: Understands domain-specific vocabulary
- **Comprehensive Coverage**: Pokemon demo includes ALL Pokemon names
- **Extensible**: Easy to add new topic categories
- **Preserves Intent**: Never flags words you actually meant to use
- **Automatic Dictionary Population**: Auto-fills based on detected context
- **Real-time Updates**: Updates based on text analysis

## Technical Implementation

- **Topics API**: Custom Prompt API with JSON schema constraints
- **Pokemon Database**: Complete JSON file with all Pokemon names and IDs
- **Context Generate API**: Intelligent word generation based on detected topics
- **Auto-Population**: Seamless dictionary updates with existing word preservation
- **Pure Prompt API**: Both APIs use Chrome's built-in Language Model
- **JSON Schema Constraints**: Structured AI responses from both APIs
- **Error Handling**: Graceful fallbacks and clear error messages

## Web IDL

```idl
dictionary TopicsResult {
  sequence<DOMString> topics;
  double confidence;
  sequence<DOMString> keywords;
};

dictionary ContextGenerateResult {
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

dictionary ProofreadResult {
  DOMString correctedInput;
  sequence<ProofreadCorrection> corrections;
  sequence<DOMString> dictionaryWordsFound;
};

dictionary ProofreadCorrection {
  unsigned long long startIndex;
  unsigned long long endIndex;
  DOMString correction;
  CorrectionType type;
  DOMString explanation;
};

enum CorrectionType {
  "spelling",
  "punctuation",
  "capitalization",
  "preposition",
  "missing-words",
  "grammar"
};

[Exposed=(Window,Worker), SecureContext]
interface TopicsAPI {
  static Promise<TopicsResult> analyze(DOMString text);
};

[Exposed=(Window,Worker), SecureContext]
interface ContextGenerateAPI {
  static Promise<ContextGenerateResult> generate(
    sequence<DOMString> topics,
    optional sequence<DOMString> keywords = []
  );
  static Promise<sequence<DOMString>> loadPokemonDatabase();
};

[Exposed=(Window,Worker), SecureContext]
interface ContextProofreader {
  static Promise<ProofreadResult> proofreadWithContext(
    DOMString text,
    sequence<DOMString> contextWords
  );
};
```

## Why This Matters

These APIs prove that AI can automatically understand and generate contextually appropriate vocabulary for any domain. This is the foundation for intelligent, adaptive AI systems.

The same technology that detects Pokemon topics and generates Pokemon names can analyze any domain and generate medical terms, programming APIs, or any specialized vocabulary - making AI truly adaptive to human expertise and interests.

This represents the future of AI-assisted writing tools - context-aware, intelligent, and effortlessly adaptive to any domain.

## Browser Requirements

- Chrome Canary with experimental AI features enabled
- Enable: `chrome://flags/#optimization-guide-on-device-model`
- Stable internet connection for model downloads

This specification represents the cutting edge of AI-powered text analysis and context generation, providing the foundation for the next generation of intelligent writing and proofreading tools.