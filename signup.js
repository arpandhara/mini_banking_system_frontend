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

const fullNameInput = document.querySelector(".fullName");
const phoneNumberInput = document.querySelector(".phoneNumber");
const passwordInput = document.querySelector(".password");
const ageInput = document.querySelector(".age");
const genderInputs = document.querySelectorAll('input[name="gender"]');
// The submitButton is now our <a> tag
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
    // Enable the link by removing the 'disabled' class
    submitButton.classList.remove('disabled');
    submitButton.style.backgroundColor = "#D355D3";
  } else {
    // Disable the link by adding the 'disabled' class
    submitButton.classList.add('disabled');
    submitButton.style.backgroundColor = "grey";
  }
};

// Listen for a "click" on the <a> tag
submitButton.addEventListener("click", async (e) => {
  console.log('Submit button clicked!');
  
  // Prevent the default link behavior (navigating to #)
  e.preventDefault();
  e.stopPropagation();
  console.log('Default prevented');

  // If the button is disabled, do nothing
  if(submitButton.classList.contains('disabled')) {
      console.log('Button is disabled, returning');
      return;
  }
  
  console.log('Button is enabled, proceeding...');

  // We still run a final validation check in case
  console.log('Running final validation...');
  if (
    !validateFullName() ||
    !validatePhoneNumber() ||
    !validatePassword() ||
    !validateAge() ||
    !validateGender()
  ) {
    console.log('Validation failed, returning');
    return;
  }
  
  console.log('Validation passed!');

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

  console.log('Sending data to server:', userData);
  
  try {
    const response = await fetch("http://127.0.0.1:5000/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(userData),
    });

    console.log('Response received:', response);
    const result = await response.json();
    console.log('Server response:', result);

    if (result.signUp === true) {
      console.log('Signup successful!');
      // alert(result.message);
      console.log('About to navigate to login.html');
      window.location.href = "dashboard.html";  
      
      // Try immediate navigation first
    } else {
      console.log('Signup failed:', result.error);
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