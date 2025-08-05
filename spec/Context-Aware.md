# Context-Aware Proofreader Demo

This advanced demo showcases **AI-powered context generation** that automatically detects topics and builds intelligent dictionaries for context-aware proofreading.

## AI-Powered Features

### 1. **Topic Detection API**

- Analyzes your text using AI to detect the main topic
- Returns confidence levels and key indicators
- Supports: Pokemon, Technology, Sports, Entertainment, Science, Business, and General topics

### 2. **Smart Context Generation**

- **Pokemon Topic**: Loads all 1025+ Pokemon names from database (pokemon.json)
- **Other Topics**: Generates relevant vocabulary (APIs, brands, technical terms, etc.)
- **Preserves Existing**: Merges with any manually added dictionary words

### 3. **Automatic Dictionary Population**

- Auto-fills the dictionary based on detected context
- Eliminates manual word entry for known domains
- Updates in real-time based on text analysis

## Two-Step Process

### Step 1: Generate AI Context Dictionary

1. Enter your text in the input field
2. Click **"Generate AI Context Dictionary"**
3. AI analyzes the text and detects the topic
4. System automatically populates dictionary with relevant words
5. View detailed analysis in results area

### Step 2: Proofread with Context

1. Click **"Proofread with Context"**
2. AI proofreads while respecting the generated dictionary
3. See corrections and preserved context words
4. Get detailed explanations for each change

## Example Workflow

**Input Text:** `"I love Pikachu and my frend thinks Charizard is cooler but there both awesome Pokemon."`

**AI Process:**

1. **Topic Detection**: "pokemon" (95% confidence)
2. **Context Generation**: Loads 1025+ Pokemon names + keywords
3. **Dictionary Update**: Auto-populates with Pokemon vocabulary
4. **Smart Proofreading**:
   - Preserves: "Pikachu", "Charizard", "Pokemon"
   - Corrects: "frend" → "friend", "there" → "they're"

## Supported Topics

- **Pokemon**: All 1025+ Pokemon names from comprehensive database
- **Technology**: APIs, frameworks, tools, companies (API, JSON, React, GitHub, etc.)
- **Sports**: Teams, leagues, events (NBA, FIFA, Olympics, Lakers, etc.)
- **Entertainment**: Platforms, brands, franchises (Netflix, Marvel, PlayStation, etc.)
- **Science**: Terms, organizations, concepts (DNA, NASA, quantum, etc.)
- **Business**: Corporate terms, markets, roles (CEO, NYSE, startup, etc.)

## Benefits

- **Zero Manual Setup**: No need to manually build dictionaries
- **Context Intelligence**: Understands domain-specific vocabulary
- **Comprehensive Coverage**: Pokemon demo includes ALL Pokemon names
- **Extensible**: Easy to add new topic categories
- **Preserves Intent**: Never flags words you actually meant to use

## Technical Implementation

- **Topic Detection**: Custom Prompt API with JSON schema constraints
- **Pokemon Database**: Complete JSON file with all Pokemon names and IDs
- **Context Engine**: Intelligent word generation based on detected topics
- **Auto-Population**: Seamless dictionary updates with existing word preservation
- **Error Handling**: Graceful fallbacks and clear error messages

## Web IDL

```idl
dictionary TopicDetectionResult {
  sequence<DOMString> topics;
  double confidence;
  sequence<DOMString> keywords;
};

dictionary ContextGenerationResult {
  sequence<DOMString> contextWords;
  DOMString explanation;
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
interface ContextProofreader {
  static Promise<TopicDetectionResult> detectTopic(DOMString text);
  static Promise<ContextGenerationResult> generateContextWords(
    sequence<DOMString> topics,
    optional sequence<DOMString> keywords = []
  );
  static Promise<ProofreadResult> proofreadWithContext(
    DOMString text,
    sequence<DOMString> contextWords
  );
};
```

## Browser Requirements

- Chrome Canary with experimental AI features enabled
- Enable: `chrome://flags/#optimization-guide-on-device-model`
- Stable internet connection for model downloads

This specification represents the future of AI-assisted writing tools - context-aware, intelligent, and effortlessly adaptive to any domain.
