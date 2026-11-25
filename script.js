// Character sets
const sets = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}?"
};

// Characters that are easy to mix up
const similarChars = "ilLoO01";

// Page elements
const passwordOutput = document.getElementById("password-output");
const copyBtn = document.getElementById("copy-btn");
const copyMessage = document.getElementById("copy-message");
const strengthFill = document.getElementById("strength-fill");
const strengthLabel = document.getElementById("strength-label");
const lengthSlider = document.getElementById("length-slider");
const lengthValue = document.getElementById("length-value");
const upperCheck = document.getElementById("upper-check");
const lowerCheck = document.getElementById("lower-check");
const numbersCheck = document.getElementById("numbers-check");
const symbolsCheck = document.getElementById("symbols-check");
const similarCheck = document.getElementById("similar-check");
const generateBtn = document.getElementById("generate-btn");
const errorMessage = document.getElementById("error-message");

let copyTimer = null;

// A secure random whole number from 0 up to (but not including) max
function randomInt(max) {
  const limit = Math.floor(4294967296 / max) * max;
  const buffer = new Uint32Array(1);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return buffer[0] % max;
}

// Mix up the order of a list
function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    const temp = list[i];
    list[i] = list[j];
    list[j] = temp;
  }
}

// Work out which character sets are switched on
function getSelectedSets() {
  const chosen = [];
  if (upperCheck.checked) chosen.push(sets.upper);
  if (lowerCheck.checked) chosen.push(sets.lower);
  if (numbersCheck.checked) chosen.push(sets.numbers);
  if (symbolsCheck.checked) chosen.push(sets.symbols);

  if (similarCheck.checked) {
    return chosen.map(function (set) {
      return set.split("").filter(function (character) {
        return similarChars.indexOf(character) === -1;
      }).join("");
    });
  }
  return chosen;
}

function resetStrength() {
  strengthFill.style.width = "0";
  strengthLabel.textContent = "-";
}

function updateStrength(length, poolSize) {
  // Rough strength estimate in bits
  const bits = length * Math.log2(poolSize);

  let label;
  let colour;
  if (bits < 40) {
    label = "Weak";
    colour = "#ef4444";
  } else if (bits < 60) {
    label = "Fair";
    colour = "#f59e0b";
  } else if (bits < 80) {
    label = "Strong";
    colour = "#84cc16";
  } else {
    label = "Very strong";
    colour = "#22c55e";
  }

  strengthFill.style.width = Math.min(100, Math.round(bits)) + "%";
  strengthFill.style.background = colour;
  strengthLabel.textContent = label;
}

function generatePassword() {
  errorMessage.textContent = "";
  copyMessage.textContent = "";

  const chosen = getSelectedSets();
  if (chosen.length === 0) {
    errorMessage.textContent = "Please select at least one character type.";
    passwordOutput.value = "";
    resetStrength();
    return;
  }

  const length = parseInt(lengthSlider.value, 10);
  const allCharacters = chosen.join("");
  const characters = [];

  // Make sure there is at least one character from every chosen type
  chosen.forEach(function (set) {
    characters.push(set.charAt(randomInt(set.length)));
  });

  // Fill the rest from all chosen characters
  while (characters.length < length) {
    characters.push(allCharacters.charAt(randomInt(allCharacters.length)));
  }

  shuffle(characters);
  passwordOutput.value = characters.join("");
  updateStrength(length, allCharacters.length);
}

function showCopied() {
  copyMessage.textContent = "Copied to clipboard!";
  clearTimeout(copyTimer);
  copyTimer = setTimeout(function () {
    copyMessage.textContent = "";
  }, 2000);
}

// Older browsers may not allow the modern copy method
function fallbackCopy() {
  passwordOutput.select();
  passwordOutput.setSelectionRange(0, passwordOutput.value.length);
  try {
    if (document.execCommand("copy")) {
      showCopied();
    } else {
      copyMessage.textContent = "Press Ctrl+C to copy the selected password.";
    }
  } catch (error) {
    copyMessage.textContent = "Press Ctrl+C to copy the selected password.";
  }
}

copyBtn.addEventListener("click", function () {
  const password = passwordOutput.value;
  if (password === "") {
    copyMessage.textContent = "Generate a password first.";
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(password).then(showCopied).catch(fallbackCopy);
  } else {
    fallbackCopy();
  }
});

// Update the length number and make a new password as the slider moves
lengthSlider.addEventListener("input", function () {
  lengthValue.textContent = lengthSlider.value;
  generatePassword();
});

// Make a new password whenever an option changes
[upperCheck, lowerCheck, numbersCheck, symbolsCheck, similarCheck].forEach(function (box) {
  box.addEventListener("change", generatePassword);
});

generateBtn.addEventListener("click", generatePassword);

// Make a first password when the page opens
generatePassword();