$(document).ready(function () {
    console.log("GYM: membership.js loaded successfully.");

    // Check if user is already registered on load
    const membershipStorageKey = 'uuFakeGymMembership';
    checkExistingMember();

    const basePrices = {
        "Core": 22,
        "Plus": 28,
        "Ultimate": 36
    };

    const tierExtras = {
        Plus: [
            "Group classes included",
            "Sauna access"
        ],
        Ultimate: [
            "Bring a guest 4x/month",
            "Priority class booking",
            "Exclusive Ultimate member classes"
        ]
    };

    let currentTotal = 0;
    let isRecurring = false;
    let promoDiscount = 0;

    // Recalculate price whenever tier or duration changes
    $('input[name="tier"], input[name="duration"]').on('change', function () {
        calculatePrice();
    });

    function calculatePrice() {
        const tier = $('input[name="tier"]:checked').val();
        const duration = $('input[name="duration"]:checked').val();

        console.log("Calculating -> Tier:", tier, "| Duration:", duration);

        // If either is missing, default to £0.00
        if (!tier || !duration) {
            $('#totalDue').text('£0.00');
            $('#recurringText').text('');
            return;
        }

        let basePrice = basePrices[tier];
        isRecurring = false;
        let calcPrice = 0;

        switch (duration) {
            case "1_day":
                calcPrice = Math.round(basePrice * 0.4);
                break;
            case "3_days":
                calcPrice = Math.round(basePrice * 0.6);
                break;
            case "7_days":
                calcPrice = Math.round(basePrice * 0.8);
                break;
            case "monthly":
                calcPrice = basePrice;
                isRecurring = true;
                break;
            case "6_months":
                calcPrice = basePrice * 0.90; // 10% off
                isRecurring = true;
                break;
            case "12_months":
                calcPrice = basePrice * 0.80; // 20% off
                isRecurring = true;
                break;
            default:
                calcPrice = basePrice;
        }

        // Apply Promo Code Discount if applied
        if (promoDiscount > 0) {
            calcPrice = calcPrice - (calcPrice * promoDiscount);
        }

        currentTotal = calcPrice;

        // Update the UI
        $('#totalDue').text(`£${currentTotal.toFixed(2)}`);
        $('#recurringText').text(isRecurring ? "/ month" : " (One-off pass)");
        updateCheckoutDetails();
    }

    function updateCheckoutDetails() {
        const tier = $('input[name="tier"]:checked').val() || 'Not selected';
        const durationLabel = $('input[name="duration"]:checked').next('span').clone().children().remove().end().text().trim() || 'Not selected';
        const promoText = promoDiscount > 0 ? `${Math.round(promoDiscount * 100)}% applied` : 'None';

        $('#summaryTier').text(tier);
        $('#summaryDuration').text(durationLabel);
        $('#summaryPromo').text(promoText);

        const durationValue = $('input[name="duration"]:checked').val();
        const perks = getPerksForSelection(tier, durationValue);

        const perksHtml = perks.map(function (perk) {
            return "<li>" + perk + "</li>";
        }).join("");

        $("#summaryPerks").html(perksHtml);

        const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        $('#summaryStart').text(today);
    }

    function getPerksForSelection(tier, duration) {
        const isShortTermPass = ["1_day", "3_days", "7_days"].includes(duration);
        const isFixedTermMembership = ["6_months", "12_months"].includes(duration);

        let flexibilityPerk = "";
        if (duration === "monthly") {
            flexibilityPerk = "Cancel anytime (monthly)";
        } else if (isShortTermPass) {
            flexibilityPerk = "No contract - pass expires automatically";
        } else if (isFixedTermMembership) {
            flexibilityPerk = "Fixed-term commitment for lower monthly price";
        }

        const corePerks = [
            "24/7 gym access",
            flexibilityPerk,
            "Instant digital pass after signup"
        ].filter(Boolean); // Remove any empty strings

        if (tier === "Plus") {
            return corePerks.concat(tierExtras.Plus);
        }

        if (tier === "Ultimate") {
            return corePerks.concat(tierExtras.Plus, tierExtras.Ultimate);
        }

        // Core (or fallback)
        return corePerks;
    }

    // Calculate Expiry Date based on duration
    function calculateExpiryDate(startDate, durationVal) {
        let expiry = new Date(startDate);

        switch (durationVal) {
            case "1_day":
                expiry.setDate(expiry.getDate() + 1);
                break;
            case "3_days":
                expiry.setDate(expiry.getDate() + 3);
                break;
            case "7_days":
                expiry.setDate(expiry.getDate() + 7);
                break;
            case "monthly":
                expiry.setMonth(expiry.getMonth() + 1);
                break;
            case "6_months":
                expiry.setMonth(expiry.getMonth() + 6);
                break;
            case "12_months":
                expiry.setFullYear(expiry.getFullYear() + 1);
                break;
            default:
                expiry.setMonth(expiry.getMonth() + 1);
        }
        return expiry.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    // Promo Code Apply
    $('#applyPromoBtn').on('click', function () {
        const code = $('#promoCode').val().trim().toUpperCase();
        if (code === "LAUNCH10") {
            promoDiscount = 0.10;
            $('#promoMessage')
                .text("10% Discount Applied!")
                .removeClass('promo-fail')
                .addClass('promo-success');
            calculatePrice();
        } else if (code !== "") {
            promoDiscount = 0;
            $('#promoMessage')
                .text("Invalid Code")
                .removeClass('promo-success')
                .addClass('promo-fail');
            calculatePrice();
        }
    });

    // Form Validation & Submission
    $('#gym-signup-form').on('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        $('.field-error').text(''); // Clear previous error messages
        let isValid = true;

        const tier = $('input[name="tier"]:checked').val();
        const durationVal = $('input[name="duration"]:checked').val();

        // Extract clean text for duration label
        let durationText = $('input[name="duration"]:checked').next('span').clone().children().remove().end().text().trim(); // Get the text of the label without child elements
        if (!durationText) {
            durationText = $('input[name="duration"]:checked').parent().text().trim(); // Fallback to parent label text if next span is empty
        }

        const name = $('#fullName').val().trim();
        const email = $('#email').val().trim();

        if (!tier) {
            $('#tierError').text("Please select a membership tier.").slideDown();
            isValid = false;
        }

        if (!durationVal) {
            $('#durationError').text("Please select a duration plan.").slideDown();
            isValid = false;
        }

        if (name.length < 2) {
            $('#nameError').text("Please enter your full name.").slideDown();
            isValid = false;
        }

        if (!validateEmail(email)) {
            $('#emailError').text("Please enter a valid email address.").slideDown();
            isValid = false;
        }

        if (isValid) {
            const finalPrice = `£${currentTotal.toFixed(2)} ${isRecurring ? '/ mo' : ''}`;

            // Generate Member ID and Dates
            const memberId = 'GYM-' + Math.floor(100000 + Math.random() * 900000);
            const today = new Date();
            const startDateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            const expiryDateStr = calculateExpiryDate(today, durationVal);

            // Generate clean QR code URL
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(memberId)}`;

            const gymMember = {
                memberId: memberId,
                memberName: name,
                memberTier: tier,
                memberDuration: durationText,
                price: finalPrice,
                startDate: startDateStr,
                expiryDate: expiryDateStr,
                qrCodeUrl: qrUrl
            };

            localStorage.setItem(membershipStorageKey, JSON.stringify(gymMember));

            $('#gym-signup-form').slideUp(400, function () {
                renderDashboard(gymMember);
            });
        }
    });

    // Handle Membership Cancellation
    $('#cancelMembershipBtn').on('click', function () {
        if (confirm("Are you sure you want to cancel your membership?")) {
            localStorage.removeItem(membershipStorageKey);

            $('#member-dashboard').slideUp(400, function () {
                $('#gym-signup-form').trigger("reset").slideDown(400);
                setTimeout(calculatePrice, 50);
                $('#promoMessage').text('').removeClass('promo-success promo-fail');
                promoDiscount = 0;
            });
        }
    });

    function checkExistingMember() {
        const savedData = localStorage.getItem(membershipStorageKey);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            $('#gym-signup-form').hide();
            renderDashboard(parsedData);
        }
    }

    function renderDashboard(data) {
        $('#dash-name').text(data.memberName || 'Not found');
        $('#dash-id').text(data.memberId || 'Not found');
        $('#dash-tier').text(data.memberTier || 'Not found');
        $('#dash-duration').text(data.memberDuration || 'Not found');
        $('#dash-price').text(data.price || 'Not found');
        $('#dash-start').text(data.startDate || 'Today');
        $('#dash-expiry').text(data.expiryDate || 'N/A');

        // Update QR code image source
        if (data.memberId) {
            const qrSrc = data.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.memberId)}`;
            $('#dash-qr').attr('src', qrSrc);
        }

        $('#member-dashboard').fadeIn(600);
    }

    // Initial trigger on load to calculate pre-selected Plus / 12 Months
    calculatePrice();
});