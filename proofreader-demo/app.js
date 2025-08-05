// Proofreader API Demo

/*
If the model is not downloaded, the code below will download it.

await LanguageModel.create({
    monitor(m) {
      m.addEventListener('download progress', (e) => {
        console.log(`Downloaded ${e.loaded * 100}%`);
      });
    },
  });
*/

document.addEventListener("DOMContentLoaded", async () => {
  const proofreadBtn = document.getElementById("proofread-btn");
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

  proofreadBtn.addEventListener("click", async () => {
    // Clear previous results
    outputTextarea.value = "";
    displayResult("PROOFREADER API DEMO\n" + "=".repeat(50) + "\n\n");
    try {
      const originalSentence = originalSentenceInput.value.trim();

      if (!originalSentence) {
        appendResult("ERROR: Please enter some text to proofread");
        return;
      }

      appendResult("Original text: " + originalSentence);
      appendResult("");

      const options = {
        includeCorrectionTypes: true,
        includeCorrectionExplanations: true,
        expectedInputLanguages: ["en"],
      };

      appendResult("Checking Proofreader API availability...");
      const availability = await Proofreader.availability(options);
      appendResult("Availability: " + availability);

      if (availability === "unavailable") {
        appendResult("ERROR: Proofreader API is unavailable");
        return;
      }

      if (availability === "downloadable" || availability === "downloading") {
        appendResult("Model download required, this may take a while...");
      }

      appendResult("Creating proofreader instance...");
      const proofreader = await Proofreader.create(options);

      appendResult("Proofreading text...");
      const result = await proofreader.proofread(originalSentence);

      appendResult("");
      appendResult("RESULTS:");
      appendResult("Raw result object: " + JSON.stringify(result, null, 2));
      appendResult("");

      if (result.correctedInput || result.corrected) {
        appendResult("CORRECTED TEXT:");
        appendResult(result.correctedInput || result.corrected);
        appendResult("");
      }

      appendResult("CORRECTIONS ANALYSIS:");
      if (result.corrections && result.corrections.length > 0) {
        appendResult(`Found ${result.corrections.length} corrections:`);
        result.corrections.forEach((correction, index) => {
          appendResult(`\n--- Correction ${index + 1} ---`);
          appendResult(
            "Original: " +
              originalSentence.substring(
                correction.startIndex,
                correction.endIndex
              )
          );
          appendResult("Correction: " + correction.correction);
          appendResult(
            "Position: " + correction.startIndex + "-" + correction.endIndex
          );
          if (correction.type) {
            appendResult("Error type: " + correction.type);
          }
          if (correction.explanation) {
            appendResult("Explanation: " + correction.explanation);
          }
        });
      } else {
        appendResult("WARNING: No corrections array found or it's empty");
        appendResult(
          "This is the current limitation of the Proofreader API in Chrome Canary"
        );
      }

      appendResult("");
      appendResult("Proofreader instance destroyed");
      proofreader.destroy();
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
      }
    }
  });
});
