const input = document.querySelector("[contenteditable]");
const form = document.querySelector("form");
const legend = document.querySelector("span").firstChild;
const popover = document.querySelector("[popover]");
const button = popover.querySelector("button");

(async () => {
  console.log("[INIT] AI Proofreader (Prompt API) starting...");

  // Feature detection for LanguageModel API (Prompt API)
  const promptAPISupported = "LanguageModel" in self;
  console.log("[CHECK] LanguageModel API supported:", promptAPISupported);

  const errorHighlights = {
    spelling: null,
    punctuation: null,
    capitalization: null,
    preposition: null,
    "missing-words": null,
    grammar: null,
  };
  const errorTypes = Object.keys(errorHighlights);

  let corrections;
  let corrected;
  let currentCorrection;

  const wordBoundingRects = [];

  // Draw the legends.
  const preTrimStartLength = legend.textContent.length;
  const postTrimStartLength = legend.textContent.trimStart().length;
  let offset = preTrimStartLength - postTrimStartLength;
  legend.textContent
    .trimStart()
    .split(" ")
    .forEach((word, i) => {
      if (!errorTypes[i]) {
        return;
      }
      const range = new Range();
      range.setStart(legend, offset);
      offset += word.length;
      range.setEnd(legend, offset);
      const highlight = new self.Highlight(range);
      errorHighlights[errorTypes[i]] = highlight;
      CSS.highlights.set(errorTypes[i], highlight);
      offset += 1;
    });

  if ("highlightsFromPoint" in self.HighlightRegistry.prototype) {
    document.addEventListener("click", (event) => {
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      console.log(CSS.highlights.highlightsFromPoint(mouseX, mouseY));
    });
  }

  // JSON schema for proofreading output
  const proofreadingSchema = {
    type: "object",
    required: ["correctedInput", "corrections"],
    additionalProperties: false,
    properties: {
      correctedInput: {
        type: "string",
        description: "The corrected version of the input text",
      },
      corrections: {
        type: "array",
        description: "Array of corrections made to the text",
        items: {
          type: "object",
          required: ["originalText", "correctedText", "type", "explanation"],
          additionalProperties: false,
          properties: {
            originalText: {
              type: "string",
              description: "The original incorrect text that was found",
            },
            correctedText: {
              type: "string",
              description: "The corrected version of the text",
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
              description: "Type of correction",
            },
            explanation: {
              type: "string",
              description: "Explanation of why this correction was made",
            },
          },
        },
      },
    },
  };

  // Function to calculate start and end indices for corrections
  function calculateCorrectionIndices(originalText, aiCorrections) {
    const correctionsWithIndices = [];
    let searchStartIndex = 0;

    for (const correction of aiCorrections) {
      const {
        originalText: errorText,
        correctedText,
        type,
        explanation,
      } = correction;

      // Skip if original and corrected text are the same (no actual correction needed)
      if (errorText === correctedText) {
        console.log(
          `[SKIP] No change needed: "${errorText}" === "${correctedText}"`
        );
        continue;
      }

      // Find the position of the error text in the original text
      const startIndex = originalText.indexOf(errorText, searchStartIndex);

      if (startIndex !== -1) {
        const endIndex = startIndex + errorText.length;

        correctionsWithIndices.push({
          startIndex,
          endIndex,
          correction: correctedText,
          type,
          explanation,
          originalText: errorText,
        });

        // Update search start to avoid finding the same error again
        searchStartIndex = endIndex;

        console.log(
          `[INDEX] Found "${errorText}" at position ${startIndex}-${endIndex}`
        );
      } else {
        console.warn(
          `[WARNING] Could not find "${errorText}" in original text`
        );
      }
    }

    return correctionsWithIndices;
  }

  // Function to apply highlights to all corrections
  function applyHighlights(correctionsToHighlight, currentText) {
    console.log("[HIGHLIGHT] Applying highlights to corrections...");
    const textNode = input.firstChild;

    for (const correction of correctionsToHighlight) {
      const range = new Range();
      range.setStart(textNode, correction.startIndex);
      range.setEnd(textNode, correction.endIndex);
      errorHighlights[correction.type].add(range);
      console.log(
        `  [MARK] Highlighted ${correction.type}: ${currentText.slice(
          correction.startIndex,
          correction.endIndex
        )}`
      );
    }
    console.log("[SUCCESS] All highlights applied");
  }

  // Function to update correction indices after text changes
  function updateCorrectionIndices(oldCorrections, acceptedCorrection) {
    console.log("[REINDEX] Updating correction indices after text change...");

    // Calculate the change in text length
    const originalLength = acceptedCorrection.originalText.length;
    const correctedLength = acceptedCorrection.correction.length;
    const lengthDifference = correctedLength - originalLength;

    const updatedCorrections = [];

    for (const correction of oldCorrections) {
      // Skip the correction we just accepted
      if (correction === acceptedCorrection) {
        console.log(
          `  [SKIP] Removing accepted correction: ${correction.originalText}`
        );
        continue;
      }

      // For corrections after the accepted one, update their indices
      if (correction.startIndex > acceptedCorrection.endIndex) {
        const updatedCorrection = {
          ...correction,
          startIndex: correction.startIndex + lengthDifference,
          endIndex: correction.endIndex + lengthDifference,
        };
        updatedCorrections.push(updatedCorrection);
        console.log(
          `  [UPDATE] Shifted "${correction.originalText}" by ${lengthDifference} positions`
        );
      }
      // For corrections before the accepted one, keep the same indices
      else if (correction.endIndex <= acceptedCorrection.startIndex) {
        updatedCorrections.push(correction);
        console.log(
          `  [KEEP] No change needed for "${correction.originalText}"`
        );
      }
      // For overlapping corrections, remove them (they're probably invalid now)
      else {
        console.log(
          `  [REMOVE] Removing overlapping correction: "${correction.originalText}"`
        );
      }
    }

    return updatedCorrections;
  }

  let languageModelSession;
  if (!promptAPISupported) {
    console.warn("[ERROR] LanguageModel API not supported in this browser");
    document.querySelector(".error").hidden = false;
    // return;
  } else {
    try {
      console.log("[API] Checking LanguageModel availability...");
      // Check LanguageModel availability
      const availability = await LanguageModel.availability({
        expectedOutputs: [{ type: "text", languages: ["en"] }],
      });
      console.log("[STATUS] LanguageModel availability:", availability);

      if (availability === "unavailable") {
        console.error("[ERROR] LanguageModel is unavailable");
        document.querySelector(".error").hidden = false;
      } else {
        console.log(
          "[CREATE] Creating LanguageModel session for proofreading..."
        );
        // Create LanguageModel session for proofreading
        languageModelSession = await LanguageModel.create({
          expectedOutputs: [{ type: "text", languages: ["en"] }],
          expectedInputs: [{ type: "text", languages: ["en"] }],
          initialPrompts: [
            {
              role: "system",
              content: `You are a professional proofreader. Analyze the given text and provide corrections with detailed explanations.

For each correction, provide:
- originalText: The exact incorrect text you found
- correctedText: The corrected version of that text
- type: The category of error
- explanation: Why this correction was needed

Classification guidelines:
- "spelling": Misspelled words (e.g., "recieve" → "receive")
- "punctuation": Missing or incorrect punctuation (e.g., missing commas, periods)
- "capitalization": Incorrect capitalization - ALWAYS check for:
  * First word of sentences must start with A-Z (e.g., "the dog ran" → "The dog ran")
  * Proper nouns must start with A-Z (e.g., "london" → "London", "john" → "John")
  * The pronoun "i" must be uppercase (e.g., "i think" → "I think")
  * Names of places, people, companies, etc. (e.g., "apple company" → "Apple Company")
  * Days/months (e.g., "monday" → "Monday", "january" → "January")
- "preposition": Wrong prepositions (e.g., "different than" → "different from")
- "missing-words": Missing articles, words (e.g., "I going" → "I am going")
- "grammar": Subject-verb agreement, tense errors, etc.

Be precise with the originalText - it should match exactly what appears in the source text.

IMPORTANT: Pay special attention to capitalization errors! Scan every word carefully:
- Look for lowercase letters at the start of sentences (a-z should be A-Z)
- Check all proper nouns for correct capitalization
- Verify the pronoun "i" is always uppercase "I"
- Don't miss obvious capitalization mistakes!`,
            },
          ],
        });
        console.log("[SUCCESS] LanguageModel session created successfully");
      }
    } catch (error) {
      console.error("[ERROR] Error initializing LanguageModel:", error);
      document.querySelector(".error").hidden = false;
    }
  }

  form.querySelector("button").disabled = false;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("[PROOFREAD] Proofreading requested...");

    // Remove previous highlights, only keep the legend highlights.
    console.log("[CLEAR] Clearing previous highlights...");
    for (const errorType of errorTypes) {
      const firstRange = errorHighlights[errorType].values().next().value;
      errorHighlights[errorType].clear();
      errorHighlights[errorType].add(firstRange);
    }

    // If there's no usable text, exit.
    const text = input.textContent.trim();
    if (!text) {
      console.warn("[WARNING] No text to proofread");
      return;
    }

    console.log("[INPUT] Input text:", text);
    console.log("[INPUT] Input innerText:", input.innerText);

    if (promptAPISupported && languageModelSession) {
      try {
        console.log("[AI] Sending text to LanguageModel for proofreading...");
        // Use Prompt API for proofreading
        const result = await languageModelSession.prompt(
          `Please proofread the following text and provide corrections: "${input.innerText}"`,
          { responseConstraint: proofreadingSchema }
        );
        console.log("[RESPONSE] Raw AI response:", result);

        const proofreadResult = JSON.parse(result);
        console.log("[SUCCESS] Parsed proofreading result:", proofreadResult);

        corrected = proofreadResult.correctedInput;
        const aiCorrections = proofreadResult.corrections;

        console.log("[CORRECTED] Corrected text:", corrected);
        console.log("[AI] Found AI corrections:", aiCorrections.length);

        // Log what the AI provided
        aiCorrections.forEach((aiCorrection, index) => {
          console.log(
            `  AI ${index + 1}. ${aiCorrection.type}: "${
              aiCorrection.originalText
            }" → "${aiCorrection.correctedText}"`
          );
        });

        // Calculate indices for each correction by finding them in the original text
        corrections = calculateCorrectionIndices(text, aiCorrections);

        console.log(
          "[FOUND] Processed corrections with indices:",
          corrections.length
        );
        corrections.forEach((correction, index) => {
          console.log(
            `  ${index + 1}. ${correction.type}: "${
              correction.originalText
            }" → "${correction.correction}" (${correction.startIndex}-${
              correction.endIndex
            })`
          );
        });
      } catch (error) {
        console.error("[ERROR] Proofreading error:", error);
        // Fallback: no corrections
        corrected = input.innerText;
        corrections = [];
      }
    } else {
      // No API available - no corrections
      console.warn(
        "[WARNING] LanguageModel API not available for proofreading"
      );
      corrected = input.innerText;
      corrections = [];
    }

    // Highlight all corrections by type.
    applyHighlights(corrections, text);
    console.log(
      "[INFO] You can now click on highlighted text to see correction suggestions!"
    );
  });

  const showCorrectionsAtCaretPosition = () => {
    if (!corrections || !Array.isArray(corrections)) {
      return;
    }

    // Find the caret position index and coordinates to position the popup.
    let selection = window.getSelection();
    let range = selection.getRangeAt(0);
    let preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(input);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const caretPosition = preCaretRange.toString().length;
    console.log("[CARET] Caret position:", caretPosition);

    let rect = preCaretRange.getBoundingClientRect();
    let { left, width, top, height } = rect;
    left += width / 2;
    top += height;

    // Find corrections at caret.
    currentCorrection =
      corrections.find(
        (correction) =>
          correction.startIndex <= caretPosition &&
          caretPosition <= correction.endIndex
      ) || null;

    if (!currentCorrection) {
      console.log("[NONE] No correction found at caret position");
      popover.hidePopover();
      form
        .querySelectorAll("button")
        .forEach((button) => button.removeAttribute("tabindex"));
      return;
    }

    console.log("[FOUND] Found correction at caret:", currentCorrection);
    // Show the popup.
    const { type, correction, explanation } = currentCorrection;
    const heading = type[0].toUpperCase() + type.substring(1).replace(/-/, " ");
    popover.querySelector("h1").textContent = heading;
    const text = popover.querySelector("h1").firstChild;
    const highlightRange = new Range();
    highlightRange.setStart(text, 0);
    highlightRange.setEnd(text, heading.length);
    errorHighlights[type].add(highlightRange);
    popover.querySelector(".correction").textContent = correction;
    popover.querySelector(".explanation").textContent = explanation;
    popover.style.top = `${Math.round(top)}px`;
    popover.style.left = `${Math.round(left)}px`;
    form.querySelectorAll("button").forEach((button) => (button.tabIndex = -1));
    console.log(
      `[POPOVER] Showing popover for ${type}: "${correction}" - ${explanation}`
    );
    popover.showPopover();
  };

  // Make sure we can tab in an out of the popover and focus on the
  // accept correction button.
  popover.addEventListener("toggle", (e) => {
    if (e.oldState === "closed") {
      button.addEventListener("keydown", buttonBlur);
      return;
    }
    button.removeEventListener("keydown", buttonBlur);
  });

  const buttonBlur = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      input.focus();
    }
  };

  // Accept the correction.
  button.addEventListener("click", () => {
    if (!currentCorrection) {
      console.warn("[WARNING] No correction to accept");
      return;
    }
    const { startIndex, endIndex, correction, type } = currentCorrection;
    console.log(
      `[ACCEPT] Accepting ${type} correction: "${input.textContent.substring(
        startIndex,
        endIndex
      )}" → "${correction}"`
    );

    // Clear all existing highlights first
    for (const errorType of errorTypes) {
      const firstRange = errorHighlights[errorType].values().next().value;
      errorHighlights[errorType].clear();
      errorHighlights[errorType].add(firstRange); // Keep legend highlight
    }

    // Update the text content
    const originalText = input.textContent;
    input.textContent = `${input.textContent.substring(
      0,
      startIndex
    )}${correction}${input.textContent.substring(endIndex)}`;

    console.log("[UPDATE] Text updated:", input.textContent);

    // Update correction indices for remaining corrections
    corrections = updateCorrectionIndices(corrections, currentCorrection);

    // Re-apply highlights for remaining corrections
    if (corrections.length > 0) {
      applyHighlights(corrections, input.textContent);
      console.log(
        `[MAINTAIN] Re-applied highlights for ${corrections.length} remaining corrections`
      );
    } else {
      console.log("[COMPLETE] No more corrections to highlight");
    }

    popover.hidePopover();
    currentCorrection = null; // Clear the current correction
  });

  input.addEventListener("keyup", (e) => {
    // Ignore [Esc], as it dismisses the popup.
    if (e.key === "Escape") {
      console.log("[ESC] Escape key pressed - dismissing popup");
      return;
    }
    showCorrectionsAtCaretPosition();
  });

  input.addEventListener("pointerup", () => {
    console.log(
      "[CLICK] Pointer released - checking for corrections at position"
    );
    showCorrectionsAtCaretPosition();
  });

  console.log("[INIT] AI Proofreader initialized successfully!");
  console.log(
    "[USAGE] Usage: Type or paste text, click 'Proofread', then click on highlighted errors for suggestions!"
  );
})();
