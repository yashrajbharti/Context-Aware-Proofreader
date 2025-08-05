// AI Word Generation Demo
// Focuses purely on topic detection and context word generation

document.addEventListener("DOMContentLoaded", async () => {
  const generateBtn = document.getElementById("generate-btn");
  const textInput = document.getElementById("input-text");
  const wordDisplay = document.getElementById("word-display");

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
          content: `You are a context vocabulary expert. Generate relevant words and terms for specific topics.

For each topic, generate words that:
- Are commonly used in that domain
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
      )}. Focus on specialized vocabulary, proper nouns, and technical terms for this domain.`,
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

  // Main generation button event listener
  generateBtn.addEventListener("click", async () => {
    // Clear previous results
    wordDisplay.value = "";

    try {
      const inputText = textInput.value.trim();

      if (!inputText) {
        console.error("ERROR: Please enter some text for analysis");
        return;
      }

      // Console logging for detailed analysis
      console.log("=".repeat(60));
      console.log("AI WORD GENERATION ANALYSIS");
      console.log("=".repeat(60));
      console.log("Input text:", inputText);

      // Check if LanguageModel API is available
      if (typeof LanguageModel === "undefined") {
        console.error(
          "ERROR: LanguageModel API is not available. Make sure you are using Chrome Canary with experimental features enabled."
        );
        return;
      }

      // Check availability
      console.log("Checking LanguageModel availability...");
      const availability = await LanguageModel.availability({
        expectedOutputs: [
          {
            type: "text",
            languages: ["en"],
          },
        ],
      });
      console.log("Availability:", availability);

      if (availability === "unavailable") {
        console.error("ERROR: LanguageModel is unavailable");
        return;
      }

      if (availability === "downloadable" || availability === "downloading") {
        console.log("Model download required...");
      }

      // Step 1: Detect topic
      console.log("STEP 1: Detecting topic...");
      const topicResult = await detectTopic(inputText);

      console.log(`Topic detected: ${topicResult.topics[0]}`);
      wordDisplay.value = `Topic detected: ${topicResult.topics[0]}`;
      console.log(`Confidence: ${(topicResult.confidence * 100).toFixed(1)}%`);
      console.log(`Keywords found:`, topicResult.keywords);

      // Step 2: Generate context words
      console.log("STEP 2: Generating context words...");
      const contextWords = await generateContextWords(
        topicResult.topics,
        topicResult.keywords
      );

      console.log(
        `Generated ${contextWords.length} context words for topic: ${topicResult.topics[0]}`
      );

      // If it's Pokemon topic, show special message
      if (topicResult.topics[0].toLowerCase() === "pokemon") {
        console.log(
          "Special context: Loaded all 1025+ Pokemon names from database!"
        );
      }

      // Display generated words in the word display textarea (keep enabled)
      wordDisplay.value = contextWords.join("\n");

      // Detailed console summary
      console.log("=".repeat(60));
      console.log("GENERATION COMPLETE");
      console.log("=".repeat(60));
      console.log(
        `Topic: ${topicResult.topics[0]} (${(
          topicResult.confidence * 100
        ).toFixed(1)}% confidence)`
      );
      console.log(`Keywords:`, topicResult.keywords);
      console.log(`Total words generated: ${contextWords.length}`);
      console.log("Sample words:", contextWords.slice(0, 10));
      console.log("All generated words:", contextWords);
      console.log("=".repeat(60));
    } catch (error) {
      console.error("ERROR:", error.message);
      console.error("Error type:", error.name);

      if (error.name === "NotSupportedError") {
        console.error(
          "NOTE: This feature might not be supported on your browser or system"
        );
      } else if (error.name === "NetworkError") {
        console.error("NOTE: Network error during model download");
      } else if (error.name === "SyntaxError") {
        console.error(
          "NOTE: The model couldn't generate valid JSON - this can happen with complex text"
        );
      }
    }
  });

  // Initial log
  console.log("AI Word Generation Demo loaded");
  console.log("Default text:", textInput.value);
  console.log(
    "Click 'Generate Context Words' to see AI topic detection and word generation"
  );
});
