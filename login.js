const tl = gsap.timeline();

tl.from(".left h1, .left p", {
    y: 100,
    opacity: 0,
    duration: 0.5,
    ease: "power2.out",
    stagger: 0.1,
});

tl.from(
    ".form_box p, .form_box .fullNameWrapper, .form_box .passwordWrapper, .form_box .userIdWrapper, .form_box .logInSubmitBtn",
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
const backAccountNumber = document.querySelector(".userId");
const passwordInput = document.querySelector(".password");
const fullNameError = document.querySelector(".fullNameWrapper .error-message");
const passwordError = document.querySelector(".passwordWrapper .error-message");
const userIdWrapperError = document.querySelector(".userIdWrapper .error-message");
const submitButton = document.querySelector(".logInSubmitBtn")

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

const validateAccountNumber = () => {
    const accountRegex = /^[0-9]{4}$/;
    if (!accountRegex.test(backAccountNumber.value)) {
        // FIX: Updated error message to be accurate
        userIdWrapperError.textContent = "Account Number must be 4 digits long.";
        backAccountNumber.classList.add("error");
        return false;
    } else {
        // FIX: Correctly cleared the error message element's text
        userIdWrapperError.textContent = "";
        backAccountNumber.classList.remove("error");
        return true;
    }
}

// --- FIX 1: Simplified password validation for login ---
// We only need to check if the field is empty, not if it's a complex new password.
const validatePassword = () => {
    if (passwordInput.value.trim() === "") {
        passwordError.textContent = "Password is required";
        passwordInput.classList.add("error");
        return false;
    } else {
        passwordError.textContent = "Enter your preset password"; // Reset to default message
        passwordInput.classList.remove("error");
        return true;
    }
};


const validateForm = () => {
    const isFullNameValid = validateFullName();
    const isAccountNumberValid = validateAccountNumber();
    const isPassordValid = validatePassword(); // This will now work correctly

    if (
        isFullNameValid &&
        isAccountNumberValid &&
        isPassordValid
    ) {
        submitButton.classList.remove('disabled');
        submitButton.style.backgroundColor = "#5590D3";
    } else {
        // Disable the link by adding the 'disabled' class
        submitButton.classList.add('disabled');
        submitButton.style.backgroundColor = "grey";
    }
}

submitButton.addEventListener("click", async (e) => {
    e.preventDefault(); // This stops the <a> tag from "refreshing" the page

    if (submitButton.classList.contains('disabled')) {
        return;
    }

    if (
        !validateAccountNumber() ||
        !validateFullName() ||
        !validatePassword()
    ) {
        return;
    }

    const userData = {
        username: fullNameInput.value,
        password: passwordInput.value,
        user_id: backAccountNumber.value
    }

    try {
        const response = await fetch("http://127.0.0.1:5000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (result.loggedIn == true) {
            // Success! Redirect to the dashboard.
            window.location.href = "dashboard.html";
        } else {
            // --- FIX 2: Removed alert() ---
            // Show the error message in the password field's error label
            console.log('LogIn failed:', result.error);
            passwordError.textContent = result.error || 'Log In failed. Please try again.';
            passwordInput.classList.add('error');
        }
    } catch (error) {
        console.error("Submission failed:", error);
        // Show a generic error in the UI
        passwordError.textContent = "Could not connect to server. Please try again.";
    }
})

fullNameInput.addEventListener("input", validateForm);
passwordInput.addEventListener("input", validateForm);
backAccountNumber.addEventListener("input", validateForm)
