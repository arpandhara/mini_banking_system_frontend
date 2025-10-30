const tl = gsap.timeline();

tl.from(".left h1, .left p", {
    y: 100,
    opacity: 0,
    duration: 0.5,
    ease: "power2.out",
    stagger: 0.1,
});

tl.from(
    ".form_box p, .form_box .phoneNumberWrapper, .form_box .signUpSubmitBtn",
    {
        x: 100,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.05,
    },
    "-=0.5"
);

const phoneNumberInput = document.querySelector(".phoneNumber");
const submitButton = document.querySelector(".forgotPassSubmitBtn");
const phoneNumberError = document.querySelector(
    ".phoneNumberWrapper .error-message"
);

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

const validateForm = () => {
    const isPhoneNumberValid = validatePhoneNumber();

    if (isPhoneNumberValid) {
        submitButton.classList.remove('disabled');
        submitButton.style.backgroundColor = "#47b569ff";
    } else {
        submitButton.classList.add('disabled');
        submitButton.style.backgroundColor = "grey";
    }
}

submitButton.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (submitButton.classList.contains('disabled')) {
        console.log('Button is disabled, returning');
        return;
    }

    if (!validatePhoneNumber()) {
        return;
    }

    const userData = {
        phoneNumber: phoneNumberInput.value
    }

    try {
        const response = await fetch("http://127.0.0.1:5000/api/forgotPass", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        }); 

        const result = await response.json();

        if(result.isSMSSent == true){ // Changed from isWhatsapp
            alert(result.message);
        }else{
            alert(`Error : ${result.error || 'Could not send SMS.'}`); // Updated error message
        }

    } catch (error) {
        console.error("Submission failed:", error);
        alert("Could not connect to the server. Please try again later.");
    }
})

phoneNumberInput.addEventListener("input", validateForm);
