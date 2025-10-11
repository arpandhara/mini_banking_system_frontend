const tl = gsap.timeline();

tl.from(".left h1, .left p", {
  y: 100,
  opacity: 0,
  duration: 0.5,
  ease: "power2.out",
  stagger: 0.1,
});

tl.from(
  ".form_box p, .form_box .fullNameWrapper, .form_box .phoneNumberWrapper, .form_box .passwordWrapper, .form_box .genderWrapper, .form_box .ageWrapper, .form_box .signUpSubmitBtn",
  {
    x: 100,
    opacity: 0,
    duration: 0.5,
    ease: "power2.out",
    stagger: 0.05,
  },
  "-=0.5"
);

const form = document.querySelector(".form_box");
const fullNameInput = document.querySelector(".fullName");
const phoneNumberInput = document.querySelector(".phoneNumber");
const passwordInput = document.querySelector(".password");
const ageInput = document.querySelector(".age");
const genderInputs = document.querySelectorAll('input[name="gender"]');
const submitButton = document.querySelector(".signUpSubmitBtn");

const fullNameError = document.querySelector(".fullNameWrapper .error-message");
const phoneNumberError = document.querySelector(
  ".phoneNumberWrapper .error-message"
);
const passwordError = document.querySelector(".passwordWrapper .error-message");
const ageError = document.querySelector(".ageWrapper .error-message");
const genderError = document.querySelector(".genderWrapper .error-message");

const validateFullName = () => {
  if (fullNameInput.value.trim() === "") {
    fullNameError.textContent = "Full name is required";
    fullNameInput.classList.add("error");
    return false;
  } else {
    fullNameError.textContent = "";
    fullNameInput.classList.remove("error");
    return true;
  }
};

const validatePhoneNumber = () => {
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phoneNumberInput.value)) {
    phoneNumberError.textContent =
      "Phone number must be 10 digits and contain only numbers";
    phoneNumberInput.classList.add("error");
    return false;
  } else {
    phoneNumberError.textContent = "";
    phoneNumberInput.classList.remove("error");
    return true;
  }
};

const validatePassword = () => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(passwordInput.value)) {
    passwordError.textContent =
      "Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character";
    passwordInput.classList.add("error");
    return false;
  } else {
    passwordError.textContent =
      "Use 8 or more characters with a mix of letters, numbers & symbols";
    passwordInput.classList.remove("error");
    return true;
  }
};

const validateAge = () => {
  const ageValue = ageInput.value.trim();
  const ageRegex = /^[0-9]+$/;
  if (!ageRegex.test(ageValue)) {
    ageError.textContent = "Age must contain only numbers";
    ageInput.classList.add("error");
    return false;
  }
  const age = parseInt(ageValue);
  if (isNaN(age) || age < 18 || age > 150) {
    ageError.textContent = "Age must be a number between 18 and 150";
    ageInput.classList.add("error");
    return false;
  } else {
    ageError.textContent = "Must be between 18 to 150";
    ageInput.classList.remove("error");
    return true;
  }
};

const validateGender = () => {
  let isChecked = false;
  genderInputs.forEach((input) => {
    if (input.checked) {
      isChecked = true;
    }
  });

  if (!isChecked) {
    genderError.textContent = "Please select a gender";
    return false;
  } else {
    genderError.textContent = "";
    return true;
  }
};

const validateForm = () => {
  const isFullNameValid = validateFullName();
  const isPhoneNumberValid = validatePhoneNumber();
  const isPasswordValid = validatePassword();
  const isAgeValid = validateAge();
  const isGenderValid = validateGender();

  if (
    isFullNameValid &&
    isPhoneNumberValid &&
    isPasswordValid &&
    isAgeValid &&
    isGenderValid
  ) {
    submitButton.disabled = false;
    submitButton.style.backgroundColor = "#D355D3";
  } else {
    submitButton.disabled = true;
    submitButton.style.backgroundColor = "grey";
  }
};

// Listen for form submission
submitButton.addEventListener("click", async (e) => {
  e.preventDefault();
  if (
    !validateFullName() ||
    !validatePhoneNumber() ||
    !validatePassword() ||
    !validateAge() ||
    !validateGender()
  ) {
    return;
  }

  const selectedGender = document.querySelector(
    'input[name="gender"]:checked'
  ).value;

  const userData = {
    username: fullNameInput.value,
    password: passwordInput.value,
    age: ageInput.value,
    gender: selectedGender,
    phoneNumber: phoneNumberInput.value,
  };

  try {
    const response = await fetch("http://127.0.0.1:5000/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (result.signUp === true) {
      alert(result.message);
      window.location.href = "login.html";
    } else {
      alert(`Error: ${result.error || 'Sign up failed. Please try again.'}`);
    }
  } catch (error) {
    console.error("Submission failed:", error);
    alert("Could not connect to the server. Please try again later.");
  }
});

// Add event listeners for real-time validation
fullNameInput.addEventListener("input", validateForm);
phoneNumberInput.addEventListener("input", validateForm);
passwordInput.addEventListener("input", validateForm);
ageInput.addEventListener("input", validateForm);
genderInputs.forEach((input) => {
  input.addEventListener("change", validateForm);
});