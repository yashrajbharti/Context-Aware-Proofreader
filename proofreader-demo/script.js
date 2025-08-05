// Prompt API Proofreader Demo
// Using the general Prompt API to create structured proofreading functionality

document.addEventListener("DOMContentLoaded", async () => {
  const promptBtn = document.getElementById("prompt-btn");
  const originalSentenceInput = document.getElementById("original-sentence");
  const outputTextarea = document.getElementById("output");

  // Helper function to display results in textarea
  function displayResult(text) {
    outputTextarea.value = text;
  }

  // Helper function to append to textarea
  function appendResult(text) {
    outputTextarea.value += text + "\n";
  }

  // Define the JSON schema for structured proofreading output
  const proofreadingSchema = {
    type: "object",
    required: ["correctedInput", "corrections"],
    additionalProperties: false,
    properties: {
      correctedInput: {
        type: "string",
        description: "The fully corrected version of the input text",
      },
      corrections: {
        type: "array",
        description: "Array of individual corrections made",
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
    },
  };

  promptBtn.addEventListener("click", async () => {
    // Clear previous results
    outputTextarea.value = "";
    displayResult("PROMPT API PROOFREADER DEMO\n" + "=".repeat(50) + "\n\n");

    try {
      appendResult("Starting Prompt API proofreading demo...");
      const originalSentence = originalSentenceInput.value.trim();

      if (!originalSentence) {
        appendResult("ERROR: Please enter some text to proofread");
        return;
      }

      appendResult("Original text: " + originalSentence);
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

      // Create session with proofreading system prompt
      appendResult("Creating LanguageModel session...");
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
            content: `You are an expert proofreader. Your task is to:
1. Carefully examine the input text for errors (spelling, grammar, punctuation, capitalization, prepositions, missing words)
2. Return a JSON object with the corrected text and detailed information about each correction
3. For each error found, provide the exact character positions in the ORIGINAL text, the correction, error type, and explanation
4. Error types must be one of: "spelling", "punctuation", "capitalization", "preposition", "missing-words", "grammar"
5. Be precise with startIndex and endIndex - they should point to the exact error location in the original text
6. If no errors are found, return an empty corrections array

Example for "I seen him":
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
  ]
}`,
          },
        ],
      });

      // Prompt for proofreading with structured output
      appendResult("Proofreading text with structured output...");
      const result = await session.prompt(
        `Please proofread this text and return the structured JSON response: "${originalSentence}"`,
        { responseConstraint: proofreadingSchema }
      );

      // Parse and display results
      appendResult("");
      appendResult("PROMPT API PROOFREADING RESULTS:");
      appendResult("=".repeat(60));

      const proofreadResult = JSON.parse(result);
      appendResult("Raw JSON Response:");
      appendResult(result);
      appendResult("");

      appendResult("CORRECTED TEXT:");
      appendResult(proofreadResult.correctedInput);
      appendResult("");

      appendResult("CORRECTIONS FOUND:");
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
              originalSentence.substring(
                correction.startIndex,
                correction.endIndex
              )
          );
          appendResult("Correction: " + correction.correction);
          appendResult(
            "Position: " + correction.startIndex + "-" + correction.endIndex
          );
          appendResult("Error type: " + correction.type);
          appendResult("Explanation: " + correction.explanation);
        });
      } else {
        appendResult("No corrections found - text is already perfect!");
      }

      // Compare with incomplete Proofreader API
      appendResult("");
      appendResult("=".repeat(60));
      appendResult("COMPARISON WITH PROOFREADER API:");
      appendResult("Prompt API: Full structured output with corrections array");
      appendResult(
        "WARNING: Proofreader API: Currently only returns correctedInput"
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
  console.log("Prompt API Proofreader Demo loaded");
  console.log("Default sentence:", originalSentenceInput.value);
  console.log(
    "Click 'Proofread with Prompt API' to see structured proofreading results"
  );
  console.log(
    "This uses the Prompt API with JSON schema to get the full correction details that the Proofreader API should provide"
  );
});
