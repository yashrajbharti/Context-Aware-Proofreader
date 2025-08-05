// Context-Aware Prompt API Proofreader Demo
// Uses user-defined dictionary to customize proofreading

document.addEventListener("DOMContentLoaded", async () => {
  const proofreadBtn = document.getElementById("context-proofread-btn");
  const generateContextBtn = document.getElementById("generate-context-btn");
  const textInput = document.getElementById("original-text");
  const dictionaryInput = document.getElementById("dictionary");
  const outputTextarea = document.getElementById("output");

  // Helper function to display results in textarea
  function displayResult(text) {
    outputTextarea.value = text;
  }

  // Helper function to append to textarea
  function appendResult(text) {
    outputTextarea.value += text + "\n";
  }

  // Parse dictionary words from textarea
  function parseDictionary(dictionaryText) {
    return dictionaryText
      .split("\n")
      .map((word) => word.trim())
      .filter((word) => word.length > 0);
  }

  // Load Pokemon data from JSON file
  async function loadPokemonData() {
    try {
      const response = await fetch("pokemon.json");
      const pokemonData = await response.json();
      return Object.keys(pokemonData).map(
        (name) =>
          // Capitalize first letter and handle special cases
          name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ")
      );
    } catch (error) {
      console.error("Failed to load Pokemon data:", error);
      return [];
    }
  }

  // Detect topic from text using AI
  async function detectTopic(text) {
    const topicSchema = {
      type: "object",
      required: ["topics", "confidence", "keywords"],
      additionalProperties: false,
      properties: {
        topics: {
          type: "array",
          description:
            "Array of detected topics (currently single topic, future: multiple)",
          items: {
            type: "string",
          },
          minItems: 1,
          maxItems: 1,
        },
        confidence: {
          type: "number",
          minimum: 0,
          maximum: 1,
          description: "Confidence level of topic detection (0-1)",
        },
        keywords: {
          type: "array",
          description: "Key words that indicate this topic",
          items: {
            type: "string",
          },
        },
      },
    };

    const session = await LanguageModel.create({
      expectedOutputs: [
        {
          type: "text",
          languages: ["en"],
        },
      ],
      expectedInputs: [{ type: "text", languages: ["en"] }],
      initialPrompts: [
        {
          role: "system",
          content: `You are a topic detection expert. Analyze the given text and determine the main topic or subject matter.

Supported topics you can detect:
- pokemon (Pokemon characters, games, franchise, creatures)
- technology (computers, programming, software, APIs, frameworks, tools)
- medicine (medical terms, diseases, treatments, anatomy, pharmaceuticals)
- sports (games, teams, athletics, leagues, competitions)
- entertainment (movies, TV shows, music, gaming, streaming)
- science (research, experiments, discoveries, physics, chemistry, biology)
- business (companies, finance, economics, corporate terms, markets)
- fiction (fantasy, sci-fi, literature, fictional characters, books, novels)
- acronym (text heavy with abbreviations, technical acronyms, organizations)
- general (if no specific topic is clearly dominant)

Return a JSON object with:
- topics: array with single detected topic (lowercase) - future: may support multiple
- confidence: how confident you are (0.0 to 1.0)
- keywords: words that led to this classification

Example:
{
  "topics": ["pokemon"],
  "confidence": 0.95,
  "keywords": ["Pikachu", "Charizard", "Pokemon"]
}`,
        },
      ],
    });

    const result = await session.prompt(
      `Analyze this text and detect its main topic: "${text}"`,
      { responseConstraint: topicSchema }
    );

    session.destroy();
    return JSON.parse(result);
  }

  // Generate context words based on topic using AI
  async function generateContextWords(topics, keywords = []) {
    const topic = topics[0]; // Use first topic (currently single topic)

    let contextWords = [];

    // Special case: Pokemon - load from JSON database
    if (topic.toLowerCase() === "pokemon") {
      const pokemonNames = await loadPokemonData();
      contextWords = contextWords.concat(pokemonNames);
    }

    // Use AI to generate context words for all topics
    const contextSchema = {
      type: "object",
      required: ["contextWords", "explanation"],
      additionalProperties: false,
      properties: {
        contextWords: {
          type: "array",
          description: "Array of relevant words/terms for the detected topic",
          items: {
            type: "string",
          },
          minItems: 10,
          maxItems: 50,
        },
        explanation: {
          type: "string",
          description:
            "Brief explanation of why these words are relevant to the topic",
        },
      },
    };

    const session = await LanguageModel.create({
      expectedOutputs: [
        {
          type: "text",
          languages: ["en"],
        },
      ],
      expectedInputs: [{ type: "text", languages: ["en"] }],
      initialPrompts: [
        {
          role: "system",
          content: `You are a context vocabulary expert. Generate relevant words and terms for specific topics that should be preserved during proofreading.

For each topic, generate words that:
- Are commonly used in that domain
- Might be flagged as errors by standard spellcheckers
- Include proper nouns, technical terms, brand names, specialized vocabulary
- Include common abbreviations and acronyms
- Are words that someone writing about this topic would legitimately use

Topic-specific guidelines:
- technology: APIs, frameworks, programming languages, tools, companies, file extensions
- medicine: medical terms, drug names, anatomy, diseases, procedures, medical abbreviations
- sports: team names, player names, leagues, sporting terms, venues
- entertainment: show/movie titles, character names, platforms, gaming terms
- science: scientific terms, element names, units, research terminology
- business: corporate terms, financial abbreviations, company types, market terms
- fiction: character names, place names, fantasy/sci-fi terms, book/series titles
- acronym: common abbreviations, organizational acronyms, technical abbreviations
- general: common proper nouns and specialized terms

Return words that would legitimately appear in text about this topic.`,
        },
      ],
    });

    const result = await session.prompt(
      `Generate relevant context words for the topic "${topic}". Include these detected keywords: ${keywords.join(
        ", "
      )}. Focus on words that might be incorrectly flagged as spelling errors but are legitimate terms in this domain.`,
      { responseConstraint: contextSchema }
    );

    session.destroy();
    const aiResult = JSON.parse(result);

    // Console log the AI-generated words
    console.log("AI-generated context words:", aiResult.contextWords);
    console.log("AI explanation:", aiResult.explanation);

    // Combine AI-generated words with detected keywords
    contextWords = contextWords.concat(aiResult.contextWords);
    contextWords = contextWords.concat(keywords);

    // Remove duplicates and return
    return [...new Set(contextWords)];
  }

  // Define the JSON schema for structured proofreading output
  const proofreadingSchema = {
    type: "object",
    required: ["correctedInput", "corrections", "dictionaryWordsFound"],
    additionalProperties: false,
    properties: {
      correctedInput: {
        type: "string",
        description: "The fully corrected version of the input text",
      },
      corrections: {
        type: "array",
        description:
          "Array of individual corrections made (excluding dictionary words)",
        items: {
          type: "object",
          required: [
            "startIndex",
            "endIndex",
            "correction",
            "type",
            "explanation",
          ],
          additionalProperties: false,
          properties: {
            startIndex: {
              type: "number",
              description:
                "Starting character index of the error in original text",
            },
            endIndex: {
              type: "number",
              description:
                "Ending character index of the error in original text",
            },
            correction: {
              type: "string",
              description: "The corrected text for this error",
            },
            type: {
              type: "string",
              enum: [
                "spelling",
                "punctuation",
                "capitalization",
                "preposition",
                "missing-words",
                "grammar",
              ],
              description: "Type of error found",
            },
            explanation: {
              type: "string",
              description:
                "Plain language explanation of why this correction was made",
            },
          },
        },
      },
      dictionaryWordsFound: {
        type: "array",
        description:
          "List of dictionary words that were found and left unchanged",
        items: {
          type: "string",
        },
      },
    },
  };

  // Generate AI Context Dictionary button event listener
  generateContextBtn.addEventListener("click", async () => {
    // Clear previous results
    outputTextarea.value = "";
    displayResult(
      "AI CONTEXT DICTIONARY GENERATION\n" + "=".repeat(50) + "\n\n"
    );

    try {
      appendResult("Starting AI context generation...");

      const originalText = textInput.value.trim();

      if (!originalText) {
        appendResult("ERROR: Please enter some text for topic analysis");
        return;
      }

      appendResult("Analyzing text: " + originalText);
      appendResult("");

      // Check if LanguageModel API is available
      if (typeof LanguageModel === "undefined") {
        appendResult(
          "ERROR: LanguageModel API is not available. Make sure you are using Chrome Canary with experimental features enabled."
        );
        return;
      }

      // Check availability
      appendResult("Checking LanguageModel availability...");
      const availability = await LanguageModel.availability({
        expectedOutputs: [
          {
            type: "text",
            languages: ["en"],
          },
        ],
      });
      appendResult("Availability: " + availability);

      if (availability === "unavailable") {
        appendResult("ERROR: LanguageModel is unavailable");
        return;
      }

      if (availability === "downloadable" || availability === "downloading") {
        appendResult("Model download required...");
      }

      // Step 1: Detect topic
      appendResult("STEP 1: Detecting topic...");
      const topicResult = await detectTopic(originalText);

      appendResult(`Topic detected: ${topicResult.topics[0]}`);
      appendResult(`Confidence: ${(topicResult.confidence * 100).toFixed(1)}%`);
      appendResult(`Keywords found: ${topicResult.keywords.join(", ")}`);
      appendResult("");

      // Step 2: Generate context words
      appendResult("STEP 2: Generating context words...");
      const contextWords = await generateContextWords(
        topicResult.topics,
        topicResult.keywords
      );

      appendResult(
        `Generated ${contextWords.length} context words for topic: ${topicResult.topics[0]}`
      );

      // If it's Pokemon topic, show special message
      if (topicResult.topics[0].toLowerCase() === "pokemon") {
        appendResult(
          "Special context: Loaded all 1025+ Pokemon names from database!"
        );
      }

      appendResult("");

      // Step 3: Auto-populate dictionary
      appendResult("STEP 3: Auto-populating dictionary...");

      // Get existing dictionary words to avoid overwriting
      const existingWords = parseDictionary(dictionaryInput.value);

      // Combine existing and new words, remove duplicates
      const allWords = [...new Set([...existingWords, ...contextWords])];

      // Update dictionary textarea (temporarily enable to set content)
      dictionaryInput.disabled = false;
      dictionaryInput.value = allWords.join("\n");
      dictionaryInput.disabled = true;

      appendResult(`Dictionary updated with ${allWords.length} total words`);
      appendResult(`Added ${contextWords.length} new context words`);
      appendResult(`Preserved ${existingWords.length} existing words`);
      appendResult("");

      // Step 4: Show summary
      appendResult("CONTEXT GENERATION COMPLETE!");
      appendResult("=".repeat(60));
      appendResult(
        `Topic: ${topicResult.topics[0]} (${(
          topicResult.confidence * 100
        ).toFixed(1)}% confidence)`
      );
      appendResult(`Keywords: ${topicResult.keywords.join(", ")}`);
      appendResult(`Total dictionary words: ${allWords.length}`);
      appendResult(`New words added: ${contextWords.length}`);
      appendResult("");
      appendResult("✓ Dictionary has been automatically updated!");
      appendResult(
        "✓ You can now click 'Proofread with Context' to use the AI-generated dictionary"
      );
      appendResult("=".repeat(60));
    } catch (error) {
      appendResult("");
      appendResult("ERROR: " + error.message);
      appendResult("Error type: " + error.name);

      if (error.name === "NotSupportedError") {
        appendResult(
          "NOTE: This feature might not be supported on your browser or system"
        );
      } else if (error.name === "NetworkError") {
        appendResult("NOTE: Network error during model download");
      } else if (error.name === "SyntaxError") {
        appendResult(
          "NOTE: The model couldn't generate valid JSON - this can happen with complex text"
        );
      }
    }
  });

  proofreadBtn.addEventListener("click", async () => {
    // Clear previous results
    outputTextarea.value = "";
    displayResult("CONTEXT-AWARE PROOFREADER DEMO\n" + "=".repeat(50) + "\n\n");

    try {
      appendResult("Starting context-aware proofreading demo...");

      const originalText = textInput.value.trim();
      const dictionaryWords = parseDictionary(dictionaryInput.value);

      if (!originalText) {
        appendResult("ERROR: Please enter some text to proofread");
        return;
      }

      appendResult("Original text: " + originalText);
      console.log("Dictionary words count: " + dictionaryWords.length);
      appendResult("");

      // Check if LanguageModel API is available
      if (typeof LanguageModel === "undefined") {
        appendResult(
          "ERROR: LanguageModel API is not available. Make sure you are using Chrome Canary with experimental features enabled."
        );
        return;
      }

      // Check availability
      appendResult("Checking LanguageModel availability...");
      const availability = await LanguageModel.availability({
        expectedOutputs: [
          {
            type: "text",
            languages: ["en"],
          },
        ],
      });
      appendResult("Availability: " + availability);

      if (availability === "unavailable") {
        appendResult("ERROR: LanguageModel is unavailable");
        return;
      }

      if (availability === "downloadable" || availability === "downloading") {
        appendResult("Model download required...");
      }

      // Create session with context-aware proofreading system prompt
      appendResult("Creating LanguageModel session...");

      const dictionaryPrompt =
        dictionaryWords.length > 0
          ? `\n\nIMPORTANT: The user has provided a custom dictionary of acceptable words. These words should NOT be flagged as errors:\n${dictionaryWords
              .map((word) => `- ${word}`)
              .join(
                "\n"
              )}\n\nIf any of these dictionary words appear in the text, leave them unchanged and include them in the dictionaryWordsFound array.`
          : "\n\nNo custom dictionary provided.";

      const session = await LanguageModel.create({
        expectedOutputs: [
          {
            type: "text",
            languages: ["en"],
          },
        ],
        expectedInputs: [{ type: "text", languages: ["en"] }],
        initialPrompts: [
          {
            role: "system",
            content: `You are an expert proofreader with context awareness. Your task is to:

1. Carefully examine the input text for errors (spelling, grammar, punctuation, capitalization, prepositions, missing words)
2. Return a JSON object with the corrected text and detailed information about each correction
3. RESPECT the user's custom dictionary - do not flag dictionary words as errors
4. For each error found, provide the exact character positions in the ORIGINAL text, the correction, error type, and explanation
5. Error types must be one of: "spelling", "punctuation", "capitalization", "preposition", "missing-words", "grammar"
6. Be precise with startIndex and endIndex - they should point to the exact error location in the original text
7. Include any dictionary words found in the dictionaryWordsFound array
8. If no errors are found, return an empty corrections array

${dictionaryPrompt}

Example for "I seen him" with dictionary ["Pokemon"]:
{
  "correctedInput": "I saw him",
  "corrections": [
    {
      "startIndex": 2,
      "endIndex": 6,
      "correction": "saw",
      "type": "grammar",
      "explanation": "Past tense of 'see' should be 'saw', not 'seen'"
    }
  ],
  "dictionaryWordsFound": []
}

Example for "I love Pikachu" with dictionary ["Pikachu"]:
{
  "correctedInput": "I love Pikachu",
  "corrections": [],
  "dictionaryWordsFound": ["Pikachu"]
}`,
          },
        ],
      });

      // Prompt for proofreading with structured output
      appendResult("Proofreading text with context awareness...");
      const result = await session.prompt(
        `Please proofread this text and return the structured JSON response: "${originalText}"`,
        { responseConstraint: proofreadingSchema }
      );

      // Parse and display results
      appendResult("");
      appendResult("CONTEXT-AWARE PROOFREADING RESULTS:");
      appendResult("=".repeat(60));

      const proofreadResult = JSON.parse(result);
      appendResult("Raw JSON Response:");
      appendResult(result);
      appendResult("");

      appendResult("CORRECTED TEXT:");
      appendResult(proofreadResult.correctedInput);
      appendResult("");

      appendResult("DICTIONARY WORDS FOUND:");
      if (
        proofreadResult.dictionaryWordsFound &&
        proofreadResult.dictionaryWordsFound.length > 0
      ) {
        appendResult(
          `Found ${proofreadResult.dictionaryWordsFound.length} dictionary words that were preserved:`
        );
        proofreadResult.dictionaryWordsFound.forEach((word) => {
          appendResult(`- ${word} (preserved from dictionary)`);
        });
      } else {
        appendResult("No dictionary words found in the text");
      }
      appendResult("");

      appendResult("CORRECTIONS MADE:");
      if (
        proofreadResult.corrections &&
        proofreadResult.corrections.length > 0
      ) {
        appendResult(
          `Found ${proofreadResult.corrections.length} corrections:`
        );

        proofreadResult.corrections.forEach((correction, index) => {
          appendResult(`\n--- Correction ${index + 1} ---`);
          appendResult(
            "Original text: " +
              originalText.substring(correction.startIndex, correction.endIndex)
          );
          appendResult("Correction: " + correction.correction);
          appendResult(
            "Position: " + correction.startIndex + "-" + correction.endIndex
          );
          appendResult("Error type: " + correction.type);
          appendResult("Explanation: " + correction.explanation);
        });
      } else {
        appendResult(
          "No corrections needed - text is perfect or only contains dictionary words!"
        );
      }

      // Summary
      appendResult("");
      appendResult("=".repeat(60));
      appendResult("CONTEXT SUMMARY:");
      appendResult(`Original text: "${originalText}"`);
      appendResult(`Corrected text: "${proofreadResult.correctedInput}"`);
      appendResult(`Dictionary words used: ${dictionaryWords.length}`);
      appendResult(
        `Dictionary words found: ${
          proofreadResult.dictionaryWordsFound
            ? proofreadResult.dictionaryWordsFound.length
            : 0
        }`
      );
      appendResult(
        `Corrections made: ${
          proofreadResult.corrections ? proofreadResult.corrections.length : 0
        }`
      );
      appendResult("=".repeat(60));

      // Clean up
      session.destroy();
      appendResult("Session destroyed");
    } catch (error) {
      appendResult("");
      appendResult("ERROR: " + error.message);
      appendResult("Error type: " + error.name);

      if (error.name === "NotSupportedError") {
        appendResult(
          "NOTE: This feature might not be supported on your browser or system"
        );
      } else if (error.name === "NetworkError") {
        appendResult("NOTE: Network error during model download");
      } else if (error.name === "SyntaxError") {
        appendResult(
          "NOTE: The model couldn't generate valid JSON - this can happen with complex text"
        );
      }
    }
  });

  // Initial log
  console.log("Context-Aware Proofreader Demo loaded");
  console.log("Default text:", textInput.value);
  console.log("Default dictionary:", parseDictionary(dictionaryInput.value));
  console.log(
    "Edit the text and dictionary, then click the button to see context-aware proofreading"
  );
});
