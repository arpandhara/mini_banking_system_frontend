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


const validateForm = () => {
    const isFullNameValid = validateFullName();
    const isAccountNumberValid = validateAccountNumber();
    const isPassordValid = validatePassword();

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
    e.preventDefault();
    e.stopPropagation();

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
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (result.loggedIn == true) {
            window.location.href = "dashboard.html";
        } else {
            console.log('LogIn failed:', result.error);
            alert(`Error: ${result.error || 'Log In failed. Please try again.'}`);
        }
    } catch (error) {
        console.error("Submission failed:", error);
        alert("Could not connect to the server. Please try again later.");
    }
})

fullNameInput.addEventListener("input", validateForm);
passwordInput.addEventListener("input", validateForm);
backAccountNumber.addEventListener("input", validateForm)